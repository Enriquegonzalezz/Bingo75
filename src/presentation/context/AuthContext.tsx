'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================
// CREDENCIALES - Cambiar aquí si es necesario
// ============================================
const USUARIO = 'admin';
const CLAVE = 'bingo2026';
// ============================================

interface AuthContextType {
  isAuthenticated: boolean;
  login: (usuario: string, clave: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('bingo_auth') === 'ok');
    setIsLoading(false);
  }, []);

  const login = (usuario: string, clave: string): boolean => {
    if (usuario === USUARIO && clave === CLAVE) {
      setIsAuthenticated(true);
      localStorage.setItem('bingo_auth', 'ok');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bingo_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
