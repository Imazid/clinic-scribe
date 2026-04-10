'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Shield, Download, Copy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteApprovalBarProps {
  overallConfidence: number;
  isApproved: boolean;
  onApprove: () => void;
  onExportPDF: () => void;
  onCopyToClipboard: () => void;
  isApproving?: boolean;
  showCelebration?: boolean;
}

const PARTICLE_COLORS = [
  'bg-success', 'bg-secondary', 'bg-primary', 'bg-warning',
  'bg-success', 'bg-secondary', 'bg-primary', 'bg-warning',
];

function CelebrationOverlay() {
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -Math.random() * 300 - 80,
      rotate: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.6,
      duration: Math.random() * 0.6 + 0.8,
      delay: Math.random() * 0.2,
      size: Math.random() > 0.5 ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5',
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      shape: Math.random() > 0.3 ? 'rounded-full' : 'rounded-sm rotate-45',
    })),
  []);

  return (
    <motion.div
      key="celebration"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 pointer-events-none z-50"
    >
      {/* Particles burst from bottom-center */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute ${p.size} ${p.color} ${p.shape}`}
            initial={{ x: 0, y: 0, scale: p.scale, opacity: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: 0,
              opacity: 0,
              rotate: p.rotate,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Central success flash */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.6, times: [0, 0.5, 1] }}
      >
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-success" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function NoteApprovalBar({
  overallConfidence,
  isApproved,
  onApprove,
  onExportPDF,
  onCopyToClipboard,
  isApproving,
  showCelebration,
}: NoteApprovalBarProps) {
  return (
    <>
      <AnimatePresence>
        {showCelebration && <CelebrationOverlay />}
      </AnimatePresence>

      <div className="sticky bottom-0 bg-surface-container-lowest/90 backdrop-blur-lg border-t border-outline-variant/30 px-6 py-4 flex items-center justify-between rounded-b-xl relative">
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
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.08, 1], opacity: 1 }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-sm font-semibold"
              >
                <Shield className="w-4 h-4" /> Approved
              </motion.div>
            </>
          ) : (
            <Button onClick={onApprove} isLoading={isApproving}>
              <Shield className="w-4 h-4" /> Approve & Move to Tasks
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
