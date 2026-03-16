"use client";

import {
    FileText,
    Bus,
    Network,
    Briefcase,
    BookOpen
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function InfoBox() {
    return (
        // 1. Container: White for Light Mode | Slate-950 for Dark Mode
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-slate-950 w-full rounded-md py-20 px-4 md:px-8 transition-colors duration-300">
            
            {/* 2. Background Blobs: Adjusted opacity/color for visibility in Light Mode */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 left-1/3 h-96 w-96 bg-purple-200/50 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/3 h-96 w-96 bg-violet-200/50 dark:bg-violet-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-0.5 w-3/4 bg-purple-300/50 dark:bg-purple-400/30 blur-sm"></div>
            </div>

            <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12 md:grid-rows-3 md:gap-4 xl:max-h-136 xl:grid-rows-2 relative z-10 max-w-7xl w-full">

                {/* Card 1: Main Feature */}
                <GridItem
                    area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                    icon={<FileText className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-colors" />}
                    title="Your Own Branded App"
                    description="Launch your own white-labeled mobile apps on Android & iOS. Build your brand, not ours."
                />

                {/* Card 2: Transport/Safety */}
                <GridItem
                    area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                    icon={<Bus className="h-4 w-4 text-violet-600 dark:text-violet-400 transition-colors" />}
                    title="Secure Video Hosting"
                    description="Piracy-proof video player with DRM encryption to protect your premium course content."
                />

                {/* Card 3: The Ecosystem */}
                <GridItem
                    area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                    icon={<Network className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-colors" />}
                    title="Sell Courses Online"
                    description="Create landing pages, integrate payment gateways, and sell courses instantly globally."
                />

                {/* Card 4: Recruitment */}
                <GridItem
                    area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                    icon={<Briefcase className="h-4 w-4 text-violet-600 dark:text-violet-400 transition-colors" />}
                    title="Live Cohorts & Webinars"
                    description="Run cohort-based courses with scheduled unlocks. Integrate Zoom for live lessons."
                />

                {/* Card 5: LMS (Academics) */}
                <GridItem
                    area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                    icon={<BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-colors" />}
                    title="Coding & Assessments"
                    description="Built-in code compiler for 10+ languages. Auto-graded quizzes and mock tests."
                />
            </ul>
        </div>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={`min-h-56 list-none ${area}`}>
            {/* 3. Card Container: Gray-50/Border-Gray-200 for Light | Slate-900/Purple-Border for Dark */}
            <div className="relative h-full rounded-2xl border border-gray-200 dark:border-purple-500/20 p-2 md:rounded-3xl md:p-3 bg-gray-50 dark:bg-slate-900/50 backdrop-blur-sm hover:border-purple-300 dark:hover:border-purple-400/40 transition-colors duration-300">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_rgba(168,85,247,0.15)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        {/* 4. Icon Box: Purple-100/200 for Light | Purple-500/10 for Dark */}
                        <div className="w-fit rounded-lg border border-purple-200 dark:border-purple-500/40 bg-purple-100 dark:bg-purple-500/10 p-2 transition-colors">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            {/* 5. Title: Neutral-900 for Light | Purple-100 for Dark */}
                            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-neutral-900 dark:text-purple-100 md:text-2xl/[1.875rem] transition-colors">
                                {title}
                            </h3>
                            {/* 6. Description: Neutral-600 for Light | Slate-300 for Dark */}
                            <h2 className="font-sans text-sm/[1.125rem] text-neutral-600 dark:text-slate-300 md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold transition-colors">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};