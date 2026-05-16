'use client';

import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';
import { Menu, Bell, LogOut, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const profile = useAuthStore((s) => s.profile);
  const [showMenu, setShowMenu] = useState(false);
  const [unread, setUnread] = useState(0);

  // The NotificationsPanel publishes its own count via a CustomEvent so the
  // header doesn't need to know about the panel's data fetcher.
  useEffect(() => {
    function onCount(e: Event) {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === 'number') setUnread(detail);
    }
    window.addEventListener('miraa:notifications:count', onCount);
    return () => window.removeEventListener('miraa:notifications:count', onCount);
  }, []);

  function openNotifications() {
    window.dispatchEvent(new Event('miraa:notifications:open'));
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="h-[var(--header-height)] bg-surface-container-lowest/80 backdrop-blur-lg border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={() => setSidebarMobileOpen(true)}
        className="lg:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors"
      >
        <Menu className="w-5 h-5 text-on-surface-variant" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* ⌘K search hint — clicking dispatches the keyboard shortcut so the
            same CommandPalette listener picks it up. */}
        <button
          type="button"
          onClick={() => {
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent),
              ctrlKey: !(typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent)),
              bubbles: true,
            });
            window.dispatchEvent(event);
          }}
          className="hidden md:inline-flex h-9 items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface px-3 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search anything</span>
          <span className="ml-2 inline-flex h-5 items-center gap-0.5 rounded border border-outline-variant/50 border-b-2 bg-surface-container-lowest px-1.5 font-mono text-[10px] font-semibold text-on-surface">
            ⌘K
          </span>
        </button>

        <button
          type="button"
          onClick={openNotifications}
          className="relative p-2 rounded-xl hover:bg-surface-container-high transition-colors"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <Bell className="w-5 h-5 text-on-surface-variant" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 font-mono text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-container-high transition-colors"
          >
            <Avatar
              firstName={profile?.first_name || 'U'}
              lastName={profile?.last_name || 'U'}
              imageUrl={profile?.avatar_url}
              size="sm"
            />
            {profile && (
              <span className="hidden sm:block text-sm font-medium text-on-surface">
                {profile.first_name} {profile.last_name}
              </span>
            )}
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/30 py-1 z-50">
                <button
                  onClick={() => { router.push('/settings/profile'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Profile Settings
                </button>
                <hr className="border-outline-variant/30 my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
