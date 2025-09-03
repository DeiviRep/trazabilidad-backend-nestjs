import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  disableErrorMessages: false,
  exceptionFactory: (errors) => {
    return new BadRequestException(
      errors.map(err => ({
        field: err.property,
        errors: Object.values(err.constraints ?? {}),
      })),
    );
  },
}));

  
  const allowedOrigins: string[] = [];
  let index = 1;
  while (configService.get<string>(`CORS_ORIGIN_${index}`)) {
    allowedOrigins.push(configService.get<string>(`CORS_ORIGIN_${index}`)|| '');
    index++;
  }

  // Habilitar CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-User',
      'X-Role',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    credentials: true,
  });

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
