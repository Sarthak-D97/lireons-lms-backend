"use client";
import React, { JSX, useState, FormEvent, useEffect } from "react";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "motion/react";
import {
    IconBrandGoogle,
    IconBrandGithub,
    IconBrandLinkedin,
    IconBrandMeta
} from "@tabler/icons-react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
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
            router.push("/registered-info");
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
                router.push("/registered-info");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        try {
            await signIn(provider, { callbackUrl: "/" });
        } catch (err) {
            console.error(`${provider} login error:`, err);
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
                // UPDATED: w-full for mobile, md:w-1500 restores your desktop width
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

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-slate-950 px-2 text-slate-400">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <SocialButton
                        icon={<IconBrandGoogle className="h-5 w-5" />}
                        label="Google"
                        onClick={() => handleSocialLogin("google")}
                    />
                    <SocialButton
                        icon={<IconBrandGithub className="h-5 w-5" />}
                        label="GitHub"
                        onClick={() => handleSocialLogin("github")}
                    />
                    <SocialButton
                        icon={<IconBrandLinkedin className="h-5 w-5" />}
                        label="LinkedIn"
                        onClick={() => handleSocialLogin("linkedin")}
                    />
                    <SocialButton
                        icon={<IconBrandMeta className="h-5 w-5" />}
                        label="Facebook"
                        onClick={() => handleSocialLogin("facebook")}
                    />
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

const SocialButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all"
            title={`Sign in with ${label}`}
        >
            {icon}
        </button>
    );
};