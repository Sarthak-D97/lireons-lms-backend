"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "motion/react";
import { useSession } from "@/lib/session";
import { useRouter, usePathname } from "next/navigation";

export default function NavBarMain() {
    const [active, setActive] = useState<string | null>(null);
    const { scrollYProgress } = useScroll();
    const [visible, setVisible] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const isLoggedIn = !!session;

    useEffect(() => {
        if (status === "authenticated" && session) {
            const userDatas = (session as any).userdatas;
            const isProfileIncomplete = !userDatas?.number || !userDatas?.orgtype;

            const targetPath = "/complete-profile";
            // Ensure we don't redirect away if they are already on the info page
            if (isProfileIncomplete && pathname !== targetPath && pathname !== "/onboarding" && pathname !== "/already-registered") {
                router.replace(targetPath);
            }
        }
    }, [status, session, pathname, router]);

    const checkVisibility = () => {
        if (typeof window === "undefined") return false;
        if (window.innerWidth < 1024) return false;
        if (!isLoggedIn) return false;

        // ⬇️ EDIT HERE: Add any paths where you want the Navbar HIDDEN ⬇️
        const hiddenPaths = [
            "/complete-profile",
            "/already-registered", // Added this based on your request
            "/onboarding"     // Added this just in case based on your redirect logic
        ];

        if (hiddenPaths.includes(pathname)) return false;

        return true;
    };

    // Update visibility whenever login status or path changes
    useEffect(() => {
        setVisible(checkVisibility());
    }, [isLoggedIn, pathname]);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        if (typeof current === "number") {
            // Always check strict rules first
            if (!checkVisibility()) {
                setVisible(false);
                return;
            }

            const direction = current! - scrollYProgress.getPrevious()!;

            // Scroll logic (only runs if we passed the checks above)
            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "hidden lg:block fixed top-2 lg:top-10 inset-x-0 w-[95%] lg:max-w-fit mx-auto z-5000"
                )}
            >
                {/* 1. Added 'className' to Menu: 
                       - White bg + Gray border for Light Mode
                       - Slate-900 bg + White/10 border for Dark Mode
                */}
                <Menu 
                    setActive={setActive} 
                    // @ts-ignore - Ignoring potential type error if Menu doesn't strictly define className prop, though mostly safe in standard JSX
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-none"
                >
                    <MenuItem setActive={setActive} active={active} item="Features">
                        <div className="flex flex-col space-y-2 lg:space-y-4 text-sm lg:text-base items-center justify-center w-full text-neutral-900 dark:text-slate-100 transition-colors">
                            <HoveredLink href="/features#admission">Course Builder</HoveredLink>
                            <HoveredLink href="/features#sis">Student Analytics</HoveredLink>
                            <HoveredLink href="/features#attendance">Live Classes</HoveredLink>
                            <HoveredLink href="/features#finance">Payment Gateway</HoveredLink>
                        </div>
                    </MenuItem>
                    <MenuItem setActive={setActive} active={active} item="Solutions">
                        <div className="  text-sm grid grid-cols-2 gap-4 lg:gap-10 p-2 lg:p-4 w-full">
                            <ProductItem
                                title="Course Creators"
                                href="/solutions"
                                src="https://assets.aceternity.com/demos/algochurn.webp"
                                description="Launch your academy in minutes. No coding required."
                            />
                            <ProductItem
                                title="Coaching Institutes"
                                href="/solutions"
                                src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
                                description="Scale your offline center with hybrid learning tools."
                            />
                            <ProductItem
                                title="Enterprises"
                                href="/solutions"
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
                                description="White-labeled LMS for corporate training and certification."
                            />
                            <ProductItem
                                title="Marketing Tools"
                                href="/solutions"
                                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop"
                                description="Grow your audience with built-in funnels and affiliate systems."
                            />
                        </div>
                    </MenuItem>
                    <MenuItem setActive={setActive} active={active} item="Pricing">
                        <div className="flex flex-col space-y-2 lg:space-y-4 text-sm lg:text-base items-center justify-center w-full text-neutral-900 dark:text-slate-100 transition-colors">
                            <HoveredLink href="/pricing">Starter</HoveredLink>
                            <HoveredLink href="/pricing">Growth</HoveredLink>
                            <HoveredLink href="/pricing">Institute</HoveredLink>
                        </div>
                    </MenuItem>
                    <MenuItem setActive={setActive} active={active} item="Resources">
                        <div className="flex flex-col space-y-2 lg:space-y-4 text-sm lg:text-base items-center justify-center w-full text-neutral-900 dark:text-slate-100 transition-colors">
                            <HoveredLink href="/resources">Course Creation</HoveredLink>
                            <HoveredLink href="/resources">Marketing Funnels</HoveredLink>
                            <HoveredLink href="/resources">Sales Strategies</HoveredLink>
                            <HoveredLink href="/resources">Personal Branding</HoveredLink>
                        </div>
                    </MenuItem>
                    <MenuItem setActive={setActive} active={active} item="Contact">
                        <div className="flex flex-col space-y-2 lg:space-y-4 text-sm lg:text-base items-center justify-center w-full text-neutral-900 dark:text-slate-100 transition-colors">
                            <HoveredLink href="/contact">Sales Inquiry</HoveredLink>
                            <HoveredLink href="/contact">Technical Support</HoveredLink>
                        </div>
                    </MenuItem>
                </Menu>
            </motion.div>
        </AnimatePresence>
    );
}