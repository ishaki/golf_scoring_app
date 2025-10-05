import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Authentication Store
 * Manages user authentication state and operations
 */
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  session: null,
  loading: true,
  error: null,

  // Actions

  /**
   * Initialize auth state
   * Call this on app mount to check for existing session
   */
  initialize: async () => {
    try {
      set({ loading: true, error: null });

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        set({ user, session, loading: false });
      } else {
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, session: null, loading: false, error: error.message });
    }
  },

  /**
   * Sign up new user
   * @param {string} email
   * @param {string} password
   * @param {string} displayName
   */
  signUp: async (email, password, displayName) => {
    try {
      set({ loading: true, error: null });

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Note: User will need to verify email before they can log in
      set({ loading: false });

      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Sign in existing user
   * @param {string} email
   * @param {string} password
   */
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, session: data.session, loading: false });

      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Sign in with Google OAuth
   * V2.1: New Google OAuth integration
   */
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // OAuth will redirect, no need to update state here
      return { success: true, data };
    } catch (error) {
      console.error('Google sign in error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({ user: null, session: null, loading: false });

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Send password reset email
   * @param {string} email
   */
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      set({ loading: false });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Update user password
   * @param {string} newPassword
   */
  updatePassword: async (newPassword) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      set({ loading: false });

      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {object} updates - Fields to update
   */
  updateProfile: async (updates) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      set({ user: data.user, loading: false });

      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Resend verification email
   */
  resendVerification: async () => {
    try {
      set({ loading: true, error: null });

      const { user } = get();
      if (!user?.email) {
        throw new Error('No user email found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      set({ loading: false });

      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Check if user's email is verified
   * @returns {boolean}
   */
  isEmailVerified: () => {
    const { user } = get();
    return user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Set auth state manually (for auth state change listener)
   * @param {object} user
   * @param {object} session
   */
  setAuthState: (user, session) => {
    set({ user, session });
  },
}));

export default useAuthStore;
