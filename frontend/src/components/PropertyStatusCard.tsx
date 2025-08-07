import { useState } from "react";
import { usePropertyStatus } from "../hooks/usePropertyStatus";
import {
  Pause,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";

interface PropertyStatusCardProps {
  propertyId: string;
  currentStatus: string;
  propertyTitle: string;
  onStatusUpdate?: () => void;
}

const statusConfig = {
  draft: {
    icon: Edit,
    color: "text-gray-600 bg-gray-100",
    label: "Borrador",
    description: "No visible para el público",
  },
  active: {
    icon: Eye,
    color: "text-green-600 bg-green-100",
    label: "Activa",
    description: "Visible y disponible",
  },
  paused: {
    icon: Pause,
    color: "text-yellow-600 bg-yellow-100",
    label: "Pausada",
    description: "Temporalmente oculta",
  },
  expired: {
    icon: Clock,
    color: "text-red-600 bg-red-100",
    label: "Expirada",
    description: "Tiempo de publicación agotado",
  },
  sold: {
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-100",
    label: "Vendida",
    description: "Transacción completada",
  },
  under_review: {
    icon: AlertCircle,
    color: "text-purple-600 bg-purple-100",
    label: "En Revisión",
    description: "Siendo evaluada por admin",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 bg-red-100",
    label: "Rechazada",
    description: "No cumple requisitos",
  },
};

export function PropertyStatusCard({
  propertyId,
  currentStatus,
  propertyTitle,
  onStatusUpdate,
}: PropertyStatusCardProps) {
  const { updateStatus, getHistory } = usePropertyStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const currentConfig =
    statusConfig[currentStatus as keyof typeof statusConfig];
  const IconComponent = currentConfig?.icon || Edit;

  // Acciones rápidas disponibles según el estado actual
  const getQuickActions = () => {
    switch (currentStatus) {
      case "draft":
        return [
          {
            status: "active",
            label: "Publicar",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            status: "under_review",
            label: "Enviar a Revisión",
            color: "bg-purple-600 hover:bg-purple-700",
          },
        ];
      case "active":
        return [
          {
            status: "paused",
            label: "Pausar",
            color: "bg-yellow-600 hover:bg-yellow-700",
          },
          {
            status: "sold",
            label: "Marcar Vendida",
            color: "bg-blue-600 hover:bg-blue-700",
          },
        ];
      case "paused":
        return [
          {
            status: "active",
            label: "Reactivar",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            status: "sold",
            label: "Marcar Vendida",
            color: "bg-blue-600 hover:bg-blue-700",
          },
        ];
      case "expired":
        return [
          {
            status: "active",
            label: "Renovar",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            status: "draft",
            label: "Volver a Borrador",
            color: "bg-gray-600 hover:bg-gray-700",
          },
        ];
      case "sold":
        return [
          {
            status: "active",
            label: "Reactivar",
            color: "bg-green-600 hover:bg-green-700",
          },
        ];
      case "rejected":
        return [
          {
            status: "draft",
            label: "Volver a Borrador",
            color: "bg-gray-600 hover:bg-gray-700",
          },
        ];
      default:
        return [];
    }
  };

  const handleQuickAction = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await updateStatus(
        propertyId,
        newStatus as any,
        "Acción rápida"
      );
      if (result.success) {
        onStatusUpdate?.();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al cambiar estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomChange = async () => {
    if (!selectedNewStatus) return;

    setIsUpdating(true);
    try {
      const result = await updateStatus(
        propertyId,
        selectedNewStatus as any,
        reason,
        notes
      );
      if (result.success) {
        setShowChangeModal(false);
        setSelectedNewStatus("");
        setReason("");
        setNotes("");
        onStatusUpdate?.();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al cambiar estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await getHistory(propertyId);
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const quickActions = getQuickActions();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              currentConfig?.color || "text-gray-600 bg-gray-100"
            }`}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {propertyTitle}
            </h3>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${currentConfig?.color}`}
              >
                {currentConfig?.label || "Estado Desconocido"}
              </span>
              <span className="text-sm text-gray-500">
                {currentConfig?.description}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleHistory}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            title="Ver historial"
          >
            <Clock className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowChangeModal(true)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            title="Cambio personalizado"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Acciones rápidas */}
      {quickActions.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            Acciones Rápidas:
          </h4>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.status}
                onClick={() => handleQuickAction(action.status)}
                disabled={isUpdating}
                className={`px-3 py-1 text-sm font-medium text-white rounded-md ${action.color} disabled:opacity-50`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      {showHistory && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Historial de Cambios:
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {history.length > 0 ? (
              history.map((record, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>
                      {
                        statusConfig[
                          record.old_status as keyof typeof statusConfig
                        ]?.label
                      }{" "}
                      →{" "}
                      {
                        statusConfig[
                          record.new_status as keyof typeof statusConfig
                        ]?.label
                      }
                    </span>
                    <span className="text-gray-500">
                      {new Date(record.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {record.reason && (
                    <div className="text-gray-600 mt-1">
                      Razón: {record.reason}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500">
                Sin historial disponible
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de cambio personalizado */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Cambiar Estado</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value)}
                  className="w-full border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar estado...</option>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón (opcional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Ej: Corrección de datos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowChangeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCustomChange}
                disabled={!selectedNewStatus || isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Actualizando..." : "Cambiar Estado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
