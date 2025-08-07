import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadPropertyImageDirect } from "../utils/imageUploadDirect";
import {
  MapPin,
  Upload,
  Home,
  Bed,
  Bath,
  Car,
  Square,
  Calendar,
  Star,
  Save,
  Eye,
  Clock,
  Zap,
} from "lucide-react";

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  property_type: string;
  transaction_type: string;
  bedrooms: string;
  bathrooms: string;
  area_total: string;
  area_constructed: string;
  parking_spaces: string;
  floor_number: string;
  total_floors: string;
  year_built: string;
  address: string;
  neighborhood: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  amenities: string[];
  features: Record<string, boolean>;
  is_featured: boolean;
  is_urgent: boolean;
}

const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "oficina", label: "Oficina" },
  { value: "local_comercial", label: "Local Comercial" },
  { value: "terreno", label: "Terreno" },
  { value: "bodega", label: "Bodega" },
  { value: "quinta", label: "Quinta" },
  { value: "penthouse", label: "Penthouse" },
];

const AMENITIES_OPTIONS = [
  "Piscina",
  "Gimnasio",
  "Seguridad 24h",
  "Ascensor",
  "Balcón",
  "Terraza",
  "Jardín",
  "BBQ",
  "Salón comunal",
  "Cancha deportiva",
  "Área de juegos",
  "Portero",
];

const FEATURES_OPTIONS = [
  { key: "amueblado", label: "Amueblado" },
  { key: "mascotas_permitidas", label: "Mascotas Permitidas" },
  { key: "aire_acondicionado", label: "Aire Acondicionado" },
  { key: "calefaccion", label: "Calefacción" },
  { key: "internet_incluido", label: "Internet Incluido" },
  { key: "servicios_incluidos", label: "Servicios Incluidos" },
  { key: "cocina_equipada", label: "Cocina Equipada" },
  { key: "lavanderia", label: "Lavandería" },
];

