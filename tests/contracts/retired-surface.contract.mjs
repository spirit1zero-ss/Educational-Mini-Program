import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const backend = join(root, 'src', 'CRMEB', 'CRMEB-master', 'crmeb');
const adminFrontend = join(root, 'src', 'CRMEB', 'CRMEB-master', 'template', 'admin', 'src');
const uniFrontend = join(root, 'src', 'CRMEB', 'CRMEB-master', 'template', 'uni-app');

function walk(dir, accept = () => true) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path, accept) : accept(path) ? [path] : [];
  });
}

const routeFiles = [
  ...walk(join(backend, 'app', 'api', 'route'), (path) => path.endsWith('.php')),
  ...walk(join(backend, 'app', 'adminapi', 'route'), (path) => path.endsWith('.php')),
];
const routeSource = routeFiles.map((path) => readFileSync(path, 'utf8')).join('\n');

const retiredControllers = [
  'StoreCouponsController', 'StoreBargainController', 'StoreCombinationController',
  'StoreSeckillController', 'StoreAdvanceController', 'StoreIntegralController',
  'LuckLotteryController', 'ArticleController', 'ArticleCategoryController',
  'MessageSystemController', 'UserCollectController', 'UserRechargeController',
  'StoreOrderInvoiceController', 'StoreService',
  'StoreCouponIssue', 'StoreCouponUser', 'StoreBargain', 'StoreCombination',
  'StoreSeckill', 'StoreAdvance', 'StoreIntegralOrder', 'LiveRoom', 'LiveGoods',
  'LiveAnchor', 'SystemStore', 'SystemVerifyOrder', 'SystemTicket',
];

for (const controller of retiredControllers) {
  assert.equal(
    routeSource.includes(controller),
    false,
    `retired controller is still routed: ${controller}`,
  );
}

const runtimeFiles = walk(join(backend, 'app'), (path) => /\.(php|js|vue)$/.test(path));
for (const path of runtimeFiles) {
  const source = readFileSync(path, 'utf8');
  assert.equal(source.includes('MVP module disabled'), false, `${relative(root, path)} still returns an MVP block response`);
  assert.equal(source.includes('MvpRouteBlockMiddleware'), false, `${relative(root, path)} still references the retired route blocker`);
}

const retiredConfigPath = join(backend, 'config', 'retired.php');
const commonPath = join(backend, 'app', 'common.php');
const daoPath = join(backend, 'app', 'dao', 'system', 'SystemMenusDao.php');
const modelPath = join(backend, 'app', 'model', 'system', 'SystemMenus.php');
const retiredConfig = readFileSync(retiredConfigPath, 'utf8');
const commonSource = readFileSync(commonPath, 'utf8');
const daoSource = readFileSync(daoPath, 'utf8');
const modelSource = readFileSync(modelPath, 'utf8');

for (const pattern of ['coupon', 'bargain', 'combination', 'seckill', 'store_integral', 'live/', 'cms/', 'kefu', 'invoice', 'offline', 'store_pickup', 'division']) {
  assert.ok(retiredConfig.includes(`'${pattern}'`), `retired menu pattern is missing: ${pattern}`);
}
assert.ok(commonSource.includes('function retired_admin_menu_patterns'), 'retired menu config helper is not wired');
assert.ok(daoSource.includes('withoutRetiredMenus'), 'menu queries do not apply the retired menu scope');
assert.ok(modelSource.includes('searchRetiredMenuAttr'), 'menu model does not implement the retired menu scope');

const retiredFrontendConfigFiles = [
  join(adminFrontend, 'config', 'mvp.js'),
  join(uniFrontend, 'config', 'mvp.js'),
];
for (const path of retiredFrontendConfigFiles) {
  assert.equal(existsSync(path), false, `legacy MVP frontend config still exists: ${relative(root, path)}`);
}

const frontendFiles = [
  ...walk(adminFrontend, (path) => /\.(js|vue)$/.test(path)),
  ...walk(uniFrontend, (path) => /\.(js|vue|json)$/.test(path)),
];
for (const path of frontendFiles) {
  const source = readFileSync(path, 'utf8');
  assert.equal(source.includes('@/config/mvp'), false, `${relative(root, path)} still imports legacy MVP config`);
  assert.equal(source.includes('isMvp'), false, `${relative(root, path)} still uses legacy MVP naming`);
  assert.equal(source.includes('MVP_ENABLED'), false, `${relative(root, path)} still uses legacy MVP naming`);
}

const pagesJson = readFileSync(join(uniFrontend, 'pages.json'), 'utf8');
const retiredMiniProgramRoutes = [
  'goods_details_store/index',
  'lottery/grids',
  'receive_gift/index',
  'receive_gifts_status/index',
  'message_center',
  'user_coupon',
  'user_get_coupon',
  'user_invoice',
  'user_money',
  'user_payment',
  'points_mall',
  'activity/',
  'columnGoods',
];
for (const route of retiredMiniProgramRoutes) {
  assert.equal(pagesJson.includes(route), false, `retired mini program route is still registered: ${route}`);
}

