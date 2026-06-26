import { getTeamStats } from '../api/training.js';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import { team } from '../data/mockData.js';
import useCrmebData from '../hooks/useCrmebData.js';

export default function Team() {
  const { data, status } = useCrmebData(getTeamStats, team, []);

  return (
    <PageShell title="团队中心">
      <div className="space-y-3">
        <div className="flex justify-end">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">
            {status === 'live' ? 'CRMEB数据' : '演示数据'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {data.map((item) => (
            <Card key={item.label} className="p-5 text-center">
              <p className="text-3xl font-black text-slate-950">{item.value}</p>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-400">{item.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
