import { Injectable } from "@nestjs/common";
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

@Injectable()
export class PropertiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Property[]> {
    try {
      // Intentar obtener datos de Supabase
      const supabaseData = await this.supabaseService.getProperties();
      return this.transformSupabaseProperties(supabaseData);
    } catch (error) {
      console.warn("Supabase no disponible, usando datos mock:", error.message);
      // Fallback a datos mock si Supabase no está configurado
      return this.getMockProperties();
    }
  }

  async findOne(id: string): Promise<Property | null> {
    try {
      // Intentar obtener de Supabase
      const supabaseData = await this.supabaseService.getPropertyById(id);
      return this.transformSupabaseProperty(supabaseData);
    } catch (error) {
      console.warn("Supabase no disponible, usando datos mock:", error.message);
      // Fallback a datos mock
      const property = this.getMockProperties().find((p) => p.id === id);
      return property || null;
    }
  }

  async findByFilters(filters: {
    property_type?: string;
    transaction_type?: string;
    min_price?: number;
    max_price?: number;
    city?: string;
    bedrooms?: number;
  }): Promise<Property[]> {
    try {
      // TODO: Implementar filtros en Supabase
      const properties = await this.findAll();
      return this.applyFilters(properties, filters);
    } catch (error) {
      console.warn("Error en filtros, usando datos mock:", error.message);
      return this.applyFilters(this.getMockProperties(), filters);
    }
  }

  // Transformar datos de Supabase al formato esperado
  private transformSupabaseProperties(supabaseData: any[]): Property[] {
    return supabaseData.map((item) => this.transformSupabaseProperty(item));
  }

  private transformSupabaseProperty(item: any): Property {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      property_type: item.property_type,
      transaction_type: item.transaction_type,
      location: {
        address: item.address,
        city: item.city,
        state: item.state,
        country: item.country,
        coordinates:
          item.latitude && item.longitude
            ? {
                lat: item.latitude,
                lng: item.longitude,
              }
            : undefined,
      },
      features: {
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area_sqm,
        parking_spaces: item.parking_spaces,
      },
      images: item.property_images?.map((img: any) => img.url) || [],
      status: item.is_active ? "active" : "inactive",
      created_at: item.created_at,
      updated_at: item.updated_at,
      agent: item.agents
        ? {
            id: item.agents.id,
            name: item.agents.user_profiles?.full_name || "Agente",
            phone: item.agents.user_profiles?.phone || "",
            email: item.agents.user_profiles?.email || "",
            company: item.agents.company_name,
            rating: item.agents.rating,
          }
        : undefined,
    };
  }

  private applyFilters(properties: Property[], filters: any): Property[] {
    let filtered = properties;

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

  // Datos mock como fallback
  private getMockProperties(): Property[] {
    return [
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
        agent: {
          id: "agent-1",
          name: "María González",
          phone: "+57 300 123 4567",
          email: "maria@example.com",
          company: "Inmobiliaria Premier",
          rating: 4.8,
        },
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
        agent: {
          id: "agent-2",
          name: "Carlos Rodríguez",
          phone: "+57 301 987 6543",
          email: "carlos@example.com",
          company: "Bienes Raíces Elite",
          rating: 4.6,
        },
      },
      {
        id: "3",
        title: "Oficina Comercial Premium",
        description:
          "Espaciosa oficina en edificio corporativo de alta categoría. Ideal para empresas medianas con salas de juntas incluidas.",
        price: 2500,
        property_type: "commercial",
        transaction_type: "rent",
        location: {
          address: "Zona Rosa, Calle 82 #12-15",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          coordinates: {
            lat: 4.6667,
            lng: -74.0667,
          },
        },
        features: {
          area: 120,
          parking_spaces: 3,
        },
        images: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        ],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        agent: {
          id: "agent-1",
          name: "María González",
          phone: "+57 300 123 4567",
          email: "maria@example.com",
          company: "Inmobiliaria Premier",
          rating: 4.8,
        },
      },
    ];
  }
}
