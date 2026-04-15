'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
import { APP_EXPANDED_NAME, APP_NAME } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-container relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-secondary-fixed blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-secondary/30 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 right-10 h-[32rem] w-[32rem] rounded-full bg-tertiary/25 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <motion.div
          className="relative z-10 flex flex-col justify-center px-16"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-on-secondary" />
            </div>
            <span className="text-2xl font-bold text-on-primary">{APP_NAME}</span>
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-primary/70">
            {APP_EXPANDED_NAME}
          </p>
          <h1 className="text-4xl font-bold text-on-primary leading-tight mb-4">
            Focus on patients,<br />not paperwork.
          </h1>
          <p className="text-lg text-on-primary/70 max-w-md">
            Clinical workflow support that prepares visits, captures consults, verifies outputs, and closes the loop with you in control.
          </p>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
        >
          {children}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-on-surface-variant">
            <Link href="/privacy" className="hover:text-secondary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-secondary hover:underline">
              Terms of Service
            </Link>
            <Link href="/legal" className="hover:text-secondary hover:underline">
              Legal Hub
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
