import { CalendarCheck, MessageCircleQuestion, Radio, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import TreeModel from '../components/TreeModel.jsx';

const stages = [
  { title: '第一阶段', subtitle: '内驱力建设', items: ['读懂孩子内心', '建设家庭能量场'], color: 'bg-blue-50 text-growthBlue' },
  { title: '第二阶段', subtitle: '学习习惯养成', items: ['SOP 高效作业法'], color: 'bg-emerald-50 text-emerald-600' },
  { title: '第三阶段', subtitle: '学科开窍', items: ['语文', '数学', '英语', '学习底层逻辑'], color: 'bg-orange-50 text-orange-600' }
];

const services = [
  { icon: Radio, title: '3次直播' },
  { icon: CalendarCheck, title: '21天打卡督导' },
  { icon: MessageCircleQuestion, title: '3个月答疑' }
];

export default function Camp() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-5 pt-5">
      <div className="mx-auto max-w-[430px] space-y-5">
        <Card className="overflow-hidden bg-gradient-to-br from-[#eaf2ff] via-white to-[#eafff4] p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-growthBlue">21天成长计划</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">自主学习训练营</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">从内驱力开始，带孩子长出稳定的学习能力。</p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
              🌳
            </div>
          </div>
          <TreeModel compact />
        </Card>

        <section className="space-y-4">
          <h2 className="px-1 text-xl font-black text-slate-950">训练内容</h2>
          {stages.map((stage) => (
            <Card key={stage.title} className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black ${stage.color}`}>{stage.title}</span>
                <h3 className="text-lg font-black text-slate-950">{stage.subtitle}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stage.items.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </section>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="text-warmOrange" size={20} />
            <h2 className="text-xl font-black text-slate-950">服务形式</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-2xl bg-slate-50 px-2 py-4 text-center">
                <service.icon className="mx-auto mb-2 text-growthBlue" size={22} />
                <p className="text-xs font-black leading-5 text-slate-700">{service.title}</p>
              </div>
            ))}
          </div>
        </Card>

        <PrimaryButton onClick={() => navigate('/profile/camp')}>
          立即加入训练营
        </PrimaryButton>
      </div>
    </main>
  );
}
