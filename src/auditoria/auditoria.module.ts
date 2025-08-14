import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './auditoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  exports: [TypeOrmModule],
})
export class AuditoriaModule {}
