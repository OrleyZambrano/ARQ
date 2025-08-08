import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_CONFIG } from './constants';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)
    .addTag(SWAGGER_CONFIG.tags[0])
    .addTag(SWAGGER_CONFIG.tags[1])
    .addTag(SWAGGER_CONFIG.tags[2])
    .addServer(SWAGGER_CONFIG.servers[0].url, SWAGGER_CONFIG.servers[0].description)
    .addServer(SWAGGER_CONFIG.servers[1].url, SWAGGER_CONFIG.servers[1].description)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
