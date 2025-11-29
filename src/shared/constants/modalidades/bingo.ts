// Modalidades de la categoría BINGO
// Columnas B, I, N, G, O, Pleno, Vertical, Horizontal

import { Modalidad, crearPatron } from './tipos';

export const MODALIDADES_BINGO: Modalidad[] = [
  {
    id: 'columna-b',
    nombre: 'Columna B',
    categoria: 'BINGO',
    patron: crearPatron([
      '10000',
      '10000',
      '10000',
      '10000',
      '10000',
    ]),
  },
  {
    id: 'columna-i',
    nombre: 'Columna I',
    categoria: 'BINGO',
    patron: crearPatron([
      '01000',
      '01000',
      '01000',
      '01000',
      '01000',
    ]),
  },
  {
    id: 'columna-n',
    nombre: 'Columna N',
    categoria: 'BINGO',
    patron: crearPatron([
      '00100',
      '00100',
      '00100',
      '00100',
      '00100',
    ]),
  },
  {
    id: 'columna-g',
    nombre: 'Columna G',
    categoria: 'BINGO',
    patron: crearPatron([
      '00010',
      '00010',
      '00010',
      '00010',
      '00010',
    ]),
  },
  {
    id: 'columna-o',
    nombre: 'Columna O',
    categoria: 'BINGO',
    patron: crearPatron([
      '00001',
      '00001',
      '00001',
      '00001',
      '00001',
    ]),
  },
  {
    id: 'pleno',
    nombre: 'Pleno',
    categoria: 'BINGO',
    patron: crearPatron([
      '11111',
      '11111',
      '11111',
      '11111',
      '11111',
    ]),
  },
  {
    id: 'vertical',
    nombre: 'Vertical',
    categoria: 'BINGO',
    descripcion: 'Cualquier columna vertical',
    patron: crearPatron([
      '00100',
      '00100',
      '00100',
      '00100',
      '00100',
    ]),
  },
  {
    id: 'horizontal',
    nombre: 'Horizontal',
    categoria: 'BINGO',
    descripcion: 'Cualquier fila horizontal',
    patron: crearPatron([
      '00000',
      '00000',
      '11111',
      '00000',
      '00000',
    ]),
  },
];
