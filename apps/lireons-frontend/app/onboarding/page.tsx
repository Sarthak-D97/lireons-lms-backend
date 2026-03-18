"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session";
import { Building2, Check, Copy, Globe, MapPin, CheckCircle2, ChevronRight, ChevronLeft, Palette, Smartphone, CreditCard, Server, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];

type Plan = {
  id: string;
  slug?: string | null;
  name: string;
  billingCycle: string;
  price: number | string;
  maxStudentsAllowed: number;
  maxStorageGb: number;
  hasWhiteLabelApp: boolean;
};

type PricingPlanCard = {
  slug: string;
  name: string;
  badge: string;
  description: string;
  priceLabel: string;
  features: string[];
};

const PRICING_PLAN_CARDS: PricingPlanCard[] = [
  {
    slug: "tier_shared",
    name: "Shared Infrastructure",
    badge: "For Small Academies",
    description: "Launch fast with our shared, highly optimized cloud architecture.",
    priceLabel: "₹5,000/month",
    features: [
      "Up to 2,000 Students",
      "Course & Mock Test Engine",
      "Razorpay & Stripe Integration",
      "Basic Web DRM",
      "Managed Infrastructure",
      "Email Support",
    ],
  },
  {
    slug: "tier_dedicated",
    name: "Dedicated Cloud",
    badge: "Most Popular",
    description: "High performance with dedicated servers for serious educators.",
    priceLabel: "₹25,000/month",
    features: [
      "Up to 50,000 Students",
      "Dedicated Server/VPS",
      "Bank-Grade Video DRM",
      "White-labeled Android App",
      "Custom Integrations",
      "Priority 24/7 Support",
      "99.9% Uptime SLA",
    ],
  },
  {
    slug: "tier_enterprise",
    name: "White-Label Enterprise",
    badge: "For Large Institutions",
    description: "Complete brand dominance with iOS and massive scale.",
    priceLabel: "₹75,000/month",
    features: [
      "Unlimited Students",
      "Data in your own AWS account",
      "White-labeled iOS App",
      "Multiple Campus Support",
      "Custom Analytics Dashboard",
      "On-premise deployment option",
      "Dedicated Account Manager",
    ],
  },
];

type DomainSetupResponse = {
  customDomain: string;
  status: string;
  dnsInstructions: {
    cname: { host: string; value: string };
    txt: { host: string; value: string };
  };
};

type CreateTenantResult = {
  tenant?: {
    id: string;
    orgName: string;
    subdomain: string;
    customDomain?: string | null;
    status: string;
  };
  payment?: {
    status: string;
    transactionId: string;
    invoiceId: string;
  };
};

type PaymentInitiationResponse = {
  orderId: string;
  keyId?: string;
  amount?: number;
  currency?: string;
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key?: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayHandlerResponse) => Promise<void>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

interface RazorpayCheckout {
  open(): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState("+91");
  const [formData, setFormData] = useState({
    phone: "",
    billingAddress: "",
    taxId: "",
    orgName: "",
    orgType: "ACADEMY",
    subdomain: "",
    customDomain: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("tier_shared");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [domainSetup, setDomainSetup] = useState<DomainSetupResponse | null>(null);
  const [domainVerifyLoading, setDomainVerifyLoading] = useState(false);
  const [copiedDnsField, setCopiedDnsField] = useState<string | null>(null);
  const [createdTenant, setCreatedTenant] = useState<CreateTenantResult | null>(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [configData, setConfigData] = useState({
    serviceName: "",
    logoUrl: "",
    primaryColor: "#4F46E5",
    secondaryColor: "#818CF8",
    fontFamily: "Inter",
    fontSize: "16",
    appName: "",
    packageName: "",
    appIconUrl: "",
    allowOfflineDownload: false,
    maxDevicesPerUser: 2,
  });

  const selectedPlan = PRICING_PLAN_CARDS.find(
    (plan) => plan.slug === selectedPlanSlug,
  );
  const selectedBackendPlan = plans.find(
    (plan) => plan.slug?.trim().toLowerCase() === selectedPlanSlug,
  );
  const preferredPlanSlug = searchParams.get("plan")?.trim().toLowerCase() || "";

  const fetchPlans = useCallback(async (token: string, withSpinner: boolean = true) => {
    if (!token) return;

    if (withSpinner) {
      setLoadingPlans(true);
    }

    try {
      const response = await fetch(`${API_URL}/api/tenant/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch plans: ${response.status}`);
        throw new Error("Failed to fetch plans");
      }

      const data = (await response.json()) as Plan[];
      setPlans(data);
      setSelectedPlanSlug((prev) => {
        if (data.length === 0) {
          return preferredPlanSlug || prev || "tier_shared";
        }

        const availableSlugs = new Set(
          data
            .map((plan) => plan.slug?.trim().toLowerCase())
            .filter((slug): slug is string => Boolean(slug)),
        );

        if (preferredPlanSlug) {
          if (availableSlugs.has(preferredPlanSlug)) return preferredPlanSlug;
        }

        if (prev && availableSlugs.has(prev)) return prev;

        const firstPricingSlug = PRICING_PLAN_CARDS.find((plan) =>
          availableSlugs.has(plan.slug),
        )?.slug;
        return firstPricingSlug || "tier_shared";
      });
    } catch (err) {
      console.error("Error loading plans:", err);
      setPlans([]);
    } finally {
      if (withSpinner) {
        setLoadingPlans(false);
      }
    }
  }, [preferredPlanSlug]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.backendToken) {
      void fetchPlans(session.backendToken, true);
    }
  }, [session?.backendToken, status, fetchPlans]);

