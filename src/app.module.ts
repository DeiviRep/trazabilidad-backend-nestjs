import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TrazabilidadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}