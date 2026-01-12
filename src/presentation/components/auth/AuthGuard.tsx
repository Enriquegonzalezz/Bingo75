'use client';

import { useAuth } from '@/presentation/context/AuthContext';
import { LoginForm } from './LoginForm';
import { RefreshCw } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a2e14] via-[#124723] to-[#0a2e14] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#000] animate-spin mx-auto mb-4" />
          <p className="text-[#000]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
