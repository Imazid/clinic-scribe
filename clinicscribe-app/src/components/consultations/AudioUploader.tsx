'use client';

import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Upload, FileAudio } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelected: (blob: Blob) => void;
}

export function AudioUploader({ onFileSelected }: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('audio/')) return;
    setFileName(file.name);
    onFileSelected(file);
  }, [onFileSelected]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        dragActive ? 'border-secondary bg-secondary/5' : 'border-outline-variant'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <div className="flex flex-col items-center py-8">
        {fileName ? (
          <>
            <FileAudio className="w-10 h-10 text-secondary mb-3" />
            <p className="text-sm font-medium text-on-surface">{fileName}</p>
            <p className="text-xs text-on-surface-variant mt-1">Click to change file</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-outline mb-3" />
            <p className="text-sm font-medium text-on-surface">Drop audio file here or click to browse</p>
            <p className="text-xs text-on-surface-variant mt-1">Supports MP3, WAV, M4A, WebM</p>
          </>
        )}
      </div>
    </Card>
  );
}
