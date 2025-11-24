import { Carton } from '../entities/Carton';

/**
 * Validador para patrón LETRA X
 * 
 * Patrón (forma de X):
 *  [X]     [X]
 *    [X] [X]
 *      [F]
 *    [X] [X]
 *  [X]     [X]
 */
export class LetraXValidator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    const matriz = carton.matriz;

    // Posiciones de la letra X (ambas diagonales)
    const posiciones = [
      // Diagonal principal
      [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
      // Diagonal secundaria
      [0, 4], [1, 3], [2, 2], [3, 1], [4, 0],
    ];

    // Eliminar duplicados (el centro [2,2] aparece dos veces)
    const posicionesUnicas = Array.from(
      new Set(posiciones.map(p => `${p[0]},${p[1]}`))
    ).map(p => p.split(',').map(Number));

    // Verificar que todos los números de la X estén sorteados
    return posicionesUnicas.every(([fila, col]) => {
      const numero = matriz[fila][col];
      // El centro (FREE) siempre cuenta como marcado
      if (numero === 0) return true;
      return numerosSorteados.has(numero);
    });
  }
}
