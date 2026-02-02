'use client';

import { useState, useMemo } from 'react';
import { X, SkipForward, Trophy, Frown } from 'lucide-react';
import { Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { CartonGanadorModal, DatosCartonModal } from './CartonGanadorModal';
import { Modalidad } from '@/shared/constants/modalidades';
import { cn } from '@/shared/utils/cn';

type HistorialData = {
  ganadores: Ganador[];
  pavosos: Ganador[];
  menosAciertos: CartonConAciertos[];
  numerosSorteados?: number[]; // Números sorteados en esta ronda específica
};

interface ResultadosRondaModalProps {
  isOpen: boolean;
  ganadores: Ganador[];
  cartonesConMenosAciertos: CartonConAciertos[];
  historialRondas?: Record<number, HistorialData>;
  pavosoActivo: boolean;
  rondaActual: number;
  totalRondas: number;
  numerosSorteados: number[];
  modalidadesActivas: Modalidad[];
  premioRonda?: number;
  onClose: () => void;
  onSiguienteRonda: () => void;
}

export function ResultadosRondaModal({
  isOpen,
  ganadores,
  cartonesConMenosAciertos,
  historialRondas = {},
  pavosoActivo,
  rondaActual,
  totalRondas,
  numerosSorteados,
  modalidadesActivas,
  premioRonda = 0,
  onClose,
  onSiguienteRonda,
}: ResultadosRondaModalProps) {
  const [modalData, setModalData] = useState<DatosCartonModal | null>(null);
  const [rondaFiltro, setRondaFiltro] = useState<number>(rondaActual);

  // Lógica de datos (Tiempo real vs Historial)
  const datosMostrados = useMemo(() => {
    if (rondaFiltro === rondaActual) {
      return {
        ganadores: ganadores.filter((g) => g.tipo !== 'pavoso'),
        pavosos: ganadores.filter((g) => g.tipo === 'pavoso'),
        menosAciertos: cartonesConMenosAciertos,
        numerosSorteadosRonda: numerosSorteados, // Números de la ronda actual
      };
    }
    const historico = historialRondas[rondaFiltro];
    return {
      ganadores: historico?.ganadores || [],
      pavosos: historico?.pavosos || [],
      menosAciertos: historico?.menosAciertos || [],
      numerosSorteadosRonda: historico?.numerosSorteados || [], // Números guardados de la ronda histórica
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rondaFiltro,
    rondaActual,
    ganadores,
    cartonesConMenosAciertos,
    historialRondas,
    JSON.stringify(numerosSorteados),
  ]);

  const hayMasRondas = rondaActual < totalRondas;

  if (!isOpen) return null;

  // --- CORRECCIÓN BUG MODAL ROJO ---
  const abrirGanador = (g: Ganador) => {
    setModalData({
      // Forzamos el tipo 'ganador' si no es explícitamente pavoso
      // Esto arregla que se abra como "Menos Aciertos"
      tipo: g.tipo === 'pavoso' ? 'pavoso' : 'ganador',
      numero_carton: g.numero_carton,
      serial: g.carton.serial,
      matriz: g.carton.matriz,
      patronNombre: g.patron,
      timestamp: g.timestamp,
      // Para pavosos, pasar los números congelados al momento de ganar (16 bolas)
      // Para ganadores normales, pasar los números de la ronda en que ganaron
      numerosMarcados:
        g.tipo === 'pavoso' ? g.numerosSorteadosAlGanar : datosMostrados.numerosSorteadosRonda,
      // Pasar el patrón específico con el que ganó (para mostrar la figura correcta de cada ronda)
      patronMatriz: g.patronMatriz,
    });
  };

  const abrirMenosAciertos = (c: CartonConAciertos) => {
    // Recalcular aciertos en tiempo real con los números actuales
    const numerosSet = new Set(numerosSorteados);
    console.log('Números sorteados actuales:', numerosSorteados);
    console.log('Cartón matriz:', c.carton.matriz);
    
    let aciertosActualizados = 0;
    const numerosAciertos: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const numero = c.carton.matriz[i][j];
        // El centro (FREE) NO cuenta como acierto
        if (i !== 2 && j !== 2 && numero !== 0 && numerosSet.has(numero)) {
          aciertosActualizados++;
          numerosAciertos.push(numero);
          console.log(`Acierto encontrado: ${numero} en posición [${i},${j}]`);
        }
      }
    }
    
    console.log(`Total aciertos calculados: ${aciertosActualizados}`);
    console.log('Números aciertos:', numerosAciertos);

    setModalData({
      tipo: 'menos_aciertos',
      numero_carton: c.numero_carton,
      serial: c.carton.serial,
      matriz: c.carton.matriz,
      aciertos: aciertosActualizados,
      // Pasar los números marcados para que el modal los use para visualización
      numerosMarcados: numerosAciertos,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#124723] z-[60] flex flex-col animate-in fade-in duration-300">
        {/* HEADER */}
        <div className="bg-[#ffd402] py-4 px-6 md:px-12 shrink-0 shadow-xl z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 md:w-12 md:h-12 text-[#1d1d1b]" />
            <div>
              <h2 className="text-[#1d1d1b] text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Resultados
              </h2>
              {premioRonda > 0 && rondaFiltro === rondaActual && (
                <p className="text-[#124723] font-bold text-lg">
                  Premio: ${premioRonda.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hayMasRondas && rondaFiltro === rondaActual && (
              <button
                onClick={onSiguienteRonda}
                className="px-6 py-3 bg-[#1d1d1b] text-white font-bold text-lg rounded-xl flex items-center gap-2 hover:bg-[#2d2d2b] transition-colors shadow-lg"
              >
                Siguiente <SkipForward className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 bg-white/20 hover:bg-red-600 text-[#1d1d1b] hover:text-white rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* BARRA DE FILTRO */}
        <div className="bg-[#1d1d1b] p-2 flex justify-center border-b border-[#ffd402]/30">
          <div className="flex gap-2 overflow-x-auto max-w-4xl custom-scrollbar pb-1">
            {Array.from({ length: totalRondas }).map((_, i) => {
              const r = i + 1;
              const disabled = r > rondaActual;
              return (
                <button
                  key={r}
                  onClick={() => !disabled && setRondaFiltro(r)}
                  disabled={disabled}
                  className={cn(
                    'px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap',
                    rondaFiltro === r
                      ? 'bg-[#ffd402] text-[#1d1d1b]'
                      : disabled
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-[#124723] text-white hover:bg-[#1a5c2f]'
                  )}
                >
                  RONDA {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#124723] to-[#0a2e14]">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* GANADORES */}
            <div className="space-y-4">
              <div className="bg-[#1d1d1b] p-4 rounded-xl border-l-4 border-[#ffd402] shadow-lg flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-white font-black text-xl uppercase">
                  🏆 Ganadores ({datosMostrados.ganadores.length})
                </h3>
              </div>
              <div className="space-y-3">
                {datosMostrados.ganadores.length === 0 ? (
                  <div className="bg-black/20 rounded-xl p-8 text-center text-white/50 italic">
                    Sin ganadores en esta ronda
                  </div>
                ) : (
                  datosMostrados.ganadores.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => abrirGanador(g)}
                      className="w-full bg-[#68b258] hover:bg-[#7bc96a] text-white p-4 rounded-xl shadow-md transition-transform hover:scale-[1.02] text-left group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-4xl group-hover:underline">
                            #{g.numero_carton}
                          </p>
                          <p className="text-2xl font-bold opacity-80 uppercase">{g.patron}</p>
                        </div>
                        <Trophy className="w-6 h-6 opacity-50 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* PAVOSOS */}
            <div className="space-y-4">
              <div className="bg-[#1d1d1b] p-4 rounded-xl border-l-4 border-orange-500 shadow-lg flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-white font-black text-xl uppercase">
                  😅 Pavosos ({datosMostrados.pavosos.length})
                </h3>
              </div>
              {pavosoActivo ? (
                <div className="space-y-3">
                  {datosMostrados.pavosos.length === 0 ? (
                    <div className="bg-black/20 rounded-xl p-8 text-center text-white/50 italic">
                      Nadie tiene mala suerte hoy
                    </div>
                  ) : (
                    datosMostrados.pavosos.map((g, i) => (
                      <button
                        key={i}
                        onClick={() => abrirGanador(g)}
                        className="w-full bg-[#c2a208] hover:bg-[#d4b30a] border border-orange-500/30 p-4 rounded-xl shadow-md transition-transform hover:scale-[1.02] text-left group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-5xl text-[#1d1d1b]">#{g.numero_carton}</p>
                            <p className="text-2xl font-bold text-[#1d1d1b]/60">0 Aciertos</p>
                          </div>
                          <span className="text-2xl group-hover:scale-125 transition-transform">
                            😅
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-xl text-center text-white/40 italic">
                  Modalidad desactivada
                </div>
              )}
            </div>

            {/* MENOS ACIERTOS */}
            <div className="space-y-4">
              <div className="bg-[#1d1d1b] p-4 rounded-xl border-l-4 border-red-500 shadow-lg flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-white font-black text-xl uppercase">❌ Menos Aciertos</h3>
              </div>
              <div className="space-y-3">
                {datosMostrados.menosAciertos.length === 0 ? (
                  <div className="bg-black/20 rounded-xl p-8 text-center text-white/50 italic">
                    {rondaFiltro === rondaActual ? 'Esperando datos...' : 'Sin datos registrados'}
                  </div>
                ) : (
                  datosMostrados.menosAciertos.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => abrirMenosAciertos(item)}
                      className="w-full bg-[#1d1d1b] hover:bg-[#2d2d2b] p-4 rounded-xl border border-white/10 shadow-lg flex items-center gap-4 transition-transform hover:scale-[1.02] text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                        <Frown className="w-6 h-6 text-red-500 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-4xl group-hover:text-[#ffd402]">
                          Cartón #{item.numero_carton}
                        </p>
                        <p className="text-gray-400 text-2xl">{item.aciertos} aciertos</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartonGanadorModal
        data={modalData}
        numerosSorteados={numerosSorteados}
        modalidadesActivas={modalidadesActivas}
        onClose={() => setModalData(null)}
      />
    </>
  );
}
