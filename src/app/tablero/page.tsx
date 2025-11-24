'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { useSorteo } from '@/presentation/hooks/useSorteo';
import { DinamicasSelector, DinamicasConfig } from '@/presentation/components/sorteo/DinamicasSelector';
import { RotateCcw, Trophy, Upload } from 'lucide-react';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';
import { cn } from '@/shared/utils/cn';

export default function TableroPage() {
  // Estado de dinámicas (todas activas por defecto)
  const [dinamicas, setDinamicas] = useState<DinamicasConfig>({
    lineaHorizontal: true,
    lineaVertical: true,
    diagonal: true,
    cuatroEsquinas: true,
    rombo: true,
    cuadro3x3: true,
    letraX: true,
    pajarita: true,
    cartonLleno: true,
    pavoso: true,
  });

  const {
    numerosSorteados,
    ganadores,
    cartones,
    loading,
    cargarCartones,
    sortearNumero,
    reiniciar,
    getLetraNumero,
    totalSorteados,
  } = useSorteo({ dinamicasActivas: dinamicas });

  // Cargar cartones al montar
  useEffect(() => {
    cargarCartones();
  }, [cargarCartones]);

  // Deshabilitar cambio de dinámicas si ya empezó el sorteo
  const sorteoIniciado = totalSorteados > 0;

  // Agrupar números por letra
  const numerosPorLetra = {
    B: numerosSorteados.filter((n) => n >= 1 && n <= 15),
    I: numerosSorteados.filter((n) => n >= 16 && n <= 30),
    N: numerosSorteados.filter((n) => n >= 31 && n <= 45),
    G: numerosSorteados.filter((n) => n >= 46 && n <= 60),
    O: numerosSorteados.filter((n) => n >= 61 && n <= 75),
  };

  // Generar botones del 1 al 75
  const todosNumeros = Array.from({ length: 75 }, (_, i) => i + 1);

  const handleClickNumero = (numero: number) => {
    sortearNumero(numero);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header con información y botones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Tablero de Sorteo</h1>
            <p className="text-gray-600 mt-2">
              {cartones.length} cartones cargados | {totalSorteados}/75 números sorteados
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={cargarCartones} disabled={loading}>
              <Upload className="w-4 h-4 mr-2" />
              Recargar
            </Button>
            <Button variant="destructive" onClick={reiniciar}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Selector de Dinámicas - Compacto */}
        <div className="mb-6">
          <DinamicasSelector
            dinamicas={dinamicas}
            onChange={setDinamicas}
            disabled={sorteoIniciado}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel de Números (1-75) - MÁS GRANDE */}
          <div className="lg:col-span-3">
            <Card>
              <h2 className="text-2xl font-bold mb-6 text-center">Seleccionar Número (Click Manual)</h2>

              <div className="grid grid-cols-10 md:grid-cols-15 gap-2 md:gap-3">
                {todosNumeros.map((numero) => {
                  const letra = getLetraNumero(numero);
                  const sorteado = numerosSorteados.includes(numero);
                  const color =
                    BINGO_CONSTANTS.COLORS[letra as keyof typeof BINGO_CONSTANTS.COLORS];

                  return (
                    <button
                      key={numero}
                      onClick={() => handleClickNumero(numero)}
                      disabled={sorteado}
                      className={cn(
                        'aspect-square rounded-xl font-black text-base md:text-xl transition-all',
                        'hover:scale-110 active:scale-95 min-h-[50px] md:min-h-[60px]',
                        'shadow-md',
                        sorteado
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-white border-3 hover:shadow-2xl cursor-pointer'
                      )}
                      style={{
                        borderColor: sorteado ? undefined : color,
                        borderWidth: sorteado ? undefined : '3px',
                        color: sorteado ? undefined : color,
                      }}
                    >
                      {numero}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Números Sorteados por Letra */}
            <Card className="mt-6">
              <h2 className="text-xl font-bold mb-4">Números Sorteados</h2>

              <div className="grid grid-cols-5 gap-4">
                {(['B', 'I', 'N', 'G', 'O'] as const).map((letra) => {
                  const color = BINGO_CONSTANTS.COLORS[letra];
                  const numeros = numerosPorLetra[letra];

                  return (
                    <div key={letra} className="text-center">
                      <div
                        className="text-2xl font-bold mb-3 p-2 rounded-lg text-white"
                        style={{ backgroundColor: color }}
                      >
                        {letra}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {letra === 'B' && '1-15'}
                        {letra === 'I' && '16-30'}
                        {letra === 'N' && '31-45'}
                        {letra === 'G' && '46-60'}
                        {letra === 'O' && '61-75'}
                      </div>
                      <div className="space-y-2 min-h-[200px] bg-gray-50 rounded-lg p-2">
                        {numeros.length === 0 ? (
                          <div className="text-gray-400 text-sm py-4">Sin números</div>
                        ) : (
                          numeros.map((num) => (
                            <div
                              key={num}
                              className="p-2 rounded-lg font-bold text-white shadow-sm"
                              style={{ backgroundColor: color }}
                            >
                              {num}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Panel de Ganadores */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">
                  Ganadores
                </h2>
              </div>

              <div className="mb-6 p-5 bg-orange-50 rounded-2xl border-2 border-orange-500 shadow-lg">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Ganadores</p>
                <p className="text-5xl font-black text-orange-600">
                  {ganadores.length}
                </p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {ganadores.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-sm font-semibold">Aún no hay ganadores</p>
                    <p className="text-xs mt-1">Los ganadores aparecerán aquí</p>
                  </div>
                ) : (
                  ganadores.map((ganador, index) => {
                    const esPavoso = ganador.tipo === 'pavoso';
                    const bgColor = esPavoso 
                      ? 'bg-orange-100' 
                      : 'bg-purple-100';
                    const borderColor = esPavoso 
                      ? 'border-orange-500' 
                      : 'border-purple-600';
                    const textColor = esPavoso 
                      ? 'text-orange-700' 
                      : 'text-purple-700';
                    const patronColor = esPavoso 
                      ? 'text-orange-900' 
                      : 'text-purple-900';

                    return (
                      <div
                        key={`${ganador.numero_carton}-${index}`}
                        className={`p-5 ${bgColor} rounded-2xl border-2 ${borderColor} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className={`text-2xl font-black ${textColor}`}>
                              #{ganador.numero_carton}
                            </p>
                            <p className="text-xs text-gray-600">{ganador.carton.serial}</p>
                          </div>
                          {esPavoso ? (
                            <span className="text-2xl">😅</span>
                          ) : (
                            <Trophy className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                        <p className={`text-sm font-semibold ${patronColor}`}>
                          {ganador.patron}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {ganador.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
