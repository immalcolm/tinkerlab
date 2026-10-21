(()=>{
'use strict';

/**
 * TECH DROP 5.0 — FLAGSHIP ARCADE INTERACTIVE EXPERIENCE
 * Flagship interactive exhibition installation for Ngee Ann Polytechnic School of InfoComm Technology (NP ICT).
 * 
 * Features:
 * - 74.5% vertical screen coverage board with 90 metallic chrome pegs across 12 staggered rows
 * - Large 29px diameter luminous reflective ball with squash/stretch, specular highlight, and spin gyro
 * - True Continuous Collision Detection (CCD) via authoritative TechDropPhysics engine
 * - 4-Tier physical impact system: Light, Medium, Heavy, and Major Landing
 * - Generative Web Audio with pentatonic combo arpeggios, spatial panning, limiter, and 6 bespoke victory motifs
 * - Dynamic live combo HUD and energy overcharge telemetry
 * - Seamless landing continuity with zero visual teleportation or snapping
 * - Differentiated superpower reveals with customized visual signatures, emblem animations, and NP ICT diploma CTA
 * - Operator Exhibition configuration modal (Shift+O) with Discovery vs Demonstration mode
 * - High / Medium / Low / Auto performance presets with mean slowest 1% frame diagnostics
 */

const W = 540, H = 960, TAU = Math.PI * 2, EPS = 1e-7;
const $ = id => document.getElementById(id);

// Authoritative Physics Engine
const Physics = typeof TechDropPhysics !== 'undefined'
  ? TechDropPhysics
  : (typeof require !== 'undefined' ? require('./physics_engine.js') : null);

// Canvas and Rendering Context
const canvas = $('scene'), g = canvas.getContext('2d', { alpha: false }), stage = $('stage');
const revealCanvas = $('revealScene'), revealG = revealCanvas.getContext('2d');

// DOM Elements
const ui = {
  start: $('start'),
  skip: $('skip'),
  forceReset: $('forceReset'),
  bottom: $('bottom'),
  signal: $('boardSignal'),
  status: $('gameStatus'),
  phase: $('phaseLabel'),
  pct: $('phasePct'),
  phaseFill: $('phaseFill'),
  hero: $('heroOverlay'),
  comboHud: $('comboHud'),
  comboCount: $('comboCount'),
  comboTier: $('comboTier'),
  capture: $('capture'),
  result: $('result'),
  resultParticles: $('resultParticles'),
  resultTitle: $('resultTitle'),
  resultIcon: $('resultIcon'),
  resultDescription: $('resultDescription'),
  resultTags: $('resultTags'),
  resultNext: $('resultNext'),
  resultProgress: $('resultProgress'),
  resetCountdown: $('resetCountdown'),
  roundId: $('roundId'),
  callout: $('callout'),
  flash: $('flash'),
  announcer: $('announcer'),
  mute: $('mute'),
  fullscreen: $('fullscreen'),
  debug: $('debug'),
  debugStatus: $('debugStatus'),
  forceOutcome: $('forceOutcome'),
  configBtn: $('configBtn'),
  operatorModal: $('operatorModal'),
  closeConfig: $('closeConfig'),
  saveConfig: $('saveConfig'),
  cfgMode: $('cfgMode'),
  cfgEventTitle: $('cfgEventTitle'),
  cfgEventSubtitle: $('cfgEventSubtitle'),
  cfgDuration: $('cfgDuration'),
  cfgDurationVal: $('cfgDurationVal'),
  cfgMasterVol: $('cfgMasterVol'),
  cfgVolVal: $('cfgVolVal'),
  cfgSfxVol: $('cfgSfxVol'),
  cfgSfxVal: $('cfgSfxVal'),
  cfgQuality: $('cfgQuality'),
  cfgFpsToggle: $('cfgFpsToggle'),
  cfgAutoReset: $('cfgAutoReset'),
  cfgEffects: $('cfgEffects'),
  cfgCta: $('cfgCta'),
  playAgain: $('playAgain'),
  brandTitle: $('brandTitle'),
  brandSubtitle: $('brandSubtitle')
};
ui.deviceNotice = $('deviceNotice');
ui.deviceNoticeMessages = $('deviceNoticeMessages');
let deviceNoticeDismissed = false;
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function updateDeviceNotice() {
  const messages = [];
  if (reducedMotion) {
    messages.push('Reduced Motion is on. Some effects and reveal animations are intentionally still. For full animation, turn off Reduce Motion in your device’s Accessibility settings.');
  }
  if (isIOSDevice) {
    messages.push('iPhone/iPad sound tip: check Silent Mode and media volume if you can’t hear the game.');
  }
  ui.deviceNotice.hidden = deviceNoticeDismissed || messages.length === 0 || state !== 'idle' || ui.operatorModal.classList.contains('open');
  if (ui.deviceNoticeMessages.textContent !== messages.join('')) {
    ui.deviceNoticeMessages.replaceChildren(...messages.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
  }
}

$('dismissDeviceNotice').addEventListener('click', () => {
  deviceNoticeDismissed = true;
  updateDeviceNotice();
  if (state === 'idle') ui.start.focus({ preventScroll: true });
});

// ==========================================
// SIX TECH SUPERPOWER THEMES & BESPOKE EMBLEMS
// ==========================================
const THEMES = [
  {
    key: 'AI',
    first: 'AI',
    second: 'ARCHITECT',
    title: 'AI ARCHITECT',
    color: '#00F5D4', // Electric Cyan
    accent: '#00B4D8',
    desc: 'What if your next idea could learn? Explore how AI turns curiosity into useful, surprising inventions.',
    tags: ['NEURAL NETWORKS', 'GENERATIVE AI', 'SMART SYSTEMS', 'NP ICT AI'],
    cta: 'INVENT THE INTELLIGENT EXPERIENCES OF TOMORROW.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><circle cx="50" cy="50" r="42" fill="none" stroke="#00F5D4" stroke-width="2" stroke-dasharray="4 3"/><circle cx="50" cy="50" r="28" fill="none" stroke="#00F5D4" stroke-width="1.5"/><circle cx="50" cy="50" r="14" fill="#00F5D4" fill-opacity="0.25" stroke="#00F5D4" stroke-width="2"/><circle cx="50" cy="20" r="6" fill="#00F5D4"/><circle cx="80" cy="50" r="6" fill="#00F5D4"/><circle cx="50" cy="80" r="6" fill="#00F5D4"/><circle cx="20" cy="50" r="6" fill="#00F5D4"/><line x1="50" y1="26" x2="50" y2="36" stroke="#00F5D4" stroke-width="2"/><line x1="74" y1="50" x2="64" y2="50" stroke="#00F5D4" stroke-width="2"/><line x1="50" y1="74" x2="50" y2="64" stroke="#00F5D4" stroke-width="2"/><line x1="26" y1="50" x2="36" y2="50" stroke="#00F5D4" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="#FFF"/></svg>'
  },
  {
    key: 'CYBER',
    first: 'CYBER',
    second: 'GUARDIAN',
    title: 'CYBER GUARDIAN',
    color: '#00FF87', // Acid Emerald
    accent: '#00B894',
    desc: 'Think like a defender. Discover how curious minds protect people, outsmart threats and make technology safer.',
    tags: ['CYBER DEFENCE', 'ZERO TRUST', 'ETHICAL HACKING', 'NP ICT SEC'],
    cta: 'FORTIFY DIGITAL SOCIETY AGAINST THE UNSEEN.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><polygon points="50,15 82,28 82,60 50,88 18,60 18,28" fill="none" stroke="#00FF87" stroke-width="2.5"/><polygon points="50,25 74,35 74,56 50,78 26,56 26,35" fill="#00FF87" fill-opacity="0.15" stroke="#00FF87" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="#00FF87" stroke-width="2"/><path d="M50 38 L50 48 L58 48" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="48" r="3" fill="#FFF"/></svg>'
  },
  {
    key: 'CODE',
    first: 'CODE',
    second: 'CREATOR',
    title: 'CODE CREATOR',
    color: '#D8FF3E', // Cyber Lime
    accent: '#A3E635',
    desc: 'Turn a wild idea into something you can play with. Explore how code brings games, apps and useful inventions to life.',
    tags: ['FULL STACK', 'SYSTEMS ARCHITECTURE', 'ALGORITHMS', 'NP ICT DEV'],
    cta: 'DON’T JUST USE THE FUTURE. WRITE IT.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><path d="M36 32 L18 50 L36 68" fill="none" stroke="#D8FF3E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 32 L82 50 L64 68" fill="none" stroke="#D8FF3E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="56" y1="26" x2="44" y2="74" stroke="#FFF" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="50" r="38" fill="none" stroke="#D8FF3E" stroke-width="1.5" stroke-dasharray="6 4"/></svg>'
  },
  {
    key: 'DATA',
    first: 'DATA',
    second: 'DETECTIVE',
    title: 'DATA DETECTIVE',
    color: '#9D4EDD', // Hyper Violet
    accent: '#7B2CBF',
    desc: 'Every pattern tells a story. Explore how data can reveal hidden connections and help us ask better questions.',
    tags: ['BIG DATA', 'PREDICTIVE ANALYTICS', 'DEEP PATTERNS', 'NP ICT DATA'],
    cta: 'DECIPHER PATTERNS THAT CHANGE THE WORLD.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><circle cx="48" cy="48" r="28" fill="none" stroke="#9D4EDD" stroke-width="3"/><line x1="68" y1="68" x2="88" y2="88" stroke="#9D4EDD" stroke-width="5" stroke-linecap="round"/><circle cx="48" cy="48" r="16" fill="#9D4EDD" fill-opacity="0.2" stroke="#FFF" stroke-width="1.5"/><circle cx="48" cy="48" r="5" fill="#FFF"/><path d="M48 24 A24 24 0 0 1 72 48" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  {
    key: 'CLOUD',
    first: 'CLOUD',
    second: 'PILOT',
    title: 'CLOUD PILOT',
    color: '#38B6FF', // Ultra Sky
    accent: '#0077B6',
    desc: 'Connect ideas across the world. Discover the networks and cloud systems that keep our digital lives moving.',
    tags: ['DISTRIBUTED CLOUD', 'KUBERNETES', 'HYPER-SCALE', 'NP ICT OPS'],
    cta: 'NAVIGATE PLANETARY DISTRIBUTED SYSTEMS.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><path d="M30 65 A16 16 0 0 1 30 35 A22 22 0 0 1 70 35 A16 16 0 0 1 70 65 Z" fill="#38B6FF" fill-opacity="0.2" stroke="#38B6FF" stroke-width="2.5"/><circle cx="50" cy="50" r="7" fill="#FFF"/><line x1="50" y1="57" x2="50" y2="76" stroke="#FFF" stroke-width="3" stroke-linecap="round"/><polygon points="44,72 50,80 56,72" fill="#38B6FF"/></svg>'
  },
  {
    key: 'UX',
    first: 'UX',
    second: 'INVENTOR',
    title: 'UX INVENTOR',
    color: '#FF5E7E', // Solar Coral
    accent: '#D90429',
    desc: 'Start with people. Imagine playful, thoughtful digital experiences that feel effortless to use.',
    tags: ['INTERACTION DESIGN', 'SPATIAL COMPUTING', 'HUMAN-AI UX', 'NP ICT DESIGN'],
    cta: 'CREATE SENSORY DIGITAL CONNECTIONS.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><polygon points="50,15 82,33 82,67 50,85 18,67 18,33" fill="none" stroke="#FF5E7E" stroke-width="2.5"/><polygon points="50,28 72,40 72,60 50,72 28,60 28,40" fill="#FF5E7E" fill-opacity="0.25" stroke="#FFF" stroke-width="1.5"/><circle cx="50" cy="50" r="8" fill="#FFF"/><line x1="50" y1="15" x2="50" y2="28" stroke="#FF5E7E" stroke-width="2"/><line x1="82" y1="33" x2="72" y2="40" stroke="#FF5E7E" stroke-width="2"/></svg>'
  }
];

// Helper Functions
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const random = (min, max) => Math.random() * (max - min) + min;

// ==========================================
// OPERATOR CONFIGURATION & EVENT STATE
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const config = {
  mode: urlParams.get('mode') || 'discovery', // 'discovery' (pure physics) or 'demo' (curated)
  eventName: 'NGEE ANN POLYTECHNIC',
  eventSubtitle: 'SCHOOL OF INFOCOMM TECHNOLOGY',
  resultDuration: 5,
  masterVolume: 1.0,
  sfxVolume: 0.85,
  autoReset: true,
  roundDuration: 4.5
};
const SETTINGS_KEY = 'tech-drop-5-kiosk';
config.effectsIntensity = 0.75;
config.showCta = false;
let savedQuality = 'auto';
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
  if (saved) {
    for (const key of ['eventName', 'eventSubtitle']) if (typeof saved[key] === 'string') config[key] = saved[key].slice(0, 100);
    for (const key of ['masterVolume', 'sfxVolume', 'effectsIntensity']) if (Number.isFinite(saved[key])) config[key] = clamp(saved[key], 0, 1);
    if (Number.isFinite(saved.resultDuration)) config.resultDuration = clamp(saved.resultDuration, 3, 15);
    for (const key of ['autoReset', 'showCta']) if (typeof saved[key] === 'boolean') config[key] = saved[key];
    if (['discovery', 'demo'].includes(saved.mode)) config.mode = saved.mode;
    if (['high', 'medium', 'low', 'auto'].includes(saved.quality)) savedQuality = saved.quality;
  }
} catch (_) { /* File-mode kiosks may prohibit local storage. */ }
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionQuery.matches;
motionQuery.addEventListener('change', e => {
  reducedMotion = e.matches;
  if (e.matches) deviceNoticeDismissed = false;
  updateDeviceNotice();
});
let qualityPreset = urlParams.get('quality') || (urlParams.has('lite') ? 'low' : savedQuality);
if (!['high', 'medium', 'low', 'auto'].includes(qualityPreset)) qualityPreset = 'high';
let effectiveQuality = qualityPreset === 'auto' ? 'high' : qualityPreset;
const NEUTRAL_ENERGY = '#D8FF3E';
const flightColor = () => state === 'capture' || state === 'result' ? THEMES[target].color : NEUTRAL_ENERGY;
let renderScale = 1;

// ==========================================
// GAMEPLAY STATE
// ==========================================
let state = 'idle'; // 'idle', 'launch', 'playing', 'capture', 'result', 'resetting'
let stateTime = 0;
let round = 0;
let target = 0;
let outcome = 0;
let landingPos = { x: 270, y: 812 };
let clock = 0;
let shake = 0;
let impactFlash = 0;
let comboCount = 0;
let finalApproach = false;
let photoMoment = false;
const pegMaterial = document.createElement('canvas');

// Board Geometry derived from Physics Engine
const BOARD_LEFT = Physics?.BOARD_LEFT || 30;
const BOARD_RIGHT = Physics?.BOARD_RIGHT || 510;
const slotWidth = Physics?.SLOT_WIDTH || 80;
const slotCenter = i => BOARD_LEFT + (i + 0.5) * slotWidth;

// Instantiate Peg Visual State
const rawPegs = Physics?.PEGS || [];
const pegs = rawPegs.map((p, idx) => ({
  index: idx,
  x: p.x,
  y: p.y,
  r: p.r,
  col: p.col,
  glow: 0,
  pulse: 0,
  recoilX: 0,
  recoilY: 0,
  hotColor: null
}));

// Ball Entity State
const ball = {
  x: 270,
  y: 145,
  vx: 0,
  vy: 0,
  radius: Physics?.BALL_RADIUS || 14.5,
  rotation: 0,
  spin: 0
};

const trail = [];
const rings = [];
const pendingPulses = [];

// Object Pool for Particles (Cap based on Quality)
const MAX_PARTICLES = 180;
const particlePool = Array.from({ length: MAX_PARTICLES }, () => ({
  active: false,
  x: 0, y: 0,
  vx: 0, vy: 0,
  life: 0, max: 1,
  size: 3,
  color: '#fff',
  kind: 'spark',
  angle: 0, spin: 0
}));

function spawnParticle(x, y, vx, vy, life, size, color, kind = 'spark', spin = 0) {
  if (config.effectsIntensity === 0) return null;
  const cap = effectiveQuality === 'low' ? 35 : effectiveQuality === 'medium' ? 70 : 120;
  for (let i = 0; i < cap; i++) {
    const p = particlePool[i];
    if (!p.active) {
      p.active = true;
      p.x = x; p.y = y;
      p.vx = vx; p.vy = vy;
      p.life = life; p.max = life;
      p.size = size;
      p.color = color;
      p.kind = kind;
      p.angle = random(0, TAU);
      p.spin = spin;
      return p;
    }
  }
  return null;
}

function burst(x, y, color, count = 16, power = 1.0, baseVx = 0, baseVy = 0) {
  count = Math.round(count * config.effectsIntensity * (reducedMotion ? 0.15 : 1));
  if (effectiveQuality === 'low') count = Math.round(count * 0.4);
  else if (effectiveQuality === 'medium') count = Math.round(count * 0.7);

  for (let i = 0; i < count; i++) {
    const directed = Math.abs(baseVx) + Math.abs(baseVy) > 0;
    const angle = directed ? Math.atan2(baseVy, baseVx) + random(-0.85, 0.85) : random(0, TAU);
    const speed = random(60, 240) * power;
    spawnParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      random(0.35, 0.75),
      random(2.0, 4.5),
      color,
      'spark',
      random(-5, 5)
    );
  }
}

function addRing(x, y, color, initialRadius = 10, maxLife = 0.55) {
  if (reducedMotion || config.effectsIntensity === 0 || rings.length >= 12) return;
  rings.push({ x, y, color, r: initialRadius, life: maxLife, maxLife });
}

// Connected Row Circuit Energy Propagation
function triggerNeuralPulse(pegIndex, color) {
  const centerPeg = pegs[pegIndex];
  if (!centerPeg) return;
  for (const p of pegs) {
    if (p.r === centerPeg.r && Math.abs(p.col - centerPeg.col) <= 3) {
      const dist = Math.abs(p.col - centerPeg.col);
      pendingPulses.push({ peg: p, at: clock + dist * 0.045, power: 1 - dist * 0.25, color });
    }
  }
}

// Ambient Floating Tech Dust
const ambient = Array.from({ length: 32 }, () => ({
  x: random(30, 510),
  y: random(130, 810),
  radius: random(1.0, 2.2),
  alpha: random(0.12, 0.38),
  v: random(0.3, 1.2),
  phase: random(0, TAU)
}));

// ==========================================
// PRE-RENDERED BACKGROUND CACHE (74.5% Board Coverage)
// ==========================================
const bg = document.createElement('canvas');
bg.width = W; bg.height = H;
const b = bg.getContext('2d');

function drawLine(ctx, x1, y1, x2, y2, stroke, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function rr(ctx, x, y, w, h, r = 12) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipseGlow(ctx, x, y, radius, stops) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  for (const [stop, color] of stops) g.addColorStop(stop, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function renderBackgroundCache() {
  let grad = b.createLinearGradient(0, 0, 540, 960);
  grad.addColorStop(0, '#030713');
  grad.addColorStop(0.5, '#061026');
  grad.addColorStop(1, '#09081e');
  b.fillStyle = grad;
  b.fillRect(0, 0, W, H);

  // Atmospheric Glows
  ellipseGlow(b, 270, 140, 260, [[0, 'rgba(0,245,212,0.18)'], [1, 'transparent']]);
  ellipseGlow(b, 270, 815, 300, [[0, 'rgba(216,255,62,0.15)'], [1, 'transparent']]);
  ellipseGlow(b, 60, 480, 240, [[0, 'rgba(56,182,255,0.12)'], [1, 'transparent']]);
  ellipseGlow(b, 480, 480, 240, [[0, 'rgba(157,78,221,0.12)'], [1, 'transparent']]);

  // Cybernetic Background Micro-grid
  for (let y = 0; y < H; y += 32) drawLine(b, 0, y, W, y, 'rgba(115,244,255,0.03)');
  for (let x = 0; x < W; x += 32) drawLine(b, x, 0, x, H, 'rgba(115,244,255,0.03)');

  // Board Container Shadow & Outer Rim (y: 115 to 835 -> 720px height)
  b.save();
  b.shadowColor = '#000000f0';
  b.shadowBlur = 40;
  rr(b, 18, 112, 504, 726, 26);
  b.fillStyle = '#020610';
  b.fill();
  b.restore();

  let rim = b.createLinearGradient(18, 115, 522, 835);
  rim.addColorStop(0, '#00f5d4aa');
  rim.addColorStop(0.35, '#38b6ff55');
  rim.addColorStop(0.7, '#9d4edd66');
  rim.addColorStop(1, '#d8ff3eaa');
  b.strokeStyle = rim;
  b.lineWidth = 2.2;
  rr(b, 19, 113, 502, 724, 26);
  b.stroke();

  // Internal Titanium/Carbon Board Plate
  const boardG = b.createLinearGradient(0, 118, 0, 830);
  boardG.addColorStop(0, '#09152b');
  boardG.addColorStop(0.48, '#050c1b');
  boardG.addColorStop(1, '#09081f');
  b.fillStyle = boardG;
  rr(b, 24, 118, 492, 714, 22);
  b.fill();

  b.save();
  rr(b, 24, 118, 492, 714, 22);
  b.clip();

  // Fine diagonal technical hash lines
  for (let x = -400; x < 900; x += 44) drawLine(b, x, 118, x + 400, 832, 'rgba(115,244,255,0.025)');

  // Side Energy Conduits
  const railL = b.createLinearGradient(0, 130, 0, 800);
  railL.addColorStop(0, '#00f5d499');
  railL.addColorStop(0.5, '#38b6ff66');
  railL.addColorStop(1, '#d8ff3e99');
  drawLine(b, 30, 130, 30, 800, railL, 2.5);
  drawLine(b, 510, 130, 510, 800, railL, 2.5);

  // Lateral glowing tick marks
  for (let i = 0; i < 14; i++) {
    let yy = 155 + i * 46;
    b.fillStyle = i % 2 ? 'rgba(0,245,212,0.45)' : 'rgba(216,255,62,0.45)';
    b.fillRect(27, yy - 3, 5, 8);
    b.fillRect(508, yy - 3, 5, 8);
  }

  // Top Ball Launcher Chute Bezel
  ellipseGlow(b, 270, 145, 45, [[0, 'rgba(216,255,62,0.3)'], [1, 'transparent']]);
  b.strokeStyle = 'rgba(216,255,62,0.6)';
  b.lineWidth = 1.8;
  b.beginPath();
  b.arc(270, 145, 24, 0, TAU);
  b.stroke();

  // Collector Bins at Bottom (y: 755 to 825)
  b.fillStyle = '#030816';
  rr(b, 28, 755, 484, 70, 12);
  b.fill();
  b.strokeStyle = 'rgba(115,244,255,0.4)';
  b.lineWidth = 1.4;
  rr(b, 28, 755, 484, 70, 12);
  b.stroke();

  // Render 6 Prominent Collector Slots
  for (let i = 0; i < 6; i++) {
    const x = BOARD_LEFT + i * slotWidth;
    const theme = THEMES[i];

    // Slot Divider post
    if (i > 0) {
      drawLine(b, x, 755, x, 825, 'rgba(140,165,196,0.35)', 2);
      b.fillStyle = '#ffffff';
      b.beginPath();
      b.arc(x, 755, 4.0, 0, TAU);
      b.fill();
    }

    // Collector Well Gradient
    const wellG = b.createLinearGradient(0, 758, 0, 822);
    wellG.addColorStop(0, theme.color + '22');
    wellG.addColorStop(1, theme.color + '05');
    b.fillStyle = wellG;
    b.fillRect(x + 2, 758, slotWidth - 4, 64);

    // Slot Label Badge
    b.fillStyle = theme.color;
    b.fillRect(x + 10, 816, slotWidth - 20, 2.5);

    b.fillStyle = '#ffffff';
    b.font = '900 8.5px ui-monospace, SFMono-Regular, monospace';
    b.textAlign = 'center';
    b.fillText(theme.first, x + slotWidth / 2, 782);
    b.fillStyle = theme.color;
    b.font = '800 7.2px ui-monospace, SFMono-Regular, monospace';
    b.fillText(theme.second, x + slotWidth / 2, 796, slotWidth - 10);
  }

  b.restore();
}

renderBackgroundCache();

// ==========================================
// PROCEDURAL WEB AUDIO REDESIGN & COMPRESSOR
// ==========================================
let audioContext = null;
let masterGain = null;
let dynamicsCompressor = null;
let contactNoise = null;
let isMuted = urlParams.get('mute') === '1';
const activeVoices = [];
const MAX_VOICES = 12;

function stopVoices() {
  for (const voice of activeVoices.splice(0)) {
    try { voice.osc.stop(); voice.osc.disconnect(); voice.gain.disconnect(); } catch (_) {}
  }
}

function applyVolume() {
  if (masterGain && audioContext) {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setValueAtTime(isMuted ? 0 : config.masterVolume, audioContext.currentTime);
  }
  ui.mute.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
  ui.mute.setAttribute('aria-pressed', String(isMuted));
  ui.mute.style.opacity = isMuted ? '0.45' : '1';
  $('resultMute').textContent = isMuted ? 'Sound off' : 'Sound on';
  $('resultMute').setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
}

function initAudio() {
  if (audioContext) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    contactNoise = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.12), audioContext.sampleRate);
    const noise = contactNoise.getChannelData(0);
    for (let i = 0; i < noise.length; i++) noise[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noise.length, 3);

    // Master Dynamics Compressor to prevent clipping during cascade bounces
    dynamicsCompressor = audioContext.createDynamicsCompressor();
    dynamicsCompressor.threshold.setValueAtTime(-6, audioContext.currentTime);
    dynamicsCompressor.knee.setValueAtTime(10, audioContext.currentTime);
    dynamicsCompressor.ratio.setValueAtTime(12, audioContext.currentTime);
    dynamicsCompressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    dynamicsCompressor.release.setValueAtTime(0.14, audioContext.currentTime);

    masterGain = audioContext.createGain();
    applyVolume();

    masterGain.connect(dynamicsCompressor);
    dynamicsCompressor.connect(audioContext.destination);
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

function unlockAudioContext() {
  if (!audioContext) initAudio();
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playSynthTone({ freq, duration = 0.08, type = 'sine', volume = 0.2, freqTo = null, pan = 0, delay = 0, filterFreq = null }) {
  if (!audioContext || isMuted || config.masterVolume <= 0) return;
  try {
    cleanActiveVoices(audioContext.currentTime);
    if (activeVoices.length >= MAX_VOICES) {
      const voice = activeVoices.shift();
      voice.gain.gain.cancelScheduledValues(audioContext.currentTime);
      voice.gain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.004);
      voice.osc.stop(audioContext.currentTime + 0.02);
    }
    const now = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const effectiveVol = Math.max(0.0001, volume * config.sfxVolume);

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(freq, 20), now);
    if (freqTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 20), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(effectiveVol, now + Math.min(0.01, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    let lastNode = gain;

    if (filterFreq) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    if (audioContext.createStereoPanner) {
      const panner = audioContext.createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -0.85, 0.85), now);
      gain.connect(panner);
      lastNode = panner;
    }

    lastNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.03);

    osc.onended = () => { osc.disconnect(); gain.disconnect(); lastNode.disconnect(); };
    activeVoices.push({ osc, gain, endTime: now + duration + 0.03 });
  } catch (e) {}
}

