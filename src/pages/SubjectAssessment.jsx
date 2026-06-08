import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PageShell from '../components/PageShell.jsx';
import { subjectOptions, subjectPeople } from '../data/mockData.js';

export default function SubjectAssessment() {
  const navigate = useNavigate();

  return (
    <PageShell title="学科测评">
      <Card className="mb-5 p-5">
        <p className="text-sm font-bold text-growthBlue">如果这三个人物分别代表</p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">语文、数学、英语，你认为应该如何对应？</h2>
      </Card>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {subjectPeople.map((person, index) => (
          <Card key={person.name} className="overflow-hidden p-2 text-center">
            <div
              aria-label={person.name}
              className={`grid aspect-square w-full place-items-center rounded-2xl bg-gradient-to-br ${person.color} text-4xl shadow-inner`}
            >
              {person.emoji}
            </div>
            <p className="mt-2 text-xs font-black text-slate-800">人物 {index + 1}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {subjectOptions.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => navigate('/assessment/subject/result')}
            className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-sm ring-1 ring-slate-100 transition active:scale-[0.99]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-sm font-black text-growthBlue">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm font-bold text-slate-700">{option}</span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
