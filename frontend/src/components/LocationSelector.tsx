import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search, RefreshCw } from 'lucide-react';
import { useGeocoding } from '../hooks/useGeocoding';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationSelectorProps {
  latitude: string;
  longitude: string;
  address: string;
  onLocationChange: (lat: string, lng: string, address?: string) => void;
  onAddressChange: (address: string) => void;
  height?: string;
  className?: string;
}

// Componente interno para manejar eventos del mapa
function MapClickHandler({ 
  onMapClick 
}: { 
  onMapClick: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  onAddressChange,
  height = "400px",
  className = ""
}) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [isManualEdit, setIsManualEdit] = useState(false);
  
  const { 
    loading: geocodingLoading, 
    error: geocodingError, 
    geocodeAddress, 
    reverseGeocode,
    getCurrentLocation 
  } = useGeocoding();

  // Coordenadas por defecto (Ciudad de México)
  const defaultLat = 19.432608;
  const defaultLng = -99.133209;

  // Usar coordenadas proporcionadas o coordenadas por defecto
  const mapLat = latitude ? parseFloat(latitude) : defaultLat;
  const mapLng = longitude ? parseFloat(longitude) : defaultLng;
  const hasValidCoordinates = latitude && longitude && !isNaN(mapLat) && !isNaN(mapLng);

  // Actualizar campo de búsqueda cuando cambie la dirección externa
  useEffect(() => {
    if (address && !isManualEdit) {
      setSearchAddress(address);
    }
  }, [address, isManualEdit]);

  // Manejar búsqueda por dirección
  const handleAddressSearch = useCallback(async () => {
    if (!searchAddress.trim()) return;

    const result = await geocodeAddress(searchAddress);
    if (result) {
      onLocationChange(
        result.latitude.toString(),
        result.longitude.toString(),
        result.address
      );
      onAddressChange(result.address);
      setIsManualEdit(false);
    }
  }, [searchAddress, geocodeAddress, onLocationChange, onAddressChange]);

  // Manejar ubicación actual
  const handleCurrentLocation = useCallback(async () => {
    const result = await getCurrentLocation();
    if (result) {
      onLocationChange(
        result.latitude.toString(),
        result.longitude.toString(),
        result.address
      );
      onAddressChange(result.address);
      setSearchAddress(result.city || result.address.split(',')[0] || '');
      setIsManualEdit(false);
    }
  }, [getCurrentLocation, onLocationChange, onAddressChange]);

  // Manejar clic en el mapa
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    onLocationChange(lat.toString(), lng.toString());
    
    // Intentar obtener dirección mediante geocodificación inversa
    const result = await reverseGeocode(lat, lng);
    if (result) {
      onAddressChange(result.address);
      setSearchAddress(result.city || result.address.split(',')[0] || '');
    }
    setIsManualEdit(false);
  }, [onLocationChange, onAddressChange, reverseGeocode]);

  // Manejar cambios manuales en coordenadas
  const handleManualCoordinateChange = useCallback((type: 'lat' | 'lng', value: string) => {
    setIsManualEdit(true);
    if (type === 'lat') {
      onLocationChange(value, longitude);
    } else {
      onLocationChange(latitude, value);
    }
  }, [latitude, longitude, onLocationChange]);

  // Sincronizar dirección cuando se cambien coordenadas manualmente
  const handleSyncAddress = useCallback(async () => {
    if (!hasValidCoordinates) return;
    
    const result = await reverseGeocode(mapLat, mapLng);
    if (result) {
      onAddressChange(result.address);
      setSearchAddress(result.city || result.address.split(',')[0] || '');
      setIsManualEdit(false);
    }
  }, [hasValidCoordinates, mapLat, mapLng, reverseGeocode, onAddressChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Búsqueda por dirección */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Buscar Ubicación</h4>
        
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            placeholder="Buscar por dirección, ciudad o código postal..."
            value={searchAddress}
            onChange={(e) => {
              setSearchAddress(e.target.value);
              setIsManualEdit(true);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
            className="input-field flex-1"
            disabled={geocodingLoading}
          />
          <button
            onClick={handleAddressSearch}
            disabled={!searchAddress.trim() || geocodingLoading}
            className="btn-primary px-4 py-2 disabled:opacity-50"
            title="Buscar dirección"
          >
            {geocodingLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleCurrentLocation}
            disabled={geocodingLoading}
            className="btn-secondary px-4 py-2 disabled:opacity-50"
            title="Usar mi ubicación actual"
          >
            <Navigation className="h-5 w-5" />
          </button>
        </div>

        {geocodingError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {geocodingError}
          </div>
        )}
      </div>

      {/* Coordenadas manuales */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Coordenadas</h4>
          {hasValidCoordinates && (
            <button
              onClick={handleSyncAddress}
              disabled={geocodingLoading}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              title="Sincronizar dirección con coordenadas"
            >
              <RefreshCw className={`h-3 w-3 ${geocodingLoading ? 'animate-spin' : ''}`} />
              <span>Sincronizar dirección</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Latitud
            </label>
            <input
              type="number"
              step="any"
              placeholder="19.432608"
              value={latitude}
              onChange={(e) => handleManualCoordinateChange('lat', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Longitud
            </label>
            <input
              type="number"
              step="any"
              placeholder="-99.133209"
              value={longitude}
              onChange={(e) => handleManualCoordinateChange('lng', e.target.value)}
              className="input-field text-sm"
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Puedes editar las coordenadas manualmente o hacer clic en el mapa
        </p>
      </div>

      {/* Mapa interactivo */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Mapa Interactivo</h4>
          <span className="text-xs text-gray-500">Haz clic para seleccionar ubicación</span>
        </div>
        
        <MapContainer
          center={[mapLat, mapLng]}
          zoom={15}
          style={{ height, width: '100%' }}
          className="rounded-lg border"
          key={`${mapLat}-${mapLng}`} // Force re-render when coordinates change
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onMapClick={handleMapClick} />
          
          {hasValidCoordinates && (
            <Marker position={[mapLat, mapLng]} />
          )}
        </MapContainer>

        {hasValidCoordinates && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              Ubicación: {mapLat.toFixed(6)}, {mapLng.toFixed(6)}
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Ubicación seleccionada</span>
            </span>
          </div>
        )}
      </div>

      {/* Dirección completa */}
      {address && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Dirección:</h4>
          <p className="text-sm text-blue-700">{address}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
