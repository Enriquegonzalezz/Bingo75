// Índice de todas las modalidades
// Estructura organizada por categorías

export * from './tipos';
export * from './bingo';
export * from './letras';
export * from './numeros';
export * from './formas';
export * from './cosas-animales';

import { Modalidad, CategoriaModalidad } from './tipos';
import { MODALIDADES_BINGO } from './bingo';
import { MODALIDADES_LETRAS } from './letras';
import { MODALIDADES_NUMEROS } from './numeros';
import { MODALIDADES_FORMAS } from './formas';
import { MODALIDADES_COSAS_ANIMALES } from './cosas-animales';

// Todas las modalidades combinadas
export const TODAS_MODALIDADES: Modalidad[] = [
  ...MODALIDADES_BINGO,
  ...MODALIDADES_LETRAS,
  ...MODALIDADES_NUMEROS,
  ...MODALIDADES_FORMAS,
  ...MODALIDADES_COSAS_ANIMALES,
];

// Función para obtener modalidades por categoría
export function getModalidadesPorCategoria(categoria: CategoriaModalidad): Modalidad[] {
  switch (categoria) {
    case 'BINGO':
      return MODALIDADES_BINGO;
    case 'LETRAS':
      return MODALIDADES_LETRAS;
    case 'NUMEROS':
      return MODALIDADES_NUMEROS;
    case 'FORMAS':
      return MODALIDADES_FORMAS;
    case 'COSAS_ANIMALES':
      return MODALIDADES_COSAS_ANIMALES;
    case 'PERSONALIZADO':
      return []; // Las personalizadas se crean en runtime
    default:
      return [];
  }
}

// Función para obtener una modalidad por ID
export function getModalidadById(id: string): Modalidad | undefined {
  return TODAS_MODALIDADES.find(m => m.id === id);
}
