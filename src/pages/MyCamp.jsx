import { Check, Lock, Play } from 'lucide-react';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import { campDays } from '../data/mockData.js';

const statusStyles = {
  done: 'bg-growthGreen text-white',
  active: 'bg-growthBlue text-white',
  locked: 'bg-slate-100 text-slate-400'
};

const statusIcon = {
  done: Check,
  active: Play,
  locked: Lock
};

export default function MyCamp() {
  return (
    <PageShell title="我的训练营">
      <Card className="mb-5 bg-gradient-to-br from-[#eaf2ff] to-white p-5">
        <p className="text-sm font-bold text-growthBlue">进行中</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">21天自主学习训练营</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">已完成 3 天，今天进入 Day 4 学习任务。</p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {campDays.map((item) => {
          const Icon = statusIcon[item.status];
          return (
            <div key={item.day} className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100">
              <div className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full ${statusStyles[item.status]}`}>
                <Icon size={17} />
              </div>
              <p className="text-xs font-black text-slate-700">{item.title}</p>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
