# TinkerLab

Small experiments. Big ideas. A collection of creative coding projects by Malcolm.

[Live portfolio](https://immalcolm.github.io/tinkerlab/) · [Tech Drop](https://immalcolm.github.io/tinkerlab/lucky_drop/v3/)

## TECH DROP 5.0 — NP ICT

A one-button technology discovery arcade for Ngee Ann Polytechnic School of InfoComm Technology exhibitions. Drop a luminous ball through 90 chrome pegs, follow its physical landing, then discover one of six identities: AI Architect, Cyber Guardian, Code Creator, Data Detective, Cloud Pilot or UX Inventor.

- One authoritative 240Hz swept-circle CCD simulation, with peg normals, friction, spin, rounded collector dividers and exact swept floor contact. Deterministic tracks are recorded at 120Hz and played at their physical duration.
- Discovery uses natural initial conditions; demonstration uses validated naturally landing seeds. Neither mode steers the ball. Incomplete simulations cannot become results. Natural outcomes are not equally distributed.
- Neutral flight colour, directional contact sparks and bounded peg pulses lead into landing → rising core → six distinct canvas reveal scenes → a still photo moment. The photo window defaults to five seconds and can be set to 3–15 seconds.
- Generated Web Audio: layered launch bass, velocity-sensitive contact tones and noise, spatial panning, a compressor, a 12-voice budget and six fanfares. Mute silences scheduled sounds; reset clears voices and effects.
- Display-aware Canvas 2D backing resolution, cached peg materials, High/Medium/Low/Auto quality, reduced-motion support and operator effects intensity.
- Touch, mouse, Space, Enter and Z input; Space/Enter USB HID buttons work as keyboard input. Native controls retain their own keyboard behavior. Hidden results/settings are inert, and the settings dialog wraps keyboard focus.
- Event, sound, quality, effects and reset settings persist in local storage when available; HUD visibility is session-only. Automatic reset can be disabled for a visible Play again button. The optional NP course link is off by default and requires internet when opened.

The production game is the standalone **`lucky_drop/v3/index.html`**. Open that file directly or serve it from a static host. Play needs no CDN, server or external sound files. The repository directory is still named `v3` to preserve existing links; the visible release is 5.0. The v1 and v2 experiments are preserved.

## Operator controls

| Control | Action |
| --- | --- |
| Big button, Space, Enter or Z | Launch from idle; Space/Enter/Z reset a displayed result |
| Sound button | Mute/unmute, including during a result |
| Settings button or Shift+O | Event text, Discovery/Demonstration, photo duration, sound, quality, effects and reset |
| Escape | Close settings |
| Fullscreen button | Request browser fullscreen |
| Shift+F or `?fps=1` | Performance HUD |
| Shift+D | Developer panel with curated outcome selection, skip and reset |
| `?quality=high`, `medium`, `low` or `auto` | Override saved quality |
| `?mute=1` | Start muted |

High allows up to 4× logical backing resolution, Medium caps at 1.5× and Low at 1×. Auto starts at High and adapts with hysteresis. Quality changes affect rendering only. HUD **1% low FPS** is 1000 divided by the mean of the slowest 1% frame times in its rolling 240-frame window; p99 frame time is a separate diagnostic.

## Development

Use Node.js 22.12+ (matching the browser tooling dependency), npm and Chrome/Chromium. Tests default to the macOS Chrome path; the main browser suite also accepts `CHROME_BIN` or `PUPPETEER_EXECUTABLE_PATH`. The safeguards script accepts `CHROME_PATH`; capture/measurement/recording accept `CHROME_BIN`. Recording additionally requires ffmpeg at `/opt/homebrew/bin/ffmpeg`.

```sh
npm ci
npm run build
npm test
npm run benchmark
```

Build inputs are `index.template.html`, `style.css`, `physics_engine.js`, `reveal_engine.js` and `game.js`. Rebuild after editing them; the test suite checks exact source/distribution consistency.

`npm test` runs 10,000 seeds with deterministic replays and sampled geometry checks, the homepage suite, browser state/input/layout/outcome checks and focused safeguards. The shorter reset stress test deliberately skips animation; the full natural-round capture is separate:

```sh
node scripts/capture_v3.js     # 30 complete rounds; writes screenshots and qa/rounds.json
node scripts/measure_v3.js     # run alone; Canvas/Pixi laboratory and production presets
node scripts/record_v3.js      # run alone; portrait MP4 with direct Web Audio capture
```

Keep those browser jobs sequential so recording/capture does not distort performance measurements. The laboratory uses a local development-only PixiJS dependency; production remains Canvas 2D. See [the audit and renderer decision](docs/TECH_DROP_5_AUDIT.md) for measured evidence, scope and limitations. Evidence is saved under `lucky_drop/v3/qa/`.

## Earlier experiments

- **Tech Drop 2.0** — NP ICT Plinko prototype with gift capture and kiosk scaling (`lucky_drop/v2/`).
- **Lucky Drop 1.0** — original peg-drop experiment (`lucky_drop/v1/`).
