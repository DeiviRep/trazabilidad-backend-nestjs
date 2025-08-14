import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';


@Entity()
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  descripcion?: string;

  @OneToMany(() => Usuario, usuario => usuario.rol)
  usuarios: Usuario[];
}
