import { Card, CardTitle } from '@/components/ui/Card';
import { Send } from 'lucide-react';

interface ReferralDraftProps {
  referrals: string[];
}

export function ReferralDraftSection({ referrals }: ReferralDraftProps) {
  if (referrals.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-primary" />
        <CardTitle>Referral Drafts</CardTitle>
      </div>
      <div className="space-y-2">
        {referrals.map((r, i) => (
          <div key={i} className="p-3 rounded-xl bg-surface-container-low">
            <p className="text-sm text-on-surface-variant">{r}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
