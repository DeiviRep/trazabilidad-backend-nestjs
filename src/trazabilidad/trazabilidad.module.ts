import { Module } from '@nestjs/common';
import { TrazabilidadController } from './trazabilidad.controller';
import { TrazabilidadService } from './trazabilidad.service';
import { FabricModule } from '../fabric/fabric.module';

@Module({
  imports: [FabricModule],
  controllers: [TrazabilidadController],
  providers: [TrazabilidadService],
})
export class TrazabilidadModule {}