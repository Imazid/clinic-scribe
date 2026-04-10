'use client';

import { useCallback, useRef } from 'react';
import { SOAPSection } from './SOAPSection';
import { TranscriptViewer } from '@/components/consultations/TranscriptViewer';
import type { SOAPNote, ConfidenceScores, TranscriptSegment, NoteProvenanceItem } from '@/lib/types';

interface NoteEditorProps {
  content: SOAPNote;
  confidence: ConfidenceScores;
  transcript: { fullText: string; segments: TranscriptSegment[] };
  onContentChange: (section: keyof SOAPNote, value: string) => void;
  readOnly?: boolean;
  provenance?: NoteProvenanceItem[];
  editingSection?: keyof SOAPNote | null;
}

const sections: { key: keyof SOAPNote; title: string; label: string }[] = [
  { key: 'subjective', title: 'Subjective', label: 'S' },
  { key: 'objective', title: 'Objective', label: 'O' },
  { key: 'assessment', title: 'Assessment', label: 'A' },
  { key: 'plan', title: 'Plan', label: 'P' },
];

export function NoteEditor({ content, confidence, transcript, onContentChange, readOnly, provenance, editingSection }: NoteEditorProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  const handleSentenceClick = useCallback((sentence: string) => {
    if (!transcriptRef.current) return;
    const normalized = sentence.toLowerCase().trim();
    // Find the segment that best matches the clicked sentence
    const segments = transcriptRef.current.querySelectorAll('[data-segment]');
    for (const el of segments) {
      const text = (el.textContent ?? '').toLowerCase().trim();
      if (text.includes(normalized.slice(0, 40)) || normalized.includes(text.slice(0, 40))) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-secondary', 'rounded-lg');
        setTimeout(() => el.classList.remove('ring-2', 'ring-secondary', 'rounded-lg'), 2000);
        return;
      }
    }
  }, []);

  const getSectionProvenance = useCallback((sectionKey: keyof SOAPNote) => {
    if (!provenance) return undefined;
    const items = provenance.filter((p) => p.section === sectionKey);
    return items.length > 0 ? items : undefined;
  }, [provenance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Transcript (read-only) */}
      <div ref={transcriptRef} className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        <TranscriptViewer segments={transcript.segments} fullText={transcript.fullText} />
      </div>

      {/* Right: SOAP note (editable) */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SOAPSection
            key={section.key}
            id={`soap-${section.key}`}
            title={section.title}
            label={section.label}
            content={content[section.key]}
            confidence={confidence[section.key]}
            onContentChange={(value) => onContentChange(section.key, value)}
            readOnly={readOnly}
            autoEdit={editingSection === section.key}
            provenance={getSectionProvenance(section.key)}
            onSentenceClick={handleSentenceClick}
          />
        ))}
      </div>
    </div>
  );
}
