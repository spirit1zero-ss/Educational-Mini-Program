import { Home, Sprout, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: '首页', to: '/', icon: Home },
  { label: '训练营', to: '/camp', icon: Sprout },
  { label: '我的', to: '/profile', icon: UserRound }
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_26px_rgba(47,74,121,0.08)] backdrop-blur">
      <div className="mx-auto grid h-16 max-w-[430px] grid-cols-3 px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                isActive ? 'text-growthBlue' : 'text-slate-400'
              }`
            }
          >
            <item.icon size={22} strokeWidth={2.2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
