// Birthday notes wall — a tiny Vercel serverless function.
// GET  /api/messages            → latest notes (newest first)
// POST /api/messages {name,text} → adds a note
// DELETE /api/messages?id=…     → removes one note (needs header x-admin-key = ADMIN_KEY)
// Storage: Upstash Redis, connected in Vercel → Storage. No npm packages needed.
// ADMIN_KEY: a password you set in Vercel → Settings → Environment Variables.

const crypto = require("crypto");

const LIST = "bday:notes";
const MAX_KEEP = 300;       // notes kept
const MAX_SHOW = 300;       // notes returned (all of them)
const LIMIT = 12;           // notes per internet address (friends on the same Wi-Fi share one)…
const WINDOW = 600;         // …per 10 minutes

function redisEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function pipeline(env, commands) {
  const r = await fetch(env.url + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.token, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error("storage " + r.status);
  const out = await r.json();
  return out.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}

// only real strings; cut length FIRST so huge inputs can't slow the regexes down
const clean = (v, max) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "")
  .slice(0, max * 2)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")          // control characters
  .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")          // invisible / direction-flipping characters
  .replace(/[ \t\r]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
  .trim().slice(0, max);
// a counter whose window starts at the first hit and is NOT extended by later hits
const countHit = (env, key, seconds) => pipeline(env, [["SET", key, "0", "EX", String(seconds), "NX"], ["INCR", key]]).then(r => r[1]);

function sameSecret(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
const clientIp = req => String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "x").split(",")[0].trim();

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const env = redisEnv();
  if (!env) return res.status(503).json({ error: "not_configured" });

  try {
    if (req.method === "GET") {
      const wantCount = (req.query && req.query.count) || new URL(req.url || "/", "http://x").searchParams.get("count");
      if (wantCount) { const [count] = await pipeline(env, [["LLEN", LIST]]); return res.status(200).json({ count }); }
      const [items] = await pipeline(env, [["LRANGE", LIST, "0", String(MAX_SHOW - 1)]]);
      const notes = (items || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
      return res.status(200).json({ notes });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
      body = body || {};
      if (body.website) return res.status(200).json({ ok: true });            // bot trap field
      const name = clean(body.name, 40) || "someone who loves you";
      const text = clean(body.text, 2000);
      if (text.length < 2) return res.status(400).json({ error: "empty" });

      const ip = clientIp(req);
      const rlKey = "bday:rl:" + ip;
      const count = await countHit(env, rlKey, WINDOW);
      if (count > LIMIT) return res.status(429).json({ error: "slow_down" });

      const note = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name, text, at: Date.now() };
      await pipeline(env, [["LPUSH", LIST, JSON.stringify(note)], ["LTRIM", LIST, "0", String(MAX_KEEP - 1)]]);
      return res.status(201).json({ note });
    }

    if (req.method === "DELETE") {
      const admin = process.env.ADMIN_KEY || "";
      if (admin.length < 6) return res.status(403).json({ error: "admin_key_not_set" });
      const failKey = "bday:af:" + clientIp(req);
      const [prior] = await pipeline(env, [["GET", failKey]]);
      if (Number(prior) >= 10) return res.status(429).json({ error: "too_many_tries" });   // locked out: don't even check
      const given = String(req.headers["x-admin-key"] || "");
      if (!sameSecret(given, admin)) {
        const fails = await countHit(env, failKey, 900);
        return res.status(fails >= 10 ? 429 : 401).json({ error: fails >= 10 ? "too_many_tries" : "wrong_key" });
      }
      await pipeline(env, [["DEL", failKey]]);
      const id = String((req.query && req.query.id) || new URL(req.url, "http://x").searchParams.get("id") || "");
      if (!id) return res.status(200).json({ ok: true });                     // password check only
      const [items] = await pipeline(env, [["LRANGE", LIST, "0", "-1"]]);
      const raw = (items || []).find(s => { try { return JSON.parse(s).id === id; } catch { return false; } });
      if (!raw) return res.status(404).json({ error: "not_found" });
      await pipeline(env, [["LREM", LIST, "1", raw]]);
      return res.status(200).json({ ok: true, deleted: id });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "storage_error" });
  }
};
