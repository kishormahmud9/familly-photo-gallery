import type { Metadata } from 'next';
import { Manrope, Cormorant_Garamond, Caveat } from 'next/font/google';
import './globals.css';
import { LightboxProvider } from '@/context/LightboxContext';
import { LightboxModal } from '@/components/lightbox/LightboxModal';
import { NavigationHeader } from '@/components/common/NavigationHeader';
import { NavigationFooter } from '@/components/common/NavigationFooter';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-signature',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Family Photo Gallery | Vance Archive',
  description: 'A premium digital archive for family memories, albums, and stories.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} ${caveat.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400 selection:text-zinc-950">
        <LightboxProvider>
          <NavigationHeader />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">{children}</main>
          <LightboxModal />
          <NavigationFooter />
        </LightboxProvider>
      </body>
    </html>
  );
}
