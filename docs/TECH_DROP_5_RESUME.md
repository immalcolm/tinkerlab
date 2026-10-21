# Tech Drop 5.0 — verified and ready for review

Updated 21 October 2026. Branch: `feat/tech-drop-5.0-flagship`.

Recovery implementation and QA are complete. Deliver through a review PR; **never merge main automatically**. v1/v2 remain unchanged.

- Fixed swept divider collisions, natural trajectories, explicit incomplete results and exact swept floor contact. Landing X/time are independent of recording cadence.
- Preserved sharp display scaling, chrome pegs, neutral flight energy, directional effects, six distinct reveal scenes, a still photo window, generated audio and kiosk safeguards.
- Final fresh review found settings/reset focus, live-result manual replay and operator HUD checkbox defects. All three have failing-then-passing browser regressions and are fixed.
- Full `npm test` passed after the final production changes: 10,000 natural seeds and exact replays, sampled geometry, curated seeds, homepage, browser flows, keyboard/focus/touch safeguards and responsive layouts. Independent 1,000-seed benchmark passed.
- **30/30 complete real-time rounds passed**, all six scenes, exact floor landings, clean voice/particle/pulse resets, zero page errors and zero HTTP(S) requests. `lucky_drop/v3/qa/rounds.json` is the complete result, not an interrupted run.
- Canvas/Pixi comparison reran alone after correcting Pixi autoDensity's mismatched CSS display footprint. Assertions now verify equal displayed dimensions at 1080×1920 and 2160×3840. Corrected measurements are in `qa/performance.json`; all lab and production 1% lows were approximately 59.52 FPS on the Apple M4 Pro development host. **No target kiosk performance claim.** Production remains offline Canvas 2D.
- Final MP4: `qa/tech-drop-5.0-full-round.mp4`, 17.6 seconds, portrait 1080×1920 at 30fps, synthesized AAC audio, visible idle reset. Decoded without errors; audio peak −5.6dB. Probe/check JSON and extracted frames are saved alongside it.
- Updated README, critical audit, renderer decision, six-outcome contact sheet and homepage previews. Optional reveal graph-edge masking is deferred; target hardware, actual speakers/latency and exhibition-duration soak testing remain deployment checks.

Detailed record: [audit and renderer decision](TECH_DROP_5_AUDIT.md). Implementation plan: [recovery plan](superpowers/plans/2026-10-21-tech-drop-recovery.md).

## Reproduce

`npm run build`; `npm test`; `npm run benchmark`.

Run browser evidence jobs sequentially: `node scripts/capture_v3.js`, `node scripts/measure_v3.js`, `node scripts/record_v3.js`. Chrome must be allowed outside the sandbox; ffmpeg is required for recording. Intermediate WebM streams stay local and are ignored; the muxed MP4 is delivery evidence.
