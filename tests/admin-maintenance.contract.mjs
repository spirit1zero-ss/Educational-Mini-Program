import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const api = read('src/CRMEB/CRMEB-master/template/admin/src/api/system.js');
const routes = read('src/CRMEB/CRMEB-master/template/admin/src/router/modules/system.js');
const page = read('src/CRMEB/CRMEB-master/template/admin/src/pages/system/maintain/clear/index.vue');
const systemInfo = read('src/CRMEB/CRMEB-master/template/admin/src/pages/system/auth/index.vue');
const backendRoutes = read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/system.php');
const maintenancePatch = read(
  'src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-29-maintenance-menu-safety.sql',
);

assert.match(api, /export function refreshSystemCacheApi\(\)/);
assert.match(api, /system\/refresh_cache\/cache/);
assert.match(api, /export function clearRuntimeLogApi\(\)/);
assert.match(api, /system\/refresh_cache\/log/);

assert.match(routes, /path: 'maintain\/clear\/index'/);
assert.match(routes, /auth: \['system-clear'\]/);
assert.match(routes, /pages\/system\/maintain\/clear\/index/);

assert.match(page, /刷新系统缓存/);
assert.match(page, /refreshSystemCacheApi/);
assert.match(page, /清理运行日志/);
assert.match(page, /clearRuntimeLogApi/);

assert.match(backendRoutes, /refresh_cache\/cache/);
assert.match(backendRoutes, /refresh_cache\/log/);
assert.doesNotMatch(systemInfo, /mounted\(\)\s*\{\s*this\.getAuth\(\)/);
assert.doesNotMatch(systemInfo, /mounted\(\)\s*\{[\s\S]{0,80}this\.getVersion\(\)/);

for (const hiddenMenu of [
  'system-maintain-system-cleardata',
  'system-maintain-system-databackup',
  'system-database-index',
  'system-crontab-index',
  'admin-tool',
]) {
  assert.match(maintenancePatch, new RegExp(`'${hiddenMenu}'`));
}

for (const keptMenu of ['system-maintain-system-log', 'system-clear', 'system-maintain-auth']) {
  assert.doesNotMatch(maintenancePatch, new RegExp(`'${keptMenu}'`));
}

console.log('admin maintenance contract passed');
