"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "@/lib/session";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
    const [tenantConfigLoading, setTenantConfigLoading] = useState(false);
    const [brandingSaving, setBrandingSaving] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [iconUploading, setIconUploading] = useState(false);
    const [brandingMessage, setBrandingMessage] = useState<string | null>(null);
    const [brandingError, setBrandingError] = useState<string | null>(null);
    const [branding, setBranding] = useState({
        serviceName: "",
        logoUrl: "",
        appName: "",
        packageName: "",
        appIconUrl: "",
    });

    // Redirect if unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const loadTenantConfig = async () => {
            const backendToken = (sessionData as { backendToken?: string } | null)?.backendToken;
            if (status !== "authenticated" || !backendToken) {
                return;
            }

            setTenantConfigLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/tenant/configuration`, {
                    headers: {
                        Authorization: `Bearer ${backendToken}`,
                    },
                });

                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(data?.error?.message || data?.message || "Failed to load tenant branding.");
                }

                setBranding((prev) => ({
                    ...prev,
                    serviceName: data?.settings?.serviceName || prev.serviceName,
                    logoUrl: data?.settings?.logoUrl || "",
                    appName: data?.appSettings?.appName || prev.appName,
                    packageName: data?.appSettings?.packageName || prev.packageName,
                    appIconUrl: data?.appSettings?.appIconUrl || "",
                }));
            } catch (error) {
                setBrandingError(error instanceof Error ? error.message : "Failed to load tenant branding.");
            } finally {
                setTenantConfigLoading(false);
            }
        };

        void loadTenantConfig();
    }, [sessionData, status]);

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

    const backendToken = (sessionData as { backendToken?: string } | null)?.backendToken;

    const handleBrandingUpload = async (
        file: File,
        type: "logo" | "app-icon",
    ) => {
        if (!backendToken) {
            setBrandingError("Your login session is missing or expired. Please login again.");
            return;
        }
        if (!file.type.startsWith("image/")) {
            setBrandingError("Only image files are allowed for uploads.");
            return;
        }

        const isLogo = type === "logo";
        setBrandingError(null);
        setBrandingMessage(null);
        if (isLogo) {
            setLogoUploading(true);
        } else {
            setIconUploading(true);
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            const endpoint = isLogo
                ? `${API_URL}/api/tenant/configuration/upload-logo`
                : `${API_URL}/api/tenant/configuration/upload-app-icon`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${backendToken}`,
                },
                body: formData,
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error?.message || data?.message || "Upload failed.");
            }

            const uploadedUrl = isLogo ? data?.logoUrl : data?.appIconUrl;
            if (!uploadedUrl) {
                throw new Error("Upload succeeded but file URL was not returned.");
            }

            setBranding((prev) => ({
                ...prev,
                ...(isLogo ? { logoUrl: uploadedUrl } : { appIconUrl: uploadedUrl }),
            }));
            setBrandingMessage(isLogo ? "Logo uploaded successfully." : "App icon uploaded successfully.");
        } catch (error) {
            setBrandingError(error instanceof Error ? error.message : "Upload failed.");
        } finally {
            if (isLogo) {
                setLogoUploading(false);
            } else {
                setIconUploading(false);
            }
        }
    };

    const handleSaveBranding = async () => {
        if (!backendToken) {
            setBrandingError("Your login session is missing or expired. Please login again.");
            return;
        }
        if (!branding.serviceName.trim()) {
            setBrandingError("Service name is required.");
            return;
        }
        if (!branding.appName.trim() || !branding.packageName.trim()) {
            setBrandingError("App name and package name are required.");
            return;
        }

        setBrandingSaving(true);
        setBrandingError(null);
        setBrandingMessage(null);

        try {
            const payload = {
                settings: {
                    serviceName: branding.serviceName.trim(),
                    logoUrl: branding.logoUrl.trim() || undefined,
                },
                appSettings: {
                    appName: branding.appName.trim(),
                    packageName: branding.packageName.trim(),
                    appIconUrl: branding.appIconUrl.trim() || undefined,
                },
            };

            const response = await fetch(`${API_URL}/api/tenant/configuration`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${backendToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error?.message || data?.message || "Failed to save branding settings.");
            }

            setBrandingMessage("Branding settings saved.");
        } catch (error) {
            setBrandingError(error instanceof Error ? error.message : "Failed to save branding settings.");
        } finally {
            setBrandingSaving(false);
        }
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
                    <div className="h-32 md:h-48 w-full bg-linear-to-r from-cyan-500 to-blue-600 relative">
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

                        <div className="h-px w-full bg-gray-100 dark:bg-slate-800 my-8"></div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Branding Assets</h3>

                            {tenantConfigLoading ? (
                                <p className="text-sm text-neutral-500 dark:text-slate-400">Loading branding settings...</p>
                            ) : null}

                            {brandingError ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                                    {brandingError}
                                </div>
                            ) : null}

                            {brandingMessage ? (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    {brandingMessage}
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Service Name</label>
                                    <input
                                        type="text"
                                        value={branding.serviceName}
                                        onChange={(e) => setBranding((prev) => ({ ...prev, serviceName: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">App Name</label>
                                    <input
                                        type="text"
                                        value={branding.appName}
                                        onChange={(e) => setBranding((prev) => ({ ...prev, appName: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Organization Logo URL</label>
                                    <input
                                        type="url"
                                        value={branding.logoUrl}
                                        onChange={(e) => setBranding((prev) => ({ ...prev, logoUrl: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    />
                                    <label className="mt-2 inline-block cursor-pointer rounded-md border border-gray-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                                        {logoUploading ? "Uploading..." : "Upload Logo"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={logoUploading}
                                            onChange={(event) => {
                                                const selected = event.target.files?.[0];
                                                if (selected) {
                                                    void handleBrandingUpload(selected, "logo");
                                                }
                                                event.currentTarget.value = "";
                                            }}
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">App Icon URL</label>
                                    <input
                                        type="url"
                                        value={branding.appIconUrl}
                                        onChange={(e) => setBranding((prev) => ({ ...prev, appIconUrl: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    />
                                    <label className="mt-2 inline-block cursor-pointer rounded-md border border-gray-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                                        {iconUploading ? "Uploading..." : "Upload App Icon"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={iconUploading}
                                            onChange={(event) => {
                                                const selected = event.target.files?.[0];
                                                if (selected) {
                                                    void handleBrandingUpload(selected, "app-icon");
                                                }
                                                event.currentTarget.value = "";
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    value={branding.packageName}
                                    onChange={(e) => setBranding((prev) => ({ ...prev, packageName: e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, "") }))}
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    placeholder="com.yourcompany.appname"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveBranding}
                                disabled={brandingSaving}
                                className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
                            >
                                {brandingSaving ? "Saving..." : "Save Branding"}
                            </button>
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