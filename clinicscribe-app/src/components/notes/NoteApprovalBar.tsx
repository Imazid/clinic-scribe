'use client';

import { Button } from '@/components/ui/Button';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Shield, Download, Copy } from 'lucide-react';

interface NoteApprovalBarProps {
  overallConfidence: number;
  isApproved: boolean;
  onApprove: () => void;
  onExportPDF: () => void;
  onCopyToClipboard: () => void;
  isApproving?: boolean;
}

export function NoteApprovalBar({ overallConfidence, isApproved, onApprove, onExportPDF, onCopyToClipboard, isApproving }: NoteApprovalBarProps) {
  return (
    <div className="sticky bottom-0 bg-surface-container-lowest/90 backdrop-blur-lg border-t border-outline-variant/30 px-6 py-4 flex items-center justify-between rounded-b-xl">
      <div className="flex items-center gap-4">
        <div className="text-sm text-on-surface-variant">
          Overall confidence:
        </div>
        <ConfidenceIndicator score={overallConfidence} />
      </div>

      <div className="flex items-center gap-3">
        {isApproved ? (
          <>
            <Button variant="outline" onClick={onCopyToClipboard}>
              <Copy className="w-4 h-4" /> Copy
            </Button>
            <Button variant="outline" onClick={onExportPDF}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-sm font-semibold">
              <Shield className="w-4 h-4" /> Approved
            </div>
          </>
        ) : (
          <Button onClick={onApprove} isLoading={isApproving}>
            <Shield className="w-4 h-4" /> Approve & Sign
          </Button>
        )}
      </div>
    </div>
  );
}
