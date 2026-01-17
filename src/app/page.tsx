'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, Grid3x3, Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Home() {
  const logoRef = useRef<HTMLDivElement>(null);
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
    <div className="min-h-screen bg-[#fbf7da]">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        {/* Hero - Flex Layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          {/* Logo - Izquierda */}
          <div className="flex items-center gap-6">
            <div ref={logoRef}>
              <Image
                src="/gocho.png"
                alt="Gocho"
                width={350}
                height={120}
                className=""
              />
            </div>
          </div>

          {/* Stats - Derecha */}
             <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Link href="/tablero">
            <div className="bg-[#6b2818] rounded-2xl shadow-xl p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-[#fbf7da]">
              <div className="w-16 h-16 bg-[#ffd402] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <PlayCircle className="w-9 h-9 text-[#124723]" />
              </div>
              <h2 className="text-3xl font-black text-[#ffd402] mb-3">
                Iniciar Sorteo
              </h2>
              <p className="text-[#fbf7da] text-lg">
                Sortea números manualmente y detecta ganadores automáticamente con validación en tiempo real
              </p>
            </div>
          </Link>

          <Link href="/cartones">
            <div className="bg-[#6b2818] rounded-2xl shadow-xl p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-[#fbf7da]">
              <div className="w-16 h-16 bg-[#ffd402] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Grid3x3 className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-black text-[#ffd402] mb-3">
                Ver Cartones
              </h2>
              <p className="text-[#fbf7da] text-lg">
                Explora los 10,000 cartones disponibles con búsqueda instantánea y visualización detallada
              </p>
            </div>
          </Link>

          <Link href="/importar">
            <div className="bg-[#6b2818] rounded-2xl shadow-xl p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-[#fbf7da]">
              <div className="w-16 h-16 bg-[#ffd402] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Upload className="w-9 h-9 text-[#124723]" />
              </div>
              <h2 className="text-3xl font-black text-[#ffd402] mb-3">
                Importar Excel
              </h2>
              <p className="text-[#fbf7da] text-lg">
                Importa tus cartones desde archivos Excel y gestiona tus paquetes personalizados
              </p>
            </div>
          </Link>
        </div>
        </div>

        {/* Main Actions */}
    

        {/* Quick Access */}
       

        
      </div>
    </div>
  );
}
