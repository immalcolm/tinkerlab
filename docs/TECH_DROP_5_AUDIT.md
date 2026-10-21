# Tech Drop 5.0 recovery audit

## Scope and design

Production remains a standalone offline Canvas 2D/Web Audio game at `lucky_drop/v3/index.html`. The logical board is 540×960; high quality follows the display/device scale up to a 2160×3840 backing canvas. Existing v1/v2 files and routes are preserved. Work is delivered on the feature branch for review; main is not merged.

The experience uses a dark navy chamber, cached brushed chrome pegs, white reflections and neutral lime flight energy. Theme colours appear after physical capture. Each result has its own code-native scene: neural construction, shield lock, compiled geometry, pattern convergence, distributed flight or fluid interfaces. The reveal settles after 2.1 seconds, then holds a configurable photo window (five seconds by default).

## Critical findings and changes

| Finding | Cause and resolution | Verification |
| --- | --- | --- |
| Drops stalled above collector dividers | Divider broadphase omitted combined ball/cap radii; expanded rejection and swept capsule sides prevent missed contacts and crossing collectors. Removed inherited downward velocity kicks and chatter steering. | 10,000 natural seeds, exact deterministic replays, sampled peg/divider intersections, curated demonstration bank |
| Timeouts appeared to be results | Completion previously inferred from track length/time. Only exact floor contact marks completion; unfinished runs have no slot and cannot reveal. | Forced short timeout and natural-seed completion assertions |
| Reported landing depended on recording cadence | Interpolation across recorded frames could span a divider bounce. Floor contact now competes with all other earliest swept collisions within the current substep. | Seed 148503 regression failed with a 0.6333px discrepancy, then passed with identical X and contact time at recording strides 1, 2 and 4 |
| Blurry enlarged board and clipped collector labels | Backing resolution now follows actual display scale within the preset budget; peg materials are cached at that scale; collector names are complete. | Portrait/mobile/landscape screenshots and explicit backing-width checks |
| Flight leaked the future result colour | Ball, impact sparks and peg propagation now remain neutral during flight. | Browser safeguard colour assertion |
| Scheduled sounds survived mute/reset | Master gain immediately gates output; tracked sources are stopped and disconnected, with bounded polyphony and a compressor. | Keyboard result mute, scheduled-voice budget and clean-reset assertions |
| Canvas ignored reduced-motion preference | Canvas shake, recoil, stretch and rings are suppressed; reveal scenes render their settled state and particle density is reduced. CSS animations/transitions are curtailed. | Emulated media preference and browser safeguards |
| Hidden controls and native keyboard conflicts | Hidden settings/results are inert; native buttons retain keyboard activation; settings wrap focus. | Real focus rejection, Tab/Shift+Tab, keyboard sound/skip/reset and manual replay tests |
| Auto-reset stole focus while editing settings | Reset focused the background start button unconditionally. It now preserves focus while the modal is open. | Browser regression: reset while editing, then Space must remain idle |
| Saving manual reset during a result hid replay | Replay/countdown visibility was only applied on reveal. Save now synchronizes both controls immediately. | Browser regression for disabling and enabling auto-reset on the current result |
| Operator HUD checkbox had no effect | Save omitted the checkbox. It now applies through the existing HUD toggle. | Browser show/hide regression |

Natural outcomes are intentionally not uniform. The 10,000-seed test counts are `[1324, 1491, 2152, 2175, 1498, 1360]`; observed physical durations are 2.646465–12.045681 seconds, averaging 52.5148 recorded peg impacts. This validates the tested seed set, not every possible initial condition. Geometry checks inspect recorded points; the swept solvers test the motion segments between simulation samples.

## Validation evidence

- Final `npm test`: PASS after the three review fixes, including 10,000 natural seeds/replays, 1,000 additional browser-suite physics checks, homepage, a complete live round, 30 rapid skipped reset cycles, all six outcome presentations, four layout viewports and focused safeguards. See [test-suite.txt](../lucky_drop/v3/qa/test-suite.txt).
- Independent `npm run benchmark`: 1,000/1,000 complete, zero stuck/out-of-bounds landings; all 30 curated seeds pass. See [physics-benchmark.txt](../lucky_drop/v3/qa/physics-benchmark.txt).
- Final `capture_v3.js`: **30/30 complete real-time rounds**, all six scenes, exact floor contact and clean resets; **zero page errors and zero HTTP(S) requests**. The first six rounds use validated demonstration seeds and include Space, Enter and emulated touch input; the remaining 24 use natural discovery outcomes. See [rounds.json](../lucky_drop/v3/qa/rounds.json). These rounds are separate from the skipped reset stress cycles.
- Updated [six-outcome contact sheet](../lucky_drop/v3/all_six_superpowers.jpg), built from the full-round 1080×1920 photo-moment captures, inspected for title/copy readability and distinct scene silhouettes. Homepage browser tests rerun after replacing the featured thumbnail.
- Stage evidence: [before 4.0](../lucky_drop/v3/qa/before-4.0-1080.png), [5.0 idle](../lucky_drop/v3/qa/after-5.0-1080.png), [playing](../lucky_drop/v3/qa/after-playing-1080.png), [landing](../lucky_drop/v3/qa/after-landing-1080.png), [rising core](../lucky_drop/v3/qa/after-core-1080.png). The old result baseline is a deliberately skipped QA reveal, used for visual comparison only.

