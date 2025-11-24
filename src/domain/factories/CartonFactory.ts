import { Carton } from '../entities/Carton';
import { CartonConfig } from '../value-objects/CartonConfig';
import { NumerosBingo } from '../value-objects/NumerosBingo';
import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';

export class CartonFactory {
  private numerosGenerados: Set<string> = new Set();

  public create(config: CartonConfig): Carton {
    const numeros = this.generarNumerosUnicos();
    const matriz = this.construirMatriz(numeros);

    return new Carton({
      id: this.generateId(),
      serial: config.serial,
      numero_carton: config.numero_carton,
      numeros,
      matriz,
      fecha_creacion: new Date(),
      activo: true,
    });
  }

  public createBatch(config: CartonConfig, cantidad: number): Carton[] {
    if (cantidad < 1 || cantidad > 10000) {
      throw new Error('La cantidad debe estar entre 1 y 10,000');
    }

    const cartones: Carton[] = [];
    const numeroInicio = config.numero_inicio || config.numero_carton;

    for (let i = 0; i < cantidad; i++) {
      let carton: Carton;
      let intentos = 0;

      do {
        const cartonConfig: CartonConfig = {
          ...config,
          numero_carton: numeroInicio + i,
        };

        carton = this.create(cartonConfig);
        intentos++;

        if (intentos > 100) {
          throw new Error(
            `No se pudo generar cartón único después de 100 intentos (cartón #${numeroInicio + i})`
          );
        }
      } while (this.numerosGenerados.has(carton.getNumerosComoCadena()));

      this.numerosGenerados.add(carton.getNumerosComoCadena());
      cartones.push(carton);
    }

    return cartones;
  }

  private generarNumerosUnicos(): NumerosBingo {
    return {
      B: this.generarColumna(BINGO_CONSTANTS.RANGES.B.min, BINGO_CONSTANTS.RANGES.B.max),
      I: this.generarColumna(BINGO_CONSTANTS.RANGES.I.min, BINGO_CONSTANTS.RANGES.I.max),
      N: this.generarColumna(BINGO_CONSTANTS.RANGES.N.min, BINGO_CONSTANTS.RANGES.N.max, true),
      G: this.generarColumna(BINGO_CONSTANTS.RANGES.G.min, BINGO_CONSTANTS.RANGES.G.max),
      O: this.generarColumna(BINGO_CONSTANTS.RANGES.O.min, BINGO_CONSTANTS.RANGES.O.max),
    };
  }

  private generarColumna(min: number, max: number, free = false): number[] {
    const disponibles = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const numeros: number[] = [];

    for (let i = 0; i < 5; i++) {
      if (free && i === 2) {
        numeros.push(0); // FREE en el centro
      } else {
        const index = Math.floor(Math.random() * disponibles.length);
        numeros.push(disponibles[index]);
        disponibles.splice(index, 1);
      }
    }

    return numeros;
  }

  private construirMatriz(numeros: NumerosBingo): number[][] {
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

  private generateId(): string {
    return `carton-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public resetGenerados(): void {
    this.numerosGenerados.clear();
  }
}
