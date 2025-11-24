'use client';

import { CartonDTO } from '@/application/dtos/CartonDTO';
import { cn } from '@/shared/utils/cn';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';

interface CartonGridProps {
  carton: CartonDTO;
  size?: 'small' | 'medium' | 'large';
  numerosMarcados?: Set<number>;
}

const LETRAS = ['B', 'I', 'N', 'G', 'O'] as const;

export function CartonGrid({
  carton,
  size = 'medium',
  numerosMarcados = new Set(),
}: CartonGridProps) {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
  };

  const cellSizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-20 h-20',
  };

  const getColorLetra = (letra: string) => {
    return BINGO_CONSTANTS.COLORS[letra as keyof typeof BINGO_CONSTANTS.COLORS];
  };

  return (
    <div className="space-y-2">
      {/* Header BINGO */}
      <div className="grid grid-cols-5 gap-1">
        {LETRAS.map((letra) => (
          <div
            key={letra}
            className={cn(
              'rounded-lg font-bold text-white flex items-center justify-center py-2',
              sizeClasses[size]
            )}
            style={{ backgroundColor: getColorLetra(letra) }}
          >
            {letra}
          </div>
        ))}
      </div>

      {/* Grid de números */}
      <div className="grid grid-cols-5 gap-1">
        {carton.matriz.map((fila, filaIdx) =>
          fila.map((numero, colIdx) => {
            const esMarcado = numerosMarcados.has(numero);
            const esFree = numero === 0;

            return (
              <div
                key={`${filaIdx}-${colIdx}`}
                className={cn(
                  'rounded-lg font-bold flex items-center justify-center border-2 transition-all',
                  cellSizeClasses[size],
                  sizeClasses[size],
                  esFree && 'bg-gray-800 text-white border-gray-800',
                  !esFree && !esMarcado && 'bg-white text-gray-900 border-gray-300',
                  !esFree &&
                    esMarcado &&
                    'bg-yellow-400 text-gray-900 border-yellow-500 scale-105'
                )}
              >
                {esFree ? 'FREE' : numero}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
