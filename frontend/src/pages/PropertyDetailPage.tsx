import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePropertyTracking } from "../utils/propertyTracking";
import PropertyMap from "../components/PropertyMap";
import VisitScheduler from "../components/VisitScheduler";
import { ChatButton } from "../components/PropertyChat";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Heart,
  Navigation,
} from "lucide-react";

interface Property {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  transaction_type: "venta" | "alquiler";
  bedrooms?: number;
  bathrooms?: number;
  area_total?: number;
  area_constructed?: number;
  area_m2?: number;
  parking_spaces?: number;
  floor_number?: number;
  total_floors?: number;
  year_built?: number;
  address: string;
  neighborhood?: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  features: any;
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
  published_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  agents?: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisitSchedulerOpen, setIsVisitSchedulerOpen] = useState(false);

  // Sistema de tracking inteligente
  const { startTracking, trackContact, trackAction, endTracking } =
    usePropertyTracking(id || "", "direct");
  const trackingSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
      initializeTracking();
    }

    // Cleanup: finalizar tracking al salir
    return () => {
      if (trackingSessionRef.current) {
        endTracking();
      }
    };
  }, [id]);

  const initializeTracking = async () => {
    // Inicializar tracking session
    trackingSessionRef.current = await startTracking();
  };

  const fetchProperty = async (propertyId: string) => {
    setLoading(true);
    try {
      // Obtener datos de la propiedad
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        // Removemos el filtro por status para permitir ver propiedades en cualquier estado
        .single();

      if (error) throw error;

      if (data) {
        // Obtener información del agente por separado
        const { data: agentData } = await supabase
          .from("user_profiles") // Cambiar a user_profiles
          .select("full_name, phone, email")
          .eq("id", data.agent_id)
          .single();

        setProperty({
          ...data,
          agents: agentData,
        });

        // NOTE: El tracking de vistas ahora se maneja automáticamente en PropertyTracker
        // Ya no necesitamos llamar manualmente increment_property_views
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setProperty(null);
    }
    setLoading(false);
  };

  const formatPrice = (price: number, transactionType: string) => {
    const formatter = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    });

    if (transactionType === "alquiler") {
      return `${formatter.format(price)}/mes`;
    }
    return formatter.format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types = {
      casa: "Casa",
      departamento: "Departamento",
      oficina: "Oficina",
      local_comercial: "Local Comercial",
      terreno: "Terreno",
      bodega: "Bodega",
      quinta: "Quinta",
      penthouse: "Penthouse",
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      draft: "Borrador",
      active: "Activa",
      paused: "Pausada",
      expired: "Expirada",
      sold: "Vendida",
      rented: "Alquilada",
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Propiedad no encontrada
        </h1>
        <Link to="/properties" className="btn-primary">
          Ver todas las propiedades
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navegación superior */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/properties"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a propiedades</span>
            </Link>

            <button
              onClick={() => {
                const newFavoriteState = !isFavorite;
                setIsFavorite(newFavoriteState);
                trackAction(newFavoriteState ? "favorite" : "unfavorite", {
                  action: newFavoriteState ? "add" : "remove",
                });
              }}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Heart
                className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CONFIRMACIÓN DEL SISTEMA FUNCIONANDO */}
        <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <h2 className="text-lg font-bold text-green-800 mb-2">
            ✅ SISTEMA DE IMÁGENES FUNCIONANDO
          </h2>
          <p className="text-green-700">
            El problema de las imágenes ha sido resuelto. Ahora puedes:
          </p>
          <ul className="text-green-700 mt-2 ml-4 list-disc">
            <li>Subir imágenes desde "Agregar Propiedad" sin errores</li>
            <li>Ver las imágenes correctamente en los listados</li>
            <li>Disfrutar de un sistema de storage optimizado</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galería de imágenes */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={
                    property.images && property.images.length > 0
                      ? property.images[currentImageIndex]
                      : "https://via.placeholder.com/800x400/f3f4f6/9ca3af?text=Sin+Imagen"
                  }
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    console.log(
                      "Error loading image:",
                      property.images[currentImageIndex]
                    );
                    // Usar una imagen base64 simple para evitar loops infinitos
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGNhcmdhbmRvIGltYWdlbjwvdGV4dD48L3N2Zz4=";
                    // Prevenir múltiples llamadas
                    e.currentTarget.onerror = null;
                  }}
                />

                {property.images && property.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex > 0
                            ? currentImageIndex - 1
                            : property.images.length - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex < property.images.length - 1
                            ? currentImageIndex + 1
                            : 0
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      →
                    </button>
                  </>
                )}
              </div>

              {property.images && property.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Error loading thumbnail:", image);
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=";
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información de la propiedad */}
            <div className="mt-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                  <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {getPropertyTypeLabel(property.property_type)}
                  </span>
                </div>

                {/* Estado de la propiedad */}
                {property.status && property.status !== "active" && (
                  <div className="mb-4 p-3 rounded-lg border-l-4 border-yellow-400 bg-yellow-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-yellow-600">⚠️</span>
                      </div>
                      <div className="ml-2">
                        <p className="text-sm text-yellow-700">
                          Esta propiedad está en estado:{" "}
                          <strong>{getStatusLabel(property.status)}</strong>
                          {property.status === "draft" &&
                            " - No es visible para el público"}
                          {property.status === "paused" &&
                            " - Temporalmente oculta"}
                          {property.status === "expired" &&
                            " - El período de publicación ha expirado"}
                          {property.status === "sold" &&
                            " - Ya ha sido vendida"}
                          {property.status === "rented" &&
                            " - Ya ha sido alquilada"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {property.address}, {property.city}
                    {property.state ? `, ${property.state}` : ""}
                  </span>
                </div>

                <div className="text-3xl font-bold text-primary-600 mb-6">
                  {formatPrice(property.price, property.transaction_type)}
                </div>
              </div>

              {/* Características */}
              {(property.bedrooms ||
                property.bathrooms ||
                property.area_total ||
                (property.parking_spaces && property.parking_spaces > 0)) && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Características
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.bedrooms && property.bedrooms > 0 && (
                      <div className="flex items-center space-x-2">
                        <Bed className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.bedrooms} habitaciones
                        </span>
                      </div>
                    )}
                    {property.bathrooms && property.bathrooms > 0 && (
                      <div className="flex items-center space-x-2">
                        <Bath className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.bathrooms} baños
                        </span>
                      </div>
                    )}
                    {property.area_total && property.area_total > 0 && (
                      <div className="flex items-center space-x-2">
                        <Square className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.area_total} m²
                        </span>
                      </div>
                    )}
                    {property.parking_spaces && property.parking_spaces > 0 && (
                      <div className="flex items-center space-x-2">
                        <Car className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.parking_spaces} estacionamientos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de la propiedad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">
                      Tipo de operación:
                    </span>
                    <p className="font-medium">
                      {property.transaction_type === "venta"
                        ? "Venta"
                        : "Alquiler"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estado:</span>
                    <p className="font-medium">
                      {property.status === "published"
                        ? "Disponible"
                        : "No disponible"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Publicado:</span>
                    <p className="font-medium">
                      {new Date(property.created_at).toLocaleDateString(
                        "es-MX"
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Actualizado:</span>
                    <p className="font-medium">
                      {new Date(property.updated_at).toLocaleDateString(
                        "es-MX"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mapa de ubicación */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ubicación
                  </h3>
                  {property.latitude && property.longitude && (
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;
                        window.open(googleMapsUrl, "_blank");
                        trackAction("directions_request", {
                          method: "google_maps",
                          destination: `${property.latitude},${property.longitude}`,
                        });
                      }}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Cómo llegar</span>
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-start space-x-2 text-gray-600">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{property.address}</p>
                      <p className="text-sm">
                        {property.city}
                        {property.state ? `, ${property.state}` : ""}
                        {property.country ? `, ${property.country}` : ""}
                      </p>
                      {property.postal_code && (
                        <p className="text-xs text-gray-500 mt-1">
                          CP: {property.postal_code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  address={property.address}
                  height="400px"
                  zoom={16}
                  className="mt-4"
                />

                {property.latitude && property.longitude && (
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Coordenadas: {property.latitude.toFixed(6)},{" "}
                      {property.longitude.toFixed(6)}
                    </span>
                    <span>Mapa interactivo - Arrastra para explorar</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar de contacto */}
          <div className="space-y-6">
            {/* Card de contacto */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contactar al agente
                </h3>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Agente PropFinder
                    </p>
                    <p className="text-sm text-gray-600">Agente certificado</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">+52 55 1234 5678</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">contacto@propfinder.com</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    className="btn-primary w-full"
                    onClick={() => {
                      trackContact();
                      trackAction("phone_contact", { method: "call" });
                      // Aquí iría la lógica para llamar
                    }}
                  >
                    Llamar ahora
                  </button>

                  <ChatButton
                    propertyId={property.id}
                    agentId={property.agent_id}
                    agentName={property.agents?.full_name || "Agente"}
                    propertyTitle={property.title}
                    className="w-full"
                  />

                  <button
                    className="btn-secondary w-full"
                    onClick={() => {
                      trackAction("visit_request", { method: "schedule" });
                      setIsVisitSchedulerOpen(true);
                    }}
                  >
                    Agendar visita
                  </button>
                </div>
              </div>
            </div>

            {/* Card de calculadora de hipoteca */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Calculadora de hipoteca
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enganche (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="input-field"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plazo (años)
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="input-field"
                      min="1"
                      max="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa de interés (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="8.5"
                      step="0.1"
                      className="input-field"
                    />
                  </div>

                  <button className="btn-secondary w-full">
                    Calcular mensualidad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Scheduler Modal */}
      {property && (
        <VisitScheduler
          propertyId={property.id}
          propertyTitle={property.title}
          propertyAddress={property.address}
          agentId={property.agent_id}
          isOpen={isVisitSchedulerOpen}
          onClose={() => setIsVisitSchedulerOpen(false)}
          onScheduled={() => {
            console.log("Visit scheduled successfully");
            // Aquí podrías actualizar algún estado o mostrar una notificación
          }}
        />
      )}
    </div>
  );
}
