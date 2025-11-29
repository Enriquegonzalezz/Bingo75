// Tipos para las modalidades de bingo

export type CategoriaModalidad = 'BINGO' | 'LETRAS' | 'COSAS_ANIMALES' | 'FORMAS' | 'NUMEROS' | 'PERSONALIZADO';

export interface Modalidad {
  id: string;
  nombre: string;
  categoria: CategoriaModalidad;
  patron: boolean[][];
  descripcion?: string;
}

// Helper para crear patrones de 5x5
export function crearPatron(filas: string[]): boolean[][] {
  return filas.map(fila => 
    fila.split('').map(c => c === '1')
  );
}
