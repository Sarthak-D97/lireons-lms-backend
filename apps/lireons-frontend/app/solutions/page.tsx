"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Merienda } from "next/font/google";
import {
    School,
    BookOpen,
    GraduationCap,
    Briefcase,
    CheckCircle2,
    ArrowRight,
    LayoutDashboard,
    ShieldAlert,
    Banknote,
    Users2,
    BarChart3
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

// --- ENRICHED DATA: CLIENT-FOCUSED CONTENT ---
const solutions = [
    {
        id: "creators",
        label: "Course Creators",
        icon: <School className="w-5 h-5" />,
        heading: "Turn Your Knowledge into Profit",
        subheading: "Everything you need to create, market, and sell your online courses from a single dashboard.",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2664&auto=format&fit=crop",
        // Specific USP for Schools
        highlight: "Zero Tech Headache",
        highlightDesc: "Forget plugins and hosting issues. We handle the technology so you can focus on recording great content.",
        features: [
            { title: "Landing Page Builder", desc: "Create high-converting sales pages in minutes with our drag-and-drop editor." },
            { title: "DRM Protection", desc: "Bank-grade encryption prevents screen recording and illegal downloads of your videos." },
            { title: "Affiliate Marketing", desc: "Let others sell your courses for a commission. Automated tracking and payouts." },
            { title: "Community & Posts", desc: "Built-in discussion forums and social posts to keep your students engaged." }
        ]
    },
    {
        id: "coaching",
        label: "Coaching Institutes",
        icon: <BookOpen className="w-5 h-5" />,
        heading: "Hybrid Learning for Modern Institutes",
        subheading: "Seamlessly combine offline classroom teaching with online resources and live classes.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop",
        highlight: "Live Class Integration",
        highlightDesc: "Conduct interactive live sessions with Zoom/Meet integration directly within your branded app.",
        features: [
            { title: "Coding Compilers", desc: "Teach programming with our in-browser IDE supporting Python, JS, Java, and C++." },
            { title: "Batch Management", desc: "Easily manage multiple batches, schedules, and fee structures." },
            { title: "Performance Analytics", desc: "Detailed reports on student progress, test scores, and areas of improvement." },
            { title: "Custom Domain", desc: "Map your own domain (academy.com) for a fully white-labeled experience." }
        ]
    },
    {
        id: "enterprise",
        label: "Enterprises",
        icon: <Briefcase className="w-5 h-5" />,
        heading: "Corporate Training & L&D",
        subheading: "Upskill your workforce with a secure, scalable, and white-labeled learning management system.",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop",
        highlight: "API & Webhooks",
        highlightDesc: "Seamlessly integrate with your existing HRMS using our robust API keys and webhooks.",
        features: [
            { title: "Multi-Tenant Architecture", desc: "Manage multiple organizations or branches from a single super-admin panel." },
            { title: "White Labeling", desc: "Fully branded portal with your logo, colors, and domain. No mention of Lireons." },
            { title: "SSO Integration", desc: "Single Sign-On support for seamless access using your corporate credentials." },
            { title: "Certification", desc: "Issue automated certificates upon course completion to validate employee skills." }
        ]
    },
    {
        id: "testprep",
        label: "Test Prep",
        icon: <GraduationCap className="w-5 h-5" />,
        heading: "Mock Tests & Assessments",
        subheading: "The ultimate platform for competitive exam preparation (JEE, NEET, UPSC, Banking).",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop",
        highlight: "NTA Style Tests",
        highlightDesc: "Simulate the exact interface of national-level exams to help students get exam-ready.",
        features: [
            { title: "Question Bank", desc: "Upload thousands of questions with support for equations, images, and multiple languages." },
            { title: "Deep Analytics", desc: "Question-wise analysis, time management reports, and AIR prediction." },
            { title: "Mobile App", desc: "Let students take tests on the go with our native mobile apps." },
            { title: "Doubt Solving", desc: "Allow students to raise doubts on specific questions and get answers from experts." }
        ]
    }
];

export default function SolutionsPage() {
    const [activeTab, setActiveTab] = useState(solutions[0].id);
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
    const activeData = solutions.find(s => s.id === activeTab) || solutions[0];

    return (
        // 1. Root: White for Light | Slate-950 for Dark
        <div className="min-h-screen bg-white dark:bg-slate-950 text-neutral-600 dark:text-slate-200 selection:bg-purple-500/30 transition-colors duration-300">

            {/* --- HERO SECTION --- */}
            <div className="relative isolate px-6 pt-20 md:pt-35 lg:px-8 pb-12">
                {/* Bg Gradients */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d8b4fe] to-[#c4b5fd] dark:from-[#a855f7] dark:to-[#9089fc] opacity-40 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl mb-6 transition-colors">
                        Solutions tailored for <br />
                        <span className={`${merienda.className} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500 dark:from-purple-400 dark:to-amber-300`}>
                            Every Creator
                        </span>
                    </h1>
                    <p className="text-lg leading-8 text-neutral-600 dark:text-slate-400 transition-colors">
                        Whether you are a solo instructor or a large coaching institute, <br className="hidden md:inline" />
                        Lireons scales with your needs, helping you sell more courses and teach better.
                    </p>
                </div>
            </div>

            {/* --- INTERACTIVE TABS --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {solutions.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border",
                                activeTab === tab.id
                                    ? "bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-300 shadow-md shadow-purple-500/20"
                                    : "bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-neutral-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-600 hover:text-neutral-900 dark:hover:text-slate-200"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="relative min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid lg:grid-cols-2 gap-12 items-start"
                        >
                            {/* Text Content */}
                            <div className="order-2 lg:order-1 space-y-8">
                                <div>
                                    <div className="inline-flex items-center gap-2 text-purple-700 dark:text-purple-400 font-medium mb-2 bg-purple-100 dark:bg-purple-900/20 px-3 py-1 rounded-md border border-purple-200 dark:border-purple-500/20 text-sm transition-colors">
                                        {activeData.icon} {activeData.label} Edition
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4 transition-colors">
                                        {activeData.heading}
                                    </h2>
                                    <p className="text-lg text-neutral-600 dark:text-slate-400 leading-relaxed border-l-4 border-purple-500 pl-4 transition-colors">
                                        {activeData.subheading}
                                    </p>
                                </div>

                                {/* Highlight Box (Unique Selling Prop) */}
                                {/* Light Mode: Amber-50 bg, Amber-200 border. Dark Mode: Slate-900, Amber-500/20 border */}
                                <div className="bg-amber-50 dark:bg-slate-900 p-5 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-lg relative overflow-hidden transition-colors">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    <h3 className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2 mb-2 transition-colors">
                                        <ShieldAlert className="w-5 h-5" />
                                        {activeData.highlight}
                                    </h3>
                                    <p className="text-sm text-amber-900/80 dark:text-slate-300 leading-relaxed transition-colors">
                                        {activeData.highlightDesc}
                                    </p>
                                </div>

                                {/* Feature List */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {activeData.features.map((feature, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors group">
                                            <div className="mb-2">
                                                <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                                            </div>
                                            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1 text-sm md:text-base transition-colors">{feature.title}</h4>
                                            <p className="text-xs md:text-sm text-neutral-600 dark:text-slate-400 leading-relaxed transition-colors">{feature.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-slate-950 px-8 py-3 rounded-full font-bold hover:bg-neutral-800 dark:hover:bg-slate-200 transition-colors"
                                    >
                                        Get Started for {activeData.label} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Image Visual */}
                            <div className="order-1 lg:order-2 relative lg:sticky lg:top-24">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-300/30 to-blue-300/30 dark:from-purple-500/20 dark:to-blue-500/20 blur-2xl rounded-full -z-10 transition-colors"></div>
                                <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
                                    <Image
                                        src={activeData.image}
                                        alt={activeData.label}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Overlay Gradient: Light Mode uses lighter gradient, Dark uses dark */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent dark:from-slate-950/90 transition-colors"></div>

                                    {/* Floating ROI Stats Badge */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between gap-4 shadow-lg dark:shadow-none transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 transition-colors">
                                                <BarChart3 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-500 dark:text-slate-400 uppercase tracking-wider font-semibold transition-colors">Efficiency Boost</p>
                                                <p className="text-neutral-900 dark:text-white font-bold text-lg transition-colors">~35% Saved</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500 dark:text-slate-400 transition-colors">In Ops Costs</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

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