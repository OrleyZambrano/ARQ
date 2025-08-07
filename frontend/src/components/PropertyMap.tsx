import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  address?: string;
  height?: string;
  zoom?: number;
  showMarker?: boolean;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  title = "Ubicación de la propiedad",
  address,
  height = "300px",
  zoom = 15,
  showMarker = true,
  className = ""
}) => {
  // Coordenadas por defecto (Ciudad de México)
  const defaultLat = 19.432608;
  const defaultLng = -99.133209;

  // Usar coordenadas de la propiedad o coordenadas por defecto
  const mapLat = latitude || defaultLat;
  const mapLng = longitude || defaultLng;

  // Si no hay coordenadas de la propiedad, mostrar mensaje
  const hasValidCoordinates = latitude && longitude;

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[mapLat, mapLng]}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showMarker && hasValidCoordinates && (
          <Marker position={[mapLat, mapLng]}>
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                {address && (
                  <p className="text-sm text-gray-600">{address}</p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Lat: {mapLat.toFixed(6)}, Lng: {mapLng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Overlay cuando no hay coordenadas válidas */}
      {!hasValidCoordinates && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">Ubicación no disponible</p>
            <p className="text-xs text-gray-500 mt-1">
              La propiedad no tiene coordenadas de ubicación
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
