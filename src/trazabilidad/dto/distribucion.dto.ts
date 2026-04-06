import { Type } from 'class-transformer';
import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DistribucionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  // Nombre del punto de venta / comerciante
  @IsNotEmpty()
  @IsString()
  comerciante: string;

  // NUEVO: responsable de recepcion en el punto de venta
  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsString()
  deposito?: string;

  @IsNotEmpty()
  @IsString()
  puntoControl: string;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;
}

export class DistribucionLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistribucionDto)
  dispositivos: DistribucionDto[];
}