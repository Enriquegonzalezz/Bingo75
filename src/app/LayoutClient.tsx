'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/presentation/context/AuthContext';
import { AuthGuard } from '@/presentation/components/auth/AuthGuard';
import { Header } from '@/presentation/components/layout/Header';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Header />
        <main className="min-h-screen">{children}</main>
      </AuthGuard>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