// Pentatonic combo note scale for emergent musical cascade
const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

function launchSound() {
  // Deep pneumatic bass drop + rising electromagnetic coil
  playSynthTone({ freq: 80, duration: 0.5, type: 'sawtooth', volume: 0.32, freqTo: 280 });
  playSynthTone({ freq: 440, duration: 0.24, type: 'sine', volume: 0.26, delay: 0.1, freqTo: 920 });
  playSynthTone({ freq: 880, duration: 0.28, type: 'triangle', volume: 0.22, delay: 0.22, freqTo: 1480 });
  playSynthTone({ freq: 100, duration: 0.45, type: 'sine', volume: 0.4, freqTo: 32 });
}

function contactTransient(force, pan) {
  if (!audioContext || isMuted || !contactNoise || activeVoices.length >= MAX_VOICES) return;
  const osc = audioContext.createBufferSource(), gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const panner = audioContext.createStereoPanner();
  osc.buffer = contactNoise;
  filter.type = 'bandpass'; filter.frequency.value = 1700 + force * 5; filter.Q.value = 0.8;
  gain.gain.value = Math.min(0.16, force / 1200) * config.sfxVolume;
  panner.pan.value = pan;
  osc.connect(filter); filter.connect(gain); gain.connect(panner); panner.connect(masterGain);
  osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); panner.disconnect(); };
  osc.start();
  activeVoices.push({ osc, gain, endTime: audioContext.currentTime + 0.12 });
}

