import React, { useState } from 'react';
import { MapPin, Navigation, Search, Loader } from 'lucide-react';
import { useGeocoding } from '../hooks/useGeocoding';

interface GeospatialSearchProps {
  onLocationSearch: (latitude: number, longitude: number, radius: number, address: string) => void;
  onClearLocation: () => void;
  isLoading?: boolean;
  className?: string;
}

const GeospatialSearch: React.FC<GeospatialSearchProps> = ({
  onLocationSearch,
  onClearLocation,
  isLoading = false,
  className = ""
}) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(5); // 5km por defecto
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const { 
    loading: geocodingLoading, 
    error, 
    geocodeAddress, 
    getCurrentLocation 
  } = useGeocoding();

  const radiusOptions = [
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' }
  ];

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;

    const result = await geocodeAddress(searchAddress);
    if (result) {
      setCurrentLocation({
        lat: result.latitude,
        lng: result.longitude,
        address: result.address
      });
      onLocationSearch(result.latitude, result.longitude, selectedRadius, result.address);
    }
  };

  const handleCurrentLocation = async () => {
    const result = await getCurrentLocation();
    if (result) {
      setCurrentLocation({
        lat: result.latitude,
        lng: result.longitude,
        address: result.address
      });
      setSearchAddress(result.city || result.address.split(',')[0] || '');
      onLocationSearch(result.latitude, result.longitude, selectedRadius, result.address);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setSelectedRadius(newRadius);
    if (currentLocation) {
      onLocationSearch(currentLocation.lat, currentLocation.lng, newRadius, currentLocation.address);
    }
  };

  const handleClearSearch = () => {
    setSearchAddress('');
    setCurrentLocation(null);
    onClearLocation();
  };

  const isSearching = geocodingLoading || isLoading;

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
      <div className="space-y-4">
        {/* Título */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Búsqueda por Ubicación
          </h3>
          {currentLocation && (
            <button
              onClick={handleClearSearch}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Campo de búsqueda */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por dirección, ciudad o código postal..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              className="input-field w-full"
              disabled={isSearching}
            />
          </div>
          <button
            onClick={handleAddressSearch}
            disabled={!searchAddress.trim() || isSearching}
            className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleCurrentLocation}
            disabled={isSearching}
            className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Usar mi ubicación actual"
          >
            {isSearching ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Navigation className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Ubicación actual */}
        {currentLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900">Ubicación seleccionada:</p>
                <p className="text-sm text-blue-700 truncate">{currentLocation.address}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selector de radio */}
        {currentLocation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Radio de búsqueda:
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {radiusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRadiusChange(option.value)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    selectedRadius === option.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Se mostrarán propiedades dentro de {selectedRadius} km de la ubicación seleccionada
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeospatialSearch;
