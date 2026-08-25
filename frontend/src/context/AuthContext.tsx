import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
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
    const res = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (res.data.session?.user.id) {
      saveActiveUserIdToStorage(res.data.session.user.id);
    }
    return { error: res.error };
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    const res = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name || 'StepNext User'
        }
      }
    });
    if (res.data.session?.user.id) {
      saveActiveUserIdToStorage(res.data.session.user.id);
    }
    return { error: res.error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