function hitSound(ev) {
  const normForce = clamp(ev.force / 140, 0.15, 1.0);
  const pan = clamp((ev.x - 270) / 240, -0.85, 0.85);
  const tier = ev.tier || 1;
  if (tier >= 2) contactTransient(ev.force, pan);

  // Emerging musical combo tone
  const pentatonicNote = PENTATONIC[comboCount % PENTATONIC.length];
  playSynthTone({
    freq: pentatonicNote,
    duration: 0.045,
    type: 'sine',
    volume: 0.09,
    pan
  });

  if (tier === 1) {
    // Tier 1: Light Tap
    playSynthTone({
      freq: 1200 + (ev.peg % 12) * 80,
      duration: 0.025,
      type: 'triangle',
      volume: 0.08 + normForce * 0.06,
      freqTo: 850,
      pan
    });
  } else if (tier === 2) {
    // Tier 2: Medium Collision
    playSynthTone({
      freq: 1800 + (ev.peg % 12) * 90,
      duration: 0.035,
      type: 'triangle',
      volume: 0.12 + normForce * 0.08,
      freqTo: 720,
      pan
    });
    const baseFreq = 480 + (ev.peg % 12) * 60;
    playSynthTone({
      freq: baseFreq,
      duration: 0.06,
      type: 'sine',
      volume: 0.14 + normForce * 0.10,
      freqTo: baseFreq * 0.75,
      pan
    });
  } else {
    // Tier 3: Heavy Collision
    playSynthTone({
      freq: 2400 + (ev.peg % 12) * 110,
      duration: 0.03,
      type: 'triangle',
      volume: 0.16 + normForce * 0.12,
      freqTo: 900,
      pan
    });
    playSynthTone({
      freq: 520 + (ev.peg % 12) * 70,
      duration: 0.08,
      type: 'sine',
      volume: 0.18 + normForce * 0.12,
      freqTo: 280,
      pan
    });
    // Sub-bass thump
    playSynthTone({
      freq: 95,
      duration: 0.11,
      type: 'triangle',
      volume: 0.22 + normForce * 0.15,
      freqTo: 40,
      pan
    });
  }
}

