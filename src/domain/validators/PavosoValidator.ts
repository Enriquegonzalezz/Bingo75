import { Carton } from '../entities/Carton';

/**
 * Validador para patrón PAVOSO
 * 
 * Un cartón es "Pavoso" cuando:
 * - Han salido exactamente 14 números
 * - El cartón NO tiene NINGUNA coincidencia con esos números
 * 
 * Es un premio especial por "mala suerte"
 */
export class PavosoValidator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    // Solo validar si han salido exactamente 14 números
    if (numerosSorteados.size !== 14) {
      return false;
    }

    // Obtener todos los números del cartón (excluyendo el FREE/0)
    const numerosCarton = carton.matriz
      .flat()
      .filter(num => num !== 0);

    // Verificar que NO haya NINGUNA coincidencia
    const tieneCoincidencia = numerosCarton.some(num => 
      numerosSorteados.has(num)
    );

    // Es pavoso si NO tiene coincidencias
    return !tieneCoincidencia;
  }
}
