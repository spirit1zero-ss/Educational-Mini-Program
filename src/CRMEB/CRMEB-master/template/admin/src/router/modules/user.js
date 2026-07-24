import LayoutMain from '@/layout';
import setting from '@/setting';

const routePre = setting.routePre;
const pre = 'user_';

export default {
  path: routePre + '/user',
  name: 'user',
  header: 'user',
  redirect: { name: `${pre}list` },
  meta: { auth: true },
  component: LayoutMain,
  children: [
    {
      path: 'list',
      name: `${pre}list`,
      meta: { auth: ['admin-user-user-index'], title: '用户管理' },
      component: () => import('@/pages/user/list/index'),
    },
    {
      path: 'level',
      name: `${pre}level`,
      meta: { auth: ['user-user-level'], footer: true, title: '用户等级' },
      component: () => import('@/pages/user/level/index'),
    },
    {
      path: 'group',
      name: `${pre}group`,
      meta: { auth: ['user-user-group'], footer: true, title: '用户分组' },
      component: () => import('@/pages/user/group/index'),
    },
    {
      path: 'label',
      name: `${pre}label`,
      meta: { auth: ['user-user-label'], footer: true, title: '用户标签' },
      component: () => import('@/pages/user/label/index'),
    },
    {
      path: 'grade/type',
      name: `${pre}type`,
      meta: { auth: ['admin-user-member-type'], footer: true, title: '会员类型' },
      component: () => import('@/pages/user/grade/type/index'),
    },
    {
      path: 'grade/trainingCampOrders',
      name: `${pre}trainingCampOrders`,
      meta: { auth: ['admin-user-grade-training-camp-orders'], footer: true, title: '训练营订单' },
      component: () => import('@/pages/user/grade/trainingCampOrders/index'),
    },
    {
      path: 'grade/registration',
      name: `${pre}trainingCampRegistration`,
      meta: { auth: ['admin-user-grade-registration'], footer: true, title: '报名登记表' },
      component: () => import('@/pages/user/grade/registration/index'),
    },
    {
      path: 'grade/offlineLocations',
      name: `${pre}offlineLocations`,
      meta: { auth: ['admin-user-grade-offline-locations'], footer: true, title: '线下地址' },
      component: () => import('@/pages/user/grade/offlineLocations/index'),
    },
    {
      path: 'grade/card',
      name: `${pre}card`,
      meta: { auth: ['admin-user-grade-card'], footer: true, title: '卡密会员' },
      component: () => import('@/pages/user/grade/card/index'),
    },
    {
      path: 'grade/record',
      name: `${pre}record`,
      meta: { auth: ['admin-user-grade-record'], footer: true, title: '会员记录' },
      component: () => import('@/pages/user/grade/record/index'),
    },
    {
      path: 'grade/right',
      name: `${pre}right`,
      meta: { auth: ['admin-user-grade-right'], footer: true, title: '会员权益' },
      component: () => import('@/pages/user/grade/right/index'),
    },
    {
      path: 'grade/list/:id',
      name: `${pre}gradelist`,
      meta: { auth: ['user-member_card-index'], footer: true, title: '会员卡列表' },
      component: () => import('@/pages/user/grade/card/list'),
    },
    {
      path: 'grade/agreement',
      name: `${pre}agreement`,
      meta: { auth: ['admin-user-grade-agreement'], footer: true, title: '小程序协议' },
      component: () => import('@/pages/user/grade/agreement/index'),
    },
  ],
};
