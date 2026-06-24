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
  {
    path: routePre + '/order/print',
    name: 'order-print-print',
    meta: {
      title: '配货单打印',
    },
    component: () => import('@/pages/order/print/index'),
  },
];
