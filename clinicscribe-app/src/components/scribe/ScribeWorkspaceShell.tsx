'use client';

import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

interface ScribeWorkspaceShellProps {
  title: string;
  description: string;
  actions?: ReactNode;
  rail: ReactNode;
  metaBar: ReactNode;
  workspace: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function ScribeWorkspaceShell({
  title,
  description,
  actions,
  rail,
  metaBar,
  workspace,
  footer,
  className,
  children,
}: ScribeWorkspaceShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeader title={title} description={description} actions={actions} variant="feature" />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] border border-outline-variant/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(246,243,238,0.9)_100%)] shadow-ambient">
          {rail}
        </aside>

        <section className="space-y-4">
          <div className="overflow-visible rounded-[2rem] border border-outline-variant/50 bg-surface-container-lowest shadow-ambient-sm">
            {metaBar}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/50 bg-surface-container-lowest shadow-ambient">
            {workspace}
          </div>

          {footer ? (
            <div className="rounded-[1.5rem] border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 shadow-ambient-sm">
              {footer}
            </div>
          ) : null}
        </section>
      </div>

      {children}
    </div>
  );
}
