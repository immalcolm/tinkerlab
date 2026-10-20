const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

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

const HOME_URL = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('=== Starting TinkerLab Homepage QA Test Suite ===');
  console.log('Using browser executable:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader']
  });

  const errors = [];
  const page = await browser.newPage();
  page.on('pageerror', err => {
    console.error('Homepage Page Error:', err.message);
    errors.push(err.message);
  });

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(HOME_URL, { waitUntil: 'load' });

  // 1. Verify Title & Meta
  const title = await page.title();
  console.log('Page Title:', title);
  if (!title.includes('TinkerLab')) throw new Error('Invalid title');

  // 2. Verify Canvas is rendering
  const canvasExists = await page.$('#bgCanvas');
  console.log('Background Canvas exists:', !!canvasExists);
  if (!canvasExists) throw new Error('Background canvas missing');

  // 3. Verify Project Cards Rendering
  const projectCards = await page.$$('.project-card');
  console.log('Project Cards rendered:', projectCards.length);
  if (projectCards.length !== 3) throw new Error(`Expected 3 project cards, found ${projectCards.length}`);

  // 4. Verify Relative URLs on all cards
  const links = await page.$$eval('.launch-btn', els => els.map(e => e.getAttribute('href')));
  console.log('Launch Links:', links);
  if (links[0] !== './lucky_drop/v3/index.html') throw new Error(`Unexpected v3 link: ${links[0]}`);
  if (links[1] !== './lucky_drop/v2/index.html') throw new Error(`Unexpected v2 link: ${links[1]}`);
  if (links[2] !== './lucky_drop/v1/index.html') throw new Error(`Unexpected v1 link: ${links[2]}`);

  // 5. Verify Thumbnails Load
  const thumbs = await page.$$eval('.card-thumb', els => els.map(e => e.getAttribute('src')));
  console.log('Thumbnails:', thumbs);
  for (const t of thumbs) {
    const localPath = path.resolve(__dirname, '..', t);
    if (!fs.existsSync(localPath)) throw new Error(`Thumbnail file does not exist: ${localPath}`);
  }
  console.log('All project thumbnails verified to exist on disk!');

  // 6. Test Category Filter
  console.log('Testing Category Filter...');
  await page.click('button[data-category="Creative Coding"]');
  await new Promise(r => setTimeout(r, 200));
  const filteredCount = (await page.$$('.project-card')).length;
  console.log('Cards matching "Creative Coding":', filteredCount);
  if (filteredCount < 1) throw new Error('Filter failed');

  // Reset filter to All
  await page.click('button[data-category="all"]');
  await new Promise(r => setTimeout(r, 200));
  const resetCount = (await page.$$('.project-card')).length;
  console.log('Cards after reset to All:', resetCount);
  if (resetCount !== 3) throw new Error('Reset filter failed');

  // Capture Desktop Screenshot
  await page.screenshot({ path: path.resolve(__dirname, '../preview_homepage_desktop.png') });

  // 7. Test Responsive Viewports (Tablet, Mobile)
  console.log('Testing Mobile Viewport (375x812)...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.resolve(__dirname, '../preview_homepage_mobile.png') });

  await browser.close();

  if (errors.length > 0) {
    console.error('Homepage tests encountered errors:', errors);
    process.exit(1);
  }

  console.log('=== ALL TINKERLAB HOMEPAGE TESTS PASSED! ===');
})();
