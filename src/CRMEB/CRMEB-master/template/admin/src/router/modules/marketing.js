import LayoutMain from '@/layout';
import setting from '@/setting';

const routePre = setting.routePre;
const pre = 'marketing_';

export default {
  path: routePre + '/marketing',
  name: 'marketing',
  header: 'marketing',
  redirect: { name: `${pre}sign` },
  component: LayoutMain,
  children: [
    {
      path: 'point_record',
      name: `${pre}point_record`,
      meta: {
        auth: ['marketing-point_record-index'],
        title: '积分记录',
      },
      component: () => import('@/pages/marketing/point_record/index'),
    },
    {
      path: 'point_statistic',
      name: `${pre}point_statistic`,
      meta: {
        auth: ['marketing-point_statistic-index'],
        title: '积分统计',
      },
      component: () => import('@/pages/marketing/point_statistic/index'),
    },
    {
      path: 'sign',
      name: `${pre}sign`,
      meta: { title: '签到配置' },
      component: () => import('@/pages/marketing/sign/index'),
    },
    {
      path: 'sign_rewards',
      name: `${pre}sign_rewards`,
      meta: { title: '签到奖励' },
      component: () => import('@/pages/marketing/sign/rewards'),
    },
    {
      path: 'member_config/:type?/:tab_id?',
      name: `${pre}member_config`,
      meta: { title: '会员配置' },
      component: () => import('@/pages/setting/setSystem/index'),
    },
  ],
};
