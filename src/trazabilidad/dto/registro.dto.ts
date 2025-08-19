import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsOptional, IsArray, IsUUID } from "class-validator";

export class RegistroDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  imeiSerial: string;

  @IsString()
  @IsNotEmpty()
  origenPais: string;

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

  @IsOptional()
  @IsUUID()
  uuidLote?: string; // si no se manda, backend genera uno

  // @IsOptional()
  // @IsString()
  // urlLote?: string; // se genera en backend
}

export class RegistroLoteDto {
  @IsUUID()
  @IsNotEmpty()
  uuidLote: string;

  @IsArray()
  dispositivos: Omit<RegistroDto, "uuidLote">[];
}
