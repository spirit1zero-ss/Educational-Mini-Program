import LayoutMain from '@/layout';
import setting from '@/setting';

const routePre = setting.routePre;
const pre = 'order_';

export default {
  path: routePre + '/order',
  name: 'order',
  header: 'order',
  redirect: { name: `${pre}list` },
  component: LayoutMain,
  children: [
    {
      path: 'list',
      name: `${pre}list`,
      meta: {
        auth: ['admin-order-storeOrder-index'],
        title: '订单管理',
      },
      component: () => import('@/pages/order/orderList/index'),
    },
    {
      path: 'refund',
      name: `${pre}refund`,
      meta: {
        auth: ['admin-order-refund'],
        title: '售后订单',
      },
      component: () => import('@/pages/order/refund/index'),
    },
  ],
};
