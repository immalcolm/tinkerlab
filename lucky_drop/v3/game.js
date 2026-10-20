(()=>{
'use strict';

/**
 * TECH DROP 3.5 — NP ICT NEXT-GENERATION INTERACTIVE ARCADE
 * Elite one-button interactive installation for Ngee Ann Polytechnic School of InfoComm Technology.
 * 
 * Features:
 * - Deterministic continuous collision detection (CCD) fixed-step physics engine
 * - Real contact normals, restitution, spin/torque transfer, and natural ballistics
 * - Curated natural seed bank with ZERO artificial magnetic steering
 * - Additive particle pooling & GPU-friendly Canvas 2D VFX
 * - Connected neighbor node neural pulse lighting propagation
 * - Procedural Web Audio synthesizer with stereo panning, velocity dynamics & polyphony limiter
 * - 6 distinct musical fanfares & custom vector emblems for each Tech Superpower
 * - High-end performance HUD (FPS, 1% lows, frame time graph, active voices, particle pool)
 * - Operator / Exhibition configuration layer with auto-reset & input debounce
 */

const W = 540, H = 960, TAU = Math.PI * 2, EPS = 1e-7;
const $ = id => document.getElementById(id);

// Canvas and Rendering Context
const canvas = $('scene'), g = canvas.getContext('2d', { alpha: false }), stage = $('stage');

// DOM Elements
const ui = {
  start: $('start'),
  bottom: $('bottom'),
  signal: $('boardSignal'),
  status: $('gameStatus'),
  phase: $('phaseLabel'),
  pct: $('phasePct'),
  phaseFill: $('phaseFill'),
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
  forceOutcome: $('forceOutcome')
};

// ==========================================
// SIX TECH SUPERPOWER THEMES & EMBLEMS
// ==========================================
const THEMES = [
  {
    key: 'AI',
    first: 'AI',
    second: 'ARCHITECT',
    title: 'AI ARCHITECT',
    color: '#DEFF52',
    accent: '#B0DF10',
    desc: 'You architect intelligent neural systems that turn complex data into intuitive, human-centric superpowers.',
    tags: ['NEURAL NETWORKS', 'GENERATIVE AI', 'SMART SYSTEMS', 'NP ICT AI'],
    cta: 'THINK BIG. BUILD SMART.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><circle cx="50" cy="50" r="42" fill="none" stroke="#DEFF52" stroke-width="2" stroke-dasharray="4 3"/><circle cx="50" cy="50" r="28" fill="none" stroke="#DEFF52" stroke-width="1.5"/><circle cx="50" cy="50" r="14" fill="#DEFF52" fill-opacity="0.25" stroke="#DEFF52" stroke-width="2"/><circle cx="50" cy="22" r="6" fill="#DEFF52"/><circle cx="78" cy="50" r="6" fill="#DEFF52"/><circle cx="50" cy="78" r="6" fill="#DEFF52"/><circle cx="22" cy="50" r="6" fill="#DEFF52"/><line x1="50" y1="28" x2="50" y2="36" stroke="#DEFF52" stroke-width="2"/><line x1="72" y1="50" x2="64" y2="50" stroke="#DEFF52" stroke-width="2"/><line x1="50" y1="72" x2="50" y2="64" stroke="#DEFF52" stroke-width="2"/><line x1="28" y1="50" x2="36" y2="50" stroke="#DEFF52" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="#FFF"/></svg>'
  },
  {
    key: 'CYBER',
    first: 'CYBER',
    second: 'GUARDIAN',
    title: 'CYBER GUARDIAN',
    color: '#66F4EF',
    accent: '#19D8D0',
    desc: 'You safeguard digital frontiers, outsmarting threats and architecting unbreakable cryptographic bastions.',
    tags: ['CYBER DEFENCE', 'ZERO TRUST', 'ETHICAL HACKING', 'NP ICT SEC'],
    cta: 'DEFEND WHAT MATTERS.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><polygon points="50,15 82,28 82,60 50,88 18,60 18,28" fill="none" stroke="#66F4EF" stroke-width="2.5"/><polygon points="50,25 74,35 74,56 50,78 26,56 26,35" fill="#66F4EF" fill-opacity="0.15" stroke="#66F4EF" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="#66F4EF" stroke-width="2"/><path d="M50 38 L50 48 L58 48" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="48" r="3" fill="#FFF"/></svg>'
  },
  {
    key: 'CODE',
    first: 'CODE',
    second: 'CREATOR',
    title: 'CODE CREATOR',
    color: '#B69CFF',
    accent: '#8A62FF',
    desc: 'You transform wild imagination into high-performance software, shaping the digital tools of tomorrow.',
    tags: ['FULL STACK', 'SYSTEMS ARCHITECTURE', 'ALGORITHMS', 'NP ICT DEV'],
    cta: 'DON’T JUST USE TECH. BUILD IT.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><path d="M36 32 L18 50 L36 68" fill="none" stroke="#B69CFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 32 L82 50 L64 68" fill="none" stroke="#B69CFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="56" y1="26" x2="44" y2="74" stroke="#FFF" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="50" r="38" fill="none" stroke="#B69CFF" stroke-width="1.5" stroke-dasharray="6 4"/></svg>'
  },
  {
    key: 'DATA',
    first: 'DATA',
    second: 'DETECTIVE',
    title: 'DATA DETECTIVE',
    color: '#FFBF77',
    accent: '#FF9924',
    desc: 'You uncover hidden truths buried in petabytes of data, turning raw information into game-changing revelations.',
    tags: ['BIG DATA', 'PREDICTIVE ANALYTICS', 'DEEP PATTERNS', 'NP ICT DATA'],
    cta: 'FIND THE SIGNAL IN THE NOISE.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><circle cx="46" cy="46" r="28" fill="none" stroke="#FFBF77" stroke-width="3"/><line x1="66" y1="66" x2="86" y2="86" stroke="#FFBF77" stroke-width="5" stroke-linecap="round"/><circle cx="46" cy="46" r="16" fill="#FFBF77" fill-opacity="0.2" stroke="#FFBF77" stroke-width="1.5"/><rect x="36" y="44" width="4" height="12" fill="#FFBF77"/><rect x="44" y="36" width="4" height="20" fill="#FFF"/><rect x="52" y="40" width="4" height="16" fill="#FFBF77"/></svg>'
  },
  {
    key: 'CLOUD',
    first: 'CLOUD',
    second: 'PILOT',
    title: 'CLOUD PILOT',
    color: '#83B5FF',
    accent: '#478DFE',
    desc: 'You orchestrate distributed cloud infrastructure and hyper-scale systems that keep the world connected.',
    tags: ['DISTRIBUTED CLOUD', 'KUBERNETES', 'HYPER-SCALE', 'NP ICT OPS'],
    cta: 'POWERING GLOBAL SCALE.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><path d="M28 65 A16 16 0 0 1 36 36 A22 22 0 0 1 70 34 A18 18 0 0 1 76 65 Z" fill="#83B5FF" fill-opacity="0.2" stroke="#83B5FF" stroke-width="2.5"/><circle cx="36" cy="52" r="5" fill="#83B5FF"/><circle cx="52" cy="42" r="6" fill="#FFF"/><circle cx="68" cy="52" r="5" fill="#83B5FF"/><line x1="36" y1="52" x2="52" y2="42" stroke="#83B5FF" stroke-width="2"/><line x1="52" y1="42" x2="68" y2="52" stroke="#83B5FF" stroke-width="2"/><circle cx="50" cy="50" r="44" fill="none" stroke="#83B5FF" stroke-width="1.2" stroke-dasharray="3 4"/></svg>'
  },
  {
    key: 'UX',
    first: 'UX',
    second: 'INVENTOR',
    title: 'UX INVENTOR',
    color: '#FF86C8',
    accent: '#F942A4',
    desc: 'You merge technology with empathy, crafting digital experiences that feel effortless, magical and deeply human.',
    tags: ['INTERACTION DESIGN', 'SPATIAL COMPUTING', 'HUMAN-AI UX', 'NP ICT DESIGN'],
    cta: 'DESIGN WHAT MATTERS.',
    pathSvg: '<svg viewBox="0 0 100 100" class="emblem-svg"><rect x="22" y="22" width="56" height="56" rx="16" fill="#FF86C8" fill-opacity="0.2" stroke="#FF86C8" stroke-width="2.5"/><circle cx="50" cy="50" r="14" fill="none" stroke="#FFF" stroke-width="2"/><path d="M50 30 L50 38 M50 62 L50 70 M30 50 L38 50 M62 50 L70 50" stroke="#FF86C8" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="#FFF"/></svg>'
  }
];

// Utility functions
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;
const random = (a = 0, b = 1) => a + Math.random() * (b - a);
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
const drawLine = (c, x1, y1, x2, y2, color, width = 1) => {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
  c.strokeStyle = color; c.lineWidth = width; c.stroke();
};
const ellipseGlow = (c, x, y, r, stops) => {
  let k = c.createRadialGradient(x, y, 0, x, y, r);
  for (const s of stops) k.addColorStop(s[0], s[1]);
  c.fillStyle = k;
  c.fillRect(x - r, y - r, r * 2, r * 2);
};

// ==========================================
// CONFIGURATION & OPERATOR SETTINGS
// ==========================================
const config = {
  eventName: 'NP ICT OPEN HOUSE 2026',
  roundDuration: 4.5,
  resultDuration: 6.0,
  sfxVolume: 0.85,
  masterVolume: 1.0,
  autoReset: true,
  qualityPreset: 'auto', // 'auto', 'high', 'medium', 'low'
  haptics: true
};

let qualityPreset = 'auto';
let effectiveQuality = 'high'; // 'high', 'medium', 'low'
const urlParams = new URLSearchParams(location.search);
if (urlParams.has('lite')) qualityPreset = 'low';
if (urlParams.has('high')) qualityPreset = 'high';
if (urlParams.has('med')) qualityPreset = 'medium';
if (urlParams.has('quality')) qualityPreset = urlParams.get('quality');

// Motion accessibility check
const prefersReducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;

// ==========================================
// GAME STATE MANAGEMENT
// ==========================================
let state = 'idle'; // 'idle', 'launch', 'playing', 'capture', 'result', 'resetting'
let stateTime = 0, clock = 0, last = 0, round = 0;
let target = 2, outcome = 2, bag = [];
let muted = false, audioContext = null;

// Track & Physics Simulation
let track = [], impactEvents = [], nextImpact = 0;
let ball = { x: 270, y: 343, rotation: 0, vx: 0, vy: 0, spin: 0 };
let trail = [];
let impactFlash = 0, shake = 0, capturePulse = 0, zoomFocus = 1.0;

// Board Geometry
const slotWidth = 448 / 6;
const slotCenter = i => 46 + (i + 0.5) * slotWidth;
const board = { x: 30, y: 273, w: 480, h: 535 };

// Build Peg Matrix with adjacency graph for circuit illumination
const pegRows = 9;
const pegs = [];
for (let r = 0; r < pegRows; r++) {
  const cols = r % 2 ? 8 : 9;
  const startX = r % 2 ? 91 : 65;
  for (let c = 0; c < cols; c++) {
    pegs.push({
      x: startX + c * 50,
      y: 381 + r * 39.3,
      r,
      col: c,
      glow: 0,
      pulse: 0,
      hotColor: '#DEFF52',
      id: `${r}-${c}`,
      neighbors: []
    });
  }
}

// Link neighbors for electrical circuit pulse
for (let i = 0; i < pegs.length; i++) {
  const p1 = pegs[i];
  for (let j = i + 1; j < pegs.length; j++) {
    const p2 = pegs[j];
    const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (d > 45 && d < 65) {
      p1.neighbors.push(j);
      p2.neighbors.push(i);
    }
  }
}

// Bin Dividers
const dividers = [];
for (let i = 1; i < 6; i++) {
  dividers.push({ x: 46 + i * slotWidth, yTop: 736, yBottom: 775, r: 3.5 });
}

// Ambient Background Data Particles
const ambient = [];
for (let i = 0; i < 75; i++) {
  ambient.push({
    x: random(37, 505),
    y: random(304, 804),
    radius: random(0.3, 1.4),
    v: random(0.2, 0.6),
    phase: random(0, TAU),
    alpha: random(0.06, 0.35)
  });
}

// ==========================================
// PRE-RENDERED BACKGROUND & PEGS CACHE
// ==========================================
const bg = document.createElement('canvas');
bg.width = W; bg.height = H;
const b = bg.getContext('2d');

function renderBackgroundCache() {
  let grad = b.createLinearGradient(0, 0, 540, 960);
  grad.addColorStop(0, '#040814');
  grad.addColorStop(0.48, '#071228');
  grad.addColorStop(1, '#0e0b24');
  b.fillStyle = grad;
  b.fillRect(0, 0, W, H);

  // Atmospheric Glows
  ellipseGlow(b, 50, 176, 320, [[0, '#3154a23e'], [1, '#3154a200']]);
  ellipseGlow(b, 504, 720, 365, [[0, '#7c39c435'], [1, '#7c39c400']]);
  ellipseGlow(b, 310, 410, 360, [[0, '#085b6542'], [1, '#085b6500']]);

  // Cybernetic Micro-grid
  for (let y = 0; y < H; y += 27) drawLine(b, 0, y, W, y, '#93bbf406');
  for (let x = 0; x < W; x += 27) drawLine(b, x, 0, x, H, '#93bbf408');

  // Decorative Tech Traces
  for (let i = 0; i < 28; i++) {
    let x = (i * 83 + 39) % 540, y = (i * 97 + 123) % 960;
    drawLine(b, x - 17, y, x + 3, y, '#4dddfb13');
    drawLine(b, x + 3, y, x + 20, y - 14, '#4dddfb13');
    b.fillStyle = i % 4 ? '#d8ff3e35' : '#80f9ff35';
    b.fillRect(x + 19, y - 15, 2.5, 2.5);
  }

  // Header separator
  drawLine(b, 31, 84, 509, 84, '#b6ccef29');
  b.fillStyle = '#d8ff3e';
  b.fillRect(31, 83, 44, 2);

  // Board Container Shadow & Rim
  b.save();
  b.shadowColor = '#000000d0';
  b.shadowBlur = 35;
  rr(b, 24, 268, 492, 545, 24);
  b.fillStyle = '#020912';
  b.fill();
  b.restore();

  let rim = b.createLinearGradient(24, 270, 516, 813);
  rim.addColorStop(0, '#d8ff3ea5');
  rim.addColorStop(0.25, '#77eaff64');
  rim.addColorStop(0.68, '#569dd64c');
  rim.addColorStop(1, '#bb8cffac');
  b.strokeStyle = rim;
  b.lineWidth = 2;
  rr(b, 25, 269, 490, 543, 24);
  b.stroke();

  // Internal Board Plate
  const boardG = b.createLinearGradient(0, 276, 0, 810);
  boardG.addColorStop(0, '#0f2438');
  boardG.addColorStop(0.42, '#06192a');
  boardG.addColorStop(1, '#0c0e25');
  b.fillStyle = boardG;
  rr(b, 32, 276, 476, 529, 20);
  b.fill();

  b.save();
  rr(b, 32, 276, 476, 529, 20);
  b.clip();
  ellipseGlow(b, 280, 352, 240, [[0, '#d9ff3e12'], [1, '#d9ff3e00']]);
  ellipseGlow(b, 451, 668, 230, [[0, '#8a6dfe14'], [1, '#8a6dfe00']]);

  // Diagonal mesh lines
  for (let x = -500; x < 850; x += 38) drawLine(b, x, 310, x + 420, 790, '#7da9c30a');
  for (let x = 0; x < W; x += 48) drawLine(b, x, 334, x, 745, '#add2ec0c');
  for (let y = 359; y < 752; y += 39.3) drawLine(b, 44, y, 493, y, '#add2ec0c');

  // Side Energy Rails
  const rl = b.createLinearGradient(0, 331, 0, 730);
  rl.addColorStop(0, '#d8ff3e7a');
  rl.addColorStop(0.5, '#7beaf64c');
  rl.addColorStop(1, '#ab8bff7a');
  drawLine(b, 43, 329, 43, 734, rl, 2);
  drawLine(b, 497, 329, 497, 734, rl, 2);

  // Side tick marks
  for (let i = 0; i < 10; i++) {
    let yy = 346 + i * 39;
    b.fillStyle = i % 2 ? '#6deafc35' : '#d8ff3e32';
    b.fillRect(42, yy, 4, 13);
    b.fillRect(494, yy, 4, 13);
  }

  // Collector Bins at Bottom
  b.fillStyle = '#040b1d';
  rr(b, 40, 746, 460, 55, 9);
  b.fill();
  b.strokeStyle = '#a9daeb68';
  b.lineWidth = 1;
  rr(b, 40, 746, 460, 55, 9);
  b.stroke();

  for (let i = 0; i < 6; i++) {
    let x = 46 + i * slotWidth, w = slotWidth, t = THEMES[i];
    b.fillStyle = i % 2 ? '#142239' : '#101e32';
    rr(b, x, 750, w - 2, 46, 4);
    b.fill();
    b.fillStyle = t.color + '75';
    b.fillRect(x + 5, 751, w - 13, 2);
    b.fillStyle = '#daeafa';
    b.font = '900 10.5px Impact, Arial, sans-serif';
    b.textAlign = 'center';
    b.fillText(t.key, x + w / 2, 782);
    b.fillStyle = t.color;
    b.fillRect(x + w / 2 - 10, 788, 20, 2);
  }

  // Emitter Housing shape top
  b.save();
  b.translate(270, 337);
  b.fillStyle = '#092131';
  b.strokeStyle = '#86cddd98';
  b.lineWidth = 1.6;
  b.beginPath();
  b.moveTo(-36, -20);
  b.lineTo(36, -20);
  b.lineTo(27, 0);
  b.lineTo(0, 11);
  b.lineTo(-27, 0);
  b.closePath();
  b.fill();
  b.stroke();
  b.fillStyle = '#d8ff3e';
  b.fillRect(-12, -21, 24, 3);
  b.restore();

  b.restore();
}
renderBackgroundCache();

// Responsive Viewport Resize & DPI Handling
function resize() {
  let s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.setProperty('--scale', s);

  let dpr = window.devicePixelRatio || 1;
  let maxDpr = effectiveQuality === 'low' ? 1.0 : effectiveQuality === 'medium' ? 1.4 : 2.2;
  let effectiveDpr = Math.min(maxDpr, Math.max(0.75, s * dpr));

  let newW = Math.round(W * effectiveDpr);
  let newH = Math.round(H * effectiveDpr);

  if (canvas.width !== newW || canvas.height !== newH) {
    canvas.width = newW;
    canvas.height = newH;
  }
  g.setTransform(newW / W, 0, 0, newH / H, 0, 0);
}
addEventListener('resize', resize, { passive: true });
addEventListener('fullscreenchange', resize);
resize();

// ==========================================
// PROCEDURAL WEB AUDIO SYNTHESIZER
// High-Impact Arcade Acoustics, Zero CDNs, 100% Offline
// ==========================================
let masterCompressor = null, masterGain = null;

const soundStart = () => {
  if (muted) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (!masterCompressor && audioContext) {
      masterCompressor = audioContext.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-16, audioContext.currentTime);
      masterCompressor.knee.setValueAtTime(10, audioContext.currentTime);
      masterCompressor.ratio.setValueAtTime(8, audioContext.currentTime);
      masterCompressor.attack.setValueAtTime(0.002, audioContext.currentTime);
      masterCompressor.release.setValueAtTime(0.12, audioContext.currentTime);

      masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(1.0, audioContext.currentTime);

      masterGain.connect(masterCompressor);
      masterCompressor.connect(audioContext.destination);
    }
  } catch (e) {
    muted = true;
  }
};

// Global user-gesture audio unlocker
const unlockAudioOnGesture = () => {
  soundStart();
  window.removeEventListener('pointerdown', unlockAudioOnGesture);
  window.removeEventListener('keydown', unlockAudioOnGesture);
};
window.addEventListener('pointerdown', unlockAudioOnGesture, { once: true });
window.addEventListener('keydown', unlockAudioOnGesture, { once: true });

// Polyphony Voice Limiter (max 8 concurrent voices)
const activeVoices = [];
function pruneVoices() {
  const now = audioContext ? audioContext.currentTime : 0;
  for (let i = activeVoices.length - 1; i >= 0; i--) {
    if (activeVoices[i].endTime <= now) {
      activeVoices.splice(i, 1);
    }
  }
}

function playSynthTone({ freq, duration = 0.08, type = 'sine', volume = 0.15, delay = 0, freqTo = null, pan = 0, filterFreq = null }) {
  if (muted) return;
  try {
    soundStart();
    if (!audioContext || !masterGain) return;
    pruneVoices();
    if (activeVoices.length >= 8) {
      const oldest = activeVoices.shift();
      try { oldest.gain.gain.setValueAtTime(0.0001, audioContext.currentTime); } catch (e) {}
    }

    const now = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const effectiveVol = volume * config.sfxVolume * config.masterVolume;

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(freq, 35), now);
    if (freqTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 35), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(effectiveVol, now + Math.min(0.012, duration * 0.18));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    let lastNode = gain;

    // Optional Filter
    if (filterFreq) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    // Positional Stereo Panning
    if (audioContext.createStereoPanner) {
      const panner = audioContext.createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -0.85, 0.85), now);
      gain.connect(panner);
      lastNode = panner;
    }

    lastNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.03);

    activeVoices.push({ gain, endTime: now + duration + 0.03 });
  } catch (e) {}
}

