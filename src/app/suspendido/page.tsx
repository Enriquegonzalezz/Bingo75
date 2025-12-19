'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function SuspendidoPage() {
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();

    const preventKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (
        key === 'f5' ||
        (ctrl && (key === 'r' || key === 'l' || key === 'p' || key === 'u' || key === 's' || key === 'i' || key === 'j'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('keydown', preventKeys, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', preventKeys, { capture: true } as any);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a2e14] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center bg-[#1d1d1b] border-2 border-[#ffd402]/40 rounded-2xl p-10 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Logo"
            width={260}
            height={90}
            className="rounded-xl shadow-lg"
            priority
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#ffd402] mb-4">
          Sistema suspendido
        </h1>
        <p className="text-base md:text-lg text-[#f8df7e] mb-8">
          Contacte con el administrador para su renovación.
        </p>
        <div className="text-sm text-[#f8df7e]/60">
          Esta página se encuentra temporalmente inhabilitada.
        </div>
      </div>
    </div>
  );
}
