import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Check API health status" })
  @ApiResponse({
    status: 200,
    description: "API is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        message: {
          type: "string",
          example: "PropFinder API is running correctly",
        },
        timestamp: { type: "string", example: "2024-01-20T10:00:00.000Z" },
        environment: { type: "string", example: "production" },
      },
    },
  })
  getHealth() {
    return {
      status: "ok",
      message: "PropFinder API is running correctly",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Check if API is ready to receive traffic" })
  @ApiResponse({
    status: 200,
    description: "API is ready",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ready" },
        checks: {
          type: "object",
          properties: {
            database: { type: "string", example: "connected" },
            memory: { type: "string", example: "ok" },
          },
        },
      },
    },
  })
  getReady() {
    return {
      status: "ready",
      checks: {
        database: "connected", // TODO: Implementar check real de Supabase
        memory: "ok",
      },
    };
  }
}
