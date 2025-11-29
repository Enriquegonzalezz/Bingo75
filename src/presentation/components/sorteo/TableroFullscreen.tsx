'use client';

import { Trophy, XCircle } from 'lucide-react';
import { DinamicasConfig } from './DinamicasSelector';

// Usar tipos genéricos para evitar conflictos con los tipos del hook
interface TableroGanador {
  numero_carton: number;
  carton: {
    serial: string;
    numero_carton: number;
  };
  patron: string;
  tipo?: 'normal' | 'pavoso';
  timestamp: Date;
}

interface TableroCartonMenosAciertos {
  numero_carton: number;
  carton: {
    serial: string;
    numero_carton: number;
  };
  aciertos: number;
}

interface TableroFullscreenProps {
  numerosSorteados: number[];
  totalSorteados: number;
  ganadores: TableroGanador[];
  cartonesConMenosAciertos: TableroCartonMenosAciertos[];
  dinamicas: DinamicasConfig;
  onClickNumero: (numero: number) => void;
  onSalir: () => void;
  onReiniciar: () => void;
  totalCartones: number;
}

// Patrones de las dinámicas para visualización
const PATRONES_DINAMICAS: Record<string, { nombre: string; patron: boolean[][] }> = {
  lineaVertical: {
    nombre: 'Vertical',
    patron: [
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
    ],
  },
  lineaHorizontal: {
    nombre: 'Horizontal',
    patron: [
      [false, false, false, false, false],
      [false, false, false, false, false],
      [true, true, true, true, true],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ],
  },
  diagonal: {
    nombre: 'Diagonal',
    patron: [
      [true, false, false, false, false],
      [false, true, false, false, false],
      [false, false, true, false, false],
      [false, false, false, true, false],
      [false, false, false, false, true],
    ],
  },
  cuatroEsquinas: {
    nombre: '4 Esquinas',
    patron: [
      [true, false, false, false, true],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [true, false, false, false, true],
    ],
  },
  letraX: {
    nombre: 'Letra X',
    patron: [
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, false, false, true],
    ],
  },
  cartonLleno: {
    nombre: 'Pleno',
    patron: [
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
    ],
  },
  rombo: {
    nombre: 'Rombo',
    patron: [
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
    ],
  },
  cuadro3x3: {
    nombre: 'Cuadro 3x3',
    patron: [
      [false, false, false, false, false],
      [false, true, true, true, false],
      [false, true, true, true, false],
      [false, true, true, true, false],
      [false, false, false, false, false],
    ],
  },
  pajarita: {
    nombre: 'Pajarita',
    patron: [
      [true, true, false, true, true],
      [true, false, false, false, true],
      [false, false, true, false, false],
      [true, false, false, false, true],
      [true, true, false, true, true],
    ],
  },
};

