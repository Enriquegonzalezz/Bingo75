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
      fecha_creacion: carton.fecha_creacion.toISOString(),
      activo: carton.activo,
    };
  }

  static toDomain(dto: CartonDTO): Carton {
    return Carton.fromJSON({
      id: dto.id,
      serial: dto.serial,
      numero_carton: dto.numero_carton,
      numeros: dto.numeros,
      matriz: dto.matriz,
      fecha_creacion: dto.fecha_creacion,
      activo: dto.activo,
    });
  }

  static toDTOList(cartones: Carton[]): CartonDTO[] {
    return cartones.map((c) => this.toDTO(c));
  }

  static toDomainList(dtos: CartonDTO[]): Carton[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
