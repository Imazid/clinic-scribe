import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${plusJakarta.variable}`}>
      <body className="h-full font-sans antialiased bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
