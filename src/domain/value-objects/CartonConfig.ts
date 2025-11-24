export interface CartonConfig {
  serial: string;
  numero_carton: number;
  numero_inicio?: number;
}

export class CartonConfigVO {
  constructor(
    public readonly serial: string,
    public readonly numero_carton: number,
    public readonly numero_inicio?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.serial || this.serial.trim() === '') {
      throw new Error('Serial es requerido');
    }

    if (this.numero_carton < 1) {
      throw new Error('Número de cartón debe ser mayor a 0');
    }

    if (this.numero_inicio !== undefined && this.numero_inicio < 1) {
      throw new Error('Número de inicio debe ser mayor a 0');
    }
  }
}
