'use client';

import { useState } from 'react';
import { Trophy, XCircle, SkipForward, Flag } from 'lucide-react';
import { Modalidad } from '@/shared/constants/modalidades';
import { Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { CartonGanadorModal } from './CartonGanadorModal';

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
  menosAciertosActivo = true,
  rondaActual,
  totalRondas,
  rondaFinalizada,
}: TableroFullscreenV2Props) {
  // Estado para mostrar modal de ganador
  const [ganadorSeleccionado, setGanadorSeleccionado] = useState<Ganador | null>(null);

  // Generar la matriz de números organizados por filas (B, I, N, G, O)
  const filas = [
    { letra: 'B', color: '#e91e63', numeros: Array.from({ length: 15 }, (_, i) => i + 1) },
    { letra: 'I', color: '#9c27b0', numeros: Array.from({ length: 15 }, (_, i) => i + 16) },
    { letra: 'N', color: '#ffd402', numeros: Array.from({ length: 15 }, (_, i) => i + 31) },
    { letra: 'G', color: '#4caf50', numeros: Array.from({ length: 15 }, (_, i) => i + 46) },
    { letra: 'O', color: '#ff9800', numeros: Array.from({ length: 15 }, (_, i) => i + 61) },
  ];

  // Separar ganadores y pavosos
  const ganadoresReales = ganadores.filter((g) => g.tipo !== 'pavoso');
  const pavosos = ganadores.filter((g) => g.tipo === 'pavoso');

  // Último número sorteado
  const ultimoNumero = numerosSorteados.length > 0 ? numerosSorteados[numerosSorteados.length - 1] : null;

  // Hay más rondas disponibles
  const hayMasRondas = rondaActual < totalRondas;

  return (
    <div className="fixed inset-0 bg-[#124723] z-50 overflow-auto">
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-[#ffd402]">BINGO CARABOBO</h1>
            <div className="bg-[#1d1d1b] px-4 py-2 rounded-lg border-2 border-[#ffd402]">
              <span className="text-[#f8df7e] text-sm">RONDA</span>
              <span className="text-[#ffd402] text-2xl font-black ml-2">{rondaActual}</span>
              <span className="text-[#f8df7e] text-sm ml-1">/ {totalRondas}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Botón Finalizar Ronda */}
            {ganadores.length > 0 && !rondaFinalizada && (
              <button
                onClick={onFinalizarRonda}
                className="px-4 py-2 bg-[#68b258] text-white font-bold rounded-lg hover:bg-[#7cc96a] transition-colors flex items-center gap-2"
              >
                <Flag className="w-5 h-5" />
                Finalizar Ronda
              </button>
            )}
            {/* Botón Siguiente Ronda */}
            {rondaFinalizada && hayMasRondas && (
              <button
                onClick={onSiguienteRonda}
                className="px-4 py-2 bg-[#ffd402] text-[#1d1d1b] font-bold rounded-lg hover:bg-[#f8df7e] transition-colors flex items-center gap-2 animate-pulse"
              >
                <SkipForward className="w-5 h-5" />
                Siguiente Ronda
              </button>
            )}
            <button
              onClick={onReiniciar}
              className="px-4 py-2 bg-[#baa115] text-[#1d1d1b] font-bold rounded-lg hover:bg-[#ffd402] transition-colors"
            >
              Reiniciar
            </button>
            <button
              onClick={onSalir}
              className="px-4 py-2 bg-[#1d1d1b] text-[#ffd402] font-bold rounded-lg border-2 border-[#ffd402] hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Tablero Principal - 75 números */}
          <div className="col-span-8 bg-[#f8df7e] rounded-xl p-3 shadow-2xl">
            {filas.map((fila) => (
              <div key={fila.letra} className="flex items-center mb-1 last:mb-0">
                {/* Letra */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-2xl mr-2 shadow-lg"
                  style={{ backgroundColor: fila.color }}
                >
                  {fila.letra}
                </div>
                {/* Números */}
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
                          aspect-square rounded-lg font-bold text-lg flex items-center justify-center
                          transition-all duration-200 shadow-md
                          ${
                            sorteado
                              ? esUltimo
                                ? 'bg-[#68b258] text-white ring-4 ring-[#ffd402] scale-110'
                                : 'bg-[#68b258] text-white'
                              : 'bg-white text-[#1d1d1b] hover:bg-[#ffd402] hover:scale-105 cursor-pointer'
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

            {/* Barra inferior con contador */}
            <div className="mt-4 flex items-center justify-between bg-[#68b258] rounded-xl p-3">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg px-4 py-2 text-center">
                  <p className="text-2xl font-black text-[#1d1d1b]">{totalSorteados} de 75</p>
                </div>
                <div className="bg-[#ffd402] rounded-lg px-4 py-2 text-center">
                  <p className="text-xs text-[#1d1d1b] font-semibold">CARTONES</p>
                  <p className="text-lg font-black text-[#1d1d1b]">{totalCartones.toLocaleString()}</p>
                </div>
              </div>

              {ultimoNumero && (
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">ÚLTIMO:</span>
                  <div className="w-14 h-14 bg-[#ffd402] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-2xl font-black text-[#1d1d1b]">{ultimoNumero}</span>
                  </div>
                </div>
              )}

              <div className="text-white text-right">
                <p className="text-sm font-bold">BINGO CARABOBO</p>
                <p className="text-xs opacity-80">Sistema de Sorteo</p>
              </div>
            </div>
          </div>

          {/* Panel Derecho */}
          <div className="col-span-4 space-y-4">
            {/* Modalidades Activas */}
            <div className="bg-[#1d1d1b] rounded-xl p-4 border-2 border-[#ffd402]">
              <h3 className="text-[#ffd402] font-bold text-lg mb-3 text-center">
                MODALIDADES ACTIVAS ({modalidadesActivas.length})
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

            {/* Ganadores */}
            <div className="bg-[#1d1d1b] rounded-xl p-4 border-2 border-[#68b258]">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-[#ffd402]" />
                <h3 className="text-[#68b258] font-bold text-lg">GANADORES ({ganadoresReales.length})</h3>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {ganadoresReales.length === 0 ? (
                  <p className="text-[#f8df7e] text-sm text-center py-4">Aquí se mostrarán los ganadores</p>
                ) : (
                  ganadoresReales.slice(0, 5).map((g, i) => (
                    <button
                      key={`${g.numero_carton}-${i}`}
                      onClick={() => setGanadorSeleccionado(g)}
                      className="w-full bg-[#68b258] rounded-lg p-2 flex items-center justify-between hover:bg-[#7cc96a] hover:scale-102 transition-all cursor-pointer"
                    >
                      <div className="text-left">
                        <p className="text-white font-bold">Cartón #{g.numero_carton}</p>
                        <p className="text-white text-xs opacity-80">{g.patron}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#f8df7e] text-xs">Ver</span>
                        <Trophy className="w-5 h-5 text-[#ffd402]" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Pavosos */}
            {pavosoActivo && (
              <div className="bg-[#1d1d1b] rounded-xl p-4 border-2 border-[#baa115]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">😅</span>
                  <h3 className="text-[#baa115] font-bold text-lg">PAVOSOS ({pavosos.length})</h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {pavosos.length === 0 ? (
                    <p className="text-[#f8df7e] text-sm text-center py-2">Sin pavosos aún</p>
                  ) : (
                    pavosos.slice(0, 3).map((g, i) => (
                      <button
                        key={`${g.numero_carton}-${i}`}
                        onClick={() => setGanadorSeleccionado(g)}
                        className="w-full bg-[#baa115] rounded-lg p-2 flex items-center justify-between hover:bg-[#d4c01a] hover:scale-102 transition-all cursor-pointer"
                      >
                        <div className="text-left">
                          <p className="text-[#1d1d1b] font-bold">Cartón #{g.numero_carton}</p>
                          <p className="text-[#1d1d1b] text-xs opacity-80">0 aciertos en 16 números</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#1d1d1b] text-xs">Ver</span>
                          <span className="text-xl">😅</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Menos Aciertos */}
            {cartonesConMenosAciertos.length > 0 && (
              <div className="bg-[#1d1d1b] rounded-xl p-4 border-2 border-red-500">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <h3 className="text-red-500 font-bold text-lg">MENOS ACIERTOS</h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {cartonesConMenosAciertos.slice(0, 3).map((item) => (
                    <div
                      key={item.numero_carton}
                      className="bg-red-900/50 rounded-lg p-2 flex items-center justify-between"
                    >
                      <p className="text-white font-bold">Cartón #{item.numero_carton}</p>
                      <p className="text-red-400 font-bold">({item.aciertos} aciertos)</p>
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
