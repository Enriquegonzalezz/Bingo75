export interface CartonDTO {
  id: string;
  serial: string;
  numero_carton: number;
  numeros: {
    B: number[];
    I: number[];
    N: number[];
    G: number[];
    O: number[];
  };
  matriz: number[][];
}
