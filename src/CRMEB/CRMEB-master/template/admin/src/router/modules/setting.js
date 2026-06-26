import LayoutMain from '@/layout';
import setting from '@/setting';

const routePre = setting.routePre;
const pre = 'setting_';

export default {
  path: routePre + '/setting',
  name: 'setting',
  header: 'setting',
  redirect: { name: `${pre}setSystem` },
  component: LayoutMain,
  children: [
    {
      path: 'system_role/index',
      name: `${pre}systemRole`,
      meta: { auth: ['setting-system-role'], title: '身份管理' },
      component: () => import('@/pages/setting/systemRole/index'),
    },
    {
      path: 'system_admin/index',
      name: `${pre}systemAdmin`,
      meta: { auth: ['setting-system-list'], title: '管理员列表' },
      component: () => import('@/pages/setting/systemAdmin/index'),
    },
    {
      path: 'system_menus/index',
      name: `${pre}systemMenus`,
      meta: { auth: ['setting-system-menus'], title: '权限规则' },
      component: () => import('@/pages/setting/systemMenus/index'),
    },
    {
      path: 'system_config',
      name: `${pre}setSystem`,
      meta: { auth: ['setting-system-config'], title: '系统设置' },
      component: () => import('@/pages/setting/setSystem/index'),
    },
    {
      path: 'system_config/:type?/:tab_id?',
      name: `${pre}setApp`,
      meta: { title: '系统设置' },
      component: () => import('@/pages/setting/setSystem/index'),
    },
    {
      path: 'system_config_retail/:type?/:tab_id?',
      name: `${pre}distributionSet`,
      meta: { auth: true, title: '基础分销配置' },
      component: () => import('@/pages/setting/setSystem/index'),
    },
    {
      path: 'membership_level/index',
      name: `${pre}membershipLevel`,
      meta: { auth: true, title: '会员等级' },
      component: () => import('@/pages/setting/membershipLevel/index'),
    },
    {
      path: 'system_config_message/:type?/:tab_id?',
      name: `${pre}message`,
      meta: { auth: ['setting-system-config-message'], title: '消息开关' },
      component: () => import('@/pages/setting/setSystem/index'),
    },
    {
      path: 'notification/index',
      name: `${pre}notification`,
      meta: { auth: ['setting-notification'], title: '消息管理' },
      component: () => import('@/pages/setting/notification/index'),
    },
    {
      path: 'notification/notificationEdit',
      name: `${pre}notificationEdit`,
      meta: {
        auth: ['setting-notification'],
        title: '消息编辑',
        activeMenu: routePre + '/setting/notification/index',
      },
      component: () => import('@/pages/setting/notification/notificationEdit'),
    },
  ],
};
