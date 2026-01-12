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
    <header className="bg-[#fbf7da] border-b-2 border-[#6a2818] sticky top-0 z-30 shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-center h-16">
          {/* Logo */}
         

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
                      ? 'bg-[#6a2818] text-[white] shadow-lg scale-105'
                      : 'text-[white] bg-[#6a2818]/20 hover:text-[#6a2818] hover:scale-105'
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-red-400 hover:bg-red-500 hover:text-red-300 transition-all duration-300 ml-2"
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
