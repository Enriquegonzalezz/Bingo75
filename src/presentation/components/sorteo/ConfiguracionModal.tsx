'use client';

import { useState } from 'react';
import { X, Play, HelpCircle } from 'lucide-react';
import { Modalidad, CategoriaModalidad } from '@/shared/constants/modalidades';

// Re-exportar tipos para uso externo
export type { Modalidad, CategoriaModalidad };

// Configuración de una ronda
export interface ConfiguracionRonda {
  numero: number;
  pavosoActivo: boolean;
  menosAciertosActivo: boolean;
  modalidades: string[]; // IDs de modalidades para esta ronda
  premio: number; // Premio en dólares para esta ronda
  patronPersonalizado?: boolean[][]; // Patrón personalizado para esta ronda
  nombrePatronPersonalizado?: string; // Nombre del patrón personalizado
}

// Configuración del juego
export interface ConfiguracionJuego {
  modalidadesSeleccionadas: string[];
  rangoCartones: {
    desde: number;
    hasta: number;
  };
  avisoPremiAutomatico: boolean;
  numeroRondas: number;
  rondas: ConfiguracionRonda[];
  numeroSoporte: string;
}

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (config: ConfiguracionJuego) => void;
  modalidades: Modalidad[];
  totalCartones: number;
}

// Componente para mostrar un patrón de modalidad
function PatronModalidad({ 
  modalidad, 
  seleccionado, 
  onClick 
}: { 
  modalidad: Modalidad; 
  seleccionado: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center p-2 rounded-lg transition-all
        ${seleccionado 
          ? 'bg-[#68b258] border-2 border-[#ffd402] shadow-lg scale-105' 
          : 'bg-[#124723] border-2 border-[#baa115] hover:border-[#ffd402] hover:scale-102'
        }
      `}
    >
      {/* Grid del patrón */}
      <div className="grid grid-cols-5 gap-0.5 mb-1">
        {modalidad.patron.map((fila, i) =>
          fila.map((activo, j) => (
            <div
              key={`${i}-${j}`}
              className={`
                w-4 h-4 rounded-sm
                ${i === 2 && j === 2 
                  ? 'bg-white' 
                  : activo 
                    ? 'bg-[#ffd402]' 
                    : 'bg-[#1d1d1b]'
                }
              `}
            />
          ))
        )}
      </div>
      {/* Nombre */}
      <span className={`text-xs font-semibold text-center ${seleccionado ? 'text-white' : 'text-[#f8df7e]'}`}>
        {modalidad.nombre}
      </span>
    </button>
  );
}

export function ConfiguracionModal({
  isOpen,
  onClose,
  onConfirmar,
  modalidades,
  totalCartones,
}: ConfiguracionModalProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaModalidad>('BINGO');
  const [rangoDesde, setRangoDesde] = useState(1);
  const [rangoHasta, setRangoHasta] = useState(2000);
  const [avisoAutomatico, setAvisoAutomatico] = useState(true);
  const [numeroRondas, setNumeroRondas] = useState(1);
  const [rondas, setRondas] = useState<ConfiguracionRonda[]>([
    { numero: 1, pavosoActivo: true, menosAciertosActivo: true, modalidades: [], premio: 0 }
  ]);
  const [numeroSoporte, setNumeroSoporte] = useState('');
  const [rondaSeleccionada, setRondaSeleccionada] = useState(1); // Ronda actualmente seleccionada para editar

  // Patrón vacío por defecto
  const patronVacio: boolean[][] = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, true, false, false], // Centro es FREE
    [false, false, false, false, false],
    [false, false, false, false, false],
  ];

  // Obtener patrón personalizado de la ronda seleccionada
  const patronPersonalizado = rondas.find(r => r.numero === rondaSeleccionada)?.patronPersonalizado || patronVacio;
  const nombrePatronPersonalizado = rondas.find(r => r.numero === rondaSeleccionada)?.nombrePatronPersonalizado || '';

  if (!isOpen) return null;

  const categorias: { key: CategoriaModalidad; label: string }[] = [
    { key: 'BINGO', label: 'BINGO' },
    { key: 'LETRAS', label: 'LETRAS' },
    { key: 'COSAS_ANIMALES', label: 'COSAS / ANIMALES' },
    { key: 'FORMAS', label: 'FORMAS' },
    { key: 'NUMEROS', label: 'NÚMEROS' },
    { key: 'PERSONALIZADO', label: 'PERSONALIZADO' },
  ];

  const modalidadesFiltradas = modalidades.filter(m => m.categoria === categoriaActiva);

  // Obtener modalidades de la ronda seleccionada
  const rondaActual = rondas.find(r => r.numero === rondaSeleccionada);
  const modalidadesRondaActual = new Set(rondaActual?.modalidades || []);

  // Toggle modalidad para la ronda seleccionada
  const toggleModalidad = (id: string) => {
    setRondas(prev => prev.map(r => {
      if (r.numero !== rondaSeleccionada) return r;
      const nuevasModalidades = r.modalidades.includes(id)
        ? r.modalidades.filter(m => m !== id)
        : [...r.modalidades, id];
      return { ...r, modalidades: nuevasModalidades };
    }));
  };

  const handleConfirmar = () => {
    // Recopilar todas las modalidades únicas de todas las rondas
    const todasModalidades = new Set<string>();
    rondas.forEach(r => r.modalidades.forEach(m => todasModalidades.add(m)));
    
    onConfirmar({
      modalidadesSeleccionadas: Array.from(todasModalidades),
      rangoCartones: {
        desde: rangoDesde,
        hasta: rangoHasta,
      },
      avisoPremiAutomatico: avisoAutomatico,
      numeroRondas,
      rondas,
      numeroSoporte,
    });
  };

  // Toggle celda del patrón personalizado para la ronda seleccionada
  const toggleCeldaPersonalizada = (fila: number, col: number) => {
    if (fila === 2 && col === 2) return;
    
    setRondas(prev => prev.map(r => {
      if (r.numero !== rondaSeleccionada) return r;
      const patronActual = r.patronPersonalizado || patronVacio;
      const nuevoPatron = patronActual.map((f, i) => 
        i === fila ? f.map((c, j) => j === col ? !c : c) : [...f]
      );
      return { ...r, patronPersonalizado: nuevoPatron };
    }));
  };

  // Actualizar nombre del patrón personalizado para la ronda seleccionada
  const setNombrePatronPersonalizado = (nombre: string) => {
    setRondas(prev => prev.map(r => {
      if (r.numero !== rondaSeleccionada) return r;
      return { ...r, nombrePatronPersonalizado: nombre };
    }));
  };

  // Limpiar patrón personalizado de la ronda seleccionada
  const limpiarPatronPersonalizado = () => {
    setRondas(prev => prev.map(r => {
      if (r.numero !== rondaSeleccionada) return r;
      return { 
        ...r, 
        patronPersonalizado: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, true, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
        nombrePatronPersonalizado: ''
      };
    }));
  };

  const celdasActivasPersonalizado = patronPersonalizado.flat().filter(Boolean).length;

  // Manejar cambio de número de rondas
  const handleNumeroRondasChange = (value: number) => {
    const num = Math.max(1, Math.min(value, 20));
    setNumeroRondas(num);
    
    const nuevasRondas: ConfiguracionRonda[] = [];
    for (let i = 1; i <= num; i++) {
      const rondaExistente = rondas.find(r => r.numero === i);
      nuevasRondas.push(rondaExistente || {
        numero: i,
        pavosoActivo: true,
        menosAciertosActivo: true,
        modalidades: [],
        premio: 0,
      });
    }
    setRondas(nuevasRondas);
    
    // Si la ronda seleccionada ya no existe, seleccionar la última
    if (rondaSeleccionada > num) {
      setRondaSeleccionada(num);
    }
  };

  // Toggle pavoso para una ronda
  const togglePavosoRonda = (numeroRonda: number) => {
    setRondas(prev => prev.map(r => 
      r.numero === numeroRonda ? { ...r, pavosoActivo: !r.pavosoActivo } : r
    ));
  };

  // Toggle menos aciertos para una ronda
  const toggleMenosAciertosRonda = (numeroRonda: number) => {
    setRondas(prev => prev.map(r => 
      r.numero === numeroRonda ? { ...r, menosAciertosActivo: !r.menosAciertosActivo } : r
    ));
  };

  // Actualizar premio de una ronda
  const actualizarPremioRonda = (numeroRonda: number, premio: number) => {
    setRondas(prev => prev.map(r => 
      r.numero === numeroRonda ? { ...r, premio } : r
    ));
  };

  // Copiar modalidades de otra ronda
  const copiarModalidadesDeRonda = (desdeRonda: number) => {
    const rondaOrigen = rondas.find(r => r.numero === desdeRonda);
    if (!rondaOrigen) return;
    
    setRondas(prev => prev.map(r => 
      r.numero === rondaSeleccionada ? { ...r, modalidades: [...rondaOrigen.modalidades] } : r
    ));
  };

  const handleRangoDesdeChange = (value: string) => {
    const num = parseInt(value) || 1;
    setRangoDesde(Math.max(1, Math.min(num, totalCartones)));
  };

  const handleRangoHastaChange = (value: string) => {
    const num = parseInt(value) || totalCartones;
    setRangoHasta(Math.max(rangoDesde, Math.min(num, totalCartones)));
  };

  // Verificar si todas las rondas tienen al menos una modalidad
  const todasRondasTienenModalidades = rondas.every(r => r.modalidades.length > 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#e8e8e8] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#124723] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#ffd402]">Opciones de la nueva partida</h2>
          <button
            onClick={onClose}
            className="text-[#f8df7e] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Selector de Ronda */}
          <div className="bg-[#124723] rounded-xl p-4 mb-6">
            {/* Número de rondas - MÁS VISIBLE */}
            <div className="bg-[#ffd402] rounded-lg p-3 mb-4 flex items-center justify-center gap-4">
              <span className="text-[#1d1d1b] font-black text-lg">🎲 NÚMERO DE RONDAS:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNumeroRondasChange(numeroRondas - 1)}
                  disabled={numeroRondas <= 1}
                  className="w-10 h-10 bg-[#124723] text-white font-black text-xl rounded-lg hover:bg-[#1d5c2e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  value={numeroRondas}
                  onChange={(e) => handleNumeroRondasChange(parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                  className="w-20 h-10 px-2 rounded-lg text-center font-black text-2xl border-2 border-[#124723]"
                />
                <button
                  onClick={() => handleNumeroRondasChange(numeroRondas + 1)}
                  disabled={numeroRondas >= 20}
                  className="w-10 h-10 bg-[#124723] text-white font-black text-xl rounded-lg hover:bg-[#1d5c2e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#ffd402] font-bold">🎯 Selecciona la Ronda para configurar:</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {rondas.map((ronda) => (
                <button
                  key={ronda.numero}
                  onClick={() => setRondaSeleccionada(ronda.numero)}
                  className={`
                    px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2
                    ${rondaSeleccionada === ronda.numero
                      ? 'bg-[#ffd402] text-[#1d1d1b] scale-105'
                      : 'bg-[#1d1d1b] text-[#f8df7e] hover:bg-[#2d2d2b]'
                    }
                  `}
                >
                  <span>Ronda {ronda.numero}</span>
                  {ronda.modalidades.length > 0 ? (
                    <span className="bg-[#68b258] text-white text-xs px-2 py-0.5 rounded-full">
                      {ronda.modalidades.length}
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">0</span>
                  )}
                </button>
              ))}
            </div>

            {/* Opciones de la ronda seleccionada */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#ffd402]/30 flex-wrap">
              <span className="text-[#f8df7e] text-sm">Ronda {rondaSeleccionada}:</span>
              
              {/* Premio de la ronda */}
              <div className="flex items-center gap-2 bg-[#ffd402] rounded-lg px-3 py-1">
                <span className="text-[#1d1d1b] font-bold text-sm">💰 Premio:</span>
                <span className="text-[#1d1d1b] font-bold">$</span>
                <input
                  type="number"
                  value={rondaActual?.premio || 0}
                  onChange={(e) => actualizarPremioRonda(rondaSeleccionada, parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                  className="w-24 px-2 py-1 rounded text-center font-bold text-[#1d1d1b] border-2 border-[#baa115]"
                  placeholder="0.00"
                />
              </div>

              <button
                onClick={() => togglePavosoRonda(rondaSeleccionada)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  rondaActual?.pavosoActivo ? 'bg-[#68b258] text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                 Pavoso {rondaActual?.pavosoActivo ? '✓' : '✗'}
              </button>
              <button
                onClick={() => toggleMenosAciertosRonda(rondaSeleccionada)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  rondaActual?.menosAciertosActivo ? 'bg-[#68b258] text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                Menos Aciertos {rondaActual?.menosAciertosActivo ? '✓' : '✗'}
              </button>
              {rondaSeleccionada > 1 && (
                <button
                  onClick={() => copiarModalidadesDeRonda(rondaSeleccionada - 1)}
                  className="text-xs text-[#ffd402] hover:underline"
                >
                  📋 Copiar de Ronda {rondaSeleccionada - 1}
                </button>
              )}
            </div>
          </div>

          {/* Tabs de categorías */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 mr-4">
              <span className="text-2xl font-black text-[#124723]">1</span>
              <span className="text-2xl font-black text-[#baa115]">2</span>
              <span className="text-2xl font-black text-[#68b258]">3</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoriaActiva(cat.key)}
                  className={`
                    px-4 py-2 rounded font-bold text-sm transition-all
                    ${categoriaActiva === cat.key
                      ? 'bg-[#124723] text-white'
                      : 'bg-white text-[#124723] border-2 border-[#124723] hover:bg-[#124723] hover:text-white'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button className="ml-auto p-2 bg-white rounded border-2 border-[#124723] hover:bg-[#124723] hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Grid de modalidades o Editor Personalizado */}
          <div className="bg-white rounded-lg p-4 mb-6 min-h-[180px]">
            <p className="text-sm text-gray-600 mb-3">
              Seleccionando figuras para <span className="font-bold text-[#124723]">Ronda {rondaSeleccionada}</span>
            </p>
            
            {categoriaActiva === 'PERSONALIZADO' ? (
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-bold text-[#124723]">Diseña tu patrón personalizado</h3>
                <p className="text-sm text-gray-600 text-center">
                  Haz clic en las celdas para activar/desactivar. El centro (FREE) siempre está activo.
                </p>
                
                {/* Input para nombre del patrón */}
                <div className="w-full max-w-xs">
                  <label className="block text-sm font-semibold text-[#124723] mb-1">Nombre del patrón:</label>
                  <input
                    type="text"
                    value={nombrePatronPersonalizado}
                    onChange={(e) => setNombrePatronPersonalizado(e.target.value)}
                    placeholder="Ej: Mi figura especial"
                    className="w-full px-3 py-2 border-2 border-[#124723] rounded-lg focus:outline-none focus:border-[#ffd402] text-center font-semibold"
                    maxLength={30}
                  />
                </div>
                
                <div className="bg-[#124723] p-4 rounded-xl shadow-lg">
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {['B', 'I', 'N', 'G', 'O'].map((letra) => (
                      <div key={letra} className="w-12 h-8 flex items-center justify-center text-[#ffd402] font-black text-lg">
                        {letra}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {patronPersonalizado.map((fila, i) =>
                      fila.map((activo, j) => {
                        const esCentro = i === 2 && j === 2;
                        return (
                          <button
                            key={`${i}-${j}`}
                            onClick={() => toggleCeldaPersonalizada(i, j)}
                            className={`
                              w-12 h-12 rounded-lg font-bold text-sm flex items-center justify-center
                              transition-all duration-200 transform hover:scale-105
                              ${esCentro
                                ? 'bg-white text-[#124723] cursor-default'
                                : activo
                                  ? 'bg-[#ffd402] text-[#1d1d1b] shadow-lg'
                                  : 'bg-[#1d1d1b] text-gray-500 hover:bg-[#2d2d2b]'
                              }
                            `}
                          >
                            {esCentro ? 'FREE' : activo ? '✓' : ''}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={limpiarPatronPersonalizado}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    Limpiar patrón
                  </button>
                  <span className="text-sm text-gray-600">
                    Celdas activas: <span className="font-bold text-[#124723]">{celdasActivasPersonalizado}</span>
                  </span>
                  <button
                    onClick={() => {
                      if (celdasActivasPersonalizado >= 2) {
                        toggleModalidad('personalizado');
                      }
                    }}
                    disabled={celdasActivasPersonalizado < 2}
                    className={`
                      px-4 py-2 rounded-lg font-bold transition-all
                      ${modalidadesRondaActual.has('personalizado')
                        ? 'bg-[#68b258] text-white'
                        : celdasActivasPersonalizado >= 2
                          ? 'bg-[#124723] text-white hover:bg-[#1d5c2e]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {modalidadesRondaActual.has('personalizado') ? '✓ Patrón seleccionado' : 'Usar este patrón'}
                  </button>
                </div>
                {celdasActivasPersonalizado < 2 && (
                  <p className="text-xs text-red-500">Selecciona al menos 2 celdas para crear un patrón válido</p>
                )}
              </div>
            ) : modalidadesFiltradas.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No hay modalidades en esta categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {modalidadesFiltradas.map((mod) => (
                  <PatronModalidad
                    key={mod.id}
                    modalidad={mod}
                    seleccionado={modalidadesRondaActual.has(mod.id)}
                    onClick={() => toggleModalidad(mod.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Configuración de partida */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-[#124723] mb-4">Configuración de partida:</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 w-24">Nº Soporte:</label>
                  <input
                    type="text"
                    value={numeroSoporte}
                    onChange={(e) => setNumeroSoporte(e.target.value)}
                    placeholder="Ej: 001234"
                    className="flex-1 px-3 py-2 border-2 border-[#baa115] rounded-lg text-center font-bold 
                      focus:border-[#ffd402] focus:ring-2 focus:ring-[#ffd402]/20 outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 w-24">Rango:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Desde</span>
                    <input
                      type="number"
                      value={rangoDesde}
                      onChange={(e) => handleRangoDesdeChange(e.target.value)}
                      min={1}
                      max={totalCartones}
                      className="w-20 px-2 py-1 border-2 border-gray-300 rounded text-center font-bold"
                    />
                    <span className="text-sm text-gray-600">Hasta</span>
                    <input
                      type="number"
                      value={rangoHasta}
                      onChange={(e) => handleRangoHastaChange(e.target.value)}
                      min={rangoDesde}
                      max={totalCartones}
                      className="w-20 px-2 py-1 border-2 border-gray-300 rounded text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="avisoAutomatico"
                    checked={avisoAutomatico}
                    onChange={(e) => setAvisoAutomatico(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="avisoAutomatico" className="text-sm text-gray-700">
                    Aviso de premio automático
                  </label>
                </div>

                <div className="bg-[#f8df7e] rounded p-3 text-center">
                  <p className="text-sm font-semibold text-[#124723]">
                    Se jugarán con <span className="font-black">{(rangoHasta - rangoDesde + 1).toLocaleString()}</span> cartones
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen de rondas */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-[#124723] mb-4">Resumen de Rondas:</h3>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {rondas.map((ronda) => (
                  <div 
                    key={ronda.numero}
                    className={`p-2 rounded-lg border-2 ${
                      ronda.modalidades.length === 0 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-[#68b258] bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#124723]">Ronda {ronda.numero}</span>
                      <span className={`text-xs font-bold ${ronda.modalidades.length === 0 ? 'text-red-500' : 'text-[#68b258]'}`}>
                        {ronda.modalidades.length} figura(s)
                      </span>
                    </div>
                    {ronda.modalidades.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {ronda.modalidades.slice(0, 3).map(id => {
                          const mod = modalidades.find(m => m.id === id);
                          return mod?.nombre || id;
                        }).join(', ')}
                        {ronda.modalidades.length > 3 && ` +${ronda.modalidades.length - 3} más`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#ffcccc] text-[#990000] font-bold rounded-lg hover:bg-[#ff9999] transition-colors"
            >
              Salir (Esc)
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!todasRondasTienenModalidades}
              className={`
                px-6 py-3 font-bold rounded-lg flex items-center gap-2 transition-colors
                ${!todasRondasTienenModalidades
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#68b258] text-white hover:bg-[#124723]'
                }
              `}
            >
              <Play className="w-5 h-5" />
              INICIAR PARTIDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
