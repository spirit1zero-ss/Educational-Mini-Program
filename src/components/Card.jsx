export default function Card({ children, className = '', as: Component = 'div', ...props }) {
  return (
    <Component
      className={`rounded-[22px] bg-white shadow-soft ring-1 ring-slate-100 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
