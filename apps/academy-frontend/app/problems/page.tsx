import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCheck, Code2 } from 'lucide-react';
import { getProblems } from '@/lib/academy-data';

export default async function ProblemsPage() {
  const problems = await getProblems(120);

  return (
    <div className="page-shell container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <p className="chip mb-3">Practice</p>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-950 dark:text-white mb-3">Coding Problems</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mb-4 leading-8">
          Problem statements are loaded from `Material` rows where `type = CODE_CHALLENGE`.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-full">
          <AlertCircle className="w-4 h-4" /> Coding platform execution is intentionally disabled for now.
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-lg font-semibold mb-2">No coding problems found</p>
          <p className="text-slate-600 dark:text-slate-400">Publish `CODE_CHALLENGE` materials to display them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem) => (
            <article key={problem.id} className="surface-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">{problem.topic.product.title}</p>
              <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                {problem.description ?? 'No problem description available.'}
              </p>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 mb-4">
                <span className="chip !py-1 !px-2.5 !text-[0.66rem]">
                  <Code2 className="w-3.5 h-3.5" /> Challenge
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> {problem.testCases.length} test cases
                </span>
              </div>

              <Link href={`/problems/${problem.id}`} className="inline-flex items-center gap-2 link-brand text-sm">
                View Problem <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
