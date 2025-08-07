import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVisits, PropertyVisit } from '../hooks/useVisits';
import { Link, Navigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Eye, 
  Phone,
  Mail,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export function MyVisitsPage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    visits, 
    loading, 
    error, 
    getVisitsByUser, 
    cancelVisit 
  } = useVisits();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState('');

  useEffect(() => {
    if (user?.email) {
      getVisitsByUser(user.email);
    }
  }, [user?.email, getVisitsByUser]);

  const filteredVisits = visits.filter(visit => {
    if (selectedStatus === 'all') return true;
    return visit.status === selectedStatus;
  });

  const getStatusIcon = (status: PropertyVisit['status']) => {
    const icons = {
      pending: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      confirmed: <CheckCircle className="h-5 w-5 text-green-600" />,
      rejected: <XCircle className="h-5 w-5 text-red-600" />,
      completed: <CheckCircle className="h-5 w-5 text-blue-600" />,
      cancelled: <X className="h-5 w-5 text-gray-600" />
    };
    return icons[status] || icons.pending;
  };

  const getStatusColor = (status: PropertyVisit['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: PropertyVisit['status']) => {
    const labels = {
      pending: 'Pendiente de confirmación',
      confirmed: 'Confirmada',
      rejected: 'Rechazada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status: PropertyVisit['status']) => {
    const descriptions = {
      pending: 'El agente revisará tu solicitud y te contactará pronto',
      confirmed: 'Tu visita ha sido confirmada por el agente',
      rejected: 'El agente no pudo aceptar esta visita',
      completed: 'La visita se realizó exitosamente',
      cancelled: 'Esta visita fue cancelada'
    };
    return descriptions[status] || '';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelVisit = async () => {
    if (!selectedVisitId) return;

    const success = await cancelVisit(selectedVisitId);

    if (success) {
      setShowCancelModal(false);
      setSelectedVisitId('');
    }
  };

  const openCancelModal = (visitId: string) => {
    setSelectedVisitId(visitId);
    setShowCancelModal(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Visitas</h1>
              <p className="mt-2 text-gray-600">
                Gestiona todas tus visitas programadas a propiedades
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field py-2"
              >
                <option value="all">Todas las visitas</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Completadas</option>
                <option value="rejected">Rechazadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatus === 'all' 
                  ? 'No tienes visitas programadas' 
                  : `No tienes visitas ${getStatusLabel(selectedStatus as PropertyVisit['status']).toLowerCase()}`
                }
              </h3>
              <p className="text-gray-600 mb-6">
                Explora propiedades y agenda tu primera visita
              </p>
              <Link 
                to="/properties" 
                className="btn-primary"
              >
                Explorar Propiedades
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVisits.map((visit: any) => (
                <div key={visit.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Property Info */}
                      <div className="flex items-start space-x-4">
                        {visit.properties?.images?.[0] && (
                          <img
                            src={visit.properties.images[0]}
                            alt={visit.properties.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {visit.properties?.title || 'Propiedad'}
                            </h3>
                            <Link
                              to={`/properties/${visit.property_id}`}
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{visit.properties?.address || 'Dirección no disponible'}</span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(visit.status)}
                              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(visit.status)}`}>
                                {getStatusLabel(visit.status)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">
                            {getStatusDescription(visit.status)}
                          </p>

                          {/* Visit Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Fecha solicitada</h4>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{formatDate(visit.preferred_date)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{visit.preferred_time}</span>
                              </div>
                            </div>

                            {visit.status === 'confirmed' && visit.confirmed_date && visit.confirmed_time && (
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-900 mb-2">Fecha confirmada</h4>
                                <div className="flex items-center text-sm text-green-700">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{formatDate(visit.confirmed_date)}</span>
                                </div>
                                <div className="flex items-center text-sm text-green-700 mt-1">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>{visit.confirmed_time}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Message */}
                          {visit.message && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                              <h4 className="font-medium text-blue-900 mb-1">Tu mensaje</h4>
                              <p className="text-sm text-blue-700">{visit.message}</p>
                            </div>
                          )}

                          {/* Agent Notes */}
                          {visit.agent_notes && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                              <h4 className="font-medium text-yellow-900 mb-1">Notas del agente</h4>
                              <p className="text-sm text-yellow-700">{visit.agent_notes}</p>
                            </div>
                          )}

                          {/* Contact Info */}
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              <span>{visit.visitor_email}</span>
                            </div>
                            {visit.visitor_phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                <span>{visit.visitor_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {(visit.status === 'pending' || visit.status === 'confirmed') && (
                        <button
                          onClick={() => openCancelModal(visit.id)}
                          className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-sm px-3 py-1"
                        >
                          Cancelar
                        </button>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Creada: {new Date(visit.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cancelar Visita
              </h3>
              
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres cancelar esta visita? Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary"
                >
                  Mantener visita
                </button>
                <button
                  onClick={handleCancelVisit}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Cancelar visita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
