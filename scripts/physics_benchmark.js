// TECH DROP 5.0 — Physics Verification & 1,000-Seed Stress Benchmark
const { simulateTrajectory, PEGS, SLOTS, CURATED_SEEDS } = require('../lucky_drop/v3/physics_engine.js');

console.log('=== TECH DROP 5.0 CCD PHYSICS STRESS BENCHMARK (1,000 SEEDS) ===');
console.log(`Board Specs: ${PEGS.length} Pegs, 6 Slots (width: ${SLOTS[0].maxX - SLOTS[0].minX}px), Floor Y: 812px\n`);

const SEED_COUNT = 1000;
const slotDistribution = [0, 0, 0, 0, 0, 0];
let minImpacts = 999, maxImpacts = 0, totalImpacts = 0;
let minDuration = 999, maxDuration = 0;
let outOfBoundsCount = 0;
let timedOutCount = 0;
const seedBank = [[], [], [], [], [], []];

const startTime = Date.now();

for (let i = 0; i < SEED_COUNT; i++) {
  const seed = 50000 + i * 317;
  const res = simulateTrajectory(seed);

  // 1. Verify physical bounds (BOARD_LEFT = 30, BOARD_RIGHT = 510)
  if (res.landingX < 30 || res.landingX > 510) {
    outOfBoundsCount++;
  }

  // Completion is a floor contact, never merely reaching a duration cutoff.
  if (!res.completed || res.landingY !== 812) {
    timedOutCount++;
  }

  if (res.completed) slotDistribution[res.slot]++;
  minImpacts = Math.min(minImpacts, res.impactCount);
  maxImpacts = Math.max(maxImpacts, res.impactCount);
  totalImpacts += res.impactCount;

  minDuration = Math.min(minDuration, res.duration);
  maxDuration = Math.max(maxDuration, res.duration);

  // Collect candidates for curated seeds per slot
  if (res.completed && res.slotError < 20) {
    seedBank[res.slot].push(res);
  }
}

const elapsed = Date.now() - startTime;

console.log(`Simulated ${SEED_COUNT} diverse runs in ${elapsed}ms (${(elapsed / SEED_COUNT).toFixed(2)}ms per run)`);
console.log('Slot Distribution (0 to 5):', slotDistribution);
console.log(`Average Impacts: ${(totalImpacts / SEED_COUNT).toFixed(1)} collisions per drop (Range: ${minImpacts} to ${maxImpacts})`);
console.log(`Flight Duration Range: ${minDuration.toFixed(2)}s to ${maxDuration.toFixed(2)}s`);
console.log(`Out-of-bounds Landings: ${outOfBoundsCount} / ${SEED_COUNT}`);
console.log(`Stuck / Timed-out Runs: ${timedOutCount} / ${SEED_COUNT}`);
if (outOfBoundsCount || timedOutCount) throw new Error('Physics benchmark failed: incomplete or out-of-bounds drop');

// Verify Curated Seed Bank
console.log('\n--- Verifying Curated Demonstration Seeds ---');
for (let s = 0; s < 6; s++) {
  const seeds = CURATED_SEEDS[s];
  for (const seed of seeds) {
    const res = simulateTrajectory(seed);
    if (res.slot !== s) {
      throw new Error(`Curated seed ${seed} for slot ${s} landed in slot ${res.slot}!`);
    }
    if (res.slotError > 25) {
      throw new Error(`Curated seed ${seed} landing error too high: ${res.slotError}px`);
    }
  }
  console.log(`Slot ${s} curated seeds verified: ${seeds.length} seeds perfectly landing in slot ${s}!`);
}

console.log('\n=== ALL 1,000 CCD PHYSICS STRESS TESTS PASSED! ===');

module.exports = { simulateTrajectory, simulateRun: simulateTrajectory, PEGS, SLOTS, CURATED_SEEDS };
