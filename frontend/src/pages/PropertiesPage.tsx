import { useState, useEffect } from "react";
import { MapPin, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GeospatialSearch from "../components/GeospatialSearch";
import { useGeospatialSearch } from "../hooks/useGeospatialSearch";

interface Property {
  id: string;
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
  parking_spaces?: number;
  address: string;
  neighborhood?: string;
  city: string;
  province: string;
  country: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  features: any;
  images: string[];
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  distance?: number; // Distancia en búsquedas geoespaciales
}

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchMode, setSearchMode] = useState<"traditional" | "geospatial">("traditional");
  const [filters, setFilters] = useState({
    property_type: "",
    transaction_type: "",
    city: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
  });

  // Hook para búsqueda geoespacial
  const {
    properties: geospatialProperties,
    loading: geospatialLoading,
    error: geospatialError,
    totalFound: geospatialTotal,
    searchProperties: performGeospatialSearch,
    clearSearch: clearGeospatialSearch
  } = useGeospatialSearch();

  // Determinar qué propiedades mostrar
  const displayProperties = searchMode === "geospatial" ? geospatialProperties : properties;
  const isLoading = searchMode === "geospatial" ? geospatialLoading : loading;
  const totalProperties = searchMode === "geospatial" ? geospatialTotal : properties.length;

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Construir query params
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filters.property_type) {
        query = query.eq("property_type", filters.property_type);
      }
      if (filters.transaction_type) {
        query = query.eq("transaction_type", filters.transaction_type);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.min_price) {
        query = query.gte("price", parseFloat(filters.min_price));
      }
      if (filters.max_price) {
        query = query.lte("price", parseFloat(filters.max_price));
      }
      if (filters.bedrooms) {
        query = query.eq("bedrooms", parseInt(filters.bedrooms));
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Manejar búsqueda geoespacial
  const handleGeospatialSearch = async (latitude: number, longitude: number, radius: number, _address: string) => {
    setSearchMode("geospatial");
    
    const geospatialFilters = {
      latitude,
      longitude,
      radius,
      property_type: filters.property_type || undefined,
      transaction_type: filters.transaction_type || undefined,
      min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
      max_price: filters.max_price ? parseFloat(filters.max_price) : undefined,
      bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
      city: filters.city || undefined,
    };

    await performGeospatialSearch(geospatialFilters);
  };

  // Limpiar búsqueda geoespacial y volver a búsqueda tradicional
  const handleClearGeospatialSearch = () => {
    setSearchMode("traditional");
    clearGeospatialSearch();
    fetchProperties(); // Recargar propiedades tradicionales
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de búsqueda */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Búsqueda geoespacial */}
          <div className="mb-6">
            <GeospatialSearch
              onLocationSearch={handleGeospatialSearch}
              onClearLocation={handleClearGeospatialSearch}
              isLoading={geospatialLoading}
            />
            {geospatialError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {geospatialError}
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de operación
                </label>
                <select
                  className="input-field"
                  value={filters.transaction_type}
                  onChange={(e) =>
                    handleFilterChange("transaction_type", e.target.value)
                  }
                >
                  <option value="">Cualquiera</option>
                  <option value="venta">Comprar</option>
                  <option value="alquiler">Rentar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de propiedad
                </label>
                <select
                  className="input-field"
                  value={filters.property_type}
                  onChange={(e) =>
                    handleFilterChange("property_type", e.target.value)
                  }
                >
                  <option value="">Cualquiera</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="oficina">Oficina</option>
                  <option value="local_comercial">Local Comercial</option>
                  <option value="terreno">Terreno</option>
                  <option value="bodega">Bodega</option>
                  <option value="quinta">Quinta</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  placeholder="Cualquier ciudad"
                  className="input-field"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  placeholder="$ Min"
                  className="input-field"
                  value={filters.min_price}
                  onChange={(e) =>
                    handleFilterChange("min_price", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio máximo
                </label>
                <input
                  type="number"
                  placeholder="$ Max"
                  className="input-field"
                  value={filters.max_price}
                  onChange={(e) =>
                    handleFilterChange("max_price", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habitaciones
                </label>
                <select
                  className="input-field"
                  value={filters.bedrooms}
                  onChange={(e) =>
                    handleFilterChange("bedrooms", e.target.value)
                  }
                >
                  <option value="">Cualquiera</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Controles de vista */}
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {totalProperties} propiedades encontradas
            </h1>
            {searchMode === "geospatial" && (
              <p className="text-sm text-gray-600 mt-1">
                Resultados ordenados por distancia
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }`}
          >
            {displayProperties.map((property) => (
              <div
                key={property.id}
                className={`card ${viewMode === "list" ? "flex" : ""}`}
              >
                <div
                  className={`relative ${
                    viewMode === "list" ? "w-80 flex-shrink-0" : ""
                  }`}
                >
                  <img
                    src={property.images[0] || "/placeholder-property.jpg"}
                    alt={property.title}
                    className={`${
                      viewMode === "list"
                        ? "w-full h-64 object-cover"
                        : "w-full h-48 object-cover"
                    }`}
                  />
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {property.transaction_type === "venta"
                      ? "Venta"
                      : "Alquiler"}
                  </div>
                </div>

                <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {property.title}
                    </h3>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {getPropertyTypeLabel(property.property_type)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {property.city}, {property.province}
                    </span>
                    {searchMode === "geospatial" && property.distance && (
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {property.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-gray-600 mb-4 ${
                      viewMode === "list" ? "line-clamp-2" : "line-clamp-3"
                    }`}
                  >
                    {property.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(property.price, property.transaction_type)}
                    </span>

                    {property.bedrooms && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{property.bedrooms} hab</span>
                        {property.bathrooms && (
                          <>
                            <span>•</span>
                            <span>{property.bathrooms} baños</span>
                          </>
                        )}
                        {property.area_total && (
                          <>
                            <span>•</span>
                            <span>{property.area_total}m²</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/properties/${property.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && displayProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchMode === "geospatial" 
                ? "No se encontraron propiedades en el área seleccionada"
                : "No se encontraron propiedades con los filtros seleccionados"
              }
            </div>
            <div className="mt-4 space-x-2">
              <button
                onClick={() =>
                  setFilters({
                    property_type: "",
                    transaction_type: "",
                    city: "",
                    min_price: "",
                    max_price: "",
                    bedrooms: "",
                  })
                }
                className="btn-secondary"
              >
                Limpiar Filtros
              </button>
              {searchMode === "geospatial" && (
                <button
                  onClick={handleClearGeospatialSearch}
                  className="btn-secondary"
                >
                  Quitar Búsqueda por Ubicación
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