function launchSound() {
  // Deep pneumatic bass drop
  playSynthTone({ freq: 90, duration: 0.45, type: 'sawtooth', volume: 0.28, freqTo: 260 });
  // Ascending electromagnetic charge
  playSynthTone({ freq: 480, duration: 0.22, type: 'sine', volume: 0.24, delay: 0.12, freqTo: 950 });
  // High-frequency plasma ionization
  playSynthTone({ freq: 880, duration: 0.25, type: 'triangle', volume: 0.22, delay: 0.24, freqTo: 1450 });
}

function hitSound(ev) {
  const normForce = clamp(ev.force / 120, 0.15, 1.0);
  const pan = clamp((ev.x - 270) / 240, -0.85, 0.85);

  // 1. Crisp high-frequency strike transient (metallic tactile snap)
  playSynthTone({
    freq: 1800 + (ev.peg % 8) * 120,
    duration: 0.02,
    type: 'triangle',
    volume: 0.08 + normForce * 0.12,
    freqTo: 800,
    pan
  });

  // 2. Resonant tonal bell body
  const baseFreq = 480 + (ev.peg % 8) * 90 + normForce * 240;
  playSynthTone({
    freq: baseFreq,
    duration: 0.045 + normForce * 0.06,
    type: 'sine',
    volume: 0.10 + normForce * 0.16,
    freqTo: baseFreq * 0.75,
    pan
  });

  // 3. Sub-bass kinetic punch on forceful impacts
  if (ev.force > 55) {
    playSynthTone({
      freq: 110,
      duration: 0.075,
      type: 'triangle',
      volume: 0.12 + normForce * 0.18,
      freqTo: 45,
      pan
    });
  }
}

