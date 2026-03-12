"use client";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function Team() {
    const testimonials = [
        {
            quote:
                "Our mission is to unify the fragmented education sector. We are building the operating system that Indian schools deserve—secure, efficient, and connected.",
            name: "Sarthak Chauhan",
            designation: "Founder & CEO",
            src: "/ceo.jpg",
        },
        {
            quote:
                "We are looking for a skilled Backend Developer to architect scalable APIs and database structures for millions of users.",
            name: "Open Position",
            designation: "Backend Lead",
            src: "p1.jpg"  },
        {
            quote:
                "Join us to build the mobile interface that parents and teachers will use every day. Proficiency in React Native/Expo required.",
            name: "Open Position",
            designation: "Mobile App Developer (Android/iOS)",
            src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "Leading our expansion into Tier-2 and Tier-3 cities. If you can close deals with educational institutions, this seat is for you.",
            name: "Open Position",
            designation: "Business Development Executive",
            src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
    ];

    return (
        // 1. Container: White for Light Mode | Slate-950 for Dark Mode
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-slate-950 w-full pt-20 transition-colors duration-300">
            {/* Background Effects: Adjusted for Light Mode visibility */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 h-96 w-96 bg-indigo-200/50 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/3 h-96 w-96 bg-blue-200/50 dark:bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 dark:via-indigo-400/30 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center">
                {/* 2. Heading: Neutral-900 for Light Mode | Gradient for Dark Mode */}
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-neutral-900 dark:bg-gradient-to-r dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-400 dark:bg-clip-text dark:text-transparent transition-colors">
                    Leadership & Careers
                </h2>

                <AnimatedTestimonials testimonials={testimonials} />
            </div>
        </div>
    );
}