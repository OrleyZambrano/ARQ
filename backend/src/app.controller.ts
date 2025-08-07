import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("app")
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: "API root endpoint" })
  @ApiResponse({
    status: 200,
    description: "API information",
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "PropFinder API" },
        version: { type: "string", example: "1.0.0" },
        description: { type: "string", example: "Real Estate Properties API" },
        endpoints: {
          type: "object",
          properties: {
            health: { type: "string", example: "/health" },
            properties: { type: "string", example: "/properties" },
            swagger: { type: "string", example: "/api" },
          },
        },
      },
    },
  })
  getRoot() {
    return {
      name: "PropFinder API",
      version: "1.0.0",
      description: "Real Estate Properties API",
      endpoints: {
        health: "/health",
        properties: "/properties",
        swagger: "/api",
      },
    };
  }
}