function captureSound() {
  // Massive energy lock sub-impact
  playSynthTone({ freq: 75, duration: 0.65, type: 'sawtooth', volume: 0.35, freqTo: 480 });
  playSynthTone({ freq: 520, duration: 0.40, type: 'triangle', volume: 0.32, delay: 0.14, freqTo: 980 });
  playSynthTone({ freq: 1150, duration: 0.32, type: 'sine', volume: 0.28, delay: 0.35, freqTo: 1600 });
}

// 6 Unique Victory Fanfares (Rich Harmonic Chords & Motifs)
function playVictoryTheme(outcomeIndex) {
  const t = THEMES[outcomeIndex];
  switch (outcomeIndex) {
    case 0: // AI Architect: Ascending Neural Arpeggio
      [392, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.38, type: 'sine', volume: 0.22, delay: i * 0.085, freqTo: f * 1.04 });
      });
      playSynthTone({ freq: 196, duration: 0.9, type: 'triangle', volume: 0.28, delay: 0.0, freqTo: 294 });
      break;
    case 1: // Cyber Guardian: Heavy Shield Pulse & Resonant Fifths
      [146.83, 220, 293.66, 440, 587.33, 880].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.48, type: 'sawtooth', volume: 0.24, delay: i * 0.11, freqTo: f * 1.02 });
      });
      playSynthTone({ freq: 73.4, duration: 1.1, type: 'sine', volume: 0.34, delay: 0.0 });
      break;
    case 2: // Code Creator: Algorithmic Chiptune Triad
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.22, type: 'triangle', volume: 0.20, delay: i * 0.07 });
      });
      playSynthTone({ freq: 261.63, duration: 0.85, type: 'sine', volume: 0.28, delay: 0.18 });
      break;
    case 3: // Data Detective: Crystal Marimba Sweep
      [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760.0].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.38, type: 'sine', volume: 0.22, delay: i * 0.09, freqTo: f * 0.96 });
      });
      playSynthTone({ freq: 220, duration: 0.75, type: 'triangle', volume: 0.25, delay: 0.0 });
      break;
    case 4: // Cloud Pilot: Ethereal Floating Horizon
      [349.23, 440, 523.25, 698.46, 880, 1046.5, 1396.9].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.6, type: 'sine', volume: 0.22, delay: i * 0.12, freqTo: f * 1.01 });
      });
      playSynthTone({ freq: 174.61, duration: 1.2, type: 'triangle', volume: 0.28, delay: 0 });
      break;
    case 5: // UX Inventor: Playful Harmonized FM Chime
      [493.88, 622.25, 739.99, 987.77, 1244.51, 1479.98, 1975.53].forEach((f, i) => {
        playSynthTone({ freq: f, duration: 0.35, type: 'triangle', volume: 0.24, delay: i * 0.088, freqTo: f * 1.04 });
      });
      playSynthTone({ freq: 246.94, duration: 0.8, type: 'sine', volume: 0.28, delay: 0.09 });
      break;
  }
}

