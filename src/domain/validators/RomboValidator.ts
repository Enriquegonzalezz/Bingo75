import { Carton } from '../entities/Carton';

/**
 * Validador para patrón ROMBO
 * 
 * Patrón:
 *     [X]
 *  [X] [F] [X]
 *     [X]
 */
export class RomboValidator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    const matriz = carton.matriz;

    // Posiciones del rombo (índices de matriz 5x5)
    const posiciones = [
      [0, 2], // Arriba centro
      [1, 1], // Izquierda
      [1, 3], // Derecha
      [2, 0], // Izquierda extremo
      [2, 4], // Derecha extremo
      [3, 1], // Izquierda abajo
      [3, 3], // Derecha abajo
      [4, 2], // Abajo centro
    ];

    // Verificar que todos los números del rombo estén sorteados
    return posiciones.every(([fila, col]) => {
      const numero = matriz[fila][col];
      // El centro (FREE) siempre cuenta como marcado
      if (numero === 0) return true;
      return numerosSorteados.has(numero);
    });
  }
}
