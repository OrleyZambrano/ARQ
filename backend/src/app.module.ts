import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PropertiesModule } from "./properties/properties.module";

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Módulos de la aplicación
    HealthModule,
    PropertiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
