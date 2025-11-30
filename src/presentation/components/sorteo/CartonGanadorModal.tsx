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
    <div className="fixed inset-0 bg-[#124723] z-[100] flex flex-col">
      {/* Header - Fijo arriba */}
      <div className="bg-gradient-to-r from-[#ffd402] to-[#baa115] p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {ganador.tipo === 'pavoso' ? (
            <span className="text-5xl">😅</span>
          ) : (
            <Trophy className="w-12 h-12 text-[#124723]" />
          )}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#124723]">
              {ganador.tipo === 'pavoso' ? '¡PAVOSO!' : '¡GANADOR!'}
            </h2>
            <p className="text-[#124723] font-semibold text-lg">Cartón #{ganador.numero_carton}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-[#124723] rounded-full flex items-center justify-center hover:bg-[#1d1d1b] transition-colors"
        >
          <X className="w-8 h-8 text-[#ffd402]" />
        </button>
      </div>

      {/* Contenido - Ocupa todo el espacio disponible */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="h-full flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
          
          {/* Cartón del ganador */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-[#ffd402] font-bold text-xl md:text-2xl mb-4 text-center shrink-0">CARTÓN</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-[#f8df7e] rounded-2xl p-4 md:p-6 w-full max-w-md">
                {/* Header BINGO */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {['B', 'I', 'N', 'G', 'O'].map((letra, i) => {
                    const colores = ['#e91e63', '#9c27b0', '#ffd402', '#4caf50', '#ff9800'];
                    return (
                      <div
                        key={letra}
                        className="aspect-square rounded-xl flex items-center justify-center text-white font-black text-2xl md:text-3xl"
                        style={{ backgroundColor: colores[i] }}
                      >
                        {letra}
                      </div>
                    );
                  })}
                </div>
                
                {/* Números del cartón */}
                <div className="grid grid-cols-5 gap-2">
                  {ganador.carton.matriz.map((fila, i) =>
                    fila.map((numero, j) => {
                      const esCentro = i === 2 && j === 2;
                      const estaSorteado = esCentro || numerosSet.has(numero);
                      const esParteDelPatron = patron[i]?.[j] || false;
                      
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`
                            aspect-square rounded-xl flex items-center justify-center font-bold text-xl md:text-2xl
                            transition-all duration-300
                            ${esCentro 
                              ? 'bg-[#ffd402] text-[#1d1d1b]' 
                              : estaSorteado && esParteDelPatron
                                ? 'bg-[#27ae60] text-white ring-4 ring-[#ffd402] scale-105 shadow-lg'
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
            <p className="text-center text-[#f8df7e] text-lg mt-4 shrink-0">
              Serial: {ganador.carton.serial}
            </p>
          </div>

          {/* Patrón ganador */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-[#ffd402] font-bold text-xl md:text-2xl mb-4 text-center shrink-0">
              PATRÓN: {ganador.patron}
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-[#1d1d1b] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center">
                {/* Header BINGO */}
                <div className="flex gap-2 mb-4">
                  {['B', 'I', 'N', 'G', 'O'].map((letra) => (
                    <div
                      key={letra}
                      className="w-12 h-8 md:w-16 md:h-10 rounded flex items-center justify-center text-[#ffd402] font-bold text-lg md:text-xl"
                    >
                      {letra}
                    </div>
                  ))}
                </div>
                
                {/* Patrón visual - GRANDE */}
                <div className="grid grid-cols-5 gap-2">
                  {patron.map((fila: boolean[], i: number) =>
                    fila.map((activo: boolean, j: number) => {
                      const esCentro = i === 2 && j === 2;
                      return (
                        <div
                          key={`patron-${i}-${j}`}
                          className={`
                            w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center
                            transition-all duration-300
                            ${esCentro
                              ? 'bg-white'
                              : activo
                                ? 'bg-[#ffd402]'
                                : 'bg-[#124723] border-2 border-[#68b258]'
                            }
                          `}
                        >
                          {esCentro && <span className="text-[#1d1d1b] font-bold text-2xl">★</span>}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Info adicional */}
                <div className="mt-6 text-center">
                  <p className="text-[#68b258] text-lg">
                    {ganador.tipo === 'pavoso' 
                      ? '0 coincidencias en 16 números'
                      : `Patrón completado`
                    }
                  </p>
                  <p className="text-[#f8df7e] text-sm mt-2">
                    {ganador.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón cerrar - Fijo abajo */}
      <div className="p-4 shrink-0">
        <button
          onClick={onClose}
          className="w-full max-w-md mx-auto block py-4 bg-[#ffd402] text-[#1d1d1b] font-bold text-xl rounded-xl hover:bg-[#f8df7e] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
