'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, XCircle, SkipForward, Flag, Star } from 'lucide-react';
import { Modalidad } from '@/shared/constants/modalidades';
import { Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { CartonGanadorModal } from './CartonGanadorModal';
import { CelebrationEffect } from '../effects/CelebrationEffect';

interface TableroFullscreenV2Props {
  numerosSorteados: number[];
  totalSorteados: number;
  ganadores: Ganador[];
  cartonesConMenosAciertos: CartonConAciertos[];
  modalidadesActivas: Modalidad[];
  onClickNumero: (numero: number) => void;
  onSalir: () => void;
  onReiniciar: () => void;
  onFinalizarRonda: () => void;
  onSiguienteRonda: () => void;
  totalCartones: number;
  pavosoActivo?: boolean;
  menosAciertosActivo?: boolean;
  rondaActual: number;
  totalRondas: number;
  rondaFinalizada: boolean;
  numeroSoporte?: string;
}

// Componente para mostrar un patrón de modalidad
function PatronModalidad({ modalidad, numero }: { modalidad: Modalidad; numero: number }) {
  return (
    <div className="flex flex-col items-center bg-[#1d1d1b] rounded-lg p-2">
      <div className="text-[#f8df7e] text-[8px] font-bold mb-1 tracking-wider">B I N G O</div>
      <div className="grid grid-cols-5 gap-0.5 mb-1">
        {modalidad.patron.map((fila, i) =>
          fila.map((activo, j) => (
            <div
              key={`${i}-${j}`}
              className={`w-3 h-3 rounded-sm ${
                i === 2 && j === 2
                  ? 'bg-white'
                  : activo
                    ? 'bg-[#ffd402]'
                    : 'bg-[#124723]'
              }`}
            />
          ))
        )}
      </div>
      <div className="bg-[#baa115] text-[#1d1d1b] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
        <span className="bg-[#ffd402] text-[#1d1d1b] w-4 h-4 rounded flex items-center justify-center text-[10px] font-black">
          {numero}
        </span>
      </div>
      <div className="text-[#f8df7e] text-[10px] mt-1 text-center max-w-[60px] truncate">
        {modalidad.nombre}
      </div>
    </div>
  );
}

export function TableroFullscreenV2({
  numerosSorteados,
  totalSorteados,
  ganadores,
  cartonesConMenosAciertos,
  modalidadesActivas,
  onClickNumero,
  onSalir,
  onReiniciar,
  onFinalizarRonda,
  onSiguienteRonda,
  totalCartones,
  pavosoActivo = true,
  rondaActual,
  totalRondas,
  rondaFinalizada,
  numeroSoporte = '',
}: TableroFullscreenV2Props) {
  // Estado para mostrar modal de ganador
  const [ganadorSeleccionado, setGanadorSeleccionado] = useState<Ganador | null>(null);
  
  // Estado para animaciones de celebración
  const [celebracion, setCelebracion] = useState<{ tipo: 'ganador' | 'pavoso'; activo: boolean }>({ tipo: 'ganador', activo: false });
  const prevGanadoresRef = useRef<number>(0);
  const prevPavososRef = useRef<number>(0);

  // Generar la matriz de números organizados por filas (B, I, N, G, O)
  const filas = [
    { letra: 'B', color: '#e91e63', gradiente: 'from-pink-600 to-pink-800', numeros: Array.from({ length: 15 }, (_, i) => i + 1) },
    { letra: 'I', color: '#9c27b0', gradiente: 'from-purple-600 to-purple-800', numeros: Array.from({ length: 15 }, (_, i) => i + 16) },
    { letra: 'N', color: '#ffd402', gradiente: 'from-yellow-400 to-yellow-600', numeros: Array.from({ length: 15 }, (_, i) => i + 31) },
    { letra: 'G', color: '#4caf50', gradiente: 'from-green-500 to-green-700', numeros: Array.from({ length: 15 }, (_, i) => i + 46) },
    { letra: 'O', color: '#ff9800', gradiente: 'from-orange-500 to-orange-700', numeros: Array.from({ length: 15 }, (_, i) => i + 61) },
  ];

  // Separar ganadores y pavosos
  const ganadoresReales = ganadores.filter((g) => g.tipo !== 'pavoso');
  const pavosos = ganadores.filter((g) => g.tipo === 'pavoso');

  // Último número sorteado
  const ultimoNumero = numerosSorteados.length > 0 ? numerosSorteados[numerosSorteados.length - 1] : null;

  // Hay más rondas disponibles
  const hayMasRondas = rondaActual < totalRondas;

  // Detectar nuevos ganadores/pavosos para animaciones
  useEffect(() => {
    if (ganadoresReales.length > prevGanadoresRef.current) {
      setCelebracion({ tipo: 'ganador', activo: true });
      setTimeout(() => setCelebracion(prev => ({ ...prev, activo: false })), 4000);
    }
    prevGanadoresRef.current = ganadoresReales.length;
  }, [ganadoresReales.length]);

  useEffect(() => {
    if (pavosos.length > prevPavososRef.current) {
      setCelebracion({ tipo: 'pavoso', activo: true });
      setTimeout(() => setCelebracion(prev => ({ ...prev, activo: false })), 3000);
    }
    prevPavososRef.current = pavosos.length;
  }, [pavosos.length]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a2e14] via-[#124723] to-[#0a2e14] z-50 overflow-auto">
      {/* Efecto de luces de casino */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffd402]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#68b258]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#e91e63]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Animación de celebración */}
      <CelebrationEffect tipo={celebracion.tipo} activo={celebracion.activo} />

      <div className="relative min-h-screen p-4">
        {/* Header Casino Style */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {/* Logo con efecto neón */}
            <div className="relative">
              <h1 className="text-4xl font-black text-[#ffd402] drop-shadow-[0_0_10px_rgba(255,212,2,0.5)]">
                <Star className="inline w-8 h-8 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
                BINGO CARABOBO
                <Star className="inline w-8 h-8 ml-2 animate-spin" style={{ animationDuration: '3s' }} />
              </h1>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffd402] to-transparent" />
            </div>
            {/* Indicador de ronda estilo casino */}
            <div className="bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] px-6 py-3 rounded-xl border-2 border-[#ffd402] shadow-[0_0_20px_rgba(255,212,2,0.3)]">
              <span className="text-[#f8df7e] text-xs uppercase tracking-widest">Ronda</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[#ffd402] text-4xl font-black drop-shadow-[0_0_5px_rgba(255,212,2,0.5)]">{rondaActual}</span>
                <span className="text-[#f8df7e] text-sm ml-1">/ {totalRondas}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Botón Finalizar Ronda - Estilo Casino */}
            {ganadores.length > 0 && !rondaFinalizada && (
              <button
                onClick={onFinalizarRonda}
                className="px-5 py-3 bg-gradient-to-b from-[#7cc96a] to-[#4a9c3a] text-white font-bold rounded-xl 
                  hover:from-[#8ed97a] hover:to-[#5aac4a] transition-all shadow-lg shadow-green-900/50
                  border-2 border-[#8ed97a] flex items-center gap-2 transform hover:scale-105"
              >
                <Flag className="w-5 h-5" />
                Finalizar Ronda
              </button>
            )}
            {/* Botón Siguiente Ronda - Estilo Casino Brillante */}
            {rondaFinalizada && hayMasRondas && (
              <button
                onClick={onSiguienteRonda}
                className="px-5 py-3 bg-gradient-to-b from-[#ffd402] to-[#baa115] text-[#1d1d1b] font-bold rounded-xl 
                  hover:from-[#ffe44a] hover:to-[#d4c01a] transition-all shadow-lg shadow-yellow-900/50
                  border-2 border-[#ffe44a] flex items-center gap-2 transform hover:scale-105 animate-pulse"
              >
                <SkipForward className="w-5 h-5" />
                Siguiente Ronda
              </button>
            )}
            <button
              onClick={onReiniciar}
              className="px-5 py-3 bg-gradient-to-b from-[#d4c01a] to-[#8a7a0a] text-[#1d1d1b] font-bold rounded-xl 
                hover:from-[#e4d02a] hover:to-[#9a8a1a] transition-all shadow-lg shadow-yellow-900/30
                border-2 border-[#d4c01a] transform hover:scale-105"
            >
              Reiniciar
            </button>
            <button
              onClick={onSalir}
              className="px-5 py-3 bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] text-[#ffd402] font-bold rounded-xl 
                border-2 border-[#ffd402] hover:border-[#ffe44a] hover:text-[#ffe44a] transition-all 
                shadow-lg shadow-black/50 transform hover:scale-105"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Tablero Principal - 75 números - Estilo Casino */}
          <div className="col-span-8 bg-gradient-to-br from-[#1a1a18] via-[#2d2d2b] to-[#1a1a18] rounded-2xl p-4 
            shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] border-4 border-[#baa115]">
            {/* Marco dorado interior */}
            <div className="bg-gradient-to-br from-[#f8df7e] via-[#ffd402] to-[#baa115] rounded-xl p-3 shadow-inner">
              {filas.map((fila) => (
                <div key={fila.letra} className="flex items-center mb-2 last:mb-0">
                  {/* Letra con efecto 3D */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-3xl mr-3 
                      shadow-[0_4px_0_rgba(0,0,0,0.3),0_6px_10px_rgba(0,0,0,0.3)] 
                      bg-gradient-to-b ${fila.gradiente} border-2 border-white/20`}
                  >
                    {fila.letra}
                  </div>
                  {/* Números con efecto de bola de bingo */}
                  <div className="flex-1 grid grid-cols-15 gap-1">
                    {fila.numeros.map((numero) => {
                      const sorteado = numerosSorteados.includes(numero);
                      const esUltimo = numero === ultimoNumero;
                      return (
                        <button
                          key={numero}
                          onClick={() => !sorteado && onClickNumero(numero)}
                          disabled={sorteado}
                          className={`
                            aspect-square rounded-full font-bold text-base flex items-center justify-center
                            transition-all duration-300 
                            ${
                              sorteado
                                ? esUltimo
                                  ? `bg-gradient-to-br from-[#7cc96a] to-[#4a9c3a] text-white 
                                     ring-4 ring-[#ffd402] scale-125 shadow-[0_0_20px_rgba(104,178,88,0.8)]
                                     animate-bounce`
                                  : 'bg-gradient-to-br from-[#68b258] to-[#3a8228] text-white shadow-inner'
                                : `bg-gradient-to-br from-white to-gray-200 text-[#1d1d1b] 
                                   hover:from-[#ffd402] hover:to-[#baa115] hover:scale-110 
                                   cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]`
                            }
                          `}
                          style={{ animationDuration: esUltimo ? '0.5s' : undefined }}
                        >
                          {numero}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Barra inferior con contador - Estilo Casino */}
            <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-[#4a9c3a] via-[#68b258] to-[#4a9c3a] 
              rounded-xl p-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.3)] border-2 border-[#7cc96a]">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-b from-white to-gray-100 rounded-xl px-5 py-3 text-center shadow-lg">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sorteados</p>
                  <p className="text-3xl font-black text-[#1d1d1b]">{totalSorteados}<span className="text-lg text-gray-400">/75</span></p>
                </div>
                <div className="bg-gradient-to-b from-[#ffd402] to-[#baa115] rounded-xl px-5 py-3 text-center shadow-lg">
                  <p className="text-xs text-[#1d1d1b]/70 font-bold uppercase tracking-wider">Cartones</p>
                  <p className="text-2xl font-black text-[#1d1d1b]">{totalCartones.toLocaleString()}</p>
                </div>
              </div>

              {ultimoNumero && (
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg drop-shadow-lg">ÚLTIMO:</span>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#ffd402] to-[#baa115] rounded-full flex items-center justify-center 
                    shadow-[0_0_30px_rgba(255,212,2,0.6),0_4px_8px_rgba(0,0,0,0.3)] animate-pulse border-4 border-white/50">
                    <span className="text-3xl font-black text-[#1d1d1b]">{ultimoNumero}</span>
                  </div>
                </div>
              )}

              <div className="text-white text-right">
                <p className="text-lg font-black drop-shadow-lg">BINGO CARABOBO</p>
                {numeroSoporte && (
                  <p className="text-sm font-bold text-[#ffd402]">
                    Soporte: #{numeroSoporte}
                  </p>
                )}
                <p className="text-xs opacity-80">Sistema de Sorteo Premium</p>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Estilo Casino */}
          <div className="col-span-4 space-y-4">
            {/* Modalidades Activas - Estilo Casino */}
            <div className="bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] rounded-2xl p-4 
              border-2 border-[#ffd402] shadow-[0_0_20px_rgba(255,212,2,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <h3 className="text-[#ffd402] font-bold text-lg mb-3 text-center uppercase tracking-wider 
                drop-shadow-[0_0_5px_rgba(255,212,2,0.5)]">
                <Star className="inline w-5 h-5 mr-2" />
                Modalidades ({modalidadesActivas.length})
                <Star className="inline w-5 h-5 ml-2" />
              </h3>
              {modalidadesActivas.length === 0 ? (
                <p className="text-[#f8df7e] text-sm text-center py-4">
                  No hay modalidades seleccionadas
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {modalidadesActivas.map((mod, index) => (
                    <PatronModalidad
                      key={mod.id}
                      modalidad={mod}
                      numero={index + 1}
                    />
                  ))}
                </div>
              )}
              {pavosoActivo && (
                <div className="mt-3 pt-3 border-t border-[#ffd402]/30 text-center">
                  <span className="text-[#baa115] text-xs">😅 Pavoso activo (16 números, 0 aciertos)</span>
                </div>
              )}
            </div>

            {/* Ganadores - Estilo Casino Premium */}
            <div className="bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] rounded-2xl p-4 
              border-2 border-[#68b258] shadow-[0_0_20px_rgba(104,178,88,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="w-7 h-7 text-[#ffd402] drop-shadow-[0_0_5px_rgba(255,212,2,0.5)]" />
                <h3 className="text-[#68b258] font-bold text-xl uppercase tracking-wider 
                  drop-shadow-[0_0_5px_rgba(104,178,88,0.5)]">
                  Ganadores ({ganadoresReales.length})
                </h3>
                <Trophy className="w-7 h-7 text-[#ffd402] drop-shadow-[0_0_5px_rgba(255,212,2,0.5)]" />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {ganadoresReales.length === 0 ? (
                  <p className="text-[#f8df7e] text-sm text-center py-4 opacity-70">
                    🎰 Esperando ganadores...
                  </p>
                ) : (
                  ganadoresReales.slice(0, 5).map((g, i) => (
                    <button
                      key={`${g.numero_carton}-${i}`}
                      onClick={() => setGanadorSeleccionado(g)}
                      className="w-full bg-gradient-to-r from-[#4a9c3a] via-[#68b258] to-[#4a9c3a] rounded-xl p-3 
                        flex items-center justify-between hover:from-[#5aac4a] hover:via-[#78c968] hover:to-[#5aac4a] 
                        transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(104,178,88,0.5)]
                        border border-[#7cc96a] transform hover:scale-[1.02]"
                    >
                      <div className="text-left">
                        <p className="text-white font-bold text-lg">🏆 Cartón #{g.numero_carton}</p>
                        <p className="text-white/80 text-xs">{g.patron}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#ffd402] px-3 py-1 rounded-full">
                        <span className="text-[#1d1d1b] text-xs font-bold">Ver</span>
                        <Trophy className="w-4 h-4 text-[#1d1d1b]" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Pavosos - Estilo Casino */}
            {pavosoActivo && (
              <div className="bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] rounded-2xl p-4 
                border-2 border-[#baa115] shadow-[0_0_15px_rgba(186,161,21,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl">😅</span>
                  <h3 className="text-[#baa115] font-bold text-lg uppercase tracking-wider">
                    Pavosos ({pavosos.length})
                  </h3>
                  <span className="text-2xl">😅</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {pavosos.length === 0 ? (
                    <p className="text-[#f8df7e]/70 text-sm text-center py-2">Sin pavosos aún...</p>
                  ) : (
                    pavosos.slice(0, 3).map((g, i) => (
                      <button
                        key={`${g.numero_carton}-${i}`}
                        onClick={() => setGanadorSeleccionado(g)}
                        className="w-full bg-gradient-to-r from-[#8a7a0a] via-[#baa115] to-[#8a7a0a] rounded-xl p-3 
                          flex items-center justify-between hover:from-[#9a8a1a] hover:via-[#cac125] hover:to-[#9a8a1a] 
                          transition-all cursor-pointer shadow-lg border border-[#d4c01a] transform hover:scale-[1.02]"
                      >
                        <div className="text-left">
                          <p className="text-[#1d1d1b] font-bold">😅 Cartón #{g.numero_carton}</p>
                          <p className="text-[#1d1d1b]/70 text-xs">0 aciertos en 16 números</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#1d1d1b] px-3 py-1 rounded-full">
                          <span className="text-[#ffd402] text-xs font-bold">Ver</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Menos Aciertos - Estilo Casino */}
            {cartonesConMenosAciertos.length > 0 && (
              <div className="bg-gradient-to-b from-[#2d2d2b] to-[#1d1d1b] rounded-2xl p-4 
                border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <h3 className="text-red-500 font-bold text-lg uppercase tracking-wider">Menos Aciertos</h3>
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {cartonesConMenosAciertos.slice(0, 3).map((item) => (
                    <div
                      key={item.numero_carton}
                      className="bg-gradient-to-r from-red-900/60 via-red-800/60 to-red-900/60 rounded-xl p-3 
                        flex items-center justify-between border border-red-700/50"
                    >
                      <p className="text-white font-bold">❌ Cartón #{item.numero_carton}</p>
                      <p className="text-red-400 font-bold bg-red-900/50 px-3 py-1 rounded-full text-sm">
                        {item.aciertos} aciertos
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cartón Ganador */}
      <CartonGanadorModal
        ganador={ganadorSeleccionado}
        numerosSorteados={numerosSorteados}
        onClose={() => setGanadorSeleccionado(null)}
      />
    </div>
  );
}
