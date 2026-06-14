const fs = require('fs');
const path = require('path');

const ok = (res, data = {}, msg = 'success') => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ status: 200, msg, data }));
};

const fail = (res, msg = '账号或密码错误') => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ status: 400, msg, data: {} }));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });

const menuItem = (id, title, pathName, icon, header, children = []) => ({
  id,
  pid: 0,
  title,
  path: pathName,
  icon,
  header,
  is_header: 1,
  is_show: 1,
  auth: ['hidden'],
  children,
});

const childItem = (id, pid, title, pathName, header) => ({
  id,
  pid,
  title,
  path: pathName,
  icon: '',
  header,
  is_header: 0,
  is_show: 1,
  auth: ['hidden'],
});

const menus = [
  menuItem(1, '首页', '/admin/index', 'md-home', 'home', [childItem(101, 1, '首页', '/admin/index', 'home')]),
  menuItem(2, '商品管理', '/admin/product', 'md-cube', 'product', [
    childItem(201, 2, '课程/训练营', '/admin/product/product_list', 'product'),
    childItem(202, 2, '课程分类', '/admin/product/product_classify', 'product'),
  ]),
  menuItem(3, '订单管理', '/admin/order', 'md-list-box', 'order', [
    childItem(301, 3, '订单列表', '/admin/order/list', 'order'),
    childItem(302, 3, '售后订单', '/admin/order/refund', 'order'),
  ]),
  menuItem(4, '用户管理', '/admin/user', 'md-people', 'user', [
    childItem(401, 4, '用户列表', '/admin/user/list', 'user'),
    childItem(402, 4, '用户标签', '/admin/user/label', 'user'),
  ]),
  menuItem(5, '分销管理', '/admin/agent', 'md-git-network', 'agent', [
    childItem(501, 5, '分销员', '/admin/agent/agent_manage/index', 'agent'),
    childItem(502, 5, '分销申请', '/admin/agent/spread/apply', 'agent'),
  ]),
  menuItem(6, '佣金记录', '/admin/finance', 'md-card', 'finance', [
    childItem(601, 6, '佣金记录', '/admin/finance/finance/commission', 'finance'),
    childItem(602, 6, '账单记录', '/admin/finance/billing_records/index', 'finance'),
  ]),
  menuItem(7, '内容管理', '/admin/cms', 'md-paper', 'cms', [
    childItem(701, 7, '文章列表', '/admin/cms/article/index', 'cms'),
    childItem(702, 7, '文章分类', '/admin/cms/article_category/index', 'cms'),
  ]),
  menuItem(8, '系统配置', '/admin/setting', 'md-settings', 'setting', [
    childItem(801, 8, '系统配置', '/admin/setting/system_config', 'setting'),
    childItem(802, 8, '支付配置', '/admin/setting/other_config/pay', 'setting'),
  ]),
];

const flattenMenus = (items) =>
  items.reduce((rows, item) => {
    rows.push(item);
    if (item.children && item.children.length) {
      rows.push(...flattenMenus(item.children));
    }
    return rows;
  }, []);

const collectRouteAuth = () => {
  const routerDir = path.join(__dirname, '..', 'src', 'router');
  const files = [
    path.join(routerDir, 'routers.js'),
    ...fs
      .readdirSync(path.join(routerDir, 'modules'))
      .filter((file) => file.endsWith('.js'))
      .map((file) => path.join(routerDir, 'modules', file)),
  ];
  const auth = new Set(['admin-index-index']);
  const pattern = /auth:\s*\[\s*['"]([^'"]+)['"]/g;
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = pattern.exec(content))) {
      auth.add(match[1]);
    }
  });
  return Array.from(auth);
};

const uniqueAuth = collectRouteAuth();

const previewUser = {
  id: 1,
  account: 'admin',
  real_name: 'MVP预览管理员',
  roles: 'admin',
  head_pic: '',
};

const loginPayload = () => ({
  token: 'preview-token',
  expires_time: Math.floor(Date.now() / 1000) + 86400,
  user_info: previewUser,
  site_func: [],
  unique_auth: uniqueAuth,
  menus,
  logo: '',
  logo_square: '',
  version: 'MVP Preview',
  newOrderAudioLink: '',
  queue: 0,
  timer: 0,
});

const emptyList = {
  list: [],
  count: 0,
  total: 0,
  data: [],
};

module.exports = function installAdminPreviewMock(app) {
  app.get('/adminapi/login/info', (req, res) => {
    ok(res, {
      site_name: '训练营商城 MVP',
      login_logo: '',
      slide: [],
      key: 'preview',
      copyright: '本地预览模式',
      version: 'MVP Preview',
      login_captcha: 0,
    });
  });

  app.post('/adminapi/login', async (req, res) => {
    const body = await readBody(req);
    if (body.account === 'admin' && body.pwd === 'crmeb.com') {
      ok(res, loginPayload());
      return;
    }
    fail(res);
  });

  app.get('/adminapi/menus', (req, res) => {
    ok(res, { menus, unique_auth: uniqueAuth });
  });

  app.get('/adminapi/menusList', (req, res) => {
    ok(res, flattenMenus(menus));
  });

  app.get('/adminapi/get_workerman_url', (req, res) => {
    ok(res, { admin: 'ws://127.0.0.1:9', url: 'ws://127.0.0.1:9' });
  });

  app.all('/adminapi/*', (req, res) => {
    ok(res, emptyList);
  });

  app.all('/kefuapi/*', (req, res) => {
    ok(res, emptyList);
  });
};
