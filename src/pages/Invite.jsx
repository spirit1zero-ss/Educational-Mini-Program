import { Copy, Share2 } from 'lucide-react';
import { getInviteInfo } from '../api/training.js';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { invite } from '../data/mockData.js';
import useCrmebData from '../hooks/useCrmebData.js';

export default function Invite() {
  const { data, status } = useCrmebData(getInviteInfo, invite, []);

  return (
    <PageShell title="邀请好友">
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-growthBlue to-[#78bdfd] p-6 text-center text-white">
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm font-bold text-white/80">邀请好友一起成长</p>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-black">
              {status === 'live' ? 'CRMEB数据' : '演示数据'}
            </span>
          </div>
          <div className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-3xl bg-white px-6 py-4 text-growthBlue shadow-sm">
            <span className="text-3xl font-black tracking-[0.18em]">{data.code}</span>
            <Copy size={20} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-5 text-center">
            <p className="text-3xl font-black text-slate-950">{data.invited}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">已邀请人数</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-3xl font-black text-warmOrange">{data.reward}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">累计奖励</p>
          </Card>
        </div>

        <PrimaryButton>
          <span className="inline-flex items-center justify-center gap-2">
            <Share2 size={18} />
            立即分享
          </span>
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