export function AddPropertyPage() {
  const { user, agentProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    currency: "USD",
    property_type: "casa",
    transaction_type: "venta",
    bedrooms: "",
    bathrooms: "",
    area_total: "",
    area_constructed: "",
    parking_spaces: "0",
    floor_number: "",
    total_floors: "",
    year_built: "",
    address: "",
    neighborhood: "",
    city: "",
    province: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    amenities: [],
    features: {},
    is_featured: false,
    is_urgent: false,
  });

  // Verificar que sea agente aprobado
  if (!user || agentProfile?.approval_status !== "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  // VERIFICACIÓN TEMPORALMENTE DESHABILITADA - EJECUTAR SQL SCRIPT PARA CORREGIR
  // Verificar que tenga publicaciones disponibles
  /*
  if (agentProfile?.publicaciones_disponibles <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sin Publicaciones Disponibles
            </h1>
            <p className="text-gray-600 mb-6">
              No tienes publicaciones disponibles para crear una nueva
              propiedad. Adquiere más publicaciones para continuar.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAmenitiesChange = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleFeatureChange = (featureKey: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limitar a 10 imágenes máximo
    const maxImages = 10;
    const currentImageCount = selectedImages.length;
    const availableSlots = maxImages - currentImageCount;
    const filesToAdd = files.slice(0, availableSlots);

    setSelectedImages((prev) => [...prev, ...filesToAdd]);

    // Crear previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) {
      return [];
    }

    setUploadingImages(true);

    try {
      // Subir imágenes usando la función directa (bypassa bug de Supabase)
      const uploadPromises = selectedImages.map(async (file) => {
        try {
          const result = await uploadPropertyImageDirect({
            file,
            userId: user!.id,
          });

          if (result.error) {
            console.error("Error subiendo imagen:", result.error);
            return null;
          }

          return result.url;
        } catch (error) {
          console.error("Error inesperado subiendo imagen:", error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.filter((url): url is string => url !== null);

      if (uploadedUrls.length === 0) {
        throw new Error("No se pudo subir ninguna imagen");
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "published" = "draft"
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verificar publicaciones disponibles nuevamente
      if (
        status === "published" &&
        agentProfile?.publicaciones_disponibles <= 0
      ) {
        alert("No tienes publicaciones disponibles");
        return;
      }

      // 2. Subir imágenes
      const imageUrls = await uploadImages();

      // 3. Preparar datos de la propiedad
      const propertyData = {
        agent_id: user!.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        property_type: formData.property_type,
        transaction_type: formData.transaction_type,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        area_total: formData.area_total
          ? parseFloat(formData.area_total)
          : null,
        area_constructed: formData.area_constructed
          ? parseFloat(formData.area_constructed)
          : null,
        parking_spaces: parseInt(formData.parking_spaces),
        floor_number: formData.floor_number
          ? parseInt(formData.floor_number)
          : null,
        total_floors: formData.total_floors
          ? parseInt(formData.total_floors)
          : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        address: formData.address,
        neighborhood: formData.neighborhood || null,
        city: formData.city,
        province: formData.province,
        country: "Ecuador",
        postal_code: formData.postal_code || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        amenities: formData.amenities,
        features: formData.features,
        images: imageUrls,
        status,
        is_featured: formData.is_featured,
        is_urgent: formData.is_urgent,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      // 4. Crear la propiedad
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert(propertyData)
        .select()
        .single();

      if (propertyError) throw propertyError;

      // 5. Si se publica, consumir una publicación
      if (status === "published") {
        const { data: success, error: consumeError } = await supabase.rpc(
          "consume_publication",
          {
            agent_uuid: user!.id,
          }
        );

        if (consumeError || !success) {
          console.error("Error consumiendo publicación:", consumeError);
          // Rollback - eliminar la propiedad creada
          await supabase.from("properties").delete().eq("id", property.id);
          throw new Error(
            "No tienes créditos suficientes para publicar esta propiedad"
          );
        }

        alert("¡Propiedad publicada exitosamente!");

        // Actualizar el perfil del agente para reflejar las publicaciones disponibles
        await refreshProfile();
      }

      // 6. Éxito
      alert(
        status === "published"
          ? "¡Propiedad publicada exitosamente!"
          : "¡Propiedad guardada como borrador!"
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad: " + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agregar Nueva Propiedad
          </h1>
          <div className="flex items-center text-sm text-gray-600">
            <Zap className="h-4 w-4 mr-1" />
            <span>
              Publicaciones disponibles:{" "}
              {agentProfile?.publicaciones_disponibles}
            </span>
          </div>
        </div>

        {/* Mensaje informativo temporal */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            ℹ️ Información sobre Publicaciones
          </h2>
          <p className="text-blue-700 text-sm">
            Si aparece "0 publicaciones disponibles", ejecuta el script SQL{" "}
            <code>fix-publicaciones-disponibles.sql</code> en Supabase para
            restablecer tus publicaciones.
            <br />
            <strong>Verificación temporal deshabilitada</strong> - Puedes crear
            propiedades normalmente.
          </p>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, "published")}
          className="space-y-8"
        >
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Información Básica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Propiedad *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Casa moderna con piscina en La Kennedy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe las características principales de la propiedad..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Propiedad *
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transacción *
                </label>
                <select
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="flex">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="150000"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Destacar
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_urgent"
                    checked={formData.is_urgent}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Urgente
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Square className="h-5 w-5 mr-2" />
              Características
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bed className="inline h-4 w-4 mr-1" />
                  Dormitorios
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bath className="inline h-4 w-4 mr-1" />
                  Baños
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="inline h-4 w-4 mr-1" />
                  Estacionamientos
                </label>
                <input
                  type="number"
                  name="parking_spaces"
                  value={formData.parking_spaces}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área Total (m²)
                </label>
                <input
                  type="number"
                  name="area_total"
                  value={formData.area_total}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área Construida (m²)
                </label>
                <input
                  type="number"
                  name="area_constructed"
                  value={formData.area_constructed}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Año de Construcción
                </label>
                <input
                  type="number"
                  name="year_built"
                  value={formData.year_built}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Piso
                </label>
                <input
                  type="number"
                  name="floor_number"
                  value={formData.floor_number}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Pisos
                </label>
                <input
                  type="number"
                  name="total_floors"
                  value={formData.total_floors}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Ubicación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Av. 9 de Octubre y Malecón"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barrio/Sector
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: La Kennedy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Guayaquil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia *
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Guayas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="090150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="-2.1709"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="-79.9224"
                />
              </div>
            </div>
          </div>

          {/* Amenidades */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Amenidades
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {AMENITIES_OPTIONS.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenitiesChange(amenity)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Características Adicionales */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Características Adicionales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES_OPTIONS.map((feature) => (
                <label key={feature.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features[feature.key] || false}
                    onChange={() => handleFeatureChange(feature.key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Imágenes de la Propiedad
            </h2>

            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 10}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    {selectedImages.length >= 10
                      ? "Máximo 10 imágenes alcanzado"
                      : "Haz clic para subir imágenes (máximo 10)"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos: JPG, PNG, WebP
                  </p>
                </button>
              </div>

              {/* Vista previa de imágenes */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={loading || uploadingImages}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Clock className="animate-spin h-4 w-4 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                uploadingImages ||
                !formData.title ||
                !formData.price ||
                !formData.address
              }
              className="flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Clock className="animate-spin h-4 w-4 mr-2" />
                  {uploadingImages ? "Subiendo imágenes..." : "Publicando..."}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publicar Propiedad
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
