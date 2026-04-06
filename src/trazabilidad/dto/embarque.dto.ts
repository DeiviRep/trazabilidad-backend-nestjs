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

export class EmbarqueDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  tipoTransporte: string;

  @IsNotEmpty()
  @IsString()
  nroContenedor: string;

  // NUEVO: Bill of Lading (maritimo) o Air Waybill (aereo)
  @IsOptional()
  @IsString()
  blAwb?: string;

  @IsNotEmpty()
  @IsString()
  puntoControl: string;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;
}

export class EmbarqueLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbarqueDto)
  dispositivos: EmbarqueDto[];
}