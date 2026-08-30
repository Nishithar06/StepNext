import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppUser,
  getActiveUser,
  setActiveUser as saveActiveUserToStorage,
  clearActiveUser as clearActiveUserFromStorage,
  getDeterministicUserId
} from '../services/userService';

interface AuthContextType {
  user: AppUser | null;
  session: null;
  token: null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, pass?: string) => Promise<{ error: any }>;
  signUp: (email: string, pass?: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check locally persisted identity
    const savedUser = getActiveUser();
    if (savedUser && savedUser.id) {
      setUser(savedUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const loginOrRegister = async (email: string, name?: string): Promise<{ error: any }> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { error: new Error('Please enter a valid email address.') };
    }

    const userId = getDeterministicUserId(cleanEmail);
    const displayName = (name && name.trim()) || cleanEmail.split('@')[0] || 'User';

    const userObj: AppUser = {
      id: userId,
      email: cleanEmail,
      name: displayName,
      user_metadata: {
        name: displayName
      }
    };

    saveActiveUserToStorage(userObj);
    setUser(userObj);
    return { error: null };
  };

  const login = async (email: string, name?: string) => {
    return loginOrRegister(email, name);
  };

  const signInWithPassword = async (email: string, _pass?: string) => {
    return loginOrRegister(email);
  };

  const signUp = async (email: string, _pass?: string, name?: string) => {
    return loginOrRegister(email, name);
  };

  const signOut = async () => {
    clearActiveUserFromStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session: null, token: null, loading, login, signInWithPassword, signUp, signOut }}>
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
