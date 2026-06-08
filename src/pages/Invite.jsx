import { Copy, Share2 } from 'lucide-react';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { invite } from '../data/mockData.js';

export default function Invite() {
  return (
    <PageShell title="邀请好友">
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-growthBlue to-[#78bdfd] p-6 text-center text-white">
          <p className="text-sm font-bold text-white/80">邀请好友一起成长</p>
          <div className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-3xl bg-white px-6 py-4 text-growthBlue shadow-sm">
            <span className="text-3xl font-black tracking-[0.18em]">{invite.code}</span>
            <Copy size={20} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-5 text-center">
            <p className="text-3xl font-black text-slate-950">{invite.invited}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">已邀请人数</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-3xl font-black text-warmOrange">{invite.reward}</p>
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
