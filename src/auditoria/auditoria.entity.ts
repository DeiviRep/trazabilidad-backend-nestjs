import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario: string;

  @Column()
  accion: string;

  @Column()
  entidad: string;

  @Column('jsonb', { nullable: true })
  detalle: any;

  @CreateDateColumn()
  fecha: Date;
}
