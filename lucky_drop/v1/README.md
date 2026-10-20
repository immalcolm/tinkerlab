# Lucky Drop — One-Button Arcade Prototype

A self-contained, offline-capable portrait arcade demo inspired by the supplied WOW 2026 event video.

## Start the game

1. Open **index.html** in a current browser (Chrome, Edge, Firefox, or Safari).
2. Press **PRESS TO PLAY**, **Space**, or **Enter**.
3. Watch the ball descend through illuminated pegs. A gift pops out, a prize message appears, and the board resets automatically after ~5 seconds on the result screen.
4. Repeat.

No server, package manager, build step, internet connection, or external assets are required.

## Physical arcade button

Use a normally-open momentary pushbutton wired to a **USB HID keyboard encoder**. Configure the encoder to send **Space** or **Enter** on a press. Connect the encoder to the kiosk computer. The touchscreen and physical arcade button then invoke the same guarded start action. The game ignores repeated presses while a round is active.

## Fullscreen exhibition setup

- Use a **portrait 9:16 display**, ideally 1080 × 1920 or 2160 × 3840, driven by a computer with a modern browser.
- Open index.html, then click the fullscreen icon in the top-right corner. Browser or managed-kiosk fullscreen can also be used.
- For public deployment, configure OS auto-login, an appropriate kiosk browser policy, prevent sleep, and test touch calibration and keyboard encoder mapping.
- On displays with other aspect ratios, the app letterboxes rather than stretches to preserve the board geometry.

## How this prototype works

- Canvas 2D renders an animated layered blue board, geometric texture, reflective pegs, a luminous bouncing ball, glow, collision particles, and confetti.
- A deterministic sequence of peg waypoints is built for every round, with modest path variation and a randomly selected visual landing slot. The path *simulates* bounces; there is no real-time rigid-body physics.
- CSS animates the tactile start button, gift, blur and result screen.
- Web Audio synthesizes launch, collision and winning sounds. Audio begins on user interaction and can be muted.
- The state machine runs `idle → playing → gift → result → idle`. No backend or networking.

## Important demo limitation

**This is a visual game prototype, not a production prize distribution system.** Every round displays a win message. There is no authentication, ticket validation, inventory, one-time redemption, fraud protection, or genuinely issued prize. Do not use it to award real prizes without a separate backend service and event-specific rules.

## Configuration points

In the inline JavaScript in `index.html`:

- `W` and `H` define the fixed logical board at 540 × 960 (9:16).
- `pegs` row generation controls peg count and spacing.
- `createPath()` controls drop trajectory and timing. It takes approximately 5–6 seconds.
- `endDrop()` controls the gift phase; `showResult()` controls the win transition.
- The result countdown is controlled in `update()` (currently 5 seconds).
- Colors, copy and visual presentation are configured in the embedded CSS and `buildBackground()`.

## Browser QA already performed

- Chromium 540 × 960: screenshots of idle, play, gift, and result; zero JavaScript errors.
- Chromium 390 × 844 and 1280 × 720: verified 9:16 scaling, Space / Enter support, visible prize reveal, automatic reset, and a second game started by click; zero JavaScript errors.
- **Not yet tested on an actual touchscreen, arcade-button encoder, or final kiosk hardware.** Perform hardware and extended-run acceptance testing before a live event.
