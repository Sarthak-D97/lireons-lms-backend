import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getArticleById } from '@/lib/academy-data';

export default async function ArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const article = await getArticleById(params.id);

  if (!article) {
    notFound();
  }

  const tags = article.metadata?.tags ?? [];

  return (
    <div className="page-shell container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/articles" className="btn-secondary px-3 py-2 text-sm mb-6 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to articles
      </Link>

      <article className="surface-card p-8 md:p-10">
        <p className="chip mb-3">{article.topic.product.title}</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-950 dark:text-white">{article.title}</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-8 mb-6">
          {article.description ?? 'No summary available for this article.'}
        </p>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <span key={tag} className="chip">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="surface-muted rounded-xl border border-[var(--border)] p-5 mb-6">
          <h2 className="text-lg font-semibold mb-2">Article Content Source</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Content URL stored in your database for this article material:
          </p>
          {article.contentUrl ? (
            <a
              href={article.contentUrl}
              className="inline-flex items-center gap-2 link-brand text-sm"
              target="_blank"
              rel="noreferrer"
            >
              Open Source File <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-sm text-slate-500">No `contentUrl` available.</p>
          )}
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <p>Subject: {article.topic.subject.name}</p>
          <p>Topic: {article.topic.name}</p>
          <p>Instructor: {article.topic.product.creator.name}</p>
        </div>
      </article>
    </div>
  );
}
