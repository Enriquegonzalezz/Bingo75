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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1d1d1b] rounded-2xl max-w-2xl w-full border-4 border-[#ffd402] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ffd402] to-[#baa115] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {ganador.tipo === 'pavoso' ? (
              <span className="text-4xl">😅</span>
            ) : (
              <Trophy className="w-10 h-10 text-[#124723]" />
            )}
            <div>
              <h2 className="text-2xl font-black text-[#124723]">
                {ganador.tipo === 'pavoso' ? '¡PAVOSO!' : '¡GANADOR!'}
              </h2>
              <p className="text-[#124723] font-semibold">Cartón #{ganador.numero_carton}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#124723] rounded-full flex items-center justify-center hover:bg-[#1d1d1b] transition-colors"
          >
            <X className="w-6 h-6 text-[#ffd402]" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Cartón del ganador */}
            <div>
              <h3 className="text-[#ffd402] font-bold text-lg mb-3 text-center">CARTÓN</h3>
              <div className="bg-[#f8df7e] rounded-xl p-3">
                {/* Header BINGO */}
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {['B', 'I', 'N', 'G', 'O'].map((letra, i) => {
                    const colores = ['#e91e63', '#9c27b0', '#ffd402', '#4caf50', '#ff9800'];
                    return (
                      <div
                        key={letra}
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-black text-xl"
                        style={{ backgroundColor: colores[i] }}
                      >
                        {letra}
                      </div>
                    );
                  })}
                </div>
                
                {/* Números del cartón */}
                <div className="grid grid-cols-5 gap-1">
                  {ganador.carton.matriz.map((fila, i) =>
                    fila.map((numero, j) => {
                      const esCentro = i === 2 && j === 2;
                      const estaSorteado = esCentro || numerosSet.has(numero);
                      const esParteDelPatron = patron[i]?.[j] || false;
                      
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center font-bold text-lg
                            transition-all duration-300
                            ${esCentro 
                              ? 'bg-[#ffd402] text-[#1d1d1b]' 
                              : estaSorteado && esParteDelPatron
                                ? 'bg-[#68b258] text-white ring-2 ring-[#ffd402] scale-105'
                                : estaSorteado
                                  ? 'bg-[#68b258] text-white'
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
              <p className="text-center text-[#f8df7e] text-sm mt-2">
                Serial: {ganador.carton.serial}
              </p>
            </div>

            {/* Patrón ganador */}
            <div>
              <h3 className="text-[#ffd402] font-bold text-lg mb-3 text-center">PATRÓN: {ganador.patron}</h3>
              <div className="bg-[#124723] rounded-xl p-4 flex flex-col items-center justify-center">
                {/* Header BINGO mini */}
                <div className="flex gap-1 mb-2">
                  {['B', 'I', 'N', 'G', 'O'].map((letra) => (
                    <div
                      key={letra}
                      className="w-10 h-6 rounded flex items-center justify-center text-[#f8df7e] font-bold text-xs"
                    >
                      {letra}
                    </div>
                  ))}
                </div>
                
                {/* Patrón visual */}
                <div className="grid grid-cols-5 gap-1">
                  {patron.map((fila: boolean[], i: number) =>
                    fila.map((activo: boolean, j: number) => {
                      const esCentro = i === 2 && j === 2;
                      return (
                        <div
                          key={`patron-${i}-${j}`}
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            transition-all duration-300
                            ${esCentro
                              ? 'bg-white'
                              : activo
                                ? 'bg-[#ffd402]'
                                : 'bg-[#1d1d1b] border border-[#68b258]'
                            }
                          `}
                        >
                          {esCentro && <span className="text-[#1d1d1b] font-bold">★</span>}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Info adicional */}
                <div className="mt-4 text-center">
                  <p className="text-[#68b258] text-sm">
                    {ganador.tipo === 'pavoso' 
                      ? '0 coincidencias en 16 números'
                      : `Patrón completado`
                    }
                  </p>
                  <p className="text-[#f8df7e] text-xs mt-1">
                    {ganador.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-[#ffd402] text-[#1d1d1b] font-bold rounded-xl hover:bg-[#f8df7e] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
