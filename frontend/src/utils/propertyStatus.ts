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
      const isValidTransition = this.validateStatusTransition(
        property.status,
        newStatus,
        user.id,
        property.agent_id
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
   * Valida si una transición de estado es permitida
   */
  private validateStatusTransition(
    currentStatus: PropertyStatus,
    newStatus: PropertyStatus,
    userId: string,
    agentId: string
  ): { valid: boolean; message: string } {
    // Verificar si es el agente propietario
    const isOwner = userId === agentId;

    // Verificar si es admin (simplificado - en producción verificar rol)
    const isAdmin = false; // TODO: Implementar verificación de admin

    // Transiciones permitidas por agente propietario
    const agentTransitions: Record<PropertyStatus, PropertyStatus[]> = {
      draft: ["active", "under_review"],
      active: ["paused", "sold", "draft"],
      paused: ["active", "draft", "sold"],
      expired: ["active", "draft"],
      sold: ["active"], // Puede reactivar si fue error
      under_review: [], // Solo admin puede cambiar
      rejected: ["draft"], // Puede volver a borrador para corregir
    };

    // Transiciones permitidas por admin
    const adminTransitions: Record<PropertyStatus, PropertyStatus[]> = {
      draft: ["active", "under_review", "rejected"],
      active: ["paused", "sold", "under_review", "rejected"],
      paused: ["active", "under_review", "rejected"],
      expired: ["active", "rejected"],
      sold: ["active"],
      under_review: ["active", "rejected"],
      rejected: ["under_review", "active"],
    };

    let allowedTransitions: PropertyStatus[] = [];

    if (isAdmin) {
      allowedTransitions = adminTransitions[currentStatus] || [];
    } else if (isOwner) {
      allowedTransitions = agentTransitions[currentStatus] || [];
    }

    if (!allowedTransitions.includes(newStatus)) {
      return {
        valid: false,
        message: `No puedes cambiar de ${currentStatus} a ${newStatus}`,
      };
    }

    return { valid: true, message: "Transición válida" };
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
      const { data, error } = await supabase
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

      const { data, error } = await supabase
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
