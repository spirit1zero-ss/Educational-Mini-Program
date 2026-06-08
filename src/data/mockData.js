export const heartTypes = [
  {
    id: 'a',
    code: 'A',
    name: '张扬大气型',
    traits: ['胆大', '爱表现', '有能量'],
    emoji: '🌞',
    color: 'from-orange-100 to-amber-50'
  },
  {
    id: 'b',
    code: 'B',
    name: '稳重细腻型',
    traits: ['含蓄', '敏感', '责任感强'],
    emoji: '🌙',
    color: 'from-blue-100 to-indigo-50'
  },
  {
    id: 'c',
    code: 'C',
    name: '温和实在型',
    traits: ['阳光', '乖巧', '随遇而安'],
    emoji: '🌿',
    color: 'from-emerald-100 to-green-50'
  }
];

export const heartResult = {
  type: '稳重细腻型',
  profile: [
    { label: '专注力', value: 86 },
    { label: '自信心', value: 58 },
    { label: '执行力', value: 76 },
    { label: '沟通力', value: 64 },
    { label: '内驱力', value: 70 }
  ],
  strengths: ['责任感强', '观察力强', '细节敏锐'],
  challenges: ['容易胆怯', '害怕犯错', '容易自我否定'],
  advice: ['多鼓励', '少批评', '建立安全感', '培养自信心'],
  plan: '内驱力建设训练营'
};

export const subjectPeople = [
  {
    name: '观察者',
    emoji: '🧒',
    color: 'from-blue-100 to-cyan-50'
  },
  {
    name: '推理者',
    emoji: '👦',
    color: 'from-emerald-100 to-lime-50'
  },
  {
    name: '表达者',
    emoji: '👧',
    color: 'from-orange-100 to-rose-50'
  }
];

export const subjectOptions = [
  '语文 / 数学 / 英语',
  '语文 / 英语 / 数学',
  '数学 / 语文 / 英语',
  '数学 / 英语 / 语文',
  '英语 / 语文 / 数学',
  '英语 / 数学 / 语文'
];

export const subjectResult = {
  title: '逻辑型学习者',
  potential: '孩子对结构、规律和因果关系更敏感，适合用图示、步骤和复盘来提升学习效率。',
  strengths: ['数学推理', '规律归纳', '任务拆解'],
  state: '当前学习状态稳定，但遇到开放表达类任务时容易慢热，需要建立更明确的表达框架。',
  breakthrough: '优先突破数学，再带动语文阅读理解与英语语法体系。',
  advice: ['每天 15 分钟错题复盘', '用流程图整理知识点', '把大任务拆成三步完成'],
  plan: '21天自主学习训练营'
};

export const user = {
  name: '王妈妈',
  level: 'VIP会员',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  stats: [
    { label: '累计测评', value: '6次' },
    { label: '训练营', value: '1期' },
    { label: '邀请好友', value: '12人' },
    { label: '团队人数', value: '38人' }
  ]
};

export const archive = [
  {
    date: '2026-06',
    title: '读懂孩子心',
    result: '稳重细腻型',
    advice: '培养自信心'
  },
  {
    date: '2026-06',
    title: '学科测评',
    result: '逻辑型学习者',
    advice: '优先突破数学'
  }
];

export const campDays = Array.from({ length: 21 }, (_, index) => {
  const day = index + 1;
  return {
    day,
    title: `Day ${day}`,
    status: day < 4 ? 'done' : day === 4 ? 'active' : 'locked'
  };
});

export const invite = {
  code: 'A8X2P6',
  invited: 12,
  reward: '¥356'
};

export const team = [
  { label: '一级用户人数', value: '12' },
  { label: '二级用户人数', value: '26' },
  { label: '团队总人数', value: '38' },
  { label: '累计佣金', value: '¥1,280' }
];

export const commissionRecords = [
  { title: '好友加入训练营', amount: '+¥128', date: '2026-06-01' },
  { title: '二级好友奖励', amount: '+¥36', date: '2026-05-28' },
  { title: '邀请成长奖励', amount: '+¥68', date: '2026-05-21' }
];
