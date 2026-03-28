'use client';

import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const router = useRouter();
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const profile = useAuthStore((s) => s.profile);
  const [showMenu, setShowMenu] = useState(false);

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

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-surface-container-high transition-colors">
          <Bell className="w-5 h-5 text-on-surface-variant" />
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
