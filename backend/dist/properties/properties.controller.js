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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const properties_service_1 = require("./properties.service");
let PropertiesController = class PropertiesController {
    constructor(propertiesService) {
        this.propertiesService = propertiesService;
    }
    async findAll(filters) {
        const parsedFilters = {
            ...filters,
            min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
            max_price: filters.max_price ? parseFloat(filters.max_price) : undefined,
            bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
        };
        return this.propertiesService.findByFilters(parsedFilters);
    }
    async findOne(id) {
        return this.propertiesService.findOne(id);
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all properties with optional filters" }),
    (0, swagger_1.ApiQuery)({
        name: "property_type",
        required: false,
        enum: ["apartment", "house", "commercial", "land"],
    }),
    (0, swagger_1.ApiQuery)({
        name: "transaction_type",
        required: false,
        enum: ["sale", "rent"],
    }),
    (0, swagger_1.ApiQuery)({ name: "min_price", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "max_price", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "city", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "bedrooms", required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of properties",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    property_type: {
                        type: "string",
                        enum: ["apartment", "house", "commercial", "land"],
                    },
                    transaction_type: { type: "string", enum: ["sale", "rent"] },
                    location: {
                        type: "object",
                        properties: {
                            address: { type: "string" },
                            city: { type: "string" },
                            state: { type: "string" },
                            country: { type: "string" },
                        },
                    },
                    features: {
                        type: "object",
                        properties: {
                            bedrooms: { type: "number" },
                            bathrooms: { type: "number" },
                            area: { type: "number" },
                            parking_spaces: { type: "number" },
                        },
                    },
                    status: {
                        type: "string",
                        enum: ["active", "inactive", "sold", "rented"],
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get a property by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Property ID" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Property found",
        schema: {
            type: "object",
            properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                property_type: { type: "string" },
                transaction_type: { type: "string" },
                location: { type: "object" },
                features: { type: "object" },
                images: { type: "array", items: { type: "string" } },
                status: { type: "string" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Property not found" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findOne", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, swagger_1.ApiTags)("properties"),
    (0, common_1.Controller)("properties"),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map