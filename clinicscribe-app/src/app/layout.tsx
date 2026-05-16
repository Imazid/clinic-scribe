import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

// Editorial serif used for italic accent words inside headlines (matches the
// design package's `.serif-italic` class — Miraa hero copy and HeroStrip).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['italic'],
  display: 'swap',
  variable: '--font-fraunces',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${plusJakarta.variable} ${fraunces.variable}`}>
      <body className="h-full font-sans antialiased bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
