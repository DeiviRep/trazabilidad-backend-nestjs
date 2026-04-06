import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from 'class-validator';
 
export class BaseUbicacionDto {
 
  @IsNotEmpty()
  @IsString()
  puntoControl: string;
 
  // Estos dos reemplazan validarCoords del chaincode
  @IsLatitude()
  latitud: string;
 
  @IsLongitude()
  longitud: string;
}