import { supabase } from "../lib/supabase";

export interface PublicationService {
  checkEligibility: (userId: string) => Promise<{
    canUseFree: boolean;
    freePublicationsUsed: number;
  }>;
  useFreePublication: (userId: string, propertyId: string) => Promise<void>;
  getAgentStatus: (userId: string) => Promise<any>;
}

class PublicationServiceImpl implements PublicationService {
  async checkEligibility(userId: string) {
    // Verificar elegibilidad
    const { data: canUse } = await supabase.rpc("can_use_free_publication", {
      agent_uuid: userId,
    });

    // Obtener datos del agente
    const { data: agent } = await supabase
      .from("agents")
      .select("free_publications_used, is_new_agent, publicaciones_disponibles")
      .eq("id", userId)
      .single();

    return {
      canUseFree: canUse || false,
      freePublicationsUsed: agent?.free_publications_used || 0,
    };
  }

  async useFreePublication(userId: string, propertyId: string) {
    const { error } = await supabase.rpc("use_free_publication", {
      agent_uuid: userId,
      property_uuid: propertyId,
    });

    if (error) throw error;
  }

  async getAgentStatus(userId: string) {
    const { data } = await supabase.rpc("get_agent_status", {
      agent_uuid: userId,
    });

    return data && data.length > 0 ? data[0] : null;
  }
}

export const publicationService = new PublicationServiceImpl();
