'use client';

import { X, Trophy } from 'lucide-react';
import { Ganador } from '@/presentation/hooks/useSorteoV2';
import { getModalidadById } from '@/shared/constants/modalidades';

interface CartonGanadorModalProps {
  ganador: Ganador | null;
  numerosSorteados: number[];
  onClose: () => void;
}

export function CartonGanadorModal({ ganador, numerosSorteados, onClose }: CartonGanadorModalProps) {
  if (!ganador) return null;

  const modalidad = getModalidadById(ganador.patronId);
  const numerosSet = new Set(numerosSorteados);

  // Patrón vacío para Pavoso (no tiene patrón visual)
  const patronVacio = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ];

  // Obtener el patrón para mostrar
  const patron = ganador.tipo === 'pavoso' ? patronVacio : (modalidad?.patron || patronVacio);

  return (
    <div className="fixed inset-0 bg-[#124723] z-100 flex flex-col" style={{ height: '100dvh', maxHeight: '100dvh' }}>
      {/* Header - Número del cartón GIGANTE centrado */}
      <div className="bg-linear-to-r from-[#ffd402] to-[#baa115] py-2 md:py-4 px-4 shrink-0">
        <div className="flex flex-col items-center justify-center">
          {/* Número del cartón GIGANTE */}
          <p className="text-[#124723] font-black text-5xl md:text-7xl lg:text-8xl leading-none">
            #{ganador.numero_carton}
          </p>
          {/* Tipo de ganador */}
          <div className="flex items-center gap-2 mt-1">
            {ganador.tipo === 'pavoso' ? (
              <span className="text-2xl md:text-3xl">😅</span>
            ) : (
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-[#124723]" />
            )}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#124723]">
              {ganador.tipo === 'pavoso' ? '¡PAVOSO!' : '¡GANADOR!'}
            </h2>
          </div>
        </div>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-[#124723] rounded-full flex items-center justify-center hover:bg-[#1d1d1b] transition-colors"
        >
          <X className="w-8 h-8 text-[#ffd402]" />
        </button>
      </div>

      {/* Contenido - Ocupa todo el espacio disponible */}
      <div className="flex-1 p-2 md:p-4 overflow-hidden min-h-0">
        <div className="h-full flex flex-col md:flex-row gap-3 md:gap-4 max-w-7xl mx-auto">
          
          {/* Cartón del ganador */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <h3 className="text-[#ffd402] font-bold text-base md:text-xl mb-2 text-center shrink-0">CARTÓN</h3>
            <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              <div className="bg-[#f8df7e] rounded-xl md:rounded-2xl p-2 md:p-4 w-full max-w-[min(100%,40vh)] aspect-square">
                {/* Header BINGO */}
                <div className="grid grid-cols-5 gap-1 md:gap-2 mb-1 md:mb-2">
                  {['B', 'I', 'N', 'G', 'O'].map((letra, i) => {
                    const colores = ['#e91e63', '#9c27b0', '#ffd402', '#4caf50', '#ff9800'];
                    return (
                      <div
                        key={letra}
                        className="aspect-square rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-sm md:text-xl lg:text-2xl"
                        style={{ backgroundColor: colores[i] }}
                      >
                        {letra}
                      </div>
                    );
                  })}
                </div>
                
                {/* Números del cartón */}
                <div className="grid grid-cols-5 gap-1 md:gap-2">
                  {ganador.carton.matriz.map((fila, i) =>
                    fila.map((numero, j) => {
                      const esCentro = i === 2 && j === 2;
                      const estaSorteado = esCentro || numerosSet.has(numero);
                      const esParteDelPatron = patron[i]?.[j] || false;
                      
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`
                            aspect-square rounded-lg md:rounded-xl flex items-center justify-center font-bold text-sm md:text-lg lg:text-xl
                            transition-all duration-300
                            ${esCentro 
                              ? 'bg-[#ffd402] text-[#1d1d1b]' 
                              : estaSorteado && esParteDelPatron
                                ? 'bg-[#27ae60] text-white ring-2 md:ring-4 ring-[#ffd402] scale-105 shadow-lg'
                                : estaSorteado
                                  ? 'bg-[#27ae60] text-white'
                                  : 'bg-white text-[#1d1d1b]'
                            }
                          `}
                        >
                          {esCentro ? '★' : numero}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <p className="text-center text-[#f8df7e] text-sm md:text-base mt-2 shrink-0">
              Serial: {ganador.carton.serial}
            </p>
          </div>

          {/* Patrón ganador */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <h3 className="text-[#ffd402] font-bold text-base md:text-xl mb-2 text-center shrink-0">
              PATRÓN: {ganador.patron}
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              <div className="bg-[#1d1d1b] rounded-xl md:rounded-2xl p-3 md:p-6 flex flex-col items-center justify-center max-w-[min(100%,40vh)]">
                {/* Header BINGO */}
                <div className="flex gap-1 md:gap-2 mb-2 md:mb-3">
                  {['B', 'I', 'N', 'G', 'O'].map((letra) => (
                    <div
                      key={letra}
                      className="w-8 h-6 md:w-12 md:h-8 rounded flex items-center justify-center text-[#ffd402] font-bold text-sm md:text-lg"
                    >
                      {letra}
                    </div>
                  ))}
                </div>
                
                {/* Patrón visual - Responsivo */}
                <div className="grid grid-cols-5 gap-1 md:gap-2">
                  {patron.map((fila: boolean[], i: number) =>
                    fila.map((activo: boolean, j: number) => {
                      const esCentro = i === 2 && j === 2;
                      return (
                        <div
                          key={`patron-${i}-${j}`}
                          className={`
                            w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg md:rounded-xl flex items-center justify-center
                            transition-all duration-300
                            ${esCentro
                              ? 'bg-white'
                              : activo
                                ? 'bg-[#ffd402]'
                                : 'bg-[#124723] border border-[#68b258] md:border-2'
                            }
                          `}
                        >
                          {esCentro && <span className="text-[#1d1d1b] font-bold text-lg md:text-xl">★</span>}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Info adicional */}
                <div className="mt-3 md:mt-4 text-center">
                  <p className="text-[#68b258] text-sm md:text-base">
                    {ganador.tipo === 'pavoso' 
                      ? '0 coincidencias en 16 números'
                      : `Patrón completado`
                    }
                  </p>
                  <p className="text-[#f8df7e] text-xs md:text-sm mt-1">
                    {ganador.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón cerrar - Fijo abajo */}
      <div className="p-2 md:p-4 shrink-0">
        <button
          onClick={onClose}
          className="w-full max-w-md mx-auto block py-2 md:py-3 bg-[#ffd402] text-[#1d1d1b] font-bold text-base md:text-lg rounded-xl hover:bg-[#f8df7e] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
