"use client";
import React, { JSX, useState, FormEvent, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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

export default function SignupPage(): JSX.Element {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Logic States
    const [step, setStep] = useState<'signup' | 'verify'>('signup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form Data States
    const [name, setName] = useState("");
    const [orgtype, setOrgtype] = useState("");
    const [number, setNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(0);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, orgtype, number }),
            });

            const responseData = await response.json();

            if (response.status === 409 ||
                responseData.message?.toLowerCase().includes("exists") ||
                responseData.message?.toLowerCase().includes("registered")) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(responseData.message || "Signup failed");
            }
            setSuccess("OTP sent to your email! Please verify.");
            setStep('verify');
            startResendTimer();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred during signup";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setError("Please enter complete OTP");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "OTP verification failed");
            }

            setSuccess("Email verified successfully! Redirecting...");

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Verification failed";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSocialLogin = async (provider: string) => {
        try {
            await signIn(provider, { callbackUrl: "/login" });
        } catch (err) {
            console.error(`${provider} login error:`, err);
        }
    };
    const handleOTPChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    };

    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setError("");
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) throw new Error("Failed to resend OTP");
            setSuccess("OTP resent successfully!");
            setOtp(["", "", "", "", "", ""]);
            startResendTimer();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    if (status === "loading") {
        return (
            <div className="bg-slate-950 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (status === "authenticated" && session) {
        router.push("/registered-info");
    }

    return (
        <LampContainer className="min-h-screen w-full pt-50">
            <motion.div
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                className="mt-46 bg-linear-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-50"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {step === 'signup' ? "Create Account" : "Verify Email"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {step === 'signup'
                            ? "Join Lireons & start selling courses"
                            : `We sent a code to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                        <p className="text-sm text-green-400">{success}</p>
                    </div>
                )}

                {step === 'signup' ? (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Sarthak"
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Organization Type</label>
                            <select
                                value={orgtype}
                                onChange={(e) => setOrgtype(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                            >
                                <option value="" disabled>Select Type</option>
                                <option value="Individual Educator" className="bg-slate-900">Individual Educator</option>
                                <option value="Coaching Institute" className="bg-slate-900">Coaching Institute</option>
                                <option value="Corporate Training" className="bg-slate-900">Corporate Training</option>
                                <option value="YouTuber / Influencer" className="bg-slate-900">YouTuber / Influencer</option>
                                <option value="Other" className="bg-slate-900">Others</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Phone Number</label>
                            <input
                                type="tel"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="+91 98765 XXXXX"
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="instructor@academy.com"
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg shadow-cyan-500/20 mt-6"
                        >
                            {isLoading ? "Creating Account..." : "Register"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6 mt-4">
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { if (el) otpInputRefs.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                    disabled={isLoading}
                                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white outline-none"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg shadow-cyan-500/20"
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-slate-400">
                                Didn&apos;t receive the code?{" "}
                                {resendTimer > 0 ? (
                                    <span className="font-semibold text-slate-300">
                                        Resend in {resendTimer}s
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={isLoading}
                                        className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep('signup')}
                                className="mt-4 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                ← Change email address
                            </button>
                        </div>
                    </form>
                )}

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-slate-950 px-2 text-slate-400">Or Continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <SocialButton icon={<IconBrandGoogle className="h-5 w-5" />} label="Google" onClick={() => handleSocialLogin('google')} />
                    <SocialButton icon={<IconBrandGithub className="h-5 w-5" />} label="GitHub" onClick={() => handleSocialLogin('github')} />
                    <SocialButton icon={<IconBrandLinkedin className="h-5 w-5" />} label="LinkedIn" onClick={() => handleSocialLogin('linkedin')} />
                    <SocialButton icon={<IconBrandMeta className="h-5 w-5" />} label="Facebook" onClick={() => handleSocialLogin('facebook')} />
                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-cyan-400 hover:underline">
                        Login
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
            title={`Sign up with ${label}`}
        >
            {icon}
        </button>
    );
};