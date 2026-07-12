import setting from '@/setting';

const routePre = setting.routePre;

export default [
  {
    path: routePre + '/login',
    name: 'login',
    meta: {
      title: '登录',
      hideInMenu: true,
    },
    component: () => import('@/pages/account/login'),
  },
];
