'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getCartonRepository } from '@/config/dependency-injection';
import {
  PatronValidator,
  LineaHorizontalGenericValidator,
  LineaVerticalGenericValidator,
} from '@/domain/validators/PatronValidator';
import { PavosoValidator } from '@/domain/validators/PavosoValidator';
import { Carton } from '@/domain/entities/Carton';
import { toast } from 'sonner';
import { Modalidad, getModalidadById } from '@/shared/constants/modalidades';
import { ConfiguracionJuego } from '@/presentation/components/sorteo/ConfiguracionModal';

export interface Ganador {
  carton: Carton;
  patron: string;
  patronId: string;
  patronMatriz: boolean[][];
  numero_carton: number;
  timestamp: Date;
  tipo: 'normal' | 'pavoso';
  numerosSorteadosAlGanar?: number[];
}

export interface CartonConAciertos {
  carton: Carton;
  numero_carton: number;
  aciertos: number;
}

interface UseSorteoV2Props {
  configuracion: ConfiguracionJuego | null;
}

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
  const [paqueteCargado, setPaqueteCargado] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estado de rondas
  const [rondaActual, setRondaActual] = useState(1);
  const [historialRondas, setHistorialRondas] = useState<HistorialRonda[]>([]);
  const [rondaFinalizada, setRondaFinalizada] = useState(false);

  // Obtener configuración de la ronda actual
  const configRondaActual = useMemo(() => {
    if (!configuracion)
      return { pavosoActivo: true, menosAciertosActivo: true, modalidades: [] as string[] };
    const ronda = configuracion.rondas.find((r) => r.numero === rondaActual);
    return ronda || { pavosoActivo: true, menosAciertosActivo: true, modalidades: [] as string[] };
  }, [configuracion, rondaActual]);

  const pavosoActivo = configRondaActual.pavosoActivo;
  const menosAciertosActivo = configRondaActual.menosAciertosActivo;
  const totalRondas = configuracion?.numeroRondas || 1;

  // Obtener modalidades activas desde la configuración de la RONDA ACTUAL
  const modalidadesActivas = useMemo((): Modalidad[] => {
    if (!configuracion) return [];

    const modalidadesRonda: string[] = configRondaActual.modalidades || [];

    const modalidades = modalidadesRonda
      .filter((id) => id !== 'personalizado')
      .map((id) => getModalidadById(id))
      .filter((m): m is Modalidad => m !== undefined);

    const rondaConfig = configuracion.rondas.find((r) => r.numero === rondaActual);
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
    return modalidadesActivas.map((modalidad) => {
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

  // =========================================================================
  // CARGAR CARTONES - CON VALIDACIÓN COMPLETA
  // =========================================================================
  const cargarCartones = useCallback(async () => {
    if (!configuracion) {
      console.error('❌ No hay configuración disponible');
      return;
    }

    setLoading(true);
    setErrorCarga(null);

    const paqueteId = configuracion.paqueteId;
    console.log(`🔄 Cargando paquete: ${paqueteId}`);

    try {
      const repository = getCartonRepository();

      // Establecer el paquete seleccionado ANTES de cargar
      repository.setPaquete(paqueteId);

      const todosCartones = await repository.getAll();

      if (todosCartones.length === 0) {
        const errorMsg = `No se pudieron cargar cartones del paquete "${paqueteId}"`;
        setErrorCarga(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`✅ ${todosCartones.length} cartones cargados del paquete "${paqueteId}"`);
      setCartones(todosCartones);
      setPaqueteCargado(paqueteId);

      // Filtrar cartones según configuración de la ronda actual
      filtrarCartonesParaRonda(todosCartones, configuracion, rondaActual);
    } catch (error) {
      const errorMsg = `Error al cargar paquete "${paqueteId}": ${error}`;
      console.error('❌', errorMsg);
      setErrorCarga(errorMsg);
      toast.error('Error al cargar los cartones');
    } finally {
      setLoading(false);
    }
  }, [configuracion, rondaActual]);

  // =========================================================================
  // FILTRAR CARTONES PARA RONDA - CON VALIDACIONES
  // =========================================================================
  const filtrarCartonesParaRonda = useCallback(
    (todosCartones: Carton[], config: ConfiguracionJuego, numeroRonda: number) => {
      const rondaConfig = config.rondas.find((r) => r.numero === numeroRonda);

      // Verificar si la ronda tiene cartones individuales
      if (rondaConfig?.cartonesIndividuales && rondaConfig.cartonesIndividuales.length > 0) {
        const filtrados = todosCartones.filter((c) =>
          rondaConfig.cartonesIndividuales!.includes(c.numero_carton)
        );

        // Validar que se encontraron todos los cartones específicos
        const encontrados = filtrados.map((c) => c.numero_carton);
        const noEncontrados = rondaConfig.cartonesIndividuales.filter(
          (n) => !encontrados.includes(n)
        );

        if (noEncontrados.length > 0) {
          console.warn(`⚠️ Cartones específicos no encontrados: ${noEncontrados.join(', ')}`);
          toast.warning(
            `${noEncontrados.length} cartones específicos no se encontraron en el paquete`
          );
        }

        setCartonesEnJuego(filtrados);
        console.log(`🎯 Ronda ${numeroRonda}: ${filtrados.length} cartones específicos cargados`);
        return;
      }

      // Usar rango general con VALIDACIÓN
      const { desde, hasta } = config.rangoCartones;

      // Validar que el rango no exceda los cartones disponibles
      const maxCarton = Math.max(...todosCartones.map((c) => c.numero_carton));
      const minCarton = Math.min(...todosCartones.map((c) => c.numero_carton));

      const rangoDesdeValidado = Math.max(desde, minCarton);
      const rangoHastaValidado = Math.min(hasta, maxCarton);

      if (hasta > maxCarton) {
        console.warn(`⚠️ Rango ajustado: ${hasta} → ${rangoHastaValidado} (máximo del paquete)`);
        toast.warning(`Rango ajustado al máximo del paquete: ${maxCarton}`);
      }

      const filtrados = todosCartones.filter(
        (c) => c.numero_carton >= rangoDesdeValidado && c.numero_carton <= rangoHastaValidado
      );

      setCartonesEnJuego(filtrados);
      console.log(
        `📊 Ronda ${numeroRonda}: Rango ${rangoDesdeValidado}-${rangoHastaValidado} = ${filtrados.length} cartones`
      );
    },
    []
  );

  // =========================================================================
  // EFECTO: Recargar cuando cambia la ronda
  // =========================================================================
  useEffect(() => {
    if (cartones.length > 0 && configuracion) {
      filtrarCartonesParaRonda(cartones, configuracion, rondaActual);
    }
  }, [rondaActual, cartones, configuracion, filtrarCartonesParaRonda]);

  // Calcular aciertos de un cartón
  const calcularAciertos = (carton: Carton, numerosSet: Set<number>): number => {
    let aciertos = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 2 && j === 2) continue;
        const numero = carton.matriz[i][j];
        if (numero !== 0 && numerosSet.has(numero)) {
          aciertos++;
        }
      }
    }
    return aciertos;
  };

  // Filtrar cartones para mostrar solo los con el mínimo número de aciertos
  const filtrarMenosAciertos = (cartonesConAciertos: CartonConAciertos[]): CartonConAciertos[] => {
    if (cartonesConAciertos.length === 0) return [];
    const minAciertos = Math.min(...cartonesConAciertos.map((c) => c.aciertos));
    return cartonesConAciertos.filter((c) => c.aciertos === minAciertos).slice(0, 5);
  };

  // Calcular cartones con menos aciertos
  const calcularCartonesConMenosAciertos = useCallback(() => {
    if (cartonesEnJuego.length === 0) return;

    const numerosSet = numerosSorteados;
    const cartonesConAciertosCalc: CartonConAciertos[] = cartonesEnJuego
      .filter((c) => !ganadores.some((g) => g.numero_carton === c.numero_carton))
      .map((carton) => ({
        carton,
        numero_carton: carton.numero_carton,
        aciertos: calcularAciertos(carton, numerosSet),
      }))
      .filter((c) => c.aciertos > 0)
      .sort((a, b) => a.aciertos - b.aciertos);

    setCartonesConMenosAciertos(filtrarMenosAciertos(cartonesConAciertosCalc));
  }, [cartonesEnJuego, numerosSorteados, ganadores]);

  // Validar UN cartón contra TODOS los patrones activos
  const validarCarton = useCallback(
    (carton: Carton, numerosSet: Set<number>, ganadoresActuales: Ganador[]): Ganador[] => {
      const nuevosGanadores: Ganador[] = [];

      for (const { id, nombre, patron, validator } of validadores) {
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
            patronMatriz: patron,
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

      const yaEsPavoso = ganadoresActuales.some(
        (g) => g.numero_carton === carton.numero_carton && g.tipo === 'pavoso'
      );
      if (yaEsPavoso) return null;

      if (numerosSet.size !== 16) return null;

      const esPavoso = pavosoValidator.validate(carton, numerosSet);

      if (esPavoso) {
        const patronFigura =
          modalidadesActivas.length > 0
            ? modalidadesActivas[0].patron
            : [
                [false, false, false, false, false],
                [false, false, false, false, false],
                [false, false, false, false, false],
                [false, false, false, false, false],
                [false, false, false, false, false],
              ];
        const nombreFigura =
          modalidadesActivas.length > 0 ? modalidadesActivas[0].nombre : 'Sin figura';
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

  // Quitar un número sorteado
  const quitarNumero = useCallback(
    (numero: number) => {
      if (!numerosSorteados.has(numero)) {
        return;
      }

      const nuevosNumeros = new Set(numerosSorteados);
      nuevosNumeros.delete(numero);
      setNumerosSorteados(nuevosNumeros);

      const nuevoHistorial = historialClicks.filter((n) => n !== numero);
      setHistorialClicks(nuevoHistorial);
      setUltimoNumeroClickeado(
        nuevoHistorial.length > 0 ? nuevoHistorial[nuevoHistorial.length - 1] : null
      );

      setGanadores((prevGanadores) => {
        const ganadoresValidos = prevGanadores.filter((ganador) => {
          if (ganador.tipo === 'pavoso') {
            return true;
          }

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
      // Validación: Verificar que hay cartones cargados
      if (cartonesEnJuego.length === 0) {
        toast.error('No hay cartones cargados. Verifica la configuración.');
        return;
      }

      if (numero < 1 || numero > 75) {
        console.error('Número debe estar entre 1 y 75');
        return;
      }

      if (numerosSorteados.has(numero)) {
        quitarNumero(numero);
        return;
      }

      const nuevosNumeros = new Set(numerosSorteados);
      nuevosNumeros.add(numero);
      setNumerosSorteados(nuevosNumeros);

      setHistorialClicks((prev) => [...prev, numero]);
      setUltimoNumeroClickeado(numero);

      const nuevosGanadores: Ganador[] = [];
      const BATCH_SIZE = 100;
      const ganadoresActuales = [...ganadores];

      for (let i = 0; i < cartonesEnJuego.length; i += BATCH_SIZE) {
        const batch = cartonesEnJuego.slice(i, i + BATCH_SIZE);

        for (const carton of batch) {
          const ganadoresCarton = validarCarton(carton, nuevosNumeros, [
            ...ganadoresActuales,
            ...nuevosGanadores,
          ]);
          nuevosGanadores.push(...ganadoresCarton);

          if (nuevosNumeros.size === 16) {
            const pavoso = validarPavoso(carton, nuevosNumeros, [
              ...ganadoresActuales,
              ...nuevosGanadores,
            ]);
            if (pavoso) {
              nuevosGanadores.push(pavoso);
            }
          }
        }
      }

      if (nuevosGanadores.length > 0) {
        setGanadores((prev) => [...prev, ...nuevosGanadores]);

        nuevosGanadores.forEach((g) => {
          const emoji = g.tipo === 'pavoso' ? '😅' : '🎉';
          const mensaje =
            g.tipo === 'pavoso'
              ? `${emoji} ¡PAVOSO! Cartón #${g.numero_carton} - Sin coincidencias`
              : `${emoji} ¡GANADOR! Cartón #${g.numero_carton} - ${g.patron}`;

          console.log(mensaje);
        });

        const hayGanadoresBingo = nuevosGanadores.some((g) => g.tipo === 'normal');
        if (menosAciertosActivo && hayGanadoresBingo) {
          const todosGanadores = [...ganadoresActuales, ...nuevosGanadores];
          const cartonesConAciertosCalc: CartonConAciertos[] = cartonesEnJuego
            .filter((c) => !todosGanadores.some((g) => g.numero_carton === c.numero_carton))
            .map((carton) => ({
              carton,
              numero_carton: carton.numero_carton,
              aciertos: calcularAciertos(carton, nuevosNumeros),
            }))
            .filter((c) => c.aciertos > 0)
            .sort((a, b) => a.aciertos - b.aciertos);

          const menosAciertosFiltered = filtrarMenosAciertos(cartonesConAciertosCalc);
          setCartonesConMenosAciertos(menosAciertosFiltered);
        }
      }
    },
    [
      numerosSorteados,
      cartonesEnJuego,
      validarCarton,
      validarPavoso,
      ganadores,
      quitarNumero,
      menosAciertosActivo,
    ]
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
    setErrorCarga(null);
    console.log('🔄 Sorteo reiniciado');
  }, []);

  // Finalizar ronda actual
  const finalizarRonda = useCallback(() => {
    const rondaHistorial: HistorialRonda = {
      numero: rondaActual,
      ganadores: [...ganadores],
      numerosSorteados: Array.from(numerosSorteados),
      cartonesConMenosAciertos: [...cartonesConMenosAciertos],
    };

    setHistorialRondas((prev) => [...prev, rondaHistorial]);
    setRondaFinalizada(true);

    if (menosAciertosActivo) {
      const numerosSet = numerosSorteados;
      const cartonesConAciertosCalc: CartonConAciertos[] = cartonesEnJuego
        .filter((c) => !ganadores.some((g) => g.numero_carton === c.numero_carton))
        .map((carton) => ({
          carton,
          numero_carton: carton.numero_carton,
          aciertos: calcularAciertos(carton, numerosSet),
        }))
        .filter((c) => c.aciertos > 0)
        .sort((a, b) => a.aciertos - b.aciertos);

      setCartonesConMenosAciertos(filtrarMenosAciertos(cartonesConAciertosCalc));
    }

    console.log(`🏁 Ronda ${rondaActual} finalizada`);
  }, [
    rondaActual,
    ganadores,
    numerosSorteados,
    cartonesConMenosAciertos,
    menosAciertosActivo,
    cartonesEnJuego,
  ]);

  // Pasar a la siguiente ronda
  const siguienteRonda = useCallback(async () => {
    if (rondaActual >= totalRondas) {
      console.log('🎮 ¡Juego terminado! Todas las rondas completadas.');
      return;
    }

    setNumerosSorteados(new Set());
    setHistorialClicks([]);
    setUltimoNumeroClickeado(null);
    setGanadores([]);
    setCartonesConMenosAciertos([]);
    setRondaFinalizada(false);
    setRondaActual((prev) => prev + 1);
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

  // Buscar un cartón por número
  const buscarCarton = useCallback(
    (numeroCarton: number): { carton: Carton; aciertos: number; totalNumeros: number } | null => {
      const carton = cartonesEnJuego.find((c) => c.numero_carton === numeroCarton);
      if (!carton) return null;

      let aciertos = 0;
      let totalNumeros = 0;
      carton.matriz.forEach((fila, i) => {
        fila.forEach((numero, j) => {
          if (i === 2 && j === 2) return;
          totalNumeros++;
          if (numerosSorteados.has(numero)) {
            aciertos++;
          }
        });
      });

      return { carton, aciertos, totalNumeros };
    },
    [cartonesEnJuego, numerosSorteados]
  );

  // =========================================================================
  // VALIDAR CONFIGURACIÓN - Para uso antes de iniciar
  // =========================================================================
  const validarConfiguracion = useCallback((): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];

    if (!configuracion) {
      errores.push('No hay configuración disponible');
      return { valido: false, errores };
    }

    if (cartonesEnJuego.length === 0) {
      errores.push('No hay cartones cargados');
    }

    if (paqueteCargado !== configuracion.paqueteId) {
      errores.push(
        `Paquete no coincide: esperado "${configuracion.paqueteId}", cargado "${paqueteCargado}"`
      );
    }

    const { desde, hasta } = configuracion.rangoCartones;
    const cartonesEnRango = cartonesEnJuego.filter(
      (c) => c.numero_carton >= desde && c.numero_carton <= hasta
    );

    if (cartonesEnRango.length === 0) {
      errores.push(`No hay cartones en el rango ${desde}-${hasta}`);
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }, [configuracion, cartonesEnJuego, paqueteCargado]);

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
    // Nuevos campos para validación
    paqueteCargado,
    errorCarga,
    validarConfiguracion,
  };
}
