import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClinicScribe AI',
  description: 'AI-Powered Clinical Documentation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
