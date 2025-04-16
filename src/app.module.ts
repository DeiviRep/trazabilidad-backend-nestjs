import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TrazabilidadModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'qr-images'),
      serveRoot: '/trazabilidad/qr-image',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}