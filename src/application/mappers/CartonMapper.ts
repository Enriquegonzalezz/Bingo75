import { Carton } from '@/domain/entities/Carton';
import { CartonDTO } from '../dtos/CartonDTO';

export class CartonMapper {
  static toDTO(carton: Carton): CartonDTO {
    return {
      id: carton.id,
      serial: carton.serial,
      numero_carton: carton.numero_carton,
      numeros: carton.numeros,
      matriz: carton.matriz,
    };
  }

  static toDTOList(cartones: Carton[]): CartonDTO[] {
    return cartones.map((carton) => this.toDTO(carton));
  }

  static toEntity(dto: CartonDTO): Carton {
    return new Carton({
      id: dto.id,
      serial: dto.serial,
      numero_carton: dto.numero_carton,
      numeros: dto.numeros,
      matriz: dto.matriz,
    });
  }

  static toEntityList(dtos: CartonDTO[]): Carton[] {
    return dtos.map((dto) => this.toEntity(dto));
  }
}
