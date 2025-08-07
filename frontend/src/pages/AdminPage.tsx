import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
  User,
  LogOut,
  CheckCircle,
  Users,
  Clock,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface AgentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  company_name: string;
  website_url: string;
  description: string;
  approval_status: "pending" | "approved" | "rejected";
  applied_at: string;
  approval_notes: string;
}

export function AdminPage() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<AgentApplication | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Cargar aplicaciones de agentes
  const loadApplications = async () => {
    try {
      setLoadingApplications(true);

      // Query simple SIN JOINs - todos los datos están en la tabla agents
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("applied_at", { ascending: false });

      if (error) {
        console.error("Error cargando aplicaciones:", error);
        return;
      }

      setApplications(data || []);
    } catch (err) {
      console.error("Error cargando aplicaciones:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Aprobar agente
  const handleApproval = async (
    agentId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      setProcessingAction(agentId);

      // 1. Actualizar tabla agents
      const { error: agentError } = await supabase
        .from("agents")
        .update({
          approval_status: status,
          approval_notes: approvalNotes,
          approved_by: user?.id,
          publicaciones_disponibles: status === "approved" ? 2 : 0, // Dar 2 publicaciones si es aprobado
          is_verified: status === "approved",
        })
        .eq("id", agentId);

      if (agentError) throw agentError;

      // 2. Si es aprobado, actualizar rol en user_profiles
      if (status === "approved") {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({ role: "agent" })
          .eq("id", agentId);

        if (profileError) throw profileError;
      }

      // 3. Recargar aplicaciones
      await loadApplications();
      setSelectedApplication(null);
      setApprovalNotes("");
    } catch (error) {
      console.error("Error procesando aplicación:", error);
      alert("Error al procesar la aplicación");
    } finally {
      setProcessingAction(null);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadApplications();
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  // Filtrar aplicaciones por estado
  const pendingApplications = applications.filter(
    (app) => app.approval_status === "pending"
  );
  const approvedApplications = applications.filter(
    (app) => app.approval_status === "approved"
  );
  const rejectedApplications = applications.filter(
    (app) => app.approval_status === "rejected"
  );

  // Función para obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendiente
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aprobado
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Administrador
                </h1>
                <p className="text-sm text-gray-500">
                  Gestión de Aplicaciones de Agentes
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pendientes
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingApplications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Aprobados
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {approvedApplications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Rechazados
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    {rejectedApplications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Total</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {applications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de aplicaciones */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Aplicaciones de Agentes
            </h3>
          </div>

          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay aplicaciones
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No se han enviado aplicaciones para ser agente aún.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {application.full_name || application.email}
                          </p>
                          <div className="ml-2">
                            {getStatusBadge(application.approval_status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {application.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          Aplicado:{" "}
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </button>

                      {application.approval_status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setApprovalNotes(
                                "Aplicación aprobada. Bienvenido al equipo de agentes."
                              );
                            }}
                            disabled={processingAction === application.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {processingAction === application.id
                              ? "Procesando..."
                              : "Aprobar"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setApprovalNotes(
                                "Aplicación rechazada. Por favor revisa los requisitos."
                              );
                            }}
                            disabled={processingAction === application.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {processingAction === application.id
                              ? "Procesando..."
                              : "Rechazar"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles de la Aplicación
              </h3>
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setApprovalNotes("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.full_name || "No especificado"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.phone || "No especificado"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de Licencia
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.license_number || "No especificado"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Empresa
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.company_name || "No especificado"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sitio Web
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.website_url || "No especificado"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedApplication.description || "No especificado"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedApplication.approval_status)}
                </div>
              </div>

              {selectedApplication.approval_status === "pending" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notas de Aprobación
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa notas para el aplicante..."
                  />
                </div>
              )}

              {selectedApplication.approval_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notas del Administrador
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedApplication.approval_notes}
                  </p>
                </div>
              )}
            </div>

            {selectedApplication.approval_status === "pending" && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() =>
                    handleApproval(selectedApplication.id, "rejected")
                  }
                  disabled={processingAction === selectedApplication.id}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {processingAction === selectedApplication.id
                    ? "Procesando..."
                    : "Rechazar"}
                </button>
                <button
                  onClick={() =>
                    handleApproval(selectedApplication.id, "approved")
                  }
                  disabled={processingAction === selectedApplication.id}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {processingAction === selectedApplication.id
                    ? "Procesando..."
                    : "Aprobar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
