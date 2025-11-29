'use client';

import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';

export interface DinamicasConfig {
  lineaHorizontal: boolean;
  lineaVertical: boolean;
  diagonal: boolean;
  cuatroEsquinas: boolean;
  rombo: boolean;
  cuadro3x3: boolean;
  letraX: boolean;
  pajarita: boolean;
  cartonLleno: boolean;
  pavoso: boolean;
}

interface DinamicasSelectorProps {
  dinamicas: DinamicasConfig;
  onChange: (dinamicas: DinamicasConfig) => void;
  disabled?: boolean;
}

interface DinamicaInfo {
  key: keyof DinamicasConfig;
  nombre: string;
  emoji: string;
}

const DINAMICAS: DinamicaInfo[] = [
  { key: 'lineaHorizontal', nombre: 'Línea Horizontal', emoji: '━' },
  { key: 'lineaVertical', nombre: 'Línea Vertical', emoji: '┃' },
  { key: 'diagonal', nombre: 'Diagonal', emoji: '╲' },
  { key: 'cuatroEsquinas', nombre: 'Cuatro Esquinas', emoji: '⬚' },
  { key: 'rombo', nombre: 'Rombo', emoji: '◆' },
  { key: 'cuadro3x3', nombre: 'Cuadro 3x3', emoji: '▦' },
  { key: 'letraX', nombre: 'Letra X', emoji: '✖' },
  { key: 'pajarita', nombre: 'Pajarita', emoji: '🎀' },
  { key: 'cartonLleno', nombre: 'Cartón Lleno', emoji: '▦' },
  { key: 'pavoso', nombre: 'Pavoso', emoji: '😅' },
];

export function DinamicasSelector({ dinamicas, onChange, disabled = false }: DinamicasSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: keyof DinamicasConfig) => {
    if (disabled) return;
    onChange({
      ...dinamicas,
      [key]: !dinamicas[key],
    });
  };

  const handleToggleAll = () => {
    if (disabled) return;
    const allActive = Object.values(dinamicas).every((v) => v);
    const newState = Object.keys(dinamicas).reduce(
      (acc, key) => ({ ...acc, [key]: !allActive }),
      {} as DinamicasConfig
    );
    onChange(newState);
  };

  const activasCount = Object.values(dinamicas).filter((v) => v).length;
  const allActive = activasCount === DINAMICAS.length;

  return (
    <div className="relative">
      {/* Botón Principal - Compacto */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
          disabled
            ? 'bg-[#1d1d1b] border-[#baa115] cursor-not-allowed'
            : 'bg-[#1d1d1b] border-[#ffd402] hover:border-[#68b258] hover:shadow-md cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#ffd402]" />
          <div className="text-left">
            <p className="font-bold text-[#ffd402]">Dinámicas del Juego</p>
            <p className="text-xs text-[#f8df7e]">
              {activasCount} de {DINAMICAS.length} activas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {disabled && (
            <span className="text-xs text-[#baa115] font-semibold">🔒 Bloqueado</span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-[#f8df7e]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#f8df7e]" />
          )}
        </div>
      </button>

      {/* Dropdown - Solo se muestra cuando está abierto */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1d1d1b] rounded-lg border-2 border-[#ffd402] shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header con botón de activar/desactivar todas */}
          <div className="sticky top-0 bg-[#1d1d1b] border-b-2 border-[#baa115] p-3">
            <button
              onClick={handleToggleAll}
              disabled={disabled}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                disabled
                  ? 'bg-[#124723] text-[#f8df7e] cursor-not-allowed opacity-50'
                  : allActive
                  ? 'bg-[#baa115] text-[#1d1d1b] hover:bg-[#ffd402]'
                  : 'bg-[#68b258] text-white hover:bg-[#124723]'
              }`}
            >
              {allActive ? '❌ Desactivar Todas' : '✅ Activar Todas'}
            </button>
          </div>

          {/* Lista de dinámicas */}
          <div className="p-2">
            {DINAMICAS.map((dinamica) => (
              <button
                key={dinamica.key}
                onClick={() => handleToggle(dinamica.key)}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-all ${
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-[#124723]'
                } ${
                  dinamicas[dinamica.key]
                    ? 'bg-[#68b258] border-2 border-[#ffd402]'
                    : 'bg-[#124723] border-2 border-[#baa115]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dinamica.emoji}</span>
                  <span className="font-semibold text-[#f8df7e]">{dinamica.nombre}</span>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    dinamicas[dinamica.key] ? 'bg-[#ffd402]' : 'bg-[#baa115]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      dinamicas[dinamica.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Footer con mensaje si está deshabilitado */}
          {disabled && (
            <div className="sticky bottom-0 bg-[#baa115] border-t-2 border-[#ffd402] p-3">
              <p className="text-xs text-[#1d1d1b] text-center font-semibold">
                ⚠️ No puedes cambiar las dinámicas durante el sorteo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
