import { Carton } from '../entities/Carton';

export interface ICartonRepository {
  getAll(): Promise<Carton[]>;
  getById(id: string): Promise<Carton | null>;
  getByNumero(numero: number): Promise<Carton | null>;
  save(carton: Carton): Promise<void>;
  saveBatch(cartones: Carton[]): Promise<void>;
  delete(id: string): Promise<void>;
  getUltimoNumero(): Promise<number>;
  clear(): Promise<void>;
}
