import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';
import { Carton } from '@/domain/entities/Carton';

export class LocalStorageCartonRepository implements ICartonRepository {
  private cartones: Carton[] | null = null;
  private paqueteActual: string = 'paquete-original';
  private ultimaCarga: number = 0;

  setPaquete(paqueteId: string): void {
    if (this.paqueteActual !== paqueteId) {
      this.paqueteActual = paqueteId;
      this.cartones = null; // Forzar recarga
      this.ultimaCarga = 0;
      console.log(`📦 Paquete cambiado a: ${paqueteId}`);
    }
  }

  getPaqueteActual(): string {
    return this.paqueteActual;
  }

  private async loadCartones(): Promise<Carton[]> {
    // Si ya tenemos cartones cargados del mismo paquete, retornarlos
    if (this.cartones !== null && this.cartones.length > 0) {
      console.log(`📦 Usando cache: ${this.cartones.length} cartones de "${this.paqueteActual}"`);
      return this.cartones;
    }

    console.log(`🔄 Cargando paquete: ${this.paqueteActual}...`);

    // =========================================================================
    // CASO ESPECIAL: Paquete original (JSON local)
    // =========================================================================
    if (this.paqueteActual === 'paquete-original') {
      return this.cargarDesdeJSONLocal();
    }

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
            let errores = 0;

            for (const cartonData of data.cartones) {
              try {
                const carton = Carton.fromJSON(cartonData);
                cartonesArray.push(carton);
              } catch (error) {
                errores++;
                if (errores <= 3) {
                  console.warn(`⚠️ Error procesando cartón:`, error);
                }
              }
            }

            if (errores > 0) {
              console.warn(`⚠️ ${errores} cartones con errores de ${data.cartones.length} totales`);
            }

            if (cartonesArray.length > 0) {
              this.cartones = cartonesArray;
              this.ultimaCarga = Date.now();
              console.log(`✅ ${cartonesArray.length} cartones cargados desde BASE DE DATOS`);
              return cartonesArray;
            }
          }
        } else {
          console.warn(`⚠️ API respondió con error: ${response.status}`);
        }

        console.log(`⚠️ API no devolvió cartones válidos para "${this.paqueteActual}"`);
      } catch (apiError) {
        console.error(`❌ Error al llamar API:`, apiError);
      }
    }

    // =========================================================================
    // FALLBACK: Intentar cargar desde JSON local (si existe)
    // =========================================================================
    return this.cargarDesdeJSONLocal();
  }

  private async cargarDesdeJSONLocal(): Promise<Carton[]> {
    try {
      console.log(`📁 Intentando cargar JSON local: ${this.paqueteActual}`);

      const paqueteData = await import(
        `@/shared/constants/paquetes-cartones/${this.paqueteActual}.json`
      );

      if (!paqueteData.cartones || !Array.isArray(paqueteData.cartones)) {
        throw new Error('Formato de JSON inválido');
      }

      const cartonesArray: Carton[] = [];
      let errores = 0;

      for (const data of paqueteData.cartones) {
        try {
          const carton = Carton.fromJSON(data);
          cartonesArray.push(carton);
        } catch (error) {
          errores++;
          if (errores <= 3) {
            console.warn(`⚠️ Error procesando cartón del JSON:`, error);
          }
        }
      }

      if (cartonesArray.length === 0) {
        throw new Error('No se pudieron procesar cartones del JSON');
      }

      this.cartones = cartonesArray;
      this.ultimaCarga = Date.now();

      const nombrePaquete = paqueteData.nombre || this.paqueteActual;
      console.log(
        `✅ ${cartonesArray.length} cartones cargados desde JSON local: ${nombrePaquete}`
      );

      if (errores > 0) {
        console.warn(`⚠️ ${errores} cartones con errores`);
      }

      return cartonesArray;
    } catch (jsonError) {
      console.error(`❌ Error al cargar JSON local "${this.paqueteActual}":`, jsonError);
      this.cartones = [];
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
    this.ultimaCarga = 0;
    console.log('🔄 Cache de cartones limpiado');
  }

  // Método para forzar recarga
  async forceReload(): Promise<Carton[]> {
    this.cartones = null;
    this.ultimaCarga = 0;
    return this.loadCartones();
  }

  // Método para verificar si el paquete está cargado
  isLoaded(): boolean {
    return this.cartones !== null && this.cartones.length > 0;
  }

  // Método para obtener estadísticas
  getStats(): { paquete: string; total: number; ultimaCarga: Date | null } {
    return {
      paquete: this.paqueteActual,
      total: this.cartones?.length || 0,
      ultimaCarga: this.ultimaCarga > 0 ? new Date(this.ultimaCarga) : null,
    };
  }
}