const retiredFrontendPaths = [
  join(adminFrontend, 'components', 'mobilePage', 'home_bargain.vue'),
  join(adminFrontend, 'components', 'mobilePage', 'home_coupon.vue'),
  join(adminFrontend, 'components', 'mobilePage', 'home_pink.vue'),
  join(adminFrontend, 'components', 'mobilePage', 'home_seckill.vue'),
  join(adminFrontend, 'components', 'mobilePage', 'points_mall.vue'),
  join(adminFrontend, 'components', 'mobilePage', 'wechat_live.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_home_bargain.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_home_coupon.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_home_pink.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_home_seckill.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_new_list.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_points_mall.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_presale.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_ranking.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_short_video.vue'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_wechat_live.vue'),
  join(adminFrontend, 'store', 'module', 'integralOrder.js'),
  join(uniFrontend, 'pages', 'activity'),
  join(uniFrontend, 'pages', 'points_mall'),
  join(uniFrontend, 'pages', 'annex', 'special'),
  join(uniFrontend, 'pages', 'admin', 'order_cancellation'),
  join(uniFrontend, 'pages', 'goods', 'lottery'),
  join(uniFrontend, 'pages', 'goods', 'receive_gift'),
  join(uniFrontend, 'pages', 'goods', 'receive_gifts_status'),
  join(uniFrontend, 'pages', 'goods', 'goods_comment_con', 'lottery_comment.vue'),
  join(uniFrontend, 'pages', 'goods', 'goods_comment_con', 'components', 'userAddress.vue'),
  join(uniFrontend, 'pages', 'goods', 'goods_comment_con', 'components', 'lotteryAleart.vue'),
  join(uniFrontend, 'pages', 'goods', 'order_pay_status', 'payLottery.vue'),
  join(uniFrontend, 'pages', 'goods', 'order_pay_status', 'components', 'userAddress.vue'),
  join(uniFrontend, 'pages', 'goods', 'order_pay_status', 'components', 'lotteryAleart.vue'),
  join(uniFrontend, 'pages', 'users', 'user_coupon'),
  join(uniFrontend, 'pages', 'users', 'user_get_coupon'),
  join(uniFrontend, 'pages', 'users', 'user_invoice_form'),
  join(uniFrontend, 'pages', 'users', 'user_invoice_list'),
  join(uniFrontend, 'pages', 'users', 'user_invoice_order'),
  join(uniFrontend, 'pages', 'users', 'user_integral'),
  join(uniFrontend, 'pages', 'users', 'user_money'),
  join(uniFrontend, 'pages', 'users', 'user_payment'),
  join(uniFrontend, 'pages', 'columnGoods', 'HotNewGoods'),
  join(uniFrontend, 'pages', 'columnGoods', 'live_list'),
];
for (const path of retiredFrontendPaths) {
  assert.equal(existsSync(path), false, `retired frontend orphan still exists: ${relative(root, path)}`);
}

const retiredMiniProgramLinks = [
  '/pages/activity/',
  '/pages/annex/special',
  '/pages/admin/order_cancellation',
  '/pages/points_mall',
  '/pages/goods/lottery',
  '/pages/goods/receive_gift',
  '/pages/goods/receive_gifts_status',
  '/pages/users/user_coupon',
  '/pages/users/user_get_coupon',
  '/pages/users/user_invoice',
  '/pages/users/user_integral',
  '/pages/users/user_money',
  '/pages/users/user_payment',
  '/pages/columnGoods/HotNewGoods',
  '/pages/columnGoods/live_list',
];

const adminDefaultFiles = [
  join(adminFrontend, 'store', 'module', 'fresh.js'),
  join(adminFrontend, 'store', 'module', 'goodSelect.js'),
  join(adminFrontend, 'store', 'module', 'moren.js'),
  join(adminFrontend, 'components', 'mobileConfig', 'c_member.vue'),
  join(adminFrontend, 'pages', 'system', 'group', 'visualization.vue'),
];
for (const path of adminDefaultFiles) {
  const source = readFileSync(path, 'utf8');
  for (const link of retiredMiniProgramLinks) {
    assert.equal(source.includes(link), false, `${relative(root, path)} still contains retired default link: ${link}`);
  }
}

const linkAddressSource = readFileSync(join(adminFrontend, 'components', 'linkaddress', 'index.vue'), 'utf8');
for (const fragment of [
  'marketing_link', 'seckillListApi', 'combinationListApi', 'bargainListApi',
  'integralProductListApi', 'presellListApi', 'lotteryList',
]) {
  assert.equal(linkAddressSource.includes(fragment), false, `link selector still exposes retired picker fragment: ${fragment}`);
}

for (const path of [
  join(adminFrontend, 'components', 'mobilePage', 'index.js'),
  join(adminFrontend, 'components', 'mobileConfig', 'index.js'),
]) {
  const source = readFileSync(path, 'utf8');
  assert.equal(source.includes('require.context'), false, `${relative(root, path)} still dynamically registers every decoration component`);
  for (const fragment of ['home_bargain', 'home_coupon', 'home_pink', 'home_seckill', 'points_mall', 'wechat_live']) {
    assert.equal(source.includes(fragment), false, `${relative(root, path)} still registers retired decoration component: ${fragment}`);
  }
}

const coreMiniProgramFiles = [
  join(uniFrontend, 'libs', 'order.js'),
  join(uniFrontend, 'mixins', 'skuSelect.js'),
  join(uniFrontend, 'components', 'orderGoods', 'index.vue'),
  join(uniFrontend, 'components', 'couponWindow', 'index.vue'),
  join(uniFrontend, 'pages', 'index', 'index.vue'),
  join(uniFrontend, 'pages', 'user', 'index.vue'),
  join(uniFrontend, 'pages', 'goods_details', 'index.vue'),
  join(uniFrontend, 'pages', 'goods', 'order_confirm', 'index.vue'),
  join(uniFrontend, 'pages', 'goods', 'order_details', 'index.vue'),
  join(uniFrontend, 'pages', 'goods', 'order_pay_status', 'index.vue'),
  join(uniFrontend, 'pages', 'goods', 'goods_comment_con', 'index.vue'),
  join(uniFrontend, 'subpackage', 'diyComponents', 'homeUserInfor.vue'),
];
for (const path of coreMiniProgramFiles) {
  const source = readFileSync(path, 'utf8');
  for (const link of retiredMiniProgramLinks) {
    assert.equal(source.includes(link), false, `${relative(root, path)} still links to retired mini program page: ${link}`);
  }
}

const retiredCodeFragments = [
  [join(uniFrontend, 'mixins', 'sharePoster.js'), '@/api/activity'],
  [join(uniFrontend, 'api', 'order.js'), 'order/receive_gift'],
  [join(uniFrontend, 'api', 'order.js'), 'v2/order/down_invoice'],
  [join(adminFrontend, 'store', 'index.js'), 'integralOrder'],
  [join(adminFrontend, 'api', 'marketing.js'), 'marketing/integral/order/'],
];
for (const [path, fragment] of retiredCodeFragments) {
  const source = readFileSync(path, 'utf8');
  assert.equal(source.includes(fragment), false, `${relative(root, path)} still contains retired code fragment: ${fragment}`);
}

const retiredUrls = [
  '/api/coupons', '/api/bargain/list', '/api/combination/list', '/api/seckill/list',
  '/api/advance/list', '/api/lottery', '/api/article/list', '/api/collect/user',
  '/api/user/message_system', '/api/user/recharge', '/api/invoice/list',
  '/adminapi/marketing/coupon/released', '/adminapi/marketing/bargain',
  '/adminapi/marketing/combination', '/adminapi/marketing/seckill',
  '/adminapi/marketing/integral_product', '/adminapi/cms/article',
  '/adminapi/live/room', '/adminapi/kefu/service', '/adminapi/order/invoice',
  '/adminapi/agent/division',
];

async function verifyHttp404s() {
  const baseUrl = process.env.TEST_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl) return false;
  const headers = process.env.ADMIN_TOKEN ? { 'Authori-zation': `Bearer ${process.env.ADMIN_TOKEN}` } : {};
  for (const path of retiredUrls) {
    const response = await fetch(`${baseUrl}${path}`, { headers, redirect: 'manual' });
    assert.equal(response.status, 404, `${path} returned ${response.status}, expected 404`);
  }
  return true;
}

async function verifyRuntimeMenus() {
  if (!process.env.ADMIN_MENU_URL) return false;
  assert.ok(process.env.ADMIN_TOKEN, 'ADMIN_TOKEN is required when ADMIN_MENU_URL is set');
  const response = await fetch(process.env.ADMIN_MENU_URL, {
    headers: { 'Authori-zation': `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  assert.ok(response.ok, `menu request failed with ${response.status}`);
  const body = JSON.stringify(await response.json()).toLowerCase();
  for (const pattern of ['coupon', 'bargain', 'combination', 'seckill', 'lottery', 'cms/', 'kefu', 'invoice', 'offline', 'store_pickup', 'division']) {
    assert.equal(body.includes(pattern), false, `runtime menu response contains retired entry: ${pattern}`);
  }
  return true;
}

const httpChecked = await verifyHttp404s();
const menuChecked = await verifyRuntimeMenus();
console.log(`retired surface contracts passed (static routes/menu: yes, HTTP 404: ${httpChecked ? 'yes' : 'skipped'}, runtime menu: ${menuChecked ? 'yes' : 'skipped'})`);
