// Enhanced Physics Verification & Seed Extractor
const W = 540, H = 960;
const pegRows = 9;
const pegs = [];
for (let r = 0; r < pegRows; r++) {
  const cols = r % 2 ? 8 : 9;
  const startX = r % 2 ? 91 : 65;
  for (let c = 0; c < cols; c++) {
    pegs.push({ x: startX + c * 50, y: 381 + r * 39.3, r, c, id: `${r}-${c}`, chatter: 0, lastStep: -1 });
  }
}

const slotWidth = 448 / 6;
const slotCenters = [0, 1, 2, 3, 4, 5].map(i => 46 + (i + 0.5) * slotWidth);

// Bins dividers caps
const dividers = [];
for (let i = 1; i < 6; i++) {
  dividers.push({ x: 46 + i * slotWidth, yTop: 736, yBottom: 775, r: 3.5 });
}

function lcg(seed) {
  let s = (seed >>> 0);
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function simulateRun(seed) {
  const rng = lcg(seed);
  const dt = 1 / 240;
  const maxSteps = 240 * 7; // 7 seconds absolute max
  const gravity = 860;
  const R = 9.5;
  const P = 6.2;
  const minPegDist = R + P;
  const minPegDist2 = minPegDist * minPegDist;
  
  for (const p of pegs) {
    p.chatter = 0;
    p.lastStep = -1;
  }
  
  let x = 270 + (rng() - 0.5) * 14;
  let y = 338;
  let vx = (rng() - 0.5) * 36;
  let vy = 50 + rng() * 25;
  let spin = 0;
  
  const hits = [];
  const trajectory = [];
  
  for (let step = 0; step < maxSteps; step++) {
    const t = step * dt;
    
    // Physics integration
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
    
    // Peg collisions
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
        if (p.lastStep === step - 1) {
          p.chatter++;
        } else {
          p.chatter = 0;
        }
        p.lastStep = step;
        
        if (p.chatter > 2) {
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
    
    // Record at 120Hz
    if (step % 2 === 0) {
      trajectory.push({ t, x, y, vx, vy, spin });
    }
    
    if (y >= 762) {
      break;
    }
  }
  
  const finalX = x;
  let slot = Math.floor((finalX - 46) / slotWidth);
  slot = Math.max(0, Math.min(5, slot));
  
  return {
    seed,
    finalX,
    slot,
    slotCenter: slotCenters[slot],
    slotError: Math.abs(finalX - slotCenters[slot]),
    hits: hits.length,
    duration: trajectory[trajectory.length - 1]?.t || 0,
    trajectory,
    hitList: hits
  };
}

module.exports = { simulateRun, pegs, dividers, slotCenters };

if (require.main === module) {
  console.log('Testing 600 seeds with pure next-gen physics engine...');
  let stuck = 0;
  let maxDuration = 0;
  const seedBank = [[], [], [], [], [], []];
  for (let i = 0; i < 600; i++) {
    const seed = 20000 + i * 293;
    const res = simulateRun(seed);
    maxDuration = Math.max(maxDuration, res.duration);
    if (res.duration >= 6.5) stuck++;
    if (res.hits >= 10 && res.hits <= 25 && res.duration >= 3.0 && res.duration <= 5.5 && res.slotError < 26) {
      seedBank[res.slot].push(res);
    }
  }
  console.log('Stuck/slow runs (out of 600):', stuck, 'Max duration:', maxDuration.toFixed(2) + 's');
  console.log('High-quality seeds per slot:');
  const curatedSeeds = [];
  for (let s = 0; s < 6; s++) {
    seedBank[s].sort((a, b) => (a.slotError + Math.abs(a.hits - 16)) - (b.slotError + Math.abs(b.hits - 16)));
    const topSeeds = seedBank[s].slice(0, 5).map(r => ({
      seed: r.seed,
      hits: r.hits,
      duration: Math.round(r.duration * 100) / 100,
      finalX: Math.round(r.finalX * 10) / 10,
      slotError: Math.round(r.slotError * 10) / 10
    }));
    curatedSeeds.push(topSeeds);
    console.log(`Slot ${s} (${topSeeds.length} seeds):`, topSeeds[0]);
  }
  console.log('\nCurated Seeds JSON:');
  console.log(JSON.stringify(curatedSeeds.map(list => list.map(item => item.seed))));
}
