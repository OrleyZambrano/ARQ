import { supabase } from "../lib/supabase";

export interface UploadImageOptions {
  file: File;
  userId: string;
  bucketName?: "property-images" | "profile-images";
}

export interface UploadImageResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * FUNCIÓN DE CARGA DIRECTA CON FETCH - WORKAROUND PARA BUG DE SUPABASE
 * Esta función bypassa el cliente de Supabase JS y usa fetch directamente
 */
export async function uploadImageDirect({
  file,
  userId,
  bucketName = "property-images",
}: UploadImageOptions): Promise<UploadImageResult> {
  try {
    // Validar que es una imagen
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen");
    }

    // Validar tipos permitidos
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Tipo de archivo no permitido. Usa: ${allowedTypes.join(", ")}`
      );
    }

    // Validar tamaño según el bucket
    const maxSize =
      bucketName === "property-images" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(`El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`);
    }

    // Generar nombre único
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Upload directo usando fetch API

    // Obtener configuración de Supabase desde variables de entorno
    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL ||
      "https://vxmpifukfohjafrbiqvw.supabase.co";
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDUwNDYsImV4cCI6MjA2OTM4MTA0Nn0.JPwFO4UL-LileKVD6JDVZc2RrfCFsK5KgKlS5CFkUPc";

    // Crear FormData con el archivo
    const formData = new FormData();
    formData.append("file", file, fileName);

    // Headers para la petición directa
    const headers: HeadersInit = {
      Authorization: `Bearer ${supabaseKey}`,
      "x-upsert": "false",
      // NO incluir Content-Type - let FormData set it automatically
    };

    // URL directa a la API de Storage
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;

    // Petición directa con fetch
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    // Obtener URL pública (el result no se necesita para el Supabase public URL)
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error(`💥 Error en uploadImageDirect (${bucketName}):`, error);
    return {
      url: "",
      path: "",
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Función específica para subir imágenes de propiedades (método directo)
 */
export async function uploadPropertyImageDirect({
  file,
  userId,
}: Omit<UploadImageOptions, "bucketName">): Promise<UploadImageResult> {
  return uploadImageDirect({ file, userId, bucketName: "property-images" });
}

/**
 * Función específica para subir fotos de perfil (método directo)
 */
export async function uploadProfileImageDirect({
  file,
  userId,
}: Omit<UploadImageOptions, "bucketName">): Promise<UploadImageResult> {
  return uploadImageDirect({ file, userId, bucketName: "profile-images" });
}
