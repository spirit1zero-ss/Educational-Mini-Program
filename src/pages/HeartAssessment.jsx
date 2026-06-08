import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import { heartTypes } from '../data/mockData.js';

export default function HeartAssessment() {
  const navigate = useNavigate();

  return (
    <PageShell title="读懂孩子心">
      <section className="mb-5">
        <p className="text-sm font-bold text-growthBlue">请选择最接近孩子日常表现的一项</p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">孩子属于哪种类型？</h2>
      </section>

      <div className="space-y-4">
        {heartTypes.map((item) => (
          <Card
            key={item.id}
            as="button"
            type="button"
            onClick={() => navigate('/assessment/heart/result')}
            className="flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.99]"
          >
            <div
              aria-label={item.name}
              className={`grid h-24 w-24 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br ${item.color} text-4xl shadow-inner`}
            >
              {item.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-black text-growthBlue">{item.code}</p>
              <h3 className="text-lg font-black text-slate-950">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.traits.join(' / ')}</p>
            </div>
            <CheckCircle2 className="shrink-0 text-slate-200" size={22} />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
