import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Building, 
  CreditCard, 
  Star, 
  Eye, 
  Phone, 
  Mail, 
  TrendingUp,
  Plus,
  Settings 
} from 'lucide-react';

export function AgentDashboardPage() {
  const { user, isAgent, agentProfile, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAgent) {
    return <Navigate to="/become-agent" replace />;
  }

  const stats = [
    {
      name: 'Propiedades Activas',
      value: '0',
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      name: 'Créditos Disponibles',
      value: agentProfile?.credits || '0',
      icon: CreditCard,
      color: 'bg-green-500'
    },
    {
      name: 'Rating Promedio',
      value: agentProfile?.rating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      name: 'Vistas Totales',
      value: '0',
      icon: Eye,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Agente
                </h1>
                <p className="text-sm text-gray-500">
                  Bienvenido, {userProfile?.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {agentProfile?.is_verified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verificado
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⏳ Pendiente de verificación
                </span>
              )}
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-md ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Agente */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información del Agente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Información Personal
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {userProfile?.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {userProfile?.phone || 'No especificado'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Información Profesional
                    </h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Empresa:</span>{' '}
                        {agentProfile?.company_name || 'No especificada'}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Licencia:</span>{' '}
                        {agentProfile?.license_number || 'No especificada'}
                      </div>
                      {agentProfile?.website_url && (
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Web:</span>{' '}
                          <a 
                            href={agentProfile.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            {agentProfile.website_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {agentProfile?.description && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Descripción
                    </h4>
                    <p className="text-sm text-gray-900">
                      {agentProfile.description}
                    </p>
                  </div>
                )}
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Settings className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Progreso de Verificación */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estado de Verificación
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Cuenta creada</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Información completada</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Verificación pendiente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de Créditos */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Uso de Créditos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disponibles</span>
                    <span className="font-medium text-green-600">
                      {agentProfile?.credits || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilizados</span>
                    <span className="font-medium text-gray-900">
                      {agentProfile?.total_credits_used || 0}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Comprar Créditos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Actividad Reciente
                </h3>
                <div className="text-center py-6">
                  <TrendingUp className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No hay actividad reciente
                  </p>
                  <p className="text-xs text-gray-400">
                    Publica tu primera propiedad para comenzar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
