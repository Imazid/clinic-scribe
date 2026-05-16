'use client';

import { useCallback, useEffect, useState } from 'react';

export type NoteReviewLayout = 'single' | 'queue';

const STORAGE_KEY = 'miraa.noteReviewLayout';
const DEFAULT_LAYOUT: NoteReviewLayout = 'single';

function readStoredLayout(): NoteReviewLayout {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'queue' ? 'queue' : 'single';
  } catch {
    return DEFAULT_LAYOUT;
  }
}

/**
 * Per-device user preference for the note review experience.
 *
 * - `single` (default): clicking a pending note opens the full review page
 *   directly (today's behavior).
 * - `queue`: a /notes/queue index lists every pending note as a roomy verify
 *   card; clicking one opens the same review page.
 *
 * Stored in localStorage so the toggle persists across reloads without
 * requiring a Supabase migration. We can move this to `profiles.preferences`
 * later if cross-device sync becomes a need.
 */
export function useNoteReviewLayout(): {
  layout: NoteReviewLayout;
  setLayout: (next: NoteReviewLayout) => void;
  ready: boolean;
} {
  const [layout, setLayoutState] = useState<NoteReviewLayout>(DEFAULT_LAYOUT);
  const [ready, setReady] = useState(false);

  // Hydrate from storage after mount to avoid SSR mismatches. The state set
  // here intentionally happens once on mount — it's the standard pattern for
  // localStorage-backed preferences in client components.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayoutState(readStoredLayout());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  const setLayout = useCallback((next: NoteReviewLayout) => {
    setLayoutState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore — preference simply won't persist */
      }
    }
  }, []);

  return { layout, setLayout, ready };
}
