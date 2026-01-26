import { Carton, CartonNumeros } from '../entities/Carton';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';

interface CreateBatchConfig {
  serial: string;
  numero_carton?: number;
  numero_inicio?: number;
}

export class CartonFactory {
  create(
    id: string,
    serial: string,
    numeroCarton: number,
    numeros: CartonNumeros,
    matriz: number[][]
  ): Carton {
    return new Carton({
      id,
      serial,
      numero_carton: numeroCarton,
      numeros,
      matriz,
    });
  }

  createRandom(id: string, serial: string, numeroCarton: number): Carton {
    const numeros = this.generarNumerosAleatorios();
    const matriz = this.crearMatriz(numeros);

    return new Carton({
      id,
      serial,
      numero_carton: numeroCarton,
      numeros,
      matriz,
    });
  }

  createBatch(config: CreateBatchConfig, cantidad: number): Carton[] {
    const cartones: Carton[] = [];
    const timestamp = Date.now();
    const numeroInicio = config.numero_inicio || config.numero_carton || 1;

    for (let i = 0; i < cantidad; i++) {
      const numeroCarton = numeroInicio + i;
      const id = `carton-${timestamp}-${numeroCarton}`;
      const carton = this.createRandom(id, config.serial, numeroCarton);
      cartones.push(carton);
    }

    return cartones;
  }

  private generarNumerosAleatorios(): CartonNumeros {
    return {
      B: this.generarColumna(BINGO_CONSTANTS.RANGES.B.min, BINGO_CONSTANTS.RANGES.B.max, 5),
      I: this.generarColumna(BINGO_CONSTANTS.RANGES.I.min, BINGO_CONSTANTS.RANGES.I.max, 5),
      N: this.generarColumna(BINGO_CONSTANTS.RANGES.N.min, BINGO_CONSTANTS.RANGES.N.max, 4, true),
      G: this.generarColumna(BINGO_CONSTANTS.RANGES.G.min, BINGO_CONSTANTS.RANGES.G.max, 5),
      O: this.generarColumna(BINGO_CONSTANTS.RANGES.O.min, BINGO_CONSTANTS.RANGES.O.max, 5),
    };
  }

  private generarColumna(
    min: number,
    max: number,
    cantidad: number,
    conFree: boolean = false
  ): number[] {
    const numeros: number[] = [];
    const disponibles = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    for (let i = 0; i < cantidad; i++) {
      const index = Math.floor(Math.random() * disponibles.length);
      numeros.push(disponibles.splice(index, 1)[0]);
    }

    if (conFree) {
      numeros.splice(2, 0, 0);
    }

    return numeros;
  }

  private crearMatriz(numeros: CartonNumeros): number[][] {
    const matriz: number[][] = [];

    for (let fila = 0; fila < 5; fila++) {
      matriz.push([
        numeros.B[fila],
        numeros.I[fila],
        numeros.N[fila],
        numeros.G[fila],
        numeros.O[fila],
      ]);
    }

    return matriz;
  }
}
