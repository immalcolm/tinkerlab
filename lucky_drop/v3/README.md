# TECH DROP 3.0 — Ngee Ann Polytechnic ICT edition

A premium, single-button, portrait-oriented interactive arcade web prototype for the Ngee Ann Polytechnic School of InfoComm Technology. The artwork is an original theme and **does not reproduce the official NP or ICT logo**. It is a demonstrator, not an official marketing deployment, prize-awarding system, or admissions assessment.

## Play

1. Open **index.html** in the current version of Chrome, Edge, or another modern browser. No server or internet connection is required.
2. Select the **fullscreen** icon at the top right when running at an exhibition.
3. Press the large **UNLOCK MY POWER** button, tap the touchscreen, or press **Space** / **Enter** on a keyboard.
4. Watch the simulated ball bounce through the peg chamber, collect the tech core, and reveal one of six ICT-themed identities. The screen resets itself automatically.
5. The sound button toggles synthesized Web Audio effects. Audio begins after the first user interaction to respect browser autoplay policies.

**A physical arcade button** can connect via a USB HID keyboard encoder mapped to Space or Enter. Install the browser into dedicated kiosk mode on the event computer to prevent visitors from leaving the experience. This prototype has not yet been tested with the user's actual arcade hardware.

## What changed versus v2

- Completely restyled typographic hero and display overlays.
- Fixed-step circular-peg collision simulation recorded into a deterministic, frame-rate-independent animation path; configurable magnetic guidance steers outcomes to matching collector bins without sudden slot switches.
- Impact-driven reactions: peg lighting, physical ball squeeze/stretch, plasma-like trails, sparks, ripples, haptic-style screen movement, and synthesized colliding sound effects.
- Original **TECH CORE UNLOCKED** capture rather than a generic gift box.
- Cinematic poster-style reward screen with a kinetic orbital emblem, individual accent palettes, confetti, personal copy and readable reset countdown.
- Six rotating discoveries: AI Architect, Cyber Guardian, Code Creator, Data Detective, Cloud Pilot, UX Inventor.
- Guarded touch/mouse/Space/Enter input, including keyboard hold/repeat lockout, automatic reset, and accessibility live region.
- Offline standalone HTML, no CDN dependencies, modern responsive 9:16 kiosk scaling, and a lighter performance setting.

## Developer controls

- `index.html?debug` — show QA panel: force one of six outcomes, skip the animation, or reset at any time.
- `index.html?mute` — start silently (sound can be enabled using the UI).
- `index.html?lite` — reduce particles and pixel density for older kiosk hardware.
- `window.__techDropQA.snapshot()` — inspect current state, collisions, predicted landing, round number and particle count in the browser console.

Source code is split into **game.js** and **style.css** for editing, and also inlined into **index.html** for easy offline sharing. **index.template.html** contains build placeholders for rebuilding the standalone file.

Rebuild after editing the split sources:

```python
from pathlib import Path
p = Path('.')
template = (p/'index.template.html').read_text()
(p/'index.html').write_text(template.replace('__CSS__',(p/'style.css').read_text()).replace('__JS__',(p/'game.js').read_text()))
```

## Notes before public deployment

- Confirm NP School of InfoComm Technology copy and obtain official branding permission if using the official NP/ICT logo.
- Test touchscreen drivers, the physical arcade button, actual screen orientation, audio levels, browser kiosk configuration and continuous operation onsite.
- The outcomes are fictional, playful tech archetypes. No physical prizes or academic programme placement are awarded by this version.
- If awarding real prizes, add server-side prize inventory, tamper-resistant outcome selection and one-time redemption tracking.
