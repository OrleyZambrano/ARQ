import { supabase } from "../lib/supabase";

interface TrackingSession {
  sessionId: string;
  propertyId: string;
  userId?: string;
  startTime: number;
  isAgentView: boolean;
  hasTrackedView: boolean;
  hasTrackedContact: boolean;
}

class PropertyTracker {
  private static instance: PropertyTracker;
  private sessions: Map<string, TrackingSession> = new Map();

  static getInstance(): PropertyTracker {
    if (!PropertyTracker.instance) {
      PropertyTracker.instance = new PropertyTracker();
    }
    return PropertyTracker.instance;
  }

  /**
   * Inicia el tracking de una propiedad con lógica inteligente
   */
  async startTracking(
    propertyId: string,
    source: string = "direct"
  ): Promise<string> {
    const sessionId = crypto.randomUUID();

    // Obtener información del usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verificar si es el agente propietario de la propiedad
    const isAgentView = await this.checkIfAgentView(propertyId, user?.id);

    const session: TrackingSession = {
      sessionId,
      propertyId,
      userId: user?.id,
      startTime: Date.now(),
      isAgentView,
      hasTrackedView: false,
      hasTrackedContact: false,
    };

    this.sessions.set(sessionId, session);

    // Solo trackear vista si NO es el agente propietario
    if (!isAgentView) {
      await this.trackView(sessionId, source);
    }

    return sessionId;
  }

  /**
   * Verifica si el usuario actual es el agente propietario de la propiedad
   */
  private async checkIfAgentView(
    propertyId: string,
    userId?: string
  ): Promise<boolean> {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from("properties")
        .select("agent_id")
        .eq("id", propertyId)
        .single();

      if (error || !data) return false;

      return data.agent_id === userId;
    } catch {
      return false;
    }
  }

  /**
   * Trackea una vista ÚNICA por sesión
   */
  private async trackView(sessionId: string, source: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.hasTrackedView || session.isAgentView) return;

    try {
      // Verificar si ya existe una vista de este usuario/IP para esta propiedad HOY
      const today = new Date().toISOString().split("T")[0];

      const { data: existingView } = await supabase
        .from("tracking_events")
        .select("id")
        .eq("property_id", session.propertyId)
        .eq("event_type", "view")
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`);

      // Solo contar como vista única si no hay vista previa hoy
      const isUniqueView = !existingView || existingView.length === 0;

      await supabase.from("tracking_events").insert({
        property_id: session.propertyId,
        user_id: session.userId || null,
        session_id: sessionId,
        event_type: "view",
        source: source,
        user_agent: navigator.userAgent,
        ip_address: null, // Se obtiene en el servidor
        is_unique_view: isUniqueView,
        additional_data: {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          timestamp: Date.now(),
        },
      });

      session.hasTrackedView = true;
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  }

  /**
   * Trackea contacto con agente (solo UNA VEZ por sesión)
   */
  async trackContact(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.hasTrackedContact || session.isAgentView) return;

    try {
      await supabase.from("tracking_events").insert({
        property_id: session.propertyId,
        user_id: session.userId || null,
        session_id: sessionId,
        event_type: "contact",
        source: "property_detail",
        user_agent: navigator.userAgent,
        additional_data: {
          contact_method: "chat",
          timestamp: Date.now(),
        },
      });

      session.hasTrackedContact = true;
    } catch (error) {
      console.error("Error tracking contact:", error);
    }
  }

  /**
   * Trackea otras acciones específicas
   */
  async trackAction(
    sessionId: string,
    action: string,
    data?: any
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.isAgentView) return;

    try {
      await supabase.from("tracking_events").insert({
        property_id: session.propertyId,
        user_id: session.userId || null,
        session_id: sessionId,
        event_type: action,
        source: "property_detail",
        user_agent: navigator.userAgent,
        additional_data: {
          ...data,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error(`Error tracking action ${action}:`, error);
    }
  }

  /**
   * Finaliza la sesión y trackea tiempo total
   */
  async endTracking(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.isAgentView) return;

    const timeSpent = Math.floor((Date.now() - session.startTime) / 1000);

    // Solo trackear si estuvo más de 10 segundos (vista válida)
    if (timeSpent >= 10) {
      try {
        await supabase.from("tracking_events").insert({
          property_id: session.propertyId,
          user_id: session.userId || null,
          session_id: sessionId,
          event_type: "exit",
          source: "property_detail",
          user_agent: navigator.userAgent,
          duration: timeSpent,
          additional_data: {
            valid_session: true,
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error("Error tracking exit:", error);
      }
    }

    this.sessions.delete(sessionId);
  }

  /**
   * Limpia sesiones antiguas (llama periódicamente)
   */
  cleanupOldSessions(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Hook para usar en componentes React
export function usePropertyTracking(
  propertyId: string,
  source: string = "direct"
) {
  const tracker = PropertyTracker.getInstance();
  let sessionId: string | null = null;

  const startTracking = async () => {
    sessionId = await tracker.startTracking(propertyId, source);
    return sessionId;
  };

  const trackContact = async () => {
    if (sessionId) {
      await tracker.trackContact(sessionId);
    }
  };

  const trackAction = async (action: string, data?: any) => {
    if (sessionId) {
      await tracker.trackAction(sessionId, action, data);
    }
  };

  const endTracking = async () => {
    if (sessionId) {
      await tracker.endTracking(sessionId);
      sessionId = null;
    }
  };

  return {
    startTracking,
    trackContact,
    trackAction,
    endTracking,
  };
}

export default PropertyTracker;
