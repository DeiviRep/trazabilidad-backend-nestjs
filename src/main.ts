import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    // origin: 'http://localhost:3001', // Permitir solo el frontend en localhost:3000
    origin: [
      'https://trazabilidad-frontend-heroui-be37at4ld-deivireps-projects.vercel.app',
      'https://trazabilidad-frontend-heroui.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
