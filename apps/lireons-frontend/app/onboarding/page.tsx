"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session";
import { Building2, Globe, Phone, MapPin, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState("+91");
  const [formData, setFormData] = useState({
    // Owner Details
    phone: "",
    billingAddress: "",
    taxId: "",
    // Organization Details
    orgName: "",
    orgType: "ACADEMY",
    subdomain: "",
    customDomain: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Auto-generate subdomain from academy name
  useEffect(() => {
    if (formData.orgName && !formData.subdomain) {
      setFormData(prev => ({
        ...prev,
        subdomain: prev.orgName.toLowerCase().replace(/[^a-z0-9]/g, '')
      }));
    }
  }, [formData.orgName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.backendToken) {
      setError("Your login session is missing or expired. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedPhone = formData.phone.replace(/\D/g, "");
      const payload = {
        orgName: formData.orgName.trim(),
        orgType: formData.orgType,
        subdomain: formData.subdomain.trim().toLowerCase(),
        customDomain: formData.customDomain.trim() || undefined,
        status: "PENDING",
        phone: normalizedPhone ? `${countryCode}${normalizedPhone}` : undefined,
        billingAddress: formData.billingAddress.trim() || undefined,
        taxId: formData.taxId.trim() || undefined,
      };

      const response = await fetch(`${API_URL}/api/tenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.message || "Failed to create tenant. Please try again.";
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
      }

      setSuccess("Academy created successfully. Redirecting...");
      router.push("/profile");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create tenant.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200">
        Checking your account...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Step Indicator */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Setup your Academy
        </h2>
        <div className="flex items-center justify-center mt-4 space-x-4">
            <StepIcon stepNum={1} currentStep={step} label="Owner" />
            <div className={cn("h-0.5 w-12", step >= 2 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
            <StepIcon stepNum={2} currentStep={step} label="Academy" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          <form className="space-y-6" onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                {success}
              </div>
            )}
            
            {/* STEP 1: OWNER DETAILS */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (From Account)</label>
                  <input
                    disabled
                    value={session?.user?.email || "loading..."}
                    className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-500 cursor-not-allowed sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number *</label>
                  <div className="mt-1 flex gap-2 rounded-md shadow-sm">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-2 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                    >
                      {COUNTRY_CODES.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      className="block w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                    placeholder="For B2B tax invoices"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Billing Address</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <textarea
                      name="billingAddress"
                      rows={3}
                      value={formData.billingAddress}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                      placeholder="123 Education Street, City, State, ZIP"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Continue to Academy Setup <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {/* STEP 2: ACADEMY DETAILS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Academy Name *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="orgName"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                      placeholder="e.g., CodeMasters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Free Subdomain *</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="subdomain"
                      required
                      value={formData.subdomain}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-none rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white text-right"
                      placeholder="codemasters"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 sm:text-sm">
                      .lireons.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Custom Domain (Optional)</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="customDomain"
                      value={formData.customDomain}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                      placeholder="www.myacademy.com"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">You can configure DNS settings later in the dashboard.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 flex justify-center py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </button>
                    <button
                        type="submit"
                      disabled={loading}
                        className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      {loading ? "Creating Academy..." : "Create Academy"}
                    </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const StepIcon = ({ stepNum, currentStep, label }: { stepNum: number, currentStep: number, label: string }) => {
    const isCompleted = currentStep > stepNum;
    const isActive = currentStep === stepNum;

    return (
        <div className="flex flex-col items-center">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : 
                isActive ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : 
                "border-slate-300 dark:border-slate-700 text-slate-400"
            )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
            </div>
            <span className={cn(
                "text-xs mt-1 font-medium",
                isActive || isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400"
            )}>{label}</span>
        </div>
    )
}