"use client";
import React from "react";
import { motion } from "motion/react";
import { IconChevronsRight } from "@tabler/icons-react";

const features = [
    {
        title: "All-in-One Course Platform",
        description:
            "Everything you need to run your online academy. Course builder, payment gateway, student management, and mobile apps in one dashboard.",
    },
    {
        title: "Ownership & Control",
        description:
            "You own your data and your brand. We provide the technology, but the students, the emails, and the revenue are 100% yours.",
    },
    {
        title: "Deep Analytics",
        description:
            "Transform raw data into decisions. Track sales revenue, course completion rates, and student engagement patterns instantly.",
    },
    {
        title: "Learn Anywhere",
        description:
            "Your academy never sleeps. With our cloud-native architecture, students can watch videos and take quizzes from anywhere, 24/7, on any device.",
    },
    {
        title: "Marketing Automation",
        description:
            "Reduce manual work with automated tools. Send email sequences, push notifications, and abandon cart reminders on autopilot.",
    },
    {
        title: "Scalable Infrastructure",
        description:
            "Whether you have 100 students or 1 million, our system scales effortlessly with your growth, ensuring zero downtime during big launches.",
    },
];

export default function KeyFeatures() {
    return (
        <div className="relative w-full bg-white dark:bg-slate-950">
            {/* --- BACKGROUND IMAGE LAYER --- */}
            <div
                className="absolute inset-0 z-0 bg-fixed bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=3546&auto=format&fit=crop')",
                }}
            >
                {/* UPDATED OVERLAYS for Light/Dark Mode:
                    Light Mode: Heavy white overlay (bg-white/90) to wash out image for dark text.
                    Dark Mode: Original dark overlays (slate-950/70 & black/50) for white text.
                */}
                
                {/* Layer 1: Tint */}
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 dark:mix-blend-multiply transition-colors duration-300" />
                
                {/* Layer 2: Dimming/Smoothing */}
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 transition-colors duration-300" />
            </div>

            {/* --- CONTENT LAYER --- */}
            <div className="relative z-10 w-full px-4 py-24 md:py-32">
                <div className="mx-auto max-w-7xl">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-16 text-center"
                    >
                        {/* Heading: Neutral-900 (Light) | White (Dark) */}
                        <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl lg:text-6xl dark:drop-shadow-lg transition-colors">
                            What Sets Us Apart
                        </h2>
                        {/* Subtext: Neutral-600 (Light) | Slate-100 (Dark) */}
                        <p className="mt-4 text-lg text-neutral-600 dark:text-slate-100 dark:drop-shadow-md font-medium transition-colors">
                            The operating system built for modern education.
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:gap-x-20">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group flex gap-4"
                            >
                                {/* Icon */}
                                <div className="mt-1 flex-shrink-0">
                                    {/* Icon: Cyan-600 (Light) | Cyan-400 (Dark) */}
                                    <IconChevronsRight className="h-6 w-6 text-cyan-600 dark:text-cyan-400 transition-all duration-300 group-hover:translate-x-1 dark:drop-shadow-lg" />
                                </div>

                                {/* Text Content */}
                                <div>
                                    {/* Title: Neutral-900 (Light) | White (Dark) */}
                                    <h3 className="mb-3 text-xl font-bold text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors dark:drop-shadow-md">
                                        {feature.title}
                                    </h3>
                                    {/* Description: Neutral-700 (Light) | Slate-200 (Dark) */}
                                    <p className="text-base leading-relaxed text-neutral-700 dark:text-slate-200 dark:drop-shadow-md font-medium transition-colors">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}