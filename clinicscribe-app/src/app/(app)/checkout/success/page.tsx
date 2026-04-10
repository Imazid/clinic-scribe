'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div>
      <PageHeader title="Welcome to Miraa" description="" />

      <Card className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="text-xl font-bold text-on-surface mb-2">
          Your trial has started!
        </h2>
        <p className="text-sm text-on-surface-variant mb-6">
          You have 14 days of full access. Your card will not be charged
          until the trial period ends. You can cancel anytime from your
          billing settings.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full" size="lg">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/settings/billing">
            <Button variant="outline" className="w-full" size="lg">
              View Billing Details
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
