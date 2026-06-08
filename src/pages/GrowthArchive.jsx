import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import { archive } from '../data/mockData.js';

export default function GrowthArchive() {
  return (
    <PageShell title="成长档案">
      <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-blue-100">
        {archive.map((item) => (
          <div key={`${item.date}-${item.title}`} className="relative pl-10">
            <span className="absolute left-[9px] top-5 h-3 w-3 rounded-full bg-growthBlue ring-4 ring-blue-100" />
            <Card className="p-5">
              <p className="text-xs font-black text-growthBlue">{item.date}</p>
              <h2 className="mt-2 text-lg font-black text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm font-semibold text-slate-600">结果：{item.result}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">建议：{item.advice}</p>
            </Card>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
