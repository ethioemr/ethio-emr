import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;

  // Getters
  isAuthenticated: () => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,

      signUp: async (email, password, fullName) => {
        try {
          set({ error: null, loading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

          if (error) throw error;

          set({ user: null, loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      signIn: async (email, password) => {
        try {
          set({ error: null, loading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Load user profile
          await get().loadUser();
          set({ loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign in failed';
          set({ error: message, loading: false, user: null });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ error: null, loading: true });
          await supabase.auth.signOut();
          set({ user: null, loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign out failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      resetPassword: async (email) => {
        try {
          set({ error: null });

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) throw error;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password reset failed';
          set({ error: message });
          throw error;
        }
      },

      loadUser: async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();

          if (!authUser) {
            set({ user: null, loading: false });
            return;
          }

          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (error) throw error;

          set({ user: userData as User | null, loading: false });
        } catch (error) {
          console.error('Failed to load user:', error);
          set({ user: null, loading: false });
        }
      },

      updateProfile: async (data) => {
        try {
          set({ error: null });

          const { data: updated, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', get().user?.id)
            .select()
            .maybeSingle();

          if (error) throw error;

          set({ user: updated as User });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Profile update failed';
          set({ error: message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().user,

      hasRole: (roles) => roles.includes(get().user?.role as UserRole),

      canAccess: (requiredRoles) => {
        const user = get().user;
        if (!user) return false;
        return requiredRoles.includes(user.role as UserRole);
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
