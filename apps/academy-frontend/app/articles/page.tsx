import Link from 'next/link';
import { ArrowRight, Clock3, FileText } from 'lucide-react';
import { getArticles } from '@/lib/academy-data';

export default async function ArticlesPage() {
  const articles = await getArticles(120);

  return (
    <div className="page-shell container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <p className="chip mb-3">Knowledge Base</p>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-950 dark:text-white mb-3">Article Lessons</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-8">
          Readable knowledge pages mapped directly to your `Material` rows where `type = ARTICLE`.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-lg font-semibold mb-2">No article lessons found</p>
          <p className="text-slate-600 dark:text-slate-400">Create and publish article materials to render here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const readingTime = Number((article.metadata?.extraDetails as { durationMinutes?: number } | null)?.durationMinutes ?? 8);

            return (
              <article key={article.id} className="surface-card p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">{article.topic.product.title}</p>
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                  {article.description ?? 'No description for this article yet.'}
                </p>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mb-4">
                  <span className="chip !py-1 !px-2.5 !text-[0.66rem]">
                    <FileText className="w-3.5 h-3.5" /> Article
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" /> {readingTime} min read
                  </span>
                </div>

                <Link href={`/articles/${article.id}`} className="inline-flex items-center gap-2 link-brand text-sm">
                  Read Article <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
