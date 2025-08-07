"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("PropFinder API")
        .setDescription("API para la plataforma inmobiliaria PropFinder")
        .setVersion("1.0")
        .addTag("propfinder")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port, "0.0.0.0");
    console.log(`🚀 PropFinder API running on http://0.0.0.0:${port}`);
    console.log(`📖 API Documentation: http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map