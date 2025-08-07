import { SupabaseService } from "../supabase/supabase.service";
export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    property_type: "apartment" | "house" | "commercial" | "land";
    transaction_type: "sale" | "rent";
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    features: {
        bedrooms?: number;
        bathrooms?: number;
        area?: number;
        parking_spaces?: number;
    };
    images: string[];
    status: "active" | "inactive" | "sold" | "rented";
    created_at: string;
    updated_at: string;
    agent?: {
        id: string;
        name: string;
        phone: string;
        email: string;
        company?: string;
        rating?: number;
    };
}
export declare class PropertiesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<Property[]>;
    findOne(id: string): Promise<Property | null>;
    findByFilters(filters: {
        property_type?: string;
        transaction_type?: string;
        min_price?: number;
        max_price?: number;
        city?: string;
        bedrooms?: number;
    }): Promise<Property[]>;
    private transformSupabaseProperties;
    private transformSupabaseProperty;
    private applyFilters;
    private getMockProperties;
}
