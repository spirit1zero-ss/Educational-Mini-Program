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

const pre = 'system_';

export default {
  path: routePre + '/system',
  name: 'system',
  header: 'system',
  redirect: {
    name: `${pre}configTab`,
  },
  meta: {
    auth: ['admin-system'],
  },
  component: LayoutMain,
  children: [
    {
      path: 'maintain/system_log/index',
      name: `${pre}systemLog`,
      meta: {
        auth: ['system-maintain-system-log'],
        title: '系统日志',
      },
      component: () => import('@/pages/system/maintain/systemLog/index'),
    },
    {
      path: 'maintain/clear/index',
      name: `${pre}clear`,
      meta: {
        auth: ['system-clear'],
        title: '刷新缓存',
      },
      component: () => import('@/pages/system/maintain/clear/index'),
    },
    {
      path: 'maintain/system_databackup/index',
      name: `${pre}systemDatabackup`,
      meta: {
        auth: ['system-maintain-system-databackup'],
        title: '数据备份',
      },
      component: () => import('@/pages/system/maintain/systemDatabackup/index'),
    },
    {
      path: 'config/system_config_tab/index',
      name: `${pre}configTab`,
      meta: {
        auth: ['system-config-system_config-tab'],
        title: '配置分类',
      },
      component: () => import('@/pages/system/configTab/index'),
    },
    {
      path: 'config/system_config_tab/list/:id?',
      name: `${pre}configTabList`,
      meta: {
        auth: ['system-config-system_config_tab-list'],
        title: '配置列表',
        activeMenu: routePre + '/system/config/system_config_tab/index',
      },
      component: () => import('@/pages/system/configTab/list'),
    },
    {
      path: 'config/system_group/index',
      name: `${pre}group`,
      meta: {
        auth: ['system-config-system_config-group'],
        title: '组合数据',
      },
      component: () => import('@/pages/system/group/index'),
    },
    {
      path: 'config/system_group/list/:id?',
      name: `${pre}groupList`,
      meta: {
        auth: ['system-config-system_config-list'],
        title: '组合数据列表',
        activeMenu: routePre + '/system/config/system_group/index',
      },
      component: () => import('@/pages/system/group/list'),
    },
    {
      path: 'maintain/auth',
      name: `${pre}auth`,
      meta: {
        auth: ['system-maintain-auth'],
        title: '商业授权',
      },
      component: () => import('@/pages/system/auth/index'),
    },
    {
      path: 'crontab',
      name: `${pre}crontab`,
      meta: {
        auth: ['system-crontab-index'],
        title: '定时任务',
      },
      component: () => import('@/pages/system/crontab/index'),
    },
    {
      path: 'event',
      name: `${pre}event`,
      meta: {
        auth: ['system-event-index'],
        title: '自定义事件',
      },
      component: () => import('@/pages/system/event/index'),
    },
    {
      path: 'system_menus/index',
      name: `${pre}systemMenus`,
      meta: {
        auth: ['system-system-menus'],
        title: '权限规则',
      },
      component: () => import('@/pages/system/systemMenus/index'),
    },
  ],
};
