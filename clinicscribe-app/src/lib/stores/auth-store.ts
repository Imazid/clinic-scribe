import { create } from 'zustand';
import type { Profile, Clinic } from '@/lib/types';

interface AuthState {
  profile: Profile | null;
  clinic: Clinic | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setClinic: (clinic: Clinic | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  clinic: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setClinic: (clinic) => set({ clinic }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, clinic: null, isLoading: false }),
}));
