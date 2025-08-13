import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOrigins: string[] = [];
  let index = 1;
  while (configService.get<string>(`CORS_ORIGIN_${index}`)) {
    allowedOrigins.push(configService.get<string>(`CORS_ORIGIN_${index}`)|| '');
    index++;
  }
  // Habilitar CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
