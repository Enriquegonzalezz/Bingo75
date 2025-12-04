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
      
      // Filtrar por rango si hay configuración
      if (configuracion) {
        const { desde, hasta } = configuracion.rangoCartones;
        const filtrados = todosCartones.filter(
          c => c.numero_carton >= desde && c.numero_carton <= hasta
        );
        setCartonesEnJuego(filtrados);
       
      } else {
        setCartonesEnJuego(todosCartones);
      
      }
    } catch (error) {
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
        // Patrón vacío para pavoso
        const patronVacio = [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ];
        return {
          carton,
          patron: 'Pavoso',
          patronId: 'pavoso',
          patronMatriz: patronVacio,
          numero_carton: carton.numero_carton,
          timestamp: new Date(),
          tipo: 'pavoso',
        };
      }

      return null;
    },
    [pavosoValidator, pavosoActivo]
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

      // Recalcular ganadores: quitar los que ya no cumplen el patrón
      setGanadores((prevGanadores) => {
        const ganadoresValidos = prevGanadores.filter((ganador) => {
          // Para cada ganador, verificar si aún cumple su patrón
          const validador = validadores.find((v) => v.id === ganador.patronId);
          if (!validador) {
            // Si es pavoso, verificar con el validador de pavoso
            if (ganador.tipo === 'pavoso') {
              return pavosoValidator.validate(ganador.carton, nuevosNumeros);
            }
            return false;
          }
          return validador.validator.validate(ganador.carton, nuevosNumeros);
        });
        return ganadoresValidos;
      });

    },
    [numerosSorteados, validadores, pavosoValidator]
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
      }

     
    },
    [numerosSorteados, cartonesEnJuego, validarCarton, validarPavoso, ganadores, quitarNumero]
  );

  // Reiniciar sorteo completo
  const reiniciar = useCallback(() => {
    setNumerosSorteados(new Set());
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
  const siguienteRonda = useCallback(() => {
    if (rondaActual >= totalRondas) {
      console.log('🎮 ¡Juego terminado! Todas las rondas completadas.');
      return;
    }
    
    // Limpiar estado para nueva ronda
    setNumerosSorteados(new Set());
    setUltimoNumeroClickeado(null);
    setGanadores([]);
    setCartonesConMenosAciertos([]);
    setRondaFinalizada(false);
    setRondaActual(prev => prev + 1);
    
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
  