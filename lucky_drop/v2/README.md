# TECH DROP — NP ICT Experience (v2.0)

**A standalone, one-button, portrait-format arcade game concept for Ngee Ann Polytechnic's School of InfoComm Technology.**

## Run it

Open `index.html` in a modern desktop or mobile browser (Chrome, Edge, or Safari). No internet connection, build step, dependencies, API keys, or installation are required.

For a kiosk, copy the folder to the connected computer, open `index.html`, then use the top-right fullscreen button if the browser and device allow fullscreen mode. For more reliable public installations, configure the browser in its own kiosk mode through the device's administration settings.

## Controls

- Touchscreen / mouse: tap **UNLOCK MY POWER**.
- External USB arcade button: use a **USB HID keyboard encoder** mapped to `Space` or `Enter`.
- Keyboard: Space or Enter starts the round. Inputs during an active round are ignored.
- Top-right buttons: audio mute/unmute and fullscreen.
- Add `?debug` to the URL for development-only controls (skip to reveal, reset, and state reporting). Add `?mute` to start muted.

## The six tech superpowers

AI Architect, Cyber Guardian, Code Creator, Data Detective, Cloud Pilot and UX Inventor.

The game chooses from a shuffled bag so each outcome appears once before the set of six repeats, for a balanced demonstration. Outcomes are **fictional, for fun**; they are neither official course recommendations nor physical prizes.

## Game sequence

1. **Idle:** Animated background, breathing call to action, reactive board.
2. **Launch:** Synthesis sound, glowing launch particle burst.
3. **Play:** Choreographed guided ball trajectories, per-peg glow, bouncing movement, sound, collision rings and sparks, combo labels.
4. **Land:** Colour-coded landing slot, celebratory confetti and CSS gift animation.
5. **Reveal:** Branded overlay with animated particles, orbital emblem, personal tech identity and short message.
6. **Auto reset:** The game resets to idle after roughly 11 seconds total, ready for the next person.

## Design / architecture

- Reference coordinate system: 540 × 960 (9:16 portrait).
- Web application: self-contained HTML, CSS and JavaScript with Canvas 2D rendering.
- Uniform visual scaling to available display area; renders sharp on 1080 × 1920 kiosk screens.
- User interface uses standard semantic buttons, keyboard controls, live accessibility announcements and a reduced-motion preference.
- The display uses static pre-rendered board art where possible, plus efficiently animated pegs, particles and glowing ball, with device-pixel-ratio bounds.
- Sound is synthesized through Web Audio after the user interacts; no network access required.
- Game outcome is chosen before animation; trajectories steer to the predetermined slot.
- No backend, telemetry, authentication, personal data, or AI model calls.

## Customisation

Edit the `choices` array inside the JavaScript to rename the six outcomes, messages and colours. Most display styling lives inside the page's `<style>` block. Board and animation timing are configured in `generatePath()`, `update()`, and the CSS transitions.

## Testing performed for this build

- Chromium: complete start → play → reveal → auto reset loop.
- Six consecutive rounds covering each unique outcome.
- Both keyboard controls, mouse double-press guard, and mobile touch.
- Landscape, phone-size and 1080 × 1920 portrait viewports.
- Page-error-free test runs and JavaScript syntax checking.

**Still to validate before a public event:** the actual kiosk computer's GPU/frame rate, physical-button encoder, browser fullscreen policy, audio output level, accessibility review and long-duration unattended soak testing. This is a high-fidelity **prototype**, not certified production software.

## Brand and content notice

Original concept artwork and original ICT lettermark were created for this prototype. **It does not include or replicate NP's official logo.** The use of official Ngee Ann Polytechnic marks and public deployment of a branded activation should be cleared with the relevant institutional team. Tech identities are illustrative, not officially endorsed programme names.
