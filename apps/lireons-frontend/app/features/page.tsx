"use client";
import { IconArrowRight } from "@tabler/icons-react";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ClientOnly } from "@lireons/ui";
import InfoText from "../../components/sections/InfoText";
import React from "react";
import {
  ShieldCheck,
  Users,
  CreditCard,
  Bus,
  BookOpen,
  Building2,
  Activity,
  FileText,
  Clock,
  GraduationCap,
  Network,
  Fingerprint,
  Cpu,
  Database,
  Lock,
  Landmark,
  LayoutGrid
} from "lucide-react";
import { Merienda } from 'next/font/google'
import Link from "next/link";
import { motion } from "motion/react";

const merienda = Merienda({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merienda',
})

export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 hidden lg:flex justify-center items-center space-x-2 text-lg font-normal text-black"
    >
      <Image src="/logo.png" alt="lireons" height={150} width={250} />
    </Link>
  );
};

export default function FeatureDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const handleBookDemo = (e: React.MouseEvent) => {
    e.preventDefault();

    if (status === "authenticated") {
      const queryParams = new URLSearchParams({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        orgType: "Registered User",
        phone: "Active"
      }).toString();

      router.push(`/onboarding?${queryParams}`);
    } else {
      router.push("/signup");
    }
  };

  return (
    // 1. Root: White for Light | Slate-950 for Dark
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-neutral-600 dark:text-slate-200 selection:bg-purple-500/30 transition-colors duration-300">
      
      {/* --- UPDATED TOP HERO SECTION --- */}
      <div className="relative isolate px-6 pt-12 sm:pt-24 lg:px-8 pb-12">
        {/* Logo Container */}
        <div className="flex justify-center w-full mb-8">
            <Logo />
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          {/* Gradient: Lighter for Light Mode | Original for Dark Mode */}
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d8b4fe] to-[#c4b5fd] dark:from-[#a855f7] dark:to-[#9089fc] opacity-40 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* New Header Title: Neutral-900 (Light) | White (Dark) */}
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl mb-8 transition-colors">
             The Logic Behind <br className="md:hidden" />
             <span className={`${merienda.className} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300`}>
                The Creator Economy
             </span>
          </h1>

          {/* Styled Text Block (Glassmorphism): White/Border-Gray for Light | Slate-900/Border-White for Dark */}
          <div className="relative rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 md:p-10 border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-xl dark:shadow-2xl transition-colors">
              {/* Text: Neutral-700 (Light) | Slate-300 (Dark) */}
              <p className="mt-2 text-sm leading-relaxed md:text-lg md:leading-8 text-neutral-700 dark:text-slate-300 text-justify transition-colors">
                The global education market is shifting from traditional classrooms to online communities. In this era, successful educators are not just teachers—they are entrepreneurs. Managing a digital academy requires more than just video hosting; it demands a robust infrastructure for sales, marketing, and student engagement.
                <br /><br />
                The <strong> <span className={`${merienda.className} text-purple-700 dark:text-purple-300 hover:text-purple-600 dark:hover:text-yellow-100 transition-colors`}>Lireons</span> Educators LMS</strong> represents the ultimate toolkit for the modern course creator. It offers a unified, cloud-native ecosystem designed to monetize your knowledge, protect your content, and scale your brand globally. By handling the technical heavy lifting, Lireons empowers you to focus on what truly matters: creating world-class content and building your community.
              </p>
          </div>
        </div>
      </div>

      <ClientOnly>
        <div className="py-8">
            <InfoText />
        </div>
      </ClientOnly>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <SectionContainer
          id="admission"
          icon={<FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          title="Funnel & Lead Management"
          subtitle="Turn Traffic into Enrolled Students"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <DetailBlock title="Lead Lifecycle & CRM">
              Stop losing potential students to scattered spreadsheets. Lireons integrates a high-velocity CRM specifically engineered for selling courses. It captures leads (`SalesLead`) from your landing pages, webinars, and social media ads. The system scores leads based on engagement levels, automatically assigning hot leads to your sales team.
            </DetailBlock>
            <DetailBlock title="Organization Design">
              Customize your academy's look and feel with `OrganizationDesign`. Choose from pre-built themes, set your primary/secondary colors, upload your logo, and even inject custom CSS. Your landing page layout is fully configurable to match your brand identity.
            </DetailBlock>
            <DetailBlock title="Affiliate Management">
              Turn your students into your marketing team. Create and manage your own `AffiliateLink` program with automated tracking and payouts. Set custom commission rates for different products and influencers, tracking every click and sale in real-time.
            </DetailBlock>
            <DetailBlock title="Coupons & Discounts">
              Create flexible `Coupon` codes for flash sales or specific user groups. Support for percentage-based or fixed-amount discounts with usage limits and expiry dates to drive urgency.
            </DetailBlock>
          </div>
        </SectionContainer>

        <SectionContainer
          id="sis"
          icon={<Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
          title="Learner & Device Management"
          subtitle="A 360-Degree View of Your Students"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card title="User Profiles & Roles">
              Manage `User` profiles with granular roles (`ADMIN`, `EDUCATOR`, `STUDENT`). Track github/linkedin social logins, verification status, and phone numbers.
            </Card>
            <Card title="Device Security">
              Prevent account sharing with `UserDevice` tracking. Enforce limits on the number of active devices (e.g., max 2 devices) per user. View OS version and last login times for security audits.
            </Card>
            <Card title="Community Posts">
              Foster a sense of belonging with `CommunityPost` and `CommunityComment`. Allow students to ask questions, share insights, and network with each other directly within your platform.
            </Card>
          </div>
          {/* Box: White/Gray for Light | Slate-900 for Dark */}
          <div className="mt-8 p-6 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 transition-colors">
            {/* Header: Neutral-900 (Light) | White (Dark) */}
            <h4 className="text-neutral-900 dark:text-white font-semibold mb-2 flex items-center gap-2 transition-colors">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Analytics Aggregation
            </h4>
            {/* Text: Neutral-600 (Light) | Slate-400 (Dark) */}
            <p className="text-sm text-neutral-600 dark:text-slate-400 text-justify transition-colors">
              Our `AnalyticsAggregation` engine crunches data daily. Track total sales, revenue, and active students over time. Visualize trends for specific products or your entire organization to make data-driven decisions.
            </p>
          </div>
        </SectionContainer>

        {/* 4. ATTENDANCE */}
        <SectionContainer
          id="attendance"
          icon={<Fingerprint className="h-6 w-6 text-pink-600 dark:text-pink-400" />}
          title="Engagement & Live Classes"
          subtitle="Beyond Pre-recorded Videos"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <DetailBlock title="Seamless Zoom/Meet Integration">
              Conduct live classes, webinars, and doubt-clearing sessions directly from your platform. Automated reminders are sent to enrolled students before the session starts. Recordings are automatically processed and added to the course library for later viewing.
            </DetailBlock>
            <DetailBlock title="Push Notifications">
              Keep your learners hooked with instant push notifications to their mobile devices. Announce new content, live class alerts, or flash sales directly to their home screen, bypassing the cluttered email inbox.
            </DetailBlock>
            <DetailBlock title="Gamification">
              Motivate your students with badges, points, and leaderboards. Reward them for completing lessons, scoring high on quizzes, or helping others in the community. Create a competitive yet collaborative environment that drives course completion.
            </DetailBlock>
            <DetailBlock title="Course Certificates">
              Auto-generate verifiable certificates upon course completion. Students can share these directly to LinkedIn with your branding, serving as free viral marketing for your academy.
            </DetailBlock>
          </div>
        </SectionContainer>

        {/* 5. ACADEMIC MANAGEMENT */}
        <SectionContainer
          id="academics"
          icon={<GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
          title="Content Engine & Products"
          subtitle="Create World-Class Learning Experiences"
        >
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">Product Types</h3>
                <p className="text-neutral-600 dark:text-slate-400 text-sm leading-relaxed text-justify transition-colors">
                  Create diverse `Product` types: **COURSE** (Self-paced video series), **MOCK_TEST** (Timed exam simulations), or **COHORT** (Live, schedule-based batches). Organize content with `ProductSubject` and `ProductTopic` hierarchy.
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">Media Library & DRM</h3>
                <p className="text-neutral-600 dark:text-slate-400 text-sm leading-relaxed text-justify transition-colors">
                  Upload content to your `MediaLibrary`. We handle transcoding and storage. All video assets are protected with bank-grade DRM encryption. `Material` types include VIDEO, PDF, QUIZ, and LIVE_CLASS.
                </p>
              </div>
            </div>
            {/* Border: Gray-200 (Light) | White/5 (Dark) */}
            <div className="border-t border-gray-200 dark:border-white/5 pt-6 transition-colors">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">Content Collaboration</h3>
              <p className="text-neutral-600 dark:text-slate-400 text-sm text-justify transition-colors">
                Work with a team? Use `ContentDraft` to collaborate on course material before publishing. Review changes, approve drafts, and publish to your live academy with confidence.
              </p>
            </div>
          </div>
        </SectionContainer>
        <SectionContainer
          id="exams"
          icon={<FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />}
          title="Coding & Assessments"
          subtitle="Validate Learning Outcomes"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <GlowingCard icon={<Database />} title="Coding Compilers">
              Integrated `CodeSubmission` engine supports multiple languages. Define `CoreTestCase` with input/output data to auto-grade student submissions instantly.
            </GlowingCard>
            <GlowingCard icon={<Cpu />} title="Mock Tests">
              Simulate real exam environments with timers, negative marking, and section-wise time limits. Perfect for coaching institutes preparing students for competitive exams like JEE, NEET, or UPSC.
            </GlowingCard>
            <GlowingCard icon={<LayoutGrid />} title="Progress Tracking">
              Track `MaterialProgress` for every student. See completion percentages, quiz scores, and coding challenge results in real-time.
            </GlowingCard>
          </div>
        </SectionContainer>

        {/* 7. FINANCE & FEES */}
        <SectionContainer
          id="finance"
          icon={<CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
          title="Sales & Invoicing"
          subtitle="Monetize Your Knowledge"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <DetailBlock title="SaaS Plans & Billing">
              Choose the right `SaasPlan` for your growth. We handle the complexity of subscriptions, billing cycles, and `Invoice` generation. Your invoices are auto-generated with tax details and currency support (INR/USD).
            </DetailBlock>
            <DetailBlock title="Global Payments">
              Accept payments in 135+ currencies via `SaasPaymentTransaction`. We integrate with Stripe and Razorpay. Money hits your bank account instantly (T+2 days).
            </DetailBlock>
            <DetailBlock title="Tenant Organization">
              Each academy is a unique `TenantOrganization` with its own `subdomain` and `customDomain`. Your data is logically isolated, ensuring privacy and security.
            </DetailBlock>
            <DetailBlock title="Tax-Compliant Invoicing">
              Automated tax-compliant invoicing for every sale. Download GST reports for easy filing. We handle the boring accounting stuff so you can focus on teaching.
            </DetailBlock>
          </div>
        </SectionContainer>
        <SectionContainer
          id="transport"
          icon={<Bus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
          title="White-Labeled Mobile Apps"
          subtitle="Your Academy in Their Pocket"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-slate-900/50 p-8 border border-gray-200 dark:border-white/5 transition-colors">
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 transition-colors">Organization App Settings</h3>
                <p className="text-neutral-600 dark:text-slate-400 text-sm mb-4 text-justify transition-colors">
                  Configure your app via `OrganizationAppSettings`. Set your `appName`, `packageName`, and upload your `appIconUrl`. Control features like `allowOfflineDownload` and `maxDevicesPerUser`.
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 transition-colors">Native Android & iOS</h3>
                <p className="text-neutral-600 dark:text-slate-400 text-sm text-justify transition-colors">
                  Launch your own branded mobile apps on the Google Play Store and Apple App Store. Your logo, your splash screen, your brand. Give your students a premium learning experience.
                </p>
              </div>
              <div className="flex items-center justify-center">
                 <div className="h-40 w-40 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center animate-pulse transition-colors">
                    <Bus className="h-20 w-20 text-yellow-500 dark:text-yellow-400 transition-colors" />
                 </div>
              </div>
            </div>
          </div>
           <div className="mt-24 flex flex-col items-center">
                    <button
                        onClick={handleBookDemo}
                        className="relative group overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] transition-shadow duration-300 inline-block"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#818cf8_0%,#3b82f6_50%,#818cf8_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-neutral-900 dark:bg-slate-950 px-10 py-5 text-xl font-bold text-white backdrop-blur-3xl transition-all group-hover:bg-neutral-800 dark:group-hover:bg-slate-900">
                            Start Your Free Trial
                            <IconArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>
                    <p className="mt-6 text-center text-sm text-neutral-500 dark:text-slate-400 max-w-md transition-colors">
                        Ready to launch your academy? Get a personalized walkthrough of <span className={`${merienda.className} text-neutral-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-100 font-medium transition-colors`}>Lireons.</span>
                    </p>
                </div>
        </SectionContainer>
      </div>
    </div>
  );
}


function SectionContainer({ id, icon, title, subtitle, children }: { id: string, icon: React.ReactNode, title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div id={id} className="pt-20">
      <div className="flex items-center gap-3 mb-2">
        {/* Icon Box: White/Border-Gray for Light | Slate-900/Border-White for Dark */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors">
          {icon}
        </div>
        {/* Title: Neutral-900 (Light) | White (Dark) */}
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">{title}</h2>
      </div>
      {/* Subtitle: Purple-600 (Light) | Purple-400 (Dark) */}
      <p className="text-lg text-purple-600 dark:text-purple-400 mb-10 pl-1 transition-colors">{subtitle}</p>
      {children}
    </div>
  );
}

function DetailBlock({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-purple-200/50 to-violet-200/50 dark:from-purple-600/20 dark:to-violet-600/20 opacity-0 transition group-hover:opacity-100 blur-lg"></div>
      <div className="relative">
        {/* Title: Neutral-900 (Light) | White (Dark) */}
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2 transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-500 transition-colors"></span>
            {title}
        </h3>
        {/* Text: Neutral-600 (Light) | Slate-400 (Dark) */}
        <p className="text-neutral-600 dark:text-slate-400 text-sm leading-relaxed text-justify transition-colors">
          {children}
        </p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        // Card: Gray-50/Border-Gray for Light | Slate-900/Border-White for Dark
        <div className="rounded-xl bg-gray-50 dark:bg-slate-900/50 p-6 border border-gray-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 transition-colors">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed text-justify transition-colors">{children}</p>
        </div>
    )
}

function GlowingCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        // Card: White/Border-Gray for Light | Slate-900/Border-White for Dark
        <div className="relative group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 overflow-hidden transition-colors duration-300 shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-neutral-900 dark:text-white">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 transition-colors">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed relative z-10 text-justify transition-colors">{children}</p>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-purple-500 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
       
        </div>
    )
}