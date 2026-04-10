'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { PatientSummary } from '@/lib/types';
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  MessageSquare,
  Pencil,
  Printer,
  X,
} from 'lucide-react';

interface PatientSummaryCardProps {
  summary?: PatientSummary | null;
  pending?: boolean;
}

type Channel = 'print' | 'sms' | 'email';

const CHANNEL_TABS: { id: Channel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'print', label: 'Print', icon: Printer },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
];

const SMS_CHAR_LIMIT = 480;

const READING_LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  grade_5: { label: 'Grade 5', color: 'text-success' },
  grade_6: { label: 'Grade 6', color: 'text-success' },
  grade_7: { label: 'Grade 7', color: 'text-info' },
  grade_8: { label: 'Grade 8', color: 'text-info' },
  grade_9: { label: 'Grade 9', color: 'text-warning' },
  grade_10: { label: 'Grade 10', color: 'text-warning' },
};

function getReadingLevelConfig(level: string) {
  return READING_LEVEL_CONFIG[level] ?? { label: level.replace('_', ' '), color: 'text-on-surface-variant' };
}

function SummaryList({ title, items, urgency = false }: { title: string; items: string[]; urgency?: boolean }) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className={cn('text-sm font-semibold mb-2', urgency ? 'text-error' : 'text-on-surface')}>
        {urgency && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${title}-${item}`}
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              urgency
                ? 'bg-error/5 text-error ring-1 ring-error/20'
                : 'bg-surface-container-low text-on-surface-variant'
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildSmsVersion(summary: PatientSummary): string {
  const parts: string[] = [];
  parts.push(summary.heading);
  if (summary.key_points.length > 0) {
    parts.push(summary.key_points.slice(0, 2).join('. '));
  }
  if (summary.next_steps.length > 0) {
    parts.push('Next: ' + summary.next_steps[0]);
  }
  if (summary.seek_help.length > 0) {
    parts.push('Urgent: ' + summary.seek_help[0]);
  }
  return parts.join('\n');
}

function buildEmailVersion(summary: PatientSummary): { subject: string; body: string } {
  const subject = `Your visit summary — ${summary.heading}`;
  const sections: string[] = [];

  sections.push(summary.plain_language_summary);

  if (summary.key_points.length > 0) {
    sections.push('Key Points:\n' + summary.key_points.map((p) => `• ${p}`).join('\n'));
  }
  if (summary.medication_changes.length > 0) {
    sections.push('Medication Changes:\n' + summary.medication_changes.map((m) => `• ${m}`).join('\n'));
  }
  if (summary.next_steps.length > 0) {
    sections.push('Next Steps:\n' + summary.next_steps.map((s) => `• ${s}`).join('\n'));
  }
  if (summary.seek_help.length > 0) {
    sections.push('Get help urgently if:\n' + summary.seek_help.map((h) => `⚠ ${h}`).join('\n'));
  }

  return { subject, body: sections.join('\n\n') };
}

export function PatientSummaryCard({
  summary,
  pending = false,
}: PatientSummaryCardProps) {
  const [channel, setChannel] = useState<Channel>('print');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [copied, setCopied] = useState(false);

  const smsText = useMemo(() => (summary ? buildSmsVersion(summary) : ''), [summary]);
  const emailData = useMemo(() => (summary ? buildEmailVersion(summary) : null), [summary]);
  const readingLevel = summary ? getReadingLevelConfig(summary.reading_level) : null;

  if (!summary && !pending) return null;

  function handleStartEdit() {
    if (!summary) return;
    const text = channel === 'sms' ? smsText :
                 channel === 'email' ? (emailData?.body ?? '') :
                 summary.plain_language_summary;
    setEditText(text);
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditText('');
  }

  async function handleCopyToClipboard() {
    const text = editing ? editText :
                 channel === 'sms' ? smsText :
                 channel === 'email' ? (emailData?.body ?? '') :
                 summary?.plain_language_summary ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard API not available */ }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-secondary" />
          <CardTitle>Patient-Friendly Summary</CardTitle>
        </div>
        {summary && readingLevel && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <Globe className="w-3 h-3" />
              {summary.language.toUpperCase()}
            </span>
            <span className={cn('flex items-center gap-1 text-xs font-medium', readingLevel.color)}>
              <GraduationCap className="w-3.5 h-3.5" />
              {readingLevel.label}
            </span>
          </div>
        )}
      </div>

      {summary ? (
        <div className="space-y-4">
          {/* Channel tabs */}
          <div className="flex items-center gap-1 border-b border-outline-variant/20 pb-px">
            {CHANNEL_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setChannel(tab.id); setEditing(false); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors -mb-px',
                    channel === tab.id
                      ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Channel content */}
          <div className="rounded-xl bg-secondary/5 px-4 py-3">
            {/* Email subject */}
            {channel === 'email' && emailData && (
              <div className="mb-3 rounded-lg bg-surface-container px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Subject</p>
                <p className="mt-1 text-sm text-on-surface">{emailData.subject}</p>
              </div>
            )}

            {/* Heading */}
            <p className="text-sm font-semibold text-on-surface mb-2">{summary.heading}</p>

            {/* Body — editable or read-only */}
            {editing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-sm text-on-surface bg-surface-container-lowest rounded-lg px-3 py-2 border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/30 min-h-[120px] resize-y"
                rows={8}
              />
            ) : (
              <p className="text-sm text-on-surface-variant whitespace-pre-wrap">
                {channel === 'sms' ? smsText :
                 channel === 'email' ? emailData?.body :
                 summary.plain_language_summary}
              </p>
            )}

            {/* SMS character count */}
            {channel === 'sms' && (
              <p className={cn(
                'mt-2 text-xs',
                (editing ? editText.length : smsText.length) > SMS_CHAR_LIMIT ? 'text-error font-medium' : 'text-on-surface-variant'
              )}>
                {editing ? editText.length : smsText.length}/{SMS_CHAR_LIMIT} characters
              </p>
            )}
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-white transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Done editing
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit before sending
              </button>
            )}
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={cn(
                'flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                copied ? 'bg-success/10 text-success' : 'text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy to clipboard'}
            </button>
          </div>

          {/* Structured sections (print/email only, collapsed for SMS) */}
          {channel !== 'sms' && (
            <div className="space-y-4">
              <SummaryList title="Key Points" items={summary.key_points} />
              <SummaryList title="Medication Changes" items={summary.medication_changes} />
              <SummaryList title="Next Steps" items={summary.next_steps} />
              <SummaryList title="Get Help Urgently If" items={summary.seek_help} urgency />
            </div>
          )}

          {/* Red flags always visible */}
          {channel === 'sms' && summary.seek_help.length > 0 && (
            <SummaryList title="Get Help Urgently If" items={summary.seek_help} urgency />
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
          This after-visit summary will be generated when the note is approved. It is designed to give the patient a plain-English explanation, next steps, medication changes, urgent safety advice, and a ready-to-email family update draft.
        </div>
      )}
    </Card>
  );
}
