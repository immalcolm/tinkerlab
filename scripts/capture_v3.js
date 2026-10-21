const puppeteer = require('puppeteer-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');

(async () => {
  const out = path.resolve(__dirname, '../lucky_drop/v3/qa');
  fs.mkdirSync(out, { recursive: true });
  const beforeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tech-drop-before-'));
  fs.writeFileSync(path.join(beforeDir, 'index.html'), execFileSync('git', ['show', '9c3785b:lucky_drop/v3/index.html']));
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage();
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', req => { if (/^https?:/.test(req.url())) requests.push(req.url()); });
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(beforeDir, 'index.html'));
    await page.screenshot({ path: path.join(out, 'before-4.0-1080.png') });
    await page.evaluate(() => { window.__techDropQA.forceOutcome(0); window.__techDropQA.start(); window.__techDropQA.skip(); window.__techDropQA.skip(); });
    await new Promise(r => setTimeout(r, 2200));
    await page.screenshot({ path: path.join(out, 'before-4.0-result-1080.png') });
    await page.goto('file://' + path.resolve(__dirname, '../lucky_drop/v3/index.html?quality=high'));
    await page.screenshot({ path: path.join(out, 'after-5.0-1080.png') });
    await page.evaluate(() => window.__techDropQA.openConfig());
    await page.$eval('#cfgDuration', el => { el.value = '3'; });
    await page.click('#saveConfig');
    const rounds = [];
    const count = Number(process.env.FULL_ROUNDS || 30);
    for (let i = 0; i < count; i++) {
      await page.evaluate(n => window.__techDropQA.forceOutcome(n), i < 6 ? i : -1);
      if (i === 1) await page.keyboard.press('Space');
      else if (i === 2) await page.keyboard.press('Enter');
      else if (i === 3) {
        const client = await page.createCDPSession();
        await client.send('Emulation.setTouchEmulationEnabled', { enabled: true });
        const rect = await page.$eval('#start', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
        await page.touchscreen.tap(rect.x, rect.y);
      } else await page.click('#start');
      await page.waitForFunction(() => document.documentElement.dataset.state === 'playing', { timeout: 3000 });
      if (i === 0) { await new Promise(r => setTimeout(r, 1500)); await page.screenshot({ path: path.join(out, 'after-playing-1080.png') }); }
      await page.waitForFunction(() => document.documentElement.dataset.state === 'capture', { timeout: 20000 });
      const landing = await page.evaluate(() => window.__techDropQA.snapshot());
      assert.equal(landing.landingPos.y, 812);
      assert.equal(landing.landingPos.x, landing.landingX);
      if (i === 0) {
        await page.screenshot({ path: path.join(out, 'after-landing-1080.png') });
        await new Promise(r => setTimeout(r, 1300));
        await page.screenshot({ path: path.join(out, 'after-core-1080.png') });
      }
      await page.waitForFunction(() => document.documentElement.dataset.phase === 'photo-moment', { timeout: 7000 });
      const result = await page.evaluate(() => window.__techDropQA.snapshot());
      if (i < 6) {
        assert.equal(result.outcome, i);
        await page.screenshot({ path: path.join(out, `after-outcome-${i}-1080.png`) });
        assert.ok(await page.$eval('#revealScene', c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0)));
      }
      await page.waitForFunction(() => document.documentElement.dataset.state === 'idle', { timeout: 6000 });
      const idle = await page.evaluate(() => window.__techDropQA.snapshot());
      assert.equal(idle.activeVoices, 0); assert.equal(idle.particles, 0); assert.equal(idle.pendingPulses, 0);
      rounds.push({ round: i + 1, outcome: result.outcome, scene: result.revealScene, landing: landing.landingPos, reset: idle.state });
      console.log(`Full round ${i + 1}/${count}: ${result.revealScene}, exact floor landing, clean reset`);
    }
    assert.deepEqual(errors, []); assert.deepEqual(requests, [], 'play must remain offline');
    fs.writeFileSync(path.join(out, 'rounds.json'), JSON.stringify({ count, errors, networkRequests: requests, rounds }, null, 2) + '\n');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
