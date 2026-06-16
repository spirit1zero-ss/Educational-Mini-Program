const fs = require('fs');
const path = require('path');

const loaderPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@dcloudio',
  'vue-cli-plugin-uni',
  'packages',
  'vue-loader',
  'lib',
  'loaders',
  'templateLoader.js'
);

if (!fs.existsSync(loaderPath)) {
  process.exit(0);
}

const original = 'return code + `\\nexport { render, staticRenderFns, recyclableRender, components }`';
const patched = 'return `var recyclableRender, components;\\n` + code + `\\nexport { render, staticRenderFns, recyclableRender, components }`';
const source = fs.readFileSync(loaderPath, 'utf8');

if (source.includes(patched)) {
  process.exit(0);
}

if (!source.includes(original)) {
  console.warn('[patch-uni-loader] Expected templateLoader export line was not found; skipped.');
  process.exit(0);
}

fs.writeFileSync(loaderPath, source.replace(original, patched));
console.log('[patch-uni-loader] Patched uni vue-loader template exports.');
