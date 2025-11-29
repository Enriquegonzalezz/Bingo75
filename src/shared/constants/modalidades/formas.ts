// Modalidades de la categoría FORMAS
// Diagonal, Esquinas, 3x3, Cruz, Flecha, Rombo, 4x4, Cuadrado

import { Modalidad, crearPatron } from './tipos';

export const MODALIDADES_FORMAS: Modalidad[] = [
  {
    id: 'diagonal',
    nombre: 'Diagonal',
    categoria: 'FORMAS',
    patron: crearPatron([
      '10001',
      '01010',
      '00100',
      '01010',
      '10001',
    ]),
  },
  {
    id: 'esquinas',
    nombre: 'Esquinas',
    categoria: 'FORMAS',
    patron: crearPatron([
      '10001',
      '00000',
      '00000',
      '00000',
      '10001',
    ]),
  },
  {
    id: '3x3',
    nombre: '3x3',
    categoria: 'FORMAS',
    patron: crearPatron([
      '00000',
      '01110',
      '01110',
      '01110',
      '00000',
    ]),
  },
  {
    id: 'cruz',
    nombre: 'Cruz',
    categoria: 'FORMAS',
    patron: crearPatron([
      '00100',
      '00100',
      '11111',
      '00100',
      '00100',
    ]),
  },
  {
    id: 'flecha',
    nombre: 'Flecha',
    categoria: 'FORMAS',
    patron: crearPatron([
      '00100',
      '01110',
      '10101',
      '00100',
      '00100',
    ]),
  },
  {
    id: 'rombo',
    nombre: 'Rombo',
    categoria: 'FORMAS',
    patron: crearPatron([
      '00100',
      '01010',
      '10001',
      '01010',
      '00100',
    ]),
  },
  {
    id: '4x4',
    nombre: '4x4',
    categoria: 'FORMAS',
    patron: crearPatron([
      '11110',
      '11110',
      '11110',
      '11110',
      '00000',
    ]),
  },
  {
    id: 'cuadrado',
    nombre: 'Cuadrado',
    categoria: 'FORMAS',
    patron: crearPatron([
      '00000',
      '01110',
      '01010',
      '01110',
      '00000',
    ]),
  },
];
