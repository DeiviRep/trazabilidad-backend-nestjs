// src/trazabilidad/dto/nacionalizacion.dto.ts
import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsNumber, IsOptional, IsArray } from "class-validator";

export class NacionalizacionDto {
  @IsString()
  @IsNotEmpty()
  id: string; // id del dispositivo

  @IsString()
  @IsNotEmpty()
  dim: string; // Declaración de Importación de Mercancías

  @IsNumber()
  valorCif: number;

  @IsNumber()
  arancel: number;

  @IsNumber()
  iva: number;

  @IsOptional()
  @IsNumber()
  ice?: number;

  @IsNumber()
  totalPagado: number;

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

export class NacionalizacionLoteDto {
  dispositivos: NacionalizacionDto[];
}
