const fs = require('fs');
const path = require('path');

const lucide = require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/cjs/lucide.js');

const outDir = path.resolve(__dirname, '../homepage-home-v1/miniprogram/assets/mine');
const palette = {
  green: '#2F6B43',
  gold: '#C99A43',
  muted: '#8A978E'
};

const icons = [
  ['icon-promo-poster', 'Image', palette.green],
  ['icon-invite-record', 'Users', palette.green],
  ['icon-income', 'Wallet', palette.gold],
  ['icon-camp-order', 'ScrollText', palette.green],
  ['icon-redeem-code', 'QrCode', palette.gold],
  ['icon-member-benefit', 'Crown', palette.gold],
  ['icon-referral', 'Share2', palette.green],
  ['icon-member-status', 'BadgeCheck', palette.gold],
  ['tab-home', 'Home', palette.muted],
  ['tab-home-active', 'Home', palette.green],
  ['tab-mine', 'User', palette.muted],
  ['tab-mine-active', 'User', palette.gold],
  ['tab-offline', 'MapPin', palette.muted],
  ['tab-offline-active', 'MapPin', palette.green]
];

function toAttrs(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(' ');
}

function toNodes(iconNode, color) {
  return iconNode
    .map(([tag, attrs]) => {
      const nodeAttrs = { ...attrs, stroke: color };
      return `  <${tag} ${toAttrs(nodeAttrs)} />`;
    })
    .join('\n');
}

fs.mkdirSync(outDir, { recursive: true });

for (const [file, iconName, color] of icons) {
  const iconNode = lucide[iconName];
  if (!iconNode) throw new Error(`Missing lucide icon: ${iconName}`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">\n${toNodes(iconNode, color)}\n</svg>\n`;
  fs.writeFileSync(path.join(outDir, `${file}.svg`), svg, 'utf8');
}

console.log(`Wrote ${icons.length} SVG icons to ${outDir}`);
