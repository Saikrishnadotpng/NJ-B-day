BIRTHDAY WEBSITE
================

Folder
  index.html      the page
  style.css       all the design
  script.js       animations, particles, fireworks, music
  assets/         photos, bundled fonts, and the animation libraries
                  (GSAP + Lenis), so it works fully offline

1. PERSONALISE (2 minutes)
   Open script.js. At the very top is CONFIG:
     name    -> her name (hero, envelope, letter, finale, tab title)
     from    -> your sign-off
     letter  -> the paragraphs of the letter
     intro   -> the dark opening lines shown one by one before the seal
     secret  -> the message hidden under the gold scratch card
   Other copy (the quote, the sea line, the 4 wishes, the finale line)
   is plain text in index.html.

   VOICE NOTE (the strongest thing you can add):
   Record yourself on your phone, convert/save it as an .mp3, name it
   voice-note.mp3 and drop it into the assets folder. A "hear it from me"
   button appears under the letter automatically. No file = no button.

2. PREVIEW (use a local server)
   In this folder run:  npx serve     then open http://localhost:3000
   Tap the gold seal. Scroll slowly. Tap the candle near the end.
   Test on your phone too: open the "Network" address npx serve prints.

3. SEND IT AS A LINK (free, ~2 minutes)
   Netlify Drop: go to app.netlify.com/drop and drag this whole folder in.
   You get a link like https://something.netlify.app to send her.
