import { IPatronValidador, ResultadoValidacion } from '../interfaces/IPatronValidador';
import { Carton } from '../entities/Carton';

export class CuatroEsquinasValidator implements IPatronValidador {
  validate(carton: Carton, numerosSorteados: Set<number>): ResultadoValidacion {
    const inicio = performance.now();

    const esquinas = [
      carton.matriz[0][0], // Top-left
      carton.matriz[0][4], // Top-right
      carton.matriz[4][0], // Bottom-left
      carton.matriz[4][4], // Bottom-right
    ];

    const coincidencias = esquinas.filter((n) => numerosSorteados.has(n));

    if (coincidencias.length === 4) {
      return {
        es_ganador: true,
        patron_ganador: 'cuatro_esquinas',
        detalles: { esquinas },
        numeros_coincidentes: esquinas,
        numeros_faltantes: [],
        tiempo_validacion_ms: performance.now() - inicio,
      };
    }

    return {
      es_ganador: false,
      numeros_coincidentes: coincidencias,
      numeros_faltantes: esquinas.filter((n) => !numerosSorteados.has(n)),
      tiempo_validacion_ms: performance.now() - inicio,
    };
  }
}
