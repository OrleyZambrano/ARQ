import { Link } from "react-router-dom";
import { Home, Search, User, Menu } from "lucide-react";

export function Header() {
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
            <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <User className="h-5 w-5" />
            </button>
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
