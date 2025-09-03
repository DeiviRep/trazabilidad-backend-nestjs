// src/trazabilidad/dto/distribucion.dto.ts
import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsOptional, IsArray } from "class-validator";

export class DistribucionDto {
  @IsString()
  @IsNotEmpty()
  id: string; // id del dispositivo

  @IsString()
  @IsNotEmpty()
  comerciante: string;

  @IsOptional()
  @IsString()
  puntoControl: string;

  @IsLatitude()
  latitud: string;

  @IsLongitude()
  longitud: string;

  @IsOptional()
  @IsArray()
  documentosMeta?: any[];

  @IsOptional()
  documentosCodigo?: Record<string, any>;

  @IsOptional()
  @IsArray()
  documentosHash?: any[];
}

export class DistribucionLoteDto {
  dispositivos: DistribucionDto[];
}
