import { Injectable } from "@nestjs/common";

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
}

@Injectable()
export class PropertiesService {
  // Datos de ejemplo para desarrollo
  private mockProperties: Property[] = [
    {
      id: "1",
      title: "Moderno Apartamento en Centro",
      description:
        "Hermoso apartamento de 2 habitaciones en el corazón de la ciudad, completamente amueblado con acabados de lujo.",
      price: 250000,
      property_type: "apartment",
      transaction_type: "sale",
      location: {
        address: "Av. Principal 123",
        city: "Ciudad de México",
        state: "CDMX",
        country: "México",
        coordinates: {
          lat: 19.4326,
          lng: -99.1332,
        },
      },
      features: {
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        parking_spaces: 1,
      },
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800",
      ],
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Casa Familiar con Jardín",
      description:
        "Espaciosa casa de 3 habitaciones con amplio jardín, perfecta para familias.",
      price: 450000,
      property_type: "house",
      transaction_type: "sale",
      location: {
        address: "Calle Las Flores 456",
        city: "Guadalajara",
        state: "Jalisco",
        country: "México",
        coordinates: {
          lat: 20.6597,
          lng: -103.3496,
        },
      },
      features: {
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        parking_spaces: 2,
      },
      images: [
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800",
      ],
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  async findAll(): Promise<Property[]> {
    // TODO: Implementar conexión con Supabase
    return this.mockProperties;
  }

  async findOne(id: string): Promise<Property | null> {
    // TODO: Implementar conexión con Supabase
    const property = this.mockProperties.find((p) => p.id === id);
    return property || null;
  }

  async findByFilters(filters: {
    property_type?: string;
    transaction_type?: string;
    min_price?: number;
    max_price?: number;
    city?: string;
    bedrooms?: number;
  }): Promise<Property[]> {
    // TODO: Implementar conexión con Supabase y filtros reales
    let filtered = this.mockProperties;

    if (filters.property_type) {
      filtered = filtered.filter(
        (p) => p.property_type === filters.property_type
      );
    }

    if (filters.transaction_type) {
      filtered = filtered.filter(
        (p) => p.transaction_type === filters.transaction_type
      );
    }

    if (filters.min_price) {
      filtered = filtered.filter((p) => p.price >= filters.min_price);
    }

    if (filters.max_price) {
      filtered = filtered.filter((p) => p.price <= filters.max_price);
    }

    if (filters.city) {
      filtered = filtered.filter((p) =>
        p.location.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(
        (p) => p.features.bedrooms === filters.bedrooms
      );
    }

    return filtered;
  }
}
