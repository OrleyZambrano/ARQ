import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Property } from "../../../shared/src/types";
import { Link, Navigate } from "react-router-dom";
import {
  Eye,
  Heart,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Home,
  MapPin,
  Star,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function MyPropertiesPage() {
  const { user, agentProfile, refreshProfile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "sold" | "rented"
  >("all");

  // Verificar que sea agente aprobado
  if (!user || agentProfile?.approval_status !== "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadProperties();
  }, [filter]);

  const loadProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("agent_id", user!.id)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setProperties(data || []);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      // TODO: También eliminar imágenes de Storage
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      alert("Propiedad eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error al eliminar la propiedad");
    }
  };

  const togglePropertyStatus = async (
    propertyId: string,
    newStatus: "published" | "suspended"
  ) => {
    try {
      const property = properties.find((p) => p.id === propertyId);
      if (!property) return;

      // Si va a publicar y no tiene publicaciones disponibles
      if (
        newStatus === "published" &&
        property.status === "draft" &&
        agentProfile?.publicaciones_disponibles <= 0
      ) {
        alert("No tienes publicaciones disponibles");
        return;
      }

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "published" && property.status === "draft") {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("properties")
        .update(updateData)
        .eq("id", propertyId);

      if (error) throw error;

      // Si publicó desde borrador, consumir publicación
      if (newStatus === "published" && property.status === "draft") {
        const { data: success, error: consumeError } = await supabase.rpc(
          "consume_publication",
          {
            agent_uuid: user!.id,
          }
        );

        if (consumeError || !success) {
          console.error("Error consumiendo publicación:", consumeError);
          // Rollback
          await supabase
            .from("properties")
            .update({ status: "draft", published_at: null })
            .eq("id", propertyId);

          alert("No tienes créditos suficientes para publicar esta propiedad");
          return;
        }

        // Actualizar el perfil del agente para reflejar las publicaciones disponibles
        await refreshProfile();
      }

      // Actualizar la lista
      loadProperties();
      alert(
        `Propiedad ${
          newStatus === "published" ? "publicada" : "suspendida"
        } exitosamente`
      );
    } catch (error) {
      console.error("Error updating property status:", error);
      alert("Error al cambiar el estado de la propiedad");
    }
  };

  const getStatusBadge = (
    status: string,
    isUrgent: boolean,
    isFeatured: boolean
  ) => {
    const badges = [];

    // Estado principal
    switch (status) {
      case "published":
        badges.push(
          <span
            key="published"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Publicada
          </span>
        );
        break;
      case "draft":
        badges.push(
          <span
            key="draft"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            <Clock className="h-3 w-3 mr-1" />
            Borrador
          </span>
        );
        break;
      case "sold":
        badges.push(
          <span
            key="sold"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Vendida
          </span>
        );
        break;
      case "rented":
        badges.push(
          <span
            key="rented"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Alquilada
          </span>
        );
        break;
      case "suspended":
        badges.push(
          <span
            key="suspended"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Suspendida
          </span>
        );
        break;
    }

    // Badges adicionales
    if (isFeatured) {
      badges.push(
        <span
          key="featured"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
        >
          <Star className="h-3 w-3 mr-1" />
          Destacada
        </span>
      );
    }

    if (isUrgent) {
      badges.push(
        <span
          key="urgent"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
        >
          <Zap className="h-3 w-3 mr-1" />
          Urgente
        </span>
      );
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mis Propiedades
              </h1>
              <p className="text-gray-600">
                Gestiona tus propiedades publicadas
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/add-property"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Home className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Propiedades
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {properties.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Publicadas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {
                          properties.filter((p) => p.status === "published")
                            .length
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Vistas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {properties.reduce((sum, p) => sum + p.views_count, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Favoritos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {properties.reduce(
                          (sum, p) => sum + p.favorites_count,
                          0
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "Todas", count: properties.length },
                {
                  key: "published",
                  label: "Publicadas",
                  count: properties.filter((p) => p.status === "published")
                    .length,
                },
                {
                  key: "draft",
                  label: "Borradores",
                  count: properties.filter((p) => p.status === "draft").length,
                },
                {
                  key: "sold",
                  label: "Vendidas",
                  count: properties.filter((p) => p.status === "sold").length,
                },
                {
                  key: "rented",
                  label: "Alquiladas",
                  count: properties.filter((p) => p.status === "rented").length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`${
                    filter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Lista de propiedades */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay propiedades
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "Aún no has creado ninguna propiedad."
                : `No tienes propiedades con estado "${filter}".`}
            </p>
            <Link
              to="/add-property"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Propiedad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Imagen principal */}
                <div className="relative h-48 bg-gray-200">
                  {property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Badges de estado */}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(
                      property.status,
                      property.is_urgent,
                      property.is_featured
                    )}
                  </div>

                  {/* Precio */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                      {property.currency} {property.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {property.title}
                    </h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">
                      {property.city}, {property.province}
                    </span>
                  </div>

                  {/* Características */}
                  <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <span className="font-medium">{property.bedrooms}</span>
                        <span className="ml-1">hab</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <span className="font-medium">
                          {property.bathrooms}
                        </span>
                        <span className="ml-1">baños</span>
                      </div>
                    )}
                    {property.area_total && (
                      <div className="flex items-center">
                        <span className="font-medium">
                          {property.area_total}
                        </span>
                        <span className="ml-1">m²</span>
                      </div>
                    )}
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{property.views_count}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>{property.favorites_count}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{property.inquiries_count}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/edit-property/${property.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {property.status === "published" && (
                        <button
                          onClick={() =>
                            togglePropertyStatus(property.id, "suspended")
                          }
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                        >
                          Suspender
                        </button>
                      )}

                      {(property.status === "draft" ||
                        property.status === "suspended") && (
                        <button
                          onClick={() =>
                            togglePropertyStatus(property.id, "published")
                          }
                          disabled={
                            property.status === "draft" &&
                            agentProfile?.publicaciones_disponibles <= 0
                          }
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            property.status === "draft" &&
                            agentProfile?.publicaciones_disponibles <= 0
                              ? "Sin publicaciones disponibles"
                              : ""
                          }
                        >
                          Publicar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
