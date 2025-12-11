'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, X, Menu, RotateCcw, LogOut, Flag, SkipForward } from 'lucide-react';
import { Modalidad } from '@/shared/constants/modalidades';
import { Ganador, CartonConAciertos } from '@/presentation/hooks/useSorteoV2';
import { CartonGanadorModal } from './CartonGanadorModal';
import { ResultadosRondaModal } from './ResultadosRondaModal';
import { CelebrationEffect } from '../effects/CelebrationEffect';
import { Carton } from '@/domain/entities/Carton';

interface TableroFullscreenV2Props {
  numerosSorteados: number[];
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
  buscarCarton: (numero: number) => { carton: Carton; aciertos: number; totalNumeros: number } | null;
}

// Componente para mostrar un patrón de modalidad - GRANDE (para la vista principal)
function PatronModalidadGrande({ modalidad, totalFiguras }: { modalidad: Modalidad; totalFiguras: number }) {
  // Ancho según cantidad de figuras - MÁS ANCHO para mejor visualización
  const getWidthClass = () => {
    if (totalFiguras === 1) return 'min-w-[280px]';
    if (totalFiguras === 2) return 'min-w-[220px]';
    return 'min-w-[180px]';
  };

  return (
    <div className={`flex flex-col items-center bg-[#1d1d1b] rounded-2xl p-4 border-4 border-[#ffd402] h-full max-h-full overflow-hidden ${getWidthClass()}`}>
      {/* Grid del patrón - Respeta el contenedor */}
      <div className="grid grid-cols-5 gap-2 flex-1 w-full aspect-square max-h-[calc(100%-2.5rem)]">
        {modalidad.patron.map((fila, i) =>
          fila.map((activo, j) => (
            <div
              key={`${i}-${j}`}
              className={`rounded-lg aspect-square ${
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
      {/* Info debajo */}
      <div className="mt-2 text-center w-full shrink-0">
        <p className="text-white font-bold text-xl truncate">{modalidad.nombre}</p>
      </div>
    </div>
  );
}

export function TableroFullscreenV2({
  numerosSorteados,
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
  buscarCarton,
}: TableroFullscreenV2Props) {
  // Estado para mostrar modal de ganador
  const [ganadorSeleccionado, setGanadorSeleccionado] = useState<Ganador | null>(null);
  
  // Estado para animaciones de celebración
  const [celebracion, setCelebracion] = useState<{ tipo: 'ganador' | 'pavoso'; activo: boolean }>({ tipo: 'ganador', activo: false });
  const prevGanadoresRef = useRef<number>(0);
  const prevPavososRef = useRef<number>(0);

  // Estado para el buscador de cartones
  const [busquedaCarton, setBusquedaCarton] = useState('');
  const [cartonBuscado, setCartonBuscado] = useState<{ carton: Carton; aciertos: number; totalNumeros: number } | null>(null);

  // Estado para el menú hamburguesa
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);

  // Estado para mostrar modal de resultados (cuando finaliza la ronda)
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Buscar cartón cuando cambia el input
  const handleBuscarCarton = (valor: string) => {
    setBusquedaCarton(valor);
    const numero = parseInt(valor);
    if (!isNaN(numero) && numero > 0) {
      const resultado = buscarCarton(numero);
      setCartonBuscado(resultado);
    } else {
      setCartonBuscado(null);
    }
  };

  // Cerrar buscador
  const cerrarBuscador = () => {
    setBusquedaCarton('');
    setCartonBuscado(null);
    setMostrarBuscador(false);
  };

  // Generar la matriz de números organizados por filas (B, I, N, G, O)
  const filas = [
    { letra: 'B', color: '#e91e63', gradiente: 'from-pink-600 to-pink-800', numeros: Array.from({ length: 15 }, (_, i) => i + 1) },
    { letra: 'I', color: '#9c27b0', gradiente: 'from-purple-600 to-purple-800', numeros: Array.from({ length: 15 }, (_, i) => i + 16) },
    { letra: 'N', color: '#ffd402', gradiente: 'from-yellow-400 to-yellow-600', numeros: Array.from({ length: 15 }, (_, i) => i + 31) },
    { letra: 'G', color: '#4caf50', gradiente: 'from-green-500 to-green-700', numeros: Array.from({ length: 15 }, (_, i) => i + 46) },
    { letra: 'O', color: '#ff9800', gradiente: 'from-orange-500 to-orange-700', numeros: Array.from({ length: 15 }, (_, i) => i + 61) },
  ];

  // Hay más rondas disponibles
  const hayMasRondas = rondaActual < totalRondas;

  // Separar ganadores y pavosos
  const ganadoresReales = ganadores.filter((g) => g.tipo !== 'pavoso');
  const pavosos = ganadores.filter((g) => g.tipo === 'pavoso');

  // Mostrar modal de resultados automáticamente cuando se finaliza la ronda
  useEffect(() => {
    if (rondaFinalizada) {
      setMostrarResultados(true);
    }
  }, [rondaFinalizada]);

  // Handler para siguiente ronda desde el modal
  const handleSiguienteRonda = () => {
    setMostrarResultados(false);
    onSiguienteRonda();
  };

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
    <div className="fixed inset-0 bg-[#124723] z-50 overflow-hidden" style={{ height: '100dvh' }}>
      {/* Animación de celebración */}
      <CelebrationEffect tipo={celebracion.tipo} activo={celebracion.activo} />

      {/* GRID PRINCIPAL 5x5 - Optimizado para TV */}
      <div className="h-full w-full p-2 grid grid-cols-5 grid-rows-5 gap-2" style={{ maxHeight: '100dvh' }}>
        
        {/* ===== TABLERO NUMÉRICO (ocupa todo el espacio superior) ===== */}
        <div className="col-span-5 row-span-3 flex flex-col min-h-0 overflow-hidden relative">
          
          {/* Menú flotante en esquina superior derecha */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            {/* Buscador de cartones - Solo visible cuando está activo */}
            {mostrarBuscador && (
              <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-2 shadow-lg">
                <Search className="w-5 h-5 text-[#124723]" />
                <input
                  type="number"
                  value={busquedaCarton}
                  onChange={(e) => handleBuscarCarton(e.target.value)}
                  placeholder="Nº Cartón..."
                  className="w-28 px-2 py-1 text-base text-[#124723] font-bold focus:outline-none bg-transparent"
                  autoFocus
                />
                <button onClick={cerrarBuscador} className="text-gray-500 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Botón Siguiente Ronda */}
            {rondaFinalizada && hayMasRondas && (
              <button 
                onClick={handleSiguienteRonda} 
                className="px-4 py-2 bg-[#ffd402] text-[#1d1d1b] font-bold rounded-xl flex items-center gap-2 shadow-lg animate-pulse hover:bg-[#e6c000] transition-colors"
              >
                <SkipForward className="w-5 h-5" /> Siguiente
              </button>
            )}

            {/* Menú hamburguesa */}
            <div className="relative">
              <button 
                onClick={() => setMenuAbierto(!menuAbierto)} 
                className="p-3 bg-[#1d1d1b] text-[#ffd402] rounded-xl border-2 border-[#ffd402] hover:bg-[#2d2d2b] transition-colors shadow-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Dropdown del menú */}
              {menuAbierto && (
                <>
                  {/* Overlay para cerrar al hacer clic fuera */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
                  
                  <div className="absolute right-0 top-full mt-2 bg-[#1d1d1b] rounded-xl border-2 border-[#ffd402] shadow-2xl z-50 min-w-[200px] overflow-hidden">
                    {/* Buscar cartón */}
                    <button 
                      onClick={() => { setMostrarBuscador(true); setMenuAbierto(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#124723] transition-colors text-left"
                    >
                      <Search className="w-5 h-5 text-[#ffd402]" />
                      <span className="font-medium">Buscar cartón</span>
                    </button>
                    
                    <div className="border-t border-[#ffd402]/30" />

                    {/* Finalizar Ronda */}
                    {ganadores.length > 0 && !rondaFinalizada && (
                      <>
                        <button 
                          onClick={() => { onFinalizarRonda(); setMenuAbierto(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-[#68b258] hover:bg-[#124723] transition-colors text-left"
                        >
                          <Flag className="w-5 h-5" />
                          <span className="font-medium">Finalizar Ronda</span>
                        </button>
                        <div className="border-t border-[#ffd402]/30" />
                      </>
                    )}

                    {/* Ver Resultados */}
                    {ganadores.length > 0 && (
                      <>
                        <button 
                          onClick={() => { setMostrarResultados(true); setMenuAbierto(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#124723] transition-colors text-left"
                        >
                          <span className="text-[#ffd402]">🏆</span>
                          <span className="font-medium">Ver Resultados</span>
                        </button>
                        <div className="border-t border-[#ffd402]/30" />
                      </>
                    )}
                    
                    {/* Reiniciar */}
                    <button 
                      onClick={() => { onReiniciar(); setMenuAbierto(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#124723] transition-colors text-left"
                    >
                      <RotateCcw className="w-5 h-5 text-[#baa115]" />
                      <span className="font-medium">Reiniciar sorteo</span>
                    </button>
                    
                    <div className="border-t border-[#ffd402]/30" />
                    
                    {/* Salir */}
                    <button 
                      onClick={() => { onSalir(); setMenuAbierto(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-900/30 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Salir del sorteo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CONTENEDOR TABLERO + CARTÓN BUSCADO */}
          <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
            {/* TABLERO 75 NÚMEROS */}
            <div className={`bg-[#1d1d1b] rounded-2xl p-3 border-4 border-[#ffd402] ${cartonBuscado ? 'w-3/4' : 'w-full'}`}>
              <div className="h-full bg-[#fff] rounded-xl p-2">
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
                            onClick={() => onClickNumero(numero)}
                            className={`
                              rounded-full font-bold text-5xl flex items-center justify-center transition-all cursor-pointer
                              ${sorteado
                                ? esUltimo
                                  ? 'bg-red-600 text-white ring-4 ring-white scale-110 hover:bg-red-700 hover:ring-red-300'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-white text-[#1d1d1b] hover:bg-[#ffd402] hover:scale-110'
                              }
                            `}
                            title={sorteado ? 'Clic para quitar este número' : 'Clic para sortear este número'}
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

            {/* CARTÓN BUSCADO - Panel lateral responsivo */}
            {cartonBuscado && (
              <div className="w-1/4 bg-[#1d1d1b] rounded-2xl p-2 border-4 border-[#ffd402] flex flex-col min-h-0 overflow-hidden">
                {/* Header del cartón */}
                <div className="text-center mb-2 shrink-0">
                  <p className="text-[#ffd402] font-black text-2xl lg:text-4xl">#{cartonBuscado.carton.numero_carton}</p>
                  <p className="text-white text-sm lg:text-base">
                    <span className="text-[#68b258] font-bold text-lg lg:text-xl">{cartonBuscado.aciertos}</span>
                    <span className="text-gray-400">/{cartonBuscado.totalNumeros}</span>
                  </p>
                </div>
                
                {/* Cartón - Se ajusta al espacio disponible */}
                <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
                  <div className="bg-[#f8df7e] rounded-xl p-2 w-full h-full max-h-full flex flex-col">
                    {/* Header BINGO */}
                    <div className="grid grid-cols-5 gap-1 mb-1 shrink-0">
                      {['B', 'I', 'N', 'G', 'O'].map((letra, i) => {
                        const colores = ['#e91e63', '#9c27b0', '#ffd402', '#4caf50', '#ff9800'];
                        return (
                          <div
                            key={letra}
                            className="aspect-square rounded flex items-center justify-center text-white font-black text-xs lg:text-sm"
                            style={{ backgroundColor: colores[i] }}
                          >
                            {letra}
                          </div>
                        );
                      })}
                    </div>
                    {/* Números del cartón - Grid que se ajusta */}
                    <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-1 min-h-0">
                      {cartonBuscado.carton.matriz.map((fila, i) =>
                        fila.map((numero, j) => {
                          const esCentro = i === 2 && j === 2;
                          const estaSorteado = esCentro || numerosSorteados.includes(numero);
                          return (
                            <div
                              key={`${i}-${j}`}
                              className={`rounded flex items-center justify-center font-bold text-xs lg:text-sm ${
                                esCentro
                                  ? 'bg-[#ffd402] text-[#1d1d1b]'
                                  : estaSorteado
                                    ? 'bg-[#68b258] text-white'
                                    : 'bg-white text-[#1d1d1b]'
                              }`}
                            >
                              {esCentro ? '★' : numero}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Serial */}
                <p className="text-[#f8df7e] text-xs text-center mt-1 shrink-0 truncate">Serial: {cartonBuscado.carton.serial}</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== FILA INFERIOR: TODO CENTRADO ===== */}
        <div className="col-span-5 row-span-2 row-start-4 flex items-center justify-center gap-6 min-h-0 overflow-hidden px-4">
          
          {/* COLUMNA IZQUIERDA: Logo + Último número */}
          <div className="shrink-0 flex flex-col items-center justify-center gap-2 h-full py-2">
            {/* LOGO DEL BINGO */}
            <Image
              src="/logo.png"
              alt="Bingo 75"
              width={80}
              height={80}
              className="object-contain w-auto h-[60px]"
              priority
            />
            {/* ÚLTIMO NÚMERO */}
            <div className="flex flex-col items-center">
              <p className="text-white/70 text-base font-bold uppercase">Último</p>
              {ultimoNumero ? (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-white/50 shadow-lg">
                  <span className="text-5xl font-black text-[#1d1d1b]">{ultimoNumero}</span>
                </div>
              ) : (
                <p className="text-[#ffd402] text-6xl font-black">--</p>
              )}
            </div>
          </div>

          {/* FIGURAS EN JUEGO - PROTAGONISTA CENTRAL - Scroll horizontal si hay más de 1 figura */}
          <div className={`flex items-center gap-4 h-full max-h-full py-2 flex-1 min-w-0 ${
            modalidadesActivas.length > 1 
              ? 'overflow-x-auto overflow-y-hidden' 
              : 'justify-center'
          }`}>
            {modalidadesActivas.map((mod) => (
              <PatronModalidadGrande 
                key={mod.id} 
                modalidad={mod} 
                totalFiguras={modalidadesActivas.length}
              />
            ))}
          </div>

          {/* COLUMNA DERECHA: Soporte + Bolas */}
          <div className="shrink-0 flex flex-col items-center justify-center gap-3 h-full py-2">
            {/* NÚMERO DE SOPORTE */}
            <div className="flex flex-col items-center">
              <p className="text-[#fff]/70 text-base font-bold uppercase">Nº Soporte</p>
              <p className="text-[#fff] text-5xl font-black">{numeroSoporte || '---'}</p>
            </div>
            {/* CONTADOR BOLAS */}
            <div className="flex flex-col items-center">
              <p className="text-white/70 text-sm font-bold uppercase">Bolas</p>
              <p className="text-5xl font-black text-white">{totalSorteados}<span className="text-white/50 text-2xl">/75</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cartón Ganador */}
      <CartonGanadorModal
        ganador={ganadorSeleccionado}
        numerosSorteados={numerosSorteados}
        modalidadesActivas={modalidadesActivas}
        onClose={() => setGanadorSeleccionado(null)}
      />

      {/* Modal de Resultados de Ronda */}
      <ResultadosRondaModal
        isOpen={mostrarResultados}
        ganadores={ganadores}
        cartonesConMenosAciertos={cartonesConMenosAciertos}
        pavosoActivo={pavosoActivo}
        rondaActual={rondaActual}
        totalRondas={totalRondas}
        numerosSorteados={numerosSorteados}
        modalidadesActivas={modalidadesActivas}
        onClose={() => setMostrarResultados(false)}
        onSiguienteRonda={handleSiguienteRonda}
      />
    </div>
  );
}
