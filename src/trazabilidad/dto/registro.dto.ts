import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsOptional, IsArray, IsUUID, ValidateIf, isUUID } from "class-validator";

export class RegistroDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  puntoControl: string;

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
  // @IsUUID()
  uuidLote?: string; // si no se manda, backend genera uno
}

export class RegistroLoteDto {
  // @IsUUID()
  @IsOptional()
  uuidLote?: string;

  @IsArray()
  dispositivos: Omit<RegistroDto, "uuidLote">[];
}
