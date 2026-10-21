const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../lucky_drop/v3');
const template = fs.readFileSync(path.join(dir, 'index.template.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const physics = fs.readFileSync(path.join(dir, 'physics_engine.js'), 'utf8');
const game = fs.readFileSync(path.join(dir, 'game.js'), 'utf8');
const reveals = fs.readFileSync(path.join(dir, 'reveal_engine.js'), 'utf8');

const combinedJs = `// TECH DROP 5.0 Standalone Distribution\n${physics}\n\n${reveals}\n\n${game}`;

const output = template
  .replace('/*__CSS__*/', css)
  .replace('__JS__', combinedJs);

fs.writeFileSync(path.join(dir, 'index.html'), output, 'utf8');
console.log('Successfully compiled lucky_drop/v3/index.html (' + output.length + ' bytes)');
