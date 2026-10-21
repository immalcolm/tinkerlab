/**
 * TECH DROP 5.0 — Authoritative Physics Simulation Engine
 * True Continuous Collision Detection (CCD), Swept Circle Solvers,
 * Contact Normals, Coulomb Friction, Angular Spin Dynamics, and Deterministic Replay.
 *
 * Scaled Flagship Geometry:
 * - Playfield occupies 74.5% of vertical screen space
 * - Large 29px diameter ball (radius 14.5px)
 * - Large 16px diameter pegs (radius 8.0px), 90 pegs across 12 staggered rows
 * - 6 wide collector slots (80px width each)
 * 
 * Works in both Node.js (automated QA & benchmarks) and browser environments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TechDropPhysics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const W = 540, H = 960;
  const PEG_ROWS = 12;
  const BALL_RADIUS = 14.5; // Diameter 29px
  const PEG_RADIUS = 8.0;   // Diameter 16px
  const COMBINED_RADIUS = BALL_RADIUS + PEG_RADIUS; // 22.5px
  const COMBINED_RADIUS_SQ = COMBINED_RADIUS * COMBINED_RADIUS;
  
  const SLOT_COUNT = 6;
  const BOARD_LEFT = 30;
  const BOARD_RIGHT = 510;
  const TOTAL_SLOT_WIDTH = BOARD_RIGHT - BOARD_LEFT; // 480px
  const SLOT_WIDTH = TOTAL_SLOT_WIDTH / SLOT_COUNT;  // 80.0px
  
  // Floor and dividers geometry (74.5% board coverage)
  const FLOOR_Y = 812;
  const DIVIDER_TOP_Y = 750;
  const DIVIDER_BOTTOM_Y = 825;
  const DIVIDER_CAP_RADIUS = 4.0;

  // Build 90-peg array (12 staggered rows: 8 pegs, 7 pegs, 8 pegs...)
  const PEGS = [];
  for (let r = 0; r < PEG_ROWS; r++) {
    const isRowA = r % 2 === 0;
    const cols = isRowA ? 8 : 7;
    const startX = isRowA ? 81 : 108;
    for (let c = 0; c < cols; c++) {
      PEGS.push({
        index: PEGS.length,
        x: startX + c * 54,
        y: 205 + r * 46,
        r,
        col: c,
        id: `${r}-${c}`
      });
    }
  }

  // Pre-calculate slot boundaries and centers
  const SLOTS = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const minX = BOARD_LEFT + i * SLOT_WIDTH;
    const maxX = minX + SLOT_WIDTH;
    SLOTS.push({
      index: i,
      minX,
      maxX,
      centerX: minX + SLOT_WIDTH * 0.5
    });
  }

  // Bin dividers with rounded caps
  const DIVIDERS = [];
  for (let i = 1; i < SLOT_COUNT; i++) {
    DIVIDERS.push({
      x: BOARD_LEFT + i * SLOT_WIDTH,
      yTop: DIVIDER_TOP_Y,
      yBottom: DIVIDER_BOTTOM_Y,
      radius: DIVIDER_CAP_RADIUS
    });
  }

  // Deterministic 32-bit LCG
  function createRng(seed) {
    let s = (seed >>> 0);
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /**
   * Swept Circle vs Static Circle Continuous Collision Detection
   * Finds earliest impact parameter s in [0, 1] along ray p(s) = p0 + s * delta.
   */
  function checkSweptCircle(p0x, p0y, deltax, deltay, cx, cy, radius, radiusSq) {
    const dx = p0x - cx;
    const dy = p0y - cy;
    const distSq = dx * dx + dy * dy;

    // Already overlapping or touching
    if (distSq <= radiusSq) {
      const dist = Math.sqrt(distSq);
      // Exact coincident centres have no geometric normal; oppose incoming motion.
      const speed = Math.hypot(deltax, deltay) || 1;
      return {
        hit: true,
        s: 0,
        nx: dist > 1e-9 ? dx / dist : -deltax / speed,
        ny: dist > 1e-9 ? dy / dist : -deltay / speed,
        overlap: radius - dist
      };
    }

    const A = deltax * deltax + deltay * deltay;
    if (A < 1e-9) return null; // No movement

    const B = 2 * (dx * deltax + dy * deltay);
    const C = distSq - radiusSq;
    const discr = B * B - 4 * A * C;

    if (discr < 0) return null; // Ray misses circle entirely

    const sqrtDiscr = Math.sqrt(discr);
    const s1 = (-B - sqrtDiscr) / (2 * A);

    if (s1 >= 0 && s1 <= 1.0) {
      const hx = p0x + s1 * deltax;
      const hy = p0y + s1 * deltay;
      const hdx = hx - cx;
      const hdy = hy - cy;
      const hdist = Math.sqrt(hdx * hdx + hdy * hdy) || radius;
      return {
        hit: true,
        s: s1,
        nx: hdx / hdist,
        ny: hdy / hdist,
        overlap: 0
      };
    }

    return null;
  }

  /**
   * Curated Natural Seed Bank for Tech Drop 5.0 (90-peg flagship geometry)
   * Pre-validated seeds for Demonstration Mode (100% natural, unmanipulated physics flight).
   * Each seed lands naturally inside its collector. Never steer a live trajectory.
   */
  const CURATED_SEEDS = [
    [1000, 1003, 1007, 1009, 1014],
    [1004, 1010, 1013, 1029, 1030],
    [1005, 1011, 1012, 1018, 1019],
    [1002, 1006, 1008, 1035, 1060],
    [1001, 1017, 1020, 1025, 1049],
    [1023, 1034, 1036, 1073, 1078]
  ];

  /**
   * Run Full Physics Simulation with Continuous Collision Detection
   * @param {number} seed - Deterministic seed for initial conditions and micro-jitter
   * @param {object} options - Optional overrides (e.g. initial offset, max duration)
   */
  function simulateTrajectory(seed, options = {}) {
    const rng = createRng(seed);
    const dt = 1 / 240; // 240Hz sub-step
    const maxSteps = Math.ceil(240 * (options.maxDuration ?? 16));
    const gravity = 1260; // Tuned for punchy weight and acceleration
    const restitutionPeg = 0.65;
    const restitutionWall = 0.55;
    const frictionPeg = 0.22;
    const wallLeft = BOARD_LEFT + BALL_RADIUS;
    const wallRight = BOARD_RIGHT - BALL_RADIUS;

    let x = 270 + (options.initialOffsetX ?? (rng() - 0.5) * 2.2);
    let y = 145; // Launcher release elevation
    let vx = options.initialVx ?? (rng() - 0.5) * 16;
    let vy = 40 + rng() * 20;
    let spin = 0; // Angular velocity in radians/sec

    const hits = [];
    const trajectory = [];
    let consecutiveSamePegCount = 0;
    let lastPegHitIndex = -1;

    simulationLoop: for (let step = 0; step < maxSteps; step++) {
      const t = step * dt;

      // Integrate gravity and aerodynamic drag
      vy += gravity * dt;
      vx *= (1 - 0.035 * dt);
      vy *= (1 - 0.015 * dt);

      let remainingSubStep = 1.0; // Portion of dt remaining in current step
      let iter = 0;

      while (remainingSubStep > 1e-4 && iter < 8) {
        iter++;
        const stepDt = dt * remainingSubStep;
        let deltaX = vx * stepDt;
        let deltaY = vy * stepDt;

        // Check swept collision against all 90 pegs
        let earliestHit = null;
        let hitType = null;
        let hitObject = null;

        for (let i = 0; i < PEGS.length; i++) {
          const p = PEGS[i];
          // Quick vertical and horizontal bounding reject
          if (p.y < Math.min(y, y + deltaY) - COMBINED_RADIUS || p.y > Math.max(y, y + deltaY) + COMBINED_RADIUS) continue;
          if (p.x < Math.min(x, x + deltaX) - COMBINED_RADIUS || p.x > Math.max(x, x + deltaX) + COMBINED_RADIUS) continue;

          const res = checkSweptCircle(x, y, deltaX, deltaY, p.x, p.y, COMBINED_RADIUS, COMBINED_RADIUS_SQ);
          if (res && (!earliestHit || res.s < earliestHit.s)) {
            earliestHit = res;
            hitType = 'peg';
            hitObject = p;
          }
        }

        // Check swept collision against bin dividers
        if (Math.max(y, y + deltaY) + BALL_RADIUS + DIVIDER_CAP_RADIUS >= DIVIDER_TOP_Y) {
          for (let i = 0; i < DIVIDERS.length; i++) {
            const d = DIVIDERS[i];
            const divRadius = BALL_RADIUS + d.radius;
            const divRadiusSq = divRadius * divRadius;
            const res = checkSweptCircle(x, y, deltaX, deltaY, d.x, d.yTop, divRadius, divRadiusSq);
            if (res && (!earliestHit || res.s < earliestHit.s)) {
              earliestHit = res;
              hitType = 'divider';
              hitObject = d;
            }
            // The cap and vertical sides form one capsule. Test the sides too:
            // a cap-only solver allows the ball to cross between collectors.
            if (Math.abs(deltaX) > 1e-9) {
              const nx = deltaX > 0 ? -1 : 1;
              const sideX = d.x + nx * divRadius;
              const sideT = (sideX - x) / deltaX;
              const sideY = y + deltaY * sideT;
              if (sideT >= 0 && sideT <= 1 && sideY >= d.yTop && sideY <= d.yBottom &&
                  (!earliestHit || sideT < earliestHit.s)) {
                earliestHit = { hit: true, s: sideT, nx, ny: 0, overlap: 0 };
                hitType = 'divider';
                hitObject = d;
              }
            }
          }
        }

        // Check side wall boundary swept collision
        if (deltaX < 0 && x + deltaX < wallLeft) {
          const sWall = Math.max(0, (wallLeft - x) / (deltaX || -0.001));
          if (sWall <= 1.0 && (!earliestHit || sWall < earliestHit.s)) {
            earliestHit = { hit: true, s: sWall, nx: 1, ny: 0, overlap: 0 };
            hitType = 'wall_left';
          }
        } else if (deltaX > 0 && x + deltaX > wallRight) {
          const sWall = Math.max(0, (wallRight - x) / (deltaX || 0.001));
          if (sWall <= 1.0 && (!earliestHit || sWall < earliestHit.s)) {
            earliestHit = { hit: true, s: sWall, nx: -1, ny: 0, overlap: 0 };
            hitType = 'wall_right';
          }
        }

        // Resolve the floor in the same sweep as pegs, dividers and walls.
        // Interpolating recorded frames can span a bounce and invent contact X/time.
        if (deltaY > 0 && y + deltaY >= FLOOR_Y) {
          const floorS = (FLOOR_Y - y) / deltaY;
          if (!earliestHit || floorS < earliestHit.s) {
            x += deltaX * floorS;
            y = FLOOR_Y;
            trajectory.push({ t: t + dt - stepDt + floorS * stepDt, x, y, vx, vy, spin });
            break simulationLoop;
          }
        }

        if (earliestHit) {
          // Advance to collision contact point
          const advanceS = Math.max(0, Math.min(1.0, earliestHit.s));
          x += deltaX * advanceS + earliestHit.nx * (earliestHit.overlap || 0.05);
          y += deltaY * advanceS + earliestHit.ny * (earliestHit.overlap || 0.05);

          const nx = earliestHit.nx;
          const ny = earliestHit.ny;
          const tx = -ny;
          const ty = nx;

          // Normal and tangential velocities
          const vn = vx * nx + vy * ny;
          const vt = vx * tx + vy * ty;

          if (hitType === 'peg') {
            const p = hitObject;
            if (p.index === lastPegHitIndex) {
              consecutiveSamePegCount++;
            } else {
              consecutiveSamePegCount = 0;
              lastPegHitIndex = p.index;
            }

            if (vn < 0) {
              // Relative surface velocity at contact: v_rel = vt - BALL_RADIUS * spin
              const vRel = vt - BALL_RADIUS * spin;
              const impulseN = -(1 + restitutionPeg) * vn;

              // Coulomb friction capped by stick condition to prevent velocity/spin blowup
              const maxFrictionStick = Math.abs(vRel) * 0.35;
              const maxFrictionCoulomb = frictionPeg * impulseN;
              const frictionMag = Math.min(maxFrictionStick, maxFrictionCoulomb);
              const impulseT = vRel > 0 ? -frictionMag : frictionMag;

              vx += impulseN * nx + impulseT * tx;
              vy += impulseN * ny + impulseT * ty;

              // Spin momentum transfer opposes relative slip
              spin += (impulseT / (0.5 * BALL_RADIUS));

              // Classify impact energy tier
              const impactSpeed = Math.hypot(vx, vy);
              const force = Math.abs(vn);
              let tier = 1; // Light
              if (force >= 140 || impactSpeed >= 320) tier = 3; // Major
              else if (force >= 55 || impactSpeed >= 140) tier = 2; // Strong

              if (consecutiveSamePegCount <= 1) {
                hits.push({
                  step,
                  t: t + dt - stepDt + advanceS * stepDt,
                  peg: p.index,
                  x: p.x + nx * PEG_RADIUS,
                  y: p.y + ny * PEG_RADIUS,
                  nx,
                  ny,
                  force,
                  speed: impactSpeed,
                  tier
                });
              }
            }
          } else if (hitType === 'wall_left' || hitType === 'wall_right') {
            if (vn < 0) {
              vx = -vn * restitutionWall * nx;
              spin += (hitType === 'wall_left' ? 1 : -1) * vy * 0.03;
            }
          } else if (hitType === 'divider') {
            if (vn < 0) {
              vx -= (1 + 0.5) * vn * nx;
              vy -= (1 + 0.5) * vn * ny;
            }
          }

          // Universal terminal speed & angular spin clamp
          const postSpeed = Math.hypot(vx, vy);
          if (postSpeed > 680) {
            const s = 680 / postSpeed;
            vx *= s;
            vy *= s;
          }
          spin = Math.max(-45, Math.min(45, spin * 0.96));

          // Consume portion of step
          remainingSubStep -= advanceS * remainingSubStep;
        } else {
          // No collision during this sub-step, advance full remaining delta
          x += deltaX;
          y += deltaY;
          remainingSubStep = 0;
        }
      }

      // Record at 120Hz (every 2 sub-steps), plus the exact floor contact above.
      if (step % 2 === 0) trajectory.push({ t: t + dt, x, y, vx, vy, spin });
    }

    // Determine winning slot based on true physical landing X
    const landingX = x;
    const landingY = y;
    const completed = y >= FLOOR_Y;
    const slot = completed ? Math.max(0, Math.min(SLOT_COUNT - 1, Math.floor((landingX - BOARD_LEFT) / SLOT_WIDTH))) : null;
    const targetCenter = completed ? SLOTS[slot].centerX : null;
    const slotError = completed ? Math.abs(landingX - targetCenter) : null;

    return {
      seed,
      completed,
      trajectory,
      hits,
      landingX,
      landingY,
      slot,
      targetCenter,
      slotError,
      duration: trajectory[trajectory.length - 1]?.t || 0,
      impactCount: hits.length
    };
  }

  return {
    W,
    H,
    PEG_ROWS,
    BALL_RADIUS,
    PEG_RADIUS,
    COMBINED_RADIUS,
    SLOT_COUNT,
    BOARD_LEFT,
    BOARD_RIGHT,
    SLOT_WIDTH,
    FLOOR_Y,
    DIVIDER_TOP_Y,
    DIVIDER_BOTTOM_Y,
    PEGS,
    SLOTS,
    DIVIDERS,
    CURATED_SEEDS,
    slotCenter: i => BOARD_LEFT + (i + 0.5) * SLOT_WIDTH,
    checkSweptCircle,
    simulateTrajectory
  };
});
