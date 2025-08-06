import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: "apartment" | "house" | "commercial" | "land";
  transaction_type: "sale" | "rent";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    parking_spaces?: number;
  };
  images: string[];
  status: "active" | "inactive" | "sold" | "rented";
  created_at: string;
  updated_at: string;
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/properties/${propertyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
    }
    setLoading(false);
  };

  const formatPrice = (price: number, transactionType: string) => {
    const formatter = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    });

    if (transactionType === "rent") {
      return `${formatter.format(price)}/mes`;
    }
    return formatter.format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types = {
      apartment: "Departamento",
      house: "Casa",
      commercial: "Comercial",
      land: "Terreno",
    };
    return types[type as keyof typeof types] || type;
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
              onClick={() => setIsFavorite(!isFavorite)}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galería de imágenes */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={
                    property.images[currentImageIndex] ||
                    "/placeholder-property.jpg"
                  }
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg"
                />

                {property.images.length > 1 && (
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

              {property.images.length > 1 && (
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

                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {property.location.address}, {property.location.city},{" "}
                    {property.location.state}
                  </span>
                </div>

                <div className="text-3xl font-bold text-primary-600 mb-6">
                  {formatPrice(property.price, property.transaction_type)}
                </div>
              </div>

              {/* Características */}
              {(property.features.bedrooms ||
                property.features.bathrooms ||
                property.features.area ||
                property.features.parking_spaces) && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Características
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.features.bedrooms && (
                      <div className="flex items-center space-x-2">
                        <Bed className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.features.bedrooms} habitaciones
                        </span>
                      </div>
                    )}
                    {property.features.bathrooms && (
                      <div className="flex items-center space-x-2">
                        <Bath className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.features.bathrooms} baños
                        </span>
                      </div>
                    )}
                    {property.features.area && (
                      <div className="flex items-center space-x-2">
                        <Square className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.features.area} m²
                        </span>
                      </div>
                    )}
                    {property.features.parking_spaces && (
                      <div className="flex items-center space-x-2">
                        <Car className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">
                          {property.features.parking_spaces} estacionamientos
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
                      {property.transaction_type === "sale" ? "Venta" : "Renta"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estado:</span>
                    <p className="font-medium">
                      {property.status === "active"
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
                  <button className="btn-primary w-full">Llamar ahora</button>
                  <button className="btn-secondary w-full">
                    Enviar mensaje
                  </button>
                  <button className="btn-secondary w-full">
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
    </div>
  );
}
