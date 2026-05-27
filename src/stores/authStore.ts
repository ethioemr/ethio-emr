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
  approval_status?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string, role: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
            return { success: false, error: error.message };
          }

          if (data.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (userError) {
              console.error('Error fetching user data:', userError);
              set({ error: 'Failed to fetch user profile', loading: false });
              return { success: false, error: 'Failed to fetch user profile' };
            }

            if (!userData) {
              // User exists in auth but not in users table - create profile
              const { data: newUserData, error: createError } = await supabase
                .from('users')
                .insert([{
                  id: data.user.id,
                  email: data.user.email,
                  full_name: data.user.user_metadata?.full_name || 'User',
                  role: 'patient',
                  phone: data.user.user_metadata?.phone || '',
                  approval_status: 'approved'
                }])
                .select()
                .single();

              if (createError) {
                console.error('Error creating user profile:', createError);
                set({ error: 'Failed to create user profile', loading: false });
                return { success: false, error: 'Failed to create user profile' };
              }

              set({ user: newUserData as User, loading: false, error: null });
              return { success: true };
            }

            // Check if user is approved
            if (userData.approval_status === 'pending') {
              set({ error: 'Your account is pending approval', loading: false });
              return { success: false, error: 'Your account is pending approval' };
            }

            if (userData.approval_status === 'rejected') {
              set({ error: 'Your account was not approved', loading: false });
              return { success: false, error: 'Your account was not approved' };
            }

            set({ user: userData as User, loading: false, error: null });
            return { success: true };
          }

          set({ loading: false });
          return { success: false, error: 'Unknown error occurred' };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign in failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
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

      updateProfile: async (data: Partial<User>) => {
        const user = get().user;
        if (!user) return;

        try {
          const { error } = await supabase
            .from('users')
            .update(data)
            .eq('id', user.id);

          if (error) throw error;

          set({ user: { ...user, ...data } });
        } catch (err) {
          console.error('Update profile error:', err);
          throw err;
        }
      },

      signUp: async (email: string, password: string, fullName: string, phone: string, role: string) => {
        set({ loading: true, error: null });
        try {
          // Check if this is the first user (will be admin)
          const { data: existingUsers } = await supabase
            .from('users')
            .select('id')
            .limit(1);

          const isFirstUser = !existingUsers || existingUsers.length === 0;
          const assignedRole = isFirstUser ? 'hospital_admin' : role;
          const approvalStatus = isFirstUser ? 'approved' : 'pending';

          // Sign up with Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone,
                role: assignedRole
              }
            }
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .insert([{
                id: data.user.id,
                email,
                full_name: fullName,
                role: assignedRole,
                phone,
                approval_status: approvalStatus
              }]);

            if (profileError) {
              console.error('Error creating profile:', profileError);
            }

            set({ loading: false });
            return {
              success: true,
              error: isFirstUser
                ? undefined
                : 'Registration successful! Please wait for admin approval.'
            };
          }

          set({ loading: false });
          return { success: false, error: 'Registration failed' };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      }
    }),
    {
      name: 'ethio-emr-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
