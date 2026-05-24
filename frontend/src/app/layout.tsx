import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from '@/components/providers/SocketProvider';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'BizPartner AL', template: '%s | BizPartner AL' },
  description: 'Albania\'s premier marketplace for jobs, real estate, and services.',
  keywords: ['marketplace', 'jobs', 'real estate', 'Albania', 'listings'],
  authors: [{ name: 'BizPartner AL' }],
  creator: 'BizPartner AL',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bizpartner.al',
    title: 'BizPartner AL',
    description: 'Albania\'s premier marketplace for jobs, real estate, and services.',
    siteName: 'BizPartner AL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizPartner AL',
    description: 'Albania\'s premier marketplace for jobs, real estate, and services.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <SocketProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  },
                }}
              />
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
