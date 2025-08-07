import { Link } from "react-router-dom";
import { Home, Search, User, Menu, LogOut, Shield, Building } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { user, signOut, isAdmin, isAgent } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl text-gray-900">PropFinder</span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/properties"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Propiedades
            </Link>
            <Link
              to="/properties?transaction_type=sale"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Comprar
            </Link>
            <Link
              to="/properties?transaction_type=rent"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Rentar
            </Link>
          </nav>

          {/* Botones de acción */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                )}
                {isAgent && (
                  <Link
                    to="/agent-dashboard"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Building className="h-4 w-4 mr-1" />
                    Agente
                  </Link>
                )}
                {!isAgent && !isAdmin && (
                  <Link
                    to="/become-agent"
                    className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Building className="h-4 w-4 mr-1" />
                    Ser Agente
                  </Link>
                )}
                <span className="text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Registrarse
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <User className="h-4 w-4 mr-1" />
                  Iniciar Sesión
                </Link>
              </div>
            )}
            <button className="btn-primary hidden md:block">
              Publicar Propiedad
            </button>
            <button className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
