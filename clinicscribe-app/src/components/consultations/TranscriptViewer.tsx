import { Card, CardTitle } from '@/components/ui/Card';
import { formatDuration } from '@/lib/utils';
import type { TranscriptSegment } from '@/lib/types';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  fullText: string;
}

export function TranscriptViewer({ segments, fullText }: TranscriptViewerProps) {
  if (segments.length === 0 && fullText) {
    return (
      <Card>
        <CardTitle className="mb-4">Transcript</CardTitle>
        <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{fullText}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">Transcript</CardTitle>
      <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
        {segments.map((seg, i) => (
          <div key={i} data-segment={i} className="flex gap-3 group rounded-lg px-1 -mx-1 transition-all">
            <span className="text-xs text-outline font-mono shrink-0 pt-1 w-12">
              {formatDuration(Math.floor(seg.start))}
            </span>
            <div className="flex-1">
              {seg.speaker && (
                <span className="text-xs font-semibold text-secondary mr-2">{seg.speaker}</span>
              )}
              <span className="text-sm text-on-surface-variant leading-relaxed break-words">{seg.text}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
