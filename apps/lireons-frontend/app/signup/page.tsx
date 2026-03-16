"use client";
import React, { JSX, useState, FormEvent, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "motion/react";
import Link from "next/link";
import { useSession } from "@/lib/session";
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
    const [countryCode, setCountryCode] = useState("+91");
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
            const normalizedPhone = number.replace(/\D/g, "");
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    orgtype,
                    number: normalizedPhone ? `${countryCode}${normalizedPhone}` : undefined,
                }),
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
        router.push("/onboarding");
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
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-24 bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 p-2.5 outline-none"
                                >
                                    {COUNTRY_CODES.map((code) => (
                                        <option key={code} value={code} className="bg-slate-900">
                                            {code}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
                                    placeholder="9876543210"
                                    className="flex-1 bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none"
                                />
                            </div>
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

                <p className="mt-8 text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-cyan-400 hover:underline">
                        Login
                    </Link>
                </p>

                {step === 'signup' && (
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
                )}
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