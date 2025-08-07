import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Property } from "../../shared/src/types";

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
