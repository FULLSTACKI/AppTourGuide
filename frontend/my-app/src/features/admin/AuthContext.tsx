import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../../types/admin';
import { authService } from '../../services/adminService';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, displayName: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, validate token stored in localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .me()
      .then(res => {
        if (res.success && res.displayName) {
          setUser({ displayName: res.displayName, role: res.role ?? '' });
        } else {
          localStorage.removeItem('access_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token: string, displayName: string, role: string) => {
    localStorage.setItem('access_token', token);
    setUser({ displayName, role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
