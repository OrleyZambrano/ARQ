import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Eye,
  MessageCircle,
  Calendar,
  Heart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface PropertyMetrics {
  id: string;
  title: string;
  status: string;
  total_views: number;
  unique_views: number;
  contacts_initiated: number;
  visits_scheduled: number;
  times_favorited: number;
  conversion_rate: number;
  traffic_sources: {
    search: number;
    map: number;
    direct: number;
    social: number;
  };
  published_at: string;
}

interface DashboardMetrics {
  active_properties: number;
  draft_properties: number;
  sold_properties: number;
  total_views: number;
  total_unique_views: number;
  total_contacts: number;
  total_visits: number;
  conversion_rate: number;
}

export function AgentMetricsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [properties, setProperties] = useState<PropertyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    if (user) {
      fetchMetrics();
      fetchPropertyMetrics();
    }
  }, [user, timeframe]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_dashboard_metrics")
        .select("*")
        .eq("agent_id", user?.id)
        .single();

      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const fetchPropertyMetrics = async () => {
    try {
      let timeFilter = "";
      const now = new Date();

      switch (timeframe) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          timeFilter = weekAgo.toISOString();
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          timeFilter = monthAgo.toISOString();
          break;
        default:
          timeFilter = "";
      }

      let query = supabase
        .from("properties")
        .select(
          `
          id,
          title,
          status,
          published_at,
          property_analytics (
            total_views,
            unique_views,
            contacts_initiated,
            visits_scheduled,
            times_favorited,
            traffic_search,
            traffic_map,
            traffic_direct,
            traffic_social,
            conversion_view_to_contact
          )
        `
        )
        .eq("agent_id", user?.id)
        .in("status", ["active", "paused", "sold"]);

      if (timeFilter) {
        query = query.gte("published_at", timeFilter);
      }

      const { data, error } = await query
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const processedProperties =
        data?.map((property) => {
          const analytics = Array.isArray(property.property_analytics)
            ? property.property_analytics[0]
            : property.property_analytics;

          return {
            id: property.id,
            title: property.title,
            status: property.status,
            total_views: analytics?.total_views || 0,
            unique_views: analytics?.unique_views || 0,
            contacts_initiated: analytics?.contacts_initiated || 0,
            visits_scheduled: analytics?.visits_scheduled || 0,
            times_favorited: analytics?.times_favorited || 0,
            conversion_rate: analytics?.conversion_view_to_contact || 0,
            traffic_sources: {
              search: analytics?.traffic_search || 0,
              map: analytics?.traffic_map || 0,
              direct: analytics?.traffic_direct || 0,
              social: analytics?.traffic_social || 0,
            },
            published_at: property.published_at,
          };
        }) || [];

      setProperties(processedProperties);
    } catch (error) {
      console.error("Error fetching property metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      case "sold":
        return "text-blue-600 bg-blue-100";
      case "expired":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "paused":
        return "Pausada";
      case "sold":
        return "Vendida";
      case "expired":
        return "Expirada";
      default:
        return "Borrador";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics de Propiedades
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) =>
              setTimeframe(e.target.value as "week" | "month" | "all")
            }
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="all">Todo el tiempo</option>
          </select>
          <button
            onClick={() => {
              fetchMetrics();
              fetchPropertyMetrics();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Vistas Totales
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics?.total_views?.toLocaleString() || 0}
                </dd>
                <dd className="text-sm text-gray-500">
                  {metrics?.total_unique_views} únicas
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Contactos
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics?.total_contacts || 0}
                </dd>
                <dd className="text-sm text-gray-500">
                  {metrics?.conversion_rate}% conversión
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Visitas Agendadas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics?.total_visits || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Propiedades Activas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics?.active_properties || 0}
                </dd>
                <dd className="text-sm text-gray-500">
                  {metrics?.draft_properties || 0} borradores
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de propiedades */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rendimiento por Propiedad
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vistas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contactos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Favoritos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(property.published_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          property.status
                        )}`}
                      >
                        {getStatusText(property.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.total_views}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.unique_views} únicas
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.contacts_initiated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">
                          {property.conversion_rate}%
                        </span>
                        {property.conversion_rate > 10 ? (
                          <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                        ) : property.conversion_rate < 5 ? (
                          <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-900">
                          {property.times_favorited}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