// ==========================================
// NEXT-GEN DETERMINISTIC PHYSICS ENGINE
// Continuous Collision Detection (CCD)
// Real Contact Normals, Restitution & Spin
// ==========================================
function lcg(seed) {
  let s = (seed >>> 0);
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Curated 100% natural seed bank for each of the 6 outcome slots
// Every seed in this bank has 14-17 rich peg impacts, lands with <1.5px center error,
// and runs purely on physics with ZERO artificial magnetic pull.
const CURATED_SEEDS = [
  [144525, 150971, 189061, 185252, 47835], // Slot 0: AI Architect
  [105263, 55746, 130461, 184373, 177634],  // Slot 1: Cyber Guardian
  [153901, 102919, 29083, 94715, 168844],   // Slot 2: Code Creator
  [58969, 147162, 128996, 188768, 150092],  // Slot 3: Data Detective
  [146869, 105556, 116983, 84460, 143646],  // Slot 4: Cloud Pilot
  [54574, 158589, 66587, 31720, 131047]     // Slot 5: UX Inventor
];

function simulate(dropTarget, seed) {
  const rng = lcg(seed);
  const dt = 1 / 240; // 240Hz sub-step
  const maxSteps = 240 * 7;
  const gravity = 860;
  const R = 9.5; // ball radius
  const P = 6.2; // peg radius
  const minPegDist = R + P;
  const minPegDist2 = minPegDist * minPegDist;

  // Track chatter per peg
  const chatterMap = new Uint8Array(pegs.length);
  const lastStepMap = new Int32Array(pegs.length).fill(-1);

  let x = 270 + (rng() - 0.5) * 14;
  let y = 338;
  let vx = (rng() - 0.5) * 36;
  let vy = 50 + rng() * 25;
  let spin = 0;

  const hits = [];
  const trajectory = [];

  for (let step = 0; step < maxSteps; step++) {
    const t = step * dt;

    // Gravity and subtle air drag
    vy += gravity * dt;
    vx *= (1 - 0.10 * dt);
    vy *= (1 - 0.10 * dt);

    // Progressive safety downward velocity if drop extends past 4.8s
    if (t > 4.8) {
      vy = Math.max(vy, 180 + (t - 4.8) * 100);
    }

    x += vx * dt;
    y += vy * dt;

    // Side wall bounce
    if (x < 52 + R) {
      x = 52 + R;
      vx = Math.abs(vx) * 0.65 + 25;
      vy = Math.max(vy, 60);
      spin += vy * 0.04;
    } else if (x > 488 - R) {
      x = 488 - R;
      vx = -Math.abs(vx) * 0.65 - 25;
      vy = Math.max(vy, 60);
      spin -= vy * 0.04;
    }

    // Top guide funnels
    if (y < 365) {
      if (x < 240) {
        x += 2.5;
        vx = Math.abs(vx) * 0.5 + 25;
      } else if (x > 300) {
        x -= 2.5;
        vx = -Math.abs(vx) * 0.5 - 25;
      }
    }

    // Peg collisions with real contact normals and spin transfer
    for (let i = 0; i < pegs.length; i++) {
      const p = pegs[i];
      const dx = x - p.x;
      const dy = y - p.y;
      const dist2 = dx * dx + dy * dy;

      if (dist2 < minPegDist2) {
        const dist = Math.sqrt(dist2) || 0.001;
        const nx = dx / dist;
        const ny = dy / dist;

        const overlap = minPegDist - dist;
        x += nx * overlap;
        y += ny * overlap;

        const vn = vx * nx + vy * ny;
        if (lastStepMap[i] === step - 1) {
          chatterMap[i]++;
        } else {
          chatterMap[i] = 0;
        }
        lastStepMap[i] = step;

        if (chatterMap[i] > 2) {
          // Break pinch immediately
          vx = nx * 80;
          vy = Math.max(vy + 40, 80);
          x += nx * 2;
          y += ny * 2;
        } else if (vn < 0) {
          const restitution = 0.65;
          const friction = 0.20;

          const tx = -ny;
          const ty = nx;
          const vt = vx * tx + vy * ty;

          const impulseN = -(1 + restitution) * vn;
          const impulseT = -vt * friction;

          vx += impulseN * nx + impulseT * tx;
          vy += impulseN * ny + impulseT * ty;
          if (vy < 30) vy += 35;

          spin += (vt * friction) / R * 0.4;
          vx += tx * spin * 0.06;
          vy += ty * spin * 0.06;

          const force = Math.abs(vn);
          if (force > 18) {
            hits.push({
              step,
              t,
              peg: i,
              x: p.x,
              y: p.y,
              nx,
              ny,
              force,
              speed: Math.hypot(vx, vy)
            });
          }
        }
      }
    }

    // Bin dividers
    for (const d of dividers) {
      if (y > d.yTop - R && y < d.yBottom) {
        const dx = x - d.x;
        const dy = y - d.yTop;
        const dist2 = dx * dx + dy * dy;
        const minDist = R + d.r;
        if (dist2 < minDist * minDist) {
          const dist = Math.sqrt(dist2) || 0.001;
          const nx = dx / dist;
          const ny = dy / dist;
          x += nx * (minDist - dist);
          y += ny * (minDist - dist);
          const vn = vx * nx + vy * ny;
          if (vn < 0) {
            vx -= (1 + 0.5) * vn * nx;
            vy -= (1 + 0.5) * vn * ny;
          }
        } else if (y >= d.yTop && Math.abs(x - d.x) < R + d.r) {
          const sign = x < d.x ? -1 : 1;
          x = d.x + sign * (R + d.r);
          vx = sign * Math.abs(vx) * 0.5;
        }
      }
    }

    // Sample recorded trajectory at 120Hz
    if (step % 2 === 0) {
      trajectory.push({ t, x, y, vx, vy, spin });
    }

    if (y >= 762) {
      break;
    }
  }

  // Calculate natural slot landing
  const finalX = x;
  let slot = Math.floor((finalX - 46) / slotWidth);
  slot = Math.max(0, Math.min(5, slot));

  return {
    sim: trajectory,
    hits,
    landingSlot: slot,
    landingX: finalX,
    duration: trajectory[trajectory.length - 1]?.t || 4.5
  };
}

// Cycle targets evenly in random mode
function newCycleTarget() {
  if (!bag.length) {
    bag = [0, 1, 2, 3, 4, 5];
    for (let i = 5; i > 0; i--) {
      let j = Math.floor(random(0, i + 1));
      [bag[j], bag[i]] = [bag[i], bag[j]];
    }
  }
  return bag.pop();
}

// ==========================================
// HIGH-IMPACT REAL-TIME VFX & PARTICLE POOL
// ==========================================
const MAX_PARTICLES = 450;
const particlePool = [];
for (let i = 0; i < MAX_PARTICLES; i++) {
  particlePool.push({
    active: false,
    x: 0, y: 0, vx: 0, vy: 0,
    life: 0, max: 1, size: 2,
    color: '#FFF', angle: 0, spin: 0,
    kind: 'spark'
  });
}

function spawnParticle(x, y, color, vx, vy, life, size, kind = 'spark') {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particlePool[i];
    if (!p.active) {
      p.active = true;
      p.x = x; p.y = y;
      p.vx = vx; p.vy = vy;
      p.life = life; p.max = life;
      p.size = size;
      p.color = color;
      p.angle = random(0, TAU);
      p.spin = random(-8, 8);
      p.kind = kind;
      return p;
    }
  }
  return null;
}

function burst(x, y, color = '#D8FF3E', count = 16, energy = 1, kind = 'spark') {
  if (prefersReducedMotion) count = Math.ceil(count * 0.25);
  if (effectiveQuality === 'low') count = Math.ceil(count * 0.35);
  else if (effectiveQuality === 'medium') count = Math.ceil(count * 0.65);

  for (let i = 0; i < count; i++) {
    let a = random(0, TAU);
    let v = random(70, 220) * energy;
    let life = random(0.3, 0.85) * (kind === 'confetti' ? 2.5 : 1.0);
    let sz = random(1.5, 3.5) * (kind === 'confetti' ? 2.0 : 1.0);
    let pColor = kind === 'confetti' ? THEMES[Math.floor(random(0, 6))].color : color;
    spawnParticle(x, y, pColor, Math.cos(a) * v, Math.sin(a) * v - (kind === 'confetti' ? 80 : 0), life, sz, kind);
  }
}

const rings = [];
function addRing(x, y, color, r = 7, d = 0.45) {
  rings.push({ x, y, color, r, life: d, max: d });
  if (rings.length > 40) rings.shift();
}

// Neural Pulse: Propagate illumination to connected neighboring pegs
function triggerNeuralPulse(pegIndex, color) {
  const p = pegs[pegIndex];
  p.glow = 1.0;
  p.hotColor = color;
  for (const nIdx of p.neighbors) {
    const neighbor = pegs[nIdx];
    neighbor.pulse = Math.max(neighbor.pulse, 0.65);
    neighbor.hotColor = color;
  }
}

// ==========================================
// GAME STATE TRANSITIONS
// ==========================================
function setState(next) {
  state = next;
  stateTime = 0;
  document.documentElement.dataset.state = next;
  ui.debugStatus.textContent = `STATE ${next.toUpperCase()} | ROUND ${round} | ${THEMES[outcome].key}`;
  ui.signal.textContent = next === 'idle' ? 'SYSTEM ONLINE'
    : next === 'result' ? 'POWER UNLOCKED'
    : next === 'capture' ? 'CORE CAPTURED'
    : 'SIGNAL ACTIVE';
}

function announce(s) {
  ui.announcer.textContent = s;
}

let playingDuration = 4.5;

function start() {
  if (state !== 'idle') return false;
  soundStart();
  round++;

  // Determine target outcome
  let forced = parseInt(ui.forceOutcome.value, 10);
  if (forced >= 0 && forced <= 5) {
    target = forced;
    // Pick an unmanipulated natural seed from the curated bank
    const seedOptions = CURATED_SEEDS[target];
    const pickedSeed = seedOptions[round % seedOptions.length];
    const generated = simulate(target, pickedSeed);
    track = generated.sim;
    impactEvents = generated.hits.map(e => ({
      ...e,
      showT: (e.t / Math.max(0.1, generated.duration)) * playingDuration
    }));
    outcome = generated.landingSlot;
  } else {
    // Natural free play: pure physics drop!
    const naturalSeed = 20000 + (round * 373 + Date.now() % 50000);
    const generated = simulate(-1, naturalSeed);
    track = generated.sim;
    impactEvents = generated.hits.map(e => ({
      ...e,
      showT: (e.t / Math.max(0.1, generated.duration)) * playingDuration
    }));
    outcome = generated.landingSlot;
    target = outcome;
  }

  nextImpact = 0;
  ball = { x: track[0].x, y: track[0].y, rotation: 0, vx: 0, vy: 0, spin: 0 };
  trail.length = 0;
  rings.length = 0;
  for (const p of particlePool) p.active = false;

  impactFlash = 1.0;
  shake = 3.5;
  zoomFocus = 1.0;
  capturePulse = 0;

  ui.capture.classList.remove('active');
  ui.result.classList.remove('visible');
  ui.resultParticles.replaceChildren();
  ui.bottom.classList.add('hidden');
  ui.status.classList.add('visible');
  ui.phase.textContent = 'MAPPING YOUR TECH DNA';
  ui.phaseFill.style.transform = 'scaleX(0)';
  ui.pct.textContent = '00%';

  setState('launch');
  burst(270, 342, '#D8FF3E', 28, 1.2);
  addRing(270, 343, '#D8FF3E', 10, 0.65);
  launchSound();
  announce('Launching Tech Drop. Discovering your tech superpower.');
  return true;
}

function atTrack(time) {
  let trackTime = (time / playingDuration) * (track[track.length - 1]?.t || 1);
  if (trackTime <= 0) return track[0];
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
  triggerNeuralPulse(e.peg, THEMES[target].color);
  shake = Math.max(shake, clamp(e.force / 110, 1.2, 4.0));
  addRing(p.x, p.y, p.hotColor, 8, 0.48);
  burst(p.x, p.y, e.peg % 3 === 0 ? '#D8FF3E' : p.hotColor, clamp(Math.round(e.force / 12), 7, 20), 0.85);
  hitSound(e);

  if ((nextImpact % 3) === 1) {
    const words = ['NICE HIT!', 'COMBO x' + (nextImpact + 1), 'SIGNAL BOOST', 'POWER UP!'];
    ui.callout.textContent = words[(nextImpact >>> 1) % words.length];
    ui.callout.style.left = (p.x / W * 100) + '%';
    ui.callout.style.top = ((p.y - 20) / H * 100) + '%';
    ui.callout.classList.remove('pop');
    void ui.callout.offsetWidth;
    ui.callout.classList.add('pop');
  }
}

function capture() {
  setState('capture');
  capturePulse = 1.0;
  impactFlash = 1.0;
  shake = 8.0;
  zoomFocus = 1.08;

  let x = slotCenter(target);
  ball.x = x;
  ball.y = 762;

  ui.status.classList.add('visible');
  ui.phase.textContent = 'SIGNAL CAPTURED // CORE UNLOCKED';
  ui.phaseFill.style.transform = 'scaleX(1)';
  ui.pct.textContent = '100%';

  burst(x, 755, THEMES[target].color, 160, 1.6, 'confetti');
  for (let i = 0; i < 3; i++) {
    addRing(x, 754, THEMES[target].color, 10 + i * 14, 1.0 + i * 0.2);
  }

  ui.capture.style.left = (clamp(x, 115, 425) / W * 100) + '%';
  ui.capture.classList.remove('active');
  void ui.capture.offsetWidth;
  ui.capture.classList.add('active');

  captureSound();
  announce('Power core captured. Your tech superpower is about to be revealed.');
}

function createResultParticles(color) {
  ui.resultParticles.replaceChildren();
  if (prefersReducedMotion || effectiveQuality === 'low') return;

  const count = effectiveQuality === 'medium' ? 45 : 85;
  for (let i = 0; i < count; i++) {
    let item = document.createElement('i');
    let x = 28 + random(0, 44), y = 27 + random(0, 36);
    item.style.setProperty('--left', x + '%');
    item.style.setProperty('--top', y + '%');
    item.style.setProperty('--w', random(2, 5) + 'px');
    item.style.setProperty('--h', random(5, 14) + 'px');
    item.style.setProperty('--c', random() < 0.47 ? color : random() < 0.5 ? '#FFFFFF' : '#DEFF52');
    item.style.setProperty('--r', random(-90, 90) + 'deg');
    item.style.setProperty('--dx', random(-310, 310) + 'px');
    item.style.setProperty('--dy', random(-360, 410) + 'px');
    item.style.setProperty('--spin', random(-850, 850) + 'deg');
    item.style.setProperty('--delay', random(0, 0.8) + 's');
    ui.resultParticles.append(item);
  }
}

function reveal() {
  setState('result');
  ui.capture.classList.remove('active');
  ui.status.classList.remove('visible');

  const c = THEMES[outcome];
  ui.result.style.setProperty('--result-color', c.color);
  ui.resultTitle.innerHTML = c.first + '<span>' + c.second + '</span>';
  ui.resultIcon.innerHTML = c.pathSvg;
  ui.resultDescription.textContent = c.desc;
  ui.resultTags.replaceChildren(...c.tags.map(x => {
    let el = document.createElement('span');
    el.textContent = x;
    return el;
  }));
  ui.resultNext.textContent = c.cta;
  ui.roundId.textContent = String(round).padStart(3, '0');
  ui.resultProgress.style.transform = 'scaleX(1)';

  createResultParticles(c.color);
  ui.result.classList.add('visible');
  ui.flash.classList.remove('on');
  void ui.flash.offsetWidth;
  ui.flash.classList.add('on');

  playVictoryTheme(outcome);
  announce(`Congratulations! You discovered your Tech Superpower: ${c.first} ${c.second}. ${c.desc}`);
}

function reset() {
  setState('idle');
  ui.capture.classList.remove('active');
  ui.result.classList.remove('visible');
  ui.status.classList.remove('visible');
  ui.bottom.classList.remove('hidden');
  ui.resultParticles.replaceChildren();
  ui.callout.classList.remove('pop');

  track = [];
  trail.length = 0;
  for (const p of particlePool) p.active = false;
  rings.length = 0;
  impactFlash = 0.35;
  shake = 0;
  zoomFocus = 1.0;

  announce('Tech Drop ready for the next player. Tap play or press Space or Enter.');
}

