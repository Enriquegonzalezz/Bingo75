import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutClient } from './LayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bingoelgocho - Sistema Profesional',
  description: 'Sistema completo de gestión de Bingo 75 con arquitectura escalable',
  keywords: ['bingo', 'bingo 75', 'sorteo', 'cartones', 'gocho'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
