import { useState, useCallback } from 'react';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

interface ReverseGeocodingResult {
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

interface UseGeocodingReturn {
  loading: boolean;
  error: string | null;
  geocodeAddress: (address: string) => Promise<GeocodingResult | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<ReverseGeocodingResult | null>;
  getCurrentLocation: () => Promise<GeocodingResult | null>;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
}

/**
 * Hook para servicios de geocodificación usando Nominatim (OpenStreetMap)
 * Gratuito y sin necesidad de API keys
 */
export const useGeocoding = (): UseGeocodingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convierte una dirección en coordenadas geográficas
   */
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PropFinder/1.0 (Real Estate App)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error en el servicio de geocodificación');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
          city: result.address?.city || result.address?.town || result.address?.village,
          state: result.address?.state,
          country: result.address?.country
        };
      }
      
      throw new Error('No se encontraron resultados para la dirección');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Convierte coordenadas geográficas en una dirección
   */
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<ReverseGeocodingResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PropFinder/1.0 (Real Estate App)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error en el servicio de geocodificación inversa');
      }

      const data = await response.json();
      
      if (data) {
        return {
          address: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village,
          state: data.address?.state,
          country: data.address?.country
        };
      }
      
      throw new Error('No se pudo obtener la dirección');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene la ubicación actual del usuario
   */
  const getCurrentLocation = useCallback(async (): Promise<GeocodingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('La geolocalización no está soportada en este navegador');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Obtener dirección usando geocodificación inversa
      const addressResult = await reverseGeocode(latitude, longitude);
      
      return {
        latitude,
        longitude,
        address: addressResult?.address || `${latitude}, ${longitude}`,
        city: addressResult?.city,
        state: addressResult?.state,
        country: addressResult?.country
      };
    } catch (err) {
      let errorMessage = 'Error obteniendo ubicación';
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permisos de ubicación denegados';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case err.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado obteniendo ubicación';
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [reverseGeocode]);

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   * Retorna la distancia en kilómetros
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

  return {
    loading,
    error,
    geocodeAddress,
    reverseGeocode,
    getCurrentLocation,
    calculateDistance
  };
};
