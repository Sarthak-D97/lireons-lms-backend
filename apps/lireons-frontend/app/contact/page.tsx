"use client";
import React from "react";
import { Merienda } from "next/font/google";
import { 
    MessageSquare, 
    HelpCircle,
    MapPin,
    Clock,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";

const merienda = Merienda({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-merienda',
});

export default function ContactPage() {
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

    return (
        // 1. Main Background: White for Light | Slate-950 for Dark
        <div className="min-h-screen bg-white dark:bg-slate-950 text-neutral-600 dark:text-slate-200 selection:bg-purple-500/30 font-sans transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Background Blobs: Adjusted for visibility in both modes */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 dark:bg-purple-600/10 rounded-full blur-[100px] transition-colors"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-[100px] transition-colors"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 md:pt-35 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16 lg:mb-24">
                    {/* Header: Neutral-900 (Light) | White (Dark) */}
                    <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight transition-colors">
                        Let's build your <br />
                        <span className={`${merienda.className} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500 dark:from-purple-400 dark:to-amber-300`}>
                            Academy.
                        </span>
                    </h1>
                    {/* Subtext: Neutral-600 (Light) | Slate-400 (Dark) */}
                    <p className="text-lg text-neutral-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
                        Whether you are a solo creator or a large institute, our team is ready to build your digital infrastructure.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    <div className="space-y-12">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <ContactCard 
                                icon={<MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                                title="Sales & Demo"
                                content="sales@lireons.com"
                                sub="+91 976049889X"
                            />
                            <ContactCard 
                                icon={<HelpCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
                                title="Support"
                                content="lireonsprivatelimited@gmail.com"
                                sub="24/7 for Enterprise"
                            />
                        </div>
                        {/* Address Box: Gray-50/Border-Gray for Light | Slate-900/Border-White for Dark */}
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/5 backdrop-blur-sm transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors">
                                    <MapPin className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">Headquarters</h3>
                                    <p className="text-neutral-600 dark:text-slate-400 leading-relaxed transition-colors">
                                        Lireons Technologies Pvt Ltd.<br />
                                        Prestige Tech Park, Whitefiled,<br />
                                        Bengaluru, Karnataka - 560103
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-slate-400 transition-colors">
                                        <Clock className="w-4 h-4" />
                                        <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Engagement Timeline Box: White/Shadow for Light | Slate-900/Shadow for Dark */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-10 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-200/30 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none transition-colors"></div>
                        
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 relative z-10 transition-colors">How we engage with you</h2>
                        
                        <div className="space-y-8 relative z-10">
                            <TimelineItem 
                                step="01" 
                                title="Discovery & Audit" 
                                desc="We analyze your content strategy and recommend the right Tier plan for your academy." 
                            />
                            <TimelineItem 
                                step="02" 
                                title="Live Custom Demo" 
                                desc="See the platform in action with your specific academy branding and requirements." 
                            />
                            <TimelineItem 
                                step="03" 
                                title="Data Migration" 
                                desc="Our team migrates your existing videos, student data, and courses into Lireons securely." 
                            />
                            <TimelineItem 
                                step="04" 
                                title="Go-Live & Training" 
                                desc="We train your staff, setup your mobile apps, and help you launch your first course." 
                            />
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM CTA --- */}
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
        </div>
    );
}

// --- SUB-COMPONENTS ---

const ContactCard = ({ icon, title, content, sub }: { icon: React.ReactNode, title: string, content: string, sub: string }) => (
    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all group shadow-sm dark:shadow-none">
        <div className="p-3 bg-gray-100 dark:bg-slate-950 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform border border-gray-200 dark:border-slate-800">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 transition-colors">{title}</h3>
        <p className="text-purple-600 dark:text-purple-400 font-medium mb-1 transition-colors">{content}</p>
        <p className="text-sm text-neutral-500 dark:text-slate-400 transition-colors">{sub}</p>
    </div>
);

const TimelineItem = ({ step, title, desc }: { step: string, title: string, desc: string }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold font-mono transition-colors">
                {step}
            </div>
            {step !== "04" && <div className="w-px h-full bg-gray-200 dark:bg-slate-800 my-2 transition-colors"></div>}
        </div>
        <div className="pb-2">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 transition-colors">{title}</h4>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed transition-colors">{desc}</p>
        </div>
    </div>
);