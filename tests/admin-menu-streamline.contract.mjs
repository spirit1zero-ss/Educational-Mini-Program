import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const patch = fs.readFileSync(
  path.join(
    root,
    'src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-24-admin-distribution-ui-merged.sql',
  ),
  'utf8',
);
const legalDocument = fs.readFileSync(
  path.join(
    root,
    'homepage-home-v1/miniprogram/packages/features/pages/legal-document/legal-document.js',
  ),
  'utf8',
);

for (const hiddenMenu of ['setting-member-config', 'setting-other', 'setting-agreement']) {
  assert.match(patch, new RegExp(`unique_auth.*${hiddenMenu.replaceAll('-', '\\-')}`, 's'));
}

assert.match(patch, /admin-user-grade-distribution-policy/);
assert.match(patch, /admin-user-grade-distribution-policy-read/);
assert.match(patch, /\/setting\/membership_level\/index/);
assert.match(patch, /admin-user-distribution-overview/);
assert.match(patch, /admin-user-distribution-team/);
assert.match(patch, /admin-finance-member-commission-list/);
assert.match(patch, /admin-finance-member-commission-review/);
assert.match(patch, /admin-user-grade-agreement/);
assert.match(patch, /\/user\/grade\/agreement/);
assert.match(patch, /admin-user-miniapp-agreement-read/);
assert.match(patch, /admin-user-miniapp-agreement-save/);

for (const key of ['service', 'privacy', 'registration']) {
  const match = legalDocument.match(
    new RegExp(`${key}:\\s*\\{\\s*title:\\s*'([^']*)',\\s*content:\\s*'([^']*)'`),
  );
  assert.ok(match, `missing ${key} fallback copy`);
  assert.ok(patch.includes(`'${match[1]}'`), `${key} title differs from mini-program fallback`);
  assert.ok(patch.includes(`'${match[2]}'`), `${key} content differs from mini-program fallback`);
}

console.log('admin menu streamline contract passed');
