import { useState, useEffect } from "react";
import { Gift, Clock, Zap } from "lucide-react";
import { publicationService } from "../../services/publicationService";
import { authService } from "../../services/authService";

interface FreePublicationButtonProps {
  propertyId: string;
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
      const user = await authService.getCurrentUser();
      if (!user) return;

      const eligibility = await publicationService.checkEligibility(user.id);
      setCanUseFree(eligibility.canUseFree);
      setFreePublicationsUsed(eligibility.freePublicationsUsed);
    } catch (error) {
      console.error("Error checking free publication eligibility:", error);
    }
  };

  const handleFreePublication = async () => {
    if (!propertyId || loading) return;

    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error("No authenticated user");
      }

      await publicationService.useFreePublication(user.id, propertyId);

      // Actualizar el estado local
      await checkFreePublicationEligibility();

      if (onPublishSuccess) {
        onPublishSuccess();
      }

      alert("¡Propiedad publicada gratuitamente por 60 días!");
    } catch (error) {
      console.error("Error using free publication:", error);
      alert("Error al publicar la propiedad. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!canUseFree) {
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
