'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContainer } from '@/components/ui/Toast';
import { CommandPalette } from '@/components/polish/CommandPalette';
import { KeyboardShortcuts } from '@/components/polish/KeyboardShortcuts';
import { NotificationsPanel } from '@/components/polish/NotificationsPanel';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setClinic = useAuthStore((s) => s.setClinic);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Auth error:', userError.message);
          setProfileError('Authentication error: ' + userError.message);
          setLoading(false);
          return;
        }
        if (!user) {
          console.warn('No authenticated user found');
          setLoading(false);
          window.location.href = '/login';
          return;
        }

        // Load profile — if missing (trigger didn't fire), create one
        const profileResult = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        let profileData = profileResult.data;
        const profileError = profileResult.error;

        if (profileError?.code === 'PGRST116') {
          console.log('No profile found, creating one...');
          const meta = user.user_metadata || {};
          const firstName = meta.first_name || meta.full_name?.split(' ')[0] || user.email?.split('@')[0] || '';
          const lastName = meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '';
          const clinicName = meta.clinic_name || `${firstName}'s Clinic`;

          // Create clinic
          const { data: newClinic, error: clinicCreateError } = await supabase
            .from('clinics')
            .insert({ name: clinicName, email: user.email || '' })
            .select()
            .single();

          if (clinicCreateError) {
            console.error('Failed to create clinic:', clinicCreateError.message);
            setProfileError('Failed to set up clinic: ' + clinicCreateError.message);
            setLoading(false);
            return;
          }

          // Create profile
          const { data: newProfile, error: profileCreateError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              clinic_id: newClinic.id,
              role: 'admin',
              first_name: firstName,
              last_name: lastName,
            })
            .select()
            .single();

          if (profileCreateError) {
            console.error('Failed to create profile:', profileCreateError.message);
            setProfileError('Failed to set up profile: ' + profileCreateError.message);
            setLoading(false);
            return;
          }

          profileData = newProfile;
          setClinic(newClinic);
        } else if (profileError) {
          console.error('Profile load error:', profileError.message);
          setProfileError('Could not load profile: ' + profileError.message);
          setLoading(false);
          return;
        }

        if (profileData) {
          setProfile(profileData);
          // Only fetch clinic if not already set above
          if (!useAuthStore.getState().clinic) {
            const { data: clinic } = await supabase
              .from('clinics')
              .select('*')
              .eq('id', profileData.clinic_id)
              .single();
            if (clinic) setClinic(clinic);
          }
        }
      } catch (err) {
        console.error('Unexpected error loading profile:', err);
        setProfileError('Unexpected error loading profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();

    // Listen for sign-out events (e.g., session revoked server-side)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => subscription.unsubscribe();
  }, [setProfile, setClinic, setLoading]);

  const pathname = usePathname();

  return (
    <div className="h-full">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:ml-[var(--sidebar-collapsed-width)]' : 'lg:ml-[var(--sidebar-width)]'
        )}
      >
        <Header />
        <main className="p-4 lg:p-8 min-h-[calc(100vh-var(--header-height))] min-w-0 overflow-x-hidden">
          {mounted && profileError ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-sm text-error">{profileError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-secondary text-on-secondary text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
      <ToastContainer />
      <CommandPalette />
      <KeyboardShortcuts />
      <NotificationsPanel />
    </div>
  );
}
