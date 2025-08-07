import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface VisitSchedulerProps {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface VisitRequest {
  property_id: string;
  agent_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
}

const VisitScheduler: React.FC<VisitSchedulerProps> = ({
  propertyId,
  propertyTitle,
  propertyAddress,
  agentId,
  isOpen,
  onClose,
  onScheduled
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    message: ''
  });

  // Generar fechas disponibles (próximos 30 días, excluyendo fines de semana)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Excluir fines de semana
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  // Generar horarios disponibles
  const generateTimeSlots = (): TimeSlot[] => {
    const slots = [];
    const startHour = 9; // 9:00 AM
    const endHour = 18;  // 6:00 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: true
      });
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        available: true
      });
    }
    
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !formData.name || !formData.email) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      const visitData: Partial<VisitRequest> = {
        property_id: propertyId,
        agent_id: agentId,
        visitor_name: formData.name,
        visitor_email: formData.email,
        visitor_phone: formData.phone,
        preferred_date: selectedDate,
        preferred_time: selectedTime,
        message: formData.message,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('property_visits')
        .insert([visitData])
        .select()
        .single();

      if (error) throw error;

      // Enviar notificación al agente (opcional)
      await sendNotificationToAgent(data);

      onScheduled?.();
      setCurrentStep(3); // Mostrar confirmación
      
    } catch (error) {
      console.error('Error scheduling visit:', error);
      alert('Error al agendar la visita. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToAgent = async (visitData: any) => {
    try {
      // Aquí podrías integrar con un servicio de email o notificaciones push
      console.log('Notification sent to agent:', visitData);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setFormData({
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      message: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Agendar Visita
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{propertyTitle}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{propertyAddress}</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Select Date */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Selecciona una fecha
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      selectedDate === date
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {formatDateDisplay(date)}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedDate}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Time & Contact Info */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Horario y datos de contacto
              </h3>
              
              {/* Selected Date Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Fecha seleccionada:</strong> {formatDateDisplay(selectedDate)}
                </p>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario preferido
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-2 text-sm rounded border transition-colors ${
                        selectedTime === slot.time
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : slot.available
                          ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      className="input-field pl-10"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="input-field pl-10"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      className="input-field pl-10"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje adicional
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Información adicional o preguntas específicas..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedTime || !formData.name || !formData.email}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Agendando...' : 'Agendar Visita'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Visita Agendada!
              </h3>
              <p className="text-gray-600 mb-6">
                Tu solicitud de visita ha sido enviada al agente. Te contactarán pronto para confirmar los detalles.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Resumen de tu visita:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Fecha:</strong> {formatDateDisplay(selectedDate)}</p>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  <p><strong>Contacto:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  {formData.phone && <p><strong>Teléfono:</strong> {formData.phone}</p>}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn-primary w-full"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitScheduler;
