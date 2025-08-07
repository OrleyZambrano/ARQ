import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface PropertyVisit {
  id: string;
  property_id: string;
  agent_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  agent_notes?: string;
  confirmed_date?: string;
  confirmed_time?: string;
  created_at: string;
  updated_at: string;
}

interface UseVisitsReturn {
  visits: PropertyVisit[];
  loading: boolean;
  error: string | null;
  createVisit: (visitData: Partial<PropertyVisit>) => Promise<PropertyVisit | null>;
  updateVisitStatus: (visitId: string, status: PropertyVisit['status'], notes?: string) => Promise<boolean>;
  getVisitsByProperty: (propertyId: string) => Promise<void>;
  getVisitsByAgent: (agentId: string) => Promise<void>;
  getVisitsByUser: (userEmail: string) => Promise<void>;
  confirmVisit: (visitId: string, confirmedDate: string, confirmedTime: string, notes?: string) => Promise<boolean>;
  rejectVisit: (visitId: string, reason?: string) => Promise<boolean>;
  cancelVisit: (visitId: string) => Promise<boolean>;
  refreshVisits: () => Promise<void>;
}

/**
 * Hook para manejo de visitas a propiedades
 */
export const useVisits = (): UseVisitsReturn => {
  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Crear una nueva solicitud de visita
   */
  const createVisit = useCallback(async (visitData: Partial<PropertyVisit>): Promise<PropertyVisit | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('property_visits')
        .insert([{
          ...visitData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar la lista local
      setVisits(prev => [data, ...prev]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando visita';
      setError(errorMessage);
      console.error('Error creating visit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar el estado de una visita
   */
  const updateVisitStatus = useCallback(async (
    visitId: string, 
    status: PropertyVisit['status'], 
    notes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.agent_notes = notes;
      }

      const { error } = await supabase
        .from('property_visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) {
        // Manejo específico de errores de permisos
        if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('forbidden')) {
          throw new Error('No tienes permisos para realizar esta acción. Verifica que seas el propietario de la visita.');
        }
        throw error;
      }

      // Actualizar la lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, status, agent_notes: notes || visit.agent_notes, updated_at: updateData.updated_at }
          : visit
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando visita';
      setError(errorMessage);
      console.error('Error updating visit status:', err);
      // Mostrar el error al usuario de forma más clara
      if (errorMessage.includes('permisos') || errorMessage.includes('forbidden')) {
        alert('Error de permisos: ' + errorMessage);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirmar una visita con fecha y hora específica
   */
  const confirmVisit = useCallback(async (
    visitId: string, 
    confirmedDate: string, 
    confirmedTime: string, 
    notes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        status: 'confirmed' as const,
        confirmed_date: confirmedDate,
        confirmed_time: confirmedTime,
        agent_notes: notes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('property_visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) throw error;

      // Actualizar la lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updateData }
          : visit
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error confirmando visita';
      setError(errorMessage);
      console.error('Error confirming visit:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rechazar una visita
   */
  const rejectVisit = useCallback(async (visitId: string, reason?: string): Promise<boolean> => {
    return updateVisitStatus(visitId, 'rejected', reason);
  }, [updateVisitStatus]);

  /**
   * Cancelar una visita
   */
  const cancelVisit = useCallback(async (visitId: string): Promise<boolean> => {
    return updateVisitStatus(visitId, 'cancelled');
  }, [updateVisitStatus]);

  /**
   * Obtener visitas por propiedad
   */
  const getVisitsByProperty = useCallback(async (propertyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('property_visits')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo visitas';
      setError(errorMessage);
      console.error('Error fetching visits by property:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener visitas por agente
   */
  const getVisitsByAgent = useCallback(async (agentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('property_visits')
        .select(`
          *,
          properties (
            title,
            address,
            city,
            images
          )
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo visitas';
      setError(errorMessage);
      console.error('Error fetching visits by agent:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener visitas por usuario (email)
   */
  const getVisitsByUser = useCallback(async (userEmail: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('property_visits')
        .select(`
          *,
          properties (
            title,
            address,
            city,
            images
          )
        `)
        .eq('visitor_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo visitas';
      setError(errorMessage);
      console.error('Error fetching visits by user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refrescar la lista de visitas
   */
  const refreshVisits = useCallback(async () => {
    // Esta función puede ser llamada después de obtener visitas con uno de los métodos específicos
    // Por ahora, mantenemos la lista actual
  }, []);

  return {
    visits,
    loading,
    error,
    createVisit,
    updateVisitStatus,
    getVisitsByProperty,
    getVisitsByAgent,
    getVisitsByUser,
    confirmVisit,
    rejectVisit,
    cancelVisit,
    refreshVisits
  };
};
