import { ICartonRepository } from '@/domain/interfaces/ICartonRepository';

export class EliminarCartonUseCase {
  constructor(private readonly cartonRepository: ICartonRepository) {}

  async execute(id: string): Promise<void> {
    const carton = await this.cartonRepository.getById(id);

    if (!carton) {
      throw new Error(`Cartón con ID ${id} no encontrado`);
    }

    await this.cartonRepository.delete(id);
  }
}
