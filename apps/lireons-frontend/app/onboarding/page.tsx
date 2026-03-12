"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, Globe, Phone, MapPin, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "tier_shared";
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
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

  // Auto-generate subdomain from academy name
  useEffect(() => {
    if (formData.orgName && !formData.subdomain) {
      setFormData(prev => ({
        ...prev,
        subdomain: prev.orgName.toLowerCase().replace(/[^a-z0-9]/g, '')
      }));
    }
  }, [formData.orgName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Hit your NestJS backend to create TenantOwner & TenantOrganization (Status: PENDING)
    // 2. NestJS returns a Stripe Checkout Session URL
    // 3. Router pushes to Stripe URL
    
    console.log("Submitting to backend:", formData);
    // Mocking the redirect to payment
    router.push(`/checkout?plan=${plan}`); 
  };

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
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                      placeholder="+91 9876543210"
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
                      onChange={(e:any) => handleChange(e)}
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
                        className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Proceed to Payment
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