import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/presentation/components/layout/Header';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bingo 75 - Sistema Profesional',
  description: 'Sistema completo de gestión de Bingo 75 con arquitectura escalable',
  keywords: ['bingo', 'bingo 75', 'sorteo', 'cartones'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
