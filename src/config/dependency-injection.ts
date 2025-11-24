import { CartonFactory } from '@/domain/factories/CartonFactory';
import { LocalStorageCartonRepository } from '@/infrastructure/repositories/LocalStorageCartonRepository';
import { GenerarLoteCartonesUseCase } from '@/application/use-cases/cartones/GenerarLoteCartonesUseCase';
import { ObtenerCartonUseCase } from '@/application/use-cases/cartones/ObtenerCartonUseCase';
import { ListarCartonesUseCase } from '@/application/use-cases/cartones/ListarCartonesUseCase';
import { EliminarCartonUseCase } from '@/application/use-cases/cartones/EliminarCartonUseCase';

// Singleton instances
let cartonFactory: CartonFactory | null = null;
let cartonRepository: LocalStorageCartonRepository | null = null;
let generarLoteUseCase: GenerarLoteCartonesUseCase | null = null;
let obtenerCartonUseCase: ObtenerCartonUseCase | null = null;
let listarCartonesUseCase: ListarCartonesUseCase | null = null;
let eliminarCartonUseCase: EliminarCartonUseCase | null = null;

export function getCartonFactory(): CartonFactory {
  if (!cartonFactory) {
    cartonFactory = new CartonFactory();
  }
  return cartonFactory;
}

export function getCartonRepository(): LocalStorageCartonRepository {
  if (!cartonRepository) {
    cartonRepository = new LocalStorageCartonRepository();
  }
  return cartonRepository;
}

export function getGenerarLoteUseCase(): GenerarLoteCartonesUseCase {
  if (!generarLoteUseCase) {
    generarLoteUseCase = new GenerarLoteCartonesUseCase(getCartonFactory(), getCartonRepository());
  }
  return generarLoteUseCase;
}

export function getObtenerCartonUseCase(): ObtenerCartonUseCase {
  if (!obtenerCartonUseCase) {
    obtenerCartonUseCase = new ObtenerCartonUseCase(getCartonRepository());
  }
  return obtenerCartonUseCase;
}

export function getListarCartonesUseCase(): ListarCartonesUseCase {
  if (!listarCartonesUseCase) {
    listarCartonesUseCase = new ListarCartonesUseCase(getCartonRepository());
  }
  return listarCartonesUseCase;
}

export function getEliminarCartonUseCase(): EliminarCartonUseCase {
  if (!eliminarCartonUseCase) {
    eliminarCartonUseCase = new EliminarCartonUseCase(getCartonRepository());
  }
  return eliminarCartonUseCase;
}

// Reset para testing
export function resetDependencies(): void {
  cartonFactory = null;
  cartonRepository = null;
  generarLoteUseCase = null;
  obtenerCartonUseCase = null;
  listarCartonesUseCase = null;
  eliminarCartonUseCase = null;
}
