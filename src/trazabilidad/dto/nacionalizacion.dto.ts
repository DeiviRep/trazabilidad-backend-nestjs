import { Type } from 'class-transformer';
import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NacionalizacionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  puntoControl: string;

  // Numero de Declaracion de Importacion de Mercaderia
  @IsNotEmpty()
  @IsString()
  dim: string;

  // NUEVO: Numero de Declaracion de Adquisicion de Mercancias
  @IsOptional()
  @IsString()
  dam?: string;

  @IsNumber()
  valorCIF: number;

  @IsNumber()
  totalPagado: number;

  @IsNumber()
  arancel: number;

  @IsNumber()
  iva: number;

  @IsOptional()
  @IsNumber()
  ice?: number;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;
}

export class NacionalizacionLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NacionalizacionDto)
  dispositivos: NacionalizacionDto[];
}