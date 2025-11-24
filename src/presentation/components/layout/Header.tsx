'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { Home, PlayCircle, Grid3x3 } from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Tablero', href: '/tablero', icon: PlayCircle },
  { name: 'Cartones', href: '/cartones', icon: Grid3x3 },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-black text-2xl">B</span>
            </div>
            <span className="text-2xl font-black text-gray-900">
              BINGO 75
            </span>
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
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600 hover:scale-105'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
