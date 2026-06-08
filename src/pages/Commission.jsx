import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { commissionRecords } from '../data/mockData.js';

export default function Commission() {
  return (
    <PageShell title="佣金中心">
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-[#fff5e6] to-white p-5">
          <p className="text-sm font-bold text-orange-500">累计收益</p>
          <p className="mt-2 text-4xl font-black text-slate-950">¥1,280</p>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400">可提现金额</p>
            <p className="mt-1 text-2xl font-black text-warmOrange">¥356</p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-50 px-5 py-4">
            <h2 className="text-lg font-black text-slate-950">历史记录</h2>
          </div>
          {commissionRecords.map((record) => (
            <div key={`${record.title}-${record.date}`} className="flex items-center justify-between border-b border-slate-50 px-5 py-4 last:border-b-0">
              <div>
                <p className="text-sm font-black text-slate-800">{record.title}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{record.date}</p>
              </div>
              <p className="text-sm font-black text-growthGreen">{record.amount}</p>
            </div>
          ))}
        </Card>

        <PrimaryButton variant="disabled" disabled>
          提现暂未开放
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
