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

export class DispositivoRegistroDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  marca: string;

  @IsNotEmpty()
  @IsString()
  modelo: string;

  @IsNotEmpty()
  @IsString()
  imeiSerial: string;

  // NUEVO: campo requerido por la tesis (País de Origen)
  @IsNotEmpty()
  @IsString()
  paisOrigen: string;

  @IsNotEmpty()
  @IsString()
  puntoControl: string;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;
}

export class RegistroDto extends DispositivoRegistroDto {
  @IsOptional()
  @IsString()
  uuidLote?: string;
}

export class RegistroLoteDto {
  @IsOptional()
  @IsString()
  uuidLote?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispositivoRegistroDto)
  dispositivos: DispositivoRegistroDto[];
}