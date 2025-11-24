import { IPatronValidador, ResultadoValidacion } from '../interfaces/IPatronValidador';
import { Carton } from '../entities/Carton';

export class DiagonalValidator implements IPatronValidador {
  validate(carton: Carton, numerosSorteados: Set<number>): ResultadoValidacion {
    const inicio = performance.now();

    // Diagonal principal (top-left a bottom-right)
    const diagonalPrincipal = [
      carton.matriz[0][0],
      carton.matriz[1][1],
      carton.matriz[2][2], // FREE
      carton.matriz[3][3],
      carton.matriz[4][4],
    ];

    const coincidenciasPrincipal = diagonalPrincipal.filter(
      (n) => n === 0 || numerosSorteados.has(n)
    );

    if (coincidenciasPrincipal.length === 5) {
      return {
        es_ganador: true,
        patron_ganador: 'diagonal_principal',
        detalles: { tipo: 'principal' },
        numeros_coincidentes: diagonalPrincipal.filter((n) => n !== 0),
        numeros_faltantes: [],
        tiempo_validacion_ms: performance.now() - inicio,
      };
    }

    // Diagonal secundaria (top-right a bottom-left)
    const diagonalSecundaria = [
      carton.matriz[0][4],
      carton.matriz[1][3],
      carton.matriz[2][2], // FREE
      carton.matriz[3][1],
      carton.matriz[4][0],
    ];

    const coincidenciasSecundaria = diagonalSecundaria.filter(
      (n) => n === 0 || numerosSorteados.has(n)
    );

    if (coincidenciasSecundaria.length === 5) {
      return {
        es_ganador: true,
        patron_ganador: 'diagonal_secundaria',
        detalles: { tipo: 'secundaria' },
        numeros_coincidentes: diagonalSecundaria.filter((n) => n !== 0),
        numeros_faltantes: [],
        tiempo_validacion_ms: performance.now() - inicio,
      };
    }

    return {
      es_ganador: false,
      numeros_coincidentes: [],
      numeros_faltantes: [],
      tiempo_validacion_ms: performance.now() - inicio,
    };
  }
}
