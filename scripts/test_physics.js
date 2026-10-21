const assert = require('node:assert/strict');
const P = require('../lucky_drop/v3/physics_engine.js');
const fs = require('node:fs');
const vm = require('node:vm');

// Recording is observational: denser/sparser samples must never alter floor contact.
const source = fs.readFileSync(require.resolve('../lucky_drop/v3/physics_engine.js'), 'utf8');
assert.ok(source.includes('step % 2 === 0'), 'locate the production recording cadence');
for (const cadence of [1, 4]) {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source.replace('step % 2 === 0', `step % ${cadence} === 0`), context);
  for (const seed of [148503, 50274, 1007]) {
    const baseline = P.simulateTrajectory(seed);
    const alternate = context.module.exports.simulateTrajectory(seed);
    assert.equal(alternate.landingX, baseline.landingX, `seed ${seed}: floor X depends on recording cadence ${cadence}`);
    assert.equal(alternate.duration, baseline.duration, `seed ${seed}: contact time depends on recording cadence ${cadence}`);
    assert.equal(alternate.slot, baseline.slot);
  }
}

// These seeds stalled above a divider while the old tests reported successful landings.
for (const seed of [50274, 50411, 51918, 52055, 52877]) {
  const run = P.simulateTrajectory(seed);
  assert.ok(run.landingY >= 812, `seed ${seed} stopped at y=${run.landingY} before floor 812`);
  assert.equal(run.completed, true);
  assert.deepEqual(run.trajectory.at(-1).x, run.landingX);
  assert.deepEqual(run.trajectory.at(-1).y, run.landingY);
}
const timeout = P.simulateTrajectory(50274, { maxDuration: 0.1 });
assert.equal(timeout.completed, false, 'an unfinished drop must explicitly report incomplete');
assert.equal(timeout.slot, null, 'an unfinished drop must never assign a result');

const count = Number(process.env.PHYSICS_SEEDS || 10000);
let minDuration = Infinity, maxDuration = 0, totalImpacts = 0;
const slots = [0, 0, 0, 0, 0, 0];
for (let i = 0; i < count; i++) {
  const seed = 50000 + i * 137;
  const run = P.simulateTrajectory(seed);
  assert.ok(run.completed, `seed ${seed} timed out at ${run.landingY}`);
  assert.equal(run.landingY, 812, 'floor contact must be exact, with no overshoot');
  assert.ok(run.landingX >= 44.5 && run.landingX <= 495.5);
  const replay = P.simulateTrajectory(seed);
  assert.deepEqual(replay, run, `seed ${seed} replay diverged`);
  for (const point of run.trajectory) {
    assert.ok(Number.isFinite(point.x + point.y + point.spin));
    for (const peg of P.PEGS) {
      assert.ok(Math.hypot(point.x - peg.x, point.y - peg.y) >= 22.5 - 0.15,
        `seed ${seed} penetrated peg ${peg.index}`);
    }
    for (const divider of P.DIVIDERS) {
      const cy = Math.max(divider.yTop, Math.min(divider.yBottom, point.y));
      assert.ok(Math.hypot(point.x - divider.x, point.y - cy) >= 18.5 - 0.15,
        `seed ${seed} penetrated divider at ${point.x},${point.y}`);
    }
  }
  for (const hit of run.hits) {
    const peg = P.PEGS[hit.peg];
    assert.ok(Math.abs(Math.hypot(hit.x - peg.x, hit.y - peg.y) - 8) < 0.001,
      'impact effects must originate at the peg surface');
  }
  minDuration = Math.min(minDuration, run.duration);
  maxDuration = Math.max(maxDuration, run.duration);
  totalImpacts += run.impactCount;
  slots[run.slot]++;
}
for (let slot = 0; slot < 6; slot++) {
  for (const seed of P.CURATED_SEEDS[slot]) {
    const run = P.simulateTrajectory(seed);
    assert.ok(run.completed);
    assert.equal(run.slot, slot, `demonstration seed ${seed} landed in wrong slot`);
  }
}
console.log(JSON.stringify({ seeds: count, completed: count, deterministicReplays: count,
  durationRange: [minDuration, maxDuration], averageImpacts: totalImpacts / count, slots }, null, 2));
