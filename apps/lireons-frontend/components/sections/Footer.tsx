import Image from "next/image";
import Link from "next/link";
import { JSX } from "react";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandX,
    IconBrandYoutube,
    IconMail,
    IconPhone
} from "@tabler/icons-react";
import { Merienda } from 'next/font/google'
const merienda = Merienda({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-merienda',
})

export default function Footer(): JSX.Element {
    return (
        // 1. Container: White for Light Mode | Slate-950 for Dark Mode
        // 2. Text: Slate-600 for Light Mode | Slate-300 for Dark Mode
        // 3. Border: Gray-200 for Light Mode | Slate-800 for Dark Mode
        <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Branding Section (Left) */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Lireons" height={40} width={40} />
                            {/* Logo Text: Dark for Light Mode | White for Dark Mode */}
                            <span className={`${merienda.className} text-neutral-900 dark:text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors`}>Lireons</span>
                        </Link>
                        <p className="text-sm leading-6 text-neutral-600 dark:text-slate-400 max-w-sm">
                            Empowering schools and coaching institutes with next-gen management tools.
                            Simplify administration, automate fees, and focus on education.
                        </p>

                        {/* Direct Contact for Sales */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
                                <IconMail className="h-4 w-4" />
                                <a href="mailto:sales@lireons.com">sales@lireons.com</a>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
                                <IconPhone className="h-4 w-4" />
                                <span>+91 9760498894</span>
                            </div>
                        </div>

                        <div className="flex gap-x-5">
                            <SocialLink href="#" icon={<IconBrandFacebook className="h-5 w-5" />} label="Facebook" />
                            <SocialLink href="#" icon={<IconBrandInstagram className="h-5 w-5" />} label="Instagram" />
                            <SocialLink href="#" icon={<IconBrandX className="h-5 w-5" />} label="X" />
                            <SocialLink href="#" icon={<IconBrandYoutube className="h-5 w-5" />} label="YouTube" />
                        </div>
                    </div>

                    {/* Links Grid (Right) */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                {/* Header: Neutral-900 for Light | White for Dark */}
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-white transition-colors">Core Features</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <FooterLink href="/features/student-management" label="Student Management" />
                                    <FooterLink href="/features/fee-automation" label="Fee Automation" />
                                    <FooterLink href="/features/exam-portal" label="Exam & Results" />
                                    <FooterLink href="/features/attendance" label="Attendance Tracking" />
                                    <FooterLink href="/features/parent-app" label="Parent Mobile App" />
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-white transition-colors">Schools & Partners</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <FooterLink href="/demo" label="Book a Free Demo" />
                                    <FooterLink href="/pricing" label="Pricing Plans" />
                                    <FooterLink href="/login" label="Client Login" />
                                    <FooterLink href="/partners" label="Become a Partner" />
                                    <FooterLink href="/case-studies" label="Success Stories" />
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-white transition-colors">Support</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <FooterLink href="/help" label="Help Center" />
                                    <FooterLink href="/docs" label="Documentation" />
                                    <FooterLink href="/api" label="Developer API" />
                                    <FooterLink href="/status" label="System Status" />
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-white transition-colors">Company</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <FooterLink href="/about" label="About Us" />
                                    <FooterLink href="/careers" label="Careers" />
                                    <FooterLink href="/contact" label="Contact Us" />
                                    <FooterLink href="/privacy" label="Privacy Policy" />
                                    <FooterLink href="/terms" label="Terms of Service" />
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                {/* Border: Gray-200 for Light | White/10 for Dark */}
                <div className="mt-16 border-t border-gray-200 dark:border-white/10 pt-8 sm:mt-20 lg:mt-24 transition-colors">
                    <p className="text-xs leading-5 text-neutral-500 dark:text-slate-400">
                        &copy; {new Date().getFullYear()} Lireons, Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

// Helper Components for clean code
function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="text-neutral-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
            <span className="sr-only">{label}</span>
            {icon}
        </Link>
    );
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link href={href} className="text-sm leading-6 text-neutral-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
                {label}
            </Link>
        </li>
    );
}