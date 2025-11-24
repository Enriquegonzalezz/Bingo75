import { describe, it, expect, beforeEach } from 'vitest';
import { CartonFactory } from '@/domain/factories/CartonFactory';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';

describe('CartonFactory', () => {
  let factory: CartonFactory;

  beforeEach(() => {
    factory = new CartonFactory();
  });

  describe('create', () => {
    it('debe crear un cartón válido', () => {
      const carton = factory.create({
        serial: 'TEST',
        numero_carton: 1,
      });

      expect(carton.id).toBeDefined();
      expect(carton.serial).toBe('TEST');
      expect(carton.numero_carton).toBe(1);
      expect(carton.activo).toBe(true);
    });

    it('debe tener FREE en el centro', () => {
      const carton = factory.create({
        serial: 'TEST',
        numero_carton: 1,
      });

      expect(carton.matriz[2][2]).toBe(0);
      expect(carton.numeros.N[2]).toBe(0);
    });

    it('debe generar números en los rangos correctos', () => {
      const carton = factory.create({
        serial: 'TEST',
        numero_carton: 1,
      });

      // Validar columna B (1-15)
      carton.numeros.B.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(BINGO_CONSTANTS.RANGES.B.min);
        expect(num).toBeLessThanOrEqual(BINGO_CONSTANTS.RANGES.B.max);
      });

      // Validar columna I (16-30)
      carton.numeros.I.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(BINGO_CONSTANTS.RANGES.I.min);
        expect(num).toBeLessThanOrEqual(BINGO_CONSTANTS.RANGES.I.max);
      });

      // Validar columna G (46-60)
      carton.numeros.G.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(BINGO_CONSTANTS.RANGES.G.min);
        expect(num).toBeLessThanOrEqual(BINGO_CONSTANTS.RANGES.G.max);
      });

      // Validar columna O (61-75)
      carton.numeros.O.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(BINGO_CONSTANTS.RANGES.O.min);
        expect(num).toBeLessThanOrEqual(BINGO_CONSTANTS.RANGES.O.max);
      });
    });

    it('no debe tener números duplicados', () => {
      const carton = factory.create({
        serial: 'TEST',
        numero_carton: 1,
      });

      const todosNumeros = [
        ...carton.numeros.B,
        ...carton.numeros.I,
        ...carton.numeros.N.filter((n) => n !== 0),
        ...carton.numeros.G,
        ...carton.numeros.O,
      ];

      const unicos = new Set(todosNumeros);
      expect(unicos.size).toBe(todosNumeros.length);
    });
  });

  describe('createBatch', () => {
    it('debe generar múltiples cartones únicos', () => {
      const cantidad = 10;
      const cartones = factory.createBatch(
        {
          serial: 'TEST',
          numero_carton: 1,
          numero_inicio: 1,
        },
        cantidad
      );

      expect(cartones).toHaveLength(cantidad);

      // Verificar que todos sean únicos
      const cadenas = cartones.map((c) => c.getNumerosComoCadena());
      const unicasCadenas = new Set(cadenas);
      expect(unicasCadenas.size).toBe(cantidad);
    });

    it('debe asignar números de cartón secuenciales', () => {
      const cartones = factory.createBatch(
        {
          serial: 'TEST',
          numero_carton: 1,
          numero_inicio: 1,
        },
        5
      );

      cartones.forEach((carton, index) => {
        expect(carton.numero_carton).toBe(index + 1);
      });
    });

    it('debe lanzar error si cantidad está fuera de rango', () => {
      expect(() => {
        factory.createBatch(
          {
            serial: 'TEST',
            numero_carton: 1,
          },
          10001 // Más del límite
        );
      }).toThrow();

      expect(() => {
        factory.createBatch(
          {
            serial: 'TEST',
            numero_carton: 1,
          },
          0 // Menos del mínimo
        );
      }).toThrow();
    });
  });
});
