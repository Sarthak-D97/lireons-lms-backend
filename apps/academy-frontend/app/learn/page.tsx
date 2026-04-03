import Link from 'next/link';
import { Clock3, PlayCircle } from 'lucide-react';
import { getAllPublishedVideos, materialRouteByType } from '@/lib/academy-data';

export default async function LearnPage() {
  const videos = await getAllPublishedVideos(120);

  return (
    <div className="page-shell container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <p className="chip mb-3">Learning Library</p>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-950 dark:text-white mb-3">Video Lessons</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-8">
          Structured episodes from your `Material` rows (`type = VIDEO`). Open any lesson for the full
          player-and-timeline learning experience.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-lg font-semibold mb-2">No video lessons published yet</p>
          <p className="text-slate-600 dark:text-slate-400">Publish `VIDEO` materials to populate this list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => {
            const minutes = Number((video.metadata?.extraDetails as { durationMinutes?: number } | null)?.durationMinutes ?? 0);

            return (
              <article key={video.id} className="surface-card overflow-hidden">
                <div className="h-32 brand-gradient opacity-85" />
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">{video.topic.product.title}</p>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  {video.description ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{video.description}</p>
                  ) : null}
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mb-4">
                    <span className="chip !py-1 !px-2.5 !text-[0.66rem]">
                      <PlayCircle className="w-3.5 h-3.5" /> Episode
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5" />
                      {minutes > 0 ? `${minutes} min` : 'Duration NA'}
                    </span>
                  </div>

                  <Link href={materialRouteByType(video)} className="link-brand text-sm">
                    Watch Lesson
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
