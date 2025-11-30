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
  numero_carton: number;
  timestamp: Date;
  tipo: 'normal' | 'pavoso';
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
    if (modalidadesRonda.includes('personalizado') && configuracion.patronPersonalizado) {
      modalidades.push({
        id: 'personalizado',
        nombre: 'Personalizado',
        categoria: 'PERSONALIZADO',
        patron: configuracion.patronPersonalizado,
      });
    }
    
    return modalidades;
  }, [configuracion, configRondaActual]);

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
      
      // Filtrar por rango si hay configuración
      if (configuracion) {
        const { desde, hasta } = configuracion.rangoCartones;
        const filtrados = todosCartones.filter(
          c => c.numero_carton >= desde && c.numero_carton <= hasta
        );
        setCartonesEnJuego(filtrados);
        toast.success(`✅ ${filtrados.length} cartones listos para jugar (del #${desde} al #${hasta})`);
      } else {
        setCartonesEnJuego(todosCartones);
        toast.success(`✅ ${todosCartones.length} cartones listos para jugar`);
      }
    } catch (error) {
      toast.error('Error al cargar cartones desde JSON');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [configuracion]);

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
      for (const { id, nombre, validator } of validadores) {
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
        return {
          carton,
          patron: 'Pavoso',
          patronId: 'pavoso',
          numero_carton: carton.numero_carton,
          timestamp: new Date(),
          tipo: 'pavoso',
        };
      }

      return null;
    },
    [pavosoValidator, pavosoActivo]
  );

  // Sortear número (CLICK MANUAL)
  const sortearNumero = useCallback(
    (numero: number) => {
      if (numero < 1 || numero > 75) {
        toast.error('Número debe estar entre 1 y 75');
        return;
      }

      if (numerosSorteados.has(numero)) {
        toast.warning(`El número ${numero} ya fue sorteado`);
        return;
      }

      const nuevosNumeros = new Set(numerosSorteados);
      nuevosNumeros.add(numero);
      setNumerosSorteados(nuevosNumeros);

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
          
          toast.success(mensaje, {
            duration: 5000,
          });
        });
      }

     
    },
    [numerosSorteados, cartonesEnJuego, validarCarton, validarPavoso, ganadores]
  );

  // Reiniciar sorteo completo
  const reiniciar = useCallback(() => {
    setNumerosSorteados(new Set());
    setGanadores([]);
    setCartonesConMenosAciertos([]);
    setRondaActual(1);
    setHistorialRondas([]);
    setRondaFinalizada(false);
    toast.info('Sorteo reiniciado');
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
    
    toast.success(`🏁 Ronda ${rondaActual} finalizada`);
  }, [rondaActual, ganadores, numerosSorteados, cartonesConMenosAciertos, menosAciertosActivo, cartonesEnJuego]);

  // Pasar a la siguiente ronda
  const siguienteRonda = useCallback(() => {
    if (rondaActual >= totalRondas) {
      toast.info('🎮 ¡Juego terminado! Todas las rondas completadas.');
      return;
    }
    
    // Limpiar estado para nueva ronda
    setNumerosSorteados(new Set());
    setGanadores([]);
    setCartonesConMenosAciertos([]);
    setRondaFinalizada(false);
    setRondaActual(prev => prev + 1);
    
    toast.info(`🎯 Iniciando Ronda ${rondaActual + 1} de ${totalRondas}`);
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

  return {
    numerosSorteados: Array.from(numerosSorteados).sort((a, b) => a - b),
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
  };
}
