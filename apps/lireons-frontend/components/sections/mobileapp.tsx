"use client";
import { useState, useEffect } from "react";
import { StickyScroll } from "../ui/sticky-scroll-reveal";
import Image from "next/image";
import mobiledashboard from "../../app/assets/mobiledashboard.png"
import androiddashboard from "../../app/assets/androiddashboard.png"
import mobilenotification from "../../app/assets/mobilenotification.png"
import crossplatform from "../../app/assets/cross-platform.png"

export const content = [
    {
        title: (
            <span className="text-neutral-900 dark:text-white transition-colors duration-300">
                Your Branded Android App
            </span>
        ),
        description: (
            <span className="text-neutral-600 dark:text-slate-400 transition-colors duration-300 block mt-2 leading-relaxed">
                Launch directly on the Google Play Store under your own academy's name and logo. Stop losing students to generic platforms filled with competitor courses. A dedicated app instantly elevates your brand, ensuring you stay permanently visible on your students' home screens while delivering a lightning-fast, native learning experience.
            </span>
        ),
        content: (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-cyan-500/20 rounded-2xl overflow-hidden isolate">
                <Image src={androiddashboard} alt="Android App" fill className="object-contain p-4" sizes="400px" />
            </div>
        ),
    },
    {
        title: (
            <span className="text-neutral-900 dark:text-white transition-colors duration-300">
                Your Branded iOS App
            </span>
        ),
        description: (
            <span className="text-neutral-600 dark:text-slate-400 transition-colors duration-300 block mt-2 leading-relaxed">
                Capture the premium student demographic with a native iOS experience for iPhones and iPads. Launching on the Apple App Store signals uncompromising quality and prestige. We deliver a frictionless, world-class learning environment optimized for Apple's native video players and smooth gestures.
            </span>
        ),
        content: (
            <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden isolate">
                <Image src={mobiledashboard} alt="iOS App" fill className="object-contain p-4" sizes="400px" />
            </div>
        ),
    },
    {
        title: (
            <span className="text-neutral-900 dark:text-white transition-colors duration-300">
                Push Marketing & Alerts
            </span>
        ),
        description: (
            <span className="text-neutral-600 dark:text-slate-400 transition-colors duration-300 block mt-2 leading-relaxed">
                Cut through the noise of cluttered email inboxes with direct-to-device push notifications. Instantly reach your students with targeted announcements for flash sales, urgent live class reminders, or course milestones. Keep your academy top-of-mind and dramatically increase engagement and repeat purchases.
            </span>
        ),
        content: (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-cyan-500/20 rounded-2xl overflow-hidden isolate">
                <Image src={mobilenotification} alt="Notifications" fill className="object-contain p-4" sizes="400px" />
            </div>
        ),
    },
    {
        title: (
            <span className="text-neutral-900 dark:text-white transition-colors duration-300">
                Secure Offline Downloads
            </span>
        ),
        description: (
            <span className="text-neutral-600 dark:text-slate-400 transition-colors duration-300 block mt-2 leading-relaxed">
                Empower students to learn without buffering by allowing secure, in-app video downloads. Crucially, your intellectual property remains locked down. Our bank-grade DRM encryption ensures videos cannot be screen-recorded, shared, or extracted, giving you total peace of mind against piracy.
            </span>
        ),
        content: (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-emerald-500/20 rounded-2xl overflow-hidden isolate">
                <Image src={crossplatform} alt="Sync" fill className="object-contain p-4" sizes="400px" />
            </div>
        ),
    },
];

export default function MobileSection() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkSize = () => setIsMobile(window.innerWidth < 768);
        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    return (
        <section className="relative w-full bg-white dark:bg-slate-950 py-10 md:py-20 overflow-hidden transition-colors duration-300">
            {/* Blobs: Adjusted opacities for better visibility */}
            <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-100/60 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-100/60 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {isMobile ? (
                    <div className="flex flex-col gap-16">
                        {content.map((item, index) => (
                            <div key={index} className="space-y-6">
                                {/* Title/Desc already wrapped in spans with correct classes above */}
                                <h3 className="text-3xl font-bold">{item.title}</h3>
                                <div className="text-lg leading-relaxed">{item.description}</div>
                                <div className="aspect-square relative w-full max-w-[350px] mx-auto shadow-lg rounded-2xl">
                                    {item.content}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full">
                        <StickyScroll
                            content={content as any} 
                            // 3. FIXED: Added 'bg-white' and 'isolate' to fix black corners
                            contentClassName="h-[25rem] w-[25rem] rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900 transition-colors duration-300 isolate shadow-sm"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}