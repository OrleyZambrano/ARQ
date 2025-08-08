import React, { useState } from "react";
import {
  MessageCircle,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../contexts/AuthContext"; // Importar useAuth
import { ChatSession } from "../types/chat.types";

export function ChatManagement() {
  const {
    sessions,
    messages,
    loading,
    sending,
    fetchMessages,
    sendMessage,
    closeChatSession,
    setActiveSession,
  } = useChat();

  // Obtener datos de autenticación
  const { user: currentUser, isAgent } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );

  // Seleccionar sesión y cargar mensajes
  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
    setActiveSession(session);
    fetchMessages(session.id);
  };

  // Enviar mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession || sending) return;

    await sendMessage({
      conversation_id: selectedSession.id, // Cambiado de session_id a conversation_id
      message_text: newMessage.trim(),
    });

    setNewMessage("");
  };

  // Cerrar chat (solo para agentes)
  const handleCloseChat = async (sessionId: string) => {
    if (window.confirm("¿Estás seguro de que quieres cerrar este chat?")) {
      await closeChatSession(sessionId);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setActiveSession(null);
      }
    }
  };

  // Formatear tiempo
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
      {/* Lista de chats */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span>Mis Chats</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No tienes chats activos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sessions.map((session) => {
                const otherUser = isAgent ? session.buyer : session.agent;
                const property = session.property;

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSession?.id === session.id
                        ? "bg-blue-50 border-r-2 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {otherUser?.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            alt={otherUser.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {otherUser?.full_name || "Usuario"}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {session.unread_count &&
                              session.unread_count > 0 && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                  {session.unread_count}
                                </span>
                              )}
                            <span className="text-xs text-gray-500">
                              {formatTime(session.last_message_at)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 truncate mt-1">
                          {property?.title || "Propiedad"}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-green-600">
                            ${property?.price?.toLocaleString("es-MX")}
                          </span>
                          {isAgent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseChat(session.id);
                              }}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Cerrar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un chat
              </h3>
              <p className="text-sm text-gray-600">
                Elige una conversación de la lista para comenzar a chatear
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isAgent
                        ? selectedSession.buyer?.full_name
                        : selectedSession.agent?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate max-w-64">
                      {selectedSession.property?.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Activo</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        <span>{formatTime(message.created_at)}</span>
                        {isOwn && (
                          <CheckCircle
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
            </div>

            {/* Input de mensaje */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-gray-50"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{sending ? "Enviando..." : "Enviar"}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