- Final [full-round MP4 with audio](../lucky_drop/v3/qa/tech-drop-5.0-full-round.mp4): **17.6 seconds, 1080×1920, H.264 at 30fps, AAC stereo 48kHz**, 2,557,384 bytes. ffmpeg decoded it without errors; audio mean −28.1dB and peak −5.6dB confirm non-silent output below clipping. Its 11.958-second audio stream ends before the silent photo/reset tail. [Probe](../lucky_drop/v3/qa/video-probe.json), [checks](../lucky_drop/v3/qa/video-check.json), [sampled frames](../lucky_drop/v3/qa/video-contact-sheet.jpg) and [final idle frame](../lucky_drop/v3/qa/video-last-frame.png). A 500ms recording tail ensures reset is visible; gameplay timing is unchanged.

Renderer measurements follow below.

## Renderer decision and measured performance

**Keep Canvas 2D for production.** The shared-trajectory laboratory uses the same authoritative seed 1007 track, 90 pegs, cached source textures, 120 sparks and backing resolution. PixiJS 8.22.0 uses WebGL locally, with no runtime CDN. This is a small renderer workload rather than the entire production composition; both implementations execute their own draw submission around the same scene data.

Measured on 2026-10-21T00:15:05.494Z: **Apple M4 Pro, macOS arm64, Chrome/155.0.8059.85**, ANGLE Metal on Apple M4 Pro (driver 26.4.1). Runs were sequential, with no other capture, browser QA or recording job competing. Raw environment, GPU features and all samples' aggregate statistics are in [performance.json](../lucky_drop/v3/qa/performance.json).

| Laboratory backing and display | Renderer | Samples after warmup | Mean frame ms | p99 frame ms | 1% low FPS | Mean CPU submit ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1080×1920 | canvas | 601 | 16.666 | 16.800 | 59.52 | 0.193 |
| 1080×1920 | pixi | 601 | 16.666 | 16.800 | 59.52 | 0.192 |
| 2160×3840 | canvas | 601 | 16.666 | 16.800 | 59.52 | 0.230 |
| 2160×3840 | pixi | 602 | 16.666 | 16.800 | 59.52 | 0.177 |

Both laboratory renderers report about 59.52 FPS 1% low with matching display and backing dimensions. Pixi's mean submission time is 0.001ms lower at 1080p and 0.052ms lower at 4K in this pass; these differences are small relative to the 16.67ms frame budget. A single short pass does not establish a repeatable advantage across production scenes or target hardware.

An initial pass was discarded after screenshot inspection revealed Pixi autoDensity's inline CSS displayed its canvas at half the intended size. A new measurement assertion reproduced the mismatch (540px versus 1080px). Both paths now explicitly set identical CSS dimensions, and the complete isolated measurement job passed those assertions at both sizes. Only the corrected run is reported here.

| Production viewport | Preset | Actual backing | Samples | Mean frame ms | p99 frame ms | 1% low FPS |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 1080×1920 | high | 1080×1920 | 661 | 16.656 | 16.800 | 59.52 |
| 1080×1920 | medium | 810×1440 | 661 | 16.652 | 16.800 | 59.52 |
| 1080×1920 | low | 540×960 | 661 | 16.652 | 16.800 | 59.52 |
| 2160×3840 | high | 2160×3840 | 661 | 16.647 | 16.800 | 59.52 |
| 2160×3840 | medium | 810×1440 | 661 | 16.656 | 16.800 | 59.52 |
| 2160×3840 | low | 540×960 | 661 | 16.648 | 16.800 | 59.52 |

All six production windows ended in the settled photo moment and report about 59.52 FPS 1% low. They cover one curated Cyber round, beginning 700ms after start and sampled for 11 seconds. They do not measure a six-scene worst case, audio latency, GPU completion, memory growth or event-length soak behavior.

The current standalone production HTML is **117,212 bytes**. Pixi's local minified library alone is **840,663 bytes**, before integration code. Pixi could be bundled offline, but would add a renderer dependency, GPU initialization/context-loss paths and a migration to revalidate. The measured production pacing, existing Canvas fallback compatibility and validated source/distribution make Canvas the lower-cost choice for this release. Reconsider a migration if matched target-hardware runs show a material production benefit or the scene workload grows.

Laboratory screenshots: [Canvas](../lucky_drop/v3/qa/renderer-canvas-1080.png) and [Pixi](../lucky_drop/v3/qa/renderer-pixi-1080.png). These show matching visual ingredients on the same looping path; screenshot timestamps are not synchronized for pixel-difference claims.

## Review decisions and limits

- Preserve the existing recovered feature checkout; avoid moving or discarding uncommitted work during recovery.
- Treat the broken HUD checkbox as a functional defect and fix it in the final review pass.
- Keep Canvas 2D production pending renderer evidence. Pixi is a local development dependency only; no runtime CDN or second physics engine was introduced.
- Measurements on this headless development host cannot establish exhibition kiosk performance. Test the target display/GPU and select a lower preset if necessary.
- Production measurements cover one curated Cyber round over an 11-second sampling window per preset/resolution, not all six scenes or worst-case whole-event performance. Mean CPU submission time in the renderer laboratory excludes GPU completion.
- The 1% low FPS statistic is 1000 divided by the mean of the slowest 1% sampled frame times; p99 frame time is reported separately. Headless frame pacing is not an end-user smoothness guarantee.
- Scene graph edges can cross the upper result label. Masking/fading those edges remains optional visual polish; the label and result title remain readable in captured evidence.
- Actual speaker sound, fullscreen permissions, kiosk sleep/power settings, physical arcade hardware and long-duration event soak testing require the deployment environment. The recording verifies captured browser media, not acoustic output from an exhibition installation.
