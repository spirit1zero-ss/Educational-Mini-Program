const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist', 'build', 'mp-weixin');
const configPath = path.join(outputDir, 'project.config.json');

if (!fs.existsSync(outputDir)) {
  console.warn('[write-mp-weixin-project-config] Output directory not found; skipped.');
  process.exit(0);
}

const config = {
  appid: 'wx3b82801238ca1b57',
  compileType: 'miniprogram',
  libVersion: '3.15.2',
  miniprogramRoot: './',
  projectname: 'Educational-Mini-Program',
  setting: {
    urlCheck: false,
    es6: true,
    enhance: true,
    postcss: true,
    minified: true,
    compileHotReLoad: false
  }
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('[write-mp-weixin-project-config] Wrote dist/build/mp-weixin/project.config.json.');
