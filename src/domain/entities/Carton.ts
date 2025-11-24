import { NumerosBingo, NumerosBingoVO } from '../value-objects/NumerosBingo';

export interface CartonProps {
  id: string;
  serial: string;
  numero_carton: number;
  numeros: NumerosBingo;
  matriz: number[][];
  fecha_creacion: Date;
  activo: boolean;
}

export class Carton {
  public readonly id: string;
  public readonly serial: string;
  public readonly numero_carton: number;
  public readonly numeros: NumerosBingo;
  public readonly matriz: number[][];
  public readonly fecha_creacion: Date;
  public activo: boolean;

  constructor(props: CartonProps) {
    this.id = props.id;
    this.serial = props.serial;
    this.numero_carton = props.numero_carton;
    this.numeros = props.numeros;
    this.matriz = props.matriz;
    this.fecha_creacion = props.fecha_creacion;
    this.activo = props.activo;

    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('ID del cartón es requerido');
    }

    if (this.numero_carton < 1) {
      throw new Error('Número de cartón debe ser mayor a 0');
    }

    if (this.matriz.length !== 5 || this.matriz[0].length !== 5) {
      throw new Error('Matriz debe ser 5x5');
    }

    if (this.matriz[2][2] !== 0) {
      throw new Error('El centro del cartón debe ser FREE (0)');
    }

    // Validar números usando Value Object
    new NumerosBingoVO(this.numeros);
  }

  public toJSON() {
    return {
      id: this.id,
      serial: this.serial,
      numero_carton: this.numero_carton,
      numeros: this.numeros,
      matriz: this.matriz,
      fecha_creacion: this.fecha_creacion.toISOString(),
      activo: this.activo,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromJSON(json: any): Carton {
    return new Carton({
      id: json.id,
      serial: json.serial,
      numero_carton: json.numero_carton,
      numeros: json.numeros,
      matriz: json.matriz,
      fecha_creacion: json.fecha_creacion ? new Date(json.fecha_creacion) : new Date(),
      activo: json.activo ?? true,
    });
  }

  public desactivar(): void {
    this.activo = false;
  }

  public activar(): void {
    this.activo = true;
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
}
