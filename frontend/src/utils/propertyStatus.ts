import { supabase } from "../lib/supabase";

export type PropertyStatus =
  | "draft" // Borrador - no visible publicamente
  | "active" // Activa - visible publicamente
  | "paused" // Pausada por el agente
  | "expired" // Expirada por tiempo
  | "sold" // Vendida/Alquilada
  | "under_review" // En revisión por admin
  | "rejected"; // Rechazada por admin

export interface PropertyStatusUpdate {
  id: string;
  status: PropertyStatus;
  reason?: string;
  notes?: string;
  updated_by: string;
}

export interface PropertyStatusHistory {
  id: string;
  property_id: string;
  old_status: PropertyStatus;
  new_status: PropertyStatus;
  reason?: string;
  notes?: string;
  updated_by: string;
  updated_at: string;
}

export class PropertyStatusManager {
  private static instance: PropertyStatusManager;

  static getInstance(): PropertyStatusManager {
    if (!PropertyStatusManager.instance) {
      PropertyStatusManager.instance = new PropertyStatusManager();
    }
    return PropertyStatusManager.instance;
  }

  /**
   * Actualiza el estado de una propiedad con validaciones
   */
  async updatePropertyStatus(
    propertyId: string,
    newStatus: PropertyStatus,
    reason?: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener estado actual
      const { data: property, error: fetchError } = await supabase
        .from("properties")
        .select("status, agent_id")
        .eq("id", propertyId)
        .single();

      if (fetchError || !property) {
        return { success: false, message: "Propiedad no encontrada" };
      }

      // Verificar permisos
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // Validar transiciones permitidas
      const isValidTransition = await this.validateStatusTransition(
        propertyId,
        newStatus
      );
      if (!isValidTransition.valid) {
        return { success: false, message: isValidTransition.message };
      }

      // Actualizar el estado
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          status: newStatus,
          status_updated_at: new Date().toISOString(),
          ...(newStatus === "expired" && {
            expires_at: new Date().toISOString(),
          }),
          ...(newStatus === "sold" && { sold_at: new Date().toISOString() }),
        })
        .eq("id", propertyId);

      if (updateError) {
        return { success: false, message: "Error actualizando estado" };
      }

      // Registrar en historial
      await this.recordStatusChange(
        propertyId,
        property.status,
        newStatus,
        reason,
        notes,
        user.id
      );

      return { success: true, message: "Estado actualizado correctamente" };
    } catch (error) {
      console.error("Error updating property status:", error);
      return { success: false, message: "Error interno del servidor" };
    }
  }

  /**
   * Obtiene el estado actual de una propiedad
   */
  async getCurrentStatus(propertyId: string): Promise<PropertyStatus | null> {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("status")
        .eq("id", propertyId)
        .single();

      if (error || !data) return null;
      return data.status as PropertyStatus;
    } catch (err) {
      console.error("Error getting current status:", err);
      return null;
    }
  }

  /**
   * Obtiene las transiciones válidas para una propiedad
   */
  async getValidTransitions(propertyId: string): Promise<PropertyStatus[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data: property, error } = await supabase
        .from("properties")
        .select("status, agent_id")
        .eq("id", propertyId)
        .single();

      if (error || !property) return [];

      const isOwner = user.user.id === property.agent_id;
      const currentStatus = property.status as PropertyStatus;

      // Obtener transiciones válidas según el rol
      if (isOwner) {
        const agentTransitions: Record<PropertyStatus, PropertyStatus[]> = {
          draft: ["active", "under_review"],
          active: ["paused", "sold"],
          paused: ["active"],
          under_review: [],
          rejected: ["draft"],
          sold: [],
          expired: ["draft", "active"],
        };
        return agentTransitions[currentStatus] || [];
      } else {
        // Usuario regular - solo puede ver, no cambiar estados
        return [];
      }
    } catch (err) {
      console.error("Error getting valid transitions:", err);
      return [];
    }
  }

  /**
   * Valida una transición de estado específica
   */
  async validateStatusTransition(
    propertyId: string,
    newStatus: PropertyStatus
  ): Promise<{ valid: boolean; message: string }> {
    try {
      const validTransitions = await this.getValidTransitions(propertyId);
      
      if (validTransitions.includes(newStatus)) {
        return { valid: true, message: "Transición válida" };
      } else {
        return { valid: false, message: "Transición no permitida" };
      }
    } catch (err) {
      console.error("Error validating transition:", err);
      return { valid: false, message: "Error validando transición" };
    }
  }

  /**
   * Registra un cambio de estado en el historial
   */
  private async recordStatusChange(
    propertyId: string,
    oldStatus: PropertyStatus,
    newStatus: PropertyStatus,
    reason?: string,
    notes?: string,
    userId?: string
  ): Promise<void> {
    try {
      await supabase.from("property_status_history").insert({
        property_id: propertyId,
        old_status: oldStatus,
        new_status: newStatus,
        reason: reason || null,
        notes: notes || null,
        updated_by: userId,
      });
    } catch (error) {
      console.error("Error recording status change:", error);
    }
  }

  /**
   * Obtiene el historial de estados de una propiedad
   */
  async getStatusHistory(propertyId: string): Promise<PropertyStatusHistory[]> {
    try {
      const { data } = await supabase
        .from("property_status_history")
        .select(
          `
          *,
          user_profiles!updated_by(full_name, email)
        `
        )
        .eq("property_id", propertyId)
        .order("updated_at", { ascending: false });

      return data || [];
    } catch (err) {
      console.error("Error fetching status history:", err);
      return [];
    }
  }

  /**
   * Obtiene propiedades por estado para el agente actual
   */
  async getPropertiesByStatus(status: PropertyStatus): Promise<any[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("properties")
        .select(
          `
          *,
          property_images(storage_path, is_primary),
          property_analytics(total_views, contacts_initiated)
        `
        )
        .eq("agent_id", user.id)
        .eq("status", status)
        .order("updated_at", { ascending: false });

      return data || [];
    } catch (err) {
      console.error("Error fetching properties by status:", err);
      return [];
    }
  }

  /**
   * Auto-expira propiedades que han pasado su fecha de expiración
   */
  async autoExpireProperties(): Promise<void> {
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("properties")
        .update({ status: "expired" })
        .eq("status", "active")
        .lt("expires_at", now);

      if (error) {
        console.error("Error auto-expiring properties:", error);
      }
    } catch (error) {
      console.error("Error in auto-expire process:", error);
    }
  }

  /**
   * Obtiene estadísticas de estados para el dashboard
   */
  async getStatusStats(): Promise<Record<PropertyStatus, number>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return {} as Record<PropertyStatus, number>;

      const { data, error } = await supabase
        .from("properties")
        .select("status")
        .eq("agent_id", user.id);

      if (error || !data) return {} as Record<PropertyStatus, number>;

      const stats: Record<PropertyStatus, number> = {
        draft: 0,
        active: 0,
        paused: 0,
        expired: 0,
        sold: 0,
        under_review: 0,
        rejected: 0,
      };

      data.forEach((property) => {
        stats[property.status as PropertyStatus]++;
      });

      return stats;
    } catch (error) {
      console.error("Error fetching status stats:", error);
      return {} as Record<PropertyStatus, number>;
    }
  }
}

// Hook para React
export function usePropertyStatus() {
  const manager = PropertyStatusManager.getInstance();

  return {
    updateStatus: manager.updatePropertyStatus.bind(manager),
    getHistory: manager.getStatusHistory.bind(manager),
    getByStatus: manager.getPropertiesByStatus.bind(manager),
    getStats: manager.getStatusStats.bind(manager),
    autoExpire: manager.autoExpireProperties.bind(manager),
  };
}

export default PropertyStatusManager;
