export interface User {
    id: string;
    email: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    role: "buyer" | "agent" | "admin";
    created_at: string;
    updated_at: string;
}
export interface Agent {
    id: string;
    business_name?: string;
    license_number?: string;
    phone?: string;
    bio?: string;
    profile_image_url?: string;
    website_url?: string;
    social_media?: Record<string, string>;
    address?: string;
    approval_status: "pending" | "approved" | "rejected";
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    publicaciones_disponibles: number;
    total_publicaciones_usadas: number;
    commission_rate?: number;
    created_at: string;
    updated_at: string;
}
export interface Property {
    id: string;
    agent_id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    property_type: "casa" | "departamento" | "oficina" | "local_comercial" | "terreno" | "bodega" | "quinta" | "penthouse";
    transaction_type: "venta" | "alquiler";
    bedrooms?: number;
    bathrooms?: number;
    area_total?: number;
    area_constructed?: number;
    parking_spaces?: number;
    floor_number?: number;
    total_floors?: number;
    year_built?: number;
    address: string;
    neighborhood?: string;
    city: string;
    province: string;
    country: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    amenities: string[];
    features: Record<string, any>;
    images: string[];
    virtual_tour_url?: string;
    video_url?: string;
    status: "draft" | "published" | "sold" | "rented" | "suspended";
    is_featured: boolean;
    is_urgent: boolean;
    views_count: number;
    favorites_count: number;
    inquiries_count: number;
    whatsapp_clicks: number;
    phone_clicks: number;
    published_at?: string;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}
export interface PropertyView {
    id: string;
    property_id: string;
    viewer_ip?: string;
    viewer_user_agent?: string;
    referrer?: string;
    view_date: string;
    session_id?: string;
    time_spent_seconds: number;
}
export interface PropertyFavorite {
    id: string;
    property_id: string;
    user_id: string;
    created_at: string;
}
export interface PropertyInquiry {
    id: string;
    property_id: string;
    agent_id: string;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    inquiry_type: "general" | "visita" | "financiamiento" | "precio" | "disponibilidad";
    status: "new" | "contacted" | "interested" | "closed";
    agent_notes?: string;
    response_time_minutes?: number;
    contacted_at?: string;
    created_at: string;
}
export interface PropertyFilters {
    property_type?: string;
    transaction_type?: string;
    min_price?: number;
    max_price?: number;
    city?: string;
    province?: string;
    bedrooms?: number;
    bathrooms?: number;
    min_area?: number;
    max_area?: number;
    neighborhood?: string;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