function captureSound() {
  // Thunderous 45Hz 808 sub blast + reverse riser
  playSynthTone({ freq: 65, duration: 0.75, type: 'sawtooth', volume: 0.40, freqTo: 480 });
  playSynthTone({ freq: 45, duration: 0.95, type: 'sine', volume: 0.48, freqTo: 30 });
  playSynthTone({ freq: 620, duration: 0.45, type: 'triangle', volume: 0.32, delay: 0.12, freqTo: 1100 });
  playSynthTone({ freq: 1250, duration: 0.35, type: 'sine', volume: 0.28, delay: 0.28, freqTo: 1800 });
}

// 6 Bespoke Victory Fanfares
function playVictoryTheme(outcomeIndex) {
  switch (outcomeIndex) {
    case 0: // AI Architect: Ascending Neural Arpeggio
      [392, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.4, type: 'sine', volume: 0.24, delay: i * 0.08, freqTo: f * 1.04 });
      });
      playSynthTone({ freq: 196, duration: 1.0, type: 'triangle', volume: 0.3, delay: 0.0, freqTo: 294 });
      break;
    case 1: // Cyber Guardian: Heavy Shield Pulse & Resonant Fifths
      [146.83, 220, 293.66, 440, 587.33, 880].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.48, type: 'sawtooth', volume: 0.25, delay: i * 0.1, freqTo: f * 1.02 });
      });
      playSynthTone({ freq: 73.4, duration: 1.2, type: 'sine', volume: 0.36, delay: 0.0 });
      break;
    case 2: // Code Creator: Algorithmic Chiptune Triad
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.24, type: 'triangle', volume: 0.22, delay: i * 0.065 });
      });
      playSynthTone({ freq: 261.63, duration: 0.9, type: 'sine', volume: 0.30, delay: 0.15 });
      break;
    case 3: // Data Detective: Resonant Sonar Sweep
      [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760.0].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.4, type: 'sine', volume: 0.24, delay: i * 0.085, freqTo: f * 0.96 });
      });
      playSynthTone({ freq: 220, duration: 0.85, type: 'triangle', volume: 0.28, delay: 0.0 });
      break;
    case 4: // Cloud Pilot: Ethereal Floating Horizon
      [349.23, 440, 523.25, 698.46, 880, 1046.5, 1396.91].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.5, type: 'sine', volume: 0.22, delay: i * 0.09 });
      });
      playSynthTone({ freq: 174.61, duration: 1.1, type: 'triangle', volume: 0.32, delay: 0.0 });
      break;
    case 5: // UX Inventor: Warm Polyphonic Prism
      [293.66, 369.99, 440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.45, type: 'triangle', volume: 0.24, delay: i * 0.075 });
      });
      playSynthTone({ freq: 146.83, duration: 1.0, type: 'sine', volume: 0.34, delay: 0.0 });
      break;
  }
}

function cleanActiveVoices(now) {
  for (let i = activeVoices.length - 1; i >= 0; i--) {
    if (activeVoices[i].endTime <= now) {
      activeVoices.splice(i, 1);
    }
  }
}

// ==========================================
// GAME STATE MACHINE
// ==========================================
function setState(next) {
  state = next;
  stateTime = 0;
  document.documentElement.dataset.state = next;
  document.documentElement.dataset.phase = { idle: 'attract', launch: 'activate', playing: 'drop', capture: 'landing', result: 'superpower-reveal', resetting: 'reset' }[next];
  ui.debugStatus.textContent = `STATE ${next.toUpperCase()} | ROUND ${round} | ${THEMES[outcome].key}`;
  ui.signal.textContent = next === 'idle' ? 'READY TO LAUNCH'
    : next === 'result' ? 'SUPERPOWER UNLOCKED'
    : next === 'capture' ? 'CORE OVERLOAD'
    : 'QUANTUM SYNC ACTIVE';

  if (next === 'idle') {
    ui.bottom.inert = false;
    ui.hero.classList.remove('faded');
    ui.comboHud.classList.remove('active');
  } else {
    ui.bottom.inert = true;
    ui.hero.classList.add('faded');
  }
  updateDeviceNotice();
}

function announce(s) {
  ui.announcer.textContent = s;
}

let playingDuration = config.roundDuration || 4.5;
let track = [];
let impactEvents = [];
let nextImpact = 0;

