import { Carton } from '../entities/Carton';

export interface ICartonRepository {
  // Configuración de paquete
  setPaquete(paqueteId: string): void;
  getPaqueteActual(): string;

  // Operaciones de lectura
  getAll(): Promise<Carton[]>;
  getById(id: string): Promise<Carton | null>;
  getByNumero(numero: number): Promise<Carton | null>;
  getUltimoNumero(): Promise<number>;

  // Operaciones de escritura (opcionales)
  save(carton: Carton): Promise<void>;
  saveBatch(cartones: Carton[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