// Componente para mostrar un patrón de dinámica
function PatronDinamica({ nombre, patron, numero }: { nombre: string; patron: boolean[][]; numero: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[#f8df7e] text-xs font-bold mb-1">B I N G O</div>
      <div className="grid grid-cols-5 gap-0.5 bg-[#1d1d1b] p-1 rounded">
        {patron.map((fila, i) =>
          fila.map((activo, j) => (
            <div
              key={`${i}-${j}`}
              className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold ${
                activo ? 'bg-[#ffd402] text-[#1d1d1b]' : 'bg-[#124723] text-[#124723]'
              } ${i === 2 && j === 2 ? 'bg-white' : ''}`}
            >
              {i === 2 && j === 2 && !activo ? '' : ''}
            </div>
          ))
        )}
      </div>
      <div className="bg-[#baa115] text-[#1d1d1b] text-xs font-bold px-2 py-0.5 rounded mt-1 flex items-center gap-1">
        <span className="bg-[#ffd402] text-[#1d1d1b] w-4 h-4 rounded flex items-center justify-center text-[10px]">
          {numero}
        </span>
      </div>
      <div className="text-[#f8df7e] text-xs mt-1">{nombre}</div>
    </div>
  );
}

export function TableroFullscreen({
  numerosSorteados,
  totalSorteados,
  ganadores,
  cartonesConMenosAciertos,
  dinamicas,
  onClickNumero,
  onSalir,
  onReiniciar,
  totalCartones,
}: TableroFullscreenProps) {
  // Generar la matriz de números organizados por filas (B, I, N, G, O)
  const filas = [
    { letra: 'B', color: '#e91e63', numeros: Array.from({ length: 15 }, (_, i) => i + 1) },
    { letra: 'I', color: '#9c27b0', numeros: Array.from({ length: 15 }, (_, i) => i + 16) },
    { letra: 'N', color: '#ffd402', numeros: Array.from({ length: 15 }, (_, i) => i + 31) },
    { letra: 'G', color: '#4caf50', numeros: Array.from({ length: 15 }, (_, i) => i + 46) },
    { letra: 'O', color: '#ff9800', numeros: Array.from({ length: 15 }, (_, i) => i + 61) },
  ];

  // Obtener dinámicas activas
  const dinamicasActivas = Object.entries(dinamicas)
    .filter(([key, value]) => value && key !== 'pavoso' && PATRONES_DINAMICAS[key])
    .map(([key], index) => ({
      key,
      ...PATRONES_DINAMICAS[key],
      numero: index + 1,
    }));

  // Separar ganadores y pavosos
  const ganadoresReales = ganadores.filter((g) => g.tipo !== 'pavoso');
  const pavosos = ganadores.filter((g) => g.tipo === 'pavoso');

  // Último número sorteado
  const ultimoNumero = numerosSorteados.length > 0 ? numerosSorteados[numerosSorteados.length - 1] : null;

  return (
    <div className="fixed inset-0 bg-[#124723] z-50 overflow-auto">
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-black text-[#ffd402]">BINGO CARABOBO</h1>
          <div className="flex gap-2">
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

            {/* Barra inferior con contador y soporte */}
            <div className="mt-4 flex items-center justify-between bg-[#68b258] rounded-xl p-3">
              {/* Contador */}
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg px-4 py-2 text-center">
                  <p className="text-2xl font-black text-[#1d1d1b]">{totalSorteados} de 75</p>
                </div>
                <div className="bg-[#ffd402] rounded-lg px-4 py-2 text-center">
                  <p className="text-xs text-[#1d1d1b] font-semibold">CARTONES</p>
                  <p className="text-lg font-black text-[#1d1d1b]">{totalCartones.toLocaleString()}</p>
                </div>
              </div>

              {/* Último número */}
              {ultimoNumero && (
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">ÚLTIMO:</span>
                  <div className="w-14 h-14 bg-[#ffd402] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-2xl font-black text-[#1d1d1b]">{ultimoNumero}</span>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="text-white text-right">
                <p className="text-sm font-bold">BINGO CARABOBO</p>
                <p className="text-xs opacity-80">Sistema de Sorteo</p>
              </div>
            </div>
          </div>

          {/* Panel Derecho */}
          <div className="col-span-4 space-y-4">
            {/* Dinámicas Activas */}
            <div className="bg-[#1d1d1b] rounded-xl p-4 border-2 border-[#ffd402]">
              <h3 className="text-[#ffd402] font-bold text-lg mb-3 text-center">MODALIDADES ACTIVAS</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {dinamicasActivas.map((din) => (
                  <PatronDinamica
                    key={din.key}
                    nombre={din.nombre}
                    patron={din.patron}
                    numero={din.numero}
                  />
                ))}
              </div>
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
                    <div
                      key={`${g.numero_carton}-${i}`}
                      className="bg-[#68b258] rounded-lg p-2 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-bold">#{g.numero_carton}</p>
                        <p className="text-white text-xs opacity-80">{g.patron}</p>
                      </div>
                      <Trophy className="w-5 h-5 text-[#ffd402]" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pavosos */}
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
                    <div
                      key={`${g.numero_carton}-${i}`}
                      className="bg-[#baa115] rounded-lg p-2 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#1d1d1b] font-bold">#{g.numero_carton}</p>
                        <p className="text-[#1d1d1b] text-xs opacity-80">{g.patron}</p>
                      </div>
                      <span className="text-xl">😅</span>
                    </div>
                  ))
                )}
              </div>
            </div>

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
                      <p className="text-white font-bold">#{item.numero_carton}</p>
                      <p className="text-red-400 font-bold">({item.aciertos} aciertos)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
