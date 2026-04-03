import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  PlayCircle,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
} from '@/components/ui/card';
import { LatestCoursesCarousel } from '@/components/ui/LatestCoursesCarousel';
import { getHomeSnapshot } from '@/lib/academy-data';
import { cn } from '@/lib/utils';

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default async function Home() {
  const data = await getHomeSnapshot();

  const courses = data.featuredCourses;
  const latestCourses = courses.slice(0, 6);
  const spotlightCourse = courses[0] ?? null;
  const popularCourses = [...courses]
    .sort((a, b) => b.enrollmentsCount - a.enrollmentsCount)
    .slice(0, 6);

  const categoryCounter = new Map<string, number>();
  for (const course of courses) {
    for (const subject of course.subjects) {
      categoryCounter.set(subject.name, (categoryCounter.get(subject.name) ?? 0) + 1);
    }
  }

  const categories = [...categoryCounter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const fallbackCategories = [
    { name: 'Video Learning', count: data.videoCount },
    { name: 'Article Deep Dives', count: data.articleCount },
    { name: 'Coding Challenges', count: data.problemsCount },
    { name: 'Mock Test Readiness', count: Math.max(1, Math.floor(courses.length / 2)) },
  ];

  const teacherCounter = new Map<string, { courses: number; learners: number }>();
  for (const course of courses) {
    const stats = teacherCounter.get(course.creatorName) ?? { courses: 0, learners: 0 };
    stats.courses += 1;
    stats.learners += course.enrollmentsCount;
    teacherCounter.set(course.creatorName, stats);
  }

  const topTeachers = [...teacherCounter.entries()]
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.learners - a.learners || b.courses - a.courses)
    .slice(0, 4);

  const associatedCompanies = [
    'Google',
    'Microsoft',
    'Amazon',
    'Adobe',
    'Infosys',
    'Accenture',
    'TCS',
    'Deloitte',
  ];

  const features = [
    {
      title: 'Real-world projects',
      description: 'Master practical skills through hands-on projects designed by industry experts, giving you the experience employers demand.',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Expert mentorship',
      description: 'Get personalized feedback and guidance from seasoned professionals who know exactly what it takes to succeed.',
      icon: Users,
    },
    {
      title: 'Career services',
      description: 'Benefit from resume reviews, interview prep, and connections to our extensive hiring network.',
      icon: Target,
    },
    {
      title: 'Flexible learning',
      description: 'Learn on your own schedule with our structured but flexible programs built for busy professionals.',
      icon: PlayCircle,
    },
    {
      title: 'Active community',
      description: 'Join a global network of peers and alumni. Collaborate, network, and grow together.',
      icon: Users,
    },
    {
      title: 'Skill tracking',
      description: 'Measure your progress with detailed analytics and verify your readiness for your target role.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="page-shell bg-white dark:bg-slate-950">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-9xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <Badge className="mb-3 px-4 py-1.5 text-sm bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300">
                <Sparkles className="w-4 h-4 mr-2" /> Latest Courses
              </Badge>
            </div>
          </div>

          <LatestCoursesCarousel courses={latestCourses} />
        </div>
      </section>

      {/* Partner Strip */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-8">
            Industry partners & hiring network
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 md:gap-x-20 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {associatedCompanies.map(company => (
              <span key={company} className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* The Experience (Features) */}
      <section id="experience" className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            The {data.organizationName} Experience
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A proven learning model designed to give you exactly what employers are looking for right now.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col">
              <div className="h-14 w-14 rounded-xl bg-sky-100 dark:bg-sky-900/30 grid place-items-center mb-6">
                <feature.icon className="w-7 h-7 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Spotlight Program */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Program</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">Our most comprehensive career track, designed for immediate placement.</p>
          </div>
          
          {!spotlightCourse ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-lg font-semibold mb-2">No programs found</p>
              <CardDescription>Publish courses to feature them here.</CardDescription>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:ring-1 dark:ring-slate-800">
              <div className="grid lg:grid-cols-[1.2fr_1fr]">
                <div className="h-64 lg:h-auto bg-slate-200 dark:bg-slate-800 relative">
                  {spotlightCourse.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={spotlightCourse.coverImageUrl} alt={spotlightCourse.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-sky-500 to-indigo-600 opacity-90" />
                  )}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-3 py-1 shadow-sm">Bestseller</Badge>
                  </div>
                </div>
                
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="text-sky-600 dark:text-sky-400 font-semibold mb-4 text-sm tracking-wide uppercase">
                    Career Track
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                    {spotlightCourse.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed">
                    {spotlightCourse.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-y-4 gap-x-8 mb-8 text-sm font-medium">
                    <div className="flex items-center gap-2">
                       <BarChart3 className="w-5 h-5 text-slate-400" />
                       <span className="text-slate-700 dark:text-slate-300">Beginner to Advanced</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Users className="w-5 h-5 text-slate-400" />
                       <span className="text-slate-700 dark:text-slate-300">{spotlightCourse.enrollmentsCount} Enrolled</span>
                    </div>
                  </div>

                  <div>
                    <Link href={`/courses/${spotlightCourse.id}`} className={cn(buttonVariants({ size: 'lg' }), "w-full md:w-auto h-12 px-8 font-semibold")}>
                      View Program Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Popular Programs Grid */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Popular Programs</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Join thousands of learners in our highest-rated courses.</p>
          </div>
          <Link href="/learn" className={cn(buttonVariants({ variant: 'outline' }), "font-semibold group")}>
            View All Programs <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularCourses.slice(0, 6).map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group relative flex flex-col bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none dark:hover:ring-1 dark:hover:ring-slate-700 transition-all duration-300">
              <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {course.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-sky-400 to-indigo-500 group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm dark:bg-slate-950/90 text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {course.subjects?.[0]?.name || 'Course'}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 flex-1">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <BookOpen className="w-4 h-4" /> {course.materialsCount || 0} Lessons
                  </div>
                  <div className="text-slate-900 dark:text-white font-bold">
                    {formatPrice(course.discountPrice ?? course.price)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Explore by Skil Path</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 md:max-w-2xl mx-auto">Find the exact domain you want to master.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(categories.length > 0 ? categories : fallbackCategories).map((category, i) => (
              <Link key={category.name} href="/learn" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                    {i + 1}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transform group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{category.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{category.count} Learning Tracks</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Learn from the Best</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 md:max-w-2xl mx-auto">Our instructors are industry veterans who have built the products you use every day.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(topTeachers.length > 0
            ? topTeachers
            : [{ name: 'Academy Mentor Team', courses: courses.length, learners: courses.reduce((sum, item) => sum + item.enrollmentsCount, 0) }]
          ).map((teacher) => (
            <div key={teacher.name} className="text-center group">
              <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-tr from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/40 p-1 mb-6 transform group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {initials(teacher.name)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{teacher.name}</h3>
              <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-4">Lead Instructor</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><BriefcaseBusiness className="w-4 h-4" /> {teacher.courses} Courses</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {teacher.learners}+</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Ready to start your career?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">Join thousands of learners who have transformed their careers with our programs.</p>
          <Link href="/learn" className={cn(buttonVariants({ size: 'lg' }), "text-base px-10 h-14 rounded-md shadow-lg shadow-sky-500/20 font-semibold")}>
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
