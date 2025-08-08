import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  User,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { useChat } from "../hooks/useChat";

interface PropertyChatComponentProps {
  propertyId: string;
  agentId: string;
  agentName: string;
  propertyTitle: string;
  onClose: () => void;
  isOpen: boolean;
}

export function PropertyChatComponent({
  propertyId,
  agentId,
  agentName,
  propertyTitle,
  onClose,
  isOpen,
}: PropertyChatComponentProps) {
  const {
    sessions,
    activeSession,
    messages,
    loading,
    sending,
    currentUser,
    createChatSession,
    fetchMessages,
    sendMessage,
    setActiveSession,
  } = useChat(propertyId);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Buscar sesión existente para esta propiedad al abrir
  useEffect(() => {
    if (isOpen && sessions.length > 0) {
      const existingSession = sessions.find(
        (session) => session.property_id === propertyId
      );
      if (existingSession) {
        setActiveSession(existingSession);
        fetchMessages(existingSession.id);
      }
    }
  }, [isOpen, sessions, propertyId, setActiveSession, fetchMessages]);

  // Iniciar nuevo chat
  const handleStartChat = async () => {
    if (!currentUser) return;

    const session = await createChatSession({
      property_id: propertyId,
      agent_id: agentId,
      initial_message: `Hola, estoy interesado en la propiedad "${propertyTitle}". ¿Podrías brindarme más información?`,
    });

    if (session) {
      setActiveSession(session);
      fetchMessages(session.id);
    }
  };

  // Enviar nuevo mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession || sending) return;

    await sendMessage({
      conversation_id: activeSession.id, // Cambiado de session_id a conversation_id
      message_text: newMessage.trim(),
    });

    setNewMessage("");
  };

  // Formatear fecha
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{agentName}</h3>
              <p className="text-sm text-gray-500 truncate max-w-48">
                {propertyTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Chat Content */}
        {!activeSession ? (
          // Estado inicial - sin chat creado
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Contactar al agente
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Inicia una conversación con {agentName} sobre esta propiedad.
              Podrás obtener información detallada y agendar una visita.
            </p>
            <button
              onClick={handleStartChat}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{loading ? "Iniciando..." : "Iniciar chat"}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwn = message.sender_id === currentUser?.id;
                    const isSystem = message.message_type === "system";

                    if (isSystem) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="bg-gray-100 px-4 py-2 rounded-full text-xs text-gray-600 flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{message.message_text}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.message_text}</p>
                          <div
                            className={`flex items-center justify-between mt-1 text-xs ${
                              isOwn ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            <span>{formatMessageTime(message.created_at)}</span>
                            {isOwn && (
                              <CheckCircle2
                                className={`w-3 h-3 ml-2 ${
                                  message.is_read
                                    ? "text-blue-200"
                                    : "text-blue-300"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t bg-gray-50"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Componente compacto para mostrar en la lista de propiedades
interface ChatButtonProps {
  propertyId: string;
  agentId: string;
  agentName: string;
  propertyTitle: string;
  className?: string;
}

export function ChatButton({
  propertyId,
  agentId,
  agentName,
  propertyTitle,
  className = "",
}: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>Contactar</span>
      </button>

      <PropertyChatComponent
        propertyId={propertyId}
        agentId={agentId}
        agentName={agentName}
        propertyTitle={propertyTitle}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
