/* Six code-native cinematic scenes. No physics or outcome selection lives here. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const ease = t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  const names = ['neural-construction', 'shield-lock', 'compiled-geometry', 'pattern-convergence', 'distributed-flight', 'fluid-interfaces'];
  function line(c, x, y, xx, yy, alpha = 1, width = 1) {
    c.globalAlpha = alpha; c.lineWidth = width;
    c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.stroke();
  }
  function dot(c, x, y, r, alpha = 1) {
    c.globalAlpha = alpha; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function polygon(c, x, y, r, count, rotation = 0) {
    c.beginPath();
    for (let i = 0; i <= count; i++) {
      const a = rotation + i * TAU / count;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (!i) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
  }
  function neural(c, t) {
    const nodes = [];
    for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
      const n = row * 5 + col, a = n * 2.39996;
      const p = ease(t * 1.4 - n * 0.025);
      nodes.push({ x: 270 + Math.cos(a) * (44 + row * 31) * p,
        y: 285 + Math.sin(a) * (48 + row * 31) * p, p });
    }
    nodes.forEach((n, i) => {
      for (const j of [i + 1, i + 5]) if (nodes[j]) {
        const m = nodes[j]; line(c, n.x, n.y, m.x, m.y, 0.2 * Math.min(n.p, m.p));
        const p = (t * 0.6 + i * 0.13) % 1;
        dot(c, n.x + (m.x - n.x) * p, n.y + (m.y - n.y) * p, 1.8, 0.7 * n.p);
      }
      dot(c, n.x, n.y, i % 5 === 0 ? 5 : 2.8, n.p * 0.9);
    });
  }
  function shield(c, t) {
    const p = ease(t / 1.3);
    c.globalAlpha = 0.85; c.lineWidth = 2;
    c.beginPath(); c.moveTo(270, 105); c.lineTo(405, 155); c.lineTo(390, 305);
    c.quadraticCurveTo(370, 390, 270, 443); c.quadraticCurveTo(170, 390, 150, 305);
    c.lineTo(135, 155); c.closePath();
    c.save(); c.clip();
    for (let row = 0; row < 12; row++) for (let col = 0; col < 10; col++) {
      const x = 110 + col * 34 + (row % 2) * 17, y = 115 + row * 29;
      c.globalAlpha = Math.max(0, Math.min(0.45, t * 1.4 - row * 0.07 - col * 0.04));
      polygon(c, x, y, 18 * p, 6, Math.PI / 6); c.stroke();
    }
    line(c, 120, 115 + p * 330, 420, 115 + p * 330, 0.9, 3);
    c.restore();
    c.globalAlpha = p; c.setLineDash([p * 1100, 1100]);
    c.beginPath(); c.moveTo(270, 105); c.lineTo(405, 155); c.lineTo(390, 305);
    c.quadraticCurveTo(370, 390, 270, 443); c.quadraticCurveTo(170, 390, 150, 305);
    c.lineTo(135, 155); c.closePath(); c.stroke(); c.setLineDash([]);
  }
  function compiled(c, t) {
    for (let i = 0; i < 12; i++) {
      const p = ease(t * 1.4 - i * 0.08), side = i % 2 ? 1 : -1;
      const x = 270 + side * (42 + (i % 3) * 40 + (1 - p) * 190);
      const y = 145 + Math.floor(i / 2) * 45;
      c.globalAlpha = p * 0.7; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x + 24, y); c.lineTo(x, y + 14);
      c.lineTo(x - 24, y); c.closePath(); c.stroke();
      line(c, x, y, x, y + 28, p * 0.6);
      line(c, x - 24, y, x - 24, y + 25, p * 0.4);
      line(c, x + 24, y, x + 24, y + 25, p * 0.4);
      line(c, x - 24, y + 25, x, y + 39, p * 0.4);
      line(c, x, y + 39, x + 24, y + 25, p * 0.4);
    }
    const p = ease(t - 0.6);
    line(c, 210, 165, 165 + p * 45, 285, p, 3);
    line(c, 165 + p * 45, 285, 210, 405, p, 3);
    line(c, 330, 165, 375 - p * 45, 285, p, 3);
    line(c, 375 - p * 45, 285, 330, 405, p, 3);
  }
  function data(c, t) {
    const p = ease(t / 1.7);
    for (let i = 0; i < 80; i++) {
      const randomX = 65 + ((i * 127) % 410), randomY = 110 + ((i * 83) % 320);
      const tx = 100 + i * 4.3, ty = 360 - Math.sin(i * 0.07) * 55 - i * 1.7;
      dot(c, randomX + (tx - randomX) * p, randomY + (ty - randomY) * p, i % 8 ? 1.8 : 4, 0.3 + p * 0.4);
    }
    for (let i = 0; i < 4; i++) line(c, 90, 160 + i * 75, 455, 160 + i * 75, 0.12);
    c.globalAlpha = p; c.beginPath();
    for (let i = 0; i < 80; i++) {
      const x = 100 + i * 4.3, y = 360 - Math.sin(i * 0.07) * 55 - i * 1.7;
      if (!i) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.lineWidth = 2; c.stroke();
  }
  function cloud(c, t) {
    const p = ease(t / 1.5);
    for (let i = 0; i < 7; i++) {
      const a = i * TAU / 7, x = 270 + Math.cos(a) * 165, y = 280 + Math.sin(a) * 150;
      const bend = i % 2 ? 85 : -85;
      c.globalAlpha = 0.4 * p; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(270, 280); c.quadraticCurveTo(x + bend, 280, x, y); c.stroke();
      const q = (t * 0.5 + i / 7) % 1;
      const xx = (1 - q) ** 2 * 270 + 2 * (1 - q) * q * (x + bend) + q * q * x;
      const yy = (1 - q) ** 2 * 280 + 2 * (1 - q) * q * 280 + q * q * y;
      dot(c, xx, yy, 3, p);
      c.globalAlpha = p; polygon(c, x, y, 14, 6); c.stroke(); dot(c, x, y, 3, p);
    }
  }
  function interfaces(c, t) {
    for (let i = 0; i < 4; i++) {
      const p = ease(t * 1.2 - i * 0.18), x = 105 + i * 48, y = 120 + i * 42;
      c.save(); c.translate(x + 85, y + 65); c.rotate((1 - p) * (i % 2 ? 0.5 : -0.5));
      c.scale(0.5 + p * 0.5, 0.5 + p * 0.5);
      c.globalAlpha = p * 0.65; c.lineWidth = 1.5;
      c.beginPath(); c.roundRect(-85, -65, 170, 130, 12 + Math.sin(t + i) * 7); c.stroke();
      line(c, -65, -38, 25, -38, p * 0.5, 3);
      line(c, -65, -18, -5, -18, p * 0.3, 2);
      c.globalAlpha = p * 0.8; c.beginPath(); c.roundRect(-65, 12, 65 + p * 45, 26, 13); c.stroke();
      dot(c, 52, -30, 10 + Math.sin(t * 2 + i) * 2, p * 0.6);
      c.restore();
    }
  }
  const scenes = [neural, shield, compiled, data, cloud, interfaces];
  root.TechDropReveals = {
    names,
    draw(c, index, time, color, motion = true) {
      c.clearRect(0, 0, 540, 960);
      c.save(); c.strokeStyle = color; c.fillStyle = color;
      scenes[index](c, motion ? Math.min(time, 2.1) : 2.1);
      c.restore();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
