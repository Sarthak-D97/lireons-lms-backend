import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/NavBar';
import Footer from '@/components/ui/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getActiveBrandingTheme } from '@/lib/academy-data';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Academy LMS',
  description: 'Learn from practical courses, articles, and guided video lessons.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getActiveBrandingTheme();

  const cssVars = {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-font-family': branding.fontFamily,
    '--brand-font-size': branding.fontSize,
  } as CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={cssVars}
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={branding.designTheme}
          enableSystem
          disableTransitionOnChange
        >
          <Navbar
            serviceName={branding.serviceName}
            organizationName={branding.organizationName}
            logoUrl={branding.logoUrl}
          />
          <main className="grow">{children}</main>
          <Footer
            serviceName={branding.serviceName}
            organizationName={branding.organizationName}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
