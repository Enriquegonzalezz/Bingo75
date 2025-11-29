'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/presentation/context/AuthContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(username, password);
    
    if (success) {
      toast.success('¡Bienvenido a Bingo Carabobo!');
    } else {
      toast.error('Credenciales incorrectas');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e14] via-[#124723] to-[#0a2e14] flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd402]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#68b258]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Bingo Carabobo"
            width={280}
            height={100}
            className="mx-auto mb-4 rounded-xl shadow-lg shadow-yellow-500/30"
          />
          <p className="text-[#f8df7e] mt-2">Sistema de Sorteo Profesional</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] rounded-2xl p-8 shadow-2xl border-2 border-[#ffd402]/30">
          <h2 className="text-xl font-bold text-white text-center mb-6">Iniciar Sesión</h2>

          {/* Campo Usuario */}
          <div className="mb-4">
            <label className="block text-[#f8df7e] text-sm font-semibold mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full pl-10 pr-4 py-3 bg-[#1d1d1b] border-2 border-[#3d3d3b] rounded-xl text-white placeholder-gray-500 focus:border-[#ffd402] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="mb-6">
            <label className="block text-[#f8df7e] text-sm font-semibold mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-10 pr-12 py-3 bg-[#1d1d1b] border-2 border-[#3d3d3b] rounded-xl text-white placeholder-gray-500 focus:border-[#ffd402] focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ffd402] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#ffd402] to-[#baa115] text-[#1d1d1b] font-bold text-lg rounded-xl 
              hover:from-[#ffe44a] hover:to-[#d4c01a] transition-all shadow-lg shadow-yellow-500/30
              disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[#f8df7e]/50 text-sm mt-6">
          © 2024 Bingo Carabobo - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
