import { supabase } from "../lib/supabase";

export interface PropertyFilters {
  // Básicos
  search?: string;
  propertyType?: string;
  transactionType?: string;

  // Precio
  minPrice?: number;
  maxPrice?: number;

  // Ubicación
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
    radius?: number; // en kilómetros
  };

  // Características
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;

  // Features
  hasParking?: boolean;
  hasPool?: boolean;
  hasGarden?: boolean;
  hasSecurity?: boolean;
  hasElevator?: boolean;
  hasAirConditioning?: boolean;

  // Agente
  agentId?: string;
  isVerifiedAgent?: boolean;

  // Fechas
  publishedAfter?: string;
  publishedBefore?: string;

  // Ordenamiento
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "newest"
    | "oldest"
    | "popularity"
    | "relevance";

  // Paginación
  page?: number;
  limit?: number;

  // Estados (solo para agentes)
  status?: string[];

  // Filtros de analytics (solo para propietario)
  minViews?: number;
  maxViews?: number;
  minContacts?: number;
  maxContacts?: number;
}

export interface PropertySearchResult {
  properties: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  filters: PropertyFilters;
  appliedFilters: string[];
}

class PropertyFilterService {
  private static instance: PropertyFilterService;

  static getInstance(): PropertyFilterService {
    if (!PropertyFilterService.instance) {
      PropertyFilterService.instance = new PropertyFilterService();
    }
    return PropertyFilterService.instance;
  }

