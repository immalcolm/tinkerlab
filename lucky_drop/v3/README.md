# TECH DROP 3.5 — Ngee Ann Polytechnic School of InfoComm Technology Edition

> **DISCOVER YOUR TECH SUPERPOWER**  
> An elite, single-button, portrait-oriented interactive arcade experience created for Ngee Ann Polytechnic School of InfoComm Technology (NP ICT) Open House events, school roadshows, and interactive tech exhibitions.

Artwork is an original demonstrator theme and does not reproduce official trademark logos without authorization. It is an engagement prototype, not an admissions assessment or prize-lottery system.

---

## What's New in Version 3.5

- **Next-Gen Deterministic Physics Engine**: Replaced artificial magnetic attractors with continuous collision detection (CCD) at 240Hz sub-stepping. Features real contact normals, restitution, spin/torque transfer, and natural ballistics.
- **Curated Natural Seed Bank**: 100% natural, unmanipulated physics flight for all 6 superpower outcomes during forced QA demonstrations, while live play enjoys authentic free-flight drops.
- **Procedural Web Audio Engine**: Velocity-sensitive impacts, positional stereo panning, transient noise bursts + 808 sub-punch, polyphony voice limiter (max 7 voices), and 6 distinct musical victory fanfares. Zero external audio CDN dependencies.
- **Six Custom Vector SVG Emblems**: Replaced text glyphs with high-tech SVG emblems:
  - **AI Architect** (`#DEFF52`) — Neural Network Constellation
  - **Cyber Guardian** (`#66F4EF`) — Shield & Cryptographic Lattice
  - **Code Creator** (`#B69CFF`) — Computational Brackets & Core
  - **Data Detective** (`#FFBF77`) — Concentric Radar & Constellation
  - **Cloud Pilot** (`#83B5FF`) — Distributed Node Mesh
  - **UX Inventor** (`#FF86C8`) — Fluid Interaction Surface
- **High-Impact Real-Time VFX**: Neural pulse illumination propagating across connected neighbor pegs, pre-rendered specular pegs, additive particle pooling, expanding shockwave rings, and dynamic camera recoil.
- **Performance Diagnostics HUD**: Activate with `Shift + F` or `?fps=1` to view live FPS, smoothed FPS, 1% low FPS, real-time frame time graph, active particle count, and DPR.
- **Operator Configuration & Kiosk UX**: Automatic reset countdown, protected input debounce (Space, Enter, Touch, USB HID Arcade Button), fullscreen mode, and 9:16 portrait scaling.

---

## Playing the Installation

1. Open `index.html` in Chrome, Edge, Safari or modern browser. No web server or internet connection is required.
2. Select the **fullscreen** icon (top right) for dedicated kiosk displays.
3. Press **UNLOCK MY POWER**, tap the touchscreen, or press **Space** / **Enter** on a connected keyboard or USB arcade button.
4. Watch the ball drop through the quantum peg chamber, capture the tech core, and reveal your tech superpower.
5. The screen automatically resets after the countdown for the next visitor.

### Operator & Developer Shortcuts

- `Shift + F`: Toggle Performance Diagnostics HUD (FPS, 1% low, frametime graph).
- `Shift + D` or `?debug`: Open Developer QA Panel (force specific outcomes, skip transitions, force reset).
- `?fps=1`: Start with Performance HUD enabled.
- `?mute=1`: Start with audio muted.
- `?lite=1` / `?quality=low`: Force low-power graphics preset for older kiosk hardware.
- `window.__techDropQA.snapshot()`: Programmatically inspect current state, FPS, particles, and physics metrics.

---

## Build Pipeline

Source files are split for development:
- `game.js`: Core physics, audio synthesis, VFX, and state logic
- `style.css`: Visual design system and responsive styling
- `index.template.html`: HTML structure template with placeholders

To recompile the standalone `index.html`:
```bash
npm run build
```

Or using Node directly:
```bash
node scripts/build_v3.js
```

---

## Automated QA Testing

Run the full Headless Chrome test suite:
```bash
npm run test:v3
```
Verifies full game rounds, auto-reset, keyboard Space/Enter triggers, Shift+F HUD toggles, all 6 outcomes with custom emblems, and 200 deterministic simulations.
