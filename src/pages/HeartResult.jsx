import { Rocket, Sparkles, Target, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { heartResult } from '../data/mockData.js';

function ChipList({ items, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-growthBlue',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-3 py-2 text-sm font-bold ${tones[tone]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function HeartResult() {
  const navigate = useNavigate();

  return (
    <PageShell title="测评结果">
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-growthBlue to-[#71b6ff] p-5 text-white">
          <p className="text-sm font-bold text-white/80">测评结果</p>
          <h2 className="mt-2 text-3xl font-black">{heartResult.type}</h2>
          <p className="mt-3 text-sm leading-6 text-white/85">孩子内心细腻、责任感强，适合在安全感中被稳定看见。</p>
        </Card>

        <Card className="space-y-4 p-5">
          <h3 className="text-lg font-black text-slate-900">能力画像</h3>
          {heartResult.profile.map((item) => (
            <ProgressBar key={item.label} {...item} />
          ))}
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-slate-900">
            <Target className="text-warmOrange" size={20} />
            <h3 className="text-lg font-black">天赋优势</h3>
          </div>
          <ChipList items={heartResult.strengths} tone="green" />
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-slate-900">
            <TriangleAlert className="text-orange-500" size={20} />
            <h3 className="text-lg font-black">成长挑战</h3>
          </div>
          <ChipList items={heartResult.challenges} tone="orange" />
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-slate-900">
            <Sparkles className="text-growthBlue" size={20} />
            <h3 className="text-lg font-black">家长建议</h3>
          </div>
          <ChipList items={heartResult.advice} />
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-growthBlue">
              <Rocket size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">推荐成长方案</p>
              <h3 className="text-lg font-black text-slate-950">{heartResult.plan}</h3>
            </div>
          </div>
          <PrimaryButton onClick={() => navigate('/camp')}>了解训练营</PrimaryButton>
        </Card>
      </div>
    </PageShell>
  );
}
