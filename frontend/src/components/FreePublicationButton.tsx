import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Gift, Clock, Zap, AlertCircle } from "lucide-react";

interface FreePublicationButtonProps {
  propertyId?: string;
  onPublishSuccess?: () => void;
  className?: string;
}

export function FreePublicationButton({
  propertyId,
  onPublishSuccess,
  className = "",
}: FreePublicationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [canUseFree, setCanUseFree] = useState(false);
  const [freePublicationsUsed, setFreePublicationsUsed] = useState(0);

  useEffect(() => {
    checkFreePublicationEligibility();
  }, []);

  const checkFreePublicationEligibility = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar elegibilidad
      const { data: canUse } = await supabase.rpc("can_use_free_publication", {
        agent_uuid: user.id,
      });

      // Obtener datos del agente
      const { data: agent } = await supabase
        .from("agents")
        .select(
          "free_publications_used, is_new_agent, publicaciones_disponibles"
        )
        .eq("id", user.id)
        .single();

      setCanUseFree(canUse || false);
      setFreePublicationsUsed(agent?.free_publications_used || 0);
    } catch (error) {
      console.error("Error checking free publication eligibility:", error);
    }
  };

  const handleFreePublication = async () => {
    if (!propertyId) {
      alert("No se ha especificado una propiedad para publicar");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Usar publicación gratis
      const { data: success, error } = await supabase.rpc(
        "use_free_publication",
        {
          agent_uuid: user.id,
          property_uuid: propertyId,
        }
      );

      if (error) throw error;

      if (success) {
        alert("¡Propiedad publicada gratis por 60 días!");
        await checkFreePublicationEligibility();
        onPublishSuccess?.();
      } else {
        alert(
          "No se pudo usar la publicación gratis. Verifica tu elegibilidad."
        );
      }
    } catch (error) {
      console.error("Error using free publication:", error);
      alert("Error al publicar gratis. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Si no puede usar publicaciones gratis, no mostrar el botón
  if (!canUseFree || freePublicationsUsed >= 2) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded-full p-2">
            <Gift className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-green-800">
              ¡Publicación Gratis Disponible!
            </h3>
            <p className="text-sm text-green-600">
              Te quedan {2 - freePublicationsUsed} publicaciones gratuitas
            </p>
          </div>
        </div>

        <button
          onClick={handleFreePublication}
          disabled={loading || !propertyId}
          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Publicando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Publicar Gratis (60 días)</span>
            </div>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center text-xs text-green-700">
        <Clock className="h-3 w-3 mr-1" />
        <span>Duración: 60 días • Solo para agentes nuevos</span>
      </div>
    </div>
  );
}

interface FreePublicationStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function FreePublicationStatus({
  showDetails = false,
  className = "",
}: FreePublicationStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgentStatus();
  }, []);

  const loadAgentStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.rpc("get_agent_status", {
        agent_uuid: user.id,
      });

      if (data && data.length > 0) {
        setStatus(data[0]);
      }
    } catch (error) {
      console.error("Error loading agent status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-gray-100 rounded-lg h-20 ${className}`}
      ></div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Estado de tu cuenta</h3>
        {status.can_use_free && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Gift className="h-3 w-3 mr-1" />
            Publicaciones gratis disponibles
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Créditos disponibles</p>
          <p className="text-lg font-semibold text-blue-600">
            {status.credits}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Publicaciones gratis usadas</p>
          <p className="text-lg font-semibold text-gray-900">
            {status.free_publications_used}/2
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total propiedades</p>
              <p className="font-medium">{status.total_properties}</p>
            </div>
            <div>
              <p className="text-gray-600">Total gastado</p>
              <p className="font-medium">${status.total_payments}</p>
            </div>
            <div>
              <p className="text-gray-600">Pagos realizados</p>
              <p className="font-medium">{status.total_payments_count || 0}</p>
            </div>
          </div>
        </div>
      )}

      {!status.can_use_free && status.is_new_agent && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              Ya usaste tus 2 publicaciones gratis. Compra créditos para seguir
              publicando.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
