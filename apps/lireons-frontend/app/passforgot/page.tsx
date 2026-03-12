"use client";
import React, { JSX, useState, FormEvent, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "motion/react";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage(): JSX.Element {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleRequestReset = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = { message: text }; }

            if (!response.ok) {
                throw new Error(data.message || "Failed to send reset code");
            }

            setSuccess("Reset code sent to your email!");
            setStep('verify');
            startResendTimer();
        } catch (err) {
            console.error("Full error:", err);
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
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
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
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
                throw new Error(data.message || "Invalid OTP");
            }

            setSuccess("OTP verified! Set your new password.");
            setStep('reset');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Verification failed";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otp: otp.join(""),
                    newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Password reset failed");
            }

            setSuccess("Password reset successful! Redirecting to login...");
            setTimeout(() => router.push("./login"), 2000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Reset failed";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to resend OTP");
            }

            setSuccess("OTP resent successfully!");
            setOtp(["", "", "", "", "", ""]);
            startResendTimer();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to resend OTP";
            setError(errorMessage);
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
                className="mt-46 bg-linear-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-50"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {step === 'email' && "Forgot Password?"}
                        {step === 'verify' && "Verify Code"}
                        {step === 'reset' && "Reset Password"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {step === 'email' && "Don't worry! It happens. Please enter the email associated with your account."}
                        {step === 'verify' && `We've sent a 6-digit code to ${email}`}
                        {step === 'reset' && "Choose a strong password for your account"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-400 text-center">{success}</p>
                    </div>
                )}

                {/* --- Step 1: Email Form --- */}
                {step === 'email' && (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-300">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                placeholder="admin@lireons.com"
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-2.5 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg shadow-cyan-500/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending Code..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                {/* --- Step 2: Verify OTP Form --- */}
                {step === 'verify' && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
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
                                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all outline-none disabled:opacity-50"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg shadow-cyan-500/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-slate-400">
                                Didn&apos;t receive the code?{" "}
                                {resendTimer > 0 ? (
                                    <span className="font-semibold text-slate-200">
                                        Resend in {resendTimer}s
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={isLoading}
                                        className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="mt-4 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                ← Change email address
                            </button>
                        </div>
                    </form>
                )}

                {/* --- Step 3: Reset Password Form --- */}
                {step === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={isLoading}
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-2.5 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
                            />
                            <p className="text-xs text-slate-400">Must be at least 8 characters</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-2.5 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg shadow-cyan-500/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Resetting Password..." : "Reset Password"}
                        </button>
                    </form>
                )}

                {/* Footer Section */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-slate-950 px-2 text-slate-400">Remember your password?</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Link
                        href="./login"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <IconArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </LampContainer>
    );
}