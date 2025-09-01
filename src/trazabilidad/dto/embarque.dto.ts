import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsArray, IsOptional } from "class-validator";

export class EmbarqueDto {
  @IsString()
  @IsNotEmpty()
  id: string; // id del dispositivo

  @IsString()
  @IsNotEmpty()
  tipoTransporte: string;

  @IsString()
  @IsNotEmpty()
  nroContenedor: string;

  @IsString()
  @IsNotEmpty()
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

export class EmbarqueLoteDto {
  @IsArray()
  dispositivos: EmbarqueDto[];
}
