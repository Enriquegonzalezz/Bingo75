'use client';

import { useState, useCallback, useEffect } from 'react';
import { CartonDTO } from '@/application/dtos/CartonDTO';
import { getCartonRepository } from '@/config/dependency-injection';
import { CartonMapper } from '@/application/mappers/CartonMapper';
import { toast } from 'sonner';

export function useCartones() {
  const [cartones, setCartones] = useState<CartonDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar cartones al montar
  useEffect(() => {
    cargarCartones();
  }, []);

  const cargarCartones = useCallback(async () => {
    setLoading(true);
    try {
      const repository = getCartonRepository();
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
  }, []);

  return {
    cartones,
    loading,
    recargar: cargarCartones,
  };
}
