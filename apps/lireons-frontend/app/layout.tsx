import type { Metadata, Viewport } from "next";
import { Merienda } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import NavBarMain from "@/components/sections/NavBarMain";
import Footer from "@/components/sections/Footer";
import ClientLayout from "@/components/sections/ClientLayout";
import { SessionWrapper } from "../components/sections/SessionWrapper";
const merienda = Merienda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merienda",
}); 

export const viewport: Viewport = {
  themeColor: "#020617", 
  width: "device-width",
  initialScale: 1,
  // maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lireons.com"),

  icons: {
    icon: [
      { url: "/icon.png", sizes: "144x144", type: "image/png" },
    ],
  },

  // 1. Basic Metadata
  title: "Lireons - The OS for Course Creators",
  description: "Launch your own white-labeled academy with native mobile apps. Sell courses, mock tests, and cohorts with zero tech headaches.",
  keywords: [
    "LMS for Creators", 
    "Sell Courses Online", 
    "White Label EdTech", 
    "Coaching Institute Software", 
    "Mock Test Platform", 
    "Coding Compiler for Schools",
    "SaaS LMS",
    "Course Builder"
  ],
  authors: [{ name: "Lireons Team", url: "https://lireons.com" }],
  creator: "Lireons",
  publisher: "Lireons Inc.",

  // 2. Open Graph (Facebook, LinkedIn)
  openGraph: {
    title: "Lireons - Launch Your Online Academy",
    description: "Monetize your knowledge with your own white-labeled mobile apps and website.",
    url: "https://lireons.com",
    siteName: "Lireons Educators LMS",
    images: [
      {
        url: "/og-image.png", // Ensure this image showcases your Dashboard UI
        width: 1200,
        height: 630,
        alt: "Lireons Dashboard - Course Creator Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  // 3. Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Lireons - Sell Courses & Mock Tests",
    description: "The complete operating system for creators. Manage students, payments, and live classes in one place.",
    images: ["/og-image.png"],
  },

  // 4. Robots for Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 5. Verification (Optional but recommended for SEO tools)
  verification: {
    google: "your-google-site-verification-code", // Add your Search Console code here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${merienda.variable} font-sans bg-slate-950 min-h-screen antialiased`}>
        <SessionWrapper>
        <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
        >
            <ClientLayout>
              <NavBarMain />
              {children}
              <Footer />
            </ClientLayout>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}