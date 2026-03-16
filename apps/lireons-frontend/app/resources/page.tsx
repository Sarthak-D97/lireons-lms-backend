"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Merienda } from "next/font/google";
import {
    Search, Code2, Palette, BarChart, Megaphone, ArrowRight,
    FileText, PlayCircle, Download, Filter, Clock, Eye,
    Share2, Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "@tabler/icons-react";
const merienda = Merienda({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-merienda',
});

// --- MOCK DATA ---
const categories = [
    { id: "all", label: "All Resources" },
    { id: "creation", label: "Course Creation", icon: <Code2 className="w-4 h-4" /> },
    { id: "marketing", label: "Marketing", icon: <Megaphone className="w-4 h-4" /> },
    { id: "sales", label: "Sales Funnels", icon: <BarChart className="w-4 h-4" /> },
    { id: "branding", label: "Personal Branding", icon: <Palette className="w-4 h-4" /> },
];

const featuredPost = {
    title: "The 2026 Guide to Selling Courses Online",
    desc: "A comprehensive playbook for Educators and Coaches on navigating the shift from offline classes to building a profitable online academy. Includes a 12-week launch roadmap.",
    category: "Strategy",
    readTime: "15 min read",
    date: "Jan 12, 2026",
    author: "Sarthak (CEO)",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop"
};

const resources = [
    {
        id: 1,
        title: "Why Every Educator Needs a Mobile App",
        category: "marketing",
        type: "Article",
        readTime: "5 min read",
        views: "2.4k",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop",
        desc: "Discover how branded apps increase student retention and allow for offline learning, boosting your course completion rates."
    },
    {
        id: 2,
        title: "How to Price Your Online Course",
        category: "sales",
        type: "Guide",
        readTime: "10 min read",
        views: "1.8k",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2564&auto=format&fit=crop",
        desc: "Stop undercharging. Learn the psychological pricing strategies to maximize revenue without scaring away students."
    },
    {
        id: 3,
        title: "YouTube for Course Creators",
        category: "branding",
        type: "Article",
        readTime: "8 min read",
        views: "5.1k",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop",
        desc: "A step-by-step guide to using free YouTube content to drive traffic to your paid courses."
    },
    {
        id: 4,
        title: "Recording High-Quality Video at Home",
        category: "creation",
        type: "Case Study",
        readTime: "12 min read",
        views: "900",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
        desc: "You don't need a studio. Learn how to set up lighting and audio for professional-looking course videos on a budget."
    },
    {
        id: 5,
        title: "Setting Up Your First Sales Funnel",
        category: "sales",
        type: "Technical",
        readTime: "12 min read",
        views: "3.2k",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2670&auto=format&fit=crop",
        desc: "Best practices for creating landing pages, email sequences, and upsells to convert visitors into paying students."
    },
    {
        id: 6,
        title: "Building Your Personal Brand",
        category: "branding",
        type: "E-Book",
        readTime: "PDF",
        views: "4.5k",
        image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2574&auto=format&fit=crop",
        desc: "A complete checklist for new creators: Logo, Vision, Social Media Presence, and Content Strategy."
    }
];

const videos = [
    {
        id: 101,
        title: "Course Builder Walkthrough",
        duration: "14:20",
        thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: 102,
        title: "Creating Coupon Codes",
        duration: "08:45",
        thumb: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: 103,
        title: "Analyzing Student Engagement",
        duration: "05:30",
        thumb: "https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?q=80&w=2670&auto=format&fit=crop"
    }
];

const downloads = [
    { id: 201, title: "Course Curriculum Template.docx", size: "2.4 MB" },
    { id: 202, title: "Launch Checklist.xlsx", size: "1.1 MB" },
    { id: 203, title: "Webinar Script.pdf", size: "850 KB" },
    { id: 204, title: "Email Marketing Swipes.pdf", size: "500 KB" },
];

export default function ResourcesPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const containerRef = useRef(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const handleBookDemo = (e: React.MouseEvent) => {
        e.preventDefault();

        if (status === "authenticated") {
            const queryParams = new URLSearchParams({
                name: session?.user?.name || "",
                email: session?.user?.email || "",
                orgType: "Registered User",
                phone: "Active"
            }).toString();

            router.push(`/onboarding?${queryParams}`);
        } else {
            router.push("/signup");
        }
    };
    const filteredResources = selectedCategory === "all"
        ? resources
        : resources.filter(r => r.category === selectedCategory);

    return (
        // 1. Root: White for Light | Slate-950 for Dark
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-slate-950 text-neutral-600 dark:text-slate-200 selection:bg-purple-500/30 overflow-x-hidden transition-colors duration-300">

            {/* --- HERO SECTION --- */}
            <div className="relative isolate px-6 pt-20 md:pt-35 lg:px-8 pb-16 border-b border-gray-200 dark:border-white/5">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d8b4fe] to-[#c4b5fd] dark:from-[#a855f7] dark:to-[#9089fc] opacity-40 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6 transition-colors">
                            The Creator's <br />
                            <span className={`${merienda.className} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500 dark:from-purple-400 dark:to-amber-300`}>
                                Knowledge Hub
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg leading-7 sm:leading-8 text-neutral-600 dark:text-slate-400 transition-colors">
                            Deep dives, practical guides, and expert insights to help you build the academy of the future.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="mt-8 max-w-lg mx-auto relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-neutral-400 dark:text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-4 border border-gray-300 dark:border-slate-700 rounded-full leading-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-neutral-900 dark:text-slate-300 placeholder-neutral-500 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all shadow-lg dark:shadow-xl"
                                placeholder="Search articles, guides, tutorials..."
                            />
                        </div>
                    </div>

                    {/* Featured Resource Card */}
                    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 group cursor-pointer hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-colors shadow-lg dark:shadow-none">
                        <div className="grid lg:grid-cols-2">
                            <div className="relative h-64 lg:h-auto overflow-hidden">
                                <Image
                                    src={featuredPost.image}
                                    alt="Featured"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                    Featured Strategy
                                </div>
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-slate-400 mb-4 transition-colors">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {featuredPost.readTime}</span>
                                    <span>•</span>
                                    <span>{featuredPost.date}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-neutral-600 dark:text-slate-400 mb-6 text-sm sm:text-base leading-relaxed transition-colors">
                                    {featuredPost.desc}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-white transition-colors">S</div>
                                        <span className="text-sm font-medium text-neutral-900 dark:text-white transition-colors">{featuredPost.author}</span>
                                    </div>
                                    <span className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                        Read Article <ArrowRight className="ml-2 w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STICKY FILTER BAR --- */}
            <div className="sticky top-0 sm:top-20 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/5 py-4 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 mask-image-fade">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border",
                                        selectedCategory === cat.id
                                            ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                                            : "bg-gray-100 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-neutral-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white"
                                    )}
                                >
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        {/* Desktop Only Filter Icon */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500 dark:text-slate-400 border-l border-gray-200 dark:border-slate-800 pl-4 ml-4 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">

                {/* SECTION 1: LATEST ARTICLES (GRID) */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white transition-colors">Latest Articles</h2>
                        <Link href="#" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hidden sm:block transition-colors">View Archive &rarr;</Link>
                    </div>

                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredResources.map((resource) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    key={resource.id}
                                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden hover:border-purple-400/50 dark:hover:border-purple-500/30 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-900/10 transition-all duration-300"
                                >
                                    <div className="relative h-52 w-full overflow-hidden">
                                        <Image
                                            src={resource.image}
                                            alt={resource.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="bg-white/90 dark:bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-neutral-900 dark:text-white border border-gray-200 dark:border-white/10 uppercase tracking-wide shadow-sm">
                                                {categories.find(c => c.id === resource.category)?.label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-neutral-900 dark:text-white flex items-center gap-1 shadow-sm">
                                            <Eye className="w-3 h-3 text-neutral-500 dark:text-slate-400" /> {resource.views}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 flex flex-col flex-1 relative">
                                        <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500 dark:text-slate-400 font-medium transition-colors">
                                            <Clock className="w-3 h-3" /> {resource.readTime}
                                        </div>

                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-2">
                                            {resource.title}
                                        </h3>

                                        <p className="text-sm text-neutral-600 dark:text-slate-400 line-clamp-3 mb-6 flex-1 leading-relaxed transition-colors">
                                            {resource.desc}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800/50 transition-colors">
                                            <button className="text-neutral-400 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                <Bookmark className="w-5 h-5" />
                                            </button>
                                            <button className="text-neutral-400 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>
                
                {/* SECTION 2: VIDEO MASTERCLASSES */}
                <section className="relative rounded-3xl bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 border border-gray-200 dark:border-white/10 p-8 lg:p-12 overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/40 dark:bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg transition-colors">
                                <PlayCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white transition-colors">Video Masterclasses</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video) => (
                                <div key={video.id} className="group cursor-pointer">
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-800 mb-3 border border-gray-300 dark:border-white/5 group-hover:border-purple-400/50 dark:group-hover:border-purple-500/50 transition-colors">
                                        <Image src={video.thumb} alt={video.title} fill className="object-cover opacity-90 dark:opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 dark:border-white/20 group-hover:scale-110 transition-transform">
                                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-bold text-white">
                                            {video.duration}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-neutral-800 dark:text-slate-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors line-clamp-2">
                                        {video.title}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* SECTION 3: TEMPLATES */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg transition-colors">
                            <Download className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white transition-colors">Templates & Toolkits</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {downloads.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group shadow-sm dark:shadow-none hover:border-emerald-300 dark:hover:border-white/10">
                                <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800 text-neutral-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-slate-200 truncate group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{item.title}</h4>
                                    <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 transition-colors">{item.size} • Direct Download</p>
                                </div>
                                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                    <Download className="w-4 h-4 text-neutral-400 dark:text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            
            {/* CTA */}
            <div className="mt-24 pb-24 flex flex-col items-center">
                <button
                    onClick={handleBookDemo}
                    className="relative group overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] transition-shadow duration-300 inline-block"
                >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#818cf8_0%,#3b82f6_50%,#818cf8_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-neutral-900 dark:bg-slate-950 px-10 py-5 text-xl font-bold text-white backdrop-blur-3xl transition-all group-hover:bg-neutral-800 dark:group-hover:bg-slate-900">
                        Book a Demo
                        <IconArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </span>
                </button>
                <p className="mt-6 text-center text-sm text-neutral-500 dark:text-slate-400 max-w-md transition-colors">
                    Ready to transform your campus? Get a personalized walkthrough of the <span className={`${merienda.className} text-neutral-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-100 font-medium transition-colors`}>Lireons.</span>
                </p>
            </div>
        </div>
    );
}