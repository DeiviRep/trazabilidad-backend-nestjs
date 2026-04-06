import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AdquiridoDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  puntoControl: string;

  // NUEVO: nombre de la tienda donde se adquirio el producto
  @IsOptional()
  @IsString()
  tienda?: string;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;
}

export class AdquiridoLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdquiridoDto)
  dispositivos: AdquiridoDto[];
}