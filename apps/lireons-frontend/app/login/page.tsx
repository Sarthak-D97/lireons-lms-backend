"use client";
import React, { JSX, useState, FormEvent, useEffect } from "react";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "motion/react";
import Link from "next/link";
import { useSession, signIn } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function LoginPage(): JSX.Element {
    const { status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/onboarding");
            router.refresh();
        }
    }, [status, router]);

    const handleCredentialsLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "CredentialsSignin") {
                    setError("Invalid email or password. Please try again.");
                } else {
                    setError("Unable to sign in. Please try again later.");
                }
                // Suppress console error for expected auth failures to avoid confusion
                console.warn("Login attempt failed:", result.error);
            } else if (result?.ok) {
                router.push("/onboarding");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="bg-slate-950 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <LampContainer className="min-h-screen w-full pt-50">
            <motion.div
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mt-46 bg-linear-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl w-full md:w-1500 max-w-md shadow-2xl relative z-50 mx-4 md:mx-0"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 text-sm">
                        Login to your Lireons
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-center gap-3"
                    >
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-300">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            placeholder="instructor@academy.com"
                            className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-2.5 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <Link href="./passforgot" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            placeholder="••••••••"
                            className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-2.5 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg shadow-cyan-500/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing In..." : "Sign In to Dashboard"}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 border-t border-slate-700" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">or continue with</span>
                        <div className="flex-1 border-t border-slate-700" />
                    </div>
                   <div className="mt-4 flex flex-col gap-3">
                            <div className="w-full">
                                <OAuthButton provider="google" label="Google" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <OAuthButton provider="github" label="GitHub" />
                                <OAuthButton provider="linkedin" label="LinkedIn" />
                                <OAuthButton provider="facebook" label="Facebook" />
                            </div>
                        </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-cyan-400 hover:underline">
                        Register
                    </Link>
                </p>
            </motion.div>
        </LampContainer>
    );
}

function OAuthButton({ provider, label }: { provider: string; label: string }) {
    const API_URL = process.env.NEST_PUBLIC_API_URL || "http://localhost:4000";
    return (
       <button
            type="button"
            onClick={() => { window.location.href = `${API_URL}/api/auth/oauth/${provider}/start`; }}
            className={`w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors ${provider === "google"
                    ? "py-3 px-6 text-base" 
                    : "py-2.5 px-4 text-sm" 
                }`}
        >
            {provider === "google" && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"> 
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            )}
            {provider === "github" && (
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3z" />
                </svg>
            )}
            {provider === "linkedin" && (
                <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
            )}
            {provider === "facebook" && (
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                </svg>
            )}
            {label}
        </button>
    );
}