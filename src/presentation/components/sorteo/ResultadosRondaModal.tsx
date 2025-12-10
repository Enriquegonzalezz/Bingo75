'use client';

import { useState } from 'react';
import { X, SkipForward, Trophy } from 'lucide-react';
import { Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { CartonGanadorModal } from './CartonGanadorModal';
import { Modalidad } from '@/shared/constants/modalidades';

interface ResultadosRondaModalProps {
  isOpen: boolean;
  ganadores: Ganador[];
  cartonesConMenosAciertos: CartonConAciertos[];
  pavosoActivo: boolean;
  rondaActual: number;
  totalRondas: number;
  numerosSorteados: number[];
  modalidadesActivas: Modalidad[];
  onClose: () => void;
  onSiguienteRonda: () => void;
}

export function ResultadosRondaModal({
  isOpen,
  ganadores,
  cartonesConMenosAciertos,
  pavosoActivo,
  rondaActual,
  totalRondas,
  numerosSorteados,
  modalidadesActivas,
  onClose,
  onSiguienteRonda,
}: ResultadosRondaModalProps) {
  const [ganadorSeleccionado, setGanadorSeleccionado] = useState<Ganador | null>(null);

  if (!isOpen) return null;

  const ganadoresReales = ganadores.filter((g) => g.tipo !== 'pavoso');
  const pavosos = ganadores.filter((g) => g.tipo === 'pavoso');
  const hayMasRondas = rondaActual < totalRondas;

  return (
    <>
      {/* Pantalla completa con fondo verde */}
      <div className="fixed inset-0 bg-[#124723] z-60 flex flex-col" style={{ height: '100dvh' }}>
        {/* Header - Fondo amarillo con buen contraste */}
        <div className="bg-[#ffd402] py-6 px-6 md:px-12 shrink-0 relative">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h2 className="text-[#1d1d1b] text-4xl md:text-5xl lg:text-6xl font-black">
              🏆 RESULTADOS RONDA {rondaActual}
            </h2>
            <div className="flex items-center gap-4">
              {hayMasRondas && (
                <button
                  onClick={onSiguienteRonda}
                  className="px-6 py-3 bg-[#1d1d1b] text-white font-bold text-xl rounded-xl flex items-center gap-2 hover:bg-[#333] transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                  Siguiente Ronda
                </button>
              )}
              <button
                onClick={onClose}
                className="p-3 bg-[#1d1d1b] text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido - Fondo verde, listas centradas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {/* GANADORES */}
            <div className="bg-[#1d1d1b] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Trophy className="w-10 h-10 text-[#ffd402]" />
                <h3 className="text-[#ffd402] font-black text-2xl md:text-3xl">GANADORES ({ganadoresReales.length})</h3>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {ganadoresReales.length === 0 ? (
                  <p className="text-white/70 text-center py-8 text-lg">Sin ganadores en esta ronda</p>
                ) : (
                  ganadoresReales.map((g, i) => (
                    <button
                      key={`${g.numero_carton}-${i}`}
                      onClick={() => setGanadorSeleccionado(g)}
                      className="w-full bg-[#ffd402] rounded-xl p-4 text-left hover:bg-[#e6c000] transition-all"
                    >
                      <p className="text-[#1d1d1b] font-black text-xl">🏆 Cartón #{g.numero_carton}</p>
                      <p className="text-[#1d1d1b]/70 text-base font-medium">{g.patron}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* PAVOSOS */}
            {pavosoActivo && (
              <div className="bg-[#1d1d1b] rounded-2xl p-6 shadow-xl">
                <h3 className="text-[#ffd402] font-black text-2xl md:text-3xl mb-6 text-center">
                  PAVOSOS ({pavosos.length})
                </h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                  {pavosos.length === 0 ? (
                    <p className="text-white/70 text-center py-8 text-lg">Sin pavosos en esta ronda</p>
                  ) : (
                    pavosos.map((g, i) => (
                      <button
                        key={`${g.numero_carton}-${i}`}
                        onClick={() => setGanadorSeleccionado(g)}
                        className="w-full bg-[#ffd402] rounded-xl p-4 text-left hover:bg-[#e6c000] transition-all"
                      >
                        <p className="text-[#1d1d1b] font-black text-xl">😅 Cartón #{g.numero_carton}</p>
                        <p className="text-[#1d1d1b]/70 text-base font-medium">0 aciertos</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MENOS ACIERTOS */}
            {cartonesConMenosAciertos.length > 0 && (
              <div className="bg-[#1d1d1b] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-center gap-3 mb-6">
                 
                  <h3 className="text-white font-black text-2xl md:text-3xl">MENOS ACIERTOS</h3>
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                  {cartonesConMenosAciertos.map((item) => (
                    <div
                      key={item.numero_carton}
                      className="bg-white/10 rounded-xl p-4"
                    >
                      <p className="text-white font-black text-xl">❌ Cartón #{item.numero_carton}</p>
                      <p className="text-white/70 text-base font-medium">{item.aciertos} aciertos</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 px-6 bg-[#ffd402] text-center shrink-0">
          <p className="text-[#1d1d1b] text-base font-medium">
            Haz clic en cualquier cartón para ver los detalles
          </p>
        </div>
      </div>

      {/* Modal de Cartón Ganador */}
      <CartonGanadorModal
        ganador={ganadorSeleccionado}
        numerosSorteados={numerosSorteados}
        modalidadesActivas={modalidadesActivas}
        onClose={() => setGanadorSeleccionado(null)}
      />
    </>
  );
}
