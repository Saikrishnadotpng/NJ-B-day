/* ═══════════════════════════════════════════════
   EDIT THESE — everything personal lives here
   ═══════════════════════════════════════════════ */
const CONFIG = {
  name: "Birthday Girl",      // her name, as you'd write it on a card
  from: "Sai",                // your sign-off
  day: "19",                  // number on the wax seals
  date: "19 · November · 2026",
  letter: [
    "Happy birthday. I wanted to give you something a little different from a text, so I made you this.",
    "I hope today is soft and loud in all the right places — good food, good people, and at least one moment where you stop and think, \"this is nice.\"",
    "Thank you for being the kind of person who makes ordinary days feel lighter. Whatever this year brings, I hope it's as kind to you as you are to everyone around you.",
    "Have the best one."
  ],
  // the dark opening lines, one at a time ({name} becomes her name)
  intro: ["Hey, {name}.", "I know it looks like just a link.", "It isn't.", "Ready?"],
  // hidden under the gold scratch card
  // hidden under the gold scratch card — written like a page from a novel
  secretChapter: "Chapter Nineteen",
  secret: "He had been standing at the edge of too many questions for too long, waiting for one of them to answer back. Then she walked in — laughing at something he couldn't hear — and for the first time in months, the noise in his head went quiet.",
  secretSource: "— from a story I'm still writing",
  // record a voice message, save it as assets/voice-note.mp3 — the button appears automatically
  voiceNote: "assets/voice-note.mp3",
  voiceLabel: "read it to me",   // use "hear it from me" only if it's your real voice
  // second each part starts in the audio: Dear…, paragraph 1–4, signature
  voiceCues: [0, 1.35, 7.4, 17.48, 27.38, 28.9],
  birthday: { year: 2026, month: 11, day: 19 }
};

/* ───────── always start at the top (browsers otherwise restore the old scroll spot) ───────── */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.scrollTo(0, 0);
addEventListener("pageshow", e => { if (e.persisted) location.reload(); });   // coming back via the Back button → fresh start

/* ───────── apply config ───────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
$$("[data-name]").forEach(el => (el.textContent = CONFIG.name));
$$("[data-from]").forEach(el => (el.textContent = CONFIG.from));
$$("[data-day]").forEach(el => (el.textContent = CONFIG.day));
$$("[data-date]").forEach(el => (el.textContent = CONFIG.date));
document.title = `Happy Birthday, ${CONFIG.name} ✦`;
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
$("#letterBody").innerHTML = CONFIG.letter.map(p => `<p>${esc(p)}</p>`).join("");

const isTouch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = innerWidth < 700;
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
const buzz = pattern => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (e) {} };

/* ───────── text splitting ───────── */
$$(".split-chars").forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w =>
    `<span style="display:inline-block;white-space:nowrap">${[...w].map(c => `<span class="char-mask"><span class="char">${esc(c)}</span></span>`).join("")}</span>`
  ).join(" ");
});
$$(".split-words").forEach(el => {
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
});

/* ───────── fallback if libraries failed ───────── */
if (!window.gsap || !window.ScrollTrigger) {
  $("#loader").remove();
  $("#seal").onclick = () => { $("#gate").remove(); document.body.classList.remove("is-loading", "is-locked"); };
  $$(".w").forEach(w => (w.style.opacity = 1));
  throw new Error("GSAP not loaded — running static fallback");
}

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/* ───────── smooth scroll ───────── */
let lenis = null;
if (window.Lenis && !reduced) {
  lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: .95, touchMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollToY = (y, d = 2.6) => lenis ? lenis.scrollTo(y, { duration: d }) : scrollTo({ top: y, behavior: "smooth" });

/* ═══════════════ AUDIO (Web Audio music box, no files) ═══════════════ */
let actx = null, master = null, muted = false;
function initAudio() {
  try {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = 1;
      // gentle reverb-ish echo
      const delay = actx.createDelay(); delay.delayTime.value = .23;
      const fb = actx.createGain(); fb.gain.value = .28;
      const wet = actx.createGain(); wet.gain.value = .35;
      master.connect(actx.destination);
      master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(actx.destination);
    }
    actx.resume();
    if (navigator.audioSession) { try { navigator.audioSession.type = "playback"; } catch (e) {} }
  } catch (e) {}
}
function bell(freq, t, dur = 1.4, vol = .15) {
  if (!actx || muted) return;
  const o = actx.createOscillator(), o2 = actx.createOscillator(), g = actx.createGain(), g2 = actx.createGain();
  o.type = "sine"; o2.type = "triangle"; o.frequency.value = freq; o2.frequency.value = freq * 2.01; g2.gain.value = .16;
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
}
function chime() { if (!actx) return; const t = actx.currentTime + .05; [784, 988, 1175, 1568, 1976].forEach((f, i) => bell(f, t + i * .085, 2, .09)); }
function pop() { if (!actx) return; bell(1400 + Math.random() * 900, actx.currentTime, .5, .035); }
// "Happy Birthday to You" (1893 melody, public domain)
const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const SONG = [
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3]
];
let songUntil = 0;
function playSong() {
  initAudio(); if (!actx || muted || actx.currentTime < songUntil) return;
  const beat = .42; let t = actx.currentTime + .15;
  SONG.forEach(([n, d]) => { bell(N[n], t, Math.max(1.2, d * beat * 2.3)); bell(N[n] / 2, t, Math.max(1, d * beat * 2), .05); t += d * beat; });
  songUntil = t;
  duckAmbient(.18); clearTimeout(playSong.t); playSong.t = setTimeout(() => duckAmbient((typeof vAudio !== "undefined" && !vAudio.paused) || (typeof reading !== "undefined" && reading) ? .2 : 1), (t - actx.currentTime) * 1000);
}
/* ───────── soothing ambient bed: warm pad + soft chimes + distant waves ───────── */
let amb = null, ambTimer = null, ambChord = 0;
const CHORDS = [ // Cmaj9 → Am9 → Fmaj9 → G6/9 (gentle, unresolved, loops forever)
  [130.81, 196.00, 246.94, 329.63, 293.66], [110.00, 164.81, 196.00, 261.63, 246.94],
  [87.31, 130.81, 164.81, 220.00, 196.00], [98.00, 146.83, 196.00, 246.94, 220.00]
];
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 1174.66];
function startAmbient() {
  if (!actx || amb) return;
  amb = actx.createGain(); amb.gain.value = 0;
  const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = .4;
  amb.connect(lp); lp.connect(master);
  amb.gain.linearRampToValueAtTime(1, actx.currentTime + 6);       // slow fade in
  // distant waves: filtered noise breathing in and out
  const len = actx.sampleRate * 4, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  let last = 0; for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
  const noise = actx.createBufferSource(); noise.buffer = buf; noise.loop = true;
  const nf = actx.createBiquadFilter(); nf.type = "lowpass"; nf.frequency.value = 520;
  const ng = actx.createGain(); ng.gain.value = .05;
  const lfo = actx.createOscillator(), lfoG = actx.createGain(); lfo.frequency.value = .085; lfoG.gain.value = .045;
  lfo.connect(lfoG); lfoG.connect(ng.gain);
  noise.connect(nf); nf.connect(ng); ng.connect(amb); noise.start(); lfo.start();
  const quiet = () => document.hidden || muted || actx.state !== "running";
  const playChord = () => {
    if (quiet()) return;
    const t = actx.currentTime + .05, dur = 9;
    CHORDS[ambChord++ % CHORDS.length].forEach((f, i) => {
      [0, 1].forEach(k => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = k ? "triangle" : "sine"; o.frequency.value = f; o.detune.value = k ? 6 : -4;
        const v = (k ? .010 : .022) * (i === 0 ? 1.2 : 1);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 3.2);
        g.gain.setValueAtTime(v, t + dur - 2); g.gain.linearRampToValueAtTime(0, t + dur + 2.5);
        o.connect(g); g.connect(amb); o.start(t); o.stop(t + dur + 3);
      });
    });
  };
  const sprinkle = () => {
    if (!amb) return;
    if (quiet()) { ambTimer = setTimeout(sprinkle, 2000); return; }
    const f = PENTA[(Math.random() * PENTA.length) | 0], t = actx.currentTime + .05;
    const o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 3.5);
    o.connect(g); g.connect(amb); o.start(t); o.stop(t + 3.6);
    ambTimer = setTimeout(sprinkle, 1400 + Math.random() * 2600);
  };
  playChord(); setInterval(playChord, 8000);
  setTimeout(sprinkle, 2500);
}
// pause all sound while the tab is in the background, resume when she comes back
document.addEventListener("visibilitychange", () => {
  if (!actx || !opened) return;
  if (document.hidden) actx.suspend().catch(() => {}); else actx.resume().catch(() => {});
});
function duckAmbient(level) { if (amb && actx) amb.gain.setTargetAtTime(level, actx.currentTime, .6); }

