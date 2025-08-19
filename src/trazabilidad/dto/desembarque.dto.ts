import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsOptional, IsArray } from "class-validator";

export class DesembarqueDto {
  @IsString()
  @IsNotEmpty()
  id: string; // id del dispositivo

  @IsString()
  @IsNotEmpty()
  puertoExtranjero: string;

  @IsString()
  @IsNotEmpty()
  integridad: string; // Ej: "OK", "DAÑADO", "FALTANTE"

  @IsOptional()
  @IsString()
  descripcionIntegridad?: string;

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

export class DesembarqueLoteDto {
  dispositivos: DesembarqueDto[];
}
