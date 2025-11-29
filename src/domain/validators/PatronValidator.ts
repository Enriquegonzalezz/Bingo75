import { Carton } from '../entities/Carton';

/**
 * Validador genérico basado en patrón
 * 
 * Valida si un cartón cumple con un patrón específico de 5x5
 * donde true = casilla requerida, false = casilla ignorada
 */
export class PatronValidator {
  private readonly patron: boolean[][];
  private readonly nombre: string;

  constructor(patron: boolean[][], nombre: string) {
    this.patron = patron;
    this.nombre = nombre;
  }

  getNombre(): string {
    return this.nombre;
  }

  getPatron(): boolean[][] {
    return this.patron;
  }

  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    // Recorrer el patrón y verificar que todas las casillas requeridas estén marcadas
    for (let fila = 0; fila < 5; fila++) {
      for (let col = 0; col < 5; col++) {
        // Si esta casilla es requerida por el patrón
        if (this.patron[fila][col]) {
          const numero = carton.matriz[fila][col];
          
          // El centro (FREE) siempre cuenta como marcado
          if (fila === 2 && col === 2) {
            continue; // FREE siempre está marcado
          }
          
          // Si el número no ha sido sorteado, el patrón no se cumple
          if (!numerosSorteados.has(numero)) {
            return false;
          }
        }
      }
    }
    
    // Todas las casillas requeridas están marcadas
    return true;
  }
}

/**
 * Validador para línea horizontal (cualquier fila)
 */
export class LineaHorizontalGenericValidator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    // Verificar cada fila
    for (let fila = 0; fila < 5; fila++) {
      let filaCompleta = true;
      
      for (let col = 0; col < 5; col++) {
        const numero = carton.matriz[fila][col];
        
        // El centro (FREE) siempre cuenta
        if (fila === 2 && col === 2) {
          continue;
        }
        
        if (!numerosSorteados.has(numero)) {
          filaCompleta = false;
          break;
        }
      }
      
      if (filaCompleta) {
        return true;
      }
    }
    
    return false;
  }
}

/**
 * Validador para línea vertical (cualquier columna)
 */
export class LineaVerticalGenericValidator {
  validate(carton: Carton, numerosSorteados: Set<number>): boolean {
    // Verificar cada columna
    for (let col = 0; col < 5; col++) {
      let columnaCompleta = true;
      
      for (let fila = 0; fila < 5; fila++) {
        const numero = carton.matriz[fila][col];
        
        // El centro (FREE) siempre cuenta
        if (fila === 2 && col === 2) {
          continue;
        }
        
        if (!numerosSorteados.has(numero)) {
          columnaCompleta = false;
          break;
        }
      }
      
      if (columnaCompleta) {
        return true;
      }
    }
    
    return false;
  }
}
