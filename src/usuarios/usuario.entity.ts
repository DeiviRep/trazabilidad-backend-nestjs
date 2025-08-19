import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Rol } from "./rol.entity"

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  organizacion: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @ManyToOne(
    () => Rol,
    (rol) => rol.usuarios,
    { eager: true },
  )
  @JoinColumn({ name: "rolId" })
  rol?: Rol | null;
}