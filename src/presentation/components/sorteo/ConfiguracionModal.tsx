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
  const [modalidadesSeleccionadas, setModalidadesSeleccionadas] = useState<Set<string>>(new Set());
  const [rangoDesde, setRangoDesde] = useState(1);
  const [rangoHasta, setRangoHasta] = useState(2000);
  const [avisoAutomatico, setAvisoAutomatico] = useState(true);
  const [numeroRondas, setNumeroRondas] = useState(1);
  const [rondas, setRondas] = useState<ConfiguracionRonda[]>([
    { numero: 1, pavosoActivo: true, menosAciertosActivo: true }
  ]);

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

  const toggleModalidad = (id: string) => {
    const nuevas = new Set(modalidadesSeleccionadas);
    if (nuevas.has(id)) {
      nuevas.delete(id);
    } else {
      nuevas.add(id);
    }
    setModalidadesSeleccionadas(nuevas);
  };

  const handleConfirmar = () => {
    onConfirmar({
      modalidadesSeleccionadas: Array.from(modalidadesSeleccionadas),
      rangoCartones: {
        desde: rangoDesde,
        hasta: rangoHasta,
      },
      avisoPremiAutomatico: avisoAutomatico,
      numeroRondas,
      rondas,
    });
  };

  // Manejar cambio de número de rondas
  const handleNumeroRondasChange = (value: number) => {
    const num = Math.max(1, Math.min(value, 20));
    setNumeroRondas(num);
    
    // Actualizar array de rondas
    const nuevasRondas: ConfiguracionRonda[] = [];
    for (let i = 1; i <= num; i++) {
      const rondaExistente = rondas.find(r => r.numero === i);
      nuevasRondas.push(rondaExistente || {
        numero: i,
        pavosoActivo: true,
        menosAciertosActivo: true,
      });
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

  const handleRangoDesdeChange = (value: string) => {
    const num = parseInt(value) || 1;
    setRangoDesde(Math.max(1, Math.min(num, totalCartones)));
  };

  const handleRangoHastaChange = (value: string) => {
    const num = parseInt(value) || totalCartones;
    setRangoHasta(Math.max(rangoDesde, Math.min(num, totalCartones)));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#e8e8e8] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
          {/* Tabs de categorías */}
          <div className="flex items-center gap-2 mb-6">
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

          {/* Grid de modalidades */}
          <div className="bg-white rounded-lg p-4 mb-6 min-h-[150px]">
            {modalidadesFiltradas.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No hay modalidades en esta categoría.</p>
                <p className="text-sm">Las modalidades se agregarán próximamente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {modalidadesFiltradas.map((mod) => (
                  <PatronModalidad
                    key={mod.id}
                    modalidad={mod}
                    seleccionado={modalidadesSeleccionadas.has(mod.id)}
                    onClick={() => toggleModalidad(mod.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Selección de rango de cartones */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-[#124723] mb-4">Seleccionar rango de cartones:</h3>
              
              <div className="space-y-4">
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
                  <span className="text-xs text-[#68b258]">(Para controlar el retardo si es un bingo ONLINE.)</span>
                </div>

                <div className="bg-[#f8df7e] rounded p-3 text-center">
                  <p className="text-sm font-semibold text-[#124723]">
                    Se jugarán con <span className="font-black">{(rangoHasta - rangoDesde + 1).toLocaleString()}</span> cartones
                  </p>
                  <p className="text-xs text-[#124723]/70">
                    (Del #{rangoDesde} al #{rangoHasta} de {totalCartones.toLocaleString()} disponibles)
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen de modalidades seleccionadas */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-[#124723] mb-4">Modalidades seleccionadas:</h3>
              
              {modalidadesSeleccionadas.size === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">Selecciona al menos una modalidad</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {Array.from(modalidadesSeleccionadas).map((id) => {
                    const mod = modalidades.find(m => m.id === id);
                    if (!mod) return null;
                    return (
                      <span
                        key={id}
                        className="px-3 py-1 bg-[#68b258] text-white text-sm font-semibold rounded-full"
                      >
                        {mod.nombre}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Configuración de Rondas */}
          <div className="bg-white rounded-lg p-4 mt-6">
            <h3 className="font-bold text-[#124723] mb-4">Configuración de Rondas:</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-semibold text-gray-700">Número de rondas:</label>
              <input
                type="number"
                value={numeroRondas}
                onChange={(e) => handleNumeroRondasChange(parseInt(e.target.value) || 1)}
                min={1}
                max={20}
                className="w-20 px-2 py-1 border-2 border-gray-300 rounded text-center font-bold"
              />
            </div>

            {/* Tabla de rondas */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#124723] text-white">
                    <th className="px-3 py-2 text-left rounded-tl-lg">Ronda</th>
                    <th className="px-3 py-2 text-center">😅 Pavoso</th>
                    <th className="px-3 py-2 text-center rounded-tr-lg">❌ Menos Aciertos</th>
                  </tr>
                </thead>
                <tbody>
                  {rondas.map((ronda, index) => (
                    <tr 
                      key={ronda.numero} 
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-3 py-2 font-bold text-[#124723]">
                        Ronda {ronda.numero}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => togglePavosoRonda(ronda.numero)}
                          className={`
                            w-8 h-8 rounded-full transition-all
                            ${ronda.pavosoActivo 
                              ? 'bg-[#68b258] text-white' 
                              : 'bg-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {ronda.pavosoActivo ? '✓' : '✗'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => toggleMenosAciertosRonda(ronda.numero)}
                          className={`
                            w-8 h-8 rounded-full transition-all
                            ${ronda.menosAciertosActivo 
                              ? 'bg-[#68b258] text-white' 
                              : 'bg-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {ronda.menosAciertosActivo ? '✓' : '✗'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              * Pavoso: Cartón sin coincidencias en 16 números. Menos Aciertos: Los 5 cartones más lejos de ganar.
            </p>
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
              disabled={modalidadesSeleccionadas.size === 0}
              className={`
                px-6 py-3 font-bold rounded-lg flex items-center gap-2 transition-colors
                ${modalidadesSeleccionadas.size === 0
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
