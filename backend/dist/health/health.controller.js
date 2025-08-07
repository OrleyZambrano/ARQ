"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let HealthController = class HealthController {
    getHealth() {
        return {
            status: "ok",
            message: "PropFinder API is running correctly",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        };
    }
    getReady() {
        return {
            status: "ready",
            checks: {
                database: "connected",
                memory: "ok",
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Check API health status" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)("ready"),
    (0, swagger_1.ApiOperation)({ summary: "Check if API is ready to receive traffic" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getReady", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)("health"),
    (0, common_1.Controller)("health")
], HealthController);
//# sourceMappingURL=health.controller.js.map