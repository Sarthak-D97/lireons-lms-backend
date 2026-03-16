"use client";
import React from "react";
import {
    TextRevealCard,
    TextRevealCardDescription,
    TextRevealCardTitle,
} from "../ui/text-reveal-card";
import { cn } from "@/lib/utils";

export default function InfoText() {
    return (
        // 1. Container: White for Light Mode | Slate-950 for Dark Mode
        <div className="relative min-h-[40vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950 rounded-2xl w-full py-12 md:py-20 transition-colors duration-300">
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Background Blobs */}
                <div className="absolute top-1/4 right-1/4 h-48 w-48 md:h-96 md:w-96 bg-purple-200/50 dark:bg-purple-900/10 rounded-full blur-3xl transition-colors"></div>
                <div className="absolute bottom-1/4 left-1/4 h-48 w-48 md:h-96 md:w-96 bg-violet-200/50 dark:bg-violet-900/10 rounded-full blur-3xl transition-colors"></div>
                
                {/* Gradient Line */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-[90%] md:w-2/3 bg-gradient-to-r from-transparent via-purple-300/50 dark:via-purple-900/20 to-transparent transition-colors"></div>
            </div>

            <div className="relative z-10 w-full flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-full md:max-w-max overflow-hidden flex flex-col items-center">
                    <TextRevealCard
                        text="You focus on Teaching"
                        revealText="We handle the Tech"
                        // Card Border: Amber-200 (Light) | Amber-500/20 (Dark)
                        className="border-amber-200 dark:border-amber-500/20 w-full [&_p]:text-2xl [&_p]:md:text-[3rem]"
                    >
                        {/* Title: Amber-600 (Light) | Amber-400 (Dark) */}
                        <TextRevealCardTitle className="text-amber-600 dark:text-amber-400 text-xl md:text-2xl transition-colors">
                            The Perfect Partnership
                        </TextRevealCardTitle>
                        {/* Description: Neutral-600 (Light) | Slate-300 (Dark) */}
                        <TextRevealCardDescription className="text-neutral-600 dark:text-slate-300 !text-sm md:!text-base max-w-[300px] md:max-w-none transition-colors">
                            Don&apos;t let technology barriers slow down your growth.
                            <span className="hidden md:inline"> Hover</span>
                            <span className="inline md:hidden"> Tap</span> to see how Lireons powers your academy.
                        </TextRevealCardDescription>
                    </TextRevealCard>
                </div>
            </div>  
        </div>
    );
}