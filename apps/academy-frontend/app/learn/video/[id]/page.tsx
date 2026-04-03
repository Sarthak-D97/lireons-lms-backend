import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  PlayCircle,
} from 'lucide-react';
import { getVideoLessonById, materialRouteByType } from '@/lib/academy-data';

function toReadableType(type: string) {
  switch (type) {
    case 'VIDEO':
      return 'Video';
    case 'ARTICLE':
      return 'Article';
    case 'CODE_CHALLENGE':
      return 'Coding Problem';
    case 'QUIZ':
      return 'Quiz';
    default:
      return type;
  }
}

export default async function VideoLessonPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getVideoLessonById(params.id);

  if (!data) {
    notFound();
  }

  const { lesson, timeline, currentIndex, previous, next } = data;
  const currentEpisodeNumber = currentIndex + 1;

  const durationMinutes = Number(
    (lesson.metadata?.extraDetails as { durationMinutes?: number } | null)?.durationMinutes ?? 0,
  );

  return (
    <div className="page-shell container mx-auto px-4 py-10 max-w-7xl">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 items-start">
        <section>
          <div className="mb-6">
            <p className="chip mb-3">{lesson.topic.product.title}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-white mb-2">{lesson.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="chip !py-1 !px-2.5 !text-[0.7rem]">
                <PlayCircle className="w-4 h-4" /> Episode {currentEpisodeNumber}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="w-4 h-4" /> {durationMinutes > 0 ? `${durationMinutes} min` : 'Duration NA'}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {lesson.topic.subject.name}
              </span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-black mb-6 shadow-[var(--shadow-soft)]">
            <video
              className="w-full aspect-video"
              controls
              preload="metadata"
              src={lesson.contentUrl ?? lesson.media?.cloudUrl ?? undefined}
            >
              <track kind="captions" />
            </video>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <article className="surface-card p-5">
              <h2 className="text-lg font-semibold mb-2">About this lesson</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-7">
                {lesson.description ?? 'No lesson description provided in the material row.'}
              </p>
            </article>
            <article className="surface-card p-5">
              <h2 className="text-lg font-semibold mb-2">Lesson metadata</h2>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>Topic: {lesson.topic.name}</li>
                <li>Instructor: {lesson.topic.product.creator.name}</li>
                <li>Media file: {lesson.media?.fileName ?? 'N/A'}</li>
                <li>File size: {lesson.media?.fileSizeKb ? `${Math.ceil(lesson.media.fileSizeKb / 1024)} MB` : 'N/A'}</li>
              </ul>
            </article>
          </div>

          <div className="surface-card p-5 mb-6">
            <h2 className="text-lg font-semibold mb-3">Transcript / Notes</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-7">
              This section is ready for transcript content. You can store transcript metadata in `Metadata.extraDetails`
              and render it here for each video episode.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {previous ? (
              <Link href={materialRouteByType(previous)} className="btn-secondary px-4 py-2">
                <ArrowLeft className="w-4 h-4" /> Previous
              </Link>
            ) : null}
            {next ? (
              <Link href={materialRouteByType(next)} className="btn-primary px-4 py-2">
                Next <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null}
          </div>
        </section>

        <aside className="xl:sticky xl:top-24">
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="font-bold">Up Next</h2>
              <p className="text-xs text-slate-500 mt-1">Course timeline from your `Material` rows</p>
            </div>

            <div className="max-h-[70vh] overflow-auto">
              {timeline.map((item, index) => {
                const isCurrent = item.id === lesson.id;

                return (
                  <Link
                    key={item.id}
                    href={materialRouteByType(item)}
                    className={`block px-4 py-3 border-b border-[var(--border)] transition-colors ${
                      isCurrent
                        ? 'surface-muted'
                        : 'hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_8%,transparent)]'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">Episode {index + 1}</p>
                    <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                    <p className="text-xs mt-1 text-slate-500">{toReadableType(item.type)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
