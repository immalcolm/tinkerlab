// Full browser recording plus a direct recording of the game's Web Audio output.
const puppeteer = require('puppeteer-core');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

(async () => {
  const out = path.resolve(__dirname, '../lucky_drop/v3/qa');
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      const connect = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (destination, ...rest) {
        if (destination instanceof AudioDestinationNode && !window.__audioRecorder) {
          const stream = this.context.createMediaStreamDestination();
          connect.call(this, stream);
          const recorder = new MediaRecorder(stream.stream, { mimeType: 'audio/webm;codecs=opus' });
          const parts = [];
          recorder.ondataavailable = e => parts.push(e.data);
          window.__audioRecorder = recorder;
          window.__finishAudio = () => new Promise(resolve => {
            recorder.onstop = async () => {
              const bytes = new Uint8Array(await new Blob(parts).arrayBuffer());
              let binary = ''; for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
              resolve(btoa(binary));
            }; recorder.stop();
          });
          recorder.start();
        }
        return connect.call(this, destination, ...rest);
      };
    });
    await page.goto('file://' + path.resolve(__dirname, '../lucky_drop/v3/index.html?quality=high'));
    await page.evaluate(() => window.__techDropQA.forceOutcome(0));
    const video = await page.screencast({ path: path.join(out, 'round-silent.webm'), fps: 30, quality: 24, ffmpegPath: '/opt/homebrew/bin/ffmpeg' });
    const began = Date.now();
    await page.click('#start');
    const offset = Date.now() - began;
    await page.waitForFunction(() => document.documentElement.dataset.phase === 'photo-moment', { timeout: 25000 });
    await page.waitForFunction(() => document.documentElement.dataset.state === 'idle', { timeout: 12000 });
    // The DOM can reach idle before its first frame reaches the screencast.
    // Keep a short tail so the delivered video visibly includes the reset.
    await new Promise(resolve => setTimeout(resolve, 500));
    const audio = await page.evaluate(() => window.__finishAudio());
    fs.writeFileSync(path.join(out, 'round-audio.webm'), Buffer.from(audio, 'base64'));
    await video.stop();
    execFileSync('/opt/homebrew/bin/ffmpeg', ['-y', '-i', path.join(out, 'round-silent.webm'), '-itsoffset', String(offset / 1000), '-i', path.join(out, 'round-audio.webm'),
      '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', path.join(out, 'tech-drop-5.0-full-round.mp4')], { stdio: ['ignore', 'ignore', 'pipe'] });
    console.log('Recorded full 1080×1920 round with synthesized audio:', path.join(out, 'tech-drop-5.0-full-round.mp4'));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
