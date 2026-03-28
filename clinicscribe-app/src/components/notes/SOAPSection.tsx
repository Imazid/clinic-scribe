'use client';

import { useState } from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { cn } from '@/lib/utils';

interface SOAPSectionProps {
  title: string;
  label: string;
  content: string;
  confidence: number;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export function SOAPSection({ title, label, content, confidence, onContentChange, readOnly }: SOAPSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="rounded-xl border border-outline-variant/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
            {label}
          </span>
          <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
        </div>
        <ConfidenceIndicator score={confidence} />
      </div>

      {confidence < 0.7 && (
        <div className="px-4 py-2 bg-error/5 border-b border-error/10 text-xs text-error flex items-center gap-2">
          Low confidence — please review this section carefully.
        </div>
      )}

      <div className="p-4">
        {readOnly ? (
          <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : isEditing ? (
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full min-h-[120px] text-sm text-on-surface bg-transparent border-none outline-none resize-y leading-relaxed"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={cn(
              'text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed cursor-text rounded-lg p-2 -m-2 hover:bg-surface-container-low transition-colors',
            )}
          >
            {content || <span className="text-outline italic">Click to add content...</span>}
          </div>
        )}
      </div>
    </div>
  );
}
