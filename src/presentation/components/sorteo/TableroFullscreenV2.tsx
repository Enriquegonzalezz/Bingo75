'use client';

import { useState, useEffect, useRef } from 'react';

import { Search, X, Menu, RotateCcw, LogOut, Flag, SkipForward, Trophy } from 'lucide-react';
import { Modalidad } from '@/shared/constants/modalidades';
import { Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { CartonGanadorModal, DatosCartonModal } from './CartonGanadorModal';
import { ResultadosRondaModal } from './ResultadosRondaModal';
import { CelebrationEffect } from '../effects/CelebrationEffect';
import { Carton } from '@/domain/entities/Carton';

interface TableroFullscreenV2Props {
  numerosSorteados: number[];
  historialClicks: number[];
  ultimoNumero: number | null;
  totalSorteados: number;
  ganadores: Ganador[];
  cartonesConMenosAciertos: CartonConAciertos[];
  modalidadesActivas: Modalidad[];
  onClickNumero: (numero: number) => void;
  onSalir: () => void;
  onReiniciar: () => void;
  onFinalizarRonda: () => void;
  onSiguienteRonda: () => void;
  pavosoActivo?: boolean;
  menosAciertosActivo?: boolean;
  rondaActual: number;
  totalRondas: number;
  rondaFinalizada: boolean;
  numeroSoporte?: string;
  premioRonda?: number;
  moneda?: 'USD' | 'VES';
  historialRondas: Record<number, any>;
  buscarCarton: (
    numero: number
  ) => { carton: Carton; aciertos: number; totalNumeros: number } | null;
}

// --- Componentes UI ---
function PatronGigante({ modalidad }: { modalidad: Modalidad }) {
  return (
    <div className="h-full aspect-square flex flex-col items-center justify-center bg-[#6a2818] border-2 border-[#ffd74a] rounded-2xl p-3 shadow-xl relative overflow-hidden">
      <div className="grid grid-cols-5 gap-2 w-full h-full">
        {modalidad.patron.map((fila, i) =>
          fila.map((activo, j) => (
            <div
              key={`${i}-${j}`}
              className={`rounded-[2px] w-full h-full shadow-sm transition-all duration-300 ${
                i === 2 && j === 2
                  ? 'bg-white/50 animate-pulse'
                  : activo
                    ? 'bg-[#ffd74a] shadow-[0_0_15px_#ffd74a]'
                    : 'bg-[#fbf7da]/40'
              }`}
            />
          ))
        )}
      </div>
      <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
        <span className="text-[#ffd74a] text-[10px] font-black uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full">
          {modalidad.nombre}
        </span>
      </div>
    </div>
  );
}

const BingoBall = ({
  numero,
  sorteado,
  esUltimo,
  onClick,
}: {
  numero: number;
  sorteado: boolean;
  esUltimo: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative w-full aspect-square rounded-[2px] flex items-center justify-center text-2xl md:text-3xl lg:text-3xl xl:text-[3.3rem] font-black transition-all duration-200 ${
      sorteado
        ? esUltimo
          ? 'bg-[#ef1400] text-white ring-4 ring-[#ffb74d] scale-110 z-10 shadow-lg'
          : 'bg-[#ff0000] text-white scale-100'
        : 'bg-transparent text-[#000] hover:bg-[#ffd74a] hover:scale-105'
    }`}
  >
    {numero}
  </button>
);

export function TableroFullscreenV2({
  numerosSorteados,
  historialClicks,
  ultimoNumero,
  totalSorteados,
  ganadores,
  cartonesConMenosAciertos,
  modalidadesActivas,
  onClickNumero,
  onSalir,
  onReiniciar,
  onFinalizarRonda,
  onSiguienteRonda,
  pavosoActivo = true,
  rondaActual,
  totalRondas,
  rondaFinalizada,
  numeroSoporte = '',
  premioRonda = 0,
  moneda = 'USD',
  buscarCarton,
  historialRondas,
}: TableroFullscreenV2Props) {
  const [modalData, setModalData] = useState<DatosCartonModal | null>(null);
  const [celebracion, setCelebracion] = useState<{ tipo: 'ganador' | 'pavoso'; activo: boolean }>({
    tipo: 'ganador',
    activo: false,
  });
  const [busquedaCarton, setBusquedaCarton] = useState('');
  const [cartonBuscado, setCartonBuscado] = useState<{
    carton: Carton;
    aciertos: number;
    totalNumeros: number;
  } | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [numeroARetirar, setNumeroARetirar] = useState<number | null>(null);

  // Refs para controlar cambios en la cantidad de ganadores/pavosos
  const prevGanadoresRef = useRef<number>(0);
  const prevPavososRef = useRef<number>(0); // <--- AGREGADO

  const handleBuscarCarton = (valor: string) => {
    setBusquedaCarton(valor);
    const numero = parseInt(valor);
    if (!isNaN(numero) && numero > 0) {
      setCartonBuscado(buscarCarton(numero));
    } else {
      setCartonBuscado(null);
    }
  };

  const cerrarBuscador = () => {
    setBusquedaCarton('');
    setCartonBuscado(null);
    setMostrarBuscador(false);
  };

  const handleClickNumero = (numero: number) => {
    // Si el número ya está sorteado, mostrar modal de confirmación
    if (numerosSorteados.includes(numero)) {
      setNumeroARetirar(numero);
    } else {
      // Si no está sorteado, agregarlo directamente
      onClickNumero(numero);
    }
  };

  const confirmarRetiro = () => {
    if (numeroARetirar !== null) {
      onClickNumero(numeroARetirar);
      setNumeroARetirar(null);
    }
  };

  const cancelarRetiro = () => {
    setNumeroARetirar(null);
  };

  // Separar listas
  const ganadoresReales = ganadores.filter((g) => g.tipo !== 'pavoso');
  const pavosos = ganadores.filter((g) => g.tipo === 'pavoso'); // <--- AGREGADO

  // Auto-mostrar resultados al finalizar ronda
  useEffect(() => {
    if (rondaFinalizada) setMostrarResultados(true);
  }, [rondaFinalizada]);

  const handleSiguienteRonda = () => {
    setMostrarResultados(false);
    onSiguienteRonda();
  };

  // 1. Detectar Ganador para Celebración
  useEffect(() => {
    if (ganadoresReales.length > prevGanadoresRef.current) {
      setCelebracion({ tipo: 'ganador', activo: true });
      setTimeout(() => setCelebracion((prev) => ({ ...prev, activo: false })), 4000);
    }
    prevGanadoresRef.current = ganadoresReales.length;
  }, [ganadoresReales.length]);

  // 2. Detectar Pavoso para Celebración (NUEVO)
  useEffect(() => {
    if (pavosos.length > prevPavososRef.current) {
      setCelebracion({ tipo: 'pavoso', activo: true });
      setTimeout(() => setCelebracion((prev) => ({ ...prev, activo: false })), 4000);
    }
    prevPavososRef.current = pavosos.length;
  }, [pavosos.length]);

  return (
    <div className="fixed inset-0 bg-[#fbf7da] font-sans flex flex-col overflow-hidden select-none z-50">
      <CelebrationEffect tipo={celebracion.tipo} activo={celebracion.activo} />

      {/* ===== TABLERO (70% Height) ===== */}
      <div className="h-[65%] w-full flex px-2 pt-2 pb-2 md:px-4 lg:px-6 lg:pt-2 gap-6">
        {/* Panel Tablero */}
        <div
          className={`relative flex flex-col bg-white rounded-[2.5rem] shadow-2xl transition-all duration-500 overflow-hidden ${cartonBuscado ? 'w-3/4' : 'w-full'}`}
        >
          {mostrarBuscador && (
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white border border-gray-200 shadow-xl rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={busquedaCarton}
                onChange={(e) => handleBuscarCarton(e.target.value)}
                placeholder="Nº Cartón..."
                className="w-24 outline-none text-lg font-bold text-[#6a2818] bg-transparent"
                autoFocus
              />
              <button onClick={cerrarBuscador}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between p-4 lg:px-8 lg:py-6 h-full">
            {[
              { l: 'B', c: 'bg-blue-500', n: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
              {
                l: 'I',
                c: 'bg-red-500',
                n: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
              },
              {
                l: 'N',
                c: 'bg-gray-500',
                n: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
              },
              {
                l: 'G',
                c: 'bg-green-500',
                n: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
              },
              {
                l: 'O',
                c: 'bg-[#ffd74a]',
                n: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
              },
            ].map((fila) => (
              <div key={fila.l} className="flex items-center gap-4 lg:gap-6 h-[18%]">
                <div
                  className={`${fila.c} h-[90%] aspect-[4/5] lg:aspect-square rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-md`}
                >
                  <span className="text-white font-black text-5xl lg:text-7xl drop-shadow-sm">
                    {fila.l}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-15 gap-1 lg:gap-2 h-[90%] items-center">
                  {fila.n.map((num) => (
                    <BingoBall
                      key={num}
                      numero={num}
                      sorteado={numerosSorteados.includes(num)}
                      esUltimo={num === ultimoNumero}
                      onClick={() => handleClickNumero(num)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Lateral Búsqueda */}
        {cartonBuscado && (
          <div className="w-1/4 bg-[#6a2818] border-4 border-[#ffd74a] rounded-[2.5rem] p-4 flex flex-col shadow-2xl animate-in slide-in-from-right-10">
            <div className="flex justify-between items-center mb-2 px-2">
              <div>
                <p className="text-[#ffd74a] text-xs font-bold uppercase">Cartón</p>
                <p className="text-white text-3xl font-black">
                  #{cartonBuscado.carton.numero_carton}
                </p>
              </div>
              <div className="text-right">
                <span className="text-green-400 text-2xl font-bold">{cartonBuscado.aciertos}</span>
                <span className="text-white/50 text-sm">/{cartonBuscado.totalNumeros}</span>
              </div>
            </div>
            <div className="flex-1 bg-[#fefce8] rounded-2xl p-3 text-gray-900 shadow-inner flex flex-col">
              <div className="grid grid-cols-5 mb-1 gap-1">
                {['B', 'I', 'N', 'G', 'O'].map((l, i) => (
                  <div
                    key={i}
                    className="bg-[#6a2818] text-[#ffd74a] font-black text-center rounded py-0.5 text-sm"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-1">
                {cartonBuscado.carton.matriz.map((fila, i) =>
                  fila.map((n, j) => {
                    const esCentro = i === 2 && j === 2;
                    const marcado = esCentro || numerosSorteados.includes(n);
                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`flex items-center justify-center rounded font-bold text-base md:text-lg border ${esCentro ? 'bg-[#ffd74a] border-[#ffd74a]' : marcado ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-white border-gray-200'}`}
                      >
                        {esCentro ? '★' : n}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <button
              onClick={cerrarBuscador}
              className="mt-2 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* ===== FOOTER (30% Height) ===== */}
      <div className="h-[35%] w-full px-6 lg:px-6 pb-6 pt-2 flex items-stretch justify-between gap-0">
        {/* COL 1: Figura */}
        <div className="flex justify-center items-center py-2 border-r-2 border-white/10 pr-2 gap-2">
          {modalidadesActivas.map((mod) => (
            <PatronGigante key={mod.id} modalidad={mod} />
          ))}
           <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-[#6a2818] text-sm font-bold uppercase tracking-widest">
                Cantadas
              </p>
              <p className="text-[#000] font-black text-7xl lg:text-8xl leading-none flex items-baseline justify-end">
                {totalSorteados}
                <span className="text-4xl text-[#000] ml-1">/75</span>
              </p>
            </div>

            {/* PREMIO GIGANTE */}
            {premioRonda > 0 && (
              <div className="bg-[#ffd74a] border-4 border-[#ffd74a] px-6 py-2 rounded-2xl shadow-[0_0_20px_rgba(255,215,74,0.4)] animate-in fade-in flex flex-col items-center">
                <p className="text-[#6a2818] text-sm font-black uppercase tracking-[0.2em] mb-[-5px]">
                  Premio 
                </p>
                <p className={`text-[#124723] font-black tracking-tighter shadow-black drop-shadow-md ${
                  moneda === 'VES' && premioRonda > 1000 
                    ? 'text-3xl xl:text-4xl' 
                    : 'text-5xl xl:text-6xl'
                }`}>
                  {moneda === 'USD' ? '$' : 'Bs. '}{premioRonda.toLocaleString()}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* COL 2: Centro (Logo/Soporte/Menu) */}
        <div className="flex-1 flex flex-col items-center justify-center px-2  border-r-2 border-white/10 relative">
          {/*<div className="relative h-28 w-80 lg:h-36 lg:w-96 mb-1">
            <Image src="/logo.png" alt="Logo Bingo" fill className="object-contain" priority />
          </div>*/}
          <div className="flex flex-col items-center">
            <p className="text-[#000] text-3xl font-bold uppercase tracking-[0.4em] ">
              Soporte
            </p>
            <p className="text-[#6a2818] font-black text-[84px]  tracking-wider">
              {numeroSoporte || '0000'}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#000] text-[#fff] rounded-full transition-colors border border-[#6a2818] gap-2"
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Menú</span>
            </button>
            {menuAbierto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 min-w-[220px] py-2 animate-in slide-in-from-bottom-2 text-gray-800">
                  <button
                    onClick={() => {
                      setMostrarResultados(true);
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 text-purple-700 font-bold border-b border-gray-100"
                  >
                    <Trophy className="w-5 h-5" /> Ver Resultados
                  </button>
                  <button
                    onClick={() => {
                      setMostrarBuscador(true);
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Search className="w-5 h-5 text-blue-500" /> Buscar cartón
                  </button>
                  {rondaFinalizada && rondaActual < totalRondas && (
                    <button
                      onClick={() => {
                        handleSiguienteRonda();
                        setMenuAbierto(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-purple-600 font-bold"
                    >
                      <SkipForward className="w-5 h-5" /> Siguiente Ronda
                    </button>
                  )}
                  {ganadores.length > 0 && !rondaFinalizada && (
                    <button
                      onClick={() => {
                        onFinalizarRonda();
                        setMenuAbierto(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-green-600 font-bold"
                    >
                      <Flag className="w-5 h-5" /> Finalizar Ronda
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onReiniciar();
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <RotateCcw className="w-5 h-5 text-orange-500" /> Reiniciar
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      onSalir();
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" /> Salir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* COL 3: Stats + Premio (GIGANTE) */}
        <div className="flex items-center justify-end ">
         
          <div className="h-[90%] aspect-5/4 bg-[#6a2818] border-4 border-[#ffd74a] rounded-xl flex flex-col shadow-2xl relative overflow-hidden">
            <div className="bg-[#ffd74a] h-8 w-full flex items-center justify-center shrink-0">
              <span className="text-[#6a2818] font-black text-sm lg:text-base uppercase tracking-[0.3em]">
                Última
              </span>
            </div>
            <div className="flex-1 flex items-center justify-end bg-[#6a2818] relative">
              {/* Grid de últimos 4 números con animación slot machine */}
              <div className="grid grid-cols-2 grid-rows-3 w-full h-full">
                {/* Div 1: Último número (más grande) - ocupa 3 filas */}
                <div className="row-span-3 flex items-center justify-center overflow-visible px-2">
                  {ultimoNumero && (
                    <span
                      key={ultimoNumero}
                      className="font-black text-7xl lg:text-9xl text-white slot-machine-enter-large ml-6 leading-none"
                    >
                      {ultimoNumero}
                    </span>
                  )}
                  {!ultimoNumero && (
                    <span className="font-black text-7xl lg:text-8xl text-white/30 ml-4">-</span>
                  )}
                </div>
                
                {/* Div 2: 2do número más reciente */}
                <div className="flex items-center justify-center overflow-hidden">
                  {historialClicks.length >= 2 && (
                    <span 
                      key={`pos2-${historialClicks[historialClicks.length - 2]}-${historialClicks.length}`}
                      className="font-black text-3xl lg:text-4xl xl:text-5xl text-white/80 slot-machine-enter"
                    >
                      {historialClicks[historialClicks.length - 2]}
                    </span>
                  )}
                </div>
                
                {/* Div 3: 3er número más reciente */}
                <div className="col-start-2 flex items-center justify-center overflow-hidden">
                  {historialClicks.length >= 3 && (
                    <span 
                      key={`pos3-${historialClicks[historialClicks.length - 3]}-${historialClicks.length}`}
                      className="font-black text-3xl lg:text-4xl xl:text-5xl text-white/80 slot-machine-enter"
                    >
                      {historialClicks[historialClicks.length - 3]}
                    </span>
                  )}
                </div>
                
                {/* Div 4: 4to número más reciente */}
                <div className="col-start-2 row-start-3 flex items-center justify-center overflow-hidden">
                  {historialClicks.length >= 4 && (
                    <span 
                      key={`pos4-${historialClicks[historialClicks.length - 4]}-${historialClicks.length}`}
                      className="font-black text-3xl lg:text-4xl xl:text-5xl text-white/80 slot-machine-enter"
                    >
                      {historialClicks[historialClicks.length - 4]}
                    </span>
                  )}
                </div>
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

      <ResultadosRondaModal
        isOpen={mostrarResultados}
        ganadores={ganadores}
        cartonesConMenosAciertos={cartonesConMenosAciertos}
        historialRondas={historialRondas}
        pavosoActivo={pavosoActivo}
        rondaActual={rondaActual}
        totalRondas={totalRondas}
        numerosSorteados={numerosSorteados}
        modalidadesActivas={modalidadesActivas}
        premioRonda={premioRonda}
        onClose={() => setMostrarResultados(false)}
        onSiguienteRonda={handleSiguienteRonda}
      />

      {/* Modal de confirmación para retirar número */}
      {numeroARetirar !== null && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in" onClick={cancelarRetiro} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-black text-red-600">{numeroARetirar}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  ¿Retirar número?
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro que quieres retirar el número <span className="font-bold text-red-600">{numeroARetirar}</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelarRetiro}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarRetiro}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Retirar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
