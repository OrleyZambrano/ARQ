import { useState } from "react";
import { supabase } from "../lib/supabase";

export function ImageTester() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const testImageAccess = async () => {
    setTesting(true);
    const results = [];

    // URL de prueba con cache-busting para forzar recarga
    const testImageUrl =
      "https://vxmpifukfohjafrbiqvw.supabase.co/storage/v1/object/public/property-images/5982d0f7-0cc1-43bb-b38f-c72461ee9838/1754545326814-bl1ku6js3c.png?t=" +
      Date.now();

    // Test 1: Fetch directo
    try {
      const response = await fetch(testImageUrl, { method: "HEAD" });
      results.push({
        test: "Fetch HEAD request",
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
      });
    } catch (error) {
      results.push({
        test: "Fetch HEAD request",
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });
    }

    // Test 2: Fetch completo
    try {
      const response = await fetch(testImageUrl);
      results.push({
        test: "Fetch GET request",
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
        success: response.ok,
      });
    } catch (error) {
      results.push({
        test: "Fetch GET request",
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });
    }

    // Test 3: Verificar si el archivo existe en Supabase
    try {
      const { data, error } = await supabase.storage
        .from("property-images")
        .list("5982d0f7-0cc1-43bb-b38f-c72461ee9838");

      results.push({
        test: "Supabase storage list",
        data: data,
        error: error,
        success: !error,
      });
    } catch (error) {
      results.push({
        test: "Supabase storage list",
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });
    }

    // Test 4: Intentar obtener URL pública desde Supabase
    try {
      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(
          "5982d0f7-0cc1-43bb-b38f-c72461ee9838/1754545326814-bl1ku6js3c.png"
        );

      results.push({
        test: "Supabase getPublicUrl",
        publicUrl: data.publicUrl,
        matches: data.publicUrl === testImageUrl,
        success: true,
      });
    } catch (error) {
      results.push({
        test: "Supabase getPublicUrl",
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });
    }

    // Test 5: Verificar políticas desde el cliente
    try {
      const { data, error } = await supabase
        .from("storage.objects")
        .select("*")
        .eq("bucket_id", "property-images")
        .limit(1);

      results.push({
        test: "Query storage.objects",
        data: data,
        error: error,
        success: !error,
      });
    } catch (error) {
      results.push({
        test: "Query storage.objects",
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico de Imágenes</h2>

      <button
        onClick={testImageAccess}
        disabled={testing}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? "Probando..." : "Ejecutar Pruebas"}
      </button>

      {testResults.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Resultados:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded border-l-4 ${
                result.success
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <h4 className="font-medium">{result.test}</h4>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
