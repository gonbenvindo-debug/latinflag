import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../types';
import { authService } from '../services/supabase';

interface AuthStore {
  user: Customer | null;
  supabaseUser: any;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: Partial<Customer>) => void;
  initializeAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      supabaseUser: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: true,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { data, error } = await authService.signIn(email, password);
          
          if (error) {
            set({ loading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Get customer profile from our database
            try {
              const { customerService } = await import('../services/supabase');
              const customerProfile = await customerService.getProfile();
              
              const isAdmin = customerProfile.email === process.env.REACT_APP_ADMIN_EMAIL;
              
              set({
                user: customerProfile,
                supabaseUser: data.user,
                token: data.session?.access_token || null,
                isAuthenticated: true,
                isAdmin,
                loading: false
              });
              
              return { success: true };
            } catch (profileError) {
              // User exists in Supabase but not in our customers table
              // Create customer record
              const { customerService } = await import('../services/supabase');
              const newCustomer = {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
                email: data.user.email!,
                phone: data.user.user_metadata?.phone || '',
                company_name: data.user.user_metadata?.company_name,
                company_tax_id: data.user.user_metadata?.company_tax_id,
                company_website: data.user.user_metadata?.company_website,
                is_guest: false,
                is_active: true,
                email_verified: data.user.email_confirmed_at ? true : false
              };

              // Note: This would need to be handled by a server function or RPC
              // For now, we'll create a basic customer object
              const customer = newCustomer as Customer;
              const isAdmin = customer.email === process.env.REACT_APP_ADMIN_EMAIL;
              
              set({
                user: customer,
                supabaseUser: data.user,
                token: data.session?.access_token || null,
                isAuthenticated: true,
                isAdmin,
                loading: false
              });
              
              return { success: true };
            }
          }
          
          return { success: false, error: 'Login failed' };
        } catch (error: any) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      signUp: async (email: string, password: string, userData: any) => {
        try {
          set({ loading: true });
          const { data, error } = await authService.signUp(email, password, userData);
          
          if (error) {
            set({ loading: false });
            return { success: false, error: error.message };
          }

          if (data.user && !data.session) {
            // Email confirmation required
            set({ loading: false });
            return { success: true };
          }

          if (data.user && data.session) {
            // Auto-signup (email confirmation disabled)
            const customer = {
              id: data.user.id,
              name: userData.name,
              email: data.user.email!,
              phone: userData.phone,
              company_name: userData.company_name,
              is_guest: false,
              is_active: true,
              email_verified: false,
              addresses: [],
              preferences: {
                newsletter: true,
                promotions: true
              }
            } as Customer;

            const isAdmin = customer.email === process.env.REACT_APP_ADMIN_EMAIL;
            
            set({
              user: customer,
              supabaseUser: data.user,
              token: data.session.access_token,
              isAuthenticated: true,
              isAdmin,
              loading: false
            });
            
            return { success: true };
          }
          
          return { success: false, error: 'Signup failed' };
        } catch (error: any) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        try {
          await authService.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          supabaseUser: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          loading: false
        });
      },

      updateUser: (userData: Partial<Customer>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      initializeAuth: () => {
        const initialize = async () => {
          try {
            const { data: { user } } = await authService.getCurrentUser();
            
            if (user) {
              // Get customer profile
              try {
                const { customerService } = await import('../services/supabase');
                const customerProfile = await customerService.getProfile();
                
                const isAdmin = customerProfile.email === process.env.REACT_APP_ADMIN_EMAIL;
                
                set({
                  user: customerProfile,
                  supabaseUser: user,
                  token: user.session?.access_token || null,
                  isAuthenticated: true,
                  isAdmin,
                  loading: false
                });
              } catch (error) {
                // User exists in Supabase but not in our database
                set({
                  user: null,
                  supabaseUser: user,
                  token: user.session?.access_token || null,
                  isAuthenticated: false,
                  isAdmin: false,
                  loading: false
                });
              }
            } else {
              set({
                user: null,
                supabaseUser: null,
                token: null,
                isAuthenticated: false,
                isAdmin: false,
                loading: false
              });
            }
          } catch (error) {
            set({
              user: null,
              supabaseUser: null,
              token: null,
              isAuthenticated: false,
              isAdmin: false,
              loading: false
            });
          }
        };

        initialize();

        // Listen for auth changes
        const { data: { subscription } } = authService.onAuthStateChange(
          async (event: any, session: any) => {
            if (event === 'SIGNED_IN' && session?.user) {
              try {
                const { customerService } = await import('../services/supabase');
                const customerProfile = await customerService.getProfile();
                
                const isAdmin = customerProfile.email === process.env.REACT_APP_ADMIN_EMAIL;
                
                set({
                  user: customerProfile,
                  supabaseUser: session.user,
                  token: session.access_token,
                  isAuthenticated: true,
                  isAdmin,
                  loading: false
                });
              } catch (error) {
                set({
                  user: null,
                  supabaseUser: session.user,
                  token: session.access_token,
                  isAuthenticated: false,
                  isAdmin: false,
                  loading: false
                });
              }
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                supabaseUser: null,
                token: null,
                isAuthenticated: false,
                isAdmin: false,
                loading: false
              });
            }
          }
        );

        return () => subscription.unsubscribe();
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        supabaseUser: state.supabaseUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
