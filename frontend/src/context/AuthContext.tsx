import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  getActiveUserId,
  setActiveUserId as saveActiveUserIdToStorage,
  clearActiveUserId as clearActiveUserIdFromStorage,
  getDeterministicUserId
} from '../services/userService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  signInWithPassword: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setUser(null);
      clearActiveUserIdFromStorage();
      setLoading(false);
      return;
    }

    // Initial Session Check - Supabase is the sole source of truth
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (initSession?.user?.id) {
        setSession(initSession);
        setUser(initSession.user);
        saveActiveUserIdToStorage(initSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        clearActiveUserIdFromStorage();
      }
      setLoading(false);
    }).catch(err => {
      console.warn('[AuthContext] Session init notice:', err);
      setSession(null);
      setUser(null);
      clearActiveUserIdFromStorage();
      setLoading(false);
    });

    // Subscribe to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (currentSession?.user?.id) {
        setSession(currentSession);
        setUser(currentSession.user);
        saveActiveUserIdToStorage(currentSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        clearActiveUserIdFromStorage();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase authentication is not configured. Please verify environment variables.') };
    }

    const res = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass
    });

    if (res.data.session?.user.id) {
      saveActiveUserIdToStorage(res.data.session.user.id);
      setUser(res.data.session.user);
      setSession(res.data.session);
      return { error: null };
    }

    return { error: res.error || new Error('Invalid email or password') };
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase authentication is not configured. Please verify environment variables.') };
    }

    const res = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: {
          name: name || 'StepNext User'
        }
      }
    });

    // Case 1: Session created immediately (auto-confirm enabled)
    if (res.data.session?.user.id) {
      saveActiveUserIdToStorage(res.data.session.user.id);
      setUser(res.data.session.user);
      setSession(res.data.session);
      return { error: null };
    }

    // Case 2: User registered but email confirmation is pending
    if (res.data.user?.id && !res.data.session) {
      return { error: new Error('Account created! Please check your email to confirm your account, then sign in.') };
    }

    // Case 3: If user already exists, sign in directly with password
    if (res.error?.message?.toLowerCase().includes('already registered') || res.error?.message?.toLowerCase().includes('already exists')) {
      return signInWithPassword(cleanEmail, pass);
    }

    return { error: res.error || new Error('Failed to create account') };
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext] Sign out notice:', err);
    } finally {
      clearActiveUserIdFromStorage();
      setSession(null);
      setUser(null);
    }
  };

  const token = session?.access_token ?? null;

  return (
    <AuthContext.Provider value={{ user, session, token, loading, signInWithPassword, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
