import { BINGO_CONSTANTS } from '@/shared/constants/bingo.constants';

export interface NumerosBingo {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

export class NumerosBingoVO {
  constructor(private readonly numeros: NumerosBingo) {
    this.validate();
  }

  private validate(): void {
    const { RANGES } = BINGO_CONSTANTS;

    // Validar B (1-15)
    this.numeros.B.forEach((num) => {
      if (num < RANGES.B.min || num > RANGES.B.max) {
        throw new Error(`Número ${num} fuera del rango B (${RANGES.B.min}-${RANGES.B.max})`);
      }
    });

    // Validar I (16-30)
    this.numeros.I.forEach((num) => {
      if (num < RANGES.I.min || num > RANGES.I.max) {
        throw new Error(`Número ${num} fuera del rango I (${RANGES.I.min}-${RANGES.I.max})`);
      }
    });

    // Validar N (31-45, con FREE en posición 2)
    if (this.numeros.N.length !== 5) {
      throw new Error('Columna N debe tener 5 números');
    }
    if (this.numeros.N[2] !== 0) {
      throw new Error('Posición central de N debe ser 0 (FREE)');
    }

    // Validar G (46-60)
    this.numeros.G.forEach((num) => {
      if (num < RANGES.G.min || num > RANGES.G.max) {
        throw new Error(`Número ${num} fuera del rango G (${RANGES.G.min}-${RANGES.G.max})`);
      }
    });

    // Validar O (61-75)
    this.numeros.O.forEach((num) => {
      if (num < RANGES.O.min || num > RANGES.O.max) {
        throw new Error(`Número ${num} fuera del rango O (${RANGES.O.min}-${RANGES.O.max})`);
      }
    });

    // Validar unicidad
    const todosNumeros = [
      ...this.numeros.B,
      ...this.numeros.I,
      ...this.numeros.N.filter((n) => n !== 0),
      ...this.numeros.G,
      ...this.numeros.O,
    ];

    const unicos = new Set(todosNumeros);
    if (unicos.size !== todosNumeros.length) {
      throw new Error('Hay números duplicados en el cartón');
    }
  }

  public getValue(): NumerosBingo {
    return { ...this.numeros };
  }

  public toArray(): number[] {
    return [
      ...this.numeros.B,
      ...this.numeros.I,
      ...this.numeros.N,
      ...this.numeros.G,
      ...this.numeros.O,
    ];
  }

  public toMatriz(): number[][] {
    const matriz: number[][] = [];
    for (let i = 0; i < 5; i++) {
      matriz.push([
        this.numeros.B[i],
        this.numeros.I[i],
        this.numeros.N[i],
        this.numeros.G[i],
        this.numeros.O[i],
      ]);
    }
    return matriz;
  }
}
