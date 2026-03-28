'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import {
  LayoutDashboard, Users, Stethoscope, BarChart3, Plug,
  ClipboardList, Settings, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Stethoscope, BarChart3, Plug, ClipboardList, Settings,
};

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Patients', href: '/patients', icon: 'Users' },
  { label: 'Consultations', href: '/consultations', icon: 'Stethoscope' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Integrations', href: '/integrations', icon: 'Plug' },
  { label: 'Audit Log', href: '/audit', icon: 'ClipboardList' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col transition-all duration-300',
          collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-[var(--header-height)] flex items-center px-5 border-b border-outline-variant/30">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-on-secondary" />
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-primary whitespace-nowrap">ClinicScribe</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-container-high"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                )}
              >
                {Icon && <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-secondary')} />}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex p-3 border-t border-outline-variant/30">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  );
}
