import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Shield,
  Phone,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  Star,
  Clock,
  XCircle,
} from "lucide-react";

export function BecomeAgentPage() {
  const { user, isAgent, userProfile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    phone: "",
    licenseNumber: "",
    companyName: "",
    websiteUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentApplication, setAgentApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Verificar si ya tiene una aplicación de agente
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("agents")
          .select("id, approval_status, approval_notes")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setAgentApplication(data);
        }
      } catch (err) {
        // No hay aplicación existente
      } finally {
        setCheckingApplication(false);
      }
    };

    checkExistingApplication();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si ya es agente aprobado, redirigir al dashboard
  if (isAgent || agentApplication?.approval_status === "approved") {
    return <Navigate to="/agent-dashboard" replace />;
  }

  // Si está cargando la verificación
  if (checkingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si ya tiene una aplicación pendiente, mostrar mensaje
  if (agentApplication?.approval_status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Aplicación Pendiente
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tu solicitud para ser agente está siendo revisada por un
              administrador.
            </p>
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ¿Qué sigue?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Un administrador revisará tu aplicación</li>
                      <li>Recibirás una notificación cuando sea aprobada</li>
                      <li>
                        Una vez aprobada, tendrás acceso completo como agente
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si fue rechazado, mostrar mensaje con opción de reaplicar
  if (agentApplication?.approval_status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Aplicación Rechazada
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tu solicitud para ser agente fue rechazada.
            </p>
            {agentApplication.approval_notes && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  <strong>Motivo:</strong> {agentApplication.approval_notes}
                </p>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setAgentApplication(null);
                  setError("");
                }}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Aplicar Nuevamente
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verificar si ya aplicó antes
      const { data: existingApplication } = await supabase
        .from("agents")
        .select("id, approval_status, approval_notes")
        .eq("id", user.id)
        .single();

      if (existingApplication) {
        if (existingApplication.approval_status === "pending") {
          setError(
            "Ya tienes una aplicación pendiente de aprobación. Espera la respuesta del administrador."
          );
          setLoading(false);
          return;
        } else if (existingApplication.approval_status === "approved") {
          setError("Ya eres un agente aprobado.");
          setLoading(false);
          return;
        } else if (existingApplication.approval_status === "rejected") {
          setError(
            `Tu aplicación fue rechazada. Motivo: ${
              existingApplication.approval_notes || "Contacta al administrador"
            }`
          );
          setLoading(false);
          return;
        }
      }

      // 2. Crear aplicación para ser agente (PENDIENTE de aprobación)
      // Obtener el nombre completo de diferentes fuentes
      const fullName =
        userProfile?.full_name ||
        `${userProfile?.first_name || ""} ${
          userProfile?.last_name || ""
        }`.trim() ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Usuario";

      const { error: agentError } = await supabase.from("agents").insert({
        id: user.id,
        full_name: fullName,
        first_name:
          userProfile?.first_name || user.user_metadata?.first_name || "",
        last_name:
          userProfile?.last_name || user.user_metadata?.last_name || "",
        email: user.email,
        phone: formData.phone,
        license_number: formData.licenseNumber || null,
        company_name: formData.companyName || null,
        website_url: formData.websiteUrl || null,
        description: formData.description || null,
        credits: 0, // Sin créditos hasta ser aprobado
        is_verified: false,
        rating: 0.0,
        total_ratings: 0,
        approval_status: "pending", // PENDIENTE de aprobación
        applied_at: new Date().toISOString(),
      });

      if (agentError) throw agentError;

      // 3. Actualizar teléfono en user_profiles (NO cambiar rol aún)
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 4. Refrescar perfil
      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      if (err.code === "23505") {
        // Duplicate key error
        setError(
          "Ya tienes una aplicación registrada. Contacta al administrador."
        );
      } else {
        setError(err.message || "Error al enviar aplicación");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100">
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ¡Aplicación Enviada!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tu solicitud para ser agente ha sido enviada y está pendiente de
              aprobación
            </p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ¿Qué sigue?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc space-y-1 ml-5">
                      <li>Un administrador revisará tu aplicación</li>
                      <li>Recibirás una notificación cuando sea aprobada</li>
                      <li>
                        Una vez aprobada, tendrás acceso completo como agente
                      </li>
                      <li>
                        Incluirá 10 créditos iniciales para publicar propiedades
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => (window.location.href = "/")}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Convertirse en Agente
                </h1>
                <p className="text-sm text-gray-600">
                  Completa tu perfil para comenzar a vender propiedades
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Teléfono *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ej: +57 300 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Número de Licencia
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="licenseNumber"
                      id="licenseNumber"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ej: LIC-2024-001"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Empresa/Inmobiliaria
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ej: Inmobiliaria XYZ"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="websiteUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Sitio Web
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="websiteUrl"
                    id="websiteUrl"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://mi-sitio-web.com"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descripción Profesional
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe tu experiencia, especialización y qué te hace único como agente inmobiliario..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Star className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Beneficios de ser agente
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc space-y-1 ml-5">
                        <li>10 créditos iniciales gratuitos</li>
                        <li>Publica propiedades ilimitadas</li>
                        <li>Panel de control personalizado</li>
                        <li>Gestión de leads y contactos</li>
                        <li>Estadísticas de rendimiento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    "Convertirse en Agente"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
