"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconLayoutDashboard,
    IconSchool,
    IconReceipt2,
    IconBus,
    IconHome,
    IconRocket,
    IconPremiumRights,
    IconPhone,
    IconLogin,
    IconUser,
    IconMenu2,
    IconX,
    IconLogout,
    IconId,
    IconSun,
    IconMoon,
    IconBulb,
    IconBook,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/session";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// --- HELPER FUNCTIONS & COMPONENTS ---

export const capitalizeFirst = (str: string | undefined | null) => {
    if (!str) return "Not Available";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const Logo = () => {
    return (
        <Link href="/" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
            <Image src="/logo.png" alt="lireons" height={50} width={50} />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre">
                <span className="font-(--font-merienda) !text-neutral-800 dark:!text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors">
                    Lireons
                </span>
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Image src="/logo.png" alt="lireons" height={30} width={30} />
    );
};

// --- MAIN LAYOUT COMPONENT ---

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Theme Hook
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // States for Profile Menus (Only mobile needs state now)
    const [mobileProfileExpanded, setMobileProfileExpanded] = useState(false);

    const isLoggedIn = !!session;

    // Wait for component to mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "authenticated" && session) {
            const userDatas = (session as any).userdatas;
            const isProfileIncomplete = !userDatas?.number || !userDatas?.orgtype;

            const targetPath = "/complete-profile";
            if (isProfileIncomplete && pathname !== targetPath && pathname !== "/onboarding") {
                router.replace(targetPath);
            }
        }
    }, [status, session, pathname, router]);

    useEffect(() => {
        setMobileMenuOpen(false);
        setMobileProfileExpanded(false);
    }, [pathname]);

    // Get current theme (resolve 'system' to actual theme)
    const currentTheme = theme === 'system' ? systemTheme : theme;

    const toggleTheme = () => {
        setTheme(currentTheme === "dark" ? "light" : "dark");
    };

    // --- LINK CONFIGURATION ---

    const guestLinks = [
        { label: "Home", href: "/", icon: <IconHome className="h-5 w-5 shrink-0" /> },
        { label: "Features", href: "/features", icon: <IconRocket className="h-5 w-5 shrink-0" /> },
        { label: "Pricing", href: "/pricing", icon: <IconPremiumRights className="h-5 w-5 shrink-0" /> },
        { label: "Contact Sales", href: "/signup", icon: <IconPhone className="h-5 w-5 shrink-0" /> },
    ];

    const userLinks = [
        { label: "Dashboard", href: "/", icon: <IconLayoutDashboard className="h-5 w-5 shrink-0" /> },
        { label: "Academics", href: "/features", icon: <IconSchool className="h-5 w-5 shrink-0" /> },
        { label: "Finance", href: "/pricing", icon: <IconReceipt2 className="h-5 w-5 shrink-0" /> },
        { label: "Transport", href: "/features", icon: <IconBus className="h-5 w-5 shrink-0" /> },
    ];

    // These appear ONLY on Mobile and ONLY if logged in
    const mobileExtraLinks = [
        { label: "Solutions", href: "/solutions", icon: <IconBulb className="h-5 w-5 shrink-0" /> },
        { label: "Resources", href: "/resources", icon: <IconBook className="h-5 w-5 shrink-0" /> },
        { label: "Contact Sales", href: "/contact", icon: <IconPhone className="h-5 w-5 shrink-0" /> },
    ];

    // Base links (Desktop & Mobile Base)
    const linksToDisplay = isLoggedIn ? userLinks : guestLinks;

    // Final Mobile List: Base Links + (Extra Links if Logged In)
    const mobileLinksToDisplay = [
        ...linksToDisplay,
        ...(isLoggedIn ? mobileExtraLinks : [])
    ];

    if (!mounted) {
        return null;
    }

    return (
        <div
            className={cn(
                "flex w-full flex-col md:flex-row bg-gray-50 dark:bg-slate-950",
                "min-h-screen transition-colors duration-300"
            )}
        >
            {/* ================= MOBILE HEADER ================= */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[60] h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shadow-sm transition-colors duration-300">
                <Logo />
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-neutral-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        aria-label="Toggle theme"
                    >
                        {currentTheme === 'dark' ? (
                            <IconSun className="h-5 w-5 text-amber-400" />
                        ) : (
                            <IconMoon className="h-5 w-5 text-indigo-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-neutral-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-md transition"
                        aria-label="Open menu"
                    >
                        <IconMenu2 className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* ================= MOBILE DRAWER ================= */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden fixed inset-0 z-[70] bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300"
                    >
                        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-slate-800 shrink-0">
                            <Logo />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-neutral-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-md transition"
                                aria-label="Close menu"
                            >
                                <IconX className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Mobile Content */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between gap-10">
                            <div className="flex flex-col gap-2">
                                {/* Using the combined conditional list */}
                                {mobileLinksToDisplay.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md text-neutral-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        <span className="text-neutral-900 dark:text-slate-300 group-hover/sidebar:text-cyan-600 dark:group-hover/sidebar:text-cyan-400 transition-colors">
                                            {link.icon}
                                        </span>
                                        <span className="text-sm font-medium">
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
                                {isLoggedIn ? (
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => setMobileProfileExpanded(!mobileProfileExpanded)} 
                                            className={cn(
                                                "flex items-center justify-between w-full py-2 px-2 rounded-md transition-colors",
                                                mobileProfileExpanded 
                                                    ? "bg-gray-100 dark:bg-slate-900" 
                                                    : "hover:bg-gray-100 dark:hover:bg-slate-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {session?.user?.image ? (
                                                    <Image 
                                                        src={session.user.image} 
                                                        className="h-7 w-7 shrink-0 rounded-full border border-gray-300 dark:border-slate-700" 
                                                        width={50} 
                                                        height={50} 
                                                        alt="Avatar" 
                                                    />
                                                ) : (
                                                    <IconUser className="h-7 w-7 shrink-0 rounded-full bg-gray-200 dark:bg-slate-800 p-1 text-gray-600 dark:text-slate-300" />
                                                )}
                                                <span className="text-neutral-900 dark:text-slate-300 text-sm font-medium">
                                                    {capitalizeFirst(session?.user?.name) || "User"}
                                                </span>
                                            </div>
                                            <motion.div animate={{ rotate: mobileProfileExpanded ? 180 : 0 }}>
                                                <IconMenu2 className="h-4 w-4 text-neutral-500 dark:text-slate-400 rotate-90" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {mobileProfileExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: "auto", opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }} 
                                                    className="overflow-hidden flex flex-col gap-1 pl-4 border-l border-gray-200 dark:border-slate-800 ml-5"
                                                >
                                                    <Link 
                                                        href="/profile" 
                                                        className="flex items-center gap-2 py-2 px-2 text-sm text-neutral-900 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-slate-900/50 rounded-md"
                                                    >
                                                        <IconId className="h-4 w-4" />
                                                        <span>My Profile</span>
                                                    </Link>
                                                    <button 
                                                        onClick={() => signOut({ callbackUrl: "/" })} 
                                                        className="flex items-center gap-2 py-2 px-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md w-full text-left"
                                                    >
                                                        <IconLogout className="h-4 w-4" />
                                                        <span>Logout</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link 
                                        href="/login" 
                                        className="border text-sm font-medium relative border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-neutral-900 dark:text-slate-300 px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition w-full block text-center shadow-sm"
                                    >
                                        <span>Login</span>
                                        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= DESKTOP SIDEBAR ================= */}
            <div className="hidden md:block h-screen sticky top-0 left-0 z-50">
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="justify-between gap-10 h-full bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-colors duration-300">
                        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                            {open ? <Logo /> : <LogoIcon />}
                            <div className="mt-8 flex flex-col gap-2">
                                {linksToDisplay.map((link, idx) => (
                                    <SidebarLink
                                        key={idx}
                                        link={link}
                                        className={cn(
                                            "[&>svg]:!text-neutral-700 dark:[&>svg]:!text-slate-300",
                                            "hover:[&>svg]:!text-cyan-600 dark:hover:[&>svg]:!text-cyan-400",
                                            "[&>span]:!text-neutral-700 dark:[&>span]:!text-slate-300",
                                            "hover:[&>span]:!text-cyan-600 dark:hover:[&>span]:!text-cyan-400",
                                            "transition-colors duration-200"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Theme Toggle */}
                            <motion.button
                                layout 
                                onClick={toggleTheme}
                                className={cn(
                                    "flex items-center gap-2 py-2 rounded-md transition-colors duration-200 group/theme relative",
                                    open ? "px-2 hover:bg-gray-100 dark:hover:bg-slate-900" : "justify-center hover:bg-transparent"
                                )}
                                title="Toggle Theme"
                            >
                                <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-900 group-hover/theme:bg-gray-200 dark:group-hover/theme:bg-slate-800 transition-colors">
                                    {currentTheme === 'dark' ? (
                                        <IconSun className="h-4 w-4 text-amber-400" />
                                    ) : (
                                        <IconMoon className="h-4 w-4 text-indigo-500" />
                                    )}
                                </div>
                                
                                {open && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm font-medium text-neutral-700 dark:text-slate-300"
                                    >
                                        {currentTheme === 'dark' ? "Light Mode" : "Dark Mode"}
                                    </motion.span>
                                )}
                            </motion.button>

                            {isLoggedIn ? (
                                open ? (
                                    /* === EXPANDED: Permanent Profile Section === */
                                    <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                                        {/* User Card */}
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800">
                                            {session?.user?.image ? (
                                                <Image 
                                                    src={session.user.image} 
                                                    className="h-8 w-8 shrink-0 rounded-full" 
                                                    width={50} 
                                                    height={50} 
                                                    alt="Avatar" 
                                                />
                                            ) : (
                                                <IconUser className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-slate-800 p-1 text-gray-600 dark:text-slate-300" />
                                            )}
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                                    {capitalizeFirst(session?.user?.name) || "User"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Permanent Actions */}
                                        <div className="flex flex-col gap-1 pl-1">
                                            <Link 
                                                href="/profile" 
                                                className="flex items-center gap-2 px-2 py-2 text-sm text-neutral-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-slate-900/50 rounded-lg transition-colors"
                                            >
                                                <IconId className="h-5 w-5 shrink-0" />
                                                <span>My Profile</span>
                                            </Link>
                                      
                                            <button
                                                type="button"
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
                                            >
                                                <IconLogout className="h-5 w-5 shrink-0" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* === COLLAPSED: Just Avatar === */
                                    <Link 
                                        href="/profile"
                                        className="flex items-center justify-center w-full py-2"
                                        title="My Profile"
                                    >
                                        {session?.user?.image ? (
                                            <Image 
                                                src={session.user.image} 
                                                className="h-7 w-7 shrink-0 rounded-full hover:opacity-80 transition-opacity" 
                                                width={50} 
                                                height={50} 
                                                alt="Avatar" 
                                            />
                                        ) : (
                                            <IconUser className="h-7 w-7 shrink-0 rounded-full bg-gray-200 dark:bg-slate-800 p-1 text-gray-600 dark:text-slate-300" />
                                        )}
                                    </Link>
                                )
                            ) : (
                                /* === LOGGED OUT === */
                                open ? (
                                    <Link 
                                        href="/login" 
                                        className="border text-sm font-medium relative border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-300 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition w-full block text-center shadow-sm"
                                    >
                                        <span>Login</span>
                                        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px" />
                                    </Link>
                                ) : (
                                    <Link 
                                        href="/login" 
                                        className="flex items-center justify-center w-full h-8 mt-1 hover:text-cyan-600 dark:hover:text-cyan-400 !text-neutral-800 dark:!text-slate-300 transition" 
                                        title="Login"
                                    >
                                        <IconLogin className="h-5 w-5 shrink-0" />
                                    </Link>
                                )
                            )}
                        </div>
                    </SidebarBody>
                </Sidebar>
            </div>

            <div className="flex flex-1 flex-col h-full pt-16 md:pt-0 bg-gray-50 dark:bg-slate-950">
                {children}
            </div>
        </div>
    );
}