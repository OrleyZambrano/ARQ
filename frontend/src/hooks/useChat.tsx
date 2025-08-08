import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  ChatSession,
  ChatMessage,
  NewChatData,
  SendMessageData,
} from "../types/chat.types";
import { useAuth } from "../contexts/AuthContext"; // Usar AuthContext en lugar de authService

export const useChat = (propertyId?: string) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Usar AuthContext en lugar de estado local
  const { user: currentUser, isAgent } = useAuth();

  // Referencias para suscripciones de tiempo real
  const messagesSubscription = useRef<any>(null);
  const sessionsSubscription = useRef<any>(null);

  // Obtener sesiones de chat del usuario
  const fetchChatSessions = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      let query = supabase.from("chat_conversations") // Cambiado de chat_sessions a chat_conversations
        .select(`
          *
        `);

      // Filtrar por rol del usuario
      if (isAgent) {
        query = query.eq("agent_id", currentUser.id);
      } else {
        query = query.eq("user_id", currentUser.id);
      }

      // Si hay propertyId específico, filtrar por eso también
      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }

      const { data, error } = await query
        .eq("status", "active")
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Obtener datos relacionados y conteo de mensajes no leídos para cada sesión
      const sessionsWithData = await Promise.all(
        (data || []).map(async (session) => {
          // Obtener propiedad
          const { data: property } = await supabase
            .from("properties")
            .select("id, title, price, transaction_type, images")
            .eq("id", session.property_id)
            .single();

          // Obtener perfil del comprador
          const { data: buyer } = await supabase
            .from("user_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", session.user_id)
            .single();

          // Obtener perfil del agente
          const { data: agent } = await supabase
            .from("user_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", session.agent_id)
            .single();

          // Obtener conteo de mensajes no leídos
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", session.id) // Cambiado de session_id a conversation_id
            .eq("is_read", false)
            .neq("sender_id", currentUser.id);

          return {
            ...session,
            property,
            buyer,
            agent,
            unread_count: count || 0,
          };
        })
      );

      setSessions(sessionsWithData);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, propertyId]);

  // Crear nueva sesión de chat
  const createChatSession = useCallback(
    async (data: NewChatData): Promise<ChatSession | null> => {
      if (!currentUser) return null;

      try {
        // Verificar si ya existe una sesión para esta propiedad y usuario
        const { data: existingSession } = await supabase
          .from("chat_conversations") // Cambiado de chat_sessions a chat_conversations
          .select("*")
          .eq("property_id", data.property_id)
          .eq("user_id", currentUser.id)
          .eq("agent_id", data.agent_id)
          .single();

        if (existingSession) {
          // Reactivar sesión existente si estaba cerrada
          if (existingSession.status !== "active") {
            const { data: updatedSession } = await supabase
              .from("chat_conversations") // Cambiado de chat_sessions a chat_conversations
              .update({
                status: "active",
                last_message_at: new Date().toISOString(),
              })
              .eq("id", existingSession.id)
              .select()
              .single();

            return updatedSession;
          }
          return existingSession;
        }

        // Crear nueva sesión
        const { data: newSession, error } = await supabase
          .from("chat_conversations") // Cambiado de chat_sessions a chat_conversations
          .insert({
            property_id: data.property_id,
            user_id: currentUser.id,
            agent_id: data.agent_id,
          })
          .select()
          .single();

        if (error) throw error;

        // Enviar mensaje inicial si se proporciona
        if (data.initial_message && newSession) {
          await sendMessage({
            conversation_id: newSession.id, // Cambiado de session_id a conversation_id
            message_text: data.initial_message,
          });
        }

        // Refrescar sesiones
        fetchChatSessions();

        return newSession;
      } catch (error) {
        console.error("Error creating chat session:", error);
        return null;
      }
    },
    [currentUser, fetchChatSessions]
  );

  // Obtener mensajes de una sesión
  const fetchMessages = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(`*`)
          .eq("conversation_id", sessionId) // Cambiado de session_id a conversation_id
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Obtener datos del sender para cada mensaje
        const messagesWithSender = await Promise.all(
          (data || []).map(async (message) => {
            const { data: sender } = await supabase
              .from("user_profiles")
              .select("id, full_name, avatar_url, role")
              .eq("id", message.sender_id)
              .single();

            return {
              ...message,
              sender,
            };
          })
        );

        setMessages(messagesWithSender);

        // Marcar mensajes como leídos (excepto los propios)
        if (currentUser) {
          await supabase
            .from("chat_messages")
            .update({ is_read: true })
            .eq("conversation_id", sessionId) // Cambiado de session_id a conversation_id
            .neq("sender_id", currentUser.id)
            .eq("is_read", false);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Enviar mensaje
  const sendMessage = useCallback(
    async (data: SendMessageData) => {
      if (!currentUser) return;

      setSending(true);
      try {
        const { error } = await supabase.from("chat_messages").insert({
          conversation_id: data.conversation_id, // Cambiado de session_id a conversation_id
          sender_id: currentUser.id,
          sender_type: isAgent ? "agent" : "user", // Agregar sender_type requerido
          message_text: data.message_text, // Cambiado de message a message_text
          message_type: data.message_type || "text",
        });

        if (error) throw error;

        // Actualizar last_message_at de la sesión
        await supabase
          .from("chat_conversations") // Cambiado de chat_sessions a chat_conversations
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", data.conversation_id); // Cambiado de session_id a conversation_id
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setSending(false);
      }
    },
    [currentUser]
  );

  // Cerrar sesión de chat
  const closeChatSession = useCallback(
    async (sessionId: string) => {
      try {
        const { error } = await supabase
          .from("chat_conversations") // Cambiado de chat_sessions a chat_conversations
          .update({ status: "closed" })
          .eq("id", sessionId);

        if (error) throw error;

        // Enviar mensaje del sistema
        await sendMessage({
          conversation_id: sessionId, // Cambiado de session_id a conversation_id
          message_text: "El chat ha sido cerrado por el agente.",
          message_type: "system",
        });

        // Refrescar sesiones
        fetchChatSessions();
      } catch (error) {
        console.error("Error closing chat session:", error);
      }
    },
    [sendMessage, fetchChatSessions]
  );

  // Configurar suscripción en tiempo real para mensajes
  useEffect(() => {
    if (!activeSession) return;

    // Limpiar suscripción anterior
    if (messagesSubscription.current) {
      messagesSubscription.current.unsubscribe();
    }

    // Nueva suscripción para mensajes de la sesión activa
    messagesSubscription.current = supabase
      .channel(`chat_messages:${activeSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${activeSession.id}`, // Cambiado de session_id a conversation_id
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Obtener datos completos del mensaje con sender
            fetchMessageDetails(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      if (messagesSubscription.current) {
        messagesSubscription.current.unsubscribe();
      }
    };
  }, [activeSession]);

  // Obtener detalles completos de un mensaje
  const fetchMessageDetails = async (messageId: string) => {
    try {
      const { data: message, error } = await supabase
        .from("chat_messages")
        .select(`*`)
        .eq("id", messageId)
        .single();

      if (error) throw error;

      // Obtener datos del sender
      const { data: sender } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", message.sender_id)
        .single();

      const messageWithSender = {
        ...message,
        sender,
      };

      setMessages((prev) => {
        const exists = prev.find((m) => m.id === messageWithSender.id);
        if (exists) return prev;
        return [...prev, messageWithSender];
      });
    } catch (error) {
      console.error("Error fetching message details:", error);
    }
  };

  // Configurar suscripción en tiempo real para sesiones
  useEffect(() => {
    if (!currentUser) return;

    // Limpiar suscripción anterior
    if (sessionsSubscription.current) {
      sessionsSubscription.current.unsubscribe();
    }

    // Nueva suscripción para sesiones del usuario
    sessionsSubscription.current = supabase
      .channel(`chat_conversations:${currentUser.id}`) // Cambiado de chat_sessions a chat_conversations
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_conversations", // Cambiado de chat_sessions a chat_conversations
        },
        () => {
          // Refrescar sesiones cuando hay cambios
          fetchChatSessions();
        }
      )
      .subscribe();

    return () => {
      if (sessionsSubscription.current) {
        sessionsSubscription.current.unsubscribe();
      }
    };
  }, [currentUser, fetchChatSessions]);

  // Obtener sesiones al cargar
  useEffect(() => {
    if (currentUser) {
      fetchChatSessions();
    }
  }, [currentUser, fetchChatSessions]);

  // Limpiar suscripciones al desmontar
  useEffect(() => {
    return () => {
      if (messagesSubscription.current) {
        messagesSubscription.current.unsubscribe();
      }
      if (sessionsSubscription.current) {
        sessionsSubscription.current.unsubscribe();
      }
    };
  }, []);

  return {
    // Estado
    sessions,
    activeSession,
    messages,
    loading,
    sending,
    currentUser,

    // Acciones
    createChatSession,
    fetchMessages,
    sendMessage,
    closeChatSession,
    setActiveSession,
    fetchChatSessions,
  };
};
