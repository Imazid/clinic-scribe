'use client';

import { useEffect, useState } from 'react';
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';

/**
 * Appearance — theme + density preferences. Stored on this device until
 * cross-device sync ships. Dark mode and density apply via a `data-*`
 * attribute on `<html>` so the rest of the app can hook in later.
 */

type Theme = 'system' | 'light' | 'dark';
type Density = 'comfortable' | 'compact';

const STORAGE_KEY = 'miraa.appearance.v1';

interface Prefs {
  theme: Theme;
  density: Density;
}

const DEFAULT: Prefs = { theme: 'system', density: 'comfortable' };

export default function AppearancePage() {
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
      // Reflect on <html> so future styling can read them.
      const root = document.documentElement;
      root.dataset.miraaTheme = prefs.theme;
      root.dataset.miraaDensity = prefs.density;
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-outline-variant/40 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[15px] font-bold">Theme</p>
            <p className="text-[12px] text-on-surface-variant">
              Follow the OS or pick a fixed colour mode.
            </p>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <ThemeCard
            icon={Monitor}
            label="System"
            sub="Match your OS setting."
            active={prefs.theme === 'system'}
            onClick={() => setPrefs((p) => ({ ...p, theme: 'system' }))}
          />
          <ThemeCard
            icon={Sun}
            label="Light"
            sub="Warm cream surfaces."
            active={prefs.theme === 'light'}
            onClick={() => setPrefs((p) => ({ ...p, theme: 'light' }))}
          />
          <ThemeCard
            icon={Moon}
            label="Dark"
            sub="Coming soon — preview only."
            active={prefs.theme === 'dark'}
            onClick={() => setPrefs((p) => ({ ...p, theme: 'dark' }))}
            soon
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant/40 px-5 py-4">
          <p className="text-[15px] font-bold">Density</p>
          <p className="text-[12px] text-on-surface-variant">
            How tight or roomy you want lists and cards.
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <DensityCard
            label="Comfortable"
            sub="Larger row heights, easier to read across the day."
            active={prefs.density === 'comfortable'}
            onClick={() => setPrefs((p) => ({ ...p, density: 'comfortable' }))}
          />
          <DensityCard
            label="Compact"
            sub="Tighter rows, more on screen at once."
            active={prefs.density === 'compact'}
            onClick={() => setPrefs((p) => ({ ...p, density: 'compact' }))}
          />
        </div>
      </Card>

      <p className="text-[11px] text-outline">
        Theme + density are stored on this device for now. Dark mode visual support is rolling out
        section-by-section — your selection is remembered so you&apos;ll be opted in automatically.
      </p>
    </div>
  );
}

function ThemeCard({
  icon: Icon,
  label,
  sub,
  active,
  onClick,
  soon,
}: {
  icon: typeof Monitor;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ' +
        (active
          ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20'
          : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40')
      }
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Icon className="h-4 w-4" />
        </div>
        {active && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
        {soon && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            Soon
          </span>
        )}
      </div>
      <p className="text-[14px] font-semibold">{label}</p>
      <p className="text-[12px] leading-relaxed text-on-surface-variant">{sub}</p>
    </button>
  );
}

function DensityCard({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-colors ' +
        (active
          ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20'
          : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40')
      }
    >
      <div className="flex w-full items-center justify-between">
        <p className="text-[14px] font-semibold">{label}</p>
        {active && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <p className="text-[12px] leading-relaxed text-on-surface-variant">{sub}</p>
    </button>
  );
}
