'use client';

import { useState, useEffect, useCallback } from 'react';
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
  premio: number; // Premio para esta ronda
  moneda?: 'USD' | 'VES'; // Moneda específica para esta ronda
  patronPersonalizado?: boolean[][]; // Patrón personalizado para esta ronda
  nombrePatronPersonalizado?: string; // Nombre del patrón personalizado
  cartonesIndividuales?: number[]; // Cartones específicos para esta ronda (opcional)
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
  paqueteId: string;
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
          ? 'bg-[#fbf7da] border-2 border-[#ffd402] shadow-lg scale-105 text-black' 
          : 'bg-[#6a2818] border-2 border-[#baa115] hover:border-[#ffd402] hover:scale-102'
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
      <span className={`text-xs font-semibold text-center ${seleccionado ? 'text-black' : 'text-white'}`}>
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
    { numero: 1, pavosoActivo: true, menosAciertosActivo: true, modalidades: [], premio: 0, moneda: 'USD' }
  ]);
  const [numeroSoporte, setNumeroSoporte] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedNumero = localStorage.getItem('bingo75_numero_soporte');
      return savedNumero || '0400-0000000';
    }
    return '0400-0000000';
  });
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState('paquete-original');
  const [rondaSeleccionada, setRondaSeleccionada] = useState(1); // Ronda actualmente seleccionada para editar
  const [inputCartonesIndividuales, setInputCartonesIndividuales] = useState(''); // Input temporal para cartones individuales
  const [usarCartonesEspecificos, setUsarCartonesEspecificos] = useState(false); // Controla si se usan cartones específicos para la ronda actual

  // Paquetes disponibles
  const paquetesDisponibles = [
    { id: 'paquete-original', nombre: 'Paquete Original', cartones: '10,002' },
    { id: 'paquete-alpha', nombre: 'Paquete Alpha', cartones: '10,000' },
    { id: 'paquete-beta', nombre: 'Paquete Beta', cartones: '10,000' },
    { id: 'paquete-gamma', nombre: 'Paquete Gamma', cartones: '10,000' },
    { id: 'paquete-delta', nombre: 'Paquete Delta', cartones: '10,000' },
  ];

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

  // Handler para cerrar con Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Agregar listener para tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Guardar número de soporte en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bingo75_numero_soporte', numeroSoporte);
    }
  }, [numeroSoporte]);

  // Sincronizar checkbox con cartones específicos de la ronda seleccionada
  useEffect(() => {
    const ronda = rondas.find(r => r.numero === rondaSeleccionada);
    setUsarCartonesEspecificos(
      ronda?.cartonesIndividuales !== undefined && ronda.cartonesIndividuales.length > 0
    );
  }, [rondaSeleccionada, rondas]);

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

  // Seleccionar modalidad para la ronda seleccionada (solo UNA por ronda)
  const toggleModalidad = (id: string) => {
    setRondas(prev => prev.map(r => {
      if (r.numero !== rondaSeleccionada) return r;
      // Si ya está seleccionada, deseleccionar. Si no, reemplazar con la nueva (solo 1)
      const nuevasModalidades = r.modalidades.includes(id)
        ? []
        : [id];
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
      paqueteId: paqueteSeleccionado,
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
  const handleNumeroRondasChange = (n: number) => {
    setNumeroRondas(n);
    const nuevasRondas: ConfiguracionRonda[] = [];
    for (let i = 1; i <= n; i++) {
      const rondaExistente = rondas.find(r => r.numero === i);
      if (rondaExistente) {
        nuevasRondas.push(rondaExistente);
      } else {
        nuevasRondas.push({
          numero: i,
          pavosoActivo: true,
          menosAciertosActivo: true,
          modalidades: [],
          premio: 0,
          moneda: 'USD',
        });
      }
    }
    setRondas(nuevasRondas);
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

  // Actualizar moneda de una ronda
  const actualizarMonedaRonda = (numeroRonda: number, moneda: 'USD' | 'VES') => {
    setRondas(prev => prev.map(r => 
      r.numero === numeroRonda ? { ...r, moneda } : r
    ));
  };

  // Actualizar cartones individuales de una ronda
  const actualizarCartonesIndividuales = (numeroRonda: number, cartones: number[]) => {
    setRondas(prev => prev.map(r => 
      r.numero === numeroRonda ? { ...r, cartonesIndividuales: cartones } : r
    ));
  };

  // Agregar cartones individuales desde el input
  const agregarCartonesIndividuales = () => {
    const numeros = inputCartonesIndividuales
      .split(/[,\s]+/) // Separar por comas o espacios
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= totalCartones); // Validar números
    
    if (numeros.length > 0) {
      const cartonesActuales = rondaActual?.cartonesIndividuales || [];
      const nuevosCartones = [...new Set([...cartonesActuales, ...numeros])].sort((a, b) => a - b);
      actualizarCartonesIndividuales(rondaSeleccionada, nuevosCartones);
      setInputCartonesIndividuales('');
    }
  };

  // Eliminar un cartón individual
  const eliminarCartonIndividual = (numeroRonda: number, carton: number) => {
    setRondas(prev => prev.map(r => {
      if (r.numero !== numeroRonda) return r;
      const nuevosCartones = (r.cartonesIndividuales || []).filter(c => c !== carton);
      return { ...r, cartonesIndividuales: nuevosCartones.length > 0 ? nuevosCartones : undefined };
    }));
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
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#e8e8e8] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#6a2818] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#fff]">Opciones de la nueva partida</h2>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-[#fff] hover:text-red-600 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Selector de Ronda */}
          <div className="bg-[#fbf7da] rounded-xl p-4 mb-6">
            {/* Número de rondas - MÁS VISIBLE */}
            <div className="bg-[#6a2818] rounded-lg p-3 mb-4 flex items-center justify-center gap-4">
              <span className="text-[white] font-black text-lg">NÚMERO DE RONDAS:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNumeroRondasChange(numeroRondas - 1)}
                  disabled={numeroRondas <= 1}
                  className="w-10 h-10 bg-[#ffdb4f] text-[#000] font-black text-xl rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  value={numeroRondas}
                  onChange={(e) => handleNumeroRondasChange(parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                  className="w-20 h-10 px-2 rounded-lg text-center font-black text-2xl border-2 border-[#fbf7da]"
                />
                <button
                  onClick={() => handleNumeroRondasChange(numeroRondas + 1)}
                  disabled={numeroRondas >= 20}
                  className="w-10 h-10 bg-[#ffdb4f] text-[#000] font-black text-xl rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#000] font-bold">Selecciona la Ronda para configurar:</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {rondas.map((ronda) => (
                <button
                  key={ronda.numero}
                  onClick={() => setRondaSeleccionada(ronda.numero)}
                  className={`
                    px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2
                    ${rondaSeleccionada === ronda.numero
                      ? 'bg-[#6a2818] text-white scale-105'
                      : 'bg-[#f4eba6] text-[#6a2818] '
                    }
                  `}
                >
                  <span>Ronda {ronda.numero}</span>
                  {ronda.modalidades.length > 0 ? (
                    <span className="bg-[#6a2818] text-white text-xs px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">!</span>
                  )}
                </button>
              ))}
            </div>

            {/* Opciones de la ronda seleccionada */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#ffd402]/30 flex-wrap">
              <span className="text-[#000] font-bold">Ronda {rondaSeleccionada}:</span>
              
              {/* Moneda de la ronda */}
              <div className="flex items-center gap-2 bg-[#6a2818] rounded-lg px-3 py-1 h-10">
                <span className="text-[#fbf7da] font-bold text-sm">Moneda:</span>
                <button
                  onClick={() => actualizarMonedaRonda(rondaSeleccionada, 'USD')}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    rondaActual?.moneda === 'USD' 
                      ? 'bg-[#ffdb4f] text-[#1d1d1b]' 
                      : 'bg-[#fbf7da] text-[#1d1d1b]'
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => actualizarMonedaRonda(rondaSeleccionada, 'VES')}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    rondaActual?.moneda === 'VES' 
                      ? 'bg-[#ffdb4f] text-[#1d1d1b]' 
                      : 'bg-[#fbf7da] text-[#1d1d1b]'
                  }`}
                >
                  Bs. VES
                </button>
              </div>

              {/* Premio de la ronda */}
              <div className="flex items-center gap-2 bg-[#6a2818] rounded-lg px-3 py-1 h-10">
                <span className="text-[#fbf7da] font-bold text-sm">💰 Premio:</span>
                <span className="text-[#fbf7da] font-bold">{rondaActual?.moneda === 'USD' ? '$' : 'Bs.'}</span>
                <input
                  type="number"
                  value={rondaActual?.premio || 0}
                  onChange={(e) => actualizarPremioRonda(rondaSeleccionada, parseFloat(e.target.value) || 0)}
                  min={0}
                  step={rondaActual?.moneda === 'USD' ? 0.01 : 1}
                  className="w-24 px-2 py-1 text-center font-bold bg-[#fff] rounded-[4px] text-[#000] "
                  placeholder={rondaActual?.moneda === 'USD' ? '0.00' : '0'}
                />
              </div>

              <button
                onClick={() => togglePavosoRonda(rondaSeleccionada)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  rondaActual?.pavosoActivo ? 'bg-[#000] text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                 Pavoso {rondaActual?.pavosoActivo ? '✓' : '✗'}
              </button>
              <button
                onClick={() => toggleMenosAciertosRonda(rondaSeleccionada)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  rondaActual?.menosAciertosActivo ? 'bg-[#000] text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                Menos Aciertos {rondaActual?.menosAciertosActivo ? '✓' : '✗'}
              </button>
              {/* {rondaSeleccionada > 1 && (
                <button
                  onClick={() => copiarModalidadesDeRonda(rondaSeleccionada - 1)}
                  className="text-xs text-[#ffd402] hover:underline"
                >
                  📋 Copiar de Ronda {rondaSeleccionada - 1}
                </button>
              )} */}
            </div>
          </div>

          {/* Tabs de categorías */}
          <div className="flex items-center justify-start gap-2 mb-4">
            {/* <div className="flex items-center gap-1 mr-4">
              <span className="text-2xl font-black text-[#6a2818]">1</span>
              <span className="text-2xl font-black text-[#baa115]">2</span>
              <span className="text-2xl font-black text-[#68b258]">3</span>
            </div> */}
            
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoriaActiva(cat.key)}
                  className={`
                    px-4 py-2 rounded font-bold text-sm transition-all
                    ${categoriaActiva === cat.key
                      ? 'bg-[#6a2818] text-white'
                      : 'bg-white text-[#6a2818] border-2 border-[#6a2818] hover:bg-[#6a2818] hover:text-white'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* <button className="ml-auto p-2 bg-white rounded border-2 border-[#124723] hover:bg-[#124723] hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button> */}
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
                    className="w-full px-3 py-2 border-2 border-[#124723] rounded-lg focus:outline-none focus:border-[#ffd402] text-center font-semibold text-black"
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
                {/* Selector de Paquete de Cartones */}
                <div className="bg-gradient-to-r from-[#6a2818] to-[#8b3a24] rounded-lg p-4">
                  <label className="block text-sm font-bold text-[#ffd402] mb-2">
                    📦 Paquete de Cartones
                  </label>
                  <select
                    value={paqueteSeleccionado}
                    onChange={(e) => setPaqueteSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#ffd402] rounded-lg focus:ring-2 focus:ring-[#ffd402] focus:border-transparent font-bold text-[#1d1d1b] bg-[#fbf7da]"
                  >
                    {paquetesDisponibles.map((paquete) => (
                      <option key={paquete.id} value={paquete.id}>
                        {paquete.nombre} ({paquete.cartones} cartones)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#fbf7da] mt-2">
                    💡 Cada paquete contiene cartones únicos y diferentes
                  </p>
                </div>

                {/* Nota sobre moneda por ronda */}
               

                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 w-24">Nº Soporte:</label>
                  <input
                    type="text"
                    value={numeroSoporte}
                    onChange={(e) => setNumeroSoporte(e.target.value)}
                    placeholder="Ej: 0414-0329023"
                    className="flex-1 px-3 py-2 border-2 border-[#baa115] rounded-lg text-center font-bold text-black
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
                      className="w-20 px-2 py-1 border-2 border-gray-300 rounded text-center font-bold text-black"
                    />
                    <span className="text-sm text-gray-600">Hasta</span>
                    <input
                      type="number"
                      value={rangoHasta}
                      onChange={(e) => handleRangoHastaChange(e.target.value)}
                      min={rangoDesde}
                      max={totalCartones}
                      className="w-20 px-2 py-1 border-2 border-gray-300 rounded text-center font-bold text-black"
                    />
                  </div>
                </div>

                

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cartonesEspecificos"
                    checked={usarCartonesEspecificos}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setUsarCartonesEspecificos(checked);
                      // Si se desmarca, limpiar los cartones específicos de esta ronda
                      if (!checked) {
                        actualizarCartonesIndividuales(rondaSeleccionada, []);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="cartonesEspecificos" className="text-sm text-gray-700">
                    ¿Cartones específicos para esta ronda?
                  </label>
                </div>

                {/* Sección de Cartones Específicos - Solo visible si el checkbox está activo */}
                {usarCartonesEspecificos && (
                  <div className="bg-[#fbf7da] rounded-lg p-4 mt-2">
                    <h4 className="text-[#000] font-bold mb-2 text-sm">Cartones Específicos para Ronda {rondaSeleccionada}</h4>
                    <p className="text-[#000] text-xs mb-3">
                     Si deseas que solo participen ciertos cartones en esta ronda, agrega sus números aquí, si no se agrega ninguno utilizará el rango general.
                    </p>
                    
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={inputCartonesIndividuales}
                        onChange={(e) => setInputCartonesIndividuales(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && agregarCartonesIndividuales()}
                        placeholder="Ej: 20, 35, 40, 85, 100"
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-[#fbf7da] text-[#000] font-semibold text-sm bg-[#fff]"
                      />
                      <button
                        onClick={agregarCartonesIndividuales}
                        className="px-4 py-2 bg-[#6a2818] text-[#fff] font-bold rounded-lg hover:bg-[#e6c000] transition-colors text-sm"
                      >
                        Agregar
                      </button>
                    </div>

                    {rondaActual?.cartonesIndividuales && rondaActual.cartonesIndividuales.length > 0 && (
                      <div className="bg-[#fbf7da] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#6a2818] text-xs font-bold">
                            {rondaActual.cartonesIndividuales.length} cartón(es) seleccionado(s)
                          </span>
                          <button
                            onClick={() => actualizarCartonesIndividuales(rondaSeleccionada, [])}
                            className="text-red-400 hover:text-red-300 text-xs font-bold"
                          >
                            Limpiar todos
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rondaActual.cartonesIndividuales.map((carton) => (
                            <div
                              key={carton}
                              className="bg-[#6a2818] text-[#fbf7da] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"
                            >
                              #{carton}
                              <button
                                onClick={() => eliminarCartonIndividual(rondaSeleccionada, carton)}
                                className="hover:text-red-600 font-black"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                        {ronda.modalidades.length === 0 ? 'Sin figura' : '1 figura'}
                      </span>
                    </div>
                    {ronda.modalidades.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {(() => {
                          const mod = modalidades.find(m => m.id === ronda.modalidades[0]);
                          return mod?.nombre || ronda.modalidades[0];
                        })()}
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
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="px-6 py-3 bg-[#000] text-[#fff] font-bold rounded-lg  transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!todasRondasTienenModalidades}
              className={`
                px-6 py-3 font-bold rounded-lg flex items-center gap-2 transition-colors
                ${!todasRondasTienenModalidades
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#6A2818] text-white hover:bg-[#ae4429]'
                }
              `}
            >
              <Play className="w-5 h-5"  />
              INICIAR PARTIDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
