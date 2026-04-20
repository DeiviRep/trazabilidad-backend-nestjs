import { IsString, IsInt, IsObject, Min } from 'class-validator';

export class ActualizarCampoEventoDto {
  @IsString()
  productoId: string;

  @IsInt()
  @Min(0)
  indexEvento: number;

  @IsObject()
  campos: Record<string, any>;
}