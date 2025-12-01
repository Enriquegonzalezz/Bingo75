'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { useSorteoV2 } from '@/presentation/hooks/useSorteoV2';
import { useFullscreen } from '@/presentation/hooks/useFullscreen';
import { RotateCcw, Trophy, Upload, Maximize, Minimize, Settings } from 'lucide-react';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';
import { cn } from '@/shared/utils/cn';
import { TableroFullscreenV2 } from '@/presentation/components/sorteo/TableroFullscreenV2';
import { ConfiguracionModal, ConfiguracionJuego } from '@/presentation/components/sorteo/ConfiguracionModal';
import { TODAS_MODALIDADES } from '@/shared/constants/modalidades';

export default function TableroPage() {
  // Estado de la modal de configuración
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(true); // Mostrar al inicio
  const [configuracionJuego, setConfiguracionJuego] = useState<ConfiguracionJuego | null>(null);

  const {
    numerosSorteados,
    ganadores,
    cartones,
    cartonesEnJuego,
    loading,
    cargarCartones,
    sortearNumero,
    reiniciar,
    getLetraNumero,
    totalSorteados,
    cartonesConMenosAciertos,
    modalidadesActivas,
    // Rondas
    rondaActual,
    totalRondas,
    rondaFinalizada,
    finalizarRonda,
    siguienteRonda,
    pavosoActivo,
    menosAciertosActivo,
    buscarCarton,
  } = useSorteoV2({ configuracion: configuracionJuego });

  // Hook de pantalla completa
  const { isFullscreen, toggleFullscreen, enterFullscreen } = useFullscreen();

  // Cargar cartones al montar
  useEffect(() => {
    cargarCartones();
  }, [cargarCartones]);

  // Manejar confirmación de configuración
  const handleConfigurarJuego = (config: ConfiguracionJuego) => {
    setConfiguracionJuego(config);
    setMostrarConfiguracion(false);
    // Recargar cartones con la nueva configuración
    cargarCartones();
    // Entrar en pantalla completa automáticamente
    enterFullscreen();
  };

  // Mostrar modal de configuración
  const handleMostrarConfiguracion = () => {
    setMostrarConfiguracion(true);
  };

  // Activar pantalla completa automáticamente cuando inicia el juego
  useEffect(() => {
    if (totalSorteados === 1 && !isFullscreen) {
      // Cuando se sortea el primer número, entrar en pantalla completa
      enterFullscreen();
    }
  }, [totalSorteados, isFullscreen, enterFullscreen]);

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

  // Obtener el premio de la ronda actual
  const premioRondaActual = configuracionJuego?.rondas.find(r => r.numero === rondaActual)?.premio || 0;

  // Si está en pantalla completa, mostrar el tablero especial
  if (isFullscreen && configuracionJuego) {
    return (
      <TableroFullscreenV2
        numerosSorteados={numerosSorteados}
        totalSorteados={totalSorteados}
        ganadores={ganadores}
        cartonesConMenosAciertos={cartonesConMenosAciertos}
        modalidadesActivas={modalidadesActivas}
        onClickNumero={handleClickNumero}
        onSalir={toggleFullscreen}
        onReiniciar={reiniciar}
        onFinalizarRonda={finalizarRonda}
        onSiguienteRonda={siguienteRonda}
        totalCartones={cartonesEnJuego.length}
        pavosoActivo={pavosoActivo}
        menosAciertosActivo={menosAciertosActivo}
        rondaActual={rondaActual}
        totalRondas={totalRondas}
        rondaFinalizada={rondaFinalizada}
        numeroSoporte={configuracionJuego.numeroSoporte}
        premioRonda={premioRondaActual}
        buscarCarton={buscarCarton}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#124723] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header con información y botones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-black text-[#ffd402]">Tablero de Sorteo</h1>
            <p className="text-[#f8df7e] mt-2">
              {cartones.length} cartones cargados | {totalSorteados}/75 números sorteados
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="primary" 
              onClick={handleMostrarConfiguracion}
              disabled={sorteoIniciado}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Partida
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 mr-2" />
              ) : (
                <Maximize className="w-4 h-4 mr-2" />
              )}
              {isFullscreen ? 'Salir' : 'Pantalla Completa'}
            </Button>
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

        {/* Información de modalidades activas */}
        {configuracionJuego && (
          <div className="mb-6 bg-[#1d1d1b] rounded-xl p-4 border-2 border-[#ffd402]">
            <h3 className="text-[#ffd402] font-bold mb-2">
              Modalidades activas: {modalidadesActivas.length}
            </h3>
            <div className="flex flex-wrap gap-2">
              {modalidadesActivas.slice(0, 10).map((mod) => (
                <span
                  key={mod.id}
                  className="px-3 py-1 bg-[#68b258] text-white text-sm font-semibold rounded-full"
                >
                  {mod.nombre}
                </span>
              ))}
              {modalidadesActivas.length > 10 && (
                <span className="px-3 py-1 bg-[#baa115] text-[#1d1d1b] text-sm font-semibold rounded-full">
                  +{modalidadesActivas.length - 10} más
                </span>
              )}
            </div>
            <p className="text-[#f8df7e] text-xs mt-2">
              Cartones en juego: {cartonesEnJuego.length.toLocaleString()} 
              (del #{configuracionJuego.rangoCartones.desde} al #{configuracionJuego.rangoCartones.hasta})
            </p>
          </div>
        )}

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

            {/* Panel de Cartones con Menos Aciertos */}
            {cartonesConMenosAciertos.length > 0 && (
              <Card className="mt-6 bg-[#1d1d1b] border-2 border-[#baa115]">
                <h2 className="text-xl font-bold mb-4 text-[#ffd402]">❌ Cartones con Menos Aciertos</h2>
                <p className="text-sm text-[#f8df7e] mb-4">
                  Los 5 cartones que estuvieron más lejos de ganar:
                </p>
                <div className="space-y-3">
                  {cartonesConMenosAciertos.map((item, index) => (
                    <div
                      key={item.numero_carton}
                      className="p-4 bg-[#124723] rounded-xl border-2 border-[#baa115] shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-[#ffd402]">
                            #{item.numero_carton}
                          </p>
                          <p className="text-xs text-[#f8df7e]">{item.carton.serial}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-[#baa115]">
                            ({item.aciertos})
                          </p>
                          <p className="text-xs text-[#f8df7e]">aciertos</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[#f8df7e]">
                        Posición: #{index + 1} de los menos afortunados
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Panel de Ganadores */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl bg-[#1d1d1b]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#ffd402] rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-[#124723]" />
                </div>
                <h2 className="text-2xl font-black text-[#ffd402]">
                  Ganadores
                </h2>
              </div>

              <div className="mb-6 p-5 bg-[#124723] rounded-2xl border-2 border-[#ffd402] shadow-lg">
                <p className="text-sm font-semibold text-[#f8df7e] uppercase tracking-wide mb-1">Total Ganadores</p>
                <p className="text-5xl font-black text-[#ffd402]">
                  {ganadores.length}
                </p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {ganadores.length === 0 ? (
                  <div className="text-center py-12 text-[#f8df7e]">
                    <div className="w-16 h-16 bg-[#124723] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-sm font-semibold">Aún no hay ganadores</p>
                    <p className="text-xs mt-1">Los ganadores aparecerán aquí</p>
                  </div>
                ) : (
                  ganadores.map((ganador, index) => {
                    const esPavoso = ganador.tipo === 'pavoso';
                    const bgColor = esPavoso 
                      ? 'bg-[#baa115]' 
                      : 'bg-[#68b258]';
                    const borderColor = esPavoso 
                      ? 'border-[#ffd402]' 
                      : 'border-[#124723]';
                    const textColor = esPavoso 
                      ? 'text-[#1d1d1b]' 
                      : 'text-white';
                    const patronColor = esPavoso 
                      ? 'text-[#1d1d1b]' 
                      : 'text-white';

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
                            <p className="text-xs opacity-80">{ganador.carton.serial}</p>
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
                        <p className="text-xs opacity-70 mt-1">
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

      {/* Modal de Configuración */}
      <ConfiguracionModal
        isOpen={mostrarConfiguracion}
        onClose={() => setMostrarConfiguracion(false)}
        onConfirmar={handleConfigurarJuego}
        modalidades={TODAS_MODALIDADES}
        totalCartones={cartones.length}
      />

      {/* Indicador de configuración activa */}
      {configuracionJuego && (
        <div className="fixed bottom-4 left-4 bg-[#1d1d1b] border-2 border-[#ffd402] rounded-lg p-3 shadow-lg z-40">
          <p className="text-[#ffd402] text-sm font-bold">Partida Configurada</p>
          <p className="text-[#f8df7e] text-xs">
            Cartones: {configuracionJuego.rangoCartones.desde} - {configuracionJuego.rangoCartones.hasta}
          </p>
          <p className="text-[#f8df7e] text-xs">
            Modalidades: {configuracionJuego.modalidadesSeleccionadas.length}
          </p>
        </div>
      )}
    </div>
  );
}
