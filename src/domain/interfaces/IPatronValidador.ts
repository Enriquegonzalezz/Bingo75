import { Carton } from '../entities/Carton';

export interface ResultadoValidacion {
  es_ganador: boolean;
  patron_ganador?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalles?: any;
  numeros_coincidentes: number[];
  numeros_faltantes: number[];
  tiempo_validacion_ms: number;
}

export interface IPatronValidador {
  validate(carton: Carton, numerosSorteados: Set<number>): ResultadoValidacion;
}
