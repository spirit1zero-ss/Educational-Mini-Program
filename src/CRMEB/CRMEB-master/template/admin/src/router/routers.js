// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import index from './modules/index';
import user from './modules/user';
import setting from './modules/setting';
import agent from './modules/agent';
import finance from './modules/finance';
import system from './modules/system';
import LayoutMain from '@/layout';
import statistic from './modules/statistic';
import frameOut from './modules/frameOut';
import settings from '@/setting';

let routePre = settings.routePre;
/**
 * 在主框架内显示
 */

const frameIn = [
  {
    path: '/',
    meta: {
      title: 'CRMEB',
    },
    redirect: {
      name: 'home_index',
    },
    component: LayoutMain,
    children: [
      {
        path: routePre + '/system/user',
        name: `systemUser`,
        meta: {
          auth: true,
          title: '个人中心',
        },
        component: () => import('@/pages/setting/user/index'),
      },
      // 刷新页面 必须保留
      {
        path: 'refresh',
        name: 'refresh',
        hidden: true,
        component: {
          beforeRouteEnter(to, from, next) {
            next((instance) => instance.$router.replace(from.fullPath));
          },
          render: (h) => h(),
        },
      },
      // 页面重定向 必须保留
      {
        path: 'redirect/:route*',
        name: 'redirect',
        hidden: true,
        component: {
          beforeRouteEnter(to, from, next) {
            next((instance) => instance.$router.replace(JSON.parse(from.params.route)));
          },
          render: (h) => h(),
        },
      },
    ],
  },
  {
    path: routePre,
    meta: {
      title: 'CRMEB',
    },
    redirect: {
      name: 'home_index',
    },
    component: LayoutMain,
  },
  {
    path: routePre + '/widget.images/index.html',
    name: `images`,
    meta: {
      auth: ['admin-user-user-index'],
      title: '上传图片',
    },
    component: () => import('@/components/uploadPictures/widgetImg'),
  },
  {
    path: routePre + '/widget.widgets/icon.html',
    name: `imagesIcon`,
    meta: {
      auth: ['admin-user-user-index'],
      title: '上传图标',
    },
    component: () => import('@/components/iconFrom/index'),
  },
  {
    path: routePre + '/system.User/list.html',
    name: `changeUser`,
    meta: {
      title: '选择用户',
    },
    component: () => import('@/components/customerInfo/index'),
  },
  index,
  agent,
  user,
  finance,
  setting,
  system,
  statistic,
];

/**
 * 在主框架之外显示
 */

const frameOuts = frameOut.filter((route) => route.name === 'login');

/**
 * 错误页面
 */

const errorPage = [
  {
    path: routePre + '/403',
    name: '403',
    meta: {
      title: '403',
    },
    component: () => import('@/pages/system/error/403'),
  },
  {
    path: routePre + '/500',
    name: '500',
    meta: {
      title: '500',
    },
    component: () => import('@/pages/system/error/500'),
  },
  {
    path: routePre + '/*',
    name: '404',
    meta: {
      title: '404',
    },
    component: () => import('@/pages/system/error/404'),
  },
];

// 导出需要显示菜单的
export const frameInRoutes = frameIn;

// 重新组织后导出
export default [...frameIn, ...frameOuts, ...errorPage];
