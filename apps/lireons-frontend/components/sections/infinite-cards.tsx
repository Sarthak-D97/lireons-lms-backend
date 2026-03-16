"use client";

import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

export default function InfiniteCards() {
    return (
        // 1. Container: White for Light Mode | Slate-950 for Dark Mode
        <div className="relative min-h-[40rem] rounded-md flex flex-col antialiased items-center justify-center overflow-hidden bg-white dark:bg-slate-950 py-20 transition-colors duration-300">
            {/* Background Effects - Adjusted for Light Mode visibility */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 left-1/4 h-96 w-96 bg-purple-200/50 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 h-96 w-96 bg-violet-200/50 dark:bg-violet-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-purple-300/50 dark:via-purple-400/50 to-transparent"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-violet-300/50 dark:via-violet-400/50 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl">
                {/* 2. Heading: Neutral-900 for Light Mode | Gradient for Dark Mode */}
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-neutral-900 dark:bg-gradient-to-r dark:from-purple-400 dark:via-violet-400 dark:to-purple-400 dark:bg-clip-text dark:text-transparent transition-colors">
                    Trusted by Top Creators
                </h2>
                {/* 3. Subtext: Neutral-600 for Light Mode | Slate-400 for Dark Mode */}
                <p className="text-center text-neutral-600 dark:text-slate-400 mb-12 text-sm md:text-base max-w-2xl mx-auto px-4 transition-colors">
                    Join thousands of educators and coaches scaling their online academies with Lireons.
                </p>

                <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                    // 4. Card Styling Overrides:
                    // - Borders: Gray-200 (Light) vs Purple-500/20 (Dark)
                    // - Backgrounds: Gray-50 (Light) vs Slate-900/50 (Dark)
                    // - Text: Neutral-900/600 (Light) vs Gray-100/400 (Dark)
                    className="
                        [&_.border]:border-gray-200 dark:[&_.border]:border-purple-500/20 
                        [&_.bg-slate-900]:bg-gray-50 dark:[&_.bg-slate-900]:bg-slate-900/50 
                        [&_.bg-white]:bg-gray-50 dark:[&_.bg-white]:bg-slate-900/50
                        
                        [&_.text-gray-100]:text-neutral-900 dark:[&_.text-gray-100]:text-gray-100
                        [&_.text-gray-400]:text-neutral-600 dark:[&_.text-gray-400]:text-gray-400
                        
                        [&_div]:backdrop-blur-sm
                        transition-colors duration-300
                    "
                />
            </div>
        </div>
    );
}

// These testimonials highlight your Core Features: 
// 1. Fee Collection, 2. Anti-Bunking (Safety), 3. Hiring, 4. All-in-one usage.
const testimonials = [
    {
        quote:
            "I launched my app in just 7 days. The DRM protection gave me the confidence to upload my premium content without fear of piracy.",
        name: "Rahul Sir",
        title: "UPSC Educator",
    },
    {
        quote:
            "Lireons helped me scale from 100 to 10,000 students. The automated payment handling and GST invoicing is a lifesaver.",
        name: "Dr. Anjali",
        title: "NEET Prep Coach",
    },
    {
        quote:
            "The marketing tools are incredible. I used the affiliate feature to grow my student base by 300% in 3 months.",
        name: "Sandeep Maheshwari",
        title: "Motivational Speaker",
    },
    {
        quote:
            "My students love the mobile app. They can watch videos offline and take quizzes on the go. Engagement has doubled.",
        name: "Priya Singh",
        title: "Coding Instructor",
    },
    {
        quote:
            "Best platform for selling courses. The analytics dashboard tells me exactly where students are dropping off so I can improve.",
        name: "Varun Agarwal",
        title: "Digital Marketing Expert",
    },
];