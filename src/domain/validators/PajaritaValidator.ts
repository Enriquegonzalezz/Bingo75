import { Carton } from '../entities/Carton';

/**
 * Validador para patrón PAJARITA
 * 
 * Patrón (forma de pajarita/corbatín):
 *  [X]     [X]
 *  [X] [X] [X]
 *    [X][F][X]
 *  [X] [X] [X]
 *  [X]     [X]
 */
export class PajaritaValidator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    const matriz = carton.matriz;

    // Posiciones de la pajarita (columnas 0, 2, 4 completas + bordes de columnas 1 y 3)
    const posiciones = [
      // Columna 0 (izquierda completa)
      [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
      // Columna 2 (centro completa)
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
      // Columna 4 (derecha completa)
      [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
      // Bordes de columnas 1 y 3
      [0, 1], [4, 1], // Columna 1: solo arriba y abajo
      [0, 3], [4, 3], // Columna 3: solo arriba y abajo
    ];

    // Eliminar duplicados
    const posicionesUnicas = Array.from(
      new Set(posiciones.map(p => `${p[0]},${p[1]}`))
    ).map(p => p.split(',').map(Number));

    // Verificar que todos los números de la pajarita estén sorteados
    return posicionesUnicas.every(([fila, col]) => {
      const numero = matriz[fila][col];
      // El centro (FREE) siempre cuenta como marcado
      if (numero === 0) return true;
      return numerosSorteados.has(numero);
    });
  }
}
