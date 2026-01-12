'use client';

import { useState, useCallback, useMemo } from 'react';
import { getCartonRepository } from '@/config/dependency-injection';
import { PatronValidator, LineaHorizontalGenericValidator, LineaVerticalGenericValidator } from '@/domain/validators/PatronValidator';
import { PavosoValidator } from '@/domain/validators/PavosoValidator';
import { Carton } from '@/domain/entities/Carton';
import { toast } from 'sonner';
import { Modalidad, getModalidadById } from '@/shared/constants/modalidades';
import { ConfiguracionJuego } from '@/presentation/components/sorteo/ConfiguracionModal';

export interface Ganador {
  carton: Carton;
  patron: string;
  patronId: string;
  patronMatriz: boolean[][]; // Matriz del patrón para mostrar visualmente
  numero_carton: number;
  timestamp: Date;
  tipo: 'normal' | 'pavoso';
  numerosSorteadosAlGanar?: number[]; // Números sorteados al momento de ganar (para congelar estado de pavosos)
}

export interface CartonConAciertos {
  carton: Carton;
  numero_carton: number;
  aciertos: number;
}

interface UseSorteoV2Props {
  configuracion: ConfiguracionJuego | null;
}

// Historial de una ronda
export interface HistorialRonda {
  numero: number;
  ganadores: Ganador[];
  numerosSorteados: number[];
  cartonesConMenosAciertos: CartonConAciertos[];
}

export function useSorteoV2({ configuracion }: UseSorteoV2Props) {
  const [numerosSorteados, setNumerosSorteados] = useState<Set<number>>(new Set());
  const [historialClicks, setHistorialClicks] = useState<number[]>([]);
  const [ultimoNumeroClickeado, setUltimoNumeroClickeado] = useState<number | null>(null);
  const [ganadores, setGanadores] = useState<Ganador[]>([]);
  const [cartones, setCartones] = useState<Carton[]>([]);
  const [cartonesEnJuego, setCartonesEnJuego] = useState<Carton[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartonesConMenosAciertos, setCartonesConMenosAciertos] = useState<CartonConAciertos[]>([]);
  
  // Estado de rondas
  const [rondaActual, setRondaActual] = useState(1);
  const [historialRondas, setHistorialRondas] = useState<HistorialRonda[]>([]);
  const [rondaFinalizada, setRondaFinalizada] = useState(false);

  // Obtener configuración de la ronda actual
  const configRondaActual = useMemo(() => {
    if (!configuracion) return { pavosoActivo: true, menosAciertosActivo: true, modalidades: [] as string[] };
    const ronda = configuracion.rondas.find(r => r.numero === rondaActual);
    return ronda || { pavosoActivo: true, menosAciertosActivo: true, modalidades: [] as string[] };
  }, [configuracion, rondaActual]);

  const pavosoActivo = configRondaActual.pavosoActivo;
  const menosAciertosActivo = configRondaActual.menosAciertosActivo;
  const totalRondas = configuracion?.numeroRondas || 1;

  // Obtener modalidades activas desde la configuración de la RONDA ACTUAL
  const modalidadesActivas = useMemo((): Modalidad[] => {
    if (!configuracion) return [];
    
    // Usar las modalidades de la ronda actual
    const modalidadesRonda: string[] = configRondaActual.modalidades || [];
    
    const modalidades = modalidadesRonda
      .filter(id => id !== 'personalizado') // Excluir personalizado de la búsqueda normal
      .map(id => getModalidadById(id))
      .filter((m): m is Modalidad => m !== undefined);
    
    // Si hay patrón personalizado en esta ronda, agregarlo como modalidad
    // El patrón personalizado ahora está en la configuración de cada ronda
    const rondaConfig = configuracion.rondas.find(r => r.numero === rondaActual);
    if (modalidadesRonda.includes('personalizado') && rondaConfig?.patronPersonalizado) {
      modalidades.push({
        id: 'personalizado',
        nombre: rondaConfig.nombrePatronPersonalizado || 'Personalizado',
        categoria: 'PERSONALIZADO',
        patron: rondaConfig.patronPersonalizado,
      });
    }
    
    return modalidades;
  }, [configuracion, configRondaActual, rondaActual]);

  // Crear validadores basados en las modalidades seleccionadas
  const validadores = useMemo(() => {
    return modalidadesActivas.map(modalidad => {
      // Casos especiales para horizontal y vertical (cualquier fila/columna)
      if (modalidad.id === 'horizontal') {
        return {
          id: modalidad.id,
          nombre: modalidad.nombre,
          patron: modalidad.patron,
          validator: new LineaHorizontalGenericValidator(),
        };
      }
      
      if (modalidad.id === 'vertical') {
        return {
          id: modalidad.id,
          nombre: modalidad.nombre,
          patron: modalidad.patron,
          validator: new LineaVerticalGenericValidator(),
        };
      }
      
      // Validador genérico basado en patrón (incluye personalizado)
      return {
        id: modalidad.id,
        nombre: modalidad.nombre,
        patron: modalidad.patron,
        validator: new PatronValidator(modalidad.patron, modalidad.nombre),
      };
    });
  }, [modalidadesActivas]);

  // Validador de Pavoso
  const pavosoValidator = useMemo(() => new PavosoValidator(), []);

  // Cargar cartones desde JSON
  const cargarCartones = useCallback(async () => {
    setLoading(true);
    try {
      const repository = getCartonRepository();
      const todosCartones = await repository.getAll();

      if (todosCartones.length === 0) {
        toast.error('Error: No se pudieron cargar los cartones desde el JSON');
        return;
      }

      setCartones(todosCartones);
      
      // Filtrar cartones según configuración
      if (configuracion) {
        // Verificar si la ronda actual tiene cartones individuales definidos
        const rondaConfig = configuracion.rondas.find(r => r.numero === rondaActual);
        
        if (rondaConfig?.cartonesIndividuales && rondaConfig.cartonesIndividuales.length > 0) {
          // Usar cartones individuales de la ronda
          const filtrados = todosCartones.filter(
            c => rondaConfig.cartonesIndividuales!.includes(c.numero_carton)
          );
          setCartonesEnJuego(filtrados);
          console.log(`🎯 Ronda ${rondaActual}: Usando ${filtrados.length} cartones específicos`);
        } else {
          // Usar rango general
          const { desde, hasta } = configuracion.rangoCartones;
          const filtrados = todosCartones.filter(
            c => c.numero_carton >= desde && c.numero_carton <= hasta
          );
          setCartonesEnJuego(filtrados);
          console.log(`📊 Ronda ${rondaActual}: Usando rango ${desde}-${hasta} (${filtrados.length} cartones)`);
        }
       
      } else {
        setCartonesEnJuego(todosCartones);
      
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [configuracion, rondaActual]);

  // Calcular aciertos de un cartón
  const calcularAciertos = (carton: Carton, numerosSet: Set<number>): number => {
    let aciertos = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const numero = carton.matriz[i][j];
        // El centro (FREE) siempre cuenta como acierto
        if ((i === 2 && j === 2) || (numero !== 0 && numerosSet.has(numero))) {
          aciertos++;
        }
      }
    }
    return aciertos;
  };

  // Calcular cartones con menos aciertos (para mostrar al final)
  const calcularCartonesConMenosAciertos = useCallback(() => {
    if (cartonesEnJuego.length === 0) return;
    
    const numerosSet = numerosSorteados;
    const cartonesConAciertosCalc: CartonConAciertos[] = cartonesEnJuego
      .filter(c => !ganadores.some(g => g.numero_carton === c.numero_carton))
      .map(carton => ({
        carton,
        numero_carton: carton.numero_carton,
        aciertos: calcularAciertos(carton, numerosSet)
      }))
      .sort((a, b) => a.aciertos - b.aciertos)
      .slice(0, 5);
    
    setCartonesConMenosAciertos(cartonesConAciertosCalc);
  }, [cartonesEnJuego, numerosSorteados, ganadores]);

  // Validar UN cartón contra TODOS los patrones activos
  // Retorna TODOS los patrones ganados que aún no ha ganado este cartón
  const validarCarton = useCallback(
    (carton: Carton, numerosSet: Set<number>, ganadoresActuales: Ganador[]): Ganador[] => {
      const nuevosGanadores: Ganador[] = [];

      // Validar cada patrón activo
      for (const { id, nombre, patron, validator } of validadores) {
        // Verificar si este cartón ya ganó con este patrón específico
        const yaGanoEstePatron = ganadoresActuales.some(
          (g) => g.numero_carton === carton.numero_carton && g.patronId === id
        );
        
        if (yaGanoEstePatron) continue;

        const esGanador = validator.validate(carton, numerosSet);

        if (esGanador) {
          nuevosGanadores.push({
            carton,
            patron: nombre,
            patronId: id,
            patronMatriz: patron, // Guardar la matriz del patrón
            numero_carton: carton.numero_carton,
            timestamp: new Date(),
            tipo: 'normal',
          });
        }
      }

      return nuevosGanadores;
    },
    [validadores]
  );

  // Validar Pavoso
  const validarPavoso = useCallback(
    (carton: Carton, numerosSet: Set<number>, ganadoresActuales: Ganador[]): Ganador | null => {
      if (!pavosoActivo) return null;

      // Verificar si este cartón ya ganó como pavoso
      const yaEsPavoso = ganadoresActuales.some(
        (g) => g.numero_carton === carton.numero_carton && g.tipo === 'pavoso'
      );
      if (yaEsPavoso) return null;

      if (numerosSet.size !== 16) return null;

      const esPavoso = pavosoValidator.validate(carton, numerosSet);

      if (esPavoso) {
        // Usar el patrón de la modalidad activa para mostrar la figura que se estaba jugando
        // Si no hay modalidad activa, usar un patrón vacío
        const patronFigura = modalidadesActivas.length > 0 
          ? modalidadesActivas[0].patron 
          : [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ];
        // Guardar el nombre de la figura que se estaba jugando (para mostrar en el modal)
        const nombreFigura = modalidadesActivas.length > 0 
          ? modalidadesActivas[0].nombre 
          : 'Sin figura';
        return {
          carton,
          patron: nombreFigura,
          patronId: 'pavoso',
          patronMatriz: patronFigura,
          numero_carton: carton.numero_carton,
          timestamp: new Date(),
          tipo: 'pavoso',
          numerosSorteadosAlGanar: Array.from(numerosSet),
        };
      }

      return null;
    },
    [pavosoActivo, pavosoValidator, modalidadesActivas]
  );

  // Quitar un número sorteado (para corregir errores)
  const quitarNumero = useCallback(
    (numero: number) => {
      if (!numerosSorteados.has(numero)) {
        return;
      }

      const nuevosNumeros = new Set(numerosSorteados);
      nuevosNumeros.delete(numero);
      setNumerosSorteados(nuevosNumeros);

      // Actualizar historial de clicks removiendo este número
      const nuevoHistorial = historialClicks.filter(n => n !== numero);
      setHistorialClicks(nuevoHistorial);

      // Actualizar último número clickeado al último del historial
      setUltimoNumeroClickeado(nuevoHistorial.length > 0 ? nuevoHistorial[nuevoHistorial.length - 1] : null);

      // Recalcular ganadores: quitar los que ya no cumplen el patrón
      // IMPORTANTE: Los pavosos NUNCA se quitan una vez detectados (están congelados)
      setGanadores((prevGanadores) => {
        const ganadoresValidos = prevGanadores.filter((ganador) => {
          // Los pavosos están congelados - nunca se quitan una vez detectados
          if (ganador.tipo === 'pavoso') {
            return true;
          }
          
          // Para cada ganador normal, verificar si aún cumple su patrón
          const validador = validadores.find((v) => v.id === ganador.patronId);
          if (!validador) {
            return false;
          }
          return validador.validator.validate(ganador.carton, nuevosNumeros);
        });
        return ganadoresValidos;
      });

    },
    [numerosSorteados, historialClicks, validadores]
  );

  // Sortear número (CLICK MANUAL) - Funciona como toggle
  const sortearNumero = useCallback(
    (numero: number) => {
      if (numero < 1 || numero > 75) {
        console.error('Número debe estar entre 1 y 75');
        return;
      }

      // Si el número ya está sorteado, quitarlo (toggle)
      if (numerosSorteados.has(numero)) {
        quitarNumero(numero);
        return;
      }

      const nuevosNumeros = new Set(numerosSorteados);
      nuevosNumeros.add(numero);
      setNumerosSorteados(nuevosNumeros);
      
      // Agregar al historial de clicks
      setHistorialClicks(prev => [...prev, numero]);
      setUltimoNumeroClickeado(numero);

      const nuevosGanadores: Ganador[] = [];
      const BATCH_SIZE = 100;

      // Obtener ganadores actuales para la validación
      const ganadoresActuales = [...ganadores];

      for (let i = 0; i < cartonesEnJuego.length; i += BATCH_SIZE) {
        const batch = cartonesEnJuego.slice(i, i + BATCH_SIZE);

        for (const carton of batch) {
          // Validar patrones normales - puede retornar múltiples ganadores
          const ganadoresCarton = validarCarton(carton, nuevosNumeros, [...ganadoresActuales, ...nuevosGanadores]);
          nuevosGanadores.push(...ganadoresCarton);

          // Validar Pavoso (solo cuando hay exactamente 16 números)
          if (nuevosNumeros.size === 16) {
            const pavoso = validarPavoso(carton, nuevosNumeros, [...ganadoresActuales, ...nuevosGanadores]);
            if (pavoso) {
              nuevosGanadores.push(pavoso);
            }
          }
        }
      }

      if (nuevosGanadores.length > 0) {
        setGanadores((prev) => [...prev, ...nuevosGanadores]);

        // Mostrar notificaciones para cada ganador
        nuevosGanadores.forEach((g) => {
          const emoji = g.tipo === 'pavoso' ? '😅' : '🎉';
          const mensaje = g.tipo === 'pavoso' 
            ? `${emoji} ¡PAVOSO! Cartón #${g.numero_carton} - Sin coincidencias`
            : `${emoji} ¡GANADOR! Cartón #${g.numero_carton} - ${g.patron}`;
          
          console.log(mensaje);
        });

        // Calcular automáticamente los menos aciertos SOLO cuando hay ganadores de BINGO (NO pavosos)
        const hayGanadoresBingo = nuevosGanadores.some(g => g.tipo === 'normal');
        if (menosAciertosActivo && hayGanadoresBingo) {
          const todosGanadores = [...ganadoresActuales, ...nuevosGanadores];
          const cartonesConAciertosCalc: CartonConAciertos[] = cartonesEnJuego
            .filter(c => !todosGanadores.some(g => g.numero_carton === c.numero_carton))
            .map(carton => ({
              carton,
              numero_carton: carton.numero_carton,
              aciertos: calcularAciertos(carton, nuevosNumeros)
            }))
            .sort((a, b) => a.aciertos - b.aciertos)
            .slice(0, 5);
          
          setCartonesConMenosAciertos(cartonesConAciertosCalc);
          console.log(`📊 Menos aciertos calculados: ${cartonesConAciertosCalc.length} cartones`);
        }
      }

    },
    [numerosSorteados, cartonesEnJuego, validarCarton, validarPavoso, ganadores, quitarNumero, menosAciertosActivo]
  );

  // Reiniciar sorteo completo
  const reiniciar = useCallback(() => {
    setNumerosSorteados(new Set());
    setHistorialClicks([]);
    setUltimoNumeroClickeado(null);
    setGanadores([]);
    setCartonesConMenosAciertos([]);
    setRondaActual(1);
    setHistorialRondas([]);
    setRondaFinalizada(false);
    console.log('Sorteo reiniciado');
  }, []);

  // Finalizar ronda actual (guardar en historial y calcular menos aciertos si aplica)
  const finalizarRonda = useCallback(() => {
    // Guardar ronda en historial
    const rondaHistorial: HistorialRonda = {
      numero: rondaActual,
      ganadores: [...ganadores],
      numerosSorteados: Array.from(numerosSorteados),
      cartonesConMenosAciertos: [...cartonesConMenosAciertos],
    };
    
    setHistorialRondas(prev => [...prev, rondaHistorial]);
    setRondaFinalizada(true);
    
    // Calcular menos aciertos si está activo para esta ronda
    if (menosAciertosActivo) {
      const numerosSet = numerosSorteados;
      const cartonesConAciertosCalc: CartonConAciertos[] = cartonesEnJuego
        .filter(c => !ganadores.some(g => g.numero_carton === c.numero_carton))
        .map(carton => ({
          carton,
          numero_carton: carton.numero_carton,
          aciertos: calcularAciertos(carton, numerosSet)
        }))
        .sort((a, b) => a.aciertos - b.aciertos)
        .slice(0, 5);
      
      setCartonesConMenosAciertos(cartonesConAciertosCalc);
    }

    console.log(`🏁 Ronda ${rondaActual} finalizada`);
  }, [rondaActual, ganadores, numerosSorteados, cartonesConMenosAciertos, menosAciertosActivo, cartonesEnJuego]);

  // Pasar a la siguiente ronda
  const siguienteRonda = useCallback(async () => {
    if (rondaActual >= totalRondas) {
      console.log('🎮 ¡Juego terminado! Todas las rondas completadas.');
      return;
    }
    
    // Limpiar estado para nueva ronda
    setNumerosSorteados(new Set());
    setHistorialClicks([]);
    setUltimoNumeroClickeado(null);
    setGanadores([]);
    setCartonesConMenosAciertos([]);
    setRondaFinalizada(false);
    setRondaActual(prev => prev + 1);
    
    // Recargar cartones para la nueva ronda (se ejecutará después del cambio de rondaActual)
    // El useEffect de cargarCartones se encargará de esto
  }, [rondaActual, totalRondas]);

  // Obtener letra del número
  const getLetraNumero = useCallback((numero: number): string => {
    if (numero >= 1 && numero <= 15) return 'B';
    if (numero >= 16 && numero <= 30) return 'I';
    if (numero >= 31 && numero <= 45) return 'N';
    if (numero >= 46 && numero <= 60) return 'G';
    if (numero >= 61 && numero <= 75) return 'O';
    return '';
  }, []);

  // Buscar un cartón por número y calcular sus aciertos
  const buscarCarton = useCallback((numeroCarton: number): { carton: Carton; aciertos: number; totalNumeros: number } | null => {
    const carton = cartonesEnJuego.find(c => c.numero_carton === numeroCarton);
    if (!carton) return null;
    
    // Calcular aciertos (números del cartón que han sido sorteados)
    let aciertos = 0;
    let totalNumeros = 0;
    carton.matriz.forEach((fila, i) => {
      fila.forEach((numero, j) => {
        // El centro (FREE) no cuenta
        if (i === 2 && j === 2) return;
        totalNumeros++;
        if (numerosSorteados.has(numero)) {
          aciertos++;
        }
      });
    });
    
    return { carton, aciertos, totalNumeros };
  }, [cartonesEnJuego, numerosSorteados]);

  return {
    numerosSorteados: Array.from(numerosSorteados).sort((a, b) => a - b),
    historialClicks,
    ultimoNumero: ultimoNumeroClickeado,
    ganadores,
    cartones,
    cartonesEnJuego,
    loading,
    cargarCartones,
    sortearNumero,
    reiniciar,
    getLetraNumero,
    totalSorteados: numerosSorteados.size,
    cartonesConMenosAciertos,
    calcularCartonesConMenosAciertos,
    modalidadesActivas,
    // Rondas
    rondaActual,
    totalRondas,
    rondaFinalizada,
    historialRondas,
    finalizarRonda,
    siguienteRonda,
    pavosoActivo,
    menosAciertosActivo,
    buscarCarton,
  };
}
  