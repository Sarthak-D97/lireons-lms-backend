'use client';
import ThreeDCard from "./ThreeDCard";

export const CardInfo: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
}> = [
        {
            id: 1,
            title: "Content Engine & DRM",
            description:
                "Upload videos, PDFs, and quizzes to your Media Library. We handle the heavy lifting with auto-transcoding and bank-grade DRM encryption to prevent piracy. Your intellectual property remains completely locked down and secure.",
            image: "/threedcards/ams.png",
        },
        {
            id: 2,
            title: "Interactive Coding & Mock Tests",
            description:
                "Validate learning outcomes with built-in coding compilers supporting multiple languages. Run timed mock tests with negative marking for competitive exam prep. Auto-grade student submissions instantly to save valuable time.",
            image: "/threedcards/sap.png",
        },
        {
            id: 3,
            title: "Funnel & Lead Management",
            description:
                "Stop losing students to scattered spreadsheets. Our built-in high-velocity CRM captures leads from your landing pages and automatically scores them based on engagement levels, helping your sales team close more deals.",
            image: "/threedcards/cpa.png",
        },
        {
            id: 4,
            title: "Affiliates & Coupons",
            description:
                "Turn your best students into your marketing team. Generate custom affiliate links, track real-time commissions, and launch flash sales with usage-limited coupons to drive urgency and boost your course sales.",
            image: "/threedcards/fms.png",
        },
        {
            id: 5,
            title: "Global Payments & Invoicing",
            description:
                "Accept payments in 135+ currencies via seamless Stripe and Razorpay integrations. We completely automate tax-compliant invoicing and GST reports so you can focus entirely on teaching, not accounting.",
            image: "/threedcards/mcs.png",
        },
        {
            id: 6,
            title: "White-Labeled Mobile Apps",
            description:
                "Put your academy right in their pocket. Launch your own native Android and iOS apps on the Play Store and App Store complete with offline secure downloads, push notifications, and your custom branding.",
            image: "/threedcards/coc.png",  
        },
    ];

export default function CardItems() {
    return (
        // 1. Background: White for Light Mode | Slate-950 for Dark Mode
        <div className="relative bg-white dark:bg-slate-950 px-4 py-12 md:pl-16 md:pr-4 flex items-center justify-center min-h-screen transition-colors duration-300">
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* 2. Blobs: Adjusted to be pastel/visible in Light Mode, kept original in Dark Mode */}
                <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-purple-300/40 dark:bg-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-violet-300/40 dark:bg-violet-400/20 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 md:gap-x-10 lg:gap-x-20 px-0 md:px-4 max-w-7xl mx-auto">
                {CardInfo.map((item) => (
                    <ThreeDCard
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        image={item.image}
                    />
                ))}
            </div>
        </div>
    );
}