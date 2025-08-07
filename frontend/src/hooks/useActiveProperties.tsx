import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Property {
  id: string;
  agent_id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  property_type: string;
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
  status: string;
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

export function useActiveProperties(agentId: string | undefined) {
  const [activeProperties, setActiveProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    loadActiveProperties();
  }, [agentId]);

  const loadActiveProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("properties")
        .select("*")
        .eq("agent_id", agentId)
        .eq("status", "active")
        .order("published_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setActiveProperties(data || []);
    } catch (err) {
      console.error("Error loading active properties:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveProperties = () => {
    if (agentId) {
      loadActiveProperties();
    }
  };

  return {
    activeProperties,
    activePropertiesCount: activeProperties.length,
    loading,
    error,
    refreshActiveProperties,
  };
}
