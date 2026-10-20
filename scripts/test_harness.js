const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  console.log('Launching Headless Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
  
  const fileUrl = 'file://' + path.resolve(__dirname, '../lucky_drop/v3/index.html');
  console.log('Navigating to:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  
  const title = await page.title();
  console.log('Page Title:', title);
  
  const state = await page.evaluate(() => document.documentElement.dataset.state);
  console.log('Initial State:', state);
  
  const snapshot = await page.evaluate(() => window.__techDropQA?.snapshot());
  console.log('QA Snapshot:', snapshot);
  
  await browser.close();
  console.log('Headless Chrome test harness successfully verified!');
})();
