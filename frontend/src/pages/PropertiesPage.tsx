import { useState, useEffect } from "react";
import { MapPin, Filter, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";

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
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    parking_spaces?: number;
  };
  images: string[];
  status: "active" | "inactive" | "sold" | "rented";
}

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    property_type: "",
    transaction_type: "",
    city: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Construir query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/properties?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de búsqueda */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <option value="sale">Comprar</option>
                  <option value="rent">Rentar</option>
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
                  <option value="apartment">Departamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
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
                className={`p-2 rounded ${viewMode === "grid" ? "bg-primary-100 text-primary-600" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded ${viewMode === "list" ? "bg-primary-100 text-primary-600" : "text-gray-600 hover:bg-gray-100"}`}
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
          <h1 className="text-2xl font-bold text-gray-900">
            {properties.length} propiedades encontradas
          </h1>
        </div>

        {loading ? (
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
            {properties.map((property) => (
              <div
                key={property.id}
                className={`card ${viewMode === "list" ? "flex" : ""}`}
              >
                <div
                  className={`relative ${viewMode === "list" ? "w-80 flex-shrink-0" : ""}`}
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
                    {property.transaction_type === "sale" ? "Venta" : "Renta"}
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
                      {property.location.city}, {property.location.state}
                    </span>
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

                    {property.features.bedrooms && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{property.features.bedrooms} hab</span>
                        {property.features.bathrooms && (
                          <>
                            <span>•</span>
                            <span>{property.features.bathrooms} baños</span>
                          </>
                        )}
                        {property.features.area && (
                          <>
                            <span>•</span>
                            <span>{property.features.area}m²</span>
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

        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No se encontraron propiedades con los filtros seleccionados
            </div>
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
              className="btn-secondary mt-4"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
