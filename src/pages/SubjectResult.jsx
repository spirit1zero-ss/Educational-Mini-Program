import { Award, Lightbulb, Route as RouteIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { subjectResult } from '../data/mockData.js';

export default function SubjectResult() {
  const navigate = useNavigate();

  return (
    <PageShell title="学科测评结果">
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-[#ebfff4] to-white p-5">
          <p className="text-sm font-bold text-growthGreen">学习潜能画像</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">{subjectResult.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{subjectResult.potential}</p>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Award className="text-warmOrange" size={20} />
            <h3 className="text-lg font-black text-slate-900">学科优势</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {subjectResult.strengths.map((item) => (
              <div key={item} className="rounded-2xl bg-orange-50 px-2 py-3 text-center text-xs font-black text-orange-600">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="text-lg font-black text-slate-900">学习状态分析</h3>
          <p className="text-sm leading-6 text-slate-600">{subjectResult.state}</p>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <RouteIcon className="text-growthBlue" size={20} />
            <h3 className="text-lg font-black text-slate-900">推荐突破学科</h3>
          </div>
          <p className="text-sm leading-6 text-slate-600">{subjectResult.breakthrough}</p>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-growthGreen" size={20} />
            <h3 className="text-lg font-black text-slate-900">学习建议</h3>
          </div>
          <ul className="space-y-2">
            {subjectResult.advice.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 p-5">
          <p className="text-sm font-bold text-slate-500">推荐训练营</p>
          <h3 className="text-xl font-black text-slate-950">{subjectResult.plan}</h3>
          <PrimaryButton onClick={() => navigate('/camp')}>领取成长方案</PrimaryButton>
        </Card>
      </div>
    </PageShell>
  );
}
