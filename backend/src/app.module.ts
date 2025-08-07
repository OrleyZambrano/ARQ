import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { HealthModule } from "./health/health.module";
import { PropertiesModule } from "./properties/properties.module";
import { SupabaseModule } from "./supabase/supabase.module";

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Módulos de la aplicación
    SupabaseModule,
    HealthModule,
    PropertiesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
