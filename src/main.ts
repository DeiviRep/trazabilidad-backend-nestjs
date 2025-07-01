import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins: string[] = [];
  let index = 1;
  while (process.env[`CORS_ORIGIN_${index}`]) {
    allowedOrigins.push(process.env[`CORS_ORIGIN_${index}`] as string );
    index++;
  }
  console.log("CORSSSSSSSSSSSSSSS")
console.log(allowedOrigins);
  // Habilitar CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
