'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/core/utils/api';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // ─── MOCK DE DESENVOLVIMENTO ──────────────────────────────────────────────
    // TODO: remover este bloco quando o backend estiver acessível
    const MOCK_ENABLED = true;
    if (MOCK_ENABLED) {
      const mockToken = 'mock-token-dev';
      const mockUser: User = { id: '0', name: email.split('@')[0], email };
      localStorage.setItem('userToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      document.cookie = `userToken=${mockToken}; path=/; SameSite=Strict`;
      setUser(mockUser);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const resp = await fetch(`${API_URL}/mobile/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.message || 'Falha no login');
    }

    const loggedUser: User = {
      id: String(data.userId || ''),
      name: data.name || email.split('@')[0],
      email,
    };

    localStorage.setItem('userToken', data.access_token);
    localStorage.setItem('userData', JSON.stringify(loggedUser));
    document.cookie = `userToken=${data.access_token}; path=/; SameSite=Strict`;
    setUser(loggedUser);
  };

  const signOut = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    document.cookie = 'userToken=; path=/; max-age=0; SameSite=Strict';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
