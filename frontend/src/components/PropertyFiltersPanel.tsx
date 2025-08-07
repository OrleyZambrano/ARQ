import { useState, useEffect } from "react";
import { PropertyFilters } from "../utils/propertyFilters";
import {
  Search,
  MapPin,
  Home,
  Car,
  Zap,
  Calendar,
  DollarSign,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PropertyFiltersProps {
  onFiltersChange: (properties: any[]) => void;
  onFiltersUpdate?: (filters: PropertyFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const propertyTypes = [
  { value: "house", label: "Casa" },
  { value: "apartment", label: "Apartamento" },
  { value: "condo", label: "Condominio" },
  { value: "townhouse", label: "Casa Adosada" },
  { value: "land", label: "Terreno" },
  { value: "commercial", label: "Comercial" },
];

const sortOptions = [
  { value: "price_asc", label: "Precio: Menor a Mayor" },
  { value: "price_desc", label: "Precio: Mayor a Menor" },
  { value: "newest", label: "Más Recientes" },
  { value: "oldest", label: "Más Antiguos" },
  { value: "popularity", label: "Más Populares" },
];

export function PropertyFiltersPanel({
  onFiltersChange,
  onFiltersUpdate,
  isOpen,
  onToggle,
}: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    price: false,
    features: false,
    location: false,
    date: false,
  });

  // Simular búsqueda - en producción esto usaría el servicio real
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      // Aquí iría la lógica real de filtrado
      console.log("Applying filters:", filters);
      // Simular resultados
      const mockResults: any[] = [];
      onFiltersChange(mockResults);
      onFiltersUpdate?.(filters);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar filtros
  const clearFilters = async () => {
    const emptyFilters: PropertyFilters = {};
    setFilters(emptyFilters);
    setIsLoading(true);
    try {
      onFiltersChange([]);
      onFiltersUpdate?.(emptyFilters);
    } catch (error) {
      console.error("Error clearing filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar propiedades iniciales
  useEffect(() => {
    applyFilters();
  }, []);

  // Actualizar filtro específico
  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // Toggle sección expandida
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof PropertyFilters];
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v !== undefined && v !== null);
    }
    return value !== undefined && value !== null && value !== "";
  }).length;

  if (!isOpen) {
    return (
      <div className="mb-4">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-800 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Filtros de Búsqueda
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount} activos
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Búsqueda básica */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("basic")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-700">Búsqueda Básica</h4>
            {expandedSections.basic ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.basic && (
            <div className="mt-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, descripción o ubicación..."
                  value={filters.search || ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Todos los tipos</option>
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.sortBy || "newest"}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={filters.isVerifiedAgent || false}
                    onChange={(e) =>
                      updateFilter("isVerifiedAgent", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor="verifiedOnly"
                    className="text-sm text-gray-700"
                  >
                    Solo agentes verificados
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros de precio */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Precio</span>
            </h4>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.price && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Precio máximo
                </label>
                <input
                  type="number"
                  placeholder="Sin límite"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Características */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("features")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Características</span>
            </h4>
            {expandedSections.features ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.features && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Habitaciones mín.
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minBedrooms || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minBedrooms",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Baños mín.
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minBathrooms || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minBathrooms",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Área mín. (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minArea || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minArea",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasParking"
                    checked={filters.hasParking || false}
                    onChange={(e) =>
                      updateFilter("hasParking", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor="hasParking"
                    className="text-sm text-gray-700 flex items-center space-x-1"
                  >
                    <Car className="h-4 w-4" />
                    <span>Estacionamiento</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasPool"
                    checked={filters.hasPool || false}
                    onChange={(e) => updateFilter("hasPool", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label htmlFor="hasPool" className="text-sm text-gray-700">
                    Piscina
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasGarden"
                    checked={filters.hasGarden || false}
                    onChange={(e) =>
                      updateFilter("hasGarden", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label htmlFor="hasGarden" className="text-sm text-gray-700">
                    Jardín
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasAirConditioning"
                    checked={filters.hasAirConditioning || false}
                    onChange={(e) =>
                      updateFilter("hasAirConditioning", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor="hasAirConditioning"
                    className="text-sm text-gray-700 flex items-center space-x-1"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Aire Acond.</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("location")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Ubicación</span>
            </h4>
            {expandedSections.location ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.location && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={filters.city || ""}
                  onChange={(e) => updateFilter("city", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Estado/Provincia"
                  value={filters.state || ""}
                  onChange={(e) => updateFilter("state", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Fecha */}
        <div>
          <button
            onClick={() => toggleSection("date")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Fecha de Publicación</span>
            </h4>
            {expandedSections.date ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.date && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.publishedAfter || ""}
                  onChange={(e) =>
                    updateFilter("publishedAfter", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.publishedBefore || ""}
                  onChange={(e) =>
                    updateFilter("publishedBefore", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="text-sm text-gray-600">
          {isLoading ? "Buscando..." : "Filtros configurados"}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={clearFilters}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            onClick={applyFilters}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Aplicando..." : "Aplicar Filtros"}
          </button>
        </div>
      </div>
    </div>
  );
}
