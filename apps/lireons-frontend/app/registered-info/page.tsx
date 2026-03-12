"use client";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
    IconBuildingSkyscraper,
    IconMail,
    IconPhone,
    IconUser,
    IconCircleCheck,
    IconArrowLeft
} from "@tabler/icons-react";
import { useSession } from 'next-auth/react'
import { Merienda } from 'next/font/google';
import { cn } from "@/lib/utils";

const merienda = Merienda({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-merienda',
})

interface UserDatas {
    name: string;
    email: string;
    number: string;
    orgtype: string;
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

export const capitalizeFirst = (str: string | undefined | null) => {
    if (!str) return "Not Available";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function AlreadyRegisteredPage() {
    const { data: sessionData, status } = useSession();
    const session = sessionData as CustomSession | null;

    const userData = {
        name: session?.userdatas?.name || "Not Available",
        email: session?.userdatas?.email || "Not Available",
        phone: session?.userdatas?.number || "Not Available",
        orgType: session?.userdatas?.orgtype || "Not Available",
        status: status
    };

    return (
        // 1. Page Background: Gray-50 for Light | Slate-950 for Dark
        <div className="h-screen w-full bg-gray-50 dark:bg-slate-950 relative flex flex-col items-center justify-center antialiased overflow-hidden transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl p-4"
            >
                {/* 2. Main Card: White/Shadow for Light | Slate-900/Blur for Dark */}
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-colors">

                    {/* Header Section */}
                    {/* Header Gradient: Cyan-50 for Light | Cyan-500/10 for Dark */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 border-b border-gray-200 dark:border-slate-800 p-8 text-center transition-colors">
                        <div className="mx-auto w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 border border-cyan-200 dark:border-cyan-500/50 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-colors">
                            <IconCircleCheck className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
                            Account Already Exists
                        </h1>
                        <p className="text-neutral-600 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto transition-colors">
                            You are already registered in the <span className={`${merienda.className} text-cyan-700 dark:text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors`}>Lireons</span> ecosystem.
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8">
                        {/* Message Box: Gray-50/Border-Gray-200 for Light | Slate-800/Border-Slate-700 for Dark */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-center transition-colors">
                            <p className="text-neutral-600 dark:text-slate-300 text-sm leading-relaxed transition-colors">
                                &quot;Our records indicate that your organization is already onboarded.
                                Our sales team has received your inquiry and will connect with you shortly to assist with the next steps.&quot;
                            </p>
                        </div>

                        {/* User Details Grid */}
                        <div>
                            <h3 className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-1 transition-colors">
                                Registered Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem
                                    icon={<IconUser className="w-5 h-5" />}
                                    label="Full Name"
                                    value={capitalizeFirst(userData.name)}
                                />
                                <InfoItem
                                    icon={<IconMail className="w-5 h-5" />}
                                    label="Email Address"
                                    value={userData.email}
                                />
                                <InfoItem
                                    icon={<IconPhone className="w-5 h-5" />}
                                    label="Phone Number"
                                    value={userData.phone}
                                />
                                <InfoItem
                                    icon={<IconBuildingSkyscraper className="w-5 h-5" />}
                                    label="Organization Type"
                                    value={capitalizeFirst(userData.orgType)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <Link
                                href="/"
                                // Button: White/Border-Gray for Light | Slate-800/Border-Slate-700 for Dark
                                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-neutral-700 dark:text-white py-3 px-4 rounded-lg border border-gray-300 dark:border-slate-700 transition-all font-medium text-sm shadow-sm dark:shadow-none"
                            >
                                <IconArrowLeft className="w-4 h-4" />
                                Return to Home
                            </Link>
                            <Link
                                href="/contact"
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/20 transition-all font-medium text-sm"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
                <p className="text-center text-neutral-400 dark:text-slate-600 text-xs mt-6 transition-colors">
                    &copy; {new Date().getFullYear()} Lireons. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => {
    return (
        // Info Item: White/Border-Gray for Light | Slate-900/Border-Slate-800 for Dark
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/50 hover:border-cyan-500/30 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
            <div className="mt-0.5 text-neutral-400 dark:text-slate-400 transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mb-0.5 transition-colors">{label}</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-slate-200 transition-colors">{value}</p>
            </div>
        </div>
    )
};