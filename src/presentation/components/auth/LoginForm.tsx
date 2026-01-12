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
    <div className="min-h-screen bg-gradient-to-br from-[#fbf7da] via-[#f5efc8] to-[#fbf7da] flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd74a]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6a2818]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Image
            src="/gocho.png"
            alt="Bingo Carabobo"
            width={280}
            height={100}
            className="mx-auto mb-4 rounded-xl shadow-lg shadow-yellow-500/30"
          />
          <p className="text-[#6a2818] mt-2 font-bold">Sistema de Sorteo Profesional</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#6a2818] to-[#5a2010] rounded-2xl p-8 shadow-2xl border-2 border-[#ffd74a]/30">
          <h2 className="text-xl font-bold text-white text-center mb-6">Iniciar Sesión</h2>

          {/* Campo Usuario */}
          <div className="mb-4">
            <label className="block text-[#ffd74a] text-sm font-semibold mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full pl-10 pr-4 py-3 bg-[#fbf7da] border-2 border-[#6a2818] rounded-xl text-[#6a2818] placeholder-gray-500 focus:border-[#ffd74a] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="mb-6">
            <label className="block text-[#ffd74a] text-sm font-semibold mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-10 pr-12 py-3 bg-[#fbf7da] border-2 border-[#6a2818] rounded-xl text-[#6a2818] placeholder-gray-500 focus:border-[#ffd74a] focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ffd74a] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#ffd74a] to-[#e6c000] text-[#6a2818] font-bold text-lg rounded-xl 
              hover:from-[#ffe84d] hover:to-[#f0d000] transition-all shadow-lg shadow-yellow-500/30
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
        <p className="text-center text-[#6a2818]/70 text-sm mt-6 font-semibold">
          © 2024 Bingo Carabobo - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
