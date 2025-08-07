import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  Mail,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface AgentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  specializations: string[];
  bio: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  approved_by?: string;
  approval_notes?: string;
  user_profiles?: {
    email: string;
    full_name: string;
  };
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const AdminPage: React.FC = () => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<AgentApplication | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Verificar que el usuario es admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      window.location.href = '/login';
    }
  }, [user, isAdmin, loading]);

  // Cargar aplicaciones
  useEffect(() => {
    if (isAdmin) {
      loadApplications();
    }
  }, [isAdmin]);

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          user_profiles!inner(email, full_name)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      
      // Calcular estadísticas
      const newStats = {
        total: data?.length || 0,
        pending: data?.filter(app => app.approval_status === 'pending').length || 0,
        approved: data?.filter(app => app.approval_status === 'approved').length || 0,
        rejected: data?.filter(app => app.approval_status === 'rejected').length || 0,
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error cargando aplicaciones:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApproval = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessing(applicationId);

      const { error } = await supabase
        .from('agents')
        .update({
          approval_status: status,
          approved_by: user?.id,
          approval_notes: approvalNotes || null
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Si se aprueba, también actualizar el rol del usuario a 'agent'
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ role: 'agent' })
            .eq('id', applicationId);

          if (profileError) {
            console.error('Error actualizando rol:', profileError);
          }
        }
      }

      // Recargar aplicaciones
      await loadApplications();
      setSelectedApplication(null);
      setApprovalNotes('');

    } catch (error) {
      console.error('Error procesando aplicación:', error);
      alert('Error procesando la aplicación');
    } finally {
      setProcessing(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.approval_status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  Gestiona las aplicaciones de agentes inmobiliarios
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprobados</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rechazados</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex space-x-4">
            {[
              { key: 'pending', label: 'Pendientes', count: stats.pending },
              { key: 'all', label: 'Todas', count: stats.total },
              { key: 'approved', label: 'Aprobadas', count: stats.approved },
              { key: 'rejected', label: 'Rechazadas', count: stats.rejected }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de aplicaciones */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Aplicaciones de Agentes ({filteredApplications.length})
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay aplicaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron aplicaciones con el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-medium text-gray-900 truncate">
                            {application.full_name}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {application.user_profiles?.email}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(application.applied_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(application.approval_status)}
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de la Aplicación
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Información personal */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información Personal</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nombre completo</p>
                      <p className="font-medium">{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedApplication.user_profiles?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Número de licencia</p>
                      <p className="font-medium">{selectedApplication.license_number}</p>
                    </div>
                  </div>
                </div>

                {/* Información profesional */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información Profesional</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <p className="text-gray-500">Años de experiencia</p>
                      <p className="font-medium">{selectedApplication.experience_years} años</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Especializaciones</p>
                      <p className="font-medium">{selectedApplication.specializations?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Biografía</p>
                      <p className="font-medium">{selectedApplication.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Estado y notas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Estado de la Aplicación</h4>
                  <div className="flex items-center space-x-4 mb-3">
                    {getStatusBadge(selectedApplication.approval_status)}
                    <span className="text-sm text-gray-500">
                      Aplicada el {formatDate(selectedApplication.applied_at)}
                    </span>
                  </div>
                  
                  {selectedApplication.approval_notes && (
                    <div className="mt-2">
                      <p className="text-gray-500 text-sm">Notas de aprobación</p>
                      <p className="font-medium text-sm">{selectedApplication.approval_notes}</p>
                    </div>
                  )}
                </div>

                {/* Acciones de aprobación */}
                {selectedApplication.approval_status === 'pending' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Acciones de Aprobación</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas (opcional)
                      </label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Agregar notas sobre la decisión..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproval(selectedApplication.id, 'approved')}
                        disabled={processing === selectedApplication.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {processing === selectedApplication.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprobar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApproval(selectedApplication.id, 'rejected')}
                        disabled={processing === selectedApplication.id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {processing === selectedApplication.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
