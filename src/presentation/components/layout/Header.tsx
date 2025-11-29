'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { Home, PlayCircle, Grid3x3, LogOut } from 'lucide-react';
import { useAuth } from '@/presentation/context/AuthContext';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Tablero', href: '/tablero', icon: PlayCircle },
  { name: 'Cartones', href: '/cartones', icon: Grid3x3 },
];

export function Header() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="bg-[#124723] border-b-2 border-[#ffd402] sticky top-0 z-30 shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Bingo Carabobo"
              width={120}
              height={48}
              className="h-12 w-auto rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300',
                    isActive
                      ? 'bg-[#ffd402] text-[#1d1d1b] shadow-lg scale-105'
                      : 'text-[#f8df7e] hover:bg-[#ffd402]/20 hover:text-[#ffd402] hover:scale-105'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}

            {/* Botón Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 ml-2"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