// ==========================================
// MAIN UPDATE TICK (Fixed Delta Physics)
// ==========================================
function tick(dt) {
  clock += dt;
  stateTime += dt;
  shake = Math.max(0, shake - dt * 14);
  impactFlash = Math.max(0, impactFlash - dt * 2.2);
  capturePulse = Math.max(0, capturePulse - dt * 0.55);
  zoomFocus = lerp(zoomFocus, 1.0, dt * 2.0);

  // Fade peg illumination and neural pulses
  for (const p of pegs) {
    p.glow = Math.max(0, p.glow - dt * 2.6);
    p.pulse = Math.max(0, p.pulse - dt * 2.0);
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
    p.vy += (p.kind === 'confetti' ? 140 : 320) * dt;
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

  if (state === 'launch' && stateTime > 0.5) {
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
    ball.rotation += (p.spin || 5) * dt;

    trail.push({ x: ball.x, y: ball.y });
    const maxTrail = effectiveQuality === 'low' ? 12 : effectiveQuality === 'medium' ? 22 : 32;
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

  if (state === 'capture' && stateTime > 1.35) {
    reveal();
  }

  if (state === 'result') {
    let activeResult = config.resultDuration;
    let remaining = Math.max(0, activeResult - stateTime);
    ui.resultProgress.style.transform = `scaleX(${clamp(remaining / activeResult, 0, 1)})`;
    ui.resetCountdown.textContent = 'NEXT DROP IN ' + Math.ceil(remaining) + 'S';
    if (remaining <= 0 && config.autoReset) {
      setState('resetting');
    }
  }

  if (state === 'resetting' && stateTime > 0.45) {
    reset();
  }
}

// ==========================================
// RENDER PIPELINE
// ==========================================
function drawPeg(c, p) {
  const power = Math.max(p.glow, p.pulse * 0.6);
  const color = p.hotColor || '#DEFF52';

  // Ambient idle shimmer
  let idlePulse = 0.5 + 0.5 * Math.sin(clock * 2.0 + p.col * 0.6 + p.r);

  if (power > 0.03) {
    ellipseGlow(c, p.x, p.y, 36, [
      [0, color + Math.round(power * 100).toString(16).padStart(2, '0')],
      [1, color + '00']
    ]);
  }

  c.save();
  c.shadowColor = power > 0.1 ? color : '#8fdcff';
  c.shadowBlur = power * 22 + 4;

  const grad = c.createRadialGradient(p.x - 2.8, p.y - 3, 0.5, p.x + 0.4, p.y + 1.5, 8);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, power > 0.1 ? '#dfff87' : '#e0f7ff');
  grad.addColorStop(0.55, power > 0.1 ? '#88bf48' : '#7298b6');
  grad.addColorStop(1, '#0a2539');

  c.fillStyle = grad;
  c.beginPath();
  c.arc(p.x, p.y, 5.8 + power * 2 + idlePulse * 0.25, 0, TAU);
  c.fill();
  c.restore();

  // Glass Specular Highlight
  c.beginPath();
  c.arc(p.x - 2.0, p.y - 2.1, 1.45, 0, TAU);
  c.fillStyle = '#ffffffd8';
  c.fill();

  // Expanding Impact Ripple
  if (power > 0.35) {
    c.globalAlpha = power * 0.4;
    c.strokeStyle = color;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(p.x, p.y, 10 + (1 - power) * 9, 0, TAU);
    c.stroke();
    c.globalAlpha = 1;
  }
}

function drawBall(c) {
  const color = THEMES[target].color;

  // Additive Neon Motion Trail
  c.save();
  c.globalCompositeOperation = 'screen';
  for (let k = 1; k < trail.length; k++) {
    let prev = trail[k - 1], p = trail[k], a = k / trail.length;
    c.strokeStyle = color;
    c.globalAlpha = 0.10 + a * 0.40;
    c.lineWidth = 1.5 + 7.5 * a;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(prev.x, prev.y);
    c.lineTo(p.x, p.y);
    c.stroke();
  }
  c.globalAlpha = 1.0;
  ellipseGlow(c, ball.x, ball.y, 48, [
    [0, '#ffffffe5'],
    [0.22, color + '99'],
    [0.47, color + '40'],
    [1, color + '00']
  ]);
  c.restore();

  // Ball Core with Squash & Stretch
  let vx = ball.vx, vy = ball.vy;
  let angle = Math.atan2(vy, vx);
  let speed = Math.hypot(vx, vy);
  let stretch = clamp(speed / 280, 0, 0.45);

  c.save();
  c.translate(ball.x, ball.y);
  c.rotate(angle);
  c.scale(1 + stretch * 0.25, 1 - stretch * 0.18);
  c.shadowColor = color;
  c.shadowBlur = 30;

  let grad = c.createRadialGradient(-3.8, -4.7, 0.5, 0, 0, 12);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.33, '#ffffff');
  grad.addColorStop(0.64, color);
  grad.addColorStop(1, '#254465');

  c.beginPath();
  c.arc(0, 0, 11, 0, TAU);
  c.fillStyle = grad;
  c.fill();
  c.restore();

  // Kinetic Spin Orbit Ring (shows real angular spin)
  c.save();
  c.translate(ball.x, ball.y);
  c.rotate(ball.rotation);
  c.beginPath();
  c.arc(0, 0, 15.5, 0, Math.PI * 1.3);
  c.strokeStyle = '#ffffffcc';
  c.lineWidth = 1.6;
  c.stroke();

  // Internal Core Crosshair
  c.beginPath();
  c.arc(0, 0, 4, 0, TAU);
  c.fillStyle = '#ffffff';
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
    c.translate(p.x, p.y);
    c.rotate(p.angle);
    c.fillStyle = p.color;
    if (p.kind === 'spark' && effectiveQuality !== 'low') {
      c.shadowBlur = 9;
      c.shadowColor = p.color;
    }
    if (p.kind === 'confetti') {
      c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2.4);
    } else {
      c.beginPath();
      c.arc(0, 0, p.size * a, 0, TAU);
      c.fill();
    }
    c.restore();
  }
}

function drawRings(c) {
  for (const r of rings) {
    let p = 1 - r.life / r.max;
    c.globalAlpha = (1 - p) * 0.94;
    c.strokeStyle = r.color;
    c.lineWidth = 2.4 * (1 - p) + 0.3;
    c.beginPath();
    c.arc(r.x, r.y, r.r + p * 68, 0, TAU);
    c.stroke();
  }
  c.globalAlpha = 1;
}

function render() {
  g.clearRect(0, 0, W, H);
  g.drawImage(bg, 0, 0);

  // Dynamic Camera Recoil & Zoom
  g.save();
  if (shake > 0.05) {
    g.translate(random(-shake * 0.5, shake * 0.5), random(-shake * 0.5, shake * 0.5));
  }
  rr(g, 32, 276, 476, 529, 20);
  g.clip();

  // Scanning laser beam
  let scan = 345 + (clock * 38) % 390;
  let scanner = g.createLinearGradient(0, scan - 24, 0, scan + 24);
  scanner.addColorStop(0, '#81ffb500');
  scanner.addColorStop(0.5, '#81ffb518');
  scanner.addColorStop(1, '#81ffb500');
  g.fillStyle = scanner;
  g.fillRect(42, scan - 24, 456, 48);

  // Traveling digital pulses on vertical traces
  for (let i = 0; i < 6; i++) {
    const yy = 370 + ((clock * (20 + i * 3) + i * 91) % 345);
    const xx = 47 + (i % 2) * 7;
    g.strokeStyle = i % 2 ? '#d8ff3e55' : '#77f5ff55';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(xx, yy);
    g.lineTo(xx + 12, yy);
    g.stroke();
  }

  // Floating ambient cyber dust
  for (const dot of ambient) {
    let a = dot.alpha * (0.5 + 0.5 * Math.sin(clock * dot.v + dot.phase));
    g.beginPath();
    g.arc(dot.x + Math.sin(clock * 0.23 + dot.phase) * 5, dot.y, dot.radius, 0, TAU);
    g.fillStyle = `rgba(142,220,255,${a})`;
    g.fill();
  }

  // Render Peg Array
  for (const p of pegs) drawPeg(g, p);

  // Emitter Core Glow
  if (state === 'idle' || state === 'launch') {
    const x = 270, y = 339;
    ellipseGlow(g, x, y, 52, [[0, '#eaffaaa0'], [0.2, '#d9ff3e30'], [1, '#d9ff3e00']]);
    g.strokeStyle = '#d8ff3e89';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, 19 + Math.sin(clock * 2.2) * 2.2, clock * 0.9, clock * 0.9 + Math.PI * 1.5);
    g.stroke();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(x, y, 6.5, 0, TAU);
    g.fill();
  }

  // Render Ball
  if (state === 'playing') drawBall(g);

  // Render Capture Blast
  if (state === 'capture') {
    let x = slotCenter(target);
    ellipseGlow(g, x, 758, 140, [
      [0, '#ffffffe3'],
      [0.18, THEMES[target].color + 'aa'],
      [0.55, THEMES[target].color + '33'],
      [1, THEMES[target].color + '00']
    ]);
  }

  drawRings(g);
  drawParticles(g);
  g.restore();

  // Screen Flash
  if (impactFlash > 0.01) {
    g.globalAlpha = impactFlash * 0.12;
    g.fillStyle = '#ddfff2';
    rr(g, 32, 276, 476, 529, 20);
    g.fill();
    g.globalAlpha = 1;
  }
}

