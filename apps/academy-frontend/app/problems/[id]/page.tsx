import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { getProblemById } from '@/lib/academy-data';

export default async function ProblemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const problem = await getProblemById(params.id);

  if (!problem) {
    notFound();
  }

  const details = (problem.metadata?.extraDetails as Record<string, unknown> | null) ?? {};

  return (
    <div className="page-shell container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/problems" className="btn-secondary px-3 py-2 text-sm mb-6 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to coding problems
      </Link>

      <article className="surface-card p-8 md:p-10">
        <p className="chip mb-3">{problem.topic.product.title}</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-950 dark:text-white">{problem.title}</h1>

        <div className="inline-flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-full mb-6">
          <AlertCircle className="w-4 h-4" /> Execution UI disabled intentionally for now.
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-8 mb-6">
          {problem.description ?? 'No problem description found in this material row.'}
        </p>

        <section className="surface-muted rounded-xl border border-[var(--border)] p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Problem Metadata</h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Topic: {problem.topic.name}</li>
            <li>Total test cases: {problem.testCases.length}</li>
            <li>Difficulty: {(details.difficulty as string) ?? 'Not specified'}</li>
            <li>Time limit: {details.timeLimit ? `${details.timeLimit} mins` : 'Not specified'}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-lg font-semibold mb-2">Problem Source</h2>
          {problem.contentUrl ? (
            <a
              href={problem.contentUrl}
              className="link-brand text-sm"
              target="_blank"
              rel="noreferrer"
            >
              Open challenge definition URL
            </a>
          ) : (
            <p className="text-sm text-slate-500">No `contentUrl` set for this record.</p>
          )}
        </section>
      </article>
    </div>
  );
}
