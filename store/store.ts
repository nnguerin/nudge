import { UserProfile } from '@/types';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

export interface AppState {
  // authentication
  session: Session | null;
  profile: UserProfile;
  authIsLoading: boolean;
  setAuthIsLoading: (loading: boolean) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // bears
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useStore = create<AppState>((set) => ({
  //authentication
  session: null,
  profile: null,
  authIsLoading: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setAuthIsLoading: (loading) => set({ authIsLoading: loading }),
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // bears
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));