function start() {
  if (state !== 'idle') return false;
  unlockAudioContext();
  round++;
  comboCount = 0;
  finalApproach = false;
  photoMoment = false;
  ui.result.classList.remove('photo');

  // Determine target outcome
  let forced = parseInt(ui.forceOutcome.value, 10);
  if (!(forced >= 0 && forced <= 5) && config.mode === 'demo') forced = (round - 1) % 6;
  let generated;
  if (forced >= 0 && forced <= 5 && Physics) {
    // Demonstration Mode: pick curated natural seed for chosen slot
    const seeds = Physics.CURATED_SEEDS[forced];
    const pickedSeed = seeds[round % seeds.length];
    target = forced;
    generated = Physics.simulateTrajectory(pickedSeed);
  } else if (Physics) {
    // Discovery Mode: pure natural physics flight
    const naturalSeed = Date.now() + round * 1013;
    generated = Physics.simulateTrajectory(naturalSeed);
    target = generated.slot;
  }

  if (!generated?.completed) {
    announce('The chamber needs another drop. Press the button to try again.');
    return false;
  }
  playingDuration = generated.duration;
  track = generated.trajectory;
  impactEvents = generated.hits.map(h => ({ ...h, showT: h.t }));

  nextImpact = 0;
  trail.length = 0;

  ui.capture.classList.remove('active');
  ui.result.classList.remove('visible');
  ui.bottom.classList.add('hidden');
  ui.status.classList.add('visible');
  ui.phase.textContent = 'MAPPING NEURAL RESONANCE';
  ui.phaseFill.style.transform = 'scaleX(0)';
  ui.pct.textContent = '00%';

  setState('launch');
  stage.focus({ preventScroll: true });
  burst(270, 145, '#D8FF3E', 28, 1.2);
  addRing(270, 145, '#D8FF3E', 12, 0.65);
  launchSound();
  announce('Launching Tech Drop. Discovering your tech superpower.');
  return true;
}

function atTrack(time) {
  let trackTime = (time / playingDuration) * (track[track.length - 1]?.t || 1);
  if (trackTime <= 0) return track[0] || { x: 270, y: 145, vx: 0, vy: 0, spin: 0 };
  let lo = 0, hi = track.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (track[mid].t < trackTime) lo = mid + 1;
    else hi = mid;
  }
  let j = Math.max(1, lo), a = track[j - 1], b = track[j];
  let k = clamp((trackTime - a.t) / ((b.t - a.t) || EPS), 0, 1);
  return {
    x: lerp(a.x, b.x, k),
    y: lerp(a.y, b.y, k),
    vx: lerp(a.vx, b.vx, k),
    vy: lerp(a.vy, b.vy, k),
    spin: lerp(a.spin || 0, b.spin || 0, k)
  };
}

function impact(e) {
  const p = pegs[e.peg];
  const tier = e.tier || 1;
  comboCount++;
  if (!finalApproach && comboCount >= 8) document.documentElement.dataset.phase = 'energy-chain';

  // Update live combo HUD
  ui.comboCount.textContent = comboCount + 'X';
  const tierLabel = comboCount >= 25 ? 'QUANTUM OVERLOAD' : comboCount >= 15 ? 'NEURAL SYNC MAX' : comboCount >= 8 ? 'HIGH RESONANCE' : 'ACTIVE CASCADE';
  ui.comboTier.textContent = tierLabel;
  ui.comboHud.classList.add('active');

  if (tier === 3) {
    // Heavy Collision
    triggerNeuralPulse(e.peg, NEUTRAL_ENERGY);
    burst(e.x, e.y, NEUTRAL_ENERGY, 14, 1.2, e.nx * 120, e.ny * 120);
    addRing(e.x, e.y, NEUTRAL_ENERGY, 8, 0.4);
    shake = reducedMotion ? 0 : Math.min(shake + 1.1 * config.effectsIntensity, 2.4);
  } else if (tier === 2) {
    // Medium Collision
    burst(e.x, e.y, '#ffffff', 7, 0.7, e.nx * 60, e.ny * 60);
  } else {
    // Light Tap
    burst(e.x, e.y, NEUTRAL_ENERGY, 3, 0.4, e.nx * 30, e.ny * 30);
  }

  if (p) {
    p.glow = 1.0;
    p.pulse = 1.0;
    p.recoilX = reducedMotion ? 0 : -e.nx * (tier === 3 ? 1.4 : 0.6);
    p.recoilY = reducedMotion ? 0 : -e.ny * (tier === 3 ? 1.4 : 0.6);
    p.hotColor = NEUTRAL_ENERGY;
    ball.impact = 1;
  }

  hitSound(e);
}

function capture() {
  setState('capture');
  outcome = target;

  // Preserve exact physical landing position (zero teleportation or snapping)
  landingPos = { x: ball.x, y: ball.y };
  stage.style.setProperty('--capture-x', `${landingPos.x}px`);
  stage.style.setProperty('--capture-y', `${landingPos.y}px`);
  stage.style.setProperty('--capture-color', THEMES[target].color);

  ui.capture.classList.add('active');
  burst(landingPos.x, landingPos.y, THEMES[target].color, 42, 2.2);
  addRing(landingPos.x, landingPos.y, THEMES[target].color, 18, 0.95);
  shake = reducedMotion ? 0 : 2.5 * config.effectsIntensity;
  impactFlash = reducedMotion ? 0 : 0.35 * config.effectsIntensity;
  captureSound();
  announce('Energy captured. Unlocking your tech superpower.');
}

function reveal() {
  setState('result');
  const t = THEMES[outcome];

  ui.roundId.textContent = String(round).padStart(3, '0');
  ui.resultTitle.innerHTML = `${t.first}<span>${t.second}</span>`;
  ui.resultDescription.textContent = t.desc;
  ui.resultNext.textContent = t.cta;
  ui.resultIcon.innerHTML = t.pathSvg;
  ui.resultTags.replaceChildren(...t.tags.map(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));

  // Apply theme accent to entire result modal
  ui.result.style.setProperty('--theme-color', t.color);
  ui.result.dataset.theme = t.key.toLowerCase();
  ui.result.classList.add('visible');
  ui.playAgain.hidden = config.autoReset;
  document.querySelector('.result-bar').hidden = !config.autoReset;
  ui.result.inert = false;
  ui.result.setAttribute('aria-hidden', 'false');

  playVictoryTheme(outcome);
  announce(`Result revealed: ${t.title}. ${t.desc}`);
}

function reset() {
  stopVoices();
  pendingPulses.length = 0;
  photoMoment = false;
  ui.result.classList.remove('photo');
  revealG.clearRect(0, 0, W, H);
  setState('idle');
  ui.result.classList.remove('visible');
  ui.result.inert = true;
  ui.result.setAttribute('aria-hidden', 'true');
  ui.capture.classList.remove('active');
  ui.status.classList.remove('visible');
  ui.bottom.classList.remove('hidden');
  ui.comboHud.classList.remove('active');

  ball.x = 270;
  ball.y = 145;
  ball.vx = 0;
  ball.vy = 0;
  ball.spin = 0;
  ball.rotation = 0;
  trail.length = 0;
  shake = 0;
  impactFlash = 0;
  comboCount = 0;

  for (const p of pegs) {
    p.glow = 0;
    p.pulse = 0;
    p.recoilX = 0;
    p.recoilY = 0;
    p.hotColor = null;
  }

  for (const p of particlePool) {
    p.active = false;
  }
  rings.length = 0;
  if (!ui.operatorModal.classList.contains('open')) ui.start.focus({ preventScroll: true });

  announce('Tech Drop is ready. Press space, enter or tap to unlock your superpower.');
}

// ==========================================
// RENDER PIPELINE: CANVAS 2D SHADERS
// ==========================================
function drawPeg(c, p) {
  const power = Math.max(p.glow, p.pulse * 0.6);
  const color = p.hotColor || '#D8FF3E';
  const px = p.x + p.recoilX;
  const py = p.y + p.recoilY;
  const radius = Physics?.PEG_RADIUS || 8.0;

  // Outer ambient neon glow when energized
  if (power > 0.02) {
    ellipseGlow(c, px, py, radius * 3.8, [
      [0, color + Math.round(power * 140).toString(16).padStart(2, '0')],
      [1, color + '00']
    ]);
  }

  c.drawImage(pegMaterial, px - 13, py - 13, 26, 26);
  if (power > 0.1) {
    c.globalAlpha = power * 0.7;
    c.strokeStyle = color; c.lineWidth = 1.4;
    c.beginPath(); c.arc(px, py, radius, -Math.PI * 0.85, Math.PI * 0.4); c.stroke();
    c.globalAlpha = 1;
  }

  // Expanding Impact Ring
  if (power > 0.35) {
    c.globalAlpha = power * 0.45;
    c.strokeStyle = color;
    c.lineWidth = 1.4;
    c.beginPath();
    c.arc(px, py, radius * 1.4 + (1 - power) * 12, 0, TAU);
    c.stroke();
    c.globalAlpha = 1;
  }
}

