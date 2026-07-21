import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const miniRoot = join(root, 'homepage-home-v1', 'miniprogram');
const ignoredDirs = new Set(['node_modules', 'miniprogram_npm']);

function walk(dir, accept) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return ignoredDirs.has(name) ? [] : walk(path, accept);
    }
    return accept(path) ? [path] : [];
  });
}

const jsFiles = walk(miniRoot, (path) => path.endsWith('.js'));
for (const file of jsFiles) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}

const jsonFiles = walk(miniRoot, (path) => path.endsWith('.json'));
for (const file of jsonFiles) {
  assert.doesNotThrow(() => JSON.parse(readFileSync(file, 'utf8')), `${relative(root, file)} is invalid JSON`);
}

const appConfig = JSON.parse(readFileSync(join(miniRoot, 'app.json'), 'utf8'));
const requestSource = readFileSync(join(miniRoot, 'utils', 'request.js'), 'utf8');
const promoPosterSource = readFileSync(join(miniRoot, 'packages', 'features', 'pages', 'promo-poster', 'promo-poster.js'), 'utf8');
const inviteRecordsSource = readFileSync(join(miniRoot, 'packages', 'features', 'pages', 'invite-records', 'invite-records.js'), 'utf8');
const incomeRecordsSource = readFileSync(join(miniRoot, 'packages', 'features', 'pages', 'my-income', 'my-income.js'), 'utf8');
assert.match(requestSource, /businessStatus,\s*\n\s*data:/, 'request errors must preserve CRMEB business status');
assert.match(requestSource, /businessStatus === 401 \|\| businessStatus === 403/, 'CRMEB business auth errors must trigger automatic login recovery');
assert.match(requestSource, /if \(!noAuth && unauthorized[\s\S]*clearAuth\(\)[\s\S]*return login\(\)/, 'stale auth must be cleared before automatic login retry');
assert.match(promoPosterSource, /createReferralPoster\(\{ page: 'pages\/home\/home' \}\)/, 'poster page must load its own referral code when route parameters are incomplete');
assert.match(promoPosterSource, /writeFile\(\{[\s\S]*encoding:\s*'base64'/, 'inline referral codes must be materialized as local mini-program image files');
assert.doesNotMatch(inviteRecordsSource, /R202606|陈同学家长|120元/, 'invite records must not ship demo users or rewards');
assert.doesNotMatch(incomeRecordsSource, /I202606|W202606|陈同学家长|120元/, 'income records must not ship demo transactions');
const pages = new Set([
  ...(appConfig.pages || []),
  ...((appConfig.subPackages || appConfig.subpackages || []).flatMap((subpackage) =>
    (subpackage.pages || []).map((page) => `${subpackage.root}/${page}`),
  )),
]);

for (const page of pages) {
  for (const ext of ['js', 'wxml', 'json', 'wxss']) {
    const file = join(miniRoot, `${page}.${ext}`);
    assert.equal(existsSync(file), true, `missing page file: ${page}.${ext}`);
  }
}

const routePattern = /['"`](\/?(?:packages\/[A-Za-z0-9_-]+\/)?pages\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+)(?:\?[^'"`]*)?['"`]/g;
const routeFiles = walk(miniRoot, (path) => path.endsWith('.js') || path.endsWith('.wxml'));
for (const file of routeFiles) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(routePattern)) {
    const route = match[1].replace(/^\//, '');
    assert.equal(pages.has(route), true, `${relative(root, file)} references an unregistered page: ${route}`);
  }
}

console.log(`miniprogram smoke passed (js: ${jsFiles.length}, json: ${jsonFiles.length}, pages: ${pages.size})`);
