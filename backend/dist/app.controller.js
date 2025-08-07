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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let AppController = class AppController {
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
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "API root endpoint" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)("app"),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map