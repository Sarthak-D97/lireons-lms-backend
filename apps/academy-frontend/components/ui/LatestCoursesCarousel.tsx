'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

type CarouselCourse = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  price: number;
  discountPrice: number | null;
  creatorName: string;
  materialsCount: number;
  enrollmentsCount: number;
  subjects: Array<{
    id: string;
    name: string;
  }>;
};

type LatestCoursesCarouselProps = {
  courses: CarouselCourse[];
};

export function LatestCoursesCarousel({ courses }: LatestCoursesCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  function scrollTrack(direction: 'prev' | 'next') {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const distance = Math.max(track.clientWidth * 0.85, 320);
    track.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div id="latest-courses" className="space-y-5">

      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="group relative min-w-[280px] sm:min-w-[360px] lg:min-w-[1250px] snap-start overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:shadow-none dark:hover:ring-1 dark:hover:ring-slate-700"
          >
            <div className="relative h-[50vh] min-h-[410px] max-h-[540px] overflow-hidden bg-slate-100 dark:bg-slate-900">
              {course.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.coverImageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-sky-500 via-cyan-500 to-indigo-600 opacity-90" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                Latest course
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3 className="max-w-[90%] text-2xl md:text-3xl font-bold leading-tight text-white text-left line-clamp-2">
                  {course.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
