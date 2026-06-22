import { BookOpen, ChevronRight, Heart, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import TreeModel from '../components/TreeModel.jsx';

const entries = [
  {
    icon: Heart,
    title: '读懂孩子心',
    text: '真正读懂孩子的天赋、性格与内驱力',
    button: '立即测评',
    to: '/assessment/heart',
    color: 'text-rose-500',
    variant: 'primary'
  },
  {
    icon: BookOpen,
    title: '学科测评',
    text: '发现孩子的学习潜能与突破方向',
    button: '开始测评',
    to: '/assessment/subject',
    color: 'text-growthBlue',
    variant: 'green'
  },
  {
    icon: TreePine,
    title: '自主学习训练营',
    text: '从内驱力、习惯到学科开窍的成长闭环',
    button: '查看详情',
    to: '/camp',
    color: 'text-growthGreen',
    variant: 'orange'
  }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-5 pt-5">
      <div className="mx-auto max-w-[430px] space-y-5">
        <Card className="overflow-hidden bg-gradient-to-br from-[#edf5ff] via-white to-[#ecfff5] p-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-bold text-growthBlue">成长型教育 H5 Demo</p>
              <h1 className="text-[28px] font-black leading-tight text-slate-950">自主学习训练营</h1>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">帮助孩子建立自主学习能力</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
              <p className="text-xl">🌳</p>
              <p className="text-[11px] font-bold text-slate-500">成长树</p>
            </div>
          </div>
          <TreeModel />
        </Card>

        <section className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.title} className="p-4">
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-50 ${entry.color}`}>
                    <entry.icon size={25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-black text-slate-900">{entry.title}</h2>
                      <ChevronRight className="text-slate-300" size={20} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{entry.text}</p>
                  </div>
                </div>
                <PrimaryButton variant={entry.variant} onClick={() => navigate(entry.to)}>
                  {entry.button}
                </PrimaryButton>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
