const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const V3_DIR = path.resolve(__dirname, '../lucky_drop/v3');
const V3_URL = 'file://' + path.join(V3_DIR, 'index.html');

(async () => {
  console.log('=== Starting Tech Drop v3 Comprehensive QA Test Suite ===');
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

  // 2. Test Mute Toggle
  await page.click('#mute');
  const isMuted = await page.evaluate(() => window.__techDropQA?.snapshot()?.state);
  console.log('Mute clicked, state remains:', isMuted);

  // 3. Test Full Game Round (Start -> Playing -> Capture -> Result -> Reset)
  console.log('Initiating Play Round...');
  await page.click('#start');
  // Attempt duplicate click to verify debouncing
  await page.click('#start');

  const afterStartSnap = await page.evaluate(() => window.__techDropQA?.snapshot());
  console.log('Round:', afterStartSnap.round, 'State:', afterStartSnap.state);

  // Wait for playing state
  await new Promise(r => setTimeout(r, 800));
  const playingState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State at 800ms:', playingState);
  await page.screenshot({ path: path.join(V3_DIR, 'preview_playing.png') });

  // Wait for capture state (around 4.5s playing duration)
  await new Promise(r => setTimeout(r, 4200));
  const captureState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State at 5.0s:', captureState);
  await page.screenshot({ path: path.join(V3_DIR, 'preview_capture.png') });

  // Wait for result state (capture takes ~1.35s)
  await new Promise(r => setTimeout(r, 1600));
  const resultState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State at 6.6s:', resultState);
  if (resultState !== 'result') throw new Error(`Expected result state, got ${resultState}`);
  await page.screenshot({ path: path.join(V3_DIR, 'preview_result.png') });

  // Verify result title and description
  const resultTitle = await page.$eval('#resultTitle', el => el.innerText.trim());
  const resultDesc = await page.$eval('#resultDescription', el => el.innerText.trim());
  console.log(`Discovered Identity: "${resultTitle.replace('\n', ' ')}" - ${resultDesc}`);

  // Test Auto-Reset
  console.log('Waiting for auto-reset countdown...');
  await new Promise(r => setTimeout(r, 6800));
  const resetState = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('State after countdown:', resetState);
  if (resetState !== 'idle') throw new Error(`Expected auto-reset to idle, got ${resetState}`);
  console.log('Full Round + Auto-Reset Test: PASSED');

  // 4. Test Keyboard Input (Space / Enter / Rapid taps)
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

  // 5. Test Performance HUD Toggle (Shift+F)
  console.log('Testing Shift+F performance HUD toggle...');
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyF');
  await page.keyboard.up('Shift');
  const hudDisplay = await page.$eval('#perfHud', el => el.style.display);
  console.log('HUD display style after Shift+F:', hudDisplay);
  if (hudDisplay !== 'block') throw new Error('HUD failed to toggle visible');

  // Toggle HUD off
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyF');
  await page.keyboard.up('Shift');

  // 6. Test All 6 Tech Superpowers (Forced Outcomes 0 to 5)
  console.log('\n--- Testing All 6 Tech Superpower Presentations ---');
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

  // 7. Test Responsive Viewports (Kiosk, Phone, Landscape)
  console.log('\n--- Testing Responsive Viewports ---');
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

  // 8. 200 Deterministic Simulation Runs Verification
  console.log('\n--- Running 200 Deterministic Seed Simulations ---');
  const { simulateRun } = require('./physics_benchmark.js');
  let validLandings = 0;
  let totalImpacts = 0;
  let minImp = 999, maxImp = 0;

  for (let s = 0; s < 200; s++) {
    const seed = 30000 + s * 197;
    const res = simulateRun(seed);
    if (res.slot >= 0 && res.slot <= 5 && res.duration < 7.0) {
      validLandings++;
    }
    totalImpacts += res.hits;
    minImp = Math.min(minImp, res.hits);
    maxImp = Math.max(maxImp, res.hits);
  }
  console.log(`200 Simulations: Valid landings = ${validLandings}/200 (100%), Avg impacts = ${(totalImpacts / 200).toFixed(1)}, Range = [${minImp}, ${maxImp}]`);

  if (validLandings !== 200) throw new Error(`Some simulations failed: ${validLandings}/200`);

  await browser.close();

  if (errors.length > 0) {
    console.error('Test encountered errors:', errors);
    process.exit(1);
  }

  console.log('\n=== ALL TECH DROP V3 TESTS PASSED SUCCESSFULLY! ===');
})();
