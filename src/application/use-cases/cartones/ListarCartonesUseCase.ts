import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';
import { CartonDTO } from '@/application/dtos/CartonDTO';
import { CartonMapper } from '@/application/mappers/CartonMapper';

export class ListarCartonesUseCase {
  constructor(private readonly cartonRepository: ICartonRepository) {}

  async execute(): Promise<CartonDTO[]> {
    const cartones = await this.cartonRepository.getAll();
    return CartonMapper.toDTOList(cartones);
  }
}
