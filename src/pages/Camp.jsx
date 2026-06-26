import { CalendarCheck, MessageCircleQuestion, Radio, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTrainingProducts } from '../api/training.js';
import Card from '../components/Card.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import TreeModel from '../components/TreeModel.jsx';
import useCrmebData from '../hooks/useCrmebData.js';
import { trainingProducts } from '../data/mockData.js';

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
  const { data: products, status } = useCrmebData(getTrainingProducts, trainingProducts, []);
  const mainProduct = products[0] || trainingProducts[0];
  const visibleProducts = (products.length ? products : trainingProducts).slice(0, 4);

  return (
    <main className="min-h-screen px-5 pt-5">
      <div className="mx-auto max-w-[430px] space-y-5">
        <Card className="overflow-hidden bg-gradient-to-br from-[#eaf2ff] via-white to-[#eafff4] p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-growthBlue">21天成长计划</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">{mainProduct.title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                从内驱力开始，带孩子长出稳定的学习能力。
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-warmOrange shadow-sm">
                  {mainProduct.price}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
                  {status === 'live' ? '已连接CRMEB' : '演示数据'}
                </span>
              </div>
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

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-950">后台商品</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">
              {status === 'live' ? '来自CRMEB后台' : '演示数据'}
            </span>
          </div>
          <div className="space-y-3">
            {visibleProducts.map((product) => (
              <Card key={product.id || product.title} className="p-3">
                <div className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#eaf2ff] to-[#eafff4]">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-2xl">🌱</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-base font-black leading-5 text-slate-950">{product.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-black text-warmOrange">{product.price}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
                        已售 {product.sales || 0}
                      </span>
                    </div>
                    {(product.startTime || product.endTime) && (
                      <p className="mt-2 text-xs font-bold text-slate-500">
                        {product.startTime || '待定'} - {product.endTime || '长期'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