function drawBall(c) {
  const color = flightColor();
  const r = ball.radius;

  // Additive Neon Motion Plasma Trail
  c.save();
  c.globalCompositeOperation = 'screen';
  for (let k = 1; k < trail.length; k++) {
    let prev = trail[k - 1], p = trail[k], a = k / trail.length;
    c.strokeStyle = color;
    c.globalAlpha = 0.08 + a * 0.45;
    c.lineWidth = 2.0 + 14.0 * a;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(prev.x, prev.y);
    c.lineTo(p.x, p.y);
    c.stroke();
  }
  c.globalAlpha = 1.0;
  ellipseGlow(c, ball.x, ball.y, r * 3.4, [
    [0, '#ffffffe5'],
    [0.25, color + 'aa'],
    [0.55, color + '35'],
    [1, color + '00']
  ]);
  c.restore();

  // Ball Core with Squash & Stretch
  let vx = ball.vx, vy = ball.vy;
  let angle = Math.atan2(vy, vx);
  let speed = Math.hypot(vx, vy);
  let stretch = reducedMotion ? 0 : clamp(speed / 700 + (ball.impact || 0) * 0.5, 0, 0.55);

  c.save();
  c.translate(ball.x, ball.y);
  c.rotate(angle);
  c.scale(1 + stretch * 0.28, 1 - stretch * 0.20);
  if (effectiveQuality !== 'low') {
    c.shadowColor = color;
    c.shadowBlur = 35;
  }

  // Metallic Chrome / Glass Orb Shader
  let grad = c.createRadialGradient(-4.5, -5.5, 1.0, 0, 0, r + 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.24, '#ffffff');
  grad.addColorStop(0.54, color);
  grad.addColorStop(0.82, '#183652');
  grad.addColorStop(1, '#051020');

  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fillStyle = grad;
  c.fill();
  c.restore();

  // Kinetic Angular Spin Gyro Ring (reflects real angular spin)
  c.save();
  c.translate(ball.x, ball.y);
  c.rotate(ball.rotation);
  c.beginPath();
  c.arc(0, 0, r * 1.35, 0, Math.PI * 1.35);
  c.strokeStyle = '#ffffffdd';
  c.lineWidth = 2.0;
  c.stroke();

  // Internal Core Crosshair
  c.beginPath();
  c.arc(0, 0, 5, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();

  // Specular Glint
  c.beginPath();
  c.arc(-4.5, -5.2, 3.2, 0, TAU);
  c.fillStyle = '#fffffffa';
  c.fill();
  c.restore();
}

function drawParticles(c) {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particlePool[i];
    if (!p.active) continue;
    let a = clamp(p.life / p.max, 0, 1);
    c.save();
    c.globalAlpha = a;
    if (p.kind === 'spark') {
      c.strokeStyle = p.color;
      c.lineWidth = Math.max(0.7, p.size * a * 0.5);
      c.beginPath(); c.moveTo(p.x, p.y);
      c.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); c.stroke();
    } else if (p.kind === 'confetti') {
      c.translate(p.x, p.y);
      c.rotate(p.angle);
      c.fillStyle = p.color;
      c.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
    }
    c.restore();
  }
}

function drawRings(c) {
  for (const ring of rings) {
    let a = clamp(ring.life / ring.maxLife, 0, 1);
    let r = ring.r + (1 - a) * 55;
    c.strokeStyle = ring.color;
    c.globalAlpha = a * 0.8;
    c.lineWidth = 2.2 * a;
    c.beginPath();
    c.arc(ring.x, ring.y, r, 0, TAU);
    c.stroke();
  }
  c.globalAlpha = 1;
}

function render() {
  if (state === 'result') {
    TechDropReveals.draw(revealG, outcome, stateTime, THEMES[outcome].color, !reducedMotion && config.effectsIntensity > 0);
    return;
  }
  g.clearRect(0, 0, W, H);
  g.drawImage(bg, 0, 0, W, H);

  // Dynamic Camera Recoil
  g.save();
  if (!reducedMotion && shake > 0.05) {
    g.translate(random(-shake * 0.5, shake * 0.5), random(-shake * 0.5, shake * 0.5));
  }
  rr(g, 24, 118, 492, 714, 22);
  g.clip();

  // Scanning laser beam
  let scan = reducedMotion ? 400 : 160 + (clock * 25) % 640;
  let scanner = g.createLinearGradient(0, scan - 30, 0, scan + 30);
  scanner.addColorStop(0, '#00f5d400');
  scanner.addColorStop(0.5, '#00f5d415');
  scanner.addColorStop(1, '#00f5d400');
  g.fillStyle = scanner;
  g.fillRect(30, scan - 30, 480, 60);

  // Floating ambient cyber dust
  for (const dot of ambient) {
    let a = dot.alpha * (reducedMotion ? 0.4 : 0.5 + 0.5 * Math.sin(clock * dot.v + dot.phase));
    g.beginPath();
    g.arc(dot.x + (reducedMotion ? 0 : Math.sin(clock * 0.25 + dot.phase) * 6), dot.y, dot.radius, 0, TAU);
    g.fillStyle = `rgba(115,244,255,${a})`;
    g.fill();
  }

  // Render Peg Array
  for (const p of pegs) drawPeg(g, p);

  // Emitter Core Glow
  if (state === 'idle' || state === 'launch') {
    const x = 270, y = 145;
    ellipseGlow(g, x, y, 55, [[0, '#eaffaaa0'], [0.2, '#d8ff3e35'], [1, '#d8ff3e00']]);
    g.strokeStyle = '#d8ff3e89';
    g.lineWidth = 2.2;
    g.beginPath();
    const idleTime = reducedMotion ? 0 : clock;
    g.arc(x, y, 22 + Math.sin(idleTime * 2.4) * 2.5, idleTime * 0.9, idleTime * 0.9 + Math.PI * 1.5);
    g.stroke();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(x, y, 8.5, 0, TAU);
    g.fill();
  }

  // Render Ball
  if (state === 'playing') drawBall(g);

  // Render Capture Blast at exact physical landing coordinates
  if (state === 'capture') {
    const travel = reducedMotion ? 1 : clamp((stateTime - 0.35) / 1.1, 0, 1);
    const eased = 1 - Math.pow(1 - travel, 3);
    const x = lerp(landingPos.x, 270, eased), y = lerp(landingPos.y, 390, eased);
    if (stateTime > 0.35) document.documentElement.dataset.phase = 'core-overload';
    const color = THEMES[target].color;
    if (!reducedMotion) {
      drawLine(g, landingPos.x, landingPos.y, x, y, color + '60', 3 + Math.sin(stateTime * 14));
      for (let i = 0; i < 3; i++) {
        g.globalAlpha = 0.45 * config.effectsIntensity;
        g.strokeStyle = color; g.lineWidth = 1;
        g.beginPath(); g.ellipse(x, y, 18 + i * 18 + eased * 35, 10 + i * 8, stateTime + i, 0, TAU); g.stroke();
      }
      g.globalAlpha = 1;
    }
    ellipseGlow(g, x, y, 40 + eased * 80, [
      [0, '#ffffffe5'],
      [0.2, color + 'bb'], [0.55, color + '24'], [1, color + '00']
    ]);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 10 + eased * 10, 0, TAU); g.fill();
  }

  drawRings(g);
  drawParticles(g);
  g.restore();

  // Screen Flash
  if (!reducedMotion && impactFlash > 0.01) {
    g.globalAlpha = impactFlash * 0.16;
    g.fillStyle = '#ddfff2';
    rr(g, 24, 118, 492, 714, 22);
    g.fill();
    g.globalAlpha = 1;
  }
}

// ==========================================
// PERFORMANCE PROFILER & DIAGNOSTIC HUD
// ==========================================
const fpsHistory = [];
const frameTimes = [];
let lastFpsUpdate = 0;
let currentFps = 60, smoothedFps = 60, onePercentLow = 58;
let showFpsHud = urlParams.has('fps') || urlParams.has('debug');

let lowFpsDuration = 0;
let highFpsDuration = 0;
let lastQualityChangeTime = 0;

const hudCanvas = document.createElement('canvas');
hudCanvas.id = 'perfHud';
hudCanvas.width = 195;
hudCanvas.height = 108;
hudCanvas.style.cssText = 'position:absolute;top:12px;left:12px;z-index:99;pointer-events:none;background:#050c18dd;border:1px solid #75fbfd55;border-radius:6px;padding:4px;display:' + (showFpsHud ? 'block' : 'none');
stage.appendChild(hudCanvas);
const hg = hudCanvas.getContext('2d');

