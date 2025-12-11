'use client';

import { X, Trophy, Frown } from 'lucide-react';
import { Modalidad } from '@/shared/constants/modalidades';

// Tipo unificado para mostrar cualquier cartón
export type DatosCartonModal = {
  tipo: 'ganador' | 'pavoso' | 'menos_aciertos';
  numero_carton: number;
  serial: string;
  matriz: number[][];
  aciertos?: number; // Para menos aciertos
  patronNombre?: string;
  timestamp?: Date;
  // Para pavosos/menos aciertos, necesitamos saber qué números tenían marcados vs el patrón
  numerosMarcados?: number[];
};

interface CartonGanadorModalProps {
  data: DatosCartonModal | null;
  numerosSorteados: number[]; // Todos los números sorteados hasta el momento
  modalidadesActivas: Modalidad[];
  onClose: () => void;
}

export function CartonGanadorModal({
  data,
  numerosSorteados,
  modalidadesActivas,
  onClose,
}: CartonGanadorModalProps) {
  if (!data) return null;

  const esGanador = data.tipo === 'ganador';
  const esPavoso = data.tipo === 'pavoso';

  // Determinar el patrón a mostrar (si hay modalidades activas, usamos la primera para comparar)
  const patron = modalidadesActivas.length > 0 ? modalidadesActivas[0].patron : null;

  // Set de números sorteados para búsqueda rápida
  const numerosSet = new Set(numerosSorteados);

  // Título y Color según tipo
  let titulo = 'DETALLE';
  let icono = <Trophy className="w-16 h-16" />;
  let headerColor = 'bg-[#ffd402]';
  let textColor = 'text-[#1d1d1b]';

  if (esGanador) {
    titulo = '¡BINGO!';
  } else if (esPavoso) {
    titulo = 'PAVOSO';
    icono = <span className="text-6xl">😅</span>;
    headerColor = 'bg-[#baa115]'; // Dorado oscuro
  } else {
    titulo = 'MENOS ACIERTOS';
    icono = <Frown className="w-16 h-16 text-white" />;
    headerColor = 'bg-red-600';
    textColor = 'text-white';
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Tarjeta Principal */}
      <div className="bg-[#1d1d1b] border-4 border-[#ffd402] rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] flex flex-col relative shadow-2xl">
        {/* BOTÓN CERRAR (FLOTANTE FUERA DE LA TARJETA) */}
        <button
          onClick={onClose}
          className="absolute -top-5 -right-5 md:-top-8 md:-right-8 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 border-4 border-[#1d1d1b] z-50 group"
        >
          <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
        </button>

        {/* HEADER */}
        <div
          className={`${headerColor} px-8 py-4 flex items-center justify-between shrink-0 rounded-t-[2.2rem]`}
        >
          <div className={`flex items-center gap-4 ${textColor}`}>
            {icono}
            <div>
              <h2 className="font-black text-3xl md:text-5xl leading-none tracking-tighter">
                {titulo}
              </h2>
              <p className="font-bold text-sm md:text-lg opacity-80 uppercase tracking-widest">
                {data.patronNombre || (modalidadesActivas[0]?.nombre ?? 'Figura')}
              </p>
            </div>
          </div>

          <div className={`text-right ${textColor}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1 opacity-70">
              Cartón Número
            </p>
            <p className="font-black text-5xl md:text-7xl leading-none">#{data.numero_carton}</p>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex flex-col md:flex-row p-6 lg:p-10 gap-8 min-h-0 overflow-y-auto">
          {/* IZQUIERDA: EL CARTÓN */}
          <div className="flex-1 flex flex-col items-center">
            <div className="bg-[#fff] p-3 md:p-4 rounded-3xl shadow-xl w-full max-w-sm aspect-[4/5] flex flex-col">
              {/* Header BINGO */}
              <div className="grid grid-cols-5 gap-1 md:gap-2 mb-2">
                {['B', 'I', 'N', 'G', 'O'].map((l, i) => (
                  <div
                    key={i}
                    className={`h-8 md:h-10 rounded-lg flex items-center justify-center text-white font-black text-xl`}
                    style={{
                      backgroundColor: ['#e91e63', '#9c27b0', '#ffd402', '#4caf50', '#ff9800'][i],
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>

              {/* Matriz Números */}
              <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-1 md:gap-2">
                {data.matriz.map((fila, i) =>
                  fila.map((n, j) => {
                    const esCentro = i === 2 && j === 2;
                    // Lógica para marcar:
                    // 1. Si es centro -> Amarillo
                    // 2. Si salió el número -> Marcado (Verde si es ganador/parte figura, Rojo si es solo acierto)
                    const sorteado = esCentro || numerosSet.has(n);

                    // Verificamos si este número es parte de la figura que se está jugando
                    const esParteDeLaFigura = patron ? patron[i][j] : false;

                    let bgClass = 'bg-gray-100 text-gray-800'; // Default

                    if (esCentro) {
                      bgClass = 'bg-[#ffd402] text-black shadow-lg scale-105 z-10';
                    } else if (sorteado) {
                      if (esParteDeLaFigura) {
                        // Salió y es parte de la figura (Bueno)
                        bgClass = 'bg-[#4caf50] text-white font-black';
                      } else {
                        // Salió pero no es parte de la figura (Neutro)
                        bgClass = 'bg-[#81c784] text-white';
                      }
                    } else if (esParteDeLaFigura) {
                      // No ha salido pero ES parte de la figura (Lo que falta)
                      bgClass = 'bg-white border-2 border-red-500 text-red-500 relative';
                    }

                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`rounded-lg flex items-center justify-center font-bold text-lg md:text-xl relative ${bgClass}`}
                      >
                        {esCentro ? '★' : n}
                        {/* Indicador de "Falta este" para menos aciertos */}
                        {!sorteado && esParteDeLaFigura && !esGanador && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <p className="mt-3 text-gray-400 font-mono text-sm">Serial: {data.serial}</p>
          </div>

          {/* DERECHA: ESTADÍSTICAS */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {/* Caja de Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-[#ffd402] font-bold uppercase tracking-widest mb-2">
                Estado del Cartón
              </p>

              {esGanador ? (
                <p className="text-4xl font-black text-white">¡GANADOR!</p>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black text-white">{data.aciertos ?? 0}</span>
                  <span className="text-gray-400 uppercase font-bold text-sm">
                    Aciertos Totales
                  </span>
                </div>
              )}
            </div>

            {/* Comparativa Visual Pequeña */}
            <div className="bg-[#0a2e16] rounded-2xl p-4 border border-[#68b258] flex flex-col items-center">
              <p className="text-white text-xs uppercase mb-2">
                Figura Jugada: {modalidadesActivas[0]?.nombre}
              </p>
              <div className="grid grid-cols-5 gap-2 w-32 h-32">
                {patron?.map((fila, i) =>
                  fila.map((activo, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`rounded-sm ${activo || (i === 2 && j === 2) ? 'bg-[#ffd402]' : 'bg-white/10'}`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
