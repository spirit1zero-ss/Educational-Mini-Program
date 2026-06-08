import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import { team } from '../data/mockData.js';

export default function Team() {
  return (
    <PageShell title="团队中心">
      <div className="grid grid-cols-2 gap-3">
        {team.map((item) => (
          <Card key={item.label} className="p-5 text-center">
            <p className="text-3xl font-black text-slate-950">{item.value}</p>
            <p className="mt-2 text-xs font-bold leading-5 text-slate-400">{item.label}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
