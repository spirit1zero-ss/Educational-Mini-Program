import LayoutMain from '@/layout';
import setting from '@/setting';

const routePre = setting.routePre;
const pre = 'education_';

export default {
  path: routePre + '/education',
  name: 'education',
  header: 'education',
  redirect: {
    name: `${pre}assessmentRecords`,
  },
  meta: {
    auth: ['admin-education'],
    title: '教育',
  },
  component: LayoutMain,
  children: [
    {
      path: 'assessment-records',
      name: `${pre}assessmentRecords`,
      meta: {
        auth: ['education-assessment-records'],
        title: '测评记录',
      },
      component: () => import('@/pages/education/assessmentRecord/index'),
    },
  ],
};
