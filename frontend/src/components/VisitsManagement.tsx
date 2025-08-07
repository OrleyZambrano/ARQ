import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVisits, PropertyVisit } from '../hooks/useVisits';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  X, 
  Filter,
  ChevronDown
} from 'lucide-react';

interface VisitsManagementProps {
  className?: string;
}

const VisitsManagement: React.FC<VisitsManagementProps> = ({ className = "" }) => {
  const { agentProfile } = useAuth();
  const { 
    visits, 
    loading, 
    error, 
    getVisitsByAgent, 
    confirmVisit, 
    rejectVisit,
    updateVisitStatus 
  } = useVisits();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState({
    visitId: '',
    date: '',
    time: '',
    notes: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState('');

  useEffect(() => {
    if (agentProfile?.id) {
      getVisitsByAgent(agentProfile.id);
    }
  }, [agentProfile?.id, getVisitsByAgent]);

  const filteredVisits = visits.filter(visit => {
    if (selectedStatus === 'all') return true;
    return visit.status === selectedStatus;
  });

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
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      rejected: 'Rechazada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
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

  const handleConfirmVisit = async () => {
    if (!confirmationData.visitId || !confirmationData.date || !confirmationData.time) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const success = await confirmVisit(
      confirmationData.visitId,
      confirmationData.date,
      confirmationData.time,
      confirmationData.notes
    );

    if (success) {
      setShowConfirmModal(false);
      setConfirmationData({ visitId: '', date: '', time: '', notes: '' });
    }
  };

  const handleRejectVisit = async () => {
    if (!selectedVisitId) return;

    const success = await rejectVisit(selectedVisitId, rejectReason);

    if (success) {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedVisitId('');
    }
  };

  const handleMarkCompleted = async (visitId: string) => {
    await updateVisitStatus(visitId, 'completed');
  };

  const openConfirmModal = (visit: PropertyVisit) => {
    setConfirmationData({
      visitId: visit.id,
      date: visit.preferred_date,
      time: visit.preferred_time,
      notes: ''
    });
    setShowConfirmModal(true);
  };

  const openRejectModal = (visitId: string) => {
    setSelectedVisitId(visitId);
    setShowRejectModal(true);
  };

  if (!agentProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Solo los agentes pueden gestionar visitas.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Visitas
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field pl-10 pr-8 py-2"
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
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? 'No tienes visitas programadas aún' 
                : `No hay visitas ${getStatusLabel(selectedStatus as PropertyVisit['status']).toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVisits.map((visit: any) => (
              <div key={visit.id} className="border rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {visit.properties?.title || 'Propiedad'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(visit.status)}`}>
                          {getStatusLabel(visit.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{visit.properties?.address || 'Dirección no disponible'}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(visit.preferred_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{visit.preferred_time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{visit.visitor_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ChevronDown className={`h-5 w-5 transform transition-transform ${
                          expandedVisit === visit.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedVisit === visit.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Información de contacto</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              <span>{visit.visitor_email}</span>
                            </div>
                            {visit.visitor_phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{visit.visitor_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {visit.message && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Mensaje del visitante</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {visit.message}
                            </p>
                          </div>
                        )}
                      </div>

                      {visit.agent_notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Notas del agente</h4>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            {visit.agent_notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {visit.status === 'pending' && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openConfirmModal(visit)}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <Check className="h-4 w-4" />
                            <span>Confirmar</span>
                          </button>
                          <button
                            onClick={() => openRejectModal(visit.id)}
                            className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <X className="h-4 w-4" />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      )}

                      {visit.status === 'confirmed' && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleMarkCompleted(visit.id)}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <Check className="h-4 w-4" />
                            <span>Marcar como completada</span>
                          </button>
                          <div className="text-sm text-gray-600">
                            {visit.confirmed_date && visit.confirmed_time && (
                              <span>
                                Confirmada para: {formatDate(visit.confirmed_date)} a las {visit.confirmed_time}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Visita
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha confirmada
                  </label>
                  <input
                    type="date"
                    value={confirmationData.date}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, date: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora confirmada
                  </label>
                  <input
                    type="time"
                    value={confirmationData.time}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, time: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    value={confirmationData.notes}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Instrucciones especiales, punto de encuentro, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmVisit}
                  className="btn-primary"
                >
                  Confirmar Visita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rechazar Visita
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del rechazo
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Explica el motivo del rechazo (opcional)"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejectVisit}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Rechazar Visita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitsManagement;
