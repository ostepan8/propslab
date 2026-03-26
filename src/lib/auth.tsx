'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isPro: boolean;
  isElite: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  isAuthenticated: false,
  isPro: false,
  isElite: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('propslab_user');
    const token = localStorage.getItem('propslab_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('propslab_user');
        localStorage.removeItem('propslab_token');
      }
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!user;
  const isPro = user?.tier === 'pro' || user?.tier === 'elite';
  const isElite = user?.tier === 'elite';

  return (
    <AuthContext.Provider value={{ user, loading, setUser, isAuthenticated, isPro, isElite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
