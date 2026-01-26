// ============================================================================
// ENTIDAD CARTON - Estructura base que coincide con la API
// ============================================================================

export interface CartonNumeros {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

export interface CartonData {
  id: string;
  serial: string;
  numero_carton: number;
  numeros: CartonNumeros;
  matriz: number[][];
}

export class Carton {
  public readonly id: string;
  public readonly serial: string;
  public readonly numero_carton: number;
  public readonly numeros: CartonNumeros;
  public readonly matriz: number[][];

  constructor(data: CartonData) {
    this.id = data.id;
    this.serial = data.serial;
    this.numero_carton = data.numero_carton;
    this.numeros = data.numeros;
    this.matriz = data.matriz;

    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('ID del cartón es requerido');
    }

    if (this.numero_carton < 1) {
      throw new Error('Número de cartón debe ser mayor a 0');
    }

    if (!this.matriz || this.matriz.length !== 5) {
      throw new Error('Matriz debe tener 5 filas');
    }

    for (const fila of this.matriz) {
      if (!fila || fila.length !== 5) {
        throw new Error('Cada fila de la matriz debe tener 5 columnas');
      }
    }

    if (this.matriz[2][2] !== 0) {
      throw new Error('El centro del cartón debe ser FREE (0)');
    }
  }

  public toJSON(): CartonData {
    return {
      id: this.id,
      serial: this.serial,
      numero_carton: this.numero_carton,
      numeros: this.numeros,
      matriz: this.matriz,
    };
  }

  public static fromJSON(json: any): Carton {
    return new Carton({
      id: json.id,
      serial: json.serial || 'BINGO',
      numero_carton: json.numero_carton,
      numeros: json.numeros,
      matriz: json.matriz,
    });
  }

  public contieneNumero(numero: number): boolean {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.matriz[i][j] === numero) {
          return true;
        }
      }
    }
    return false;
  }

  public getNumerosComoCadena(): string {
    const todosNumeros = [
      ...this.numeros.B,
      ...this.numeros.I,
      ...this.numeros.N.filter((n) => n !== 0),
      ...this.numeros.G,
      ...this.numeros.O,
    ].sort((a, b) => a - b);

    return todosNumeros.join('-');
  }

  public getNumeroEnPosicion(fila: number, columna: number): number {
    if (fila < 0 || fila > 4 || columna < 0 || columna > 4) {
      throw new Error('Posición fuera de rango');
    }
    return this.matriz[fila][columna];
  }
}
