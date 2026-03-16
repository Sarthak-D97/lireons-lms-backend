"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { IconArrowRight } from "@tabler/icons-react";
import JoinUsButton from "@/components/sections/JoinUsButton";

const faqData = [
    {
        question: "Can I sell different types of content?",
        answer:
            "Yes. You can sell video courses, PDF ebooks, live webinars, and even physical products. Bundle them together or sell them individually with flexible pricing options.",
    },
    {
        question: "Do you support mobile apps?",
        answer:
            "Absolutely. You get your own white-labeled Android and iOS apps. Students can download your app from the Play Store/App Store and access content offline.",
    },
    {
        question: "Is my content secure?",
        answer:
            "Yes, we use bank-grade DRM encryption. Your videos cannot be screen-recorded or downloaded illegally, ensuring your premium content remains exclusive.",
    },
    {
        question: "How do I get paid?",
        answer:
            "Directly to your bank account. We integrate with your Stripe or Razorpay account, so the money goes straight to you. We don't hold your funds.",
    },
];

const FAQItem = ({
    question,
    answer,
    index,
}: {
    question: string;
    answer: string;
    index: number;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const formattedIndex = (index + 1).toString().padStart(2, "0");

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                // 1. Container: Gray-50/White border for Light | Slate-900 for Dark
                "group cursor-pointer rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 p-1 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900/80 shadow-sm dark:shadow-none",
                isOpen ? "border-cyan-500/30 bg-white dark:bg-slate-900/80" : ""
            )}
        >
            <div className="flex items-center justify-between px-4 py-3 md:py-4">
                <div className="flex items-center gap-4 md:gap-6">
                    <span
                        className={cn(
                            // 2. Index Number: Neutral-400 for Light | Slate-600 for Dark
                            "text-xl md:text-2xl font-bold font-mono transition-colors duration-300",
                            isOpen 
                                ? "text-cyan-600 dark:text-cyan-400" 
                                : "text-neutral-400 dark:text-slate-600 group-hover:text-neutral-500 dark:group-hover:text-slate-400"
                        )}
                    >
                        {formattedIndex}
                    </span>
                    <h3
                        className={cn(
                            // 3. Question Text: Neutral-800 for Light | Slate-200 for Dark
                            "text-base md:text-lg font-medium text-neutral-800 dark:text-slate-200 transition-colors",
                            isOpen ? "text-cyan-700 dark:text-cyan-50" : ""
                        )}
                    >
                        {question}
                    </h3>
                </div>

                <div
                    className={cn(
                        // 4. Icon Circle: White/Gray for Light | Slate-800 for Dark
                        "relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 transition-all duration-300 group-hover:border-cyan-500/30",
                        isOpen ? "bg-cyan-500 text-white rotate-180 border-cyan-500" : "text-neutral-400 dark:text-slate-400"
                    )}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        {/* 5. Answer Text: Neutral-600 for Light | Slate-400 for Dark */}
                        <div className="px-4 pb-4 md:pl-16 text-sm md:text-base text-neutral-600 dark:text-slate-400 leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQSection() {
    return (
        // 6. Section Background: White for Light | Slate-950 for Dark
        <section className="relative w-full overflow-hidden bg-white dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            {/* Background Glows: Adjusted for Light Mode visibility */}
            <div className="absolute top-0 left-1/4 h-96 w-96 bg-cyan-200/40 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-4xl px-4">
                <div className="mb-12 text-center">
                    {/* 7. Heading: Neutral-900 for Light | Gradient for Dark */}
                    <h2 className="mb-4 text-3xl font-bold md:text-5xl text-neutral-900 dark:text-transparent dark:bg-linear-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 dark:bg-clip-text transition-colors">
                        FAQs for Creators
                    </h2>
                    {/* 8. Subtext: Neutral-600 for Light | Slate-400 for Dark */}
                    <p className="mx-auto max-w-2xl text-neutral-600 dark:text-slate-400">
                        Explore common questions about how <span className="font-(--font-merienda) text-cyan-700 dark:text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors">Lireons</span> helps you scale.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {faqData.map((item, index) => (
                        <FAQItem
                            key={index}
                            index={index}
                            question={item.question}
                            answer={item.answer}
                        />
                    ))}
                </div>

                {/* Big CTA Button */}
                <div className="mt-24 flex flex-col items-center">
                    <JoinUsButton className="relative group overflow-hidden rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] transition-shadow duration-300 inline-block">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#818cf8_0%,#3b82f6_50%,#818cf8_100%)]" />
                        {/* 9. Button Inner: Neutral-900 (Keep dark for contrast) | Slate-950 for Dark */}
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-neutral-900 dark:bg-slate-950 px-10 py-5 text-xl font-bold text-white backdrop-blur-3xl transition-all group-hover:bg-neutral-800 dark:group-hover:bg-slate-900">
                            Book a Demo
                            <IconArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </span>
                    </JoinUsButton>
                    {/* 10. Bottom Text: Neutral-500 for Light | Slate-400 for Dark */}
                    <p className="mt-6 text-center text-sm text-neutral-500 dark:text-slate-400 max-w-md transition-colors">
                        Ready to transform your campus? Get a personalized walkthrough of the <span className="font-(--font-merienda) text-cyan-700 dark:text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors">Lireons.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}   