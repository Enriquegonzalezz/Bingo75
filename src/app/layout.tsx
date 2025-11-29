import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/presentation/context/AuthContext';
import { AuthGuard } from '@/presentation/components/auth/AuthGuard';
import { Header } from '@/presentation/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bingo Carabobo - Sistema Profesional',
  description: 'Sistema completo de gestión de Bingo 75 con arquitectura escalable',
  keywords: ['bingo', 'bingo 75', 'sorteo', 'cartones', 'carabobo'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <Header />
            <main className="min-h-screen">{children}</main>
          </AuthGuard>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