const soundBtn = $("#soundBtn");
soundBtn.addEventListener("click", () => {
  muted = !muted; soundBtn.classList.toggle("muted", muted);
  if (master) master.gain.setTargetAtTime(muted ? 0 : 1, actx.currentTime, .05);
  if (muted) { if (typeof stopReading === "function" && reading) stopReading(); if (!vAudio.paused) vAudio.pause(); }
});

/* ═══════════════ CANVAS: gold dust (ambient) ═══════════════ */
const dust = $("#dust"), dctx = dust.getContext("2d");
const fx = $("#fx"), fctx = fx.getContext("2d");
let W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 2);
const FX_DPR = Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75), DUST_DPR = small ? 1 : Math.min(devicePixelRatio || 1, 1.5);
function sizeCanvases() {
  W = innerWidth; H = innerHeight;
  dust.width = W * DUST_DPR; dust.height = H * DUST_DPR; fx.width = W * FX_DPR; fx.height = H * FX_DPR;
  dctx.setTransform(DUST_DPR, 0, 0, DUST_DPR, 0, 0); fctx.setTransform(FX_DPR, 0, 0, FX_DPR, 0, 0);
}
sizeCanvases(); addEventListener("resize", sizeCanvases);

const pointer = { x: -999, y: -999 };
addEventListener("pointermove", e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

const motes = Array.from({ length: reduced ? 0 : small ? (lowEnd ? 22 : 34) : 70 }, () => ({
  x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4,
  vx: (Math.random() - .5) * .15, vy: -Math.random() * .25 - .05, t: Math.random() * Math.PI * 2, s: Math.random() * .02 + .008
}));
let scrollVel = 0;
const makeSprite = (rgb, glow) => { const c = document.createElement("canvas"), z = 32; c.width = c.height = z; const g = c.getContext("2d");
  const gr = g.createRadialGradient(z / 2, z / 2, 0, z / 2, z / 2, z / 2);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(glow ? .18 : .35, `rgba(${rgb},.9)`); gr.addColorStop(glow ? .45 : .5, `rgba(${rgb},${glow ? .25 : 0})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, z, z); return c; };
const SPR_LIGHT = makeSprite("194,154,91", false), SPR_DARK = makeSprite("240,217,166", true);
function drawDust() {
  if (document.hidden) return;
  dctx.clearRect(0, 0, W, H);
  const dark = document.body.classList.contains("dark-mode");
  motes.forEach(m => {
    const dx = m.x - pointer.x, dy = m.y - pointer.y, d2 = dx * dx + dy * dy;
    if (d2 < 14000) { const f = (14000 - d2) / 14000 * .9; m.x += dx / Math.sqrt(d2 + 1) * f * 2; m.y += dy / Math.sqrt(d2 + 1) * f * 2; }
    m.x += m.vx; m.y += m.vy - scrollVel * .04; m.t += m.s;
    if (m.y < -10) m.y = H + 10; if (m.y > H + 10) m.y = -10; if (m.x < -10) m.x = W + 10; if (m.x > W + 10) m.x = -10;
    dctx.globalAlpha = (Math.sin(m.t) * .5 + .5) * (dark ? .95 : .6);
    const z = m.r * (dark ? 9 : 5.5);
    dctx.drawImage(dark ? SPR_DARK : SPR_LIGHT, m.x - z / 2, m.y - z / 2, z, z);
  });
  dctx.globalAlpha = 1;
}

/* ═══════════════ CANVAS: confetti + fireworks ═══════════════ */
const COLORS = ["#a3202b", "#c29a5b", "#f0d9a6", "#7d97a3", "#5e0f16", "#fcf8f2"];
const FW_COLORS = ["#f0d9a6", "#ffd36b", "#ff8a5c", "#e8455a", "#fff3d6", "#c29a5b"];
let confetti = [], rockets = [], sparks = [];
function burst(x = W / 2, y = H / 2, count = 160, spread = 1) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 9) * spread;
    confetti.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, w: 6 + Math.random() * 7, h: 8 + Math.random() * 10,
      r: Math.random() * Math.PI, vr: (Math.random() - .5) * .35, c: COLORS[(Math.random() * COLORS.length) | 0], circle: Math.random() < .25, life: 0 });
  }
}
function launch(x = W * (.2 + Math.random() * .6), ty = H * (.15 + Math.random() * .3)) {
  rockets.push({ x, y: H + 10, tx: x + (Math.random() - .5) * 80, ty, life: 0, c: FW_COLORS[(Math.random() * FW_COLORS.length) | 0] });
}
function explode(x, y, c) {
  const n = small ? 60 : 95, ring = Math.random() < .35;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * .1, v = ring ? 4.2 : Math.random() * 4.8 + 1;
    sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 60 + Math.random() * 40, c: Math.random() < .2 ? "#fff3d6" : c });
  }
  pop();
}
function drawFx() {
  fctx.clearRect(0, 0, W, H);
  confetti.forEach(p => {
    p.vy += .22; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r); fctx.globalAlpha = Math.max(0, 1 - p.life / 260); fctx.fillStyle = p.c;
    if (p.circle) { fctx.beginPath(); fctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); fctx.fill(); }
    else fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1);
    fctx.restore();
  });
  confetti = confetti.filter(p => p.y < H + 40 && p.life < 260);

  fctx.globalCompositeOperation = "lighter";
  rockets.forEach(r => {
    r.life++; const k = Math.min(1, r.life / 55), e = 1 - Math.pow(1 - k, 3);
    const x = r.x + (r.tx - r.x) * e, y = (H + 10) + (r.ty - H - 10) * e;
    fctx.beginPath(); fctx.arc(x, y, 2, 0, Math.PI * 2); fctx.fillStyle = "#fff3d6"; fctx.fill();
    for (let i = 1; i < 6; i++) { fctx.globalAlpha = .25 / i; fctx.beginPath(); fctx.arc(x, y + i * 6, 2, 0, Math.PI * 2); fctx.fill(); }
    fctx.globalAlpha = 1;
    if (k >= 1) { r.done = true; explode(x, y, r.c); }
  });
  rockets = rockets.filter(r => !r.done);
  sparks.forEach(s => {
    s.px = s.x; s.py = s.y; s.vx *= .965; s.vy = s.vy * .965 + .045; s.x += s.vx; s.y += s.vy; s.life++;
    const a = Math.max(0, 1 - s.life / s.max);
    fctx.strokeStyle = s.c; fctx.globalAlpha = a; fctx.lineWidth = 1.8;
    fctx.beginPath(); fctx.moveTo(s.px, s.py); fctx.lineTo(s.x, s.y); fctx.stroke();
  });
  fctx.globalAlpha = 1; fctx.globalCompositeOperation = "source-over";
  sparks = sparks.filter(s => s.life < s.max);
}
let fxDirty = false;
gsap.ticker.add(() => { drawDust(); if (confetti.length || rockets.length || sparks.length) { drawFx(); fxDirty = true; } else if (fxDirty) { fctx.clearRect(0, 0, W, H); fxDirty = false; } });

/* ═══════════════ CURSOR + MAGNETIC ═══════════════ */
if (!isTouch) {
  document.body.classList.add("has-cursor");
  const cur = $(".cursor"), dot = $(".cursor-dot"), ring = $(".cursor-ring"), label = $(".cursor-label");
  const dx = gsap.quickTo(dot, "x", { duration: .08 }), dy = gsap.quickTo(dot, "y", { duration: .08 });
  const rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3" });
  addEventListener("pointermove", e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cur.classList.add("ready"); });
  document.addEventListener("pointerleave", () => cur.classList.remove("ready"));
  document.addEventListener("pointerover", e => {
    const t = e.target.closest("[data-cursor], a, button");
    if (t) { cur.classList.add("hover"); label.textContent = t.dataset.cursor || "✦"; }
  });
  document.addEventListener("pointerout", e => { if (e.target.closest("[data-cursor], a, button")) cur.classList.remove("hover"); });

  $$(".magnetic").forEach(el => {
    const mx = gsap.quickTo(el, "x", { duration: .6, ease: "elastic.out(1,.4)" }), my = gsap.quickTo(el, "y", { duration: .6, ease: "elastic.out(1,.4)" });
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .35); my((e.clientY - r.top - r.height / 2) * .35); });
    el.addEventListener("pointerleave", () => { mx(0); my(0); });
  });

  // 3D tilt + light on the arch photo
  const tilt = $(".arch-tilt"), arch = $(".arch");
  const tx = gsap.quickTo(tilt, "rotationY", { duration: .8, ease: "power3" }), ty = gsap.quickTo(tilt, "rotationX", { duration: .8, ease: "power3" });
  $(".hero").addEventListener("pointermove", e => {
    const r = arch.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    tx(gsap.utils.clamp(-12, 12, nx * 16)); ty(gsap.utils.clamp(-10, 10, -ny * 12));
    arch.style.setProperty("--mx", (nx + .5) * 100 + "%"); arch.style.setProperty("--my", (ny + .5) * 100 + "%");
  });
  $(".hero").addEventListener("pointerleave", () => { tx(0); ty(0); });
}

/* ═══════════════ PETALS + STARS ═══════════════ */
const petalBox = $(".petals");
for (let i = 0; i < (small ? 12 : 22); i++) {
  const p = document.createElement("span");
  p.className = "petal" + (Math.random() < .35 ? " gold" : "");
  p.style.left = Math.random() * 100 + "%";
  p.style.animationDuration = 10 + Math.random() * 10 + "s";
  p.style.animationDelay = -Math.random() * 20 + "s";
  p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
  p.style.scale = .6 + Math.random() * .8;
  petalBox.appendChild(p);
}
const starBox = $(".stars");
for (let i = 0; i < (small ? 40 : 70); i++) {
  const s = document.createElement("span"); s.className = "star";
  s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
  s.style.animationDelay = -Math.random() * 3 + "s"; s.style.animationDuration = 2 + Math.random() * 3 + "s";
  const z = Math.random() < .12 ? 3 : Math.random() < .4 ? 2 : 1; s.style.width = s.style.height = z + "px";
  starBox.appendChild(s);
}

/* ═══════════════ LOADER → GATE → OPEN ═══════════════ */
gsap.set(".gate-kicker span, #seal, .gate-hint", { autoAlpha: 0, y: 24 });
gsap.set([".hero-eyebrow .line-mask > span", ".h1-small .line-mask > span", ".lede .line-mask > span"], { yPercent: 110 });
gsap.set(".h1-name .char", { yPercent: 120, rotate: 10 });
gsap.set(".scroll-cue", { autoAlpha: 0, y: 20 });
gsap.set(".arch-img", { clipPath: "inset(100% 0% 0% 0%)" });
gsap.set(".arch-img img", { scale: 1.45 });
gsap.set(".arch-frame", { autoAlpha: 0, x: 18, y: -18 });
gsap.set(".arch figcaption", { autoAlpha: 0, scale: .6, rotate: -20 });

const assets = $$(".hero img").map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; }));
const ready = Promise.all([...assets, document.fonts ? document.fonts.ready : Promise.resolve()]);
const counter = { v: 0 };
const countTween = gsap.to(counter, {
  v: 92, duration: 1.6, ease: "power2.out",
  onUpdate: () => { $("#loadNum").textContent = Math.round(counter.v); gsap.set("#loadBar", { scaleX: counter.v / 100 }); }
});
ready.then(() => countTween.then(() => {
  gsap.to(counter, {
    v: 100, duration: .4, ease: "power1.out",
    onUpdate: () => { $("#loadNum").textContent = Math.round(counter.v); gsap.set("#loadBar", { scaleX: counter.v / 100 }); },
    onComplete: showGate
  });
}));

let introTl = null;
function showGate() {
  document.body.classList.replace("is-loading", "is-locked");
  const box = $("#gateLines");
  box.innerHTML = CONFIG.intro.map(l => `<p class="gate-line">${esc(l.replace("{name}", CONFIG.name))}</p>`).join("");
  introTl = gsap.timeline()
    .to(".loader-inner", { autoAlpha: 0, y: -30, duration: .6, ease: "power3.in" })
    .to("#loader", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=.1")
    .set("#loader", { display: "none" })
    .to("#gateSkip", { opacity: 1, duration: 1 }, "-=.3");
  $$(".gate-line", box).forEach((line, i, all) => {
    introTl.fromTo(line, { autoAlpha: 0, y: 18, filter: "blur(14px)", letterSpacing: ".06em" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", letterSpacing: "0em", duration: 1.3, ease: "power3.out" }, i ? ">-.15" : ">-.4");
    introTl.to(line, { autoAlpha: 0, y: -14, filter: "blur(10px)", duration: .9, ease: "power2.in" }, i === all.length - 1 ? "+=.7" : "+=1.1");
  });
  introTl.to("#gateSkip", { opacity: 0, duration: .4 }, "-=.6")
    .to(".gate-kicker span", { autoAlpha: 1, y: 0, duration: 1.2, stagger: .15, ease: "expo.out" }, "-=.5")
    .to("#seal", { autoAlpha: 1, y: 0, duration: 1.2, ease: "back.out(1.6)" }, "-=.9")
    .to(".gate-hint", { autoAlpha: 1, y: 0, duration: 1 }, "-=.8")
    .add(() => (introTl = null));
}
$("#gate").addEventListener("click", e => {
  if (introTl && !e.target.closest("#seal")) { const t = introTl; introTl = null; t.progress(1); }
});

let opened = false;
$("#seal").addEventListener("click", () => {
  if (opened) return; opened = true;
  initAudio(); chime(); setTimeout(startAmbient, 1800); buzz([12, 40, 24]); enableGyroTilt();
  soundBtn.hidden = false; gsap.from(soundBtn, { scale: 0, duration: .8, delay: 2, ease: "back.out(2)" });
  const big = Math.hypot(W, H) * 2.2;
  gsap.timeline({ onComplete: () => { $("#gate").remove(); const c = $(".cursor"); c && c.classList.remove("hover"); } })
    .to("#seal", { scale: .85, duration: .15, ease: "power2.in" })
    .to("#seal", { scale: 1.6, autoAlpha: 0, duration: .6, ease: "expo.out" })
    .to(".gate-kicker, .gate-hint", { autoAlpha: 0, y: -20, duration: .4 }, "<")
    .to(".gate-flash", { width: big, height: big, margin: -big / 2, opacity: 1, duration: .55, ease: "power2.out" }, "<.05")
    .to(".gate-flash", { opacity: 0, duration: .9, ease: "power2.out" })
    .to(".gate-top", { yPercent: -101, duration: 1.4, ease: "expo.inOut" }, "<-.6")
    .to(".gate-bottom", { yPercent: 101, duration: 1.4, ease: "expo.inOut" }, "<")
    .add(() => { burst(W / 2, H * .45, small ? 140 : 220, 1.1); heroIn(); }, "<.45");
});

function heroIn() {
  document.body.classList.remove("is-locked");
  window.scrollTo(0, 0);
  if (lenis) { lenis.scrollTo(0, { immediate: true, force: true }); lenis.start(); }
  ScrollTrigger.refresh();
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to(".hero-eyebrow .line-mask > span", { yPercent: 0, duration: 1.2 })
    .to(".h1-small .line-mask > span", { yPercent: 0, duration: 1.3 }, "-=1")
    .to(".h1-name .char", { yPercent: 0, rotate: 0, duration: 1.5, stagger: .045 }, "-=1.05")
    .to(".arch-img", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" }, .2)
    .to(".arch-img img", { scale: 1, duration: 2.4, ease: "expo.out" }, .6)
    .to(".arch-frame", { autoAlpha: 1, x: 0, y: 0, duration: 1.6 }, 1.2)
    .to(".arch figcaption", { autoAlpha: 1, scale: 1, rotate: -6, duration: 1.2, ease: "back.out(2)" }, 1.7)
    .to(".lede .line-mask > span", { yPercent: 0, duration: 1.2, stagger: .1 }, 1)
    .to(".scroll-cue", { autoAlpha: 1, y: 0, duration: 1 }, 1.4);
}

/* ═══════════════ SCROLL SCENES ═══════════════ */
// progress bar
gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

// track scroll velocity for marquees + dust
ScrollTrigger.create({ onUpdate: self => { scrollVel = gsap.utils.clamp(-60, 60, self.getVelocity() / 60); } });

// hero parallax out
gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
  .to(".hero-text", { y: -140, autoAlpha: .15, ease: "none" }, 0)
  .to(".arch", { y: -60, ease: "none" }, 0)
  .to(".hero-orb", { y: 160, scale: 1.3, ease: "none" }, 0);

// marquees — infinite loop that speeds up with scroll velocity
const loops = $$(".marquee").map((m, i) => gsap.to($(".marquee-track", m), { xPercent: i ? 0 : -50, startAt: { xPercent: i ? -50 : 0 }, duration: i ? 34 : 28, ease: "none", repeat: -1 }));
ScrollTrigger.create({ trigger: ".marquee-wrap", start: "top bottom", end: "bottom top", onToggle: st => loops.forEach(l => st.isActive ? l.resume() : l.pause()) });
gsap.ticker.add(() => { const boost = 1 + Math.abs(scrollVel) * .12; loops.forEach(l => l.timeScale(gsap.utils.interpolate(l.timeScale(), boost, .1))); scrollVel *= .92; });

// quote: words light up as you scroll
gsap.to(".quote-text .w", {
  opacity: 1, stagger: .1, ease: "none",
  scrollTrigger: { trigger: ".quote-text", start: "top 78%", end: "bottom 45%", scrub: .6 }
});
gsap.from(".quote .eyebrow", { autoAlpha: 0, y: 20, duration: 1, scrollTrigger: { trigger: ".quote", start: "top 80%" } });

// sea: small arch → full screen (her face stays centred in the arch, then the shot opens up)
// small zoom only (the photo is low-res), face centred by sliding, never leaving gaps in the arch
const SEA_ZOOM = 1.08, SEA_FACE = { x: .73, y: .35 }, SEA_POS = { x: .78, y: .37 };
function seaFace() {
  const img = $(".sea-frame img"), Wb = innerWidth, Hb = innerHeight;
  const iw = img.naturalWidth || 1792, ih = img.naturalHeight || 2400, k = Math.max(Wb / iw, Hb / ih);
  const dw = iw * k, dh = ih * k, fx = (Wb - dw) * SEA_POS.x + SEA_FACE.x * dw, fy = (Hb - dh) * SEA_POS.y + SEA_FACE.y * dh;
  // the arch window at the start (matches the CSS clip-path insets)
  const insX = (small ? .14 : .32) * Wb, insY = (small ? .21 : .18) * Hb;
  const maxX = Math.max(0, SEA_ZOOM * Wb / 2 - (Wb / 2 - insX)), maxY = Math.max(0, SEA_ZOOM * Hb / 2 - (Hb / 2 - insY));
  const c = gsap.utils.clamp;
  return { x: c(-maxX, maxX, -(fx - Wb / 2) * SEA_ZOOM), y: c(-maxY, maxY, -(fy - Hb / 2) * SEA_ZOOM) };
}
gsap.timeline({
  scrollTrigger: { trigger: ".sea", start: "top top", end: () => "+=" + innerHeight * 1.6, pin: true, anticipatePin: 1, scrub: 1, invalidateOnRefresh: true }
})
  .fromTo(".sea-frame",
    { clipPath: () => small ? "inset(21vh 14vw 21vh 14vw round 300px 300px 14px 14px)" : "inset(18vh 32vw 18vh 32vw round 300px 300px 14px 14px)" },
    { clipPath: "inset(0vh 0vw 0vh 0vw round 0px 0px 0px 0px)", ease: "power2.inOut", duration: 1 })
  .fromTo(".sea-frame img", { x: () => seaFace().x, y: () => seaFace().y, scale: SEA_ZOOM }, { x: 0, y: 0, scale: 1, ease: "power2.inOut", duration: 1 }, 0)
  .to(".sea-shade", { opacity: 1, duration: .5 }, .55)
  .from(".sea-caption .eyebrow", { autoAlpha: 0, y: 30, duration: .3 }, .7)
  .from(".sea-caption h2", { autoAlpha: 0, y: 60, duration: .4 }, .78)
  .to({}, { duration: .3 });

// wishes: horizontal scroll
const track = $(".wishes-track");
const dist = () => track.scrollWidth - innerWidth;
const hScroll = gsap.to(track, {
  x: () => -dist(), ease: "none",
  scrollTrigger: { trigger: ".wishes", start: "top top", end: () => "+=" + dist(), pin: true, anticipatePin: 1, scrub: 1, invalidateOnRefresh: true,
    onUpdate: s => gsap.set(".wishes-bar i", { scaleX: s.progress }) }
});
$$(".wish").forEach((card, i) => {
  gsap.from(card, {
    yPercent: 18, rotate: i % 2 ? -5 : 5, autoAlpha: 0, ease: "power2.out",
    scrollTrigger: { trigger: card, containerAnimation: hScroll, start: "left 100%", end: "left 62%", scrub: true }
  });
  gsap.from($(".wish-icon", card), {
    scale: .3, rotate: -90, ease: "back.out(2)",
    scrollTrigger: { trigger: card, containerAnimation: hScroll, start: "left 85%", end: "left 55%", scrub: true }
  });
});
gsap.from(".wish-intro > *", { autoAlpha: 0, y: 50, stagger: .12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".wishes", start: "top 60%" } });

// envelope: arrives, flap opens, card rises
gsap.set(".env-flap", { transformPerspective: 1400 });
gsap.timeline({
  scrollTrigger: { trigger: ".envelope-section", start: "top top", end: () => "+=" + innerHeight * 1.5, pin: true, anticipatePin: 1, scrub: 1, invalidateOnRefresh: true }
})
  .from(".env-eyebrow", { autoAlpha: 0, y: 30, duration: .2 })
  .from(".envelope", { y: () => innerHeight * .5, rotate: -8, autoAlpha: 0, duration: .5, ease: "power3.out" }, 0)
  .to(".env-seal", { scale: 1.3, autoAlpha: 0, duration: .15 }, .5)
  .to(".env-flap", { rotationX: 180, duration: .45, ease: "power2.inOut" }, .55)
  .set(".env-flap", { zIndex: 1 }, .78)
  .to(".env-card", { yPercent: -62, duration: .55, ease: "power3.out" }, .95)
  .to(".envelope", { y: () => innerHeight * .1, duration: .55, ease: "power3.out" }, .95)
  .to({}, { duration: .25 });

// letter
gsap.from(".letter", { y: 120, rotate: -3, autoAlpha: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".letter-section", start: "top 75%" } });
gsap.from(".letter-to, .letter-body p", { autoAlpha: 0, y: 26, stagger: .18, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".letter", start: "top 60%" } });
gsap.fromTo(".letter-sign", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.inOut", clearProps: "clipPath", scrollTrigger: { trigger: ".letter-sign", start: "top 88%" } });

// lights off
gsap.timeline({ scrollTrigger: { trigger: ".dusk", start: "top 40%", end: "bottom 30%", scrub: true } })
  .to(".dusk-text", { opacity: 1, letterSpacing: ".08em", duration: .5 })
  .to(".dusk-text", { opacity: 0, y: -40, duration: .5 });
ScrollTrigger.create({ trigger: ".dusk", start: "55% center", endTrigger: ".finale", end: "bottom top", toggleClass: { targets: "body", className: "dark-mode" } });

// cake entrance
gsap.timeline({ scrollTrigger: { trigger: ".cake-section", start: "top 65%" } })
  .from(".cake-section .eyebrow, .cake-title, .cake-sub", { autoAlpha: 0, y: 40, stagger: .15, duration: 1.2, ease: "expo.out" })
  .from(".cake", { y: 80, autoAlpha: 0, duration: 1.4, ease: "expo.out" }, "-=.9")
  .from(".cake-glow", { scale: .2, autoAlpha: 0, duration: 2, ease: "power2.out" }, "-=1.2");

// finale
gsap.timeline({ scrollTrigger: { trigger: ".finale", start: "top 60%" }, defaults: { ease: "expo.out" } })
  .from(".finale .eyebrow", { autoAlpha: 0, y: 20, duration: 1 })
  .from(".ft-1, .ft-2", { autoAlpha: 0, yPercent: 60, stagger: .15, duration: 1.4 }, "-=.7")
  .add(() => startNameParticles(), "-=.9")
  .from(".ft-name", { autoAlpha: 0, scale: .85, filter: "blur(16px)", duration: 2 }, "<")
  .from(".finale-sub, .finale-actions", { autoAlpha: 0, y: 30, stagger: .15, duration: 1.2 }, "-=1.4")
  .add(() => { for (let i = 0; i < 5; i++) setTimeout(() => launch(), i * 420); }, "-=1.6");

/* ═══════════════ CAKE INTERACTION ═══════════════ */
const cake = $("#cake"), cakeSub = $("#cakeSub");
function blow() {
  if (cake.classList.contains("out")) return;
  initAudio();
  cake.classList.add("out"); $(".cake-section").classList.add("blown"); buzz([20, 60, 20, 60, 40]);
  gsap.to(cakeSub, { autoAlpha: 0, duration: .3, onComplete: () => { cakeSub.textContent = "now write your wish down ↓"; gsap.to(cakeSub, { autoAlpha: 1, duration: .6 }); } });
  const r = cake.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + 20, small ? 150 : 240, 1.2);
  for (let i = 0; i < (small ? 7 : 11); i++) setTimeout(() => launch(), 300 + i * 380);
  playSong();
  setTimeout(showWishForm, 2200);
  gsap.fromTo(".cake-title", { textShadow: "0 0 0px rgba(240,217,166,0)" }, { textShadow: "0 0 40px rgba(240,217,166,.6)", duration: 1.2, yoyo: true, repeat: 1 });
}
cake.addEventListener("click", blow);
cake.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(); } });

$("#songBtn").addEventListener("click", () => { playSong(); for (let i = 0; i < 4; i++) setTimeout(() => launch(), i * 500); });
$("#againBtn").addEventListener("click", () => scrollToY(0, 3.2));
$(".scroll-cue").addEventListener("click", e => { e.preventDefault(); scrollToY($("#quote").offsetTop - 40, 1.8); });

addEventListener("load", () => ScrollTrigger.refresh());

/* ═══════════════ v3 · PARTICLE NAME ═══════════════ */
const nc = $("#nameCanvas"), nctx = nc.getContext("2d");
let nParts = [], nW = 0, nH = 0, nRunning = false, nVisible = false, nTime = 0;
const nPointer = { x: -999, y: -999, down: false };
const GOLDS = ["#b98c48", "#c29a5b", "#e3cfa6", "#f0d9a6", "#fff3d6"];
function buildName() {
  const wrap = nc.parentElement;
  nW = wrap.clientWidth;
  const off = document.createElement("canvas"), o = off.getContext("2d");
  let fs = Math.min(nW * .24, 190);
  o.font = `italic 500 ${fs}px Cormorant, Georgia, serif`;
  const tw = o.measureText(CONFIG.name).width;
  if (tw > nW * .94) fs *= (nW * .94) / tw;
  nH = Math.round(fs * 1.3);
  off.width = nW; off.height = nH;
  o.font = `italic 500 ${fs}px Cormorant, Georgia, serif`;
  o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
  o.fillText(CONFIG.name, nW / 2, nH / 2);
  const data = o.getImageData(0, 0, nW, nH).data;
  const maxParts = small ? (lowEnd ? 1300 : 2000) : 4600;
  let step = Math.max(2, Math.round(fs / 52)), pts;
  do {
    pts = [];
    for (let y = 0; y < nH; y += step) for (let x = 0; x < nW; x += step) if (data[(y * nW + x) * 4 + 3] > 140) pts.push([x, y]);
    step++;
  } while (pts.length > maxParts);
  nc.width = nW * DPR; nc.height = nH * DPR; nc.style.height = nH + "px";
  nctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const old = nParts;
  nParts = pts.map(([tx, ty], i) => {
    const p = old[i] || { x: Math.random() * nW, y: nH / 2 + (Math.random() - .5) * nH * 4, vx: 0, vy: 0 };
    return { x: p.x, y: p.y, vx: p.vx, vy: p.vy, tx, ty, s: step * .72 + Math.random() * .9,
      c: GOLDS[Math.min(GOLDS.length - 1, Math.floor(Math.random() * GOLDS.length))], ph: Math.random() * 6.28 };
  });
}
function scatterName(power = 1) {
  nParts.forEach(p => { const a = Math.random() * 6.28, v = (Math.random() * 14 + 6) * power; p.vx += Math.cos(a) * v; p.vy += Math.sin(a) * v; });
}
function startNameParticles() {
  if (nRunning) return;
  document.body.classList.add("particles-on");
  buildName();
  // begin as a swirling cloud
  nParts.forEach(p => { const a = Math.random() * 6.28, r = Math.max(nW, nH) * (.4 + Math.random() * .6); p.x = nW / 2 + Math.cos(a) * r; p.y = nH / 2 + Math.sin(a) * r * .5; p.vx = -Math.sin(a) * 9; p.vy = Math.cos(a) * 5; });
  nRunning = true;
}
function drawName() {
  if (!nRunning || !nVisible) return;
  nTime += .016;
  nctx.clearRect(0, 0, nW, nH);
  nctx.globalCompositeOperation = "lighter";
  const R = small ? 55 : 80, R2 = R * R;
  for (const p of nParts) {
    let ax = (p.tx - p.x) * .045, ay = (p.ty - p.y) * .045;
    const dx = p.x - nPointer.x, dy = p.y - nPointer.y, d2 = dx * dx + dy * dy;
    if (d2 < R2) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 6; ax += dx / d * f; ay += dy / d * f; }
    p.vx = (p.vx + ax) * .84; p.vy = (p.vy + ay) * .84;
    p.x += p.vx; p.y += p.vy;
    const tw = .72 + .28 * Math.sin(nTime * 2.4 + p.ph + p.tx * .015);
    nctx.globalAlpha = tw; nctx.fillStyle = p.c;
    nctx.fillRect(p.x, p.y, p.s, p.s);
  }
  nctx.globalAlpha = 1; nctx.globalCompositeOperation = "source-over";
}
gsap.ticker.add(drawName);
ScrollTrigger.create({ trigger: ".finale", start: "top bottom", end: "bottom top", onToggle: s => (nVisible = s.isActive) });
const nPos = e => { const r = nc.getBoundingClientRect(); nPointer.x = e.clientX - r.left; nPointer.y = e.clientY - r.top; };
nc.addEventListener("pointermove", nPos);
nc.addEventListener("pointerleave", () => { nPointer.x = nPointer.y = -999; });
nc.addEventListener("pointerdown", e => { nPos(e); scatterName(1); pop(); setTimeout(() => { nPointer.x = nPointer.y = -999; }, 120); });
let nResize; addEventListener("resize", () => { clearTimeout(nResize); nResize = setTimeout(() => nRunning && buildName(), 250); });

/* ═══════════════ v3 · SCRATCH CARD ═══════════════ */
$("#secretText").textContent = CONFIG.secret;
$("#secretChapter").textContent = CONFIG.secretChapter || "";
$("#secretSource").textContent = CONFIG.secretSource || "";
// shrink the passage until it fits the card on any screen
function fitSecret() {
  const box = $(".scratch-msg"), p = $("#secretText"), kids = [...box.children];
  const cs = getComputedStyle(box);
  // space inside the padding (the gold inner border sits in the padding), minus a little breathing room
  const avail = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 6;
  const used = () => {
    const top = Math.min(...kids.map(k => k.getBoundingClientRect().top - parseFloat(getComputedStyle(k).marginTop)));
    const bottom = Math.max(...kids.map(k => k.getBoundingClientRect().bottom + parseFloat(getComputedStyle(k).marginBottom)));
    return bottom - top;
  };
  let size = Math.min(24, Math.max(15, box.clientWidth / 18));
  p.style.fontSize = size + "px";
  while (used() > avail && size > 11) { size -= .5; p.style.fontSize = size + "px"; }
}
(document.fonts ? document.fonts.ready : Promise.resolve()).then(fitSecret);
addEventListener("resize", () => { clearTimeout(fitSecret.t); fitSecret.t = setTimeout(fitSecret, 150); });
const sc = $("#scratchCanvas"), sctx = sc.getContext("2d", { willReadFrequently: true });
let scW = 0, scH = 0, scDone = false, scMoves = 0, scLast = null;
function paintFoil() {
  scW = sc.clientWidth; scH = sc.clientHeight;
  sc.width = scW * DPR; sc.height = scH * DPR; sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const g = sctx.createLinearGradient(0, 0, scW, scH);
  g.addColorStop(0, "#9c7436"); g.addColorStop(.3, "#e6c88a"); g.addColorStop(.5, "#fff0c8"); g.addColorStop(.7, "#d2ad68"); g.addColorStop(1, "#8a6229");
  sctx.globalCompositeOperation = "source-over";
  sctx.fillStyle = g; sctx.fillRect(0, 0, scW, scH);
  // foil texture
  for (let i = 0; i < 900; i++) { sctx.fillStyle = `rgba(255,255,255,${Math.random() * .12})`; sctx.fillRect(Math.random() * scW, Math.random() * scH, 1.5, 1.5); }
  for (let i = 0; i < 500; i++) { sctx.fillStyle = `rgba(80,50,10,${Math.random() * .1})`; sctx.fillRect(Math.random() * scW, Math.random() * scH, 1.5, 1.5); }
  sctx.strokeStyle = "rgba(94,15,22,.35)"; sctx.lineWidth = 1; sctx.setLineDash([4, 5]);
  sctx.strokeRect(14, 14, scW - 28, scH - 28); sctx.setLineDash([]);
  sctx.fillStyle = "rgba(94,15,22,.6)"; sctx.textAlign = "center"; sctx.textBaseline = "middle";
  sctx.font = `italic 500 ${Math.max(22, scW * .065)}px Cormorant, Georgia, serif`;
  sctx.fillText("scratch me", scW / 2, scH / 2 - 8);
  sctx.font = `600 ${Math.max(9, scW * .02)}px Manrope, sans-serif`;
  sctx.fillText("✦  ✦  ✦", scW / 2, scH / 2 + scW * .06);
}
function scratchAt(x, y) {
  sctx.globalCompositeOperation = "destination-out";
  sctx.lineCap = sctx.lineJoin = "round"; sctx.lineWidth = Math.max(34, scW * .085);
  sctx.beginPath(); sctx.moveTo(scLast ? scLast[0] : x, scLast ? scLast[1] : y); sctx.lineTo(x, y); sctx.stroke();
  scLast = [x, y];
  if (++scMoves % 8 === 0) checkScratch();
}
function checkScratch() {
  const d = sctx.getImageData(0, 0, sc.width, sc.height).data;
  let clear = 0, total = 0;
  for (let i = 3; i < d.length; i += 4 * 24) { total++; if (d[i] < 40) clear++; }
  if (clear / total > .5) revealSecret();
}
function revealSecret() {
  if (scDone) return; scDone = true; buzz(30);
  gsap.to(sc, { autoAlpha: 0, duration: .9, ease: "power2.out" });
  gsap.from(".scratch-msg > *", { autoAlpha: 0, y: 14, duration: 1.1, ease: "power3.out", stagger: .12 });
  $("#scratchHint").textContent = "there it is ✦";
  const r = sc.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, small ? 90 : 140, .8);
  chime();
}
sc.addEventListener("pointerdown", e => { if (scDone) return; initAudio(); sc.setPointerCapture(e.pointerId); const r = sc.getBoundingClientRect(); scLast = null; scratchAt(e.clientX - r.left, e.clientY - r.top); sc.dataset.down = 1; });
sc.addEventListener("pointermove", e => { if (scDone || !sc.dataset.down) return; const r = sc.getBoundingClientRect(); scratchAt(e.clientX - r.left, e.clientY - r.top); });
["pointerup", "pointercancel", "pointerleave"].forEach(ev => sc.addEventListener(ev, () => { delete sc.dataset.down; scLast = null; }));
paintFoil();
addEventListener("resize", () => { if (!scDone && Math.abs(sc.clientWidth - scW) > 2) paintFoil(); });   // phones fire resize when the address bar moves
gsap.from(".secret .eyebrow, .secret h2, .scratch, .scratch-hint", { autoAlpha: 0, y: 50, stagger: .14, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".secret", start: "top 70%" } });
gsap.fromTo(".scratch", { rotate: -2 }, { rotate: 1.5, ease: "none", scrollTrigger: { trigger: ".secret", start: "top bottom", end: "bottom top", scrub: true } });

/* ═══════════════ v3 · WISH LANTERN ═══════════════ */
function showWishForm() {
  const f = $("#wishForm"); f.classList.add("show", "nudge");
  ScrollTrigger.refresh();
  gsap.from(f.children, { autoAlpha: 0, y: 30, stagger: .12, duration: 1.1, ease: "expo.out" });
  // glide down so the wish box sits in the middle of the screen
  const y = f.getBoundingClientRect().top + scrollY - innerHeight * .38;
  setTimeout(() => scrollToY(y, 1.6), 250);
  bell(880, actx ? actx.currentTime + .3 : 0, 1.6, .05);
  const stop = () => f.classList.remove("nudge");
  $("#wishInput").addEventListener("focus", stop, { once: true });
  $("#wishInput").addEventListener("input", stop, { once: true });
}
$("#wishForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = $("#wishInput"); input.blur();
  const cur = $(".cursor"); if (cur) cur.classList.remove("hover");
  const text = input.value.trim() || "a secret wish";
  $("#lanternText").textContent = text;
  const f = $("#wishForm"), r = f.getBoundingClientRect();
  const lantern = $("#lantern");
  const sway = small ? 40 : 90, startX = r.left + r.width / 2, startY = r.top + r.height / 2;
  gsap.set(lantern, { x: startX, y: startY, autoAlpha: 0, scale: .4, rotate: 0 });
  gsap.to(f, { autoAlpha: 0, y: -20, duration: .6, onComplete: () => { f.style.pointerEvents = "none"; } });
  const tl = gsap.timeline();
  tl.to(lantern, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "back.out(1.6)" })
    .to(lantern, { y: -220, duration: 9, ease: "sine.in" }, ">-.2")
    .to(lantern, { x: `+=${sway}`, rotate: 6, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 3 }, "<")
    .to(lantern, { scale: .45, duration: 9, ease: "power1.in" }, "<")
    .to(lantern, { autoAlpha: 0, duration: 2 }, "-=2.2");
  bell(659.25, actx ? actx.currentTime : 0, 2.5, .08);
  gsap.to(cakeSub, { autoAlpha: 0, duration: .3, onComplete: () => { cakeSub.textContent = "it's on its way up there now ✦"; gsap.to(cakeSub, { autoAlpha: 1, duration: .8 }); } });
  for (let i = 0; i < 4; i++) setTimeout(() => launch(W * (.25 + Math.random() * .5), H * (.1 + Math.random() * .2)), 2500 + i * 700);
});

/* ═══════════════ v4 · LETTER VOICE ═══════════════
   If assets/voice-note.mp3 exists → plays YOUR recording ("hear it from me").
   Otherwise → the device reads the letter aloud ("read it to me"),
   highlighting each paragraph as it goes. */
const vAudio = $("#voiceAudio"), vBox = $("#voice"), vLabel = $(".voice-label"), vIcon = $("#voiceIcon");
const tts = "speechSynthesis" in window ? window.speechSynthesis : null;
let voiceMode = null, reading = false, ttsVoice = null;
function pickVoice() {
  if (!tts) return;
  const vs = tts.getVoices().filter(v => /^en/i.test(v.lang));
  const prefs = [/natural/i, /aria|jenny|libby|sonia|ava|emma/i, /google uk english female/i, /samantha|karen|moira|tessa|serena/i, /en-IN/i, /female/i, /google/i];
  for (const re of prefs) { const v = vs.find(v => re.test(v.name) || re.test(v.lang)); if (v) { ttsVoice = v; return; } }
  ttsVoice = vs[0] || null;
}
if (tts) { pickVoice(); tts.addEventListener ? tts.addEventListener("voiceschanged", pickVoice) : (tts.onvoiceschanged = pickVoice); }
function useTTS() {
  if (!tts) return;
  voiceMode = "tts"; vLabel.textContent = "read it to me"; $("#voiceBtn").dataset.cursor = "♪"; vBox.hidden = false; ScrollTrigger.refresh();
}
// The recording is always used when set. Phones won't load audio until a tap,
// so nothing is preloaded here; it loads when she presses the button.
let playAsked = false;
function fallbackToTTS() {
  if (voiceMode !== "file") return;
  setPlayingUI(false); useTTS(); if (playAsked) readLetter();
}
if (CONFIG.voiceNote) {
  voiceMode = "file"; vLabel.textContent = CONFIG.voiceLabel || "hear it from me"; vBox.hidden = false;
  vAudio.preload = "none"; vAudio.src = CONFIG.voiceNote;
  vAudio.addEventListener("error", () => { if (playAsked) fallbackToTTS(); });
} else useTTS();

function setPlayingUI(on) {
  vBox.classList.toggle("playing", on); $(".letter").classList.toggle("is-reading", on); vIcon.textContent = on ? "❚❚" : "▶";
}
function stopReading() {
  reading = false; if (tts) tts.cancel();
  $$(".letter .reading").forEach(el => el.classList.remove("reading"));
  setPlayingUI(false); duckAmbient(1);
}
function readLetter() {
  if (!tts) return;
  tts.cancel(); reading = true; setPlayingUI(true); duckAmbient(.45);
  const parts = [{ el: $(".letter-to"), text: `Dear ${CONFIG.name}.` },
    ...$$(".letter-body p").map(el => ({ el, text: el.textContent })),
    { el: $(".letter-sign"), text: `From ${CONFIG.from}.` }];
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part.text);
    if (ttsVoice) { u.voice = ttsVoice; u.lang = ttsVoice.lang; }
    u.rate = .86; u.pitch = 1.02; u.volume = 1;
    u.onstart = () => { $$(".letter .reading").forEach(el => el.classList.remove("reading")); part.el.classList.add("reading"); };
    if (i === parts.length - 1) u.onend = () => { if (reading) stopReading(); };
    tts.speak(u);
  });
}
function unmuteForVoice() {
  if (!muted) return;
  muted = false; soundBtn.classList.remove("muted");
  if (master && actx) master.gain.setTargetAtTime(1, actx.currentTime, .05);
}
$("#voiceBtn").addEventListener("click", () => {
  initAudio(); unmuteForVoice();
  if (voiceMode === "file") {
    if (vAudio.paused) {
      playAsked = true; setPlayingUI(true);              // instant feedback while it loads
      const pr = vAudio.play();
      // a quick second tap pauses while it's still loading (AbortError) — that's fine, keep the recording
      if (pr && pr.catch) pr.catch(() => { if (vAudio.error) fallbackToTTS(); else if (vAudio.paused) setPlayingUI(false); });
    } else vAudio.pause();
  }
  else if (voiceMode === "tts") { reading ? stopReading() : readLetter(); }
});
// light up each part of the letter in time with the audio
const letterParts = () => [$(".letter-to"), ...$$(".letter-body p"), $(".letter-sign")];
function cueTimes() {
  const parts = letterParts(), d = vAudio.duration || 1;
  if (CONFIG.voiceCues && CONFIG.voiceCues.length === parts.length) return CONFIG.voiceCues;
  const lens = parts.map(p => p.textContent.length), total = lens.reduce((a, b) => a + b, 0); // fallback: by text length
  let acc = 0; return lens.map(l => { const t = acc / total * d; acc += l; return t; });
}
let syncRaf = null, lastIdx = -1;
function syncLoop() {
  const cues = cueTimes(), t = vAudio.currentTime, parts = letterParts();
  let idx = 0; cues.forEach((c, i) => { if (t >= c) idx = i; });
  if (idx !== lastIdx) { parts.forEach(p => p.classList.remove("reading")); parts[idx].classList.add("reading"); lastIdx = idx; }
  syncRaf = requestAnimationFrame(syncLoop);
}
function clearSync() { cancelAnimationFrame(syncRaf); lastIdx = -1; letterParts().forEach(p => p.classList.remove("reading")); }
vAudio.addEventListener("play", () => { setPlayingUI(true); duckAmbient(.2); });
vAudio.addEventListener("playing", () => { cancelAnimationFrame(syncRaf); syncLoop(); });
vAudio.addEventListener("pause", () => { setPlayingUI(false); duckAmbient(1); clearSync(); });
vAudio.addEventListener("ended", () => { setPlayingUI(false); duckAmbient(1); clearSync(); vAudio.currentTime = 0; });
addEventListener("pagehide", () => tts && tts.cancel());

/* ═══════════════ v3 · LIVE BIRTHDAY CLOCK ═══════════════ */
const clockEl = $("#bdayClock");
const pad = n => String(n).padStart(2, "0");
const fmt = ms => { const s = Math.floor(ms / 1000); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
function tickClock() {
  const b = CONFIG.birthday, start = new Date(b.year, b.month - 1, b.day), end = new Date(b.year, b.month - 1, b.day + 1), now = new Date();
  if (now < start) clockEl.textContent = `your birthday begins in ${fmt(start - now)}`;
  else if (now < end) clockEl.textContent = `your birthday has been going for ${fmt(now - start)} ✦`;
  else clockEl.textContent = "";
}
tickClock(); setInterval(tickClock, 1000);

/* ═══════════════ v5 · PHONE TILT (gyroscope moves the arch photo) ═══════════════ */
function enableGyroTilt() {
  if (!isTouch || !window.DeviceOrientationEvent) return;
  const tilt = $(".arch-tilt"), arch = $(".arch");
  const rx = gsap.quickTo(tilt, "rotationX", { duration: .9, ease: "power3" }), ry = gsap.quickTo(tilt, "rotationY", { duration: .9, ease: "power3" });
  let base = null;
  const onTilt = e => {
    if (e.beta == null || e.gamma == null) return;
    if (!base) base = { b: e.beta, g: e.gamma };              // whatever angle she holds the phone at = neutral
    const gx = gsap.utils.clamp(-1, 1, (e.gamma - base.g) / 25), by = gsap.utils.clamp(-1, 1, (e.beta - base.b) / 25);
    ry(gx * 12); rx(-by * 9);
    arch.style.setProperty("--mx", 50 + gx * 40 + "%"); arch.style.setProperty("--my", 30 + by * 40 + "%");
  };
  const start = () => addEventListener("deviceorientation", onTilt, { passive: true });
  // iPhone asks permission (this runs inside the seal tap, so the prompt is allowed)
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission().then(r => r === "granted" && start()).catch(() => {});
  } else start();
  setInterval(() => { base = null; }, 20000);               // slowly re-centre
}

/* ═══════════════ v6 · pause off-screen CSS animations ═══════════════ */
if ("IntersectionObserver" in window) {
  const offIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("is-offscreen", !e.isIntersecting)), { rootMargin: "120px 0px" });
  $$(".hero, .wishes, .cake-section, .finale, .secret").forEach(el => offIO.observe(el));
}

/* ═══════════════ v8 · NOTES WALL (friends' birthday notes, live) ═══════════════ */
const NOTES_API = "/api/messages";
const wallEl = $("#wall"), notesBox = $("#notes"), wallEmpty = $("#wallEmpty"), wallSub = $("#wallSub");
const isLocalHost = /^(localhost|127\.|192\.168\.|10\.|\[::1\])/.test(location.hostname) || location.protocol === "file:";
const seenNotes = new Set();
let wallReady = false, wallFails = 0, wallPoll = null;
const hashNum = str => { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
function agoText(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now"; if (m < 60) return m + " min ago";
  const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  const d = new Date(t); return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function makeNote(n) {
  const el = document.createElement("article"); el.className = "note"; el.dataset.id = n.id;
  el.style.setProperty("--r", ((hashNum(n.id) % 9) - 4) * .55 + "deg");
  el.style.setProperty("--t", ((hashNum(n.id + "t") % 7) - 3) + "deg");
  const p = document.createElement("p"); p.textContent = n.text;                 // always text, never HTML
  const from = document.createElement("span"); from.className = "note-from"; from.textContent = "— " + n.name;
  const time = document.createElement("time"); time.dataset.at = n.at; time.textContent = agoText(n.at);
  el.append(p, from, time);
  if (n.text.length > 320 || (n.text.match(/\n/g) || []).length > 6) {
    el.classList.add("long");
    const more = document.createElement("button"); more.type = "button"; more.className = "note-more"; more.textContent = "read more";
    more.addEventListener("click", () => { const open = el.classList.toggle("open"); more.textContent = open ? "show less" : "read more"; ScrollTrigger.refresh(); });
    p.after(more);
  }
  return el;
}
function renderNotes(list, animate = true, full = false) {
  wallReady = true; const fresh = [];
  if (full) {                                            // remove notes that were deleted
    const keep = new Set(list.map(n => n && n.id));
    $$(".note", notesBox).forEach(el => { if (!keep.has(el.dataset.id)) { seenNotes.delete(el.dataset.id); el.remove(); } });
  }
  list.slice().reverse().forEach(n => {
    if (!n || !n.id || seenNotes.has(n.id)) return;
    seenNotes.add(n.id); const el = makeNote(n); notesBox.prepend(el); fresh.push(el);
  });
  wallEmpty.hidden = seenNotes.size > 0;
  if (seenNotes.size) wallSub.textContent = seenNotes.size === 1 ? "someone wanted to say something today" : `${seenNotes.size} people wanted to say something today`;
  $$("time[data-at]", notesBox).forEach(t => (t.textContent = agoText(+t.dataset.at)));
  if (fresh.length && animate) gsap.from(fresh.reverse(), { autoAlpha: 0, y: 40, scale: .92, stagger: .07, duration: 1, ease: "back.out(1.5)" });
  if (fresh.length) ScrollTrigger.refresh();
}
function wallUnavailable() {
  if (isLocalHost) {                                   // preview on your laptop: explain instead of hiding
    wallSub.textContent = "notes appear here on the live site (they need the Vercel storage)";
    wallEmpty.hidden = false; return;
  }
  wallEl.style.display = "none"; ScrollTrigger.refresh();   // never show her a broken section
}
async function loadNotes() {
  try {
    const r = await fetch(NOTES_API, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    const data = await r.json(); wallFails = 0; const before = seenNotes.size; renderNotes(data.notes || [], wallReady, true);
    if (seenNotes.size < before) ScrollTrigger.refresh();
  } catch (e) {
    if (!wallReady && ++wallFails >= 3) wallUnavailable();
    else if (!wallReady) setTimeout(loadNotes, 3000);
  }
}
loadNotes();
ScrollTrigger.create({                                 // refresh every 15s while she's looking at the wall
  trigger: "#wall", start: "top bottom", end: "bottom top",
  onToggle: st => { clearInterval(wallPoll); if (st.isActive) { loadNotes(); wallPoll = setInterval(loadNotes, 15000); } }
});
gsap.from(".wall .eyebrow, .wall-title, .wall-sub", { autoAlpha: 0, y: 40, stagger: .12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#wall", start: "top 70%" } });

const noteText = $("#noteText"), noteBtn = $("#noteBtn"), noteStatus = $("#noteStatus");
const showCount = (el, out) => { const n = el.value.length; out.textContent = n > 1700 ? `${n} / 2000` : ""; };
noteText.addEventListener("input", () => showCount(noteText, $("#noteCount")));
$("#noteForm").addEventListener("submit", async e => {
  e.preventDefault();
  const text = noteText.value.trim();
  if (text.length < 2) { noteStatus.textContent = "write a little something first ✦"; return; }
  noteBtn.disabled = true; noteStatus.textContent = "pinning…";
  try {
    const r = await fetch(NOTES_API, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: $("#noteName").value, text, website: $("#noteHp").value }) });
    if (r.status === 429) { noteStatus.textContent = "that's a lot of love — try again in a few minutes ♥"; return; }
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    if (data.note) renderNotes([data.note]);
    noteText.value = ""; $("#noteCount").textContent = "";
    noteStatus.textContent = "it's on the wall ✦";
    const b = noteBtn.getBoundingClientRect(); burst(b.left + b.width / 2, b.top, small ? 70 : 110, .7); chime(); buzz(20);
  } catch (err) {
    noteStatus.textContent = isLocalHost ? "notes only work on the live site" : "couldn't pin it — check your connection and try again";
  } finally { noteBtn.disabled = false; }
});
