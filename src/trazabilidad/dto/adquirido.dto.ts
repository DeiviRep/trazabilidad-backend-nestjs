// src/trazabilidad/dto/adquirido.dto.ts
import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsOptional, IsArray } from "class-validator";

export class AdquiridoDto {
  @IsString()
  @IsNotEmpty()
  id: string; // id del dispositivo

  @IsString()
  @IsNotEmpty()
  tienda: string;

  @IsString()
  @IsNotEmpty()
  fechaCompra: string; // formato ISO: "2025-08-19T12:00:00Z"

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

export class AdquiridoLoteDto {
  dispositivos: AdquiridoDto[];
}
