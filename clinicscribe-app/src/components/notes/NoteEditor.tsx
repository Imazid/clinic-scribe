'use client';

import { SOAPSection } from './SOAPSection';
import { TranscriptViewer } from '@/components/consultations/TranscriptViewer';
import type { SOAPNote, ConfidenceScores, TranscriptSegment } from '@/lib/types';

interface NoteEditorProps {
  content: SOAPNote;
  confidence: ConfidenceScores;
  transcript: { fullText: string; segments: TranscriptSegment[] };
  onContentChange: (section: keyof SOAPNote, value: string) => void;
  readOnly?: boolean;
}

const sections: { key: keyof SOAPNote; title: string; label: string }[] = [
  { key: 'subjective', title: 'Subjective', label: 'S' },
  { key: 'objective', title: 'Objective', label: 'O' },
  { key: 'assessment', title: 'Assessment', label: 'A' },
  { key: 'plan', title: 'Plan', label: 'P' },
];

export function NoteEditor({ content, confidence, transcript, onContentChange, readOnly }: NoteEditorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Transcript (read-only) */}
      <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        <TranscriptViewer segments={transcript.segments} fullText={transcript.fullText} />
      </div>

      {/* Right: SOAP note (editable) */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SOAPSection
            key={section.key}
            title={section.title}
            label={section.label}
            content={content[section.key]}
            confidence={confidence[section.key]}
            onContentChange={(value) => onContentChange(section.key, value)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
