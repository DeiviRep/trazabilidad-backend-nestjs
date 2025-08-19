import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Usuario } from "./usuario.entity"

@Entity("roles")
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column("simple-array", { nullable: true })
  permisos: string[];

  @OneToMany(
    () => Usuario,
    (usuario) => usuario.rol,
  )
  usuarios: Usuario[]
}
