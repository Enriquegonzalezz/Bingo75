import { IPatronValidador, ResultadoValidacion } from '../interfaces/IPatronValidador';
import { Carton } from '../entities/Carton';

export class CartonLlenoValidator implements IPatronValidador {
  validate(carton: Carton, numerosSorteados: Set<number>): ResultadoValidacion {
    const inicio = performance.now();

    const todosNumeros = carton.matriz.flat().filter((n) => n !== 0);
    const coincidencias = todosNumeros.filter((n) => numerosSorteados.has(n));
    const faltantes = todosNumeros.filter((n) => !numerosSorteados.has(n));

    const esGanador = faltantes.length === 0;

    return {
      es_ganador: esGanador,
      patron_ganador: esGanador ? 'carton_lleno' : undefined,
      detalles: {
        total: todosNumeros.length,
        marcados: coincidencias.length,
        faltantes: faltantes.length,
      },
      numeros_coincidentes: coincidencias,
      numeros_faltantes: faltantes,
      tiempo_validacion_ms: performance.now() - inicio,
    };
  }
}
