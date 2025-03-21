'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, User } from '@/hooks/useAuth';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 