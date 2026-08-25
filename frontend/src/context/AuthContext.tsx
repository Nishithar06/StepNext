import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  setActiveUserId as saveActiveUserIdToStorage,
  clearActiveUserId as clearActiveUserIdFromStorage
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
      // Check for locally persisted user
      const storedId = localStorage.getItem('stepnext_active_user_id');
      if (storedId) {
        setUser({ id: storedId, email: `${storedId}@stepnext.local`, user_metadata: { name: 'StepNext User' } } as any);
      }
      setLoading(false);
      return;
    }

    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user?.id) {
        saveActiveUserIdToStorage(initSession.user.id);
      }
      setLoading(false);
    }).catch(err => {
      console.warn('[AuthContext] Session init notice:', err);
      setLoading(false);
    });

    // Subscribe to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user?.id) {
        saveActiveUserIdToStorage(currentSession.user.id);
      } else {
        clearActiveUserIdFromStorage();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      // Direct local password login fallback
      const localUserId = 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      saveActiveUserIdToStorage(localUserId);
      const mockUser = { id: localUserId, email, user_metadata: { name: 'StepNext User' } } as any;
      setUser(mockUser);
      return { error: null };
    }

    const res = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (res.data.session?.user.id) {
      saveActiveUserIdToStorage(res.data.session.user.id);
      setUser(res.data.session.user);
      setSession(res.data.session);
    }
    return { error: res.error };
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    if (!isSupabaseConfigured) {
      // Direct local password signup fallback
      const localUserId = 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      saveActiveUserIdToStorage(localUserId);
      const mockUser = { id: localUserId, email, user_metadata: { name: name || 'StepNext User' } } as any;
      setUser(mockUser);
      return { error: null };
    }

    // Direct password signup without OTP
    const res = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name || 'StepNext User'
        }
      }
    });

    if (res.error) {
      return { error: res.error };
    }

    if (res.data.session?.user.id) {
      saveActiveUserIdToStorage(res.data.session.user.id);
      setUser(res.data.session.user);
      setSession(res.data.session);
    } else {
      // Immediate password login if signup succeeded
      const loginRes = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (loginRes.data.session?.user.id) {
        saveActiveUserIdToStorage(loginRes.data.session.user.id);
        setUser(loginRes.data.session.user);
        setSession(loginRes.data.session);
      }
    }

    return { error: null };
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
