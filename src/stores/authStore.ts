import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  photo_url?: string;
  bio?: string;
  department_id?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, loading: false });
            return;
          }

          if (data.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (userError) {
              console.error('Error fetching user data:', userError);
            }

            set({ user: userData as User, loading: false, error: null });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign in failed';
          set({ error: message, loading: false });
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          await supabase.auth.signOut();
          set({ user: null, loading: false });
        } catch (err) {
          console.error('Sign out error:', err);
          set({ loading: false });
        }
      },

      loadUser: async () => {
        set({ loading: true });
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();

          if (!authUser) {
            set({ user: null, loading: false });
            return;
          }

          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          set({ user: userData as User, loading: false });
        } catch (err) {
          console.error('Load user error:', err);
          set({ user: null, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ethio-emr-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
