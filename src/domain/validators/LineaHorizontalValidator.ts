import { IPatronValidador, ResultadoValidacion } from '../interfaces/IPatronValidador';
import { Carton } from '../entities/Carton';

export class LineaHorizontalValidator implements IPatronValidador {
  validate(carton: Carton, numerosSorteados: Set<number>): ResultadoValidacion {
    const inicio = performance.now();

    for (let fila = 0; fila < 5; fila++) {
      const numerosLinea = carton.matriz[fila];
      const coincidencias = numerosLinea.filter((n) => n === 0 || numerosSorteados.has(n));

      if (coincidencias.length === 5) {
        return {
          es_ganador: true,
          patron_ganador: 'linea_horizontal',
          detalles: { fila },
          numeros_coincidentes: numerosLinea.filter((n) => n !== 0),
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
