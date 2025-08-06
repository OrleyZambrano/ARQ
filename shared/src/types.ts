// Tipos compartidos para PropFinder

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
  owner_id?: string;
  agent_id?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: "buyer" | "seller" | "agent" | "admin";
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  profile_picture?: string;
}

export interface PropertyFilters {
  property_type?: string;
  transaction_type?: string;
  min_price?: number;
  max_price?: number;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
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
