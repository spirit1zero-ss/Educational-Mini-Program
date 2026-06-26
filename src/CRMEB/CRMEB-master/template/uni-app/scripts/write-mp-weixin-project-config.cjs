const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist', 'build', 'mp-weixin');
const configPath = path.join(outputDir, 'project.config.json');
const appJsonPath = path.join(outputDir, 'app.json');
const appid = process.env.MP_WEIXIN_APPID || 'touristappid';

if (!fs.existsSync(outputDir)) {
  console.warn('[write-mp-weixin-project-config] Output directory not found; skipped.');
  process.exit(0);
}

const config = {
  appid,
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

if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (Array.isArray(appJson.subPackages) && appJson.subPackages.length === 0) {
    delete appJson.subPackages;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log('[write-mp-weixin-project-config] Removed empty subPackages from app.json.');
  }
}
