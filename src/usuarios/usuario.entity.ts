import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { nullable: true, eager: true })
  @JoinColumn({ name: 'rol_id' })
  rol?: Rol | null;
}
