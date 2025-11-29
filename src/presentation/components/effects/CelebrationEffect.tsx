'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface CelebrationEffectProps {
  tipo: 'ganador' | 'pavoso';
  activo: boolean;
  onComplete?: () => void;
}

// Colores del tema casino
const COLORES_CONFETTI = ['#ffd402', '#f8df7e', '#baa115', '#68b258', '#e91e63', '#9c27b0', '#ff9800'];
const COLORES_TRISTE = ['#666', '#888', '#555', '#777'];

export function CelebrationEffect({ tipo, activo, onComplete }: CelebrationEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const createParticle = useCallback((container: HTMLDivElement, isConfetti: boolean) => {
    const particle = document.createElement('div');
    const size = isConfetti ? gsap.utils.random(8, 16) : gsap.utils.random(20, 40);
    const colors = isConfetti ? COLORES_CONFETTI : COLORES_TRISTE;
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${isConfetti ? size * 0.6 : size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${isConfetti ? '2px' : '50%'};
      pointer-events: none;
      z-index: 9999;
    `;
    
    if (!isConfetti) {
      // Lágrimas para pavoso
      particle.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
      particle.innerHTML = tipo === 'pavoso' ? '' : '';
    }
    
    container.appendChild(particle);
    return particle;
  }, [tipo]);

  const animateGanador = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];
    const tl = gsap.timeline({ onComplete });
    timelineRef.current = tl;

    // Crear confetti
    for (let i = 0; i < 100; i++) {
      particles.push(createParticle(container, true) as HTMLDivElement);
    }
    particlesRef.current = particles;

    // Animar confetti cayendo desde arriba
    particles.forEach((particle, i) => {
      const startX = gsap.utils.random(0, window.innerWidth);
      const startY = -50;
      const endY = window.innerHeight + 100;
      const duration = gsap.utils.random(2, 4);
      const delay = gsap.utils.random(0, 1.5);

      gsap.set(particle, { x: startX, y: startY, rotation: 0, scale: 1 });

      tl.to(particle, {
        y: endY,
        x: `+=${gsap.utils.random(-200, 200)}`,
        rotation: gsap.utils.random(-720, 720),
        duration,
        ease: 'power1.out',
        delay,
      }, 0);

      // Efecto de brillo
      tl.to(particle, {
        scale: gsap.utils.random(0.5, 1.5),
        opacity: 0,
        duration: duration * 0.3,
        ease: 'power2.in',
      }, delay + duration * 0.7);
    });

    // Crear explosiones de fuegos artificiales
    const createFirework = (x: number, y: number, delay: number) => {
      for (let i = 0; i < 20; i++) {
        const spark = document.createElement('div');
        spark.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${COLORES_CONFETTI[Math.floor(Math.random() * COLORES_CONFETTI.length)]};
          border-radius: 50%;
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
          pointer-events: none;
          z-index: 9999;
        `;
        container.appendChild(spark);
        particles.push(spark as HTMLDivElement);

        const angle = (i / 20) * Math.PI * 2;
        const distance = gsap.utils.random(80, 200);
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;

        gsap.set(spark, { x, y, scale: 0 });
        
        tl.to(spark, {
          x: endX,
          y: endY,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          delay,
        }, 0);

        tl.to(spark, {
          opacity: 0,
          scale: 0,
          duration: 0.5,
          ease: 'power2.in',
        }, delay + 0.5);
      }
    };

    // Múltiples fuegos artificiales
    createFirework(window.innerWidth * 0.3, window.innerHeight * 0.3, 0);
    createFirework(window.innerWidth * 0.7, window.innerHeight * 0.25, 0.3);
    createFirework(window.innerWidth * 0.5, window.innerHeight * 0.4, 0.6);
    createFirework(window.innerWidth * 0.2, window.innerHeight * 0.5, 0.9);
    createFirework(window.innerWidth * 0.8, window.innerHeight * 0.45, 1.2);

    // Texto BINGO! animado
    const bingoText = document.createElement('div');
    bingoText.innerHTML = '🎉 ¡BINGO! 🎉';
    bingoText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 80px;
      font-weight: 900;
      color: #ffd402;
      text-shadow: 0 0 20px #ffd402, 0 0 40px #baa115, 4px 4px 0 #1d1d1b;
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
    `;
    container.appendChild(bingoText);

    gsap.fromTo(bingoText, 
      { scale: 0, rotation: -20, opacity: 0 },
      { 
        scale: 1, 
        rotation: 0, 
        opacity: 1, 
        duration: 0.6, 
        ease: 'back.out(1.7)',
        delay: 0.2 
      }
    );

    gsap.to(bingoText, {
      scale: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 5,
      ease: 'power1.inOut',
      delay: 0.8,
    });

    gsap.to(bingoText, {
      opacity: 0,
      scale: 1.5,
      duration: 0.5,
      delay: 3,
      onComplete: () => bingoText.remove(),
    });

  }, [createParticle, onComplete]);

  const animatePavoso = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];
    const tl = gsap.timeline({ onComplete });
    timelineRef.current = tl;

    // Crear lágrimas cayendo
    for (let i = 0; i < 30; i++) {
      const tear = document.createElement('div');
      tear.innerHTML = '💧';
      tear.style.cssText = `
        position: absolute;
        font-size: ${gsap.utils.random(20, 40)}px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.7;
      `;
      container.appendChild(tear);
      particles.push(tear as HTMLDivElement);

      const startX = gsap.utils.random(0, window.innerWidth);
      const startY = -50;
      const endY = window.innerHeight + 100;

      gsap.set(tear, { x: startX, y: startY });

      tl.to(tear, {
        y: endY,
        x: `+=${gsap.utils.random(-50, 50)}`,
        rotation: gsap.utils.random(-30, 30),
        duration: gsap.utils.random(2, 4),
        ease: 'power1.in',
        delay: gsap.utils.random(0, 2),
      }, 0);
    }

    particlesRef.current = particles;

    // Texto PAVOSO animado
    const pavosoText = document.createElement('div');
    pavosoText.innerHTML = '😅 PAVOSO 😅';
    pavosoText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 60px;
      font-weight: 900;
      color: #888;
      text-shadow: 2px 2px 0 #333;
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
    `;
    container.appendChild(pavosoText);

    // Animación de temblor triste
    gsap.fromTo(pavosoText,
      { scale: 0, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration: 0.5, 
        ease: 'back.out(1.2)',
      }
    );

    // Temblor
    gsap.to(pavosoText, {
      x: '+=5',
      duration: 0.05,
      yoyo: true,
      repeat: 20,
      ease: 'none',
      delay: 0.5,
    });

    gsap.to(pavosoText, {
      opacity: 0,
      y: '+=50',
      duration: 0.5,
      delay: 2.5,
      onComplete: () => pavosoText.remove(),
    });

    // Nubes grises de fondo
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div');
      cloud.innerHTML = '☁️';
      cloud.style.cssText = `
        position: absolute;
        font-size: ${gsap.utils.random(60, 100)}px;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.3;
        filter: grayscale(100%);
      `;
      container.appendChild(cloud);
      particles.push(cloud as HTMLDivElement);

      gsap.fromTo(cloud,
        { x: -100, y: gsap.utils.random(50, 200) },
        {
          x: window.innerWidth + 100,
          duration: gsap.utils.random(4, 8),
          ease: 'none',
          delay: gsap.utils.random(0, 2),
        }
      );
    }

  }, [onComplete]);

  useEffect(() => {
    if (!activo) return;

    if (tipo === 'ganador') {
      animateGanador();
    } else {
      animatePavoso();
    }

    return () => {
      // Limpiar
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      particlesRef.current.forEach(p => p.remove());
      particlesRef.current = [];
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [activo, tipo, animateGanador, animatePavoso]);

  if (!activo) return null;

  return (
    <>
      {/* Fondo con blur para resaltar la animación */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ zIndex: 9998 }}
      />
      {/* Contenedor de partículas */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 9999 }}
      />
    </>
  );
}
