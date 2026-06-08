import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';

export default function AppLayout() {
  return (
    <>
      <div className="safe-bottom">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
