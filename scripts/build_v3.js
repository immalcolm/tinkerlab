const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../lucky_drop/v3');
const template = fs.readFileSync(path.join(dir, 'index.template.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'game.js'), 'utf8');

const output = template
  .replace('__CSS__', css)
  .replace('__JS__', js);

fs.writeFileSync(path.join(dir, 'index.html'), output, 'utf8');
console.log('Successfully compiled lucky_drop/v3/index.html (' + output.length + ' bytes)');
