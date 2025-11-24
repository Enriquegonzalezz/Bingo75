'use client';

import { useState, useCallback, useMemo } from 'react';
import { getCartonRepository } from '@/config/dependency-injection';
import { LineaHorizontalValidator } from '@/domain/validators/LineaHorizontalValidator';
import { LineaVerticalValidator } from '@/domain/validators/LineaVerticalValidator';
import { DiagonalValidator } from '@/domain/validators/DiagonalValidator';
import { CuatroEsquinasValidator } from '@/domain/validators/CuatroEsquinasValidator';
import { CartonLlenoValidator } from '@/domain/validators/CartonLlenoValidator';
import { RomboValidator } from '@/domain/validators/RomboValidator';
import { Cuadro3x3Validator } from '@/domain/validators/Cuadro3x3Validator';
import { LetraXValidator } from '@/domain/validators/LetraXValidator';
import { PajaritaValidator } from '@/domain/validators/PajaritaValidator';
import { PavosoValidator } from '@/domain/validators/PavosoValidator';
import { Carton } from '@/domain/entities/Carton';
import { toast } from 'sonner';
import { DinamicasConfig } from '@/presentation/components/sorteo/DinamicasSelector';

interface Ganador {
  carton: Carton;
  patron: string;
  numero_carton: number;
  timestamp: Date;
  tipo?: 'normal' | 'pavoso'; // Tipo de premio
}

interface UseSorteoProps {
  dinamicasActivas: DinamicasConfig;
}

export function useSorteo({ dinamicasActivas }: UseSorteoProps) {
  const [numerosSorteados, setNumerosSorteados] = useState<Set<number>>(new Set());
  const [ganadores, setGanadores] = useState<Ganador[]>([]);
  const [cartones, setCartones] = useState<Carton[]>([]);
  const [loading, setLoading] = useState(false);

  // Validadores (filtrados por dinámicas activas)
  const validadores = useMemo(() => {
    const todosValidadores = [
      { key: 'lineaHorizontal', nombre: 'Línea Horizontal', validator: new LineaHorizontalValidator() },
      { key: 'lineaVertical', nombre: 'Línea Vertical', validator: new LineaVerticalValidator() },
      { key: 'diagonal', nombre: 'Diagonal', validator: new DiagonalValidator() },
      { key: 'cuatroEsquinas', nombre: 'Cuatro Esquinas', validator: new CuatroEsquinasValidator() },
      { key: 'rombo', nombre: 'Rombo', validator: new RomboValidator() },
      { key: 'cuadro3x3', nombre: '3x3', validator: new Cuadro3x3Validator() },
      { key: 'letraX', nombre: 'Letra X', validator: new LetraXValidator() },
      { key: 'pajarita', nombre: 'Pajarita', validator: new PajaritaValidator() },
      { key: 'cartonLleno', nombre: 'Cartón Lleno', validator: new CartonLlenoValidator() },
    ];

    // Filtrar solo las dinámicas activas
    return todosValidadores.filter((v) => dinamicasActivas[v.key as keyof DinamicasConfig]);
  }, [dinamicasActivas]);

  // Validador especial para Pavoso
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
      toast.success(`✅ ${todosCartones.length} cartones listos para jugar`);
    } catch (error) {
      toast.error('Error al cargar cartones desde JSON');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar UN cartón contra TODOS los patrones (optimizado)
  const validarCarton = useCallback(
    (carton: Carton, numerosSet: Set<number>): Ganador | null => {
      // Si el cartón ya ganó, no validar de nuevo
      const yaGano = ganadores.some((g) => g.numero_carton === carton.numero_carton);
      if (yaGano) return null;

      // Validar cada patrón
      for (const { nombre, validator } of validadores) {
        const resultado = validator.validate(carton, numerosSet);

        // Manejar tanto boolean como ResultadoValidacion
        const esGanador = typeof resultado === 'boolean' 
          ? resultado 
          : resultado.es_ganador;

        if (esGanador) {
          return {
            carton,
            patron: nombre,
            numero_carton: carton.numero_carton,
            timestamp: new Date(),
            tipo: 'normal',
          };
        }
      }

      return null;
    },
    [validadores, ganadores]
  );

  // Validar Pavoso (solo cuando hay exactamente 14 números y está activo)
  const validarPavoso = useCallback(
    (carton: Carton, numerosSet: Set<number>): Ganador | null => {
      // Si Pavoso no está activo, no validar
      if (!dinamicasActivas.pavoso) return null;

      // Si el cartón ya ganó, no validar
      const yaGano = ganadores.some((g) => g.numero_carton === carton.numero_carton);
      if (yaGano) return null;

      // Solo validar si hay exactamente 14 números
      if (numerosSet.size !== 14) return null;

      const esPavoso = pavosoValidator.validate(carton, numerosSet);

      if (esPavoso) {
        return {
          carton,
          patron: 'Pavoso',
          numero_carton: carton.numero_carton,
          timestamp: new Date(),
          tipo: 'pavoso',
        };
      }

      return null;
    },
    [pavosoValidator, ganadores, dinamicasActivas.pavoso]
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

      // Agregar número
      const nuevosNumeros = new Set(numerosSorteados);
      nuevosNumeros.add(numero);
      setNumerosSorteados(nuevosNumeros);

      // VALIDAR TODOS LOS CARTONES (OPTIMIZADO)
      const nuevosGanadores: Ganador[] = [];

      // Validar en lotes para mejor rendimiento
      const BATCH_SIZE = 100;
      for (let i = 0; i < cartones.length; i += BATCH_SIZE) {
        const batch = cartones.slice(i, i + BATCH_SIZE);

        for (const carton of batch) {
          // Validar patrones normales
          const ganador = validarCarton(carton, nuevosNumeros);
          if (ganador) {
            nuevosGanadores.push(ganador);
          }

          // Validar Pavoso (solo cuando hay exactamente 14 números)
          if (nuevosNumeros.size === 14) {
            const pavoso = validarPavoso(carton, nuevosNumeros);
            if (pavoso) {
              nuevosGanadores.push(pavoso);
            }
          }
        }
      }

      // Actualizar ganadores
      if (nuevosGanadores.length > 0) {
        setGanadores((prev) => [...prev, ...nuevosGanadores]);

        // Notificar cada ganador
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

      toast.info(`Número sorteado: ${numero}`);
    },
    [numerosSorteados, cartones, validarCarton, validarPavoso]
  );

  // Reiniciar sorteo
  const reiniciar = useCallback(() => {
    setNumerosSorteados(new Set());
    setGanadores([]);
    toast.info('Sorteo reiniciado');
  }, []);

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
    loading,
    cargarCartones,
    sortearNumero,
    reiniciar,
    getLetraNumero,
    totalSorteados: numerosSorteados.size,
  };
}
