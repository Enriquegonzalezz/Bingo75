'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CartonDTO } from '@/application/dtos/CartonDTO';
import { getCartonRepository } from '@/config/dependency-injection';
import { CartonMapper } from '@/application/mappers/CartonMapper';
import { toast } from 'sonner';

interface UseCartonesOptions {
  cargarAlMontar?: boolean;
  paqueteInicial?: string;
}

export function useCartones(options: UseCartonesOptions = {}) {
  const { cargarAlMontar = true, paqueteInicial = 'paquete-original' } = options;

  const [cartones, setCartones] = useState<CartonDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paqueteActual, setPaqueteActual] = useState(paqueteInicial);
  const [totalCartones, setTotalCartones] = useState(0);

  // Ref para evitar cargas duplicadas
  const cargandoRef = useRef(false);
  const paqueteCargadoRef = useRef<string | null>(null);

  const cargarCartones = useCallback(
    async (forzar: boolean = false) => {
      // Evitar cargas duplicadas
      if (cargandoRef.current) {
        console.log('⏳ Ya hay una carga en progreso...');
        return;
      }

      // Si ya tenemos el paquete cargado y no es forzado, no recargar
      if (!forzar && paqueteCargadoRef.current === paqueteActual && cartones.length > 0) {
        console.log(`📦 Paquete "${paqueteActual}" ya cargado con ${cartones.length} cartones`);
        return;
      }

      cargandoRef.current = true;
      setLoading(true);
      setError(null);

      try {
        console.log(`🔄 Cargando paquete: ${paqueteActual}`);
        const repository = getCartonRepository();
        repository.setPaquete(paqueteActual);

        const cartonesEntities = await repository.getAll();

        if (cartonesEntities.length === 0) {
          throw new Error(`No se encontraron cartones en el paquete "${paqueteActual}"`);
        }

        const cartonesDTO = CartonMapper.toDTOList(cartonesEntities);
        setCartones(cartonesDTO);
        setTotalCartones(cartonesDTO.length);
        paqueteCargadoRef.current = paqueteActual;

        console.log(`✅ ${cartonesDTO.length} cartones cargados del paquete "${paqueteActual}"`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error cargando cartones';
        console.error('❌ Error cargando cartones:', err);
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
        cargandoRef.current = false;
      }
    },
    [paqueteActual, cartones.length]
  );

  const cambiarPaquete = useCallback(
    (nuevoPaquete: string) => {
      if (nuevoPaquete !== paqueteActual) {
        console.log(`📦 Cambiando paquete: ${paqueteActual} → ${nuevoPaquete}`);
        setPaqueteActual(nuevoPaquete);
        paqueteCargadoRef.current = null; // Forzar recarga
        setCartones([]); // Limpiar cartones actuales
        setTotalCartones(0);
      }
    },
    [paqueteActual]
  );

  // Cargar al montar o cuando cambia el paquete
  useEffect(() => {
    if (cargarAlMontar || paqueteCargadoRef.current !== paqueteActual) {
      cargarCartones();
    }
  }, [paqueteActual, cargarAlMontar, cargarCartones]);

  // Buscar cartón por número
  const buscarPorNumero = useCallback(
    (numero: number): CartonDTO | undefined => {
      return cartones.find((c) => c.numero_carton === numero);
    },
    [cartones]
  );

  // Obtener rango de cartones
  const obtenerRango = useCallback(
    (desde: number, hasta: number): CartonDTO[] => {
      return cartones.filter((c) => c.numero_carton >= desde && c.numero_carton <= hasta);
    },
    [cartones]
  );

  // Obtener estadísticas del paquete
  const getEstadisticas = useCallback(() => {
    if (cartones.length === 0) {
      return { min: 0, max: 0, total: 0, paquete: paqueteActual };
    }

    const numeros = cartones.map((c) => c.numero_carton);
    return {
      min: Math.min(...numeros),
      max: Math.max(...numeros),
      total: cartones.length,
      paquete: paqueteActual,
    };
  }, [cartones, paqueteActual]);

  return {
    cartones,
    loading,
    error,
    paqueteActual,
    totalCartones,
    cambiarPaquete,
    recargar: () => cargarCartones(true),
    buscarPorNumero,
    obtenerRango,
    getEstadisticas,
  };
}
