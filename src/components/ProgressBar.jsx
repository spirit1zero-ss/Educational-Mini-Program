export default function ProgressBar({ label, value }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-growthBlue">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-growthBlue to-growthGreen"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
