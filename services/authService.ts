
import { UserProfile } from '../types';
import { supabase } from './supabaseClient';

/**
 * AUTHENTICATION SERVICE
 */

// --- SHARED UTILITIES ---

// --- CONFIG ---
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api';

const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.innerText = input;
  return div.innerHTML;
};

const getRedirectUrl = () => {
  // If we have a deployment URL, use that as base for redirect
  if (import.meta.env.VITE_APP_URL) {
    return `${import.meta.env.VITE_APP_URL}`;
  }
  return 'http://localhost:3000';
};


const verifyEmailExists = async (email: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error("The email provided does not exist");
  }
  const domain = email.split('@')[1];
  const invalidDomains = ['test.com', 'example.com', 'fake.com', 'email.com', 'void.com', 'asdf.com'];
  if (invalidDomains.includes(domain)) {
    throw new Error("The email provided does not exist");
  }
};

// --- MOCK DATABASE (FALLBACK) ---
const DB_KEY = 'voyageur_users_db';
const SESSION_KEY = 'voyageur_session';

interface DBUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

const getMockDatabase = (): DBUser[] => {
  if (typeof localStorage === 'undefined') return [];
  const db = localStorage.getItem(DB_KEY);
  return db ? JSON.parse(db) : [];
};

const saveMockDatabase = (users: DBUser[]) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

const hashPasswordMock = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};


// --- EXPORTED SERVICE ---

export const authService = {



  async signup(fullName: string, email: string, password: string): Promise<UserProfile> {
    const cleanName = sanitizeInput(fullName);
    const cleanEmail = sanitizeInput(email).toLowerCase();

    // Call Backend API
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: password,
        fullName: cleanName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    // Backend returns { user, session }
    return {
      id: data.user.id,
      fullName: data.user.user_metadata.full_name || cleanName,
      email: data.user.email || cleanEmail,
      createdAt: new Date(data.user.created_at).getTime()
    };
  },

  async login(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = sanitizeInput(email).toLowerCase();

    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    return {
      id: data.user.id,
      fullName: data.user.user_metadata.full_name || "Traveler",
      email: data.user.email || cleanEmail,
      createdAt: new Date(data.user.created_at).getTime()
    };
  },

  // --- GOOGLE AUTH ---
  async loginWithGoogle(isSignup: boolean = false) {
    if (!supabase) throw new Error("Supabase is not configured");
    const redirectUrl = getRedirectUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: isSignup ? 'consent' : 'select_account',
        },
      },
    });
    if (error) throw error;
  },

  // --- PASSWORDLESS / OTP ---
  async loginWithOtp(email: string) {
    if (!supabase) throw new Error("Supabase is not configured");
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail });
    if (error) throw error;
  },

  async verifyOtp(email: string, token: string, type: 'signup' | 'email' = 'email'): Promise<UserProfile> {
    if (!supabase) throw new Error("Supabase is not configured");
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanToken = sanitizeInput(token);

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: type
    });

    if (error) throw new Error(error.message || "Invalid code");
    if (!data.user) throw new Error("Verification failed");

    return {
      id: data.user.id,
      fullName: data.user.user_metadata.full_name || "Traveler",
      email: data.user.email || cleanEmail,
      createdAt: new Date(data.user.created_at).getTime()
    };
  },

  async logout() {
    if (supabase) await supabase.auth.signOut();
  },

  async deleteAccount(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  async resendConfirmation(email: string) {
    if (supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
    }
  },

  // --- FORGOT PASSWORD (OTP FLOW) ---

  async requestForgotOtp(email: string): Promise<{ message: string; success: boolean }> {
    const cleanEmail = sanitizeInput(email).toLowerCase();

    console.log(`[AuthService] Requesting OTP for ${cleanEmail}...`);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-otp-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      console.log(`[AuthService] Response status: ${response.status}`);

      const data = await response.json();
      return {
        message: data.message || "Request processed.",
        success: data.success ?? true
      };
    } catch (e) {
      console.error("[AuthService] Fetch Error:", e);
      throw e;
    }
  },

  async verifyForgotOtp(email: string, otp: string): Promise<{ message: string; success: boolean; resetToken?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      return {
        message: data.message,
        success: data.success,
        resetToken: data.resetToken
      };
    } catch (e) {
      console.error("[AuthService] Verify Error:", e);
      throw e;
    }
  },

  async resetPasswordWithOtp(email: string, resetToken: string, newPassword: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Reset failed");
      }

      return {
        message: data.message,
        success: data.success
      };
    } catch (e) {
      console.error("[AuthService] Reset Error:", e);
      throw e;
    }
  }
};