  /**
   * Busca propiedades con filtros avanzados
   */
  async searchProperties(
    filters: PropertyFilters
  ): Promise<PropertySearchResult> {
    try {
      // Construir query base
      let query = supabase.from("properties").select(
        `
          id,
          title,
          description,
          price,
          property_type,
          transaction_type,
          address,
          city,
          state,
          bedrooms,
          bathrooms,
          area,
          features,
          published_at,
          status,
          agent_id,
          user_profiles!agent_id(
            full_name,
            phone,
            email
          ),
          agents!agent_id(
            is_verified,
            rating
          ),
          property_images(
            storage_path,
            is_primary,
            display_order
          ),
          property_analytics(
            total_views,
            unique_views,
            contacts_initiated
          )
        `,
        { count: "exact" }
      );

      // Aplicar filtros
      query = this.applyFilters(query, filters);

      // Aplicar ordenamiento
      query = this.applySorting(query, filters.sortBy || "newest");

      // Aplicar paginación
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Ejecutar query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error searching properties:", error);
        return this.emptyResult(filters, page);
      }

      // Procesar resultados
      const processedProperties = this.processProperties(data || []);
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        properties: processedProperties,
        total,
        page,
        totalPages,
        hasMore: page < totalPages,
        filters,
        appliedFilters: this.getAppliedFilters(filters),
      };
    } catch (error) {
      console.error("Error in searchProperties:", error);
      return this.emptyResult(filters, filters.page || 1);
    }
  }

  /**
   * Aplica todos los filtros a la query
   */
  private applyFilters(query: any, filters: PropertyFilters): any {
    // Filtro de texto
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
      );
    }

    // Tipo de propiedad
    if (filters.propertyType) {
      query = query.eq("property_type", filters.propertyType);
    }

    // Tipo de transacción
    if (filters.transactionType) {
      query = query.eq("transaction_type", filters.transactionType);
    }

    // Rango de precios
    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // Ubicación
    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters.state) {
      query = query.ilike("state", `%${filters.state}%`);
    }

    // Habitaciones
    if (filters.minBedrooms !== undefined) {
      query = query.gte("bedrooms", filters.minBedrooms);
    }
    if (filters.maxBedrooms !== undefined) {
      query = query.lte("bedrooms", filters.maxBedrooms);
    }

    // Baños
    if (filters.minBathrooms !== undefined) {
      query = query.gte("bathrooms", filters.minBathrooms);
    }
    if (filters.maxBathrooms !== undefined) {
      query = query.lte("bathrooms", filters.maxBathrooms);
    }

    // Área
    if (filters.minArea !== undefined) {
      query = query.gte("area", filters.minArea);
    }
    if (filters.maxArea !== undefined) {
      query = query.lte("area", filters.maxArea);
    }

    // Features (usando JSONB)
    if (filters.hasParking !== undefined) {
      query = query.eq("features->>parking", filters.hasParking);
    }
    if (filters.hasPool !== undefined) {
      query = query.eq("features->>pool", filters.hasPool);
    }
    if (filters.hasGarden !== undefined) {
      query = query.eq("features->>garden", filters.hasGarden);
    }
    if (filters.hasSecurity !== undefined) {
      query = query.eq("features->>security", filters.hasSecurity);
    }
    if (filters.hasElevator !== undefined) {
      query = query.eq("features->>elevator", filters.hasElevator);
    }
    if (filters.hasAirConditioning !== undefined) {
      query = query.eq(
        "features->>air_conditioning",
        filters.hasAirConditioning
      );
    }

    // Agente específico
    if (filters.agentId) {
      query = query.eq("agent_id", filters.agentId);
    }

    // Solo agentes verificados
    if (filters.isVerifiedAgent) {
      query = query.eq("agents.is_verified", true);
    }

    // Fechas de publicación
    if (filters.publishedAfter) {
      query = query.gte("published_at", filters.publishedAfter);
    }
    if (filters.publishedBefore) {
      query = query.lte("published_at", filters.publishedBefore);
    }

    // Estados (para agentes viendo sus propiedades)
    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    } else {
      // Por defecto, solo mostrar propiedades activas en búsqueda pública
      query = query.eq("status", "active");
    }

    return query;
  }

  /**
   * Aplica ordenamiento a la query
   */
  private applySorting(query: any, sortBy: string): any {
    switch (sortBy) {
      case "price_asc":
        return query.order("price", { ascending: true });
      case "price_desc":
        return query.order("price", { ascending: false });
      case "newest":
        return query.order("published_at", { ascending: false });
      case "oldest":
        return query.order("published_at", { ascending: true });
      case "popularity":
        return query.order("property_analytics.total_views", {
          ascending: false,
          nullsFirst: false,
        });
      case "relevance":
      default:
        return query.order("published_at", { ascending: false });
    }
  }

  /**
   * Procesa las propiedades para incluir datos calculados
   */
  private processProperties(properties: any[]): any[] {
    return properties.map((property) => ({
      ...property,
      // Imagen principal
      primaryImage:
        property.property_images?.find((img: any) => img.is_primary)
          ?.storage_path ||
        property.property_images?.[0]?.storage_path ||
        null,
      // Total de imágenes
      totalImages: property.property_images?.length || 0,
      // Agente info
      agentName: property.user_profiles?.full_name || "Agente",
      agentPhone: property.user_profiles?.phone,
      agentEmail: property.user_profiles?.email,
      isVerifiedAgent: property.agents?.is_verified || false,
      agentRating: property.agents?.rating || 0,
      // Analytics
      totalViews: property.property_analytics?.total_views || 0,
      uniqueViews: property.property_analytics?.unique_views || 0,
      contacts: property.property_analytics?.contacts_initiated || 0,
      // Features booleanas para fácil acceso
      hasParking: property.features?.parking || false,
      hasPool: property.features?.pool || false,
      hasGarden: property.features?.garden || false,
      hasSecurity: property.features?.security || false,
      hasElevator: property.features?.elevator || false,
      hasAirConditioning: property.features?.air_conditioning || false,
    }));
  }

  /**
   * Retorna resultado vacío en caso de error
   */
  private emptyResult(
    filters: PropertyFilters,
    page: number
  ): PropertySearchResult {
    return {
      properties: [],
      total: 0,
      page,
      totalPages: 0,
      hasMore: false,
      filters,
      appliedFilters: this.getAppliedFilters(filters),
    };
  }

  /**
   * Obtiene lista de filtros aplicados para mostrar en UI
   */
  private getAppliedFilters(filters: PropertyFilters): string[] {
    const applied: string[] = [];

    if (filters.search) applied.push(`Búsqueda: "${filters.search}"`);
    if (filters.propertyType) applied.push(`Tipo: ${filters.propertyType}`);
    if (filters.transactionType)
      applied.push(`Transacción: ${filters.transactionType}`);
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = `${filters.minPrice || 0} - ${
        filters.maxPrice || "∞"
      }`;
      applied.push(`Precio: $${priceRange}`);
    }
    if (filters.city) applied.push(`Ciudad: ${filters.city}`);
    if (filters.minBedrooms)
      applied.push(`Min. habitaciones: ${filters.minBedrooms}`);
    if (filters.maxBedrooms)
      applied.push(`Max. habitaciones: ${filters.maxBedrooms}`);
    if (filters.hasParking) applied.push("Con estacionamiento");
    if (filters.hasPool) applied.push("Con piscina");
    if (filters.hasGarden) applied.push("Con jardín");
    if (filters.isVerifiedAgent) applied.push("Solo agentes verificados");

    return applied;
  }

  /**
   * Obtiene filtros sugeridos basados en búsquedas populares
   */
  async getSuggestedFilters(): Promise<{
    popularCities: string[];
    priceRanges: { label: string; min: number; max: number }[];
    popularFeatures: string[];
  }> {
    try {
      // Obtener ciudades más populares
      const { data: cities } = await supabase
        .from("properties")
        .select("city")
        .eq("status", "active")
        .not("city", "is", null);

      const cityCount = (cities || []).reduce((acc: any, { city }) => {
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {});

      const popularCities = Object.entries(cityCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([city]) => city);

      // Rangos de precio predefinidos
      const priceRanges = [
        { label: "Hasta $100,000", min: 0, max: 100000 },
        { label: "$100,000 - $200,000", min: 100000, max: 200000 },
        { label: "$200,000 - $300,000", min: 200000, max: 300000 },
        { label: "$300,000 - $500,000", min: 300000, max: 500000 },
        { label: "Más de $500,000", min: 500000, max: Infinity },
      ];

      // Features populares
      const popularFeatures = [
        "Estacionamiento",
        "Piscina",
        "Jardín",
        "Seguridad",
        "Elevador",
        "Aire acondicionado",
      ];

      return {
        popularCities,
        priceRanges,
        popularFeatures,
      };
    } catch (error) {
      console.error("Error getting suggested filters:", error);
      return {
        popularCities: [],
        priceRanges: [],
        popularFeatures: [],
      };
    }
  }
}

// Hook para React
export function usePropertyFilters() {
  const service = PropertyFilterService.getInstance();

  return {
    searchProperties: service.searchProperties.bind(service),
    getSuggestedFilters: service.getSuggestedFilters.bind(service),
  };
}

export default PropertyFilterService;
