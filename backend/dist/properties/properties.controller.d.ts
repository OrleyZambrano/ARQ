import { PropertiesService, Property } from "./properties.service";
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(filters: {
        property_type?: string;
        transaction_type?: string;
        min_price?: string;
        max_price?: string;
        city?: string;
        bedrooms?: string;
    }): Promise<Property[]>;
    findOne(id: string): Promise<Property | null>;
}
