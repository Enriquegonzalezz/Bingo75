export const BINGO_CONSTANTS = {
  TOTAL_NUMBERS: 75,
  GRID_SIZE: 5,
  TOTAL_CELLS: 25,
  FREE_POSITION: [2, 2] as const,
  
  RANGES: {
    B: { min: 1, max: 15, letter: 'B' as const },
    I: { min: 16, max: 30, letter: 'I' as const },
    N: { min: 31, max: 45, letter: 'N' as const },
    G: { min: 46, max: 60, letter: 'G' as const },
    O: { min: 61, max: 75, letter: 'O' as const },
  },
  
  COLORS: {
    B: '#124723',  // Verde oscuro
    I: '#baa115',  // Dorado oscuro
    N: '#ffd402',  // Amarillo intenso
    G: '#68b258',  // Verde claro
    O: '#f8df7e',  // Dorado claro
  },
} as const;

export type LetraBingo = keyof typeof BINGO_CONSTANTS.RANGES;
