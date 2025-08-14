export class CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rolNombre?: string; // opcional al crear
}
