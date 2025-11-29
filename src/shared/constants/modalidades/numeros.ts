// Modalidades de la categoría NÚMEROS
// Números 0-10

import { Modalidad, crearPatron } from './tipos';

export const MODALIDADES_NUMEROS: Modalidad[] = [
  {
    id: 'numero-0',
    nombre: '0',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '01110',
      '10001',
      '10001',
      '10001',
      '01110',
    ]),
  },
  {
    id: 'numero-1',
    nombre: '1',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '00100',
      '01100',
      '00100',
      '00100',
      '01110',
    ]),
  },
  {
    id: 'numero-2',
    nombre: '2',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '01110',
      '10001',
      '00110',
      '01000',
      '11111',
    ]),
  },
  {
    id: 'numero-3',
    nombre: '3',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '11110',
      '00001',
      '01110',
      '00001',
      '11110',
    ]),
  },
  {
    id: 'numero-4',
    nombre: '4',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '10001',
      '10001',
      '11111',
      '00001',
      '00001',
    ]),
  },
  {
    id: 'numero-5',
    nombre: '5',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '11111',
      '10000',
      '11110',
      '00001',
      '11110',
    ]),
  },
  {
    id: 'numero-6',
    nombre: '6',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '01111',
      '10000',
      '11110',
      '10001',
      '01110',
    ]),
  },
  {
    id: 'numero-7',
    nombre: '7',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '11111',
      '00001',
      '00010',
      '00100',
      '00100',
    ]),
  },
  {
    id: 'numero-8',
    nombre: '8',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '01110',
      '10001',
      '01110',
      '10001',
      '01110',
    ]),
  },
  {
    id: 'numero-9',
    nombre: '9',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '01110',
      '10001',
      '01111',
      '00001',
      '11110',
    ]),
  },
  {
    id: 'numero-10',
    nombre: '10',
    categoria: 'NUMEROS',
    patron: crearPatron([
      '10111',
      '10101',
      '10101',
      '10101',
      '10111',
    ]),
  },
];
