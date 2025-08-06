import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para desarrollo
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  });

  // Pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("PropFinder API")
    .setDescription("API para la plataforma inmobiliaria PropFinder")
    .setVersion("1.0")
    .addTag("propfinder")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Puerto dinámico para Cloud Run
  const port = process.env.PORT || 3000;

  await app.listen(port, "0.0.0.0");

  console.log(`🚀 PropFinder API running on http://0.0.0.0:${port}`);
  console.log(`📖 API Documentation: http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
