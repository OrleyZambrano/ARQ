import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  transaction_type: string;
  bedrooms?: number;
  bathrooms?: number;
  area_total?: number;
  area_constructed?: number;
  parking_spaces?: number;
  floor_number?: number;
  total_floors?: number;
  year_built?: number;
  address: string;
  neighborhood?: string;
  city: string;
  province: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  features: any;
  images: string[];
  virtual_tour_url?: string;
  video_url?: string;
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
}

export const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState({
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
    parking_spaces: "",
    floor_number: "",
    total_floors: "",
    year_built: "",
    address: "",
    neighborhood: "",
    city: "",
    province: "",
    country: "Ecuador",
    postal_code: "",
    latitude: "",
    longitude: "",
    amenities: [] as string[],
    features: {},
    virtual_tour_url: "",
    video_url: "",
    status: "published",
    is_featured: false,
    is_urgent: false,
  });

  // Cargar datos de la propiedad
  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("agent_id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProperty(data);
        setExistingImages(data.images || []);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          currency: data.currency || "USD",
          property_type: data.property_type || "casa",
          transaction_type: data.transaction_type || "venta",
          bedrooms: data.bedrooms?.toString() || "",
          bathrooms: data.bathrooms?.toString() || "",
          area_total: data.area_total?.toString() || "",
          area_constructed: data.area_constructed?.toString() || "",
          parking_spaces: data.parking_spaces?.toString() || "",
          floor_number: data.floor_number?.toString() || "",
          total_floors: data.total_floors?.toString() || "",
          year_built: data.year_built?.toString() || "",
          address: data.address || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          province: data.province || "",
          country: data.country || "Ecuador",
          postal_code: data.postal_code || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          amenities: data.amenities || [],
          features: data.features || {},
          virtual_tour_url: data.virtual_tour_url || "",
          video_url: data.video_url || "",
          status: data.status || "published",
          is_featured: data.is_featured || false,
          is_urgent: data.is_urgent || false,
        });
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      alert("Error al cargar la propiedad");
      navigate("/my-properties");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    // Test simple del bucket: intentar obtener una URL pública
    try {
      console.log("Testing bucket access...");
      const testUrl = supabase.storage
        .from("property-images")
        .getPublicUrl("test");
      console.log("Bucket access test successful:", testUrl.data.publicUrl);
    } catch (error) {
      console.error("Bucket access test failed:", error);
    }

    for (const image of images) {
      // Validar que sea un archivo válido
      if (!image || !image.name || !image.type) {
        console.error("Invalid image file:", image);
        continue;
      }

      // Validar que sea una imagen
      if (!image.type.startsWith("image/")) {
        console.error("File is not an image:", image.type);
        throw new Error(`El archivo ${image.name} no es una imagen válida.`);
      }

      // Validar tamaño (máximo 10MB)
      if (image.size > 10 * 1024 * 1024) {
        throw new Error(`La imagen ${image.name} es muy grande. Máximo 10MB.`);
      }

      console.log("Uploading image:", {
        name: image.name,
        type: image.type,
        size: image.size,
        userId: user?.id,
      });

      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      console.log("Attempting upload with path:", filePath);
      console.log("User ID:", user?.id);
      console.log("File details:", {
        name: image.name,
        type: image.type,
        size: image.size,
        lastModified: image.lastModified,
        constructor: image.constructor.name,
        isFile: image instanceof File,
        isBlob: image instanceof Blob,
      });

      // Verificar que el archivo no esté vacío o corrupto
      if (image.size === 0) {
        throw new Error(`El archivo ${image.name} está vacío.`);
      }

      // Leer una pequeña muestra del archivo para verificar que es un archivo real
      try {
        const fileSlice = image.slice(0, 100);
        const arrayBuffer = await fileSlice.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        console.log(
          "File signature (first 10 bytes):",
          Array.from(bytes.slice(0, 10))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ")
        );

        // Verificar firmas de archivos de imagen
        const isPNG =
          bytes[0] === 0x89 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x4e &&
          bytes[3] === 0x47;
        const isJPEG =
          bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        console.log("File format validation:", {
          isPNG,
          isJPEG,
          detectedType: isPNG ? "PNG" : isJPEG ? "JPEG" : "Unknown",
        });

        if (
          !isPNG &&
          !isJPEG &&
          !image.type.includes("webp") &&
          !image.type.includes("gif")
        ) {
          throw new Error(
            `El archivo ${image.name} no parece ser una imagen válida.`
          );
        }
      } catch (validationError: any) {
        console.error("File validation error:", validationError);
        throw new Error(
          `Error validando el archivo ${image.name}: ${
            validationError?.message || "Error desconocido"
          }`
        );
      }

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, image, {
          contentType: image.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          error: uploadError,
          filePath,
          imageType: image.type,
          imageSize: image.size,
        });
        if (uploadError.message.includes("mime type")) {
          throw new Error(
            `Tipo de archivo no soportado: ${image.type}. Usa JPG, PNG, WebP o GIF.`
          );
        }
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "El almacenamiento de imágenes no está configurado. Contacta al administrador."
          );
        }
        if (
          uploadError.message.includes("not authorized") ||
          uploadError.message.includes("permission")
        ) {
          throw new Error(
            "No tienes permisos para subir imágenes. Verifica que estés autenticado."
          );
        }
        if (uploadError.message.includes("already exists")) {
          // Intentar con upsert si el archivo ya existe
          const { error: upsertError } = await supabase.storage
            .from("property-images")
            .upload(filePath, image, {
              contentType: image.type,
              cacheControl: "3600",
              upsert: true, // Sobrescribir si existe
            });

          if (upsertError) {
            throw new Error(
              `Error subiendo ${image.name}: ${upsertError.message}`
            );
          }
        } else {
          throw new Error(
            `Error subiendo ${image.name}: ${uploadError.message}`
          );
        }
      }

      console.log("Upload successful for:", image.name);

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);

      // Debug: verificar formato de URL
      console.log("URL analysis:", {
        url: publicUrl,
        hasProtocol: publicUrl.startsWith("http"),
        domain: publicUrl.split("/")[2],
        path: publicUrl.split("/").slice(3).join("/"),
        isValidUrl: /^https?:\/\/.+/.test(publicUrl),
      });

      // Verificar que el archivo realmente existe después de subirlo
      try {
        const { data: listResult, error: listError } = await supabase.storage
          .from("property-images")
          .list(filePath.split('/')[0]); // Listar archivos en el directorio del usuario
          
        if (listError) {
          console.error("Error listing files:", listError);
        } else {
          const fileName = filePath.split('/')[1];
          const fileExists = listResult.some(file => file.name === fileName);
          console.log("File existence check:", {
            fileName,
            exists: fileExists,
            allFilesInDirectory: listResult.map(f => f.name)
          });
        }
      } catch (existError) {
        console.error("Error checking file existence:", existError);
      }

      uploadedUrls.push(publicUrl);
    }

    console.log("All uploads completed. URLs:", uploadedUrls);
    return uploadedUrls;
  };

  const deleteImages = async (imageUrls: string[]) => {
    for (const imageUrl of imageUrls) {
      const path = imageUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("property-images").remove([path]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log("Starting property update with images:", images.length);

      // Subir nuevas imágenes
      const newImageUrls = await uploadImages();
      console.log("New images uploaded:", newImageUrls);

      // Eliminar imágenes marcadas para borrar
      if (imagesToDelete.length > 0) {
        console.log("Deleting images:", imagesToDelete);
        await deleteImages(imagesToDelete);
      }

      // Combinar imágenes existentes con las nuevas
      const allImages = [...existingImages, ...newImageUrls];

      // Debug: analizar diferencias entre URLs viejas y nuevas
      console.log("Image URLs comparison:");
      console.table(
        existingImages.map((url, i) => ({
          index: i,
          type: 'existing',
          url,
          isRelative: !url.startsWith("http"),
          domain: url.includes("//") ? url.split("/")[2] : "no-domain",
          path: url.includes("//") ? url.split("/").slice(3).join("/") : url,
        }))
      );
      console.table(
        newImageUrls.map((url, i) => ({
          index: i,
          type: 'new',
          url,
          isRelative: !url.startsWith("http"),
          domain: url.includes("//") ? url.split("/")[2] : "no-domain",
          path: url.includes("//") ? url.split("/").slice(3).join("/") : url,
        }))
      );
      console.log("Total images after merge:", allImages.length);

      // Actualizar propiedad
      const { error } = await supabase
        .from("properties")
        .update({
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
          parking_spaces: formData.parking_spaces
            ? parseInt(formData.parking_spaces)
            : 0,
          floor_number: formData.floor_number
            ? parseInt(formData.floor_number)
            : null,
          total_floors: formData.total_floors
            ? parseInt(formData.total_floors)
            : null,
          year_built: formData.year_built
            ? parseInt(formData.year_built)
            : null,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          postal_code: formData.postal_code,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          amenities: formData.amenities,
          features: formData.features,
          images: allImages,
          virtual_tour_url: formData.virtual_tour_url,
          video_url: formData.video_url,
          status: formData.status,
          is_featured: formData.is_featured,
          is_urgent: formData.is_urgent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      alert("Propiedad actualizada exitosamente");
      navigate("/my-properties");
    } catch (error: any) {
      console.error("Error updating property:", error);

      // Mostrar mensaje de error más específico
      let errorMessage = "Error al actualizar la propiedad";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const amenitiesList = [
    "piscina",
    "gimnasio",
    "seguridad_24h",
    "ascensor",
    "terraza",
    "balcon",
    "jardin",
    "garage",
    "aire_acondicionado",
    "calefaccion",
    "chimenea",
    "lavanderia",
    "deposito",
    "portero",
    "salon_eventos",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Propiedad no encontrada
          </h2>
          <button
            onClick={() => navigate("/my-properties")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a Mis Propiedades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Propiedad
            </h1>
            <button
              onClick={() => navigate("/my-properties")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Casa moderna en excelente ubicación"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio *
                  </label>
                  <div className="flex">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50"
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
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Propiedad *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="oficina">Oficina</option>
                    <option value="local_comercial">Local Comercial</option>
                    <option value="terreno">Terreno</option>
                    <option value="bodega">Bodega</option>
                    <option value="quinta">Quinta</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Transacción *
                  </label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe las características principales de la propiedad..."
                />
              </div>
            </div>

            {/* Características */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Características
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dormitorios
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Baños
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área Total (m²)
                  </label>
                  <input
                    type="number"
                    name="area_total"
                    value={formData.area_total}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área Construida (m²)
                  </label>
                  <input
                    type="number"
                    name="area_constructed"
                    value={formData.area_constructed}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estacionamientos
                  </label>
                  <input
                    type="number"
                    name="parking_spaces"
                    value={formData.parking_spaces}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Piso
                  </label>
                  <input
                    type="number"
                    name="floor_number"
                    value={formData.floor_number}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Pisos
                  </label>
                  <input
                    type="number"
                    name="total_floors"
                    value={formData.total_floors}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año de Construcción
                  </label>
                  <input
                    type="number"
                    name="year_built"
                    value={formData.year_built}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ubicación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector/Barrio
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="any"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="any"
                  />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Imágenes
              </h2>

              {/* Imágenes existentes */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Imágenes actuales:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error(
                              `Error loading existing image ${index}:`,
                              imageUrl
                            );
                            console.log("Image element:", e.target);
                          }}
                          onLoad={() => {
                            console.log(
                              `Successfully loaded existing image ${index}:`,
                              imageUrl
                            );
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                        {/* Botón temporal para probar URL */}
                        <button
                          type="button"
                          onClick={() => window.open(imageUrl, "_blank")}
                          className="absolute bottom-2 left-2 bg-blue-500 text-white rounded px-2 py-1 text-xs"
                        >
                          Test
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nuevas imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agregar nuevas imágenes
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Nueva imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amenidades */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Amenidades
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {amenity.replace("_", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estado y Opciones */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Estado y Opciones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicada</option>
                    <option value="suspended">Suspendida</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Destacada</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_urgent"
                      checked={formData.is_urgent}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Urgente</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/my-properties")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Actualizar Propiedad"}
              </button>
              {/* Botón temporal para probar bucket */}
              <button
                type="button"
                onClick={testAndFixBucketPolicies}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Test Bucket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Test bucket policies function
  async function testAndFixBucketPolicies() {
    try {
      console.log('Testing bucket policies...');
      
      // Test public access to an existing file
      const testImageUrl = 'https://vxmpifukfohjafrbiqvw.supabase.co/storage/v1/object/public/property-images/e1eda88b-4f03-41d3-b311-2a019073d80f/1754677725341-vx7ms3hfd9l.png';
      
      const response = await fetch(testImageUrl, { method: 'HEAD' });
      console.log('Direct fetch test:', {
        url: testImageUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.status === 403 || response.status === 401) {
        console.log('Bucket access denied - need to fix policies');
        
        // Try to list bucket files to check permissions
        const { data: files, error: listError } = await supabase.storage
          .from('property-images')
          .list('', { limit: 5 });
          
        console.log('List files test:', { files, listError });
        
        // Try to get bucket info
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Buckets info:', { buckets, bucketsError });
        
      } else if (response.ok) {
        console.log('Bucket access working correctly');
      }
      
    } catch (error) {
      console.error('Error testing bucket policies:', error);
    }
  }
};