function updatePerformanceMetrics(now, rawDt, simTimeMs) {
  const frameMs = rawDt * 1000;
  frameTimes.push(frameMs);
  if (frameTimes.length > 240) frameTimes.shift();

  if (now - lastFpsUpdate >= 200) {
    currentFps = Math.round(1 / Math.max(0.001, rawDt));
    fpsHistory.push(currentFps);
    if (fpsHistory.length > 40) fpsHistory.shift();

    smoothedFps = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);

    // 1% low FPS = 1000 / mean of the slowest 1% frame times (p99 is separate).
    if (frameTimes.length >= 60) {
      const sorted = [...frameTimes].sort((a, b) => a - b);
      const slowest = sorted.slice(-Math.max(1, Math.ceil(sorted.length * 0.01)));
      onePercentLow = Math.max(1, Math.round(1000 / (slowest.reduce((a, b) => a + b, 0) / slowest.length)));
    } else {
      onePercentLow = smoothedFps;
    }

    // Auto Quality Hysteresis
    if (qualityPreset === 'auto' && now - lastQualityChangeTime > 4000) {
      if (smoothedFps < 45) {
        lowFpsDuration += 0.2;
        highFpsDuration = 0;
        if (lowFpsDuration > 3.0) {
          if (effectiveQuality === 'high') effectiveQuality = 'medium';
          else if (effectiveQuality === 'medium') effectiveQuality = 'low';
          lowFpsDuration = 0;
          lastQualityChangeTime = now;
          resize();
        }
      } else if (smoothedFps >= 58) {
        highFpsDuration += 0.2;
        lowFpsDuration = 0;
        if (highFpsDuration > 6.0) {
          if (effectiveQuality === 'low') effectiveQuality = 'medium';
          else if (effectiveQuality === 'medium') effectiveQuality = 'high';
          highFpsDuration = 0;
          lastQualityChangeTime = now;
          resize();
        }
      } else {
        lowFpsDuration = 0;
        highFpsDuration = 0;
      }
    }

    lastFpsUpdate = now;
  }

  if (showFpsHud) {
    hg.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    hg.fillStyle = '#73f4ff';
    hg.font = '9px monospace';
    hg.fillText(`FPS: ${currentFps} (Avg: ${smoothedFps})`, 6, 14);
    hg.fillText(`1% Low: ${onePercentLow} FPS`, 6, 26);
    hg.fillText(`CPU: ${simTimeMs.toFixed(2)}ms | Scale: ${renderScale.toFixed(1)}`, 6, 38);
    hg.fillText(`Preset: ${qualityPreset.toUpperCase()} (${effectiveQuality})`, 6, 50);

    const activeCount = particlePool.filter(p => p.active).length;
    hg.fillText(`Particles: ${activeCount}/${MAX_PARTICLES}`, 6, 62);

    // Sparkline Graph
    hg.strokeStyle = '#d8ff3e';
    hg.lineWidth = 1;
    hg.beginPath();
    const gx = 6, gy = 70, gw = 180, gh = 32;
    for (let i = 0; i < fpsHistory.length; i++) {
      const val = clamp(fpsHistory[i], 0, 75);
      const px = gx + (i / (fpsHistory.length - 1 || 1)) * gw;
      const py = gy + gh - (val / 75) * gh;
      if (i === 0) hg.moveTo(px, py);
      else hg.lineTo(px, py);
    }
    hg.stroke();
  }
}

function toggleFpsHud() {
  showFpsHud = !showFpsHud;
  hudCanvas.style.display = showFpsHud ? 'block' : 'none';
  if (ui.cfgFpsToggle) ui.cfgFpsToggle.checked = showFpsHud;
}

// ==========================================
// RESIZE & HIGH-DPI SCALING
// ==========================================
function resize() {
  const ww = window.innerWidth, wh = window.innerHeight;
  const scale = Math.min(ww / W, wh / H);
  const cap = effectiveQuality === 'low' ? 1 : effectiveQuality === 'medium' ? 1.5 : 4;
  renderScale = Math.min(cap, scale * (window.devicePixelRatio || 1));
  canvas.width = Math.round(W * renderScale);
  canvas.height = Math.round(H * renderScale);
  g.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  bg.width = canvas.width; bg.height = canvas.height;
  b.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  renderBackgroundCache();
  pegMaterial.width = Math.ceil(26 * renderScale); pegMaterial.height = Math.ceil(26 * renderScale);
  const pc = pegMaterial.getContext('2d');
  pc.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  pc.fillStyle = '#00000090'; pc.beginPath(); pc.ellipse(14, 17, 9, 6, 0, 0, TAU); pc.fill();
  const chrome = pc.createLinearGradient(7, 5, 19, 22);
  [[0, '#f4fbff'], [0.22, '#9db5c6'], [0.45, '#244359'], [0.5, '#d5e7f1'], [0.64, '#527589'], [1, '#0a1726']].forEach(([at, color]) => chrome.addColorStop(at, color));
  pc.fillStyle = chrome; pc.beginPath(); pc.arc(13, 13, 8, 0, TAU); pc.fill();
  pc.strokeStyle = '#9bd6ed99'; pc.lineWidth = 0.7; pc.stroke();
  pc.fillStyle = '#ffffff'; pc.beginPath(); pc.ellipse(10.5, 9, 3.1, 1.2, -0.45, 0, TAU); pc.fill();
  revealCanvas.width = canvas.width; revealCanvas.height = canvas.height;
  revealG.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  stage.style.setProperty('--scale', scale);
}

window.addEventListener('resize', resize);

// ==========================================
// OPERATOR MODAL CONTROLLER (Shift + O)
// ==========================================
function openOperatorConfig() {
  if (!ui.operatorModal) return;
  ui.cfgMode.value = config.mode;
  ui.cfgEventTitle.value = config.eventName;
  ui.cfgEventSubtitle.value = config.eventSubtitle;
  ui.cfgDuration.value = String(config.resultDuration);
  ui.cfgDurationVal.textContent = config.resultDuration + 's';
  ui.cfgMasterVol.value = String(Math.round(config.masterVolume * 100));
  ui.cfgVolVal.textContent = Math.round(config.masterVolume * 100) + '%';
  ui.cfgSfxVol.value = String(Math.round(config.sfxVolume * 100));
  ui.cfgSfxVal.textContent = Math.round(config.sfxVolume * 100) + '%';
  ui.cfgQuality.value = qualityPreset;
  ui.cfgFpsToggle.checked = showFpsHud;
  ui.cfgAutoReset.checked = config.autoReset;
  ui.cfgEffects.value = String(Math.round(config.effectsIntensity * 100));
  ui.cfgCta.checked = config.showCta;
  ui.operatorModal.classList.add('open');
  ui.operatorModal.inert = false;
  ui.operatorModal.setAttribute('aria-hidden', 'false');
  ui.closeConfig.focus();
  updateDeviceNotice();
}

function closeOperatorConfig() {
  if (ui.operatorModal) {
    ui.operatorModal.classList.remove('open');
    ui.operatorModal.inert = true;
    ui.operatorModal.setAttribute('aria-hidden', 'true');
    stage.focus({ preventScroll: true });
    updateDeviceNotice();
  }
}

function saveOperatorConfig() {
  config.mode = ui.cfgMode.value;
  config.eventName = ui.cfgEventTitle.value;
  config.eventSubtitle = ui.cfgEventSubtitle.value;
  config.resultDuration = parseInt(ui.cfgDuration.value, 10);
  config.masterVolume = parseInt(ui.cfgMasterVol.value, 10) / 100;
  config.sfxVolume = parseInt(ui.cfgSfxVol.value, 10) / 100;
  qualityPreset = ui.cfgQuality.value;
  effectiveQuality = qualityPreset === 'auto' ? 'high' : qualityPreset;
  if (showFpsHud !== ui.cfgFpsToggle.checked) toggleFpsHud();
  config.autoReset = ui.cfgAutoReset.checked;
  ui.playAgain.hidden = config.autoReset;
  document.querySelector('.result-bar').hidden = !config.autoReset;
  config.effectsIntensity = Number(ui.cfgEffects.value) / 100;
  config.showCta = ui.cfgCta.checked;

  if (ui.brandTitle) ui.brandTitle.textContent = config.eventName;
  if (ui.brandSubtitle) ui.brandSubtitle.textContent = config.eventSubtitle;

  applyVolume();
  document.querySelector('.result-cta-box').hidden = !config.showCta;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...config, quality: qualityPreset })); } catch (_) {}

  resize();
  closeOperatorConfig();
}

ui.configBtn?.addEventListener('click', openOperatorConfig);
ui.closeConfig?.addEventListener('click', closeOperatorConfig);
ui.saveConfig?.addEventListener('click', saveOperatorConfig);

ui.cfgDuration?.addEventListener('input', e => ui.cfgDurationVal.textContent = e.target.value + 's');
ui.cfgMasterVol?.addEventListener('input', e => ui.cfgVolVal.textContent = e.target.value + '%');
ui.cfgSfxVol?.addEventListener('input', e => ui.cfgSfxVal.textContent = e.target.value + '%');

// ==========================================
// INPUT CONTROLLERS (Touch, Keyboard, Arcade)
// ==========================================
ui.start.addEventListener('click', () => {
  if (state === 'idle') start();
});

const heldKeys = new Set();
document.addEventListener('keyup', ev => heldKeys.delete(ev.code));
addEventListener('blur', () => heldKeys.clear());

