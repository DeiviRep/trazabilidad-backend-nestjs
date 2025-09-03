import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsOptional, IsArray, IsBoolean } from "class-validator";

export class DesembarqueDto {
  @IsString()
  @IsNotEmpty()
  id: string; // id del dispositivo

  @IsString()
  @IsNotEmpty()
  puntoControl: string;

  @IsBoolean()
  integridad: boolean;

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
