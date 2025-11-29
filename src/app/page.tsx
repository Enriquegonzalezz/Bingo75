'use client';

import Link from 'next/link';
import { PlayCircle, Grid3x3 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Home() {
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del logo
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: 'back.out(1.7)',
      });

      // Animación del título
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power3.out',
      });

      // Animación de las cards
      gsap.from(cardsRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        delay: 0.5,
        ease: 'power3.out',
      });

      // Animación de stats
      gsap.from(statsRef.current?.children || [], {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.15,
        delay: 0.9,
        ease: 'back.out(1.7)',
      });
    });

    return () => ctx.revert();
  }, []);
  return (
    <div className="min-h-screen bg-[#124723]">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        {/* Hero - Flex Layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          {/* Logo y Título - Izquierda */}
          <div className="flex items-center gap-6">
            <div ref={logoRef}>
              <div className="w-20 h-20 md:w-28 md:h-28 bg-[#ffd402] rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-[#124723] font-black text-4xl md:text-6xl">B</span>
              </div>
            </div>
            <h1 ref={titleRef} className="text-5xl md:text-7xl font-black text-[#ffd402]">
              BINGO CARABOBO
            </h1>
          </div>

          {/* Stats - Derecha */}
          <div ref={statsRef} className="flex gap-6">
            <div className="text-center bg-[#1d1d1b] rounded-xl p-6 shadow-lg border-2 border-[#ffd402]">
              <p className="text-4xl font-black text-[#ffd402] mb-1">75</p>
              <p className="text-xs font-semibold text-[#f8df7e] uppercase tracking-wide">Números</p>
            </div>
            <div className="text-center bg-[#1d1d1b] rounded-xl p-6 shadow-lg border-2 border-[#68b258]">
              <p className="text-4xl font-black text-[#68b258] mb-1">5×5</p>
              <p className="text-xs font-semibold text-[#f8df7e] uppercase tracking-wide">Cartón</p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link href="/tablero">
            <div className="bg-[#1d1d1b] rounded-2xl shadow-xl p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-[#ffd402]">
              <div className="w-16 h-16 bg-[#ffd402] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <PlayCircle className="w-9 h-9 text-[#124723]" />
              </div>
              <h2 className="text-3xl font-black text-[#ffd402] mb-3">
                Iniciar Sorteo
              </h2>
              <p className="text-[#f8df7e] text-lg">
                Sortea números manualmente y detecta ganadores automáticamente con validación en tiempo real
              </p>
            </div>
          </Link>

          <Link href="/cartones">
            <div className="bg-[#1d1d1b] rounded-2xl shadow-xl p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-[#68b258]">
              <div className="w-16 h-16 bg-[#68b258] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Grid3x3 className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-black text-[#68b258] mb-3">
                Ver Cartones
              </h2>
              <p className="text-[#f8df7e] text-lg">
                Explora los 10,000 cartones disponibles con búsqueda instantánea y visualización detallada
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Access */}
       

        
      </div>
    </div>
  );
}