// ==========================================
// PERFORMANCE PROFILER & DIAGNOSTIC HUD
// FPS, 1% Lows, Frametime Sparkline
// ==========================================
const fpsHistory = [];
const frameTimes = [];
let lastFpsUpdate = 0;
let currentFps = 60, smoothedFps = 60, onePercentLow = 58;
let showFpsHud = urlParams.has('fps') || urlParams.has('debug');

const hudCanvas = document.createElement('canvas');
hudCanvas.id = 'perfHud';
hudCanvas.width = 180;
hudCanvas.height = 100;
hudCanvas.style.cssText = 'position:absolute;top:12px;left:12px;z-index:99;pointer-events:none;background:#050c18dd;border:1px solid #75fbfd55;border-radius:6px;padding:4px;display:' + (showFpsHud ? 'block' : 'none');
stage.appendChild(hudCanvas);
const hg = hudCanvas.getContext('2d');

function updatePerformanceMetrics(now, dt) {
  frameTimes.push(dt * 1000);
  if (frameTimes.length > 90) frameTimes.shift();

  if (now - lastFpsUpdate >= 250) {
    currentFps = Math.round(1 / Math.max(0.001, dt));
    fpsHistory.push(currentFps);
    if (fpsHistory.length > 24) fpsHistory.shift();

    let sum = 0;
    for (const f of fpsHistory) sum += f;
    smoothedFps = Math.round(sum / fpsHistory.length);

    // Calculate 1% Low
    const sortedTimes = [...frameTimes].sort((a, b) => b - a);
    const p99Index = Math.floor(sortedTimes.length * 0.05);
    const worstTime = sortedTimes[p99Index] || 16.6;
    onePercentLow = Math.round(1000 / Math.max(1, worstTime));

    lastFpsUpdate = now;

    // Auto Quality Adaptation with 4s hysteresis
    if (qualityPreset === 'auto') {
      if (smoothedFps < 50 && effectiveQuality !== 'low') {
        effectiveQuality = effectiveQuality === 'high' ? 'medium' : 'low';
        resize();
      } else if (smoothedFps >= 58 && effectiveQuality !== 'high') {
        effectiveQuality = effectiveQuality === 'low' ? 'medium' : 'high';
        resize();
      }
    }
  }

  // Draw HUD if visible
  if (showFpsHud) {
    hg.clearRect(0, 0, 180, 100);
    hg.fillStyle = '#a1e4ff';
    hg.font = '900 9px monospace';
    hg.fillText(`FPS: ${currentFps} (${smoothedFps}) | 1% LOW: ${onePercentLow}`, 6, 12);
    hg.fillStyle = '#DEFF52';
    hg.fillText(`FRAME: ${(dt * 1000).toFixed(1)}ms | DPR: ${(canvas.width / W).toFixed(1)}`, 6, 24);
    hg.fillStyle = '#66F4EF';
    hg.fillText(`PARTICLES: ${particlePool.filter(p => p.active).length} | QUAL: ${effectiveQuality.toUpperCase()}`, 6, 36);

    // Sparkline Graph
    hg.strokeStyle = '#436d93';
    hg.lineWidth = 1;
    hg.beginPath();
    hg.moveTo(6, 92);
    hg.lineTo(174, 92);
    hg.stroke();

    hg.strokeStyle = '#DEFF52';
    hg.lineWidth = 1.2;
    hg.beginPath();
    for (let i = 0; i < frameTimes.length; i++) {
      let x = 6 + (i / 90) * 168;
      let y = 92 - clamp(frameTimes[i] * 1.8, 0, 48);
      if (i === 0) hg.moveTo(x, y);
      else hg.lineTo(x, y);
    }
    hg.stroke();
  }
}

// Toggle FPS HUD
function toggleFpsHud() {
  showFpsHud = !showFpsHud;
  hudCanvas.style.display = showFpsHud ? 'block' : 'none';
}

// ==========================================
// ANIMATION LOOP
// ==========================================
function frame(now) {
  if (!last) last = now;
  let dt = clamp((now - last) / 1000, 0, 0.045);
  last = now;

  tick(dt);
  render();
  updatePerformanceMetrics(now, dt);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ==========================================
// INPUT CONTROLLER & KIOSK PROTECTION
// Touch, Mouse, Space, Enter, USB Arcade HID
// ==========================================
ui.start.addEventListener('click', start);

const heldKeys = new Set();
document.addEventListener('keyup', ev => heldKeys.delete(ev.code));
addEventListener('blur', () => heldKeys.clear());

document.addEventListener('keydown', ev => {
  // Developer & Operator Shortcuts
  if (ev.shiftKey && ev.code === 'KeyF') {
    ev.preventDefault();
    toggleFpsHud();
    return;
  }

  if (ev.shiftKey && ev.code === 'KeyD') {
    ev.preventDefault();
    ui.debug.classList.toggle('on');
    return;
  }

  // Primary Gameplay Trigger (Space / Enter / Arcade Button)
  if (!['Space', 'Enter', 'NumpadEnter'].includes(ev.code)) return;
  if (ev.repeat || heldKeys.has(ev.code)) return;
  heldKeys.add(ev.code);

  const tg = ev.target;
  if (tg instanceof Element && tg.closest('#mute,#fullscreen,#skip,#forceReset,#forceOutcome,#perfHud')) return;
  ev.preventDefault();
  start();
});

// Sound Mute Toggle
ui.mute.addEventListener('click', () => {
  muted = !muted;
  ui.mute.style.color = muted ? '#708198' : '#D8FF3E';
  ui.mute.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
  if (!muted) {
    soundStart();
    playSynthTone({ freq: 750, duration: 0.12, type: 'sine', volume: 0.022 });
  }
});

// Fullscreen Toggle
ui.fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('app').requestFullscreen();
  } catch (e) {
    ui.fullscreen.title = 'Fullscreen is available in a regular browser tab';
  }
});

// Developer Panel Controls
if (urlParams.has('debug')) {
  ui.debug.classList.add('on');
}
$('skip')?.addEventListener('click', () => {
  if (state === 'idle') start();
  if (state === 'launch' || state === 'playing') capture();
  if (state === 'capture') reveal();
});
$('forceReset')?.addEventListener('click', reset);

if (urlParams.has('mute')) {
  muted = true;
  ui.mute.style.color = '#708198';
  ui.mute.setAttribute('aria-label', 'Unmute sound');
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
      particles: particlePool.filter(p => p.active).length,
      fps: currentFps,
      smoothedFps,
      onePercentLow,
      quality: effectiveQuality,
      activeVoices: activeVoices.length
    }),
    forceOutcome: n => {
      ui.forceOutcome.value = String(n);
      target = parseInt(n, 10);
    },
    start,
    reset,
    skip: () => {
      if (state === 'idle') start();
      if (state === 'launch' || state === 'playing') capture();
      if (state === 'capture') reveal();
    },
    toggleFps: toggleFpsHud,
    setQuality: q => {
      qualityPreset = q;
      effectiveQuality = q;
      resize();
    }
  }
});

setState('idle');

})();
