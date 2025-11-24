import { CartonFactory } from '@/domain/factories/CartonFactory';
import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';
import { CartonDTO } from '@/application/dtos/CartonDTO';
import { CartonMapper } from '@/application/mappers/CartonMapper';

export interface GenerarLoteRequest {
  serial: string;
  cantidad: number;
  numero_inicio?: number;
}

export interface GenerarLoteResponse {
  cartones: CartonDTO[];
  total_generados: number;
  tiempo_generacion_ms: number;
}

export class GenerarLoteCartonesUseCase {
  constructor(
    private readonly cartonFactory: CartonFactory,
    private readonly cartonRepository: ICartonRepository
  ) {}

  async execute(request: GenerarLoteRequest): Promise<GenerarLoteResponse> {
    const inicio = performance.now();

    // Validaciones
    this.validarRequest(request);

    // Obtener el último número de cartón
    const ultimoNumero = await this.cartonRepository.getUltimoNumero();
    const numeroInicio = request.numero_inicio || ultimoNumero + 1;

    // Generar cartones usando el factory
    const cartones = this.cartonFactory.createBatch(
      {
        serial: request.serial,
        numero_carton: numeroInicio,
        numero_inicio: numeroInicio,
      },
      request.cantidad
    );

    // Guardar en el repositorio
    await this.cartonRepository.saveBatch(cartones);

    // Mapear a DTOs
    const cartonesDTO = CartonMapper.toDTOList(cartones);

    return {
      cartones: cartonesDTO,
      total_generados: cartones.length,
      tiempo_generacion_ms: performance.now() - inicio,
    };
  }

  private validarRequest(request: GenerarLoteRequest): void {
    if (request.cantidad < 1 || request.cantidad > 1000) {
      throw new Error('La cantidad debe estar entre 1 y 1000');
    }

    if (!request.serial || request.serial.trim() === '') {
      throw new Error('El serial es requerido');
    }

    if (request.numero_inicio !== undefined && request.numero_inicio < 1) {
      throw new Error('El número de inicio debe ser mayor a 0');
    }
  }
}
