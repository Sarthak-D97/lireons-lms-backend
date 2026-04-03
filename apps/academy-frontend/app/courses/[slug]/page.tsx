import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Layers3,
  PlayCircle,
  Terminal,
  Users,
} from 'lucide-react';
import { getCourseById, materialRouteByType } from '@/lib/academy-data';

function materialBadge(type: string) {
  switch (type) {
    case 'VIDEO':
      return { label: 'Video', icon: PlayCircle };
    case 'ARTICLE':
      return { label: 'Article', icon: FileText };
    case 'CODE_CHALLENGE':
      return { label: 'Coding Problem', icon: Terminal };
    default:
      return { label: type, icon: FileText };
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseById(slug);

  if (!course) {
    notFound();
  }

  const displayPrice = course.discountPrice ? Number(course.discountPrice) : Number(course.price);

  return (
    <div className="page-shell pb-20">
      <section className="container mx-auto px-4 pt-14 pb-10 max-w-6xl">
        <div className="surface-card p-8 md:p-10 brand-gradient text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative">
            <p className="chip !bg-white/20 !text-white !border-white/30 mb-4 inline-flex">{course.type}</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{course.title}</h1>
            <p className="text-base md:text-lg text-white/90 max-w-3xl leading-8 mb-7">{course.description}</p>

            <div className="flex flex-wrap gap-5 text-sm text-white/90">
              <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {course._count.enrollments} enrolled</span>
              <span className="inline-flex items-center gap-1"><Layers3 className="w-4 h-4" /> {course.subjects.length} modules</span>
              <span>{course.materials.length} materials</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-7">
            {course.subjects.length === 0 ? (
              <div className="surface-card p-6">
                <p className="text-slate-600 dark:text-slate-300">No modules published yet for this course.</p>
              </div>
            ) : (
              course.subjects.map((subject, moduleIndex) => (
                <article key={subject.id} className="surface-card overflow-hidden">
                  <div className="px-6 py-5 border-b border-[var(--border)] surface-muted">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Module {moduleIndex + 1}</p>
                    <h2 className="text-2xl font-bold">{subject.name}</h2>
                    {subject.description ? (
                      <p className="text-slate-600 dark:text-slate-400 mt-2">{subject.description}</p>
                    ) : null}
                  </div>

                  <div className="p-5 space-y-5">
                    {subject.topics.map((topic) => (
                      <div key={topic.id}>
                        <h3 className="font-semibold text-lg mb-3">{topic.name}</h3>
                        <div className="space-y-2">
                          {topic.materials.map((material) => {
                            const badge = materialBadge(material.type);
                            const BadgeIcon = badge.icon;

                            return (
                              <Link
                                key={material.id}
                                href={materialRouteByType(material)}
                                className="group block rounded-xl border border-[var(--border)] p-4 hover:border-[color:color-mix(in_srgb,var(--brand-primary)_40%,var(--border))] transition-colors"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-[var(--brand-primary)]">
                                      {material.title}
                                    </p>
                                    {material.description ? (
                                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {material.description}
                                      </p>
                                    ) : null}
                                  </div>
                                  <span className="chip shrink-0">
                                    <BadgeIcon className="w-3.5 h-3.5" />
                                    {badge.label}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="xl:sticky xl:top-24 self-start">
            <div className="surface-card overflow-hidden">
              <div className="p-6 border-b border-[var(--border)]">
                <div className="text-3xl font-extrabold mb-2">${displayPrice.toFixed(2)}</div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Access all lessons, modules, and supporting resources.
                </p>

                <Link
                  href={
                    course.materials.length > 0
                      ? materialRouteByType({ id: course.materials[0].id, type: course.materials[0].type })
                      : '/'
                  }
                  className="btn-primary w-full py-3"
                >
                  Start Learning <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="p-6 surface-muted">
                <h4 className="font-bold mb-4">Included in this course</h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>{course.materials.filter((material) => material.type === 'VIDEO').length} video lessons</li>
                  <li>{course.materials.filter((material) => material.type === 'ARTICLE').length} article lessons</li>
                  <li>{course.materials.filter((material) => material.type === 'CODE_CHALLENGE').length} coding problem entries</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
