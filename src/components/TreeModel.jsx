const nodes = [
  { icon: '🍎', label: '学习成绩', desc: '果', color: 'bg-[#fff1df]' },
  { icon: '🌿', label: '学科知识', desc: '叶', color: 'bg-[#e7f9f0]' },
  { icon: '🌱', label: '学习习惯', desc: '茎', color: 'bg-[#edf8ff]' },
  { icon: '🌳', label: '内驱力', desc: '根', color: 'bg-[#eaf1ff]' }
];

export default function TreeModel({ compact = false }) {
  return (
    <div className={compact ? 'space-y-2' : 'grid grid-cols-2 gap-2.5'}>
      {nodes.map((node, index) => (
        <div
          key={node.label}
          className={`flex items-center gap-3 rounded-2xl ${node.color} px-3 py-2`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-lg shadow-sm">
            {node.icon}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{node.label}</p>
            <p className="text-xs font-semibold text-slate-500">{node.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
