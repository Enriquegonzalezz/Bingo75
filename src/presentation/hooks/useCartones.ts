'use client';

import { useState, useCallback, useEffect } from 'react';
import { CartonDTO } from '@/application/dtos/CartonDTO';
import { getCartonRepository } from '@/config/dependency-injection';
import { CartonMapper } from '@/application/mappers/CartonMapper';
import { toast } from 'sonner';

export function useCartones() {
  const [cartones, setCartones] = useState<CartonDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [paqueteActual, setPaqueteActual] = useState('paquete-original');

  // Cargar cartones al montar o cuando cambia el paquete
  useEffect(() => {
    cargarCartones();
  }, [paqueteActual]);

  const cargarCartones = useCallback(async () => {
    setLoading(true);
    try {
      const repository = getCartonRepository();
      repository.setPaquete(paqueteActual);
      const cartonesEntities = await repository.getAll();
      const cartonesDTO = CartonMapper.toDTOList(cartonesEntities);
      setCartones(cartonesDTO);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error cargando cartones';
      console.error('Error cargando cartones:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [paqueteActual]);

  const cambiarPaquete = useCallback((nuevoPaquete: string) => {
    setPaqueteActual(nuevoPaquete);
  }, []);

  return {
    cartones,
    loading,
    paqueteActual,
    cambiarPaquete,
    recargar: cargarCartones,
  };
}
