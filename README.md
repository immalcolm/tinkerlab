# TinkerLab

> **"Small experiments. Big ideas."**  
> *A creative playground for code, creativity and curiosity.*

TinkerLab is a personal collection of experimental web applications, creative coding prototypes, interactive physics simulators, and technology demonstrators developed by Malcolm.

Live GitHub Pages Deployment: [https://immalcolm.github.io/tinkerlab/](https://immalcolm.github.io/tinkerlab/)

---

## Featured Experiments

### 1. TECH DROP 3.5 — NP ICT Edition (`lucky_drop/v3/`)
A cinematic, one-button interactive technology arcade experience developed for the **Ngee Ann Polytechnic School of InfoComm Technology (NP ICT)** for Open House events, school roadshows, and interactive tech exhibitions.

- **Next-Gen Continuous Collision Detection (CCD)**: Fixed-step 240Hz physics simulation with real contact normals, restitution ($e = 0.65$), spin/torque transfer, and natural ballistics.
- **Zero Magnetic Steering**: Pure physical landings determine the discovered superpower identity. Includes a curated bank of 100% natural deterministic seeds for event demonstrations.
- **Procedural Web Audio Synthesizer**: Zero external network or CDN dependencies. Velocity-sensitive impacts, positional stereo panning, transient noise + sub-bass 808 resonators, polyphony limiting (max 7 voices), and 6 unique musical fanfares.
- **High-Impact Real-Time VFX**: Multi-layer pre-rendered glowing pegs, neural pulse illumination propagation across connected neighbor nodes, additive particle pooling, expanding shockwave rings, and dynamic camera recoil.
- **Six Custom Tech Superpowers**: Custom vector SVG emblems and tailored presentations for:
  - **AI Architect** (`#DEFF52`)
  - **Cyber Guardian** (`#66F4EF`)
  - **Code Creator** (`#B69CFF`)
  - **Data Detective** (`#FFBF77`)
  - **Cloud Pilot** (`#83B5FF`)
  - **UX Inventor** (`#FF86C8`)
- **Exhibition Kiosk Ready**: Portrait 9:16 layout with automatic kiosk scaling, input debouncing (Touch, Mouse, Space, Enter, USB HID Arcade Button), and auto-reset countdown.
- **Performance Diagnostics HUD**: Toggleable via `Shift + F` or `?fps=1`, displaying current FPS, smoothed FPS, 1% low FPS, frame-time graph, active particle count, and DPR.

### 2. TECH DROP 2.0 (`lucky_drop/v2/`)
The second-generation Plinko prototype introducing the NP ICT branding theme, gift box capture animations, responsive kiosk scaling, and foundational sound effects.

### 3. Lucky Drop 1.0 (`lucky_drop/v1/`)
The original experimental peg-drop simulation exploring Plinko trajectory mechanics, basic collision detection, and HTML5 Canvas drawing that started the TinkerLab drop series.

---

## Development & Build Pipeline

### Prerequisites
- Node.js (v18+)
- Google Chrome (for automated headless browser testing)

### Install Dependencies
```bash
npm install
```

### Build Standalone Distribution
Recompiles `lucky_drop/v3/index.html` from `index.template.html`, `style.css`, and `game.js`:
```bash
npm run build
```

### Run Automated QA Tests with Headless Chrome
Runs comprehensive automated test suites verifying full round flows, all 6 outcomes, responsive viewports, and 200 deterministic simulations:
```bash
npm test
```

### Run Physics Benchmark
Evaluates continuous collision detection, spin transfer, and seed distribution:
```bash
npm run benchmark
```

---

## Architecture Principles
1. **Zero Runtime Bloat**: Native HTML5, Canvas 2D, and Web Audio API. Fast load times (<15ms), zero npm bundle dependencies in production.
2. **Deterministic Physics**: 120Hz/240Hz sub-stepping guarantees frame-rate independence and 100% reproducible trajectories.
3. **100% Offline & GitHub Pages Compatible**: Self-contained assets and strictly relative paths (`./lucky_drop/v3/`) ensuring flawless operation under GitHub Pages subpaths or offline kiosk environments.