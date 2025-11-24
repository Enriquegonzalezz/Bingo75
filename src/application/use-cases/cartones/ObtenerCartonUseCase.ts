import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';
import { CartonDTO } from '@/application/dtos/CartonDTO';
import { CartonMapper } from '@/application/mappers/CartonMapper';

export class ObtenerCartonUseCase {
  constructor(private readonly cartonRepository: ICartonRepository) {}

  async execute(numeroCarton: number): Promise<CartonDTO | null> {
    const carton = await this.cartonRepository.getByNumero(numeroCarton);

    if (!carton) {
      return null;
    }

    return CartonMapper.toDTO(carton);
  }
}
