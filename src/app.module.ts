import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';

@Module({
  imports: [TrazabilidadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
