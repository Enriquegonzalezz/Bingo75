'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Trophy, XCircle, SkipForward, Flag } from 'lucide-react';
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

// Componente para mostrar un patrón de modalidad - RESPONSIVE
function PatronModalidad({ modalidad, numero }: { modalidad: Modalidad; numero: number }) {
  return (
    <div className="flex items-center gap-3 bg-[#124723] rounded-xl p-3 border border-[#68b258]">
      {/* Grid del patrón */}
      <div className="flex-shrink-0">
        <div className="grid grid-cols-5 gap-0.5">
          {modalidad.patron.map((fila, i) =>
            fila.map((activo, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-4 h-4 rounded-sm ${
                  i === 2 && j === 2
                    ? 'bg-white'
                    : activo
                      ? 'bg-[#ffd402]'
                      : 'bg-[#0d2a0d]'
                }`}
              />
            ))
          )}
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{modalidad.nombre}</p>
        <p className="text-[#ffd402] text-xs">Figura #{numero}</p>
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
    <div className="fixed inset-0 bg-[#124723] z-50 overflow-hidden">
      {/* Animación de celebración */}
      <CelebrationEffect tipo={celebracion.tipo} activo={celebracion.activo} />

      {/* GRID PRINCIPAL 5x5 - Optimizado para TV */}
      <div className="h-screen p-2 grid grid-cols-5 grid-rows-5 gap-2">
        
        {/* ===== FILA 1-3: HEADER + TABLERO (5 columnas, 3 filas) ===== */}
        <div className="col-span-5 row-span-3 flex flex-col">
          {/* Header compacto */}
          <div className="flex justify-between items-center mb-2 px-2">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Bingo Carabobo"
                width={180}
                height={60}
                className="h-14 w-auto"
              />
              {/* Ronda */}
              <div className="bg-[#1d1d1b] px-4 py-2 rounded-xl border-2 border-[#ffd402]">
                <span className="text-[#ffd402] text-3xl font-black">RONDA {rondaActual}</span>
                <span className="text-[#f8df7e] text-lg ml-2">/ {totalRondas}</span>
              </div>
            </div>

            {/* NÚMERO DE SOPORTE - CENTRO */}
            <div className="bg-[#ffd402] rounded-xl px-8 py-3 text-center shadow-lg border-4 border-[#baa115]">
              <p className="text-[#1d1d1b]/70 text-xs font-bold uppercase tracking-wider">Nº Soporte</p>
              <p className="text-[#1d1d1b] text-4xl font-black">{numeroSoporte || '---'}</p>
            </div>

            {/* Info derecha */}
            <div className="flex items-center gap-4">
              {/* Último número */}
              {ultimoNumero && (
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">ÚLTIMO:</span>
                  <div className="w-14 h-14 bg-[#ffd402] rounded-full flex items-center justify-center animate-pulse border-4 border-white/50">
                    <span className="text-3xl font-black text-[#1d1d1b]">{ultimoNumero}</span>
                  </div>
                </div>
              )}
              {/* Contador */}
              <div className="bg-white rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-black text-[#1d1d1b]">{totalSorteados}<span className="text-gray-400">/75</span></p>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex gap-2">
              {ganadores.length > 0 && !rondaFinalizada && (
                <button onClick={onFinalizarRonda} className="px-4 py-2 bg-[#68b258] text-white font-bold rounded-xl flex items-center gap-2">
                  <Flag className="w-5 h-5" /> Finalizar Ronda
                </button>
              )}
              {rondaFinalizada && hayMasRondas && (
                <button onClick={onSiguienteRonda} className="px-4 py-2 bg-[#ffd402] text-[#1d1d1b] font-bold rounded-xl flex items-center gap-2 animate-pulse">
                  <SkipForward className="w-5 h-5" /> Siguiente Ronda
                </button>
              )}
              <button onClick={onReiniciar} className="px-4 py-2 bg-[#baa115] text-[#1d1d1b] font-bold rounded-xl">Reiniciar</button>
              <button onClick={onSalir} className="px-4 py-2 bg-[#1d1d1b] text-[#ffd402] font-bold rounded-xl border-2 border-[#ffd402]">Salir</button>
            </div>
          </div>

          {/* TABLERO 75 NÚMEROS - Grande para TV */}
          <div className="flex-1 bg-[#1d1d1b] rounded-2xl p-3 border-4 border-[#ffd402]">
            <div className="h-full bg-[#ffd402] rounded-xl p-2">
              {filas.map((fila) => (
                <div key={fila.letra} className="flex items-center mb-1 last:mb-0 h-[18%]">
                  {/* Letra */}
                  <div className={`w-16 h-full rounded-xl flex items-center justify-center text-white font-black text-4xl mr-2 bg-gradient-to-b ${fila.gradiente}`}>
                    {fila.letra}
                  </div>
                  {/* Números */}
                  <div className="flex-1 h-full grid grid-cols-15 gap-1">
                    {fila.numeros.map((numero) => {
                      const sorteado = numerosSorteados.includes(numero);
                      const esUltimo = numero === ultimoNumero;
                      return (
                        <button
                          key={numero}
                          onClick={() => !sorteado && onClickNumero(numero)}
                          disabled={sorteado}
                          className={`
                            rounded-full font-bold text-xl flex items-center justify-center transition-all
                            ${sorteado
                              ? esUltimo
                                ? 'bg-[#68b258] text-white ring-4 ring-white scale-110 animate-bounce'
                                : 'bg-[#68b258] text-white'
                              : 'bg-white text-[#1d1d1b] hover:bg-[#ffd402] hover:scale-110 cursor-pointer'
                            }
                          `}
                        >
                          {numero}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== FILA INFERIOR - RESPONSIVE ===== */}
        <div className="col-span-5 row-span-2 row-start-4 flex gap-2">
          
          {/* FIGURAS EN JUEGO - Scroll vertical */}
          <div className="flex-1 bg-[#1d1d1b] rounded-2xl p-3 border-2 border-[#ffd402] flex flex-col min-w-0">
            <h3 className="text-[#ffd402] font-bold text-base mb-2 text-center flex-shrink-0">🎯 FIGURAS ({modalidadesActivas.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {modalidadesActivas.map((mod, index) => (
                <PatronModalidad key={mod.id} modalidad={mod} numero={index + 1} />
              ))}
            </div>
          </div>

          {/* GANADORES */}
          <div className="flex-1 bg-[#1d1d1b] rounded-2xl p-3 border-2 border-[#68b258] flex flex-col min-w-0">
            <div className="flex items-center justify-center gap-2 mb-2 flex-shrink-0">
              <Trophy className="w-5 h-5 text-[#ffd402]" />
              <h3 className="text-[#68b258] font-bold text-base">GANADORES ({ganadoresReales.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {ganadoresReales.length === 0 ? (
                <p className="text-[#f8df7e] text-center py-4">🎰 Esperando...</p>
              ) : (
                ganadoresReales.map((g, i) => (
                  <button
                    key={`${g.numero_carton}-${i}`}
                    onClick={() => setGanadorSeleccionado(g)}
                    className="w-full bg-[#124723] rounded-xl p-3 text-left hover:bg-[#1a5a2a] transition-all border border-[#68b258]"
                  >
                    <p className="text-[#ffd402] font-bold">🏆 #{g.numero_carton}</p>
                    <p className="text-white/80 text-sm truncate">{g.patron}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PAVOSOS - Solo si está activo */}
          {pavosoActivo && (
            <div className="flex-1 bg-[#1d1d1b] rounded-2xl p-3 border-2 border-[#ffd402] flex flex-col min-w-0">
              <h3 className="text-[#ffd402] font-bold text-base mb-2 text-center flex-shrink-0">😅 PAVOSOS ({pavosos.length})</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {pavosos.length === 0 ? (
                  <p className="text-[#f8df7e]/70 text-center py-4">Sin pavosos...</p>
                ) : (
                  pavosos.map((g, i) => (
                    <button
                      key={`${g.numero_carton}-${i}`}
                      onClick={() => setGanadorSeleccionado(g)}
                      className="w-full bg-[#124723] rounded-xl p-3 text-left hover:bg-[#1a5a2a] transition-all border border-[#ffd402]"
                    >
                      <p className="text-[#ffd402] font-bold">😅 #{g.numero_carton}</p>
                      <p className="text-white/70 text-sm">0 aciertos</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MENOS ACIERTOS - Solo si hay datos */}
          {cartonesConMenosAciertos.length > 0 && (
            <div className="flex-1 bg-[#1d1d1b] rounded-2xl p-3 border-2 border-[#68b258] flex flex-col min-w-0">
              <div className="flex items-center justify-center gap-1 mb-2 flex-shrink-0">
                <XCircle className="w-4 h-4 text-[#ffd402]" />
                <h3 className="text-white font-bold text-base">MENOS ACIERTOS</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {cartonesConMenosAciertos.map((item) => (
                  <div key={item.numero_carton} className="bg-[#124723] rounded-xl p-3 border border-[#68b258]">
                    <p className="text-[#ffd402] font-bold">❌ #{item.numero_carton}</p>
                    <p className="text-white/70 text-sm">{item.aciertos} aciertos</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <div className="w-48 flex-shrink-0 bg-[#1d1d1b] rounded-2xl p-3 border-2 border-[#68b258] flex flex-col">
            <h3 className="text-[#68b258] font-bold text-base mb-2 text-center flex-shrink-0">📊 INFO</h3>
            <div className="space-y-2 flex-1">
              <div className="bg-[#124723] rounded-lg p-2 text-center border border-[#68b258]">
                <p className="text-[#f8df7e] text-xs">Cartones</p>
                <p className="text-white text-lg font-black">{totalCartones.toLocaleString()}</p>
              </div>
              <div className="bg-[#124723] rounded-lg p-2 text-center border border-[#68b258]">
                <p className="text-[#f8df7e] text-xs">Sorteados</p>
                <p className="text-white text-lg font-black">{totalSorteados}/75</p>
              </div>
              <div className="bg-[#124723] rounded-lg p-2 text-center border border-[#ffd402]">
                <p className="text-[#f8df7e] text-xs">Ronda</p>
                <p className="text-[#ffd402] text-lg font-black">{rondaActual}/{totalRondas}</p>
              </div>
            </div>
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
