import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PropertiesService, Property } from "./properties.service";

@ApiTags("properties")
@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: "Get all properties with optional filters" })
  @ApiQuery({
    name: "property_type",
    required: false,
    enum: ["apartment", "house", "commercial", "land"],
  })
  @ApiQuery({
    name: "transaction_type",
    required: false,
    enum: ["sale", "rent"],
  })
  @ApiQuery({ name: "min_price", required: false, type: Number })
  @ApiQuery({ name: "max_price", required: false, type: Number })
  @ApiQuery({ name: "city", required: false, type: String })
  @ApiQuery({ name: "bedrooms", required: false, type: Number })
  @ApiResponse({
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
  })
  async findAll(
    @Query()
    filters: {
      property_type?: string;
      transaction_type?: string;
      min_price?: string;
      max_price?: string;
      city?: string;
      bedrooms?: string;
    }
  ): Promise<Property[]> {
    // Convertir strings de query params a números donde sea necesario
    const parsedFilters = {
      ...filters,
      min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
      max_price: filters.max_price ? parseFloat(filters.max_price) : undefined,
      bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
    };

    return this.propertiesService.findByFilters(parsedFilters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a property by ID" })
  @ApiParam({ name: "id", description: "Property ID" })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 404, description: "Property not found" })
  async findOne(@Param("id") id: string): Promise<Property | null> {
    return this.propertiesService.findOne(id);
  }
}
