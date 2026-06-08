import { ChevronRight, FileClock, FolderHeart, Gift, GraduationCap, HandCoins, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import { user } from '../data/mockData.js';

const menus = [
  { label: '我的测评', icon: FileClock, to: '/profile/archive' },
  { label: '成长档案', icon: FolderHeart, to: '/profile/archive' },
  { label: '我的训练营', icon: GraduationCap, to: '/profile/camp' },
  { label: '邀请好友', icon: Gift, to: '/profile/invite' },
  { label: '团队中心', icon: UsersRound, to: '/profile/team' },
  { label: '佣金中心', icon: HandCoins, to: '/profile/commission' }
];

export default function Profile() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-5 pt-5">
      <div className="mx-auto max-w-[430px] space-y-5">
        <Card className="bg-gradient-to-br from-growthBlue to-[#6dd3c7] p-5 text-white">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-3xl object-cover ring-4 ring-white/30" />
            <div>
              <h1 className="text-2xl font-black">{user.name}</h1>
              <p className="mt-1 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{user.level}</p>
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-2 gap-px overflow-hidden bg-slate-100 p-px">
          {user.stats.map((stat) => (
            <div key={stat.label} className="bg-white p-4 text-center">
              <p className="text-xl font-black text-slate-950">{stat.value}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{stat.label}</p>
            </div>
          ))}
        </Card>

        <Card className="overflow-hidden">
          {menus.map((menu) => (
            <button
              key={menu.label}
              type="button"
              onClick={() => navigate(menu.to)}
              className="flex h-16 w-full items-center gap-3 border-b border-slate-50 px-5 text-left last:border-b-0"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-growthBlue">
                <menu.icon size={20} />
              </span>
              <span className="flex-1 text-sm font-black text-slate-800">{menu.label}</span>
              <ChevronRight className="text-slate-300" size={20} />
            </button>
          ))}
        </Card>
      </div>
    </main>
  );
}
