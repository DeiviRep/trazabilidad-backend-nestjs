import { Module } from '@nestjs/common';
import { TrazabilidadController } from './trazabilidad.controller';
import { TrazabilidadService } from './trazabilidad.service';
import { FabricModule } from '../fabric/fabric.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Module({
  imports: [FabricModule, UsuariosModule],
  controllers: [TrazabilidadController],
  providers: [TrazabilidadService, RolesGuard],
})
export class TrazabilidadModule {}