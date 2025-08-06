import { Link } from "react-router-dom";
import { Search, Home, MapPin, Star } from "lucide-react";

export function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encuentra tu hogar ideal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Descubre miles de propiedades en toda la República Mexicana
            </p>

            {/* Buscador principal */}
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Dónde quieres vivir?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ciudad, colonia o código postal"
                      className="input-field pl-10 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de operación
                  </label>
                  <select className="input-field text-gray-900">
                    <option value="">Cualquiera</option>
                    <option value="sale">Comprar</option>
                    <option value="rent">Rentar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad
                  </label>
                  <select className="input-field text-gray-900">
                    <option value="">Cualquiera</option>
                    <option value="apartment">Departamento</option>
                    <option value="house">Casa</option>
                    <option value="commercial">Comercial</option>
                    <option value="land">Terreno</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/properties"
                  className="btn-primary w-full md:w-auto inline-flex items-center justify-center space-x-2 text-lg px-8 py-3"
                >
                  <Search className="h-5 w-5" />
                  <span>Buscar Propiedades</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propiedades Destacadas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-xl text-gray-600">
              Descubre las mejores oportunidades del mercado inmobiliario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Propiedad destacada 1 */}
            <div className="card">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop"
                  alt="Apartamento moderno"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Destacada
                </div>
                <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Venta
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Moderno Apartamento en Centro
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">Ciudad de México, CDMX</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    $250,000
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>2 hab</span>
                    <span>•</span>
                    <span>2 baños</span>
                    <span>•</span>
                    <span>85m²</span>
                  </div>
                </div>
                <Link
                  to="/properties/1"
                  className="btn-primary w-full text-center"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>

            {/* Propiedad destacada 2 */}
            <div className="card">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop"
                  alt="Casa familiar"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Destacada
                </div>
                <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Venta
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Casa Familiar con Jardín
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">Guadalajara, Jalisco</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    $450,000
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>3 hab</span>
                    <span>•</span>
                    <span>2 baños</span>
                    <span>•</span>
                    <span>150m²</span>
                  </div>
                </div>
                <Link
                  to="/properties/2"
                  className="btn-primary w-full text-center"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>

            {/* Propiedad destacada 3 */}
            <div className="card">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=400&h=250&fit=crop"
                  alt="Oficina moderna"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Destacada
                </div>
                <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Renta
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Oficina Ejecutiva Moderna
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">Monterrey, Nuevo León</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    $15,000
                    <span className="text-sm font-normal text-gray-600">
                      /mes
                    </span>
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>120m²</span>
                    <span>•</span>
                    <span>5 oficinas</span>
                  </div>
                </div>
                <Link
                  to="/properties/3"
                  className="btn-primary w-full text-center"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                10,000+
              </div>
              <div className="text-gray-600">Propiedades Activas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                5,000+
              </div>
              <div className="text-gray-600">Clientes Satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">32</div>
              <div className="text-gray-600">Estados Cubiertos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Agentes Certificados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Tienes una propiedad para vender o rentar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a PropFinder y conecta con miles de compradores potenciales
          </p>
          <button className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Publicar Propiedad
          </button>
        </div>
      </section>
    </div>
  );
}
