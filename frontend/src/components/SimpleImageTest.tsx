import React, { useState } from "react";
import { uploadPropertyImageDirect } from "../utils/imageUploadDirect";

const SimpleImageTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🧪 SIMPLE TEST - Archivo seleccionado:", file.name, file.type);
    setUploading(true);
    setResult("");
    setImageUrl("");

    try {
      const uploadResult = await uploadPropertyImageDirect({
        file,
        userId: "test-property-123",
      });

      if (uploadResult.url && !uploadResult.error) {
        setResult(`✅ Upload exitoso!`);
        setImageUrl(uploadResult.url);
        console.log("🧪 SIMPLE TEST - Resultado:", uploadResult);
      } else {
        setResult(`❌ Error: ${uploadResult.error}`);
        console.error("🧪 SIMPLE TEST - Error:", uploadResult.error);
      }
    } catch (error) {
      setResult(`❌ Error inesperado: ${error}`);
      console.error("🧪 SIMPLE TEST - Error inesperado:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        🧪 Test Simple de Imágenes
      </h3>

      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        {uploading && (
          <div className="text-blue-600 font-medium">⏳ Subiendo imagen...</div>
        )}

        {result && (
          <div
            className={`p-3 rounded-md text-sm font-medium ${
              result.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {result}
          </div>
        )}

        {imageUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Vista previa:</p>
            <img
              src={imageUrl}
              alt="Test upload"
              className="w-full max-w-xs rounded-lg shadow-md border"
              onError={(e) => {
                console.error(
                  "🧪 SIMPLE TEST - Error cargando imagen:",
                  imageUrl
                );
                e.currentTarget.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3IgY2FyZ2FuZG8gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==";
              }}
              onLoad={() => {
                console.log(
                  "🧪 SIMPLE TEST - Imagen cargada correctamente:",
                  imageUrl
                );
              }}
            />
            <p className="text-xs text-gray-500 break-all">{imageUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleImageTest;
