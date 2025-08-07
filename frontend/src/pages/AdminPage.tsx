import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { User, LogOut, Database, CheckCircle } from "lucide-react";

export function AdminPage() {
  const { user, signOut, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Administrador
                </h1>
                <p className="text-sm text-gray-500">
                  Bienvenido, {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status de Supabase */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Supabase Conectado
                  </h3>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      Base de datos operativa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información de Usuario
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {user.id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Rol:</span>
                  <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Administrador
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="text-sm font-medium text-gray-900">
                    Ver Propiedades
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="text-sm font-medium text-gray-900">
                    Gestionar Agentes
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="text-sm font-medium text-gray-900">
                    Configuración
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de confirmación */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ¡Supabase está funcionando correctamente!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Has iniciado sesión exitosamente como administrador. La
                  autenticación con Supabase está operativa y puedes gestionar
                  la plataforma PropFinder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
