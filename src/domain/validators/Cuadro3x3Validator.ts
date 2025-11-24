import { Carton } from '../entities/Carton';

/**
 * Validador para patrón 3x3
 * 
 * Patrón (cuadro 3x3 centrado):
 *  [X] [X] [X]
 *  [X] [F] [X]
 *  [X] [X] [X]
 */
export class Cuadro3x3Validator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    const matriz = carton.matriz;

    // Posiciones del cuadro 3x3 centrado (filas 1-3, columnas 1-3)
    const posiciones = [
      [1, 1], [1, 2], [1, 3],
      [2, 1], [2, 2], [2, 3], // [2,2] es FREE
      [3, 1], [3, 2], [3, 3],
    ];

    // Verificar que todos los números del cuadro estén sorteados
    return posiciones.every(([fila, col]) => {
      const numero = matriz[fila][col];
      // El centro (FREE) siempre cuenta como marcado
      if (numero === 0) return true;
      return numerosSorteados.has(numero);
    });
  }
}
