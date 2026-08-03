import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [cookieConfig, middleware, adminRoutes, adminSetting] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/config/cookie.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/http/middleware/AllowOriginMiddleware.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/setting.js'),
])

assert.match(cookieConfig, /Env::get\('cors\.allowed_origins'/)
assert.match(cookieConfig, /Env::get\('cookie\.secure'/)
assert.match(cookieConfig, /Env::get\('cookie\.httponly'/)
assert.doesNotMatch(cookieConfig, /'Access-Control-Allow-Origin'\s*=>\s*'\*'/)

assert.match(middleware, /isAllowedOrigin\(\$request, \$origin\)/)
assert.match(middleware, /return Response::create\('Forbidden'\)->code\(403\)/)
assert.match(middleware, /\$origin === \$requestOrigin/)
assert.match(middleware, /\$origin === \$this->normalizeOrigin/)
assert.match(middleware, /\$header\['Vary'\]\s*=\s*'Origin'/)
assert.doesNotMatch(middleware, /strpos\(\$origin/)

assert.match(adminRoutes, /new AllowOriginMiddleware\(\)/)
assert.doesNotMatch(adminRoutes, /\['Access-Control-Allow-Origin'\]\s*=\s*app\(\)->request->header/)
assert.match(adminSetting, /`\$\{location\.origin\}\/adminapi`/)

console.log('CORS security contract checks passed')
