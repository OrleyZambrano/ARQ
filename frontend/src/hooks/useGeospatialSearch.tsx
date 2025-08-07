import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  transaction_type: "venta" | "alquiler";
  bedrooms?: number;
  bathrooms?: number;
  area_total?: number;
  area_constructed?: number;
  parking_spaces?: number;
  address: string;
  neighborhood?: string;
  city: string;
  province: string;
  country: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  features: any;
  images: string[];
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  distance?: number; // Distancia calculada en búsquedas geoespaciales
}

interface GeospatialFilters {
  property_type?: string;
  transaction_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  city?: string;
  // Filtros geoespaciales
  latitude?: number;
  longitude?: number;
  radius?: number; // en kilómetros
}

interface UseGeospatialSearchReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  totalFound: number;
  searchProperties: (filters: GeospatialFilters) => Promise<void>;
  clearSearch: () => void;
}

/**
 * Hook para búsqueda geoespacial de propiedades
 */
export const useGeospatialSearch = (): UseGeospatialSearchReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   */
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  /**
   * Busca propiedades con filtros geoespaciales
   */
  const searchProperties = useCallback(async (filters: GeospatialFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Construir query base
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      // Aplicar filtros tradicionales
      if (filters.property_type) {
        query = query.eq("property_type", filters.property_type);
      }
      if (filters.transaction_type) {
        query = query.eq("transaction_type", filters.transaction_type);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.min_price) {
        query = query.gte("price", filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte("price", filters.max_price);
      }
      if (filters.bedrooms) {
        query = query.eq("bedrooms", filters.bedrooms);
      }

      // Ejecutar consulta
      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      let filteredProperties = data || [];

      // Aplicar filtro geoespacial si se especifica ubicación
      if (filters.latitude && filters.longitude && filters.radius) {
        filteredProperties = filteredProperties
          .map(property => {
            // Solo incluir propiedades que tienen coordenadas
            if (!property.latitude || !property.longitude) {
              return null;
            }

            const distance = calculateDistance(
              filters.latitude!,
              filters.longitude!,
              property.latitude,
              property.longitude
            );

            // Solo incluir si está dentro del radio
            if (distance <= filters.radius!) {
              return {
                ...property,
                distance: distance
              };
            }

            return null;
          })
          .filter((property): property is Property => property !== null)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Ordenar por distancia
      }

      setProperties(filteredProperties);
      setTotalFound(filteredProperties.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda';
      setError(errorMessage);
      console.error('Error searching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateDistance]);

  /**
   * Limpia los resultados de búsqueda
   */
  const clearSearch = useCallback(() => {
    setProperties([]);
    setTotalFound(0);
    setError(null);
  }, []);

  return {
    properties,
    loading,
    error,
    totalFound,
    searchProperties,
    clearSearch
  };
};
