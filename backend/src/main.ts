import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { setupCors } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuraciones
  setupCors(app);
  setupSwagger(app);
  
  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // Puerto dinámico para Cloud Run
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 PropFinder API running on http://0.0.0.0:${port}`);
  console.log(`📖 API Documentation: http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
