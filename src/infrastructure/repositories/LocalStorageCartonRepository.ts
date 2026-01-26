import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';
import { Carton } from '@/domain/entities/Carton';

export class LocalStorageCartonRepository implements ICartonRepository {
  private cartones: Carton[] | null = null;
  private paqueteActual: string = 'paquete-original';

  setPaquete(paqueteId: string): void {
    if (this.paqueteActual !== paqueteId) {
      this.paqueteActual = paqueteId;
      this.cartones = null;
      console.log(`📦 Paquete cambiado a: ${paqueteId}`);
    }
  }

  getPaqueteActual(): string {
    return this.paqueteActual;
  }

  private async loadCartones(): Promise<Carton[]> {
    if (this.cartones !== null) {
      return this.cartones;
    }

    console.log(`🔄 Cargando paquete: ${this.paqueteActual}...`);

    // =========================================================================
    // PRIMERO: Intentar cargar desde la API (base de datos)
    // =========================================================================
    if (typeof window !== 'undefined') {
      try {
        console.log(`🌐 Cargando desde API: /api/cartones/${this.paqueteActual}`);
        const response = await fetch(`/api/cartones/${this.paqueteActual}`);

        if (response.ok) {
          const data = await response.json();

          if (data.cartones && Array.isArray(data.cartones) && data.cartones.length > 0) {
            const cartonesArray: Carton[] = [];

            for (const cartonData of data.cartones) {
              try {
                const carton = Carton.fromJSON(cartonData);
                cartonesArray.push(carton);
              } catch (error) {
                console.warn(`⚠️ Error procesando cartón:`, error);
              }
            }

            if (cartonesArray.length > 0) {
              this.cartones = cartonesArray;
              console.log(`✅ ${cartonesArray.length} cartones cargados desde BASE DE DATOS`);
              return cartonesArray;
            }
          }
        }

        console.log(`⚠️ API no devolvió cartones válidos, intentando JSON local...`);
      } catch (apiError) {
        console.log(`⚠️ Error en API, intentando JSON local:`, apiError);
      }
    }

    // =========================================================================
    // FALLBACK: Cargar desde JSON local
    // =========================================================================
    try {
      console.log(`📁 Cargando desde JSON local: ${this.paqueteActual}`);

      const paqueteData = await import(
        `@/shared/constants/paquetes-cartones/${this.paqueteActual}.json`
      );

      const cartonesArray = paqueteData.cartones.map((data: any) => Carton.fromJSON(data));

      this.cartones = cartonesArray;
      console.log(`✅ ${cartonesArray.length} cartones cargados desde JSON local`);
      return cartonesArray;
    } catch (jsonError) {
      console.error('❌ Error al cargar desde JSON local:', jsonError);
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
    console.warn('⚠️ Los cartones son de solo lectura');
  }

  async saveBatch(_cartones: Carton[]): Promise<void> {
    console.warn('⚠️ Los cartones son de solo lectura');
  }

  async delete(_id: string): Promise<void> {
    console.warn('⚠️ Los cartones son de solo lectura');
  }

  async getUltimoNumero(): Promise<number> {
    const cartones = await this.getAll();
    if (cartones.length === 0) return 0;
    return Math.max(...cartones.map((c) => c.numero_carton));
  }

  async clear(): Promise<void> {
    this.cartones = null;
    console.log('🔄 Cartones reiniciados');
  }
}
