'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSorteoV2, Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { useFullscreen } from '@/presentation/hooks/useFullscreen';
import { RotateCcw, Trophy, Upload, Maximize, Settings, Filter } from 'lucide-react';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';
import { cn } from '@/shared/utils/cn';
import { TableroFullscreenV2 } from '@/presentation/components/sorteo/TableroFullscreenV2';
import {
  ConfiguracionModal,
  ConfiguracionJuego,
} from '@/presentation/components/sorteo/ConfiguracionModal';
import {
  CartonGanadorModal,
  DatosCartonModal,
} from '@/presentation/components/sorteo/CartonGanadorModal';
import { TODAS_MODALIDADES } from '@/shared/constants/modalidades';

type HistorialData = {
  ganadores: Ganador[];
  pavosos: Ganador[];
  menosAciertos: CartonConAciertos[];
  numerosSorteados: number[]; // Números sorteados en esta ronda específica
};

const DashButton = ({ onClick, disabled, variant = 'primary', children, className }: any) => {
  const baseStyle =
    'flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 shadow-md active:scale-95 text-sm md:text-base';
  const variants = {
    primary:
      'bg-[#ffd402] text-[#1d1d1b] hover:bg-[#e6c000] disabled:bg-gray-600 disabled:text-gray-400',
    outline:
      'bg-transparent border-2 border-[#ffd402] text-[#ffd402] hover:bg-[#ffd402] hover:text-[#1d1d1b]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    dark: 'bg-[#1d1d1b] text-white hover:bg-[#2d2d2b] border border-gray-700',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyle, variants[variant as keyof typeof variants], className)}
    >
      {children}
    </button>
  );
};

export default function TableroPage() {
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(true);
  const [configuracionJuego, setConfiguracionJuego] = useState<ConfiguracionJuego | null>(null);

  const [historialRondas, setHistorialRondas] = useState<Record<number, HistorialData>>({});
  const [rondaFiltro, setRondaFiltro] = useState<number>(1);
  const [modalDashboardOpen, setModalDashboardOpen] = useState(false);
  const [datosModalDashboard, setDatosModalDashboard] = useState<DatosCartonModal | null>(null);

  const {
    numerosSorteados,
    ultimoNumero,
    ganadores,
    cartones,
    loading,
    cargarCartones,
    sortearNumero,
    reiniciar,
    getLetraNumero,
    totalSorteados,
    cartonesConMenosAciertos,
    modalidadesActivas,
    rondaActual,
    totalRondas,
    rondaFinalizada,
    finalizarRonda,
    siguienteRonda,
    pavosoActivo,
    menosAciertosActivo,
    buscarCarton,
  } = useSorteoV2({ configuracion: configuracionJuego });

  const { isFullscreen, toggleFullscreen, enterFullscreen } = useFullscreen();

  useEffect(() => {
    cargarCartones();
  }, [cargarCartones]);

  // Guardar historial - copia profunda para preservar patronMatriz y números sorteados
  // Solo actualizar si hay ganadores (evita sobrescribir con arrays vacíos al cambiar de ronda)
  useEffect(() => {
    if (!configuracionJuego) return;
    // No actualizar el historial si no hay ganadores (evita sobrescribir al cambiar de ronda)
    if (ganadores.length === 0 && cartonesConMenosAciertos.length === 0) return;
    
    setHistorialRondas((prev) => {
      const ganadoresReales = ganadores
        .filter((g) => g.tipo !== 'pavoso')
        .map(g => ({ ...g, patronMatriz: g.patronMatriz.map(row => [...row]) }));
      const pavosos = ganadores
        .filter((g) => g.tipo === 'pavoso')
        .map(g => ({ ...g, patronMatriz: g.patronMatriz.map(row => [...row]) }));
      const prevData = prev[rondaActual] || { ganadores: [], pavosos: [], menosAciertos: [], numerosSorteados: [] };
      if (
        prevData.ganadores.length === ganadoresReales.length &&
        prevData.pavosos.length === pavosos.length &&
        JSON.stringify(prevData.menosAciertos) === JSON.stringify(cartonesConMenosAciertos)
      ) {
        return prev;
      }
      return {
        ...prev,
        [rondaActual]: {
          ganadores: ganadoresReales,
          pavosos: pavosos,
          menosAciertos: cartonesConMenosAciertos,
          numerosSorteados: [...numerosSorteados], // Guardar copia de los números sorteados de esta ronda
        },
      };
    });
    // Si la ronda avanza, actualizamos el filtro para seguir al juego
    if (!rondaFinalizada) setRondaFiltro(rondaActual);
  }, [ganadores, cartonesConMenosAciertos, rondaActual, rondaFinalizada, configuracionJuego, numerosSorteados]);

  useEffect(() => {
    if (totalSorteados === 1 && !isFullscreen) enterFullscreen();
  }, [totalSorteados, isFullscreen, enterFullscreen]);

  // HANDLER CORREGIDO: Fuerza el tipo adecuado para que no se abra como rojo por error
  const handleAbrirModal = (tipo: 'ganador' | 'pavoso' | 'menos_aciertos', item: any) => {
    setDatosModalDashboard({
      tipo: tipo === 'pavoso' ? 'pavoso' : tipo === 'menos_aciertos' ? 'menos_aciertos' : 'ganador',
      numero_carton: item.numero_carton,
      serial: item.carton.serial,
      matriz: item.carton.matriz,
      aciertos: item.aciertos,
      patronNombre: item.patron,
      timestamp: item.timestamp,
    });
    setModalDashboardOpen(true);
  };

  const handleConfigurarJuego = (config: ConfiguracionJuego) => {
    setConfiguracionJuego(config);
    setMostrarConfiguracion(false);
    cargarCartones();
    enterFullscreen();
  };
  const handleReiniciar = () => {
    setHistorialRondas({});
    setRondaFiltro(1);
    reiniciar();
    setMostrarConfiguracion(true);
  };

  // DATOS VISUALIZADOS: Lógica corregida para Tiempo Real
  const datosVisualizados = useMemo(() => {
    // Si el filtro es la ronda actual, mostramos los datos EN VIVO (Hooks)
    if (rondaFiltro === rondaActual) {
      return {
        ganadores: ganadores.filter((g) => g.tipo !== 'pavoso'),
        pavosos: ganadores.filter((g) => g.tipo === 'pavoso'),
        menosAciertos: cartonesConMenosAciertos,
      };
    }
    // Si es historial, usamos el state guardado
    return historialRondas[rondaFiltro] || { ganadores: [], pavosos: [], menosAciertos: [] };
  }, [historialRondas, rondaFiltro, rondaActual, ganadores, cartonesConMenosAciertos]);

  const todosNumeros = Array.from({ length: 75 }, (_, i) => i + 1);
  const letras = ['B', 'I', 'N', 'G', 'O'];

  if (isFullscreen && configuracionJuego) {
    return (
      <TableroFullscreenV2
        numerosSorteados={numerosSorteados}
        ultimoNumero={ultimoNumero}
        totalSorteados={totalSorteados}
        ganadores={ganadores}
        cartonesConMenosAciertos={cartonesConMenosAciertos}
        modalidadesActivas={modalidadesActivas}
        onClickNumero={sortearNumero}
        onSalir={toggleFullscreen}
        onReiniciar={handleReiniciar}
        onFinalizarRonda={finalizarRonda}
        onSiguienteRonda={siguienteRonda}
        pavosoActivo={pavosoActivo}
        menosAciertosActivo={menosAciertosActivo}
        rondaActual={rondaActual}
        totalRondas={totalRondas}
        rondaFinalizada={rondaFinalizada}
        numeroSoporte={configuracionJuego.numeroSoporte}
        premioRonda={configuracionJuego.rondas.find((r) => r.numero === rondaActual)?.premio}
        buscarCarton={buscarCarton}
        historialRondas={historialRondas}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#124723] font-sans text-gray-100 pb-10">
      <header className="bg-[#1d1d1b] border-b-4 border-[#ffd402] shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#ffd402] uppercase tracking-wider">
              Tablero de Sorteo
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              {cartones.length.toLocaleString()} cartones | {totalSorteados}/75 sorteados
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!configuracionJuego ? (
              <DashButton onClick={() => setMostrarConfiguracion(true)}>
                <Settings className="w-4 h-4" /> Configurar Partida
              </DashButton>
            ) : (
              <>
                <DashButton variant="outline" onClick={toggleFullscreen}>
                  <Maximize className="w-4 h-4" /> Pantalla Gigante
                </DashButton>
                <DashButton variant="dark" onClick={cargarCartones} disabled={loading}>
                  <Upload className="w-4 h-4" /> Recargar
                </DashButton>
                <DashButton variant="danger" onClick={handleReiniciar}>
                  <RotateCcw className="w-4 h-4" /> Reiniciar
                </DashButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-[1800px]">
        {configuracionJuego && (
          <div className="bg-[#1d1d1b] rounded-xl p-4 border border-[#ffd402]/30 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
            <div>
              <h3 className="text-[#ffd402] font-bold text-sm uppercase mb-2">
                Modalidades Activas
              </h3>
              <div className="flex flex-wrap gap-2">
                {modalidadesActivas.map((mod) => (
                  <span
                    key={mod.id}
                    className="bg-[#124723] text-white px-3 py-1 rounded-full text-xs font-bold border border-[#68b258]"
                  >
                    {mod.nombre}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-[#ffd402] text-[#1d1d1b] px-4 py-1 rounded-lg font-black text-lg inline-block shadow-[0_0_15px_rgba(255,212,2,0.3)]">
                RONDA {rondaActual}/{totalRondas}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-[#1d1d1b] font-bold text-xl mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#124723] rounded-full"></span>Seleccionar Número Manual
              </h2>
              <div className="grid grid-cols-10 sm:grid-cols-15 gap-2">
                {todosNumeros.map((num) => {
                  const sorteado = numerosSorteados.includes(num);
                  const letra = getLetraNumero(num);
                  const colorBorde =
                    BINGO_CONSTANTS.COLORS[letra as keyof typeof BINGO_CONSTANTS.COLORS];
                  return (
                    <button
                      key={num}
                      onClick={() => sortearNumero(num)}
                      disabled={sorteado}
                      className={cn(
                        'aspect-square flex items-center justify-center rounded-lg font-black text-lg transition-all',
                        sorteado
                          ? 'bg-[#1d1d1b] text-gray-500 cursor-not-allowed scale-90 opacity-50'
                          : 'bg-white text-[#1d1d1b] hover:scale-110 shadow-sm hover:shadow-md'
                      )}
                      style={{ border: sorteado ? 'none' : `3px solid ${colorBorde}` }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#1d1d1b] rounded-2xl p-6 shadow-xl border-t-4 border-[#68b258]">
              <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#68b258] rounded-full"></span>Números Sorteados
              </h2>
              <div className="space-y-3">
                {letras.map((letra) => {
                  const numerosDeLetra = numerosSorteados
                    .filter((n) => getLetraNumero(n) === letra)
                    .sort((a, b) => a - b);
                  const colorBg =
                    BINGO_CONSTANTS.COLORS[letra as keyof typeof BINGO_CONSTANTS.COLORS];
                  return (
                    <div key={letra} className="flex gap-4 items-start">
                      <div
                        className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
                        style={{ backgroundColor: colorBg }}
                      >
                        {letra}
                      </div>
                      <div className="flex-1 bg-[#124723]/50 rounded-xl min-h-[3rem] p-2 flex flex-wrap gap-2 items-center">
                        {numerosDeLetra.map((n) => (
                          <span
                            key={n}
                            className="bg-white text-[#1d1d1b] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm animate-in zoom-in"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PANEL MENOS ACIERTOS CLICABLE */}
            <div className="bg-[#1d1d1b] rounded-2xl p-6 shadow-xl border border-red-900/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❌</span>
                  <h2 className="text-[#ffd402] font-bold text-xl">
                    Menos Aciertos (Ronda {rondaFiltro})
                  </h2>
                </div>
                {rondaFiltro === rondaActual && !rondaFinalizada && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                    EN VIVO
                  </span>
                )}
              </div>
              {datosVisualizados.menosAciertos.length === 0 ? (
                <p className="text-gray-500 italic">No hay datos.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {datosVisualizados.menosAciertos.map((item, idx) => (
                    <button
                      key={item.numero_carton}
                      onClick={() => handleAbrirModal('menos_aciertos', item)}
                      className="bg-[#124723] p-3 rounded-xl border border-[#ffd402]/30 flex flex-col items-center text-center hover:bg-[#1a5c2f] hover:scale-105 transition-all group"
                    >
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Posición {idx + 1}
                      </span>
                      <span className="text-2xl font-black text-white group-hover:text-[#ffd402]">
                        #{item.numero_carton}
                      </span>
                      <div className="mt-2 bg-black/30 px-3 py-1 rounded-full">
                        <span className="text-[#ffd402] font-bold">{item.aciertos} aciertos</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[#1d1d1b] p-3 rounded-xl shadow-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase font-bold px-1">
                  <Filter className="w-3 h-3" /> Filtrar Resultados por Ronda
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {Array.from({ length: totalRondas }).map((_, i) => {
                    const r = i + 1;
                    const isActive = rondaFiltro === r;
                    const isDisabled = r > rondaActual;
                    return (
                      <button
                        key={r}
                        onClick={() => !isDisabled && setRondaFiltro(r)}
                        disabled={isDisabled}
                        className={cn(
                          'flex-1 min-w-[80px] px-3 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap',
                          isActive
                            ? 'bg-[#ffd402] text-[#1d1d1b] shadow-md transform scale-105'
                            : isDisabled
                              ? 'bg-gray-800 text-gray-600'
                              : 'bg-[#124723] text-white hover:bg-[#1a5c2f]'
                        )}
                      >
                        Ronda {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#1d1d1b] rounded-t-2xl p-6 border-b-4 border-[#ffd402] shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-8 h-8 text-[#ffd402]" />
                  <h2 className="text-2xl font-bold text-white">Resultados</h2>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-4xl font-black text-[#ffd402]">
                      {datosVisualizados.ganadores.length}
                    </span>
                    <span className="block text-gray-400 text-xs uppercase font-bold">
                      Ganadores
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-orange-500">
                      {datosVisualizados.pavosos.length}
                    </span>
                    <span className="block text-gray-400 text-xs uppercase font-bold">Pavosos</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f2e1b] rounded-b-2xl p-3 shadow-inner h-[calc(100vh-450px)] overflow-y-auto custom-scrollbar border border-white/5 space-y-3">
                {datosVisualizados.ganadores.length === 0 &&
                datosVisualizados.pavosos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4 p-8 text-center">
                    <Trophy className="w-16 h-16 opacity-20" />
                    <p>Sin resultados registrados para la Ronda {rondaFiltro}</p>
                  </div>
                ) : (
                  <>
                    {datosVisualizados.ganadores.map((ganador, idx) => (
                      <button
                        key={`g-${idx}`}
                        onClick={() => handleAbrirModal('ganador', ganador)}
                        className="w-full text-left p-4 rounded-xl border-l-8 border-[#2e5c26] bg-[#68b258] shadow-md relative overflow-hidden group transition-all hover:translate-x-1"
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <p className="text-xs font-bold uppercase mb-1 text-[#124723]">
                              🏆 ¡Bingo!
                            </p>
                            <p className="text-3xl font-black leading-none text-white">
                              #{ganador.numero_carton}
                            </p>
                            <p className="text-xs mt-1 font-mono text-white/80">
                              Serial: {ganador.carton.serial}
                            </p>
                            <p className="text-sm font-bold mt-2 text-[#124723] uppercase">
                              {ganador.patron}
                            </p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-black/20 text-white">
                            {new Date(ganador.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10 rotate-12" />
                      </button>
                    ))}
                    {datosVisualizados.pavosos.map((ganador, idx) => (
                      <button
                        key={`p-${idx}`}
                        onClick={() => handleAbrirModal('pavoso', ganador)}
                        className="w-full text-left p-4 rounded-xl border-l-8 border-[#ffd402] bg-[#c2a208] shadow-md relative overflow-hidden group transition-all hover:translate-x-1"
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <p className="text-xs font-bold uppercase mb-1 text-black">😅 Pavoso</p>
                            <p className="text-3xl font-black leading-none text-[#1d1d1b]">
                              #{ganador.numero_carton}
                            </p>
                            <p className="text-sm font-bold mt-2 text-black">0 ACIERTOS</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-black/20 text-black">
                            {new Date(ganador.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className="absolute -right-2 -bottom-2 text-6xl opacity-10">💩</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {modalDashboardOpen && (
        <CartonGanadorModal
          data={datosModalDashboard}
          numerosSorteados={numerosSorteados}
          modalidadesActivas={modalidadesActivas}
          onClose={() => setModalDashboardOpen(false)}
        />
      )}
      <ConfiguracionModal
        isOpen={mostrarConfiguracion}
        onClose={() => configuracionJuego && setMostrarConfiguracion(false)}
        onConfirmar={handleConfigurarJuego}
        modalidades={TODAS_MODALIDADES}
        totalCartones={cartones.length}
      />
    </div>
  );
}
