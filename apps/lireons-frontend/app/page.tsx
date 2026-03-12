"use client";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Cover } from "@/components/ui/cover";
import { Merienda } from 'next/font/google'
import Team from "../components/sections/team";
import InfoBox from "../components/sections/InfoBox";
import InfiniteCards from "../components/sections/infinite-cards";
import ClientOnly from "@/components/ui/ClientOnly";
import CardItems from "../components/sections/CardsItem";
import { MacbookScroll } from "../components/ui/macbook-scroll";
import MobileSection from "../components/sections/mobileapp";
import FAQSection from "../components/sections/FAQ"
import KeyFeatures from "../components/sections/KeyFeatures";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const merienda = Merienda({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-merienda',
})

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const handleJoinUs = () => {
        if (status === "authenticated") {
            const queryParams = new URLSearchParams({
                name: session?.user?.name || "",
                email: session?.user?.email || "",
                orgType: "Registered User", 
                phone: "Active"
            }).toString();

            router.push(`/registered-info?${queryParams}`);
        } else {
            router.push("/signup");
        }
    };

    return (
        // 1. Main Background: White for Light Mode | Slate-950 for Dark Mode
        <div className="flex w-full flex-col overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300">

            {/* 2. Lamp Container: White for Light Mode | Slate-950 for Dark Mode */}
            <LampContainer className="min-h-screen pt-78 md:pt-48 lg:pt-82 bg-white dark:bg-slate-950 transition-colors duration-300">
                <motion.h1
                    initial={{ opacity: 0.5, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    // 3. Text Gradient: Dark Slate (600-900) for Light Mode | Original Light Slate for Dark Mode
                    className="bg-linear-to-br pt-46 sm:pt-32 md:pt-40 lg:pt-52 from-slate-600 to-slate-900 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-center text-3xl font-medium tracking-tight text-transparent sm:text-5xl md:text-7xl"
                >
                    {/* 4. Logo Text: Cyan-700 for Light Mode | White for Dark Mode */}
                    <span className={`${merienda.className} text-cyan-700 dark:text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors`}>Lireons</span><br />
                    Your Academy, Your Brand
                    <br />Build to <Cover>Scale</Cover>
                </motion.h1>
                <div className="mt-8 h-24 w-full px-4 md:h-32 md:px-0">
                    <div
                        onClick={handleJoinUs}
                        className="h-full w-full flex items-center justify-center cursor-pointer"
                    >
                        <TextHoverEffect text="Join Us" />
                    </div>
                </div>
            </LampContainer>
            
            {/* 6. Macbook Container: White for Light Mode | Slate-950 for Dark Mode */}
            <div className="relative z-10 w-full overflow-hidden md:h-[150vh] lg:h-500 bg-white dark:bg-slate-950 -mt-80 sm:-mt-32 md:-mt-40 transition-colors duration-300">
                <MacbookScroll
                    title={
                        // 7. Title Text: Neutral-900 for Light Mode | White for Dark Mode
                        <span className="text-3xl sm:text-5xl text-neutral-900 dark:text-white transition-colors">
                            Academy by <span className={`${merienda.className} text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-yellow-100 transition-colors`}>Lireons</span>
                        </span>
                    }
                    src={`/site.png`}
                    showGradient={false}
                />
            </div>
            
            {/* 8. Content Wrapper: White for Light Mode | Slate-950 for Dark Mode */}
            <div className="w-full flex flex-col gap-2 md:gap-8 bg-white dark:bg-slate-950 transition-colors duration-300">
                <CardItems />
                <InfoBox />
                <MobileSection />
                <div className="flex flex-col gap-0">
                    <KeyFeatures />
                    <InfiniteCards />
                    <ClientOnly>
                        <Team />
                    </ClientOnly>
                    <FAQSection />
                </div>
            </div>
        </div>
    );
};