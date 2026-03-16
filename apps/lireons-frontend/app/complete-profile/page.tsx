"use client";
import React, { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];
import { useRouter } from "next/navigation";
import { IconPhone, IconBuildingSkyscraper } from "@tabler/icons-react";
import { useSession } from "@/lib/session";

export default function CompleteProfilePage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [countryCode, setCountryCode] = useState("+91");
    const [formData, setFormData] = useState({
        phone: "",
        orgType: "K-12 Schools",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const normalizedPhone = formData.phone.replace(/\D/g, "");
            const fullPhone = normalizedPhone ? `${countryCode}${normalizedPhone}` : "";
            const res = await fetch(`${API_URL}/api/users/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    phone: fullPhone,
                }),
            });

            if (!res.ok) throw new Error("Failed to save data");
            await update({
                userdatas: {
                    number: fullPhone,
                    orgtype: formData.orgType
                }
            });
            const queryParams = new URLSearchParams({
                name: session?.user?.name || "",
                email: session?.user?.email || "",
                orgType: formData.orgType,
                phone: fullPhone
            }).toString();

            router.replace(`/onboarding?${queryParams}`);

        } catch (error) {
            console.error(error);
            alert("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // 1. Page Background: Gray-50 for Light | Slate-950 for Dark
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">

            {/* 2. Card: White/Shadow for Light | Slate-900/Border for Dark */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-xl dark:shadow-none transition-colors duration-300">
                {/* Heading: Neutral-900 (Light) | White (Dark) */}
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">Final Step</h1>
                {/* Subtext: Neutral-600 (Light) | Slate-400 (Dark) */}
                <p className="text-neutral-600 dark:text-slate-400 mb-6 transition-colors">
                    To ensure the best experience, we verify all organizations manually.
                    Please provide your details to proceed.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-neutral-700 dark:text-slate-400 text-sm mb-1 transition-colors">Phone Number</label>
                        {/* Input Container: Gray-50/Border-Gray-200 (Light) | Slate-800/Border-Slate-700 (Dark) */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 border border-gray-200 dark:border-slate-700 focus-within:border-cyan-600 dark:focus-within:border-cyan-500 transition-colors">
                            <IconPhone className="text-neutral-400 dark:text-slate-400 w-5 h-5 transition-colors" />
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="bg-gray-50 dark:bg-slate-800 text-neutral-900 dark:text-white py-3 focus:outline-none rounded-lg transition-colors cursor-pointer"
                            >
                                {COUNTRY_CODES.map((code) => (
                                    <option key={code} value={code} className="bg-white dark:bg-slate-900">
                                        {code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                required
                                // Input Text: Dark (Light) | White (Dark)
                                className="bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 p-3 w-full focus:outline-none transition-colors"
                                placeholder="Enter your mobile number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-neutral-700 dark:text-slate-400 text-sm mb-1 transition-colors">Organization Type</label>
                        <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-lg px-3 border border-gray-200 dark:border-slate-700 focus-within:border-cyan-600 dark:focus-within:border-cyan-500 transition-colors">
                            <IconBuildingSkyscraper className="text-neutral-400 dark:text-slate-400 w-5 h-5 transition-colors" />
                            <select
                                // Select Bg/Text: Match container
                                className="bg-gray-50 dark:bg-slate-800 text-neutral-900 dark:text-white p-3 w-full focus:outline-none rounded-lg transition-colors cursor-pointer"
                                value={formData.orgType}
                                onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                            >
                                <option value="Individual Educator" className="bg-white dark:bg-slate-900">Individual Educator</option>
                                <option value="Coaching Institute" className="bg-white dark:bg-slate-900">Coaching Institute</option>
                                <option value="Corporate Training" className="bg-white dark:bg-slate-900">Corporate Training</option>
                                <option value="YouTuber / Influencer" className="bg-white dark:bg-slate-900">YouTuber / Influencer</option>
                                <option value="Other" className="bg-white dark:bg-slate-900">Others</option>
                            </select>
                        </div>
                    </div>

                    <button
                        aria-label="Toggle menu"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-md dark:shadow-none"
                    >
                        {loading ? "Saving..." : "Submit for Approval"}
                    </button>
                </form>
            </div>
        </div>
    );
}