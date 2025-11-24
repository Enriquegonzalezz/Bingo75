import { LetraBingo } from '@/shared/constants/bingo.constants';

export interface NumeroSorteadoData {
  numero: number;
  letra: LetraBingo;
  timestamp: Date;
}

export class NumeroSorteado {
  constructor(
    public readonly numero: number,
    public readonly letra: LetraBingo,
    public readonly timestamp: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.numero < 1 || this.numero > 75) {
      throw new Error(`Número ${this.numero} fuera del rango válido (1-75)`);
    }
  }

  public toJSON(): NumeroSorteadoData {
    return {
      numero: this.numero,
      letra: this.letra,
      timestamp: this.timestamp,
    };
  }

  public static fromJSON(data: NumeroSorteadoData): NumeroSorteado {
    return new NumeroSorteado(data.numero, data.letra, new Date(data.timestamp));
  }
}
