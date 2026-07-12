// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------

import LayoutMain from '@/layout';
import setting from '@/setting';
let routePre = setting.routePre;

const meta = {
  auth: true,
};

const pre = 'statistic_';

export default {
  path: routePre + '/statistic',
  name: 'statistic',
  header: 'statistic',
  redirect: {
    name: `${pre}user`,
  },
  component: LayoutMain,
  children: [
    {
      path: 'user',
      name: `${pre}user`,
      meta: {
        // auth: ['setting-system-role'],
        title: '用户统计',
      },
      component: () => import('@/pages/statistic/user/index'),
    },
    {
      path: 'balance',
      name: `${pre}balance`,
      meta: {
        // auth: ['setting-system-role'],
        title: '余额统计',
      },
      component: () => import('@/pages/statistic/balance/index'),
    },
  ],
};
