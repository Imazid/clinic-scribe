'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { SettingsSection } from '@/components/settings/SettingsRow';
import { useUIStore } from '@/lib/stores/ui-store';

type Theme = 'cream' | 'dark-ink' | 'paper';
type Density = 'comfortable' | 'compact';

const STORAGE_KEY = 'miraa.appearance.v2';

interface Prefs {
  theme: Theme;
  density: Density;
}

const DEFAULT: Prefs = { theme: 'cream', density: 'comfortable' };

const THEMES: Array<{
  id: Theme;
  label: string;
  sub: string;
  preview: string;
  textColor: string;
  shipped: boolean;
}> = [
  {
    id: 'cream',
    label: 'Cream',
    sub: 'Default. Warm cream surfaces with ink type.',
    preview: 'linear-gradient(135deg, #FCF9F4 0%, #F0EADD 100%)',
    textColor: '#1F1A14',
    shipped: true,
  },
  {
    id: 'dark-ink',
    label: 'Dark ink',
    sub: 'Inverted surfaces with cream type.',
    preview: 'linear-gradient(135deg, #2D2620 0%, #1F1A14 100%)',
    textColor: '#FCF9F4',
    shipped: false,
  },
  {
    id: 'paper',
    label: 'Paper',
    sub: 'Bright white with stronger contrast.',
    preview: 'linear-gradient(135deg, #FFFFFF 0%, #F4EFE5 100%)',
    textColor: '#2F5A7A',
    shipped: false,
  },
];

export default function AppearancePage() {
  const addToast = useUIStore((s) => s.addToast);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      document.documentElement.dataset.miraaTheme = prefs.theme;
      document.documentElement.dataset.miraaDensity = prefs.density;
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  function pickTheme(id: Theme) {
    const target = THEMES.find((t) => t.id === id);
    if (!target?.shipped) {
      addToast(`${target?.label ?? 'Theme'} ships next — selection saved as a preview.`, 'info');
    }
    setPrefs((p) => ({ ...p, theme: id }));
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        eyebrow="Theme"
        title="Pick a visual theme"
        description="Cream ships today. Dark ink and Paper are previewing — pick to opt in for the rollout."
      >
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {THEMES.map((t) => {
            const isActive = prefs.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTheme(t.id)}
                className={
                  'group relative overflow-hidden rounded-2xl border-[1.5px] text-left transition-colors ' +
                  (isActive
                    ? 'border-secondary'
                    : 'border-outline-variant hover:border-secondary/40')
                }
              >
                <div
                  className="relative flex h-[100px] items-center justify-center"
                  style={{ background: t.preview }}
                >
                  <span
                    className="font-display text-[36px] italic"
                    style={{ color: t.textColor }}
                  >
                    Aa
                  </span>
                  {isActive && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-on-secondary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                  {!t.shipped && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface">
                      Preview
                    </span>
                  )}
                </div>
                <div className="bg-surface-container-lowest px-4 py-3">
                  <p className="text-[13px] font-semibold text-on-surface">{t.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">{t.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Density"
        title="Layout density"
        description="How tight or roomy lists and cards should be."
      >
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {(
            [
              { id: 'comfortable' as Density, label: 'Comfortable', sub: 'Roomier rows, easier across the day.' },
              { id: 'compact' as Density, label: 'Compact', sub: 'Tighter rows, more on screen.' },
            ] as const
          ).map((opt) => {
            const isActive = prefs.density === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, density: opt.id }))}
                className={
                  'flex items-center justify-between gap-2 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors ' +
                  (isActive
                    ? 'border-secondary bg-secondary-fixed text-secondary'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40')
                }
              >
                <div>
                  <p className="text-[13px] font-semibold">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">{opt.sub}</p>
                </div>
                {isActive && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-on-secondary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <p className="text-[11px] text-outline">
        Stored on this device. Cross-device sync ships with the next backend rollout.
      </p>
    </div>
  );
}
