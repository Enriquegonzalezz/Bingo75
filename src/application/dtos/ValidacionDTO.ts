export interface ValidacionRequestDTO {
  numero_carton: number;
  patron: string;
}

export interface ValidacionResponseDTO {
  es_ganador: boolean;
  patron_ganador?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalles?: any;
  numeros_coincidentes: number[];
  numeros_faltantes: number[];
  tiempo_validacion_ms: number;
}
