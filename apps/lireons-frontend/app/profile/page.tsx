"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
    IconBuildingSkyscraper, 
    IconPhone, 
    IconCalendar, 
    IconMail, 
    IconUser,
    IconLogout,
    IconPencil
} from "@tabler/icons-react";
import { Merienda } from "next/font/google";
import { cn } from "@/lib/utils";

// 1. Configure Font
const merienda = Merienda({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-merienda",
});

// 2. Define Interfaces
interface UserDatas {
    name?: string | null;
    email?: string | null;
    number?: string | null;
    orgtype?: string | null;
    createdAt?: string | Date | null;
}

interface CustomSession {
    userdatas?: UserDatas;
    expires?: string;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

// 3. Helper Functions
const capitalizeFirst = (str: string | undefined | null) => {
    if (!str) return "Not Available";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "N/A";
    // This will now handle the current date object passed to it
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export default function ProfilePage() {
    const { data: sessionData, status } = useSession();
    const router = useRouter();

    // Redirect if unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Loading State
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Cast session to CustomSession
    const session = sessionData as CustomSession | null;

    // 4. Consolidated Data Logic
    const userData = {
        name: session?.userdatas?.name || session?.user?.name || "Not Available",
        email: session?.userdatas?.email || session?.user?.email || "Not Available",
        image: session?.user?.image,
        phone: session?.userdatas?.number || "Not Verified",
        orgType: session?.userdatas?.orgtype || "Standard User",
        // CHANGED: This now generates the current date/time (Present Date)
        joinedDate: new Date(), 
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                        My Profile
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-slate-400">
                        Manage your account settings for <span className={`${merienda.className} text-cyan-600 dark:text-yellow-100`}>Lireons</span>.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
                    
                    {/* Cover Banner */}
                    <div className="h-32 md:h-48 w-full bg-gradient-to-r from-cyan-500 to-blue-600 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6">
                            
                            {/* Avatar */}
                            <div className="relative">
                                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-lg">
                                    {userData.image ? (
                                        <Image 
                                            src={userData.image} 
                                            alt={userData.name} 
                                            fill 
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                                            <IconUser className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 h-4 w-4 md:h-5 md:w-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                            </div>

                            {/* Name & Role */}
                            <div className="flex-1 pt-2 md:pt-0">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {capitalizeFirst(userData.name)}
                                </h2>
                                <p className="text-neutral-500 dark:text-slate-400 font-medium">
                                    {capitalizeFirst(userData.orgType)}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-200 font-medium transition-colors border border-gray-200 dark:border-slate-700 cursor-pointer">
                                    <IconPencil className="h-4 w-4" />
                                    <span>Edit</span>
                                </button>
                                <button 
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium transition-colors border border-red-100 dark:border-red-900/30 cursor-pointer"
                                >
                                    <IconLogout className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>

                        <div className="h-px w-full bg-gray-100 dark:bg-slate-800 my-8"></div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <InfoCard 
                                icon={<IconUser className="h-5 w-5" />}
                                label="Display Name"
                                value={capitalizeFirst(userData.name)}
                            />

                            <InfoCard 
                                icon={<IconMail className="h-5 w-5" />}
                                label="Email Address"
                                value={userData.email}
                            />

                            <InfoCard 
                                icon={<IconPhone className="h-5 w-5" />}
                                label="Phone Number"
                                value={userData.phone}
                                highlight={userData.phone === "Not Verified" || userData.phone === "Not Available"}
                            />

                            <InfoCard 
                                icon={<IconBuildingSkyscraper className="h-5 w-5" />}
                                label="Organization Type"
                                value={capitalizeFirst(userData.orgType)}
                            />

                            <InfoCard 
                                icon={<IconCalendar className="h-5 w-5" />}
                                label="Joined Lireons On"
                                // The value is passed here, formatted by the helper function above
                                value={formatDate(userData.joinedDate)}
                                fullWidth
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Info Cards
const InfoCard = ({ icon, label, value, highlight, fullWidth }: { icon: any, label: string, value: string, highlight?: boolean, fullWidth?: boolean }) => {
    return (
        <div className={cn(
            "p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4",
            "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-800",
            "hover:border-cyan-500/30 hover:shadow-sm dark:hover:shadow-none",
            fullWidth ? "md:col-span-2" : ""
        )}>
            <div className={cn(
                "p-3 rounded-xl flex items-center justify-center",
                "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border border-gray-100 dark:border-slate-700"
            )}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    {label}
                </p>
                <p className={cn(
                    "text-base font-semibold",
                    highlight ? "text-amber-500 italic" : "text-neutral-900 dark:text-white"
                )}>
                    {value}
                </p>
            </div>
        </div>
    );
};