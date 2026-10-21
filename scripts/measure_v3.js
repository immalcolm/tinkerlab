// Reproducible development measurements. These are not target kiosk benchmarks.
const puppeteer = require('puppeteer-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
  const out = path.resolve(__dirname, '../lucky_drop/v3/qa');
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const client = await browser.target().createCDPSession();
    const system = await client.send('SystemInfo.getInfo');
    const report = { date: new Date().toISOString(), host: { platform: os.platform(), arch: os.arch(), cpu: os.cpus()[0].model },
      browser: await browser.version(), gpu: system.gpu, disclaimer: 'Headless development machine, not exhibition kiosk hardware. CPU submit time excludes GPU completion.', comparisons: [], production: [] };
    for (const [width, height] of [[1080, 1920], [2160, 3840]]) {
      for (const renderer of ['canvas', 'pixi']) {
        const page = await browser.newPage();
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        await page.goto('file://' + path.join(__dirname, `renderer_comparison.html?renderer=${renderer}`));
        await page.waitForFunction(() => window.__rendererComparison || window.__rendererError, { timeout: 20000 });
        const error = await page.evaluate(() => window.__rendererError);
        if (error) { report.comparisons.push({ renderer, width, height, error }); }
        else {
          const display = await page.$eval('canvas', c => {
            const r = c.getBoundingClientRect();
            return { width: r.width, height: r.height };
          });
          assert.equal(display.width, width, `${renderer} must fill the same portrait viewport width`);
          assert.equal(display.height, height, `${renderer} must fill the same portrait viewport height`);
          await new Promise(r => setTimeout(r, 11000));
          report.comparisons.push({ ...await page.evaluate(() => window.__rendererComparison.stats()), display });
          if (width === 1080) await page.screenshot({ path: path.join(out, `renderer-${renderer}-1080.png`) });
        }
        console.log('Comparison', report.comparisons.at(-1));
        await page.close();
      }
      for (const quality of ['high', 'medium', 'low']) {
        const page = await browser.newPage();
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        await page.goto('file://' + path.resolve(__dirname, `../lucky_drop/v3/index.html?quality=${quality}&mute=1`));
        await page.evaluate(() => { window.__techDropQA.forceOutcome(1); window.__techDropQA.start(); });
        const stats = await page.evaluate(async () => {
          await new Promise(r => setTimeout(r, 700));
          const frame = [], submit = []; let last = performance.now();
          const started = last;
          await new Promise(resolve => {
            const sample = now => {
              frame.push(now - last); last = now;
              if (now - started < 11000) requestAnimationFrame(sample); else resolve();
            }; requestAnimationFrame(sample);
          });
          const sorted = frame.sort((a, b) => a - b), slow = sorted.slice(-Math.max(1, Math.ceil(sorted.length * .01)));
          return { samples: frame.length, meanFrameMs: frame.reduce((a, b) => a + b, 0) / frame.length,
            p99FrameMs: sorted[Math.floor(sorted.length * .99)], onePercentLow: 1000 / (slow.reduce((a, b) => a + b, 0) / slow.length), snapshot: window.__techDropQA.snapshot() };
        });
        report.production.push({ viewport: [width, height], quality, ...stats });
        console.log('Production', width, quality, stats.meanFrameMs.toFixed(2), stats.onePercentLow.toFixed(1));
        await page.close();
      }
    }
    report.pixiVersion = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../node_modules/pixi.js/package.json'), 'utf8')).version;
    report.pixiMinifiedBytes = fs.statSync(path.resolve(__dirname, '../node_modules/pixi.js/dist/pixi.min.js')).size;
    report.productionStandaloneBytes = fs.statSync(path.resolve(__dirname, '../lucky_drop/v3/index.html')).size;
    fs.writeFileSync(path.join(out, 'performance.json'), JSON.stringify(report, null, 2) + '\n');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
