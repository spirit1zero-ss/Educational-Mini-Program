export default function PrimaryButton({ children, className = '', variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-growthBlue text-white shadow-[0_12px_24px_rgba(79,140,255,0.25)]',
    green: 'bg-growthGreen text-white shadow-[0_12px_24px_rgba(109,211,160,0.25)]',
    orange: 'bg-warmOrange text-white shadow-[0_12px_24px_rgba(255,184,77,0.25)]',
    disabled: 'bg-slate-200 text-slate-400'
  };

  return (
    <button
      type="button"
      className={`h-12 w-full rounded-2xl text-sm font-bold transition active:scale-[0.98] ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
