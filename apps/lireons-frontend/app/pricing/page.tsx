"use client";
import React, { useState } from "react";
import { IconCheck, IconArrowRight } from "@tabler/icons-react";
import { Merienda } from "next/font/google";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    CreditCard,
    Database,
    Phone,
    Briefcase,
    Server
} from "lucide-react";

const merienda = Merienda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merienda",
});

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = (planId: string) => {
    if (status === "authenticated") {
      router.push(`/onboarding?plan=${planId}`);
    } else {
      router.push(`/signup?redirect=/onboarding?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-neutral-600 dark:text-slate-200 selection:bg-indigo-500/30 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-300 to-purple-300 dark:from-indigo-600 dark:to-purple-600 opacity-40 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="px-6 py-24 sm:py-32 lg:px-8 text-center relative z-10">
        <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400 transition-colors">Pricing for Creators</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl transition-colors">
          Your Academy. <br />
          <span className={`${merienda.className} text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-orange-500 dark:from-indigo-400 dark:to-orange-400`}>
            100% Your Revenue.
          </span>
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-slate-400 transition-colors">
          Everything you need to launch, scale, and secure your online education business. No transaction fees.
        </p>

        <div className="mt-10 flex justify-center items-center space-x-4">
            <span className={cn("text-sm font-medium transition-colors", !isYearly ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-slate-400")}>Monthly</span>
            <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 bg-gray-300 dark:bg-slate-700"
            >
                <span
                    className={cn(
                        isYearly ? "translate-x-6" : "translate-x-0",
                        "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out -mt-[2px] -ml-[2px]"
                    )}
                />
            </button>
            <span className={cn("text-sm font-medium transition-colors", isYearly ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-slate-400")}>
                Yearly <span className="text-emerald-600 dark:text-emerald-400 text-xs ml-1 font-bold">(Save 20%)</span>
            </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24 relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <PricingCard
            title="Shared Infrastructure"
            badge="For Small Academies"
            description="Launch fast with our shared, highly optimized cloud architecture."
            price={isYearly ? "₹4,000" : "₹5,000"}
            period={isYearly ? "/mo (billed yearly)" : "/month"}
            features={[
              "Up to 2,000 Students",
              "Course & Mock Test Engine",
              "Razorpay & Stripe Integration",
              "Basic Web DRM",
              "Managed Infrastructure",
              "Email Support"
            ]}
            buttonText="Start Shared Plan"
            onClick={() => handleGetStarted("tier_shared")}
            featured={false}
          />

          <PricingCard
            title="Dedicated Cloud"
            badge="Most Popular"
            description="High performance with dedicated servers for serious educators."
            price={isYearly ? "₹20,000" : "₹25,000"}
            period={isYearly ? "/mo (billed yearly)" : "/month"}
            features={[
              "Up to 50,000 Students",
              "Dedicated Server/VPS",
              "Bank-Grade Video DRM",
              "White-labeled Android App",
              "Custom Integrations",
              "Priority 24/7 Support",
              "99.9% Uptime SLA"
            ]}
            buttonText="Scale with Dedicated"
            onClick={() => handleGetStarted("tier_dedicated")}
            featured={true} 
          />

          <PricingCard
            title="White-Label Enterprise"
            badge="For Large Institutions"
            description="Complete brand dominance with iOS and massive scale."
            price="Custom"
            period=""
            features={[
              "Unlimited Students",
              "Data in your own AWS account",
              "White-labeled iOS App",
              "Multiple Campus Support",
              "Custom Analytics Dashboard",
              "On-premise deployment option",
              "Dedicated Account Manager"
            ]}
            buttonText="Contact Sales"
            onClick={() => router.push("/contact")}
            featured={false}
          />
        </div>

        <div className="mt-32">
            <div className="text-center mb-16">
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4 transition-colors">Why Educators Trust <span className={merienda.className}>Lireons</span></h3>
                <p className="text-neutral-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
                    We provide the technology you need to compete with EdTech giants.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <UspCard 
                    icon={<Briefcase className="text-orange-500 dark:text-orange-400" />}
                    title="100% Whitelabeled"
                    description="Your brand is front and center. Remove 'Lireons' branding from your website and mobile apps completely."
                 />
                 <UspCard 
                    icon={<ShieldCheck className="text-indigo-600 dark:text-indigo-400" />}
                    title="Anti-Piracy DRM"
                    description="Our multi-layer DRM encryption ensures your videos cannot be screen-recorded or downloaded illegally."
                 />
                 <UspCard 
                    icon={<Database className="text-cyan-600 dark:text-cyan-400" />}
                    title="Own Your Data"
                    description="You own your student data. Export emails, phone numbers, and payment history anytime. We never market to your students."
                 />
                 <UspCard 
                    icon={<CreditCard className="text-emerald-600 dark:text-emerald-400" />}
                    title="Instant Settlements"
                    description="Link your own Stripe/Razorpay account. Money goes directly to your bank account instantly. We don't hold your funds."
                 />
                 <UspCard 
                    icon={<Server className="text-pink-600 dark:text-pink-400" />}
                    title="Auto-Scaling Cloud"
                    description="Hosted on world-class infrastructure. Whether you have 100 or 100,000 students on exam day, your site won't crash."
                 />
                 <UspCard 
                    icon={<Phone className="text-purple-600 dark:text-purple-400" />}
                    title="Push Marketing"
                    description="Built-in tools for push notifications, SMS alerts, and coupon codes to drive more course sales."
                 />
            </div>
        </div>
      </div>
    </div>
  );
}

const PricingCard = ({
  title,
  badge,
  description,
  price,
  period,
  features,
  buttonText,
  onClick,
  featured,
}: {
  title: string;
  badge: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  onClick: () => void;
  featured: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-3xl p-8 ring-1 transition-all duration-300",
        featured
          ? "bg-white dark:bg-slate-900/80 ring-indigo-500 shadow-2xl shadow-indigo-500/20 scale-100 lg:scale-105 z-10"
          : "bg-white/60 dark:bg-slate-900/40 ring-gray-200 dark:ring-slate-700 hover:ring-gray-300 dark:hover:ring-slate-600 hover:bg-white dark:hover:bg-slate-900/60"
      )}
    >
      <div className="mb-4">
        {/* Adjusted to flex-col on small screens, flex-row on xl screens to fix badge wrapping */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-2">
            <h3 className="text-lg font-semibold leading-8 text-neutral-900 dark:text-white transition-colors">{title}</h3>
            {featured && (
                <span className="w-fit whitespace-nowrap rounded-full bg-indigo-100 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    {badge}
                </span>
            )}
             {!featured && (
                <span className="w-fit whitespace-nowrap rounded-full bg-gray-100 dark:bg-slate-700/50 px-2.5 py-1 text-xs font-semibold leading-5 text-neutral-600 dark:text-slate-400">
                    {badge}
                </span>
            )}
        </div>
        <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-slate-400 min-h-[48px] transition-colors">{description}</p>
        <div className="mt-6 flex items-baseline gap-x-1">
          <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white transition-colors">{price}</span>
          <span className="text-sm font-semibold leading-6 text-neutral-500 dark:text-slate-400 transition-colors">{period}</span>
        </div>
        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-neutral-700 dark:text-slate-300 transition-colors">
          {features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <IconCheck className={cn("h-6 w-5 flex-none", featured ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400 dark:text-slate-400")} aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onClick}
        className={cn(
          "mt-8 block w-full rounded-md px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-200",
          featured
            ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25"
            : "bg-gray-100 dark:bg-slate-800 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 ring-1 ring-inset ring-gray-200 dark:ring-slate-600"
        )}
      >
        {buttonText}
      </button>
    </div>
  );
};

const UspCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    return (
        <div className="flex flex-col items-start p-6 rounded-2xl bg-gray-50 dark:bg-slate-900/20 border border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/50 transition-colors shadow-sm dark:shadow-none">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 mb-4 shadow-sm dark:shadow-lg transition-colors">
                {React.cloneElement(icon as React.ReactElement, { size: 24 } as any)}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 transition-colors">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed text-justify transition-colors">{description}</p>
        </div>
    )
}