import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageShell({ title, children, action, className = '' }) {
  const navigate = useNavigate();

  return (
    <main className={`min-h-screen bg-softBg px-5 pb-8 pt-4 ${className}`}>
      <div className="mx-auto max-w-[430px]">
        <header className="mb-5 flex h-11 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          <div className="h-10 w-10">{action}</div>
        </header>
        {children}
      </div>
    </main>
  );
}
