import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Gift, AlertCircle } from "lucide-react";

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
          <p className="text-sm text-gray-600">Publicaciones usadas</p>
          <p className="text-lg font-semibold text-gray-900">
            {status.total_used}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Gratis usadas</p>
              <p className="font-medium">{status.free_used}/2</p>
            </div>
            <div>
              <p className="text-gray-600">Tipo de agente</p>
              <p className="font-medium">
                {status.is_new_agent ? "Nuevo" : "Establecido"}
              </p>
            </div>
          </div>

          {!status.can_use_free && status.is_new_agent && (
            <div className="mt-3 flex items-start space-x-2 text-xs text-amber-800 bg-amber-50 p-2 rounded">
              <AlertCircle className="h-3 w-3 mt-0.5" />
              <span>
                Has usado tus 2 publicaciones gratuitas. Considera un plan de
                pago.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
