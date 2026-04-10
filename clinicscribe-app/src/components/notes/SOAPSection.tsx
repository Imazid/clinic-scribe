'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { cn } from '@/lib/utils';
import type { NoteProvenanceItem, ProvenanceSource } from '@/lib/types';

interface SOAPSectionProps {
  id?: string;
  title: string;
  label: string;
  content: string;
  confidence: number;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
  autoEdit?: boolean;
  provenance?: NoteProvenanceItem[];
  onSentenceClick?: (sentence: string) => void;
}

const PROVENANCE_STYLES: Record<ProvenanceSource, { bg: string; border: string; label: string }> = {
  transcript: { bg: 'bg-secondary/5', border: 'border-l-secondary', label: 'Transcript' },
  chart: { bg: 'bg-primary/5', border: 'border-l-primary', label: 'Chart' },
  imported_result: { bg: 'bg-info/5', border: 'border-l-info', label: 'Imported Result' },
  inferred: { bg: 'bg-warning/5', border: 'border-l-warning', label: 'AI Inference' },
  needs_review: { bg: 'bg-error/5', border: 'border-l-error', label: 'Needs Review' },
};

function splitSentences(text: string): string[] {
  if (!text.trim()) return [];
  const raw = text.split(/(?<=[.!?])\s+|(?<=\n)/);
  return raw.map((s) => s.trim()).filter(Boolean);
}

function matchProvenance(sentence: string, items: NoteProvenanceItem[]): NoteProvenanceItem | undefined {
  const normalized = sentence.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return undefined;

  for (const item of items) {
    const itemNormalized = item.sentence.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalized === itemNormalized) return item;
    if (normalized.includes(itemNormalized) || itemNormalized.includes(normalized)) return item;
    // Partial overlap: check if >60% of words match
    const sentenceWords = new Set(normalized.split(' '));
    const itemWords = itemNormalized.split(' ');
    const overlap = itemWords.filter((w) => sentenceWords.has(w)).length;
    if (itemWords.length > 0 && overlap / itemWords.length > 0.6) return item;
  }
  return undefined;
}

function ProvenanceTooltip({ item }: { item: NoteProvenanceItem }) {
  const style = PROVENANCE_STYLES[item.source];
  const confidencePct = Math.round(item.confidence * 100);

  return (
    <div className="absolute left-0 bottom-full mb-2 z-30 w-72 rounded-xl bg-surface-container-lowest shadow-ambient-lg border border-outline-variant/20 p-3 pointer-events-none">
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
          item.source === 'needs_review' ? 'bg-error/10 text-error' :
          item.source === 'inferred' ? 'bg-warning/10 text-warning' :
          item.source === 'chart' ? 'bg-primary/10 text-primary' :
          'bg-secondary/10 text-secondary'
        )}>
          {style.label}
        </span>
        <span className={cn(
          'text-xs font-semibold',
          confidencePct >= 90 ? 'text-success' :
          confidencePct >= 70 ? 'text-warning' : 'text-error'
        )}>
          {confidencePct}% confidence
        </span>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{item.rationale}</p>
    </div>
  );
}

function ProvenanceSentence({
  sentence,
  item,
  onClick,
}: {
  sentence: string;
  item?: NoteProvenanceItem;
  onClick?: (sentence: string) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!item) {
    return <span className="text-sm text-on-surface-variant leading-relaxed">{sentence} </span>;
  }

  const style = PROVENANCE_STYLES[item.source];

  return (
    <span
      className="relative inline"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={cn(
          'text-sm leading-relaxed cursor-pointer rounded-sm px-0.5 -mx-0.5 border-l-2 transition-colors',
          style.bg,
          style.border,
          onClick && 'hover:opacity-80'
        )}
        onClick={() => onClick?.(sentence)}
      >
        {sentence}{' '}
      </span>
      {showTooltip && <ProvenanceTooltip item={item} />}
    </span>
  );
}

export function SOAPSection({
  id,
  title,
  label,
  content,
  confidence,
  onContentChange,
  readOnly,
  autoEdit,
  provenance,
  onSentenceClick,
}: SOAPSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showProvenance, setShowProvenance] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-edit when triggered externally
  useEffect(() => {
    if (autoEdit && !readOnly) {
      setIsEditing(true);
    }
  }, [autoEdit, readOnly]);

  const sentences = splitSentences(content);
  const hasProvenance = provenance && provenance.length > 0;
  const needsReviewCount = provenance?.filter((p) => p.source === 'needs_review').length ?? 0;

  const handleEdit = useCallback(() => {
    if (!readOnly) setIsEditing(true);
  }, [readOnly]);

  return (
    <div id={id} className="rounded-xl border border-outline-variant/30 overflow-hidden scroll-mt-24">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
            {label}
          </span>
          <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
          {hasProvenance && needsReviewCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-error/10 text-error font-medium">
              {needsReviewCount} needs review
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasProvenance && (
            <button
              type="button"
              onClick={() => setShowProvenance(!showProvenance)}
              className={cn(
                'text-xs px-2 py-1 rounded-lg transition-colors',
                showProvenance
                  ? 'bg-secondary/10 text-secondary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container'
              )}
            >
              Provenance
            </button>
          )}
          <ConfidenceIndicator score={confidence} />
        </div>
      </div>

      {confidence < 0.7 && (
        <div className="px-4 py-2 bg-error/5 border-b border-error/10 text-xs text-error flex items-center gap-2">
          Low confidence — please review this section carefully.
        </div>
      )}

      <div className="p-4">
        {readOnly ? (
          hasProvenance && showProvenance ? (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {sentences.map((sentence, i) => {
                const matched = matchProvenance(sentence, provenance!);
                return (
                  <ProvenanceSentence
                    key={i}
                    sentence={sentence}
                    item={matched}
                    onClick={onSentenceClick}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{content}</p>
          )
        ) : isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full min-h-[120px] text-sm text-on-surface bg-transparent border-none outline-none resize-y leading-relaxed"
            autoFocus
          />
        ) : (
          <div
            onClick={handleEdit}
            className={cn(
              'text-sm whitespace-pre-wrap leading-relaxed cursor-text rounded-lg p-2 -m-2 hover:bg-surface-container-low transition-colors',
            )}
          >
            {hasProvenance && showProvenance ? (
              sentences.map((sentence, i) => {
                const matched = matchProvenance(sentence, provenance!);
                return (
                  <ProvenanceSentence
                    key={i}
                    sentence={sentence}
                    item={matched}
                  />
                );
              })
            ) : (
              <span className="text-on-surface-variant">
                {content || <span className="text-outline italic">Click to add content...</span>}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Provenance legend */}
      {hasProvenance && showProvenance && (
        <div className="px-4 py-2 border-t border-outline-variant/20 flex flex-wrap gap-3">
          {Object.entries(PROVENANCE_STYLES).map(([source, style]) => {
            const count = provenance!.filter((p) => p.source === source).length;
            if (count === 0) return null;
            return (
              <span key={source} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className={cn('w-2.5 h-2.5 rounded-sm border-l-2', style.bg, style.border)} />
                {style.label} ({count})
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
