import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Property {
  id: string;
  agent_id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  property_type: string;
  transaction_type: "venta" | "alquiler";
  bedrooms?: number;
  bathrooms?: number;
  area_total?: number;
  area_constructed?: number;
  parking_spaces?: number;
  floor_number?: number;
  total_floors?: number;
  year_built?: number;
  address: string;
  neighborhood?: string;
  city: string;
  province: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  features: Record<string, any>;
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
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
import {
  Search,
  MapPin,
  Home,
  Building,
  Star,
  Eye,
  Heart,
  ChevronRight,
  Filter,
  Bed,
  Bath,
  Square,
} from "lucide-react";

export function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [urgentProperties, setUrgentProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    transaction_type: "",
    property_type: "",
    min_price: "",
    max_price: "",
  });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Cargar propiedades destacadas
      const { data: featured } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // Cargar propiedades urgentes
      const { data: urgent } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "published")
        .eq("is_urgent", true)
        .order("created_at", { ascending: false })
        .limit(4);

      // Cargar propiedades recientes
      const { data: recent } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);

      setFeaturedProperties(featured || []);
      setUrgentProperties(urgent || []);
      setRecentProperties(recent || []);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    window.location.href = `/properties?${params.toString()}`;
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        {property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {property.is_featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
              <Star className="inline h-3 w-3 mr-1" />
              Destacada
            </span>
          )}
          {property.is_urgent && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              ⚡ Urgente
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-bold">
            {property.currency} {property.price.toLocaleString()}
          </span>
        </div>

        {/* Métricas */}
        <div className="absolute top-3 right-3 flex items-center gap-2 text-white text-xs">
          <div className="flex items-center bg-black bg-opacity-50 px-2 py-1 rounded">
            <Eye className="h-3 w-3 mr-1" />
            {property.views_count}
          </div>
          <div className="flex items-center bg-black bg-opacity-50 px-2 py-1 rounded">
            <Heart className="h-3 w-3 mr-1" />
            {property.favorites_count}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">
            {property.neighborhood}, {property.city}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area_total && (
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.area_total}m²</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {property.property_type} • {property.transaction_type}
          </span>
          <Link
            to={`/properties/${property.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con Buscador */}
      <section className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div
          className="relative bg-cover bg-center py-24"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Encuentra tu hogar ideal en Ecuador
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Miles de propiedades verificadas por agentes profesionales
              </p>
            </div>

            {/* Buscador Avanzado */}
            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="Ciudad, barrio o dirección"
                    value={searchFilters.location}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operación
                  </label>
                  <select
                    value={searchFilters.transaction_type}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        transaction_type: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Cualquiera</option>
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={searchFilters.property_type}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        property_type: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Cualquiera</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="oficina">Oficina</option>
                    <option value="local_comercial">Local Comercial</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="inline h-4 w-4 mr-1" />
                    Búsqueda
                  </label>
                  <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    <Search className="inline h-4 w-4 mr-2" />
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Propiedades Urgentes */}
          {urgentProperties.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    ⚡ Oportunidades Urgentes
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Propiedades que requieren decisión rápida
                  </p>
                </div>
                <Link
                  to="/properties?is_urgent=true"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {urgentProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </section>
          )}

          {/* Propiedades Destacadas */}
          {featuredProperties.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Star className="h-8 w-8 text-yellow-500 mr-2" />
                    Propiedades Destacadas
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Selección especial de nuestros mejores inmuebles
                  </p>
                </div>
                <Link
                  to="/properties?is_featured=true"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </section>
          )}

          {/* Propiedades Recientes */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Últimas Propiedades
                </h2>
                <p className="text-gray-600 mt-2">
                  Recién publicadas por nuestros agentes
                </p>
              </div>
              <Link
                to="/properties"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>

          {/* CTA para Agentes */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white text-center">
            <Building className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">
              ¿Eres agente inmobiliario?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a nuestra plataforma y llega a miles de compradores
              potenciales. Gestiona tus propiedades de forma profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/become-agent"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Ser Agente
              </Link>
              <Link
                to="/properties"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Explorar Propiedades
              </Link>
            </div>
          </section>

          {/* Estadísticas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {recentProperties.length + featuredProperties.length}+
              </div>
              <div className="text-gray-600">Propiedades Activas</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Agentes Verificados</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                200+
              </div>
              <div className="text-gray-600">Clientes Satisfechos</div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
