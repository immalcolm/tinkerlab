# Tech Drop 5.0 recovery implementation plan

Goal: finish the interrupted flagship arcade work against the user's original brief and the audit they approved with “fix it all up”.

Architecture: preserve the standalone authoritative CCD engine and offline HTML distribution. Improve Canvas 2D in stages; compare a locally bundled PixiJS 8 prototype using the same trajectory before deciding on migration. Keep all changes on `feat/tech-drop-5.0-flagship`.

Design: deep navy chamber (#050C1B), brushed titanium (#6289AB), white specular light (#F4F7FF), neutral launch energy (#D8FF3E), cyan circuits (#73F4FF). Existing condensed display type carries the arcade identity; readable system sans carries visitor copy. Quiet rails frame a dominant board. Only reveal scenes use outcome colours. Neural construction, shield tessellation, compiled geometry, converging data, distributed routing and fluid interfaces each get their own motion grammar.

Constraints: no v1/v2 changes; no second physics engine; no artificial steering or result selection in discovery; no network needed during play; no merge to main. Hardware performance claims require hardware measurements.

## Tasks

- [x] 1. Physics: reproduce incomplete landings with failing tests; fix swept divider broadphase and capsule sides; remove nonphysical velocity overrides; record exact final floor contact, explicit completion and physical contact points. Revalidate deterministic replay and regenerate naturally landing demonstration seeds. Run 10,000 seeds and geometry intersection checks.
- [x] 2. Safeguards: browser regressions for immediate mute, voice budget, reduced motion, input focus, settings persistence, preset resizing and full display resolution. Restore safeguards and operator effects control; keep quality independent of physics.
- [x] 3. Composition/materials/impacts: resolve launcher overlap and collector truncation; cache sharp peg materials, neutral ball reflections, directional contact sparks and energy propagation. Capture 1080×1920 stage comparisons.
- [x] 4. Choreography/reveals: neutral final approach; localized landing → rising core → overload → six distinct canvas scenes → readable photo moment. Preserve one-button/reset/offline input. Test all six complete rounds and touch/keyboard.
- [x] 5. Renderer evidence: build offline Canvas/Pixi trajectory comparison, measure matching scenes, document visual, pacing, bundle and fallback tradeoffs. Select measured production approach.
- [x] 6. QA/delivery: run full tests, repeated natural rounds, 1080/4K/mobile/landscape presets; capture before/after and record a full round with audio where possible; update README/audit with exact environment and limitations; review, commit and create review PR, never merge.

## Review focus

- Timeouts must never become valid collector results.
- Divider sides must prevent crossing collectors after capture entry.
- Muting must silence already scheduled musical notes.
- Reduced motion must affect canvas effects and remain readable.
- Display enlargement must produce a matching backing resolution within preset budgets.

## Progress / decisions

- Initial evidence: 73/1000 QA seeds and 80/1000 benchmark seeds time out before the floor, masked by sampled duration tests.
- Root cause reproduced in an in-memory experiment: divider broadphase ignores combined radii; moving collisions outside that reject eliminates the 73 stuck cases.
- Removing inherited downward kicks and chatter steering yields natural drops averaging 7.21 seconds (500 seeds), maximum 10.61 seconds. Use physical duration and a generous explicit timeout rather than compressing every drop to 4.5 seconds.
- Work in the current feature checkout to preserve the interrupted uncommitted implementation. User already authorized this recovery; no new worktree or design approval needed.

## Final verification — 21 October 2026

All six implementation/QA tasks completed. Full suite, 10k seeds/replays/geometry, independent 1k benchmark, 30 complete browser rounds, corrected matching-display Canvas/Pixi comparison and 1080 portrait recording with audio passed. Source/distribution consistency and protected v1/v2 scope verified. Final review defects were reproduced and fixed with browser regressions; details, evidence, renderer decision and deferred graph-edge polish are in `docs/TECH_DROP_5_AUDIT.md`. Deliver as a feature-branch review PR; do not merge main.