  useEffect(() => {
    if (formData.orgName && !formData.subdomain) {
      setFormData(prev => ({
        ...prev,
        subdomain: prev.orgName.toLowerCase().replace(/[^a-z0-9]/g, '')
      }));
    }
  }, [formData.orgName, formData.subdomain]);

  useEffect(() => {
    if (step !== 6 || !formData.customDomain.trim() || !session?.backendToken) {
      return;
    }

    if (domainSetup) {
      void handleLoadDomainStatus();
      return;
    }

    void startCustomDomainSetup(formData.customDomain);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== 4) return;
    setConfigData(prev => ({
      ...prev,
      serviceName: prev.serviceName || formData.orgName,
      appName: prev.appName || formData.orgName,
      packageName: prev.packageName || `com.lireons.${formData.subdomain || formData.orgName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyDnsValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedDnsField(key);
      window.setTimeout(() => {
        setCopiedDnsField((current) => (current === key ? null : current));
      }, 1800);
    } catch {
      setError("Unable to copy DNS value. Please copy it manually.");
    }
  };

  const handleNext = () => {
    setError(null);
    setStep(step + 1);
  };
  
  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const startCustomDomainSetup = async (domainInput: string) => {
    const customDomain = domainInput.trim().toLowerCase();
    if (!customDomain || !session?.backendToken) return;

    try {
      const startRes = await fetch(`${API_URL}/api/tenant/custom-domain/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify({ customDomain }),
      });

      if (!startRes.ok) {
        const data = await startRes.json().catch(() => null);
        throw new Error(data?.error?.message || data?.message || "Domain setup could not be initialized.");
      }

      const setupData = (await startRes.json()) as DomainSetupResponse;
      setDomainSetup(setupData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Custom domain setup failed.";
      setError(message);
    }
  };

  const handleVerifyDomain = async () => {
    if (!session?.backendToken || !domainSetup) return;
    setDomainVerifyLoading(true);
    setError(null);

    try {
      const verifyRes = await fetch(`${API_URL}/api/tenant/custom-domain/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
        },
      });

      const data = await verifyRes.json().catch(() => null);

      if (!verifyRes.ok) {
        throw new Error(data?.error?.message || data?.message || "Domain verification failed.");
      }

      setDomainSetup((prev) =>
        prev
          ? {
              ...prev,
              status: data?.status || prev.status,
            }
          : prev,
      );

      if (data?.status === "VERIFIED") {
        setSuccess("Custom domain verified successfully.");
        setTimeout(() => { setSuccess(null); setStep(7); }, 1500);
      } else {
        const errorText = Array.isArray(data?.verification?.errors)
          ? data.verification.errors.join(", ")
          : "DNS records are not fully propagated yet. This can take a few minutes.";
        setError(errorText);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Domain verification failed.";
      setError(message);
    } finally {
      setDomainVerifyLoading(false);
    }
  };

  const handleLoadDomainStatus = async () => {
    if (!session?.backendToken) return;
    try {
      const response = await fetch(`${API_URL}/api/tenant/custom-domain/status`, {
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.configured) return;

      setDomainSetup({
        customDomain: data.customDomain,
        status: data.status,
        dnsInstructions: data.dnsInstructions,
      });
    } catch {
      // no-op
    }
  };

  const handleAssetUpload = async (
    file: File,
    type: "logo" | "app-icon",
  ) => {
    if (!session?.backendToken) {
      setError("Your login session is missing or expired. Please login again.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for logo and app icon uploads.");
      return;
    }

    const isLogo = type === "logo";
    if (isLogo) {
      setLogoUploading(true);
    } else {
      setIconUploading(true);
    }
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = isLogo
        ? `${API_URL}/api/tenant/configuration/upload-logo`
        : `${API_URL}/api/tenant/configuration/upload-app-icon`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.error?.message || data?.message || "File upload failed.",
        );
      }

      const uploadedUrl = isLogo ? data?.logoUrl : data?.appIconUrl;
      if (!uploadedUrl) {
        throw new Error("Upload succeeded but URL was not returned by API.");
      }

      setConfigData((prev) => ({
        ...prev,
        ...(isLogo ? { logoUrl: uploadedUrl } : { appIconUrl: uploadedUrl }),
      }));
      setSuccess(
        isLogo
          ? "Organization logo uploaded and URL auto-filled."
          : "App icon uploaded and URL auto-filled.",
      );
      setTimeout(() => setSuccess(null), 1800);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "File upload failed.";
      setError(message);
    } finally {
      if (isLogo) {
        setLogoUploading(false);
      } else {
        setIconUploading(false);
      }
    }
  };

  const handleDeploy = async () => {
    if (!session?.backendToken) {
      setError("Your login session is missing or expired. Please login again.");
      return;
    }

    setDeployLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/tenant/deploy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
        },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || "Failed to deploy tenant");
      }

      setSuccess("Deployment successful! Redirecting to your dashboard...");
      setTimeout(() => router.push("/profile"), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deployment failed.";
      setError(message);
    } finally {
      setDeployLoading(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.backendToken) {
      setError("Your login session is missing or expired. Please login again.");
      return;
    }
    if (!configData.serviceName.trim()) {
      setError("Brand name is required.");
      return;
    }
    if (!configData.appName.trim() || !configData.packageName.trim()) {
      setError("App name and package name are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedPhone = formData.phone.replace(/\D/g, "");
      const tenantPayload = {
        orgName: formData.orgName.trim(),
        orgType: formData.orgType,
        subdomain: formData.subdomain.trim().toLowerCase(),
        customDomain: formData.customDomain.trim() || undefined,
        status: "PENDING",
        phone: normalizedPhone ? `${countryCode}${normalizedPhone}` : undefined,
        billingAddress: formData.billingAddress.trim() || undefined,
        taxId: formData.taxId.trim() || undefined,
      };

      const tenantRes = await fetch(`${API_URL}/api/tenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify(tenantPayload),
      });

      if (!tenantRes.ok) {
        const data = await tenantRes.json().catch(() => null);
        const message = data?.error?.message || data?.message || "Failed to create academy. Please try again.";
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
      }

      const tenantData = (await tenantRes.json()) as CreateTenantResult;
      setCreatedTenant(tenantData);

      if (formData.customDomain.trim()) {
        await startCustomDomainSetup(formData.customDomain);
      }

      const configPayload = {
        settings: {
          serviceName: configData.serviceName.trim(),
          logoUrl: configData.logoUrl.trim() || undefined,
          primaryColor: configData.primaryColor || undefined,
          secondaryColor: configData.secondaryColor || undefined,
          fontFamily: configData.fontFamily || undefined,
          fontSize: configData.fontSize || undefined,
        },
        appSettings: {
          appName: configData.appName.trim(),
          packageName: configData.packageName.trim(),
          appIconUrl: configData.appIconUrl.trim() || undefined,
          appStatus: "BUILDING",
          allowOfflineDownload: configData.allowOfflineDownload,
          maxDevicesPerUser: configData.maxDevicesPerUser,
        },
      };

      const configRes = await fetch(`${API_URL}/api/tenant/configuration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify(configPayload),
      });

      if (!configRes.ok) {
        const data = await configRes.json().catch(() => null);
        const message = data?.error?.message || data?.message || "Failed to save configuration.";
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
      }

      if (formData.customDomain.trim()) {
        setSuccess("Academy setup complete. Proceed to DNS configuration.");
        setTimeout(() => { setSuccess(null); setStep(6); }, 1000);
      } else {
        setSuccess("Academy setup complete. Proceeding to review...");
        setTimeout(() => { setSuccess(null); setStep(6); }, 1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Setup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.backendToken) {
      setError("Your login session is missing or expired. Please login again.");
      return;
    }

    if (!selectedPlanSlug) {
      setError("Please select one of the 3 available plans before proceeding.");
      return;
    }

    if (!selectedBackendPlan?.id) {
      setError("Plans are syncing. Please wait a moment and click Refresh Plans.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const loadRazorpayScript = async () => {
        if (window.Razorpay) return;

        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(
            'script[data-razorpay-checkout]'
          ) as HTMLScriptElement | null;

          if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener(
              'error',
              () => reject(new Error('Failed to load Razorpay script')),
              { once: true },
            );
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.dataset.razorpayCheckout = 'true';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay script'));
          document.body.appendChild(script);
        });
      };

      const openRazorpayCheckout = async (invoiceId: string) => {
        const initiateResponse = await fetch(`${API_URL}/api/core-saas/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.backendToken}`,
          },
          body: JSON.stringify({ invoiceId }),
        });

        if (!initiateResponse.ok) {
          const data = await initiateResponse.json().catch(() => null);
          const message = data?.error?.message || data?.message || 'Failed to initiate payment';
          throw new Error(Array.isArray(message) ? message.join(', ') : message);
        }

        const paymentData = (await initiateResponse.json()) as PaymentInitiationResponse;

        if (!paymentData.orderId) {
          throw new Error('Payment order was not created. Please try again.');
        }

        await loadRazorpayScript();

        if (!window.Razorpay) {
          throw new Error('Razorpay script is not loaded. Please refresh and try again.');
        }

        const checkoutKey = paymentData.keyId || process.env.RAZORPAY_KEY_ID;
        const checkoutAmount = Math.round(Number(paymentData.amount || 0) * 100);

        if (!checkoutKey) {
          throw new Error('Razorpay key is missing. Please contact support.');
        }

        if (!checkoutAmount || checkoutAmount <= 0) {
          throw new Error('Invalid payment amount. Please try again.');
        }

        await new Promise<void>((resolve, reject) => {
          const options: RazorpayCheckoutOptions = {
            key: checkoutKey,
            amount: checkoutAmount,
            currency: paymentData.currency || 'INR',
            order_id: paymentData.orderId,
            name: 'Lireons',
            description: `Onboarding payment - ${invoiceId}`,
            handler: async (response: RazorpayHandlerResponse) => {
              try {
                const verifyResponse = await fetch(`${API_URL}/api/core-saas/payments/callback`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.backendToken}`,
                  },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                if (!verifyResponse.ok) {
                  const data = await verifyResponse.json().catch(() => null);
                  const message = data?.error?.message || data?.message || 'Payment verification failed';
                  throw new Error(Array.isArray(message) ? message.join(', ') : message);
                }

                resolve();
              } catch (verificationError) {
                reject(
                  verificationError instanceof Error
                    ? verificationError
                    : new Error('Payment verification failed'),
                );
              }
            },
            theme: {
              color: '#4f46e5',
            },
            modal: {
              ondismiss: () => {
                reject(new Error('Payment was cancelled. Please complete payment to continue.'));
              },
            },
          };

          const razorpayInstance = new window.Razorpay!(options);
          razorpayInstance.open();
        });
      };

      const normalizedPhone = formData.phone.replace(/\D/g, "");
      const payload = {
        orgName: formData.orgName.trim(),
        orgType: formData.orgType,
        subdomain: formData.subdomain.trim().toLowerCase(),
        customDomain: formData.customDomain.trim() || undefined,
        planId: selectedBackendPlan.id,
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
        const message = data?.error?.message || data?.message || "Failed to create tenant. Please try again.";
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
      }

      const tenantData = (await response.json()) as CreateTenantResult;
      setCreatedTenant(tenantData);

      const invoiceId = tenantData.payment?.invoiceId;

      if (!invoiceId) {
        throw new Error('Payment invoice was not generated. Please try again.');
      }

      await openRazorpayCheckout(invoiceId);

      if (formData.customDomain.trim()) {
        await startCustomDomainSetup(formData.customDomain);
      }

      if (formData.customDomain.trim()) {
        setSuccess("Payment successful. Proceed to DNS configuration.");
        setTimeout(() => { setSuccess(null); setStep(6); }, 1000);
      } else {
        setSuccess("Payment successful. Proceeding to review...");
        setTimeout(() => { setSuccess(null); setStep(6); }, 1000);
      }
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
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Checking your account...</p>
        </div>
      </div>
    );
  }

  // Define shared animation class for all step containers
  const stepAnimationClass = "space-y-6 animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-2 duration-500 ease-out fill-mode-both";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* 7-Step Indicator */}
      <div className="w-full max-w-4xl mb-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Setup your Academy
        </h2>
        {/* Added cross-browser scrollbar hiding classes and increased bottom padding */}
        <div className="flex justify-center mt-8 w-full overflow-x-auto pb-6 pt-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Changed from items-center to items-start so text flows naturally downward */}
            <div className="flex items-start w-full min-w-175 px-4">
                <StepIcon stepNum={1} currentStep={step} label="Owner" />
                {/* Added mt-[19px] to perfectly center the connecting line with the circles */}
                <div className={cn("h-0.5 flex-1 mx-2 mt-4.75 transition-colors duration-500 ease-in-out", step >= 2 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
                
                <StepIcon stepNum={2} currentStep={step} label="Academy" />
                <div className={cn("h-0.5 flex-1 mx-2 mt-4.75 transition-colors duration-500 ease-in-out", step >= 3 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
                
                <StepIcon stepNum={3} currentStep={step} label="Payment" />
                <div className={cn("h-0.5 flex-1 mx-2 mt-4.75 transition-colors duration-500 ease-in-out", step >= 4 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
                
                <StepIcon stepNum={4} currentStep={step} label="Brand" />
                <div className={cn("h-0.5 flex-1 mx-2 mt-4.75 transition-colors duration-500 ease-in-out", step >= 5 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
                
                <StepIcon stepNum={5} currentStep={step} label="App" />
                <div className={cn("h-0.5 flex-1 mx-2 mt-4.75 transition-colors duration-500 ease-in-out", step >= 6 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />

                <StepIcon stepNum={6} currentStep={step} label="DNS" />
                <div className={cn("h-0.5 flex-1 mx-2 mt-4.75 transition-colors duration-500 ease-in-out", step >= 7 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />

                <StepIcon stepNum={7} currentStep={step} label="Review" />
            </div>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          
          <form className="relative z-10" onSubmit={step === 5 ? handleConfigSubmit : step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            
            {/* Notifications overlay - sits above content but below flow */}
            <div className="mb-6 space-y-3">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 shrink-0" />
                  <span className="block sm:inline">{success}</span>
                </div>
              )}
            </div>
            
            {/* STEP 1: OWNER DETAILS */}
            {step === 1 && (
              <div key="step1" className={stepAnimationClass}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address (From Account)</label>
                  <input
                    disabled
                    value={session?.user?.email || "loading..."}
                    className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-28 px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                    >
                      {COUNTRY_CODES.map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN / Tax ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                    placeholder="For B2B tax invoices"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Address</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      name="billingAddress"
                      rows={3}
                      value={formData.billingAddress}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="123 Education Street, City, State, ZIP"
                    />
                  </div>
                </div>

                <div className="pt-2">
                    <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                    >
                    Continue to Academy Setup <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMY DETAILS */}
            {step === 2 && (
              <div key="step2" className={stepAnimationClass}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academy Name *</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="orgName"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="e.g., CodeMasters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Free Subdomain *</label>
                  <div className="flex rounded-lg shadow-sm">
                    <input
                      type="text"
                      name="subdomain"
                      required
                      value={formData.subdomain}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-none rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white text-right transition-shadow"
                      placeholder="codemasters"
                    />
                    <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 sm:text-sm font-medium">
                      .lireons.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Domain <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="customDomain"
                      value={formData.customDomain}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="www.myacademy.com"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center"><Server className="w-3 h-3 mr-1"/> You can configure DNS settings in step 6.</p>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all duration-200 hover:-translate-x-1"
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      Continue to Payment <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                </div>
              </div>
            )}

            {/* STEP 3: PLAN + PAYMENT */}
            {step === 3 && (
              <div key="step3" className={stepAnimationClass}>
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center"><CreditCard className="w-5 h-5 mr-2 text-indigo-500"/> Choose Your Plan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose any one of the 3 default plans to continue onboarding.</p>
                  </div>
                </div>

                {loadingPlans ? (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {PRICING_PLAN_CARDS.map((plan) => (
                      <label
                        key={plan.slug}
                        onClick={() => setSelectedPlanSlug(plan.slug)}
                        className={cn(
                          "block rounded-xl border p-4 cursor-pointer transition-all duration-300 ease-out relative overflow-hidden group",
                          selectedPlanSlug === plan.slug
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md ring-1 ring-indigo-600 -translate-y-1"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-0.5 hover:shadow-sm",
                        )}
                      >
                        {selectedPlanSlug === plan.slug && (
                            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 animate-in fade-in slide-in-from-top-full duration-300"></div>
                        )}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                                <div className={cn(
                                    "flex items-center justify-center w-5 h-5 rounded-full border mr-3 transition-colors duration-200",
                                    selectedPlanSlug === plan.slug ? "border-indigo-600" : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                                )}>
                                    {selectedPlanSlug === plan.slug && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-in zoom-in duration-200" />}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-base">{plan.name}</p>
                                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{plan.badge}</p>
                                </div>
                            </div>
                            <p className="ml-8 mt-1 text-xs text-slate-600 dark:text-slate-400">{plan.description}</p>
                            <ul className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1 ml-8">
                                {plan.features.map((feature) => (
                                  <li key={`${plan.slug}-${feature}`}>• {feature}</li>
                                ))}
                            </ul>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-slate-900 dark:text-white text-lg">{plan.priceLabel}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-1/3 flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all duration-200 hover:-translate-x-1"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || loadingPlans || !selectedPlanSlug || !selectedBackendPlan?.id}
                      className="w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      {loading ? "Processing..." : "Proceed to Payment"}
                      {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess("Temp skip enabled. Moved to Brand step.");
                        setStep(4);
                      }}
                      className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                    >
                      Temp Skip <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BRAND SETTINGS */}
            {step === 4 && (
              <div key="step4" className={stepAnimationClass}>
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <Palette className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Brand Aesthetics</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand / Service Name *</label>
                    <input
                      type="text"
                      required
                      value={configData.serviceName}
                      onChange={(e) => setConfigData(prev => ({ ...prev, serviceName: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="e.g., CodeMasters Academy"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">This will be prominently displayed to learners across your platform.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={configData.logoUrl}
                      onChange={(e) => setConfigData(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="https://cdn.example.com/logo.png"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <label className="cursor-pointer rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        {logoUploading ? "Uploading..." : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={logoUploading}
                          onChange={(event) => {
                            const selected = event.target.files?.[0];
                            if (selected) {
                              void handleAssetUpload(selected, "logo");
                            }
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-500">PNG/JPG/WebP/SVG up to 5MB</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={configData.primaryColor}
                          onChange={(e) => setConfigData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="h-10 w-12 cursor-pointer rounded overflow-hidden border-0 bg-transparent p-0"
                        />
                        <input
                          type="text"
                          value={configData.primaryColor}
                          onChange={(e) => setConfigData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1 w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white font-mono uppercase transition-shadow"
                        />
                      </div>
                    </div>
                    <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={configData.secondaryColor}
                          onChange={(e) => setConfigData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="h-10 w-12 cursor-pointer rounded overflow-hidden border-0 bg-transparent p-0"
                        />
                        <input
                          type="text"
                          value={configData.secondaryColor}
                          onChange={(e) => setConfigData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="flex-1 w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white font-mono uppercase transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Font Family</label>
                      <select
                        value={configData.fontFamily}
                        onChange={(e) => setConfigData(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      >
                        {["Inter", "Roboto", "Poppins", "Open Sans", "Lato", "Nunito", "DM Sans"].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Font Size</label>
                      <select
                        value={configData.fontSize}
                        onChange={(e) => setConfigData(prev => ({ ...prev, fontSize: e.target.value }))}
                        className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      >
                        {["14", "15", "16", "17", "18"].map(s => (
                          <option key={s} value={s}>{s}px</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all duration-200 hover:-translate-x-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    Continue to App Setup <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: MOBILE APP SETTINGS */}
            {step === 5 && (
              <div key="step5" className={stepAnimationClass}>
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <Smartphone className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mobile App Settings</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Name *</label>
                    <input
                      type="text"
                      required
                      value={configData.appName}
                      onChange={(e) => setConfigData(prev => ({ ...prev, appName: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="e.g., CodeMasters"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Shown directly beneath the app icon on learners&apos; devices.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Package Name *</label>
                    <input
                      type="text"
                      required
                      value={configData.packageName}
                      onChange={(e) => setConfigData(prev => ({ ...prev, packageName: e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, "") }))}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white font-mono transition-shadow"
                      placeholder="com.yourcompany.appname"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Reverse domain format. Unique identifier for App Store & Play Store.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Icon URL</label>
                    <input
                      type="url"
                      value={configData.appIconUrl}
                      onChange={(e) => setConfigData(prev => ({ ...prev, appIconUrl: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white transition-shadow"
                      placeholder="https://cdn.example.com/app-icon.png"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <label className="cursor-pointer rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        {iconUploading ? "Uploading..." : "Upload App Icon"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={iconUploading}
                          onChange={(event) => {
                            const selected = event.target.files?.[0];
                            if (selected) {
                              void handleAssetUpload(selected, "app-icon");
                            }
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-500">Square icon recommended, up to 5MB</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">A square PNG image (512x512px) is recommended.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Max Devices / User</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={configData.maxDevicesPerUser}
                        onChange={(e) => setConfigData(prev => ({ ...prev, maxDevicesPerUser: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="block w-24 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:text-white font-medium transition-shadow"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-start gap-3 group">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={configData.allowOfflineDownload}
                            onClick={() => setConfigData(prev => ({ ...prev, allowOfflineDownload: !prev.allowOfflineDownload }))}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-0.5",
                                configData.allowOfflineDownload ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out",
                                    configData.allowOfflineDownload ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                        <div className="flex flex-col" onClick={() => setConfigData(prev => ({ ...prev, allowOfflineDownload: !prev.allowOfflineDownload }))} style={{cursor: 'pointer'}}>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Offline Downloads</span>
                            <span className="text-xs text-slate-500 mt-0.5 select-none">Allow users to save videos offline</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-1/3 flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all duration-200 hover:-translate-x-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    {loading ? "Generating Configurations..." : "Save Settings & Continue"}
                    {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: DNS CONFIGURATION */}
            {step === 6 && (
              <div key="step6" className={stepAnimationClass}>
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center"><Globe className="w-5 h-5 mr-2 text-indigo-500"/> DNS Configuration</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your custom domain before we finalize deployment.</p>
                </div>

                {!formData.customDomain.trim() ? (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-8 text-center flex flex-col items-center">
                    <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <h4 className="text-slate-900 dark:text-white font-semibold mb-1">No Custom Domain Setup</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        You chose to use the free <span className="font-semibold text-slate-700 dark:text-slate-300">{formData.subdomain}.lireons.com</span> subdomain. DNS setup is complete.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!domainSetup && (
                      <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300 animate-in fade-in duration-300">
                        DNS records have not been generated yet. Click the button below to retrieve your records.
                      </div>
                    )}

                    {domainSetup && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Domain</span>
                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{domainSetup.customDomain}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
                                <div className="mt-1 flex items-center justify-end">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mr-2", 
                                        domainSetup.status === 'VERIFIED' ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                                    )}></div>
                                    <p className={cn(
                                        "font-bold text-sm",
                                        domainSetup.status === 'VERIFIED' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                    )}>{domainSetup.status}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-4 bg-slate-950 text-slate-300 font-mono text-sm leading-relaxed overflow-x-auto">
                          <p className="text-slate-500 text-xs mb-2"># Add these records to your domain provider&apos;s DNS settings. You can copy each record directly.</p>

                          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-indigo-300">CNAME Record</p>
                                <p className="text-[11px] text-slate-500 font-sans">Point your custom domain to the Lireons edge domain.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyDnsValue("cname", `CNAME ${domainSetup.dnsInstructions.cname.host} ${domainSetup.dnsInstructions.cname.value}`)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-sans font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                              >
                                {copiedDnsField === "cname" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedDnsField === "cname" ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-[80px_1fr]">
                              <span className="text-slate-500 font-sans">Host</span>
                              <span className="text-emerald-300 break-all">{domainSetup.dnsInstructions.cname.host}</span>
                              <span className="text-slate-500 font-sans">Value</span>
                              <span className="text-white break-all">{domainSetup.dnsInstructions.cname.value}</span>
                            </div>
                          </div>

                          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-indigo-300">TXT Record</p>
                                <p className="text-[11px] text-slate-500 font-sans">Used to prove that you control this custom domain.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyDnsValue("txt", `TXT ${domainSetup.dnsInstructions.txt.host} ${domainSetup.dnsInstructions.txt.value}`)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-sans font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                              >
                                {copiedDnsField === "txt" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedDnsField === "txt" ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-[80px_1fr]">
                              <span className="text-slate-500 font-sans">Host</span>
                              <span className="text-emerald-300 break-all">{domainSetup.dnsInstructions.txt.host}</span>
                              <span className="text-slate-500 font-sans">Value</span>
                              <span className="text-white break-all">{domainSetup.dnsInstructions.txt.value}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {!!formData.customDomain.trim() && !domainSetup && (
                        <button
                          type="button"
                          onClick={() => startCustomDomainSetup(formData.customDomain)}
                          className="flex-1 rounded-lg border border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                        >
                          Generate DNS Records
                        </button>
                      )}
                      {!!formData.customDomain.trim() && domainSetup && (
                        <>
                            <button
                            type="button"
                            onClick={handleLoadDomainStatus}
                            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
                            >
                            Refresh Status
                            </button>
                            <button
                            type="button"
                            onClick={handleVerifyDomain}
                            disabled={domainVerifyLoading || domainSetup.status === 'VERIFIED'}
                            className="flex-2 rounded-lg border border-transparent bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
                            >
                            {domainVerifyLoading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Verifying...</>
                            ) : domainSetup.status === 'VERIFIED' ? (
                                <><CheckCircle2 className="w-4 h-4 mr-2"/> Verified</>
                            ) : (
                                "Verify DNS Setup"
                            )}
                            </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="w-1/3 flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all duration-200 hover:-translate-x-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(7)}
                    disabled={!!formData.customDomain.trim() && domainSetup?.status !== "VERIFIED"}
                    className="w-2/3 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    Review Final Setup <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW & DEPLOY */}
            {step === 7 && (
              <div key="step7" className={stepAnimationClass}>
                <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4 animate-in zoom-in-50 duration-500">
                    <LayoutList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Final Review</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    Please review your academy setup carefully before final deployment. You can edit any section before proceeding.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReviewCard
                    title="Owner Information"
                    onEdit={() => setStep(1)}
                    rows={[
                      ["Email", session?.user?.email || "-"],
                      ["Phone", formData.phone ? `${countryCode}${formData.phone}` : "-"],
                      ["Tax ID", formData.taxId || "Not provided"],
                    ]}
                  />

                  <ReviewCard
                    title="Academy Information"
                    onEdit={() => setStep(2)}
                    rows={[
                      ["Academy Name", formData.orgName || "-"],
                      ["Subdomain", formData.subdomain ? `${formData.subdomain}.lireons.com` : "-"],
                      ["Custom Domain", formData.customDomain || "Not provided"],
                    ]}
                  />

                  <ReviewCard
                    title="Payment & Plan"
                    onEdit={() => setStep(3)}
                    rows={[
                      ["Selected Plan", selectedPlan ? `${selectedPlan.name} (${selectedPlan.priceLabel})` : "Not selected"],
                      ["Status", createdTenant?.payment?.status || "PENDING"],
                    ]}
                  />

                  <ReviewCard
                    title="Brand Aesthetics"
                    onEdit={() => setStep(4)}
                    rows={[
                      ["Service Name", configData.serviceName || "-"],
                      ["Colors", `${configData.primaryColor} / ${configData.secondaryColor}`],
                      ["Typography", `${configData.fontFamily} (${configData.fontSize}px)`],
                    ]}
                  />

                  <div className="md:col-span-2">
                    <ReviewCard
                        title="Mobile App Settings"
                        onEdit={() => setStep(5)}
                        rows={[
                        ["App Name", configData.appName || "-"],
                        ["Package ID", configData.packageName || "-"],
                        ["Restrictions", `Max ${configData.maxDevicesPerUser} devices | Offline Downloads ${configData.allowOfflineDownload ? "Enabled" : "Disabled"}`],
                        ]}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Ready to launch?</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deploying will compile your settings and redirect you to the dashboard.</p>
                        {!!formData.customDomain && domainSetup?.status !== "VERIFIED" && (
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2 flex items-center animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span> Custom domain not verified.
                            </p>
                        )}
                    </div>
                    <div className="flex w-full sm:w-auto gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setStep(6)}
                            className="flex-1 sm:flex-none justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-x-1"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleDeploy}
                            disabled={deployLoading || (!!formData.customDomain && domainSetup?.status !== "VERIFIED")}
                            className="flex-2 sm:flex-none flex items-center justify-center py-3 px-8 border border-transparent rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 dark:disabled:bg-emerald-800/50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            {deployLoading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Deploying...</>
                            ) : "Deploy Academy 🚀"}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const ReviewCard = ({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: Array<[string, string]>;
  onEdit: () => void;
}) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 group">
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-semibold px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 focus:opacity-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
      >
        Edit
      </button>
    </div>
    <div className="space-y-2.5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between items-start gap-4">
          <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{label}</span>
          <span className="text-slate-900 dark:text-slate-200 text-right wrap-break-word max-w-[60%] font-medium">{value || "-"}</span>
        </div>
      ))}
    </div>
  </div>
);

const StepIcon = ({ stepNum, currentStep, label }: { stepNum: number, currentStep: number, label: string }) => {
    const isCompleted = currentStep > stepNum;
    const isActive = currentStep === stepNum;

    return (
        <div className="flex flex-col items-center relative z-10 shrink-0 w-12">
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ease-out",
                isCompleted ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30" : 
                isActive ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 dark:text-indigo-400 ring-4 ring-indigo-50 dark:ring-indigo-900/20 scale-110 shadow-lg shadow-indigo-500/20" : 
                "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
            )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" /> : stepNum}
            </div>
            <span className={cn(
                "text-xs mt-3 font-bold w-max text-center transition-all duration-500",
                isActive ? "text-indigo-600 dark:text-indigo-400 translate-y-1" :
                isCompleted ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
            )}>{label}</span>
        </div>
    )
}