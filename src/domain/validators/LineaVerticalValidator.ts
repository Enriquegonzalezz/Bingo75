import { IPatronValidador, ResultadoValidacion } from '../interfaces/IPatronValidador';
import { Carton } from '../entities/Carton';

export class LineaVerticalValidator implements IPatronValidador {
  validate(carton: Carton, numerosSorteados: Set<number>): ResultadoValidacion {
    const inicio = performance.now();

    for (let col = 0; col < 5; col++) {
      const numerosColumna = carton.matriz.map((fila) => fila[col]);
      const coincidencias = numerosColumna.filter((n) => n === 0 || numerosSorteados.has(n));

      if (coincidencias.length === 5) {
        return {
          es_ganador: true,
          patron_ganador: 'linea_vertical',
          detalles: { columna: col },
          numeros_coincidentes: numerosColumna.filter((n) => n !== 0),
          numeros_faltantes: [],
          tiempo_validacion_ms: performance.now() - inicio,
        };
      }
    }

    return {
      es_ganador: false,
      numeros_coincidentes: [],
      numeros_faltantes: [],
      tiempo_validacion_ms: performance.now() - inicio,
    };
  }
}
