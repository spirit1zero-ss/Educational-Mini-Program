import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backendRoot = path.join(
  projectRoot,
  'src',
  'CRMEB',
  'CRMEB-master',
  'crmeb',
  'app'
)
const adminRoot = path.join(backendRoot, 'adminapi')
const crmebRoot = path.join(projectRoot, 'src', 'CRMEB', 'CRMEB-master', 'crmeb')

const retiredPaths = [
  'route/marketing.php',
  'route/product.php',
  'route/order.php',
  'route/crud.php',
  'route/widget.php',
  'controller/UpgradeController.php',
  'controller/v1/marketing',
  'controller/v1/order',
  'controller/v1/product',
  'controller/v1/statistic/ProductStatistic.php',
  'controller/v1/statistic/TradeStatistic.php',
  'controller/v1/statistic/OrderStatistic.php',
  'middleware/ProductChainMiddleware.php',
  'controller/v1/setting/SystemCrud.php',
  'controller/v1/system/SystemFile.php',
  'controller/v1/system/AppVersion.php',
  'controller/v1/system/SystemClearData.php',
  'middleware/AdminEditorTokenMiddleware.php',
  '../services/system/SystemCrudDataService.php',
  '../services/system/SystemCrudListServices.php',
  '../services/system/SystemCrudServices.php',
  '../services/system/UpgradeServices.php',
  '../services/system/log/SystemFileInfoServices.php',
  '../services/system/log/SystemFileMd5Services.php',
  '../services/system/log/SystemFileServices.php',
  '../jobs/UpgradeJob.php'
]

const requiredPaths = [
  'route/agent.php',
  'route/finance.php',
  'route/user.php',
  'controller/v1/agent/AgentManage.php',
  'controller/v1/agent/SpreadApply.php',
  'controller/v1/finance/Finance.php',
  'controller/v1/user/User.php'
]

const hasFiles = (target) => {
  if (!fs.existsSync(target)) return false
  const stat = fs.statSync(target)
  if (stat.isFile()) return true
  return fs.readdirSync(target, { withFileTypes: true }).some((entry) =>
    entry.isFile() || hasFiles(path.join(target, entry.name))
  )
}

for (const relativePath of retiredPaths) {
  if (hasFiles(path.join(adminRoot, ...relativePath.split('/')))) {
    throw new Error(`Retired backend surface returned: ${relativePath}`)
  }
}

for (const relativePath of requiredPaths) {
  if (!fs.existsSync(path.join(adminRoot, ...relativePath.split('/')))) {
    throw new Error(`Required backend surface is missing: ${relativePath}`)
  }
}

const retiredConfig = fs.readFileSync(path.join(crmebRoot, 'config', 'retired.php'), 'utf8')
const retiredMiddleware = fs.readFileSync(
  path.join(adminRoot, 'middleware', 'RetiredAdminApiMiddleware.php'),
  'utf8'
)
if (!/admin_api_allow_paths[\s\S]*file\/upload/.test(retiredConfig)) {
  throw new Error('Authenticated certificate upload must remain allowlisted')
}
const allowCheck = retiredMiddleware.indexOf('$this->isAllowedPath($path)')
const denyCheck = retiredMiddleware.indexOf('foreach ($this->patterns() as $pattern)')
if (allowCheck < 0 || denyCheck < 0 || allowCheck > denyCheck) {
  throw new Error('Exact upload allowlist must be checked before the retired API denylist')
}
if (!retiredMiddleware.includes('$request->isPost()')) {
  throw new Error('The upload allowlist must remain limited to POST requests')
}

const appRoute = fs.readFileSync(path.join(adminRoot, 'route', 'app.php'), 'utf8')
for (const endpoint of ['wechat/syncSubscribe', 'routine/syncSubscribe']) {
  if (!appRoute.includes(endpoint)) {
    throw new Error(`Required notification endpoint is missing: ${endpoint}`)
  }
}
for (const retiredEndpoint of ['routine/ci/', 'wechat_qrcode/', 'routine/scheme_']) {
  if (appRoute.includes(retiredEndpoint)) {
    throw new Error(`Retired application endpoint returned: ${retiredEndpoint}`)
  }
}

const exportRoute = fs.readFileSync(path.join(adminRoot, 'route', 'export.php'), 'utf8')
for (const endpoint of ['user_list', 'member_card/:id', 'userAgent', 'userFinance', 'userCommission']) {
  if (!exportRoute.includes(endpoint)) {
    throw new Error(`Required export endpoint is missing: ${endpoint}`)
  }
}
for (const retiredEndpoint of ['order_list', 'product_list', 'verify_order', 'userPoint']) {
  if (exportRoute.includes(retiredEndpoint)) {
    throw new Error(`Retired export endpoint returned: ${retiredEndpoint}`)
  }
}

const statisticRoute = fs.readFileSync(path.join(adminRoot, 'route', 'statistic.php'), 'utf8')
for (const retiredPrefix of ['product/', 'trade/', 'order/']) {
  if (statisticRoute.includes(`'${retiredPrefix}`)) {
    throw new Error(`Retired statistic endpoint returned: ${retiredPrefix}`)
  }
}

const systemRoute = fs.readFileSync(path.join(adminRoot, 'route', 'system.php'), 'utf8')
for (const retiredEndpoint of [
  'crud/',
  'file/login',
  'file/opendir',
  'write_md5',
  'clear/:type',
  'replace_site_url',
  'version_list'
]) {
  if (systemRoute.includes(retiredEndpoint)) {
    throw new Error(`Retired system endpoint returned: ${retiredEndpoint}`)
  }
}

const publicController = fs.readFileSync(
  path.join(backendRoot, 'api', 'controller', 'v1', 'PublicController.php'),
  'utf8'
)
for (const legacyNamespace of [
  'services\\activity',
  'services\\product',
  'services\\order',
  'services\\diy',
  'services\\kefu'
]) {
  if (publicController.includes(legacyNamespace)) {
    throw new Error(`Legacy storefront dependency returned to PublicController: ${legacyNamespace}`)
  }
}

const commonController = fs.readFileSync(
  path.join(adminRoot, 'controller', 'Common.php'),
  'utf8'
)
for (const storefrontDependency of [
  'services\\order\\StoreOrder',
  'services\\product\\StoreProduct'
]) {
  if (commonController.includes(storefrontDependency)) {
    throw new Error(`Storefront dashboard dependency returned: ${storefrontDependency}`)
  }
}

const commonRoute = fs.readFileSync(path.join(adminRoot, 'route', 'common.php'), 'utf8')
for (const retiredEndpoint of ['home/order', 'home/rank']) {
  if (commonRoute.includes(retiredEndpoint)) {
    throw new Error(`Retired storefront dashboard endpoint returned: ${retiredEndpoint}`)
  }
}

const userServices = fs.readFileSync(
  path.join(backendRoot, 'services', 'user', 'UserServices.php'),
  'utf8'
)
if (userServices.includes('services\\activity')) {
  throw new Error('Marketing activity dependency returned to UserServices')
}

const phpFiles = []
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(fullPath)
    else if (entry.name.endsWith('.php')) phpFiles.push(fullPath)
  }
}
walk(adminRoot)

const missingImports = []
const importPattern = /^use\s+(app\\[^;]+);/gm
for (const sourceFile of phpFiles) {
  const source = fs.readFileSync(sourceFile, 'utf8')
  let match
  while ((match = importPattern.exec(source))) {
    const relativeClass = match[1].slice('app\\'.length).replaceAll('\\', path.sep)
    const target = path.join(backendRoot, `${relativeClass}.php`)
    if (!fs.existsSync(target)) {
      missingImports.push(`${path.relative(adminRoot, sourceFile)} -> ${match[1]}`)
    }
  }
}

if (missingImports.length) {
  throw new Error(`Missing backend imports:\n${missingImports.join('\n')}`)
}

console.log(
  `backend retired-surface contract passed (admin PHP files: ${phpFiles.length}, retired paths: ${retiredPaths.length})`
)