document.addEventListener('keydown', ev => {
  if (ev.code === 'Tab' && ui.operatorModal.classList.contains('open')) {
    const controls = [...ui.operatorModal.querySelectorAll('button, input, select')];
    const index = controls.indexOf(document.activeElement);
    if (ev.shiftKey && index <= 0 || !ev.shiftKey && index === controls.length - 1) {
      ev.preventDefault(); controls[ev.shiftKey ? controls.length - 1 : 0].focus();
    }
    return;
  }
  if (ev.code === 'Escape') closeOperatorConfig();
  if (ev.target.closest('input, select, textarea') || ui.operatorModal.classList.contains('open') && !ev.shiftKey) return;
  if (ev.target.closest('button, a') && ['Space', 'Enter'].includes(ev.code)) {
    if (ev.repeat) ev.preventDefault();
    return; // Let keyboard activation click the focused native control.
  }
  // Operator Config Modal Toggle (Shift + O)
  if (ev.shiftKey && ev.code === 'KeyO') {
    ev.preventDefault();
    if (ui.operatorModal && ui.operatorModal.classList.contains('open')) closeOperatorConfig();
    else openOperatorConfig();
    return;
  }

  // Developer FPS HUD Toggle (Shift + F)
  if (ev.shiftKey && ev.code === 'KeyF') {
    ev.preventDefault();
    toggleFpsHud();
    return;
  }

  // Developer Panel Toggle (Shift + D)
  if (ev.shiftKey && ev.code === 'KeyD') {
    ev.preventDefault();
    ui.debug.style.display = ui.debug.style.display === 'block' ? 'none' : 'block';
    return;
  }

  // Space / Enter / KeyZ Arcade Actions
  if (ev.code === 'Space' || ev.code === 'Enter' || ev.code === 'KeyZ') {
    if (heldKeys.has(ev.code)) return;
    heldKeys.add(ev.code);
    ev.preventDefault();
    if (state === 'idle') start();
    else if (state === 'result') reset();
  }
});

ui.mute?.addEventListener('click', () => {
  unlockAudioContext();
  isMuted = !isMuted;
  if (isMuted) stopVoices();
  applyVolume();
});
$('resultMute').addEventListener('click', () => ui.mute.click());

ui.fullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

ui.skip?.addEventListener('click', () => {
  if (state === 'idle') start();
  else if (state === 'launch' || state === 'playing') capture();
  else if (state === 'capture') reveal();
});

ui.forceReset?.addEventListener('click', reset);
ui.playAgain.addEventListener('click', () => { reset(); start(); });

// ==========================================
// MAIN ENGINE LOOP
// ==========================================
let lastTime = performance.now();

function step(now) {
  const rawDt = Math.max(0.001, (now - lastTime) / 1000);
  lastTime = now;
  const dt = Math.min(0.06, rawDt);

  const simStart = performance.now();

  clock += dt;
  stateTime += dt;
  shake = Math.max(0, shake - dt * 6.5);
  impactFlash = Math.max(0, impactFlash - dt * 3.5);
  ball.impact = Math.max(0, (ball.impact || 0) - dt * 9);
  for (let i = pendingPulses.length - 1; i >= 0; i--) {
    const pulse = pendingPulses[i];
    if (pulse.at <= clock) {
      pulse.peg.glow = Math.max(pulse.peg.glow, pulse.power);
      pulse.peg.pulse = pulse.power;
      pulse.peg.hotColor = pulse.color;
      pendingPulses.splice(i, 1);
    }
  }

  cleanActiveVoices(audioContext?.currentTime || 0);

  // Fade peg illumination and return recoil
  for (const p of pegs) {
    p.glow = Math.max(0, p.glow - dt * 2.6);
    p.pulse = Math.max(0, p.pulse - dt * 2.0);
    p.recoilX = lerp(p.recoilX, 0, dt * 8);
    p.recoilY = lerp(p.recoilY, 0, dt * 8);
  }

  // Update active particles in pool
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particlePool[i];
    if (!p.active) continue;
    p.life -= dt;
    if (p.life <= 0) {
      p.active = false;
      continue;
    }
    p.vy += (p.kind === 'confetti' ? 140 : 340) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.max(0, 1 - 0.3 * dt);
    p.angle += p.spin * dt;
  }

  // Update shockwave rings
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].life -= dt;
    if (rings[i].life <= 0) rings.splice(i, 1);
  }

  if (state === 'launch' && stateTime > 0.45) {
    setState('playing');
  }

  if (state === 'playing') {
    let t = clamp(stateTime, 0, playingDuration);
    let p = atTrack(t);
    ball.x = p.x;
    ball.y = p.y;
    ball.vx = p.vx;
    ball.vy = p.vy;
    ball.spin = p.spin || 0;
    ball.rotation += (p.spin || 0) * dt;
    if (!finalApproach && ball.y > 650) {
      finalApproach = true;
      document.documentElement.dataset.phase = 'final-approach';
      ui.phase.textContent = 'ENERGY INBOUND';
      playSynthTone({ freq: 110, freqTo: 440, duration: 0.7, type: 'sine', volume: 0.12 });
    }

    trail.push({ x: ball.x, y: ball.y });
    const maxTrail = effectiveQuality === 'low' ? 14 : effectiveQuality === 'medium' ? 24 : 32;
    if (trail.length > maxTrail) trail.shift();

    let percent = clamp(t / playingDuration, 0, 1);
    ui.phaseFill.style.transform = `scaleX(${percent})`;
    ui.pct.textContent = String(Math.round(percent * 100)).padStart(2, '0') + '%';

    while (nextImpact < impactEvents.length && t >= impactEvents[nextImpact].showT) {
      impact(impactEvents[nextImpact]);
      nextImpact++;
    }

    if (t >= playingDuration) {
      capture();
    }
  }

  if (state === 'capture' && stateTime > 2.4) {
    reveal();
  }

  if (state === 'result') {
    if (!photoMoment && stateTime >= 2.1) {
      photoMoment = true;
      ui.result.classList.add('photo');
      document.documentElement.dataset.phase = 'photo-moment';
    }
    let activeResult = config.resultDuration;
    let remaining = Math.max(0, activeResult - Math.max(0, stateTime - 2.1));
    ui.resultProgress.style.transform = `scaleX(${clamp(remaining / activeResult, 0, 1)})`;
    ui.resetCountdown.textContent = config.autoReset ? 'NEXT DROP IN ' + Math.ceil(remaining) + 'S' : 'READY WHEN YOU ARE';
    if (remaining <= 0 && config.autoReset) {
      setState('resetting');
    }
  }

  if (state === 'resetting' && stateTime > 0.45) {
    reset();
  }

  render();
  const simTimeMs = performance.now() - simStart;
  updatePerformanceMetrics(now, rawDt, simTimeMs);

  requestAnimationFrame(step);
}

// ==========================================
// QA & AUTOMATED TEST INTERFACE
// ==========================================
Object.defineProperty(window, '__techDropQA', {
  value: {
    snapshot: () => ({
      state,
      round,
      target,
      outcome,
      pegs: pegs.length,
      impacts: impactEvents.length,
      impactHandled: nextImpact,
      trackPoints: track.length,
      landingX: track.at(-1)?.x,
      expectedX: slotCenter(target),
      landingPos,
      particles: particlePool.filter(p => p.active).length,
      fps: currentFps,
      smoothedFps,
      onePercentLow,
      quality: effectiveQuality,
      activeVoices: activeVoices.length
      , reducedMotion, muted: isMuted, masterLevel: masterGain?.gain.value ?? 0,
      pendingPulses: pendingPulses.length, ballColor: flightColor(), renderScale,
      renderer: 'Canvas 2D', frameTime: frameTimes.at(-1) || 0,
      p99FrameTime: frameTimes.length ? [...frameTimes].sort((a, b) => a - b)[Math.min(frameTimes.length - 1, Math.floor(frameTimes.length * 0.99))] : 0,
      canvasWidth: canvas.width, canvasHeight: canvas.height
      , revealScene: state === 'result' ? TechDropReveals.names[outcome] : null,
      phase: document.documentElement.dataset.phase, completed: track.at(-1)?.y === Physics.FLOOR_Y
    }),
    forceOutcome: n => {
      ui.forceOutcome.value = String(n);
      target = parseInt(n, 10);
    },
    start,
    reset,
    skip: () => {
      if (state === 'idle') start();
      else if (state === 'launch' || state === 'playing') capture();
      else if (state === 'capture') reveal();
    },
    toggleFps: toggleFpsHud,
    openConfig: openOperatorConfig,
    closeConfig: closeOperatorConfig,
    setQuality: q => {
      qualityPreset = ['auto', 'high', 'medium', 'low'].includes(q) ? q : 'high';
      effectiveQuality = qualityPreset === 'auto' ? 'high' : qualityPreset;
      resize();
    }
  }
});

setState('idle');
ui.brandTitle.textContent = config.eventName;
ui.brandSubtitle.textContent = config.eventSubtitle;
document.querySelector('.result-cta-box').hidden = !config.showCta;
applyVolume();
resize();
requestAnimationFrame(step);

})();
