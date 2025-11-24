import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';
import { Carton } from '@/domain/entities/Carton';
import cartonesData from '@/shared/constants/cartones.json';

export class LocalStorageCartonRepository implements ICartonRepository {
  private cartones: Carton[] | null = null;

  // Cargar cartones desde JSON (siempre)
  private loadCartones(): Carton[] {
    if (this.cartones !== null) {
      return this.cartones;
    }

    try {
      console.log('🔄 Cargando 1000 cartones desde JSON...');
      
      this.cartones = cartonesData.cartones.map((data: any) => 
        Carton.fromJSON(data)
      );
      
      console.log(`✅ ${this.cartones.length} cartones cargados exitosamente`);
      return this.cartones;
    } catch (error) {
      console.error('❌ Error al cargar cartones:', error);
      return [];
    }
  }

  async getAll(): Promise<Carton[]> {
    return this.loadCartones();
  }

  async getById(id: string): Promise<Carton | null> {
    const cartones = await this.getAll();
    return cartones.find((c) => c.id === id) || null;
  }

  async getByNumero(numero: number): Promise<Carton | null> {
    const cartones = await this.getAll();
    return cartones.find((c) => c.numero_carton === numero) || null;
  }

  async save(_carton: Carton): Promise<void> {
    // No se permite guardar cartones (solo lectura desde JSON)
    console.warn('⚠️ Los cartones son de solo lectura desde JSON');
  }

  async saveBatch(_cartones: Carton[]): Promise<void> {
    // No se permite guardar cartones (solo lectura desde JSON)
    console.warn('⚠️ Los cartones son de solo lectura desde JSON');
  }

  async delete(_id: string): Promise<void> {
    // No se permite eliminar cartones (solo lectura desde JSON)
    console.warn('⚠️ Los cartones son de solo lectura desde JSON');
  }

  async getUltimoNumero(): Promise<number> {
    const cartones = await this.getAll();
    if (cartones.length === 0) return 0;

    return Math.max(...cartones.map((c) => c.numero_carton));
  }

  async clear(): Promise<void> {
    // Recargar cartones desde JSON
    this.cartones = null;
    console.log('🔄 Cartones reiniciados - se recargarán desde JSON');
  }
}
