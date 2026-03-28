import { Card, CardTitle } from '@/components/ui/Card';

interface NoteDiffProps {
  originalContent: string;
  editedContent: string;
  sectionTitle: string;
}

export function NoteDiff({ originalContent, editedContent, sectionTitle }: NoteDiffProps) {
  if (originalContent === editedContent) return null;

  return (
    <Card className="border border-warning/20">
      <CardTitle className="text-sm mb-3">Changes in {sectionTitle}</CardTitle>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="label-text text-error mb-1">Original</p>
          <p className="text-on-surface-variant bg-error/5 p-2 rounded-lg whitespace-pre-wrap">{originalContent}</p>
        </div>
        <div>
          <p className="label-text text-success mb-1">Edited</p>
          <p className="text-on-surface-variant bg-success/5 p-2 rounded-lg whitespace-pre-wrap">{editedContent}</p>
        </div>
      </div>
    </Card>
  );
}
