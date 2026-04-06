import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DesembarqueDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  puntoControl: string;

  // Estado fisico de la mercancia (true = conforme)
  @IsOptional()
  @IsBoolean()
  integridad?: boolean;

  @IsOptional()
  @IsString()
  descripcionIntegridad?: string;

  // NUEVO: numero de documento DUS (Chile) o DTI (Peru)
  @IsOptional()
  @IsString()
  documentoTransito?: string;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;
}

export class DesembarqueLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesembarqueDto)
  dispositivos: DesembarqueDto[];
}