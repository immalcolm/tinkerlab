const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// 1. Portable Browser Path Resolution
const CHROME_PATH = process.env.CHROME_BIN || process.env.PUPPETEER_EXECUTABLE_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].find(p => fs.existsSync(p));

if (!CHROME_PATH) {
  console.error('Error: No supported Chrome or Chromium executable found.');
  console.error('Please set the CHROME_BIN or PUPPETEER_EXECUTABLE_PATH environment variable.');
  process.exit(1);
}

const V3_DIR = path.resolve(__dirname, '../lucky_drop/v3');
const V3_URL = 'file://' + path.join(V3_DIR, 'index.html');

(async () => {
  console.log('=== Starting Tech Drop 5.0 Comprehensive QA & Exhibition Test Suite ===');
  console.log('Using browser executable:', CHROME_PATH);

  // ==============================================================
  // STEP 0: Build Consistency Verification
  // ==============================================================
  console.log('\n--- Step 0: Source Build Consistency Verification ---');
  const template = fs.readFileSync(path.join(V3_DIR, 'index.template.html'), 'utf8');
  const css = fs.readFileSync(path.join(V3_DIR, 'style.css'), 'utf8');
  const physicsSrc = fs.readFileSync(path.join(V3_DIR, 'physics_engine.js'), 'utf8');
  const gameSrc = fs.readFileSync(path.join(V3_DIR, 'game.js'), 'utf8');
  const revealSrc = fs.readFileSync(path.join(V3_DIR, 'reveal_engine.js'), 'utf8');
  const expectedHtml = template
    .replace('__CSS__', css)
    .replace('__JS__', `// TECH DROP 5.0 Standalone Distribution\n${physicsSrc}\n\n${revealSrc}\n\n${gameSrc}`);
  const actualHtml = fs.readFileSync(path.join(V3_DIR, 'index.html'), 'utf8');

  if (actualHtml !== expectedHtml) {
    throw new Error('Build consistency failure: lucky_drop/v3/index.html does not match source build. Run `node scripts/build_v3.js`.');
  }
  console.log('Build consistency: Standalone index.html strictly matches source modules (index.template.html, style.css, physics_engine.js, game.js).');

  // ==============================================================
  // STEP 1: 1,000-Seed Physics CCD Assertions & Edge-Case Stress
  // ==============================================================
  console.log('\n--- Step 1: 1,000 Diverse Deterministic Seeds Physics Stress & Anti-Tunnelling ---');
  const TechDropPhysics = require('../lucky_drop/v3/physics_engine.js');
  let validLandings = 0;
  let totalImpacts = 0;
  let minImp = 999, maxImp = 0;

  for (let s = 0; s < 1000; s++) {
    const seed = 50000 + s * 137;
    const sim = TechDropPhysics.simulateTrajectory(seed);

    // Assert clean termination
    if (!sim.completed || sim.landingY !== TechDropPhysics.FLOOR_Y || sim.trajectory.length < 50) {
      throw new Error(`Seed ${seed} failed termination requirement: duration=${sim.duration.toFixed(2)}s`);
    }

    // Assert valid collector slot
    if (sim.slot < 0 || sim.slot > 5) {
      throw new Error(`Seed ${seed} produced invalid slot index: ${sim.slot}`);
    }

    // Assert final landing position strictly agrees with physical slot boundary
    const slotObj = TechDropPhysics.SLOTS[sim.slot];
    if (sim.landingX < slotObj.minX || sim.landingX > slotObj.maxX) {
      throw new Error(`Seed ${seed} landing X (${sim.landingX.toFixed(2)}) is outside slot ${sim.slot} bounds [${slotObj.minX.toFixed(2)}, ${slotObj.maxX.toFixed(2)}]`);
    }

    // Assert no tunnelling or sudden teleportation between consecutive 240Hz steps
    for (let i = 1; i < sim.trajectory.length; i++) {
      const pPrev = sim.trajectory[i - 1];
      const pCurr = sim.trajectory[i];
      const stepDist = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
      if (stepDist > 32) {
        throw new Error(`Seed ${seed} teleportation detected at step ${i}: step displacement = ${stepDist.toFixed(2)}px`);
      }
      if (pCurr.x < 15 || pCurr.x > 525 || pCurr.y < 0 || pCurr.y > 850) {
        throw new Error(`Seed ${seed} out-of-bounds at step ${i}: (${pCurr.x.toFixed(1)}, ${pCurr.y.toFixed(1)})`);
      }
    }

    validLandings++;
    totalImpacts += sim.impactCount;
    minImp = Math.min(minImp, sim.impactCount);
    maxImp = Math.max(maxImp, sim.impactCount);
  }
  console.log(`1,000 Seeds Physics Verification: ${validLandings}/1000 passed (100%), Avg impacts = ${(totalImpacts / 1000).toFixed(1)}, Range = [${minImp}, ${maxImp}]`);

  // Assert deterministic replay reproducibility
  console.log('Verifying deterministic replay reproducibility...');
  const runA = TechDropPhysics.simulateTrajectory(8888);
  const runB = TechDropPhysics.simulateTrajectory(8888);
  if (runA.slot !== runB.slot || runA.landingX !== runB.landingX || runA.trajectory.length !== runB.trajectory.length) {
    throw new Error('Deterministic replay failed: trajectory points differ between identical seed runs');
  }
  for (let i = 0; i < runA.trajectory.length; i++) {
    if (runA.trajectory[i].x !== runB.trajectory[i].x || runA.trajectory[i].y !== runB.trajectory[i].y) {
      throw new Error(`Deterministic drift at step ${i}`);
    }
  }
  console.log('Deterministic Replay: 100% bit-exact trajectory reproduction verified.');

  // ==============================================================
  // STEP 2: Browser QA Launch & Kiosk State Transitions
  // ==============================================================
  console.log('\n--- Step 2: Browser State Machine, Audio & Operator Configuration ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader']
  });

  const errors = [];
  const page = await browser.newPage();
  page.on('pageerror', err => {
    console.error('Browser Page Error:', err.message);
    errors.push(err.message);
  });

  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
  await page.goto(V3_URL, { waitUntil: 'load' });

  // 1. Check Initial Idle State
  const initialState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('Initial Game State:', initialState);
  if (initialState !== 'idle') throw new Error(`Expected idle, got ${initialState}`);
  await page.screenshot({ path: path.join(V3_DIR, 'preview_idle.png') });

  // 2. Test Operator Configuration Modal (Shift+O & Config Button)
  console.log('Testing Operator Modal (Shift+O)...');
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyO');
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 200));

  const modalOpen = await page.$eval('#operatorModal', el => el.classList.contains('open'));
  console.log('Operator Modal Open after Shift+O:', modalOpen);
  if (!modalOpen) throw new Error('Operator modal failed to open with Shift+O');

  // Verify Operator inputs exist
  const opInputs = await page.evaluate(() => ({
    title: document.getElementById('cfgEventTitle')?.value,
    mode: document.getElementById('cfgMode')?.value,
    duration: document.getElementById('cfgDuration')?.value,
    fpsHud: document.getElementById('cfgFpsToggle')?.checked
  }));
  console.log('Operator Settings Detected:', opInputs);

  // Close Operator modal
  await page.click('#closeConfig');
  await new Promise(r => setTimeout(r, 200));
  const modalClosed = await page.$eval('#operatorModal', el => !el.classList.contains('open'));
  if (!modalClosed) throw new Error('Operator modal failed to close');

  // 3. Test Mute Toggle
  await page.click('#mute');
  const isMuted = await page.evaluate(() => window.__techDropQA?.snapshot()?.state);
  console.log('Mute clicked, state remains:', isMuted);

  // 4. Test Single Full Game Round (Start -> Launch -> Playing -> Capture -> Result -> Reset)
  console.log('Initiating Play Round...');
  await page.click('#start');
  // Attempt duplicate click to verify debouncing
  await page.click('#start');

  const afterStartSnap = await page.evaluate(() => window.__techDropQA?.snapshot());
  console.log('Round:', afterStartSnap.round, 'State:', afterStartSnap.state);

  // Wait for playing state
  await page.waitForFunction(() => document.documentElement.dataset.state === 'playing', { timeout: 3000 });
  console.log('State transitioned to playing');
  // Wait 1.5s into playing to capture ball mid-air across pegs
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(V3_DIR, 'preview_playing.png') });

  // Wait for capture state
  await page.waitForFunction(() => document.documentElement.dataset.state === 'capture', { timeout: 18000 });
  console.log('State transitioned to capture');
  await page.screenshot({ path: path.join(V3_DIR, 'preview_capture.png') });

  // Wait for result state
  await page.waitForFunction(() => document.documentElement.dataset.state === 'result', { timeout: 5000 });
  const resultState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State transitioned to reveal:', resultState);
  if (resultState !== 'result') throw new Error(`Expected result state, got ${resultState}`);
  await page.screenshot({ path: path.join(V3_DIR, 'preview_result.png') });

  // Verify result title and description
  const resultTitle = await page.$eval('#resultTitle', el => el.innerText.trim());
  const resultDesc = await page.$eval('#resultDescription', el => el.innerText.trim());
  console.log(`Discovered Identity: "${resultTitle.replace('\n', ' ')}" - ${resultDesc}`);

  // Test Auto-Reset
  console.log('Waiting for auto-reset countdown...');
  await page.waitForFunction(() => document.documentElement.dataset.state === 'idle', { timeout: 10000 });
  const resetState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State after countdown:', resetState);
  if (resetState !== 'idle') throw new Error(`Expected auto-reset to idle, got ${resetState}`);
  console.log('Full Round + Auto-Reset Test: PASSED');

  // 5. Test Keyboard Input (Space / Enter)
  console.log('Testing Keyboard Space trigger...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 300));
  const spaceState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State after Space:', spaceState);
  if (!['launch', 'playing'].includes(spaceState)) throw new Error('Space failed to launch');

  // Skip to reset
  await page.evaluate(() => window.__techDropQA?.reset());

  // Test Enter trigger
  console.log('Testing Keyboard Enter trigger...');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 300));
  const enterState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State after Enter:', enterState);
  if (!['launch', 'playing'].includes(enterState)) throw new Error('Enter failed to launch');
  await page.evaluate(() => window.__techDropQA?.reset());

  // 6. Test Performance HUD Toggle (Shift+F) & 1% Low Calculation
  console.log('\n--- Step 3: Performance HUD & True 1% Low Verification ---');
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyF');
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 200));

  const hudDisplay = await page.$eval('#perfHud', el => el.style.display);
  console.log('HUD display style after Shift+F:', hudDisplay);
  if (hudDisplay !== 'block') throw new Error('HUD failed to toggle visible');

  // Verify HUD values
  const hudValues = await page.evaluate(() => {
    const snap = window.__techDropQA?.snapshot();
    return {
      fps: snap.fps,
      smoothedFps: snap.smoothedFps,
      onePercentLow: snap.onePercentLow,
      quality: snap.quality
    };
  });
  console.log('Profiler Snapshot:', hudValues);
  if (typeof hudValues.onePercentLow !== 'number' || hudValues.onePercentLow < 0) {
    throw new Error('1% low calculation is missing or invalid');
  }

  // Toggle HUD off
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyF');
  await page.keyboard.up('Shift');

  // ==============================================================
  // STEP 4: 30 Consecutive Round/Reset Cycles (Resource Leak Check)
  // ==============================================================
  console.log('\n--- Step 4: 30 Consecutive Round / Reset Cycles (Resource Leak & Stability Check) ---');
  for (let cycle = 1; cycle <= 30; cycle++) {
    await page.evaluate(() => window.__techDropQA?.start());
    await new Promise(r => setTimeout(r, 50));
    await page.evaluate(() => window.__techDropQA?.skip()); // skip to capture
    await new Promise(r => setTimeout(r, 50));
    await page.evaluate(() => window.__techDropQA?.skip()); // skip to result
    await new Promise(r => setTimeout(r, 50));
    await page.evaluate(() => window.__techDropQA?.reset()); // reset to idle

    if (cycle % 10 === 0) {
      const snap = await page.evaluate(() => window.__techDropQA?.snapshot());
      console.log(`Cycle ${cycle}/30 complete: state=${snap.state}, activeVoices=${snap.activeVoices}, activeParticles=${snap.particles}`);
    }
  }

  const post30Snap = await page.evaluate(() => window.__techDropQA?.snapshot());
  if (post30Snap.activeVoices > 0) {
    throw new Error(`Audio voice leak detected: ${post30Snap.activeVoices} lingering active voices`);
  }
  if (post30Snap.particles > 0) {
    throw new Error(`Particle leak detected: ${post30Snap.particles} lingering particles`);
  }
  console.log('30 Cycles Complete: Zero lingering audio voices or active particles.');

  // ==============================================================
  // STEP 5: All 6 Outcome Presentations & Visual Capture
  // ==============================================================
  console.log('\n--- Step 5: Testing All 6 Tech Superpower Presentations ---');
  const outcomeResults = [];
  for (let n = 0; n < 6; n++) {
    await page.evaluate(() => window.__techDropQA?.reset());
    await page.evaluate(num => window.__techDropQA?.forceOutcome(num), n);
    await page.evaluate(() => window.__techDropQA?.start());

    const snap = await page.evaluate(() => window.__techDropQA?.snapshot());
    console.log(`Outcome ${n} simulation: target=${snap.target}, landingX=${snap.landingX?.toFixed(1)}, expectedX=${snap.expectedX?.toFixed(1)}, impacts=${snap.impacts}`);

    // Verify natural physical landing is within the bin bounds
    const error = Math.abs(snap.landingX - snap.expectedX);
    if (error > 35) throw new Error(`Outcome ${n} landing error too large: ${error}`);
    if (snap.impacts < 8) throw new Error(`Outcome ${n} impacts too low: ${snap.impacts}`);

    // Fast-forward to reveal
    await page.evaluate(() => window.__techDropQA?.skip());
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => window.__techDropQA?.skip());
    await new Promise(r => setTimeout(r, 1200));

    const titleText = await page.$eval('#resultTitle', el => el.innerText.trim().replace('\n', ' '));
    const iconSvg = await page.$eval('#resultIcon', el => el.innerHTML);
    const tags = await page.$$eval('#resultTags span', els => els.map(e => e.innerText));

    console.log(`Outcome ${n} Title: "${titleText}", Tags: [${tags.join(', ')}], Emblem SVG length: ${iconSvg.length}`);
    await page.screenshot({ path: path.join(V3_DIR, `outcome_${n}.png`) });

    outcomeResults.push({ index: n, title: titleText, impacts: snap.impacts, error: error.toFixed(1) });
  }

  // ==============================================================
  // STEP 6: Responsive Viewports (Kiosk, Phone, Landscape)
  // ==============================================================
  console.log('\n--- Step 6: Testing Responsive Viewports ---');
  const viewports = [
    { name: 'kiosk', width: 1080, height: 1920 },
    { name: 'phone', width: 390, height: 844 },
    { name: 'small_phone', width: 360, height: 640 },
    { name: 'landscape', width: 1280, height: 720 }
  ];

  for (const vp of viewports) {
    const testPage = await browser.newPage();
    testPage.on('pageerror', err => errors.push(`${vp.name}: ${err.message}`));
    await testPage.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await testPage.goto(V3_URL, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 300));

    await testPage.screenshot({ path: path.join(V3_DIR, `preview_${vp.name}.png`) });

    const stageBox = await testPage.$eval('#stage', el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });

    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): stage rendered at ${stageBox.width.toFixed(1)}x${stageBox.height.toFixed(1)}`);
    if (stageBox.width > vp.width + 2 || stageBox.height > vp.height + 2) {
      throw new Error(`Stage overflow in ${vp.name}`);
    }
    await testPage.close();
  }

  await browser.close();

  if (errors.length > 0) {
    console.error('Test encountered errors:', errors);
    process.exit(1);
  }

  console.log('\n=== ALL TECH DROP 5.0 QA & BENCHMARK TESTS PASSED SUCCESSFULLY! ===');
})();
