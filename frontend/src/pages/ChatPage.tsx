import { ChatManagement } from "../components/ChatManagement";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Centro de Mensajes
              </h1>
              <p className="text-gray-600">
                Gestiona todas tus conversaciones en un solo lugar
              </p>
            </div>
          </div>
        </div>

        {/* Chat Management Component */}
        <ChatManagement />

        {/* Help Text */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ¿Cómo funciona el sistema de chat?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Para compradores:
              </h4>
              <ul className="space-y-1">
                <li>
                  • Contacta directamente con agentes desde cualquier propiedad
                </li>
                <li>• Recibe respuestas en tiempo real</li>
                <li>• Programa visitas fácilmente</li>
                <li>• Mantén un historial de todas tus consultas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Para agentes:</h4>
              <ul className="space-y-1">
                <li>• Responde a consultas de manera inmediata</li>
                <li>• Gestiona múltiples conversaciones</li>
                <li>• Cierra chats cuando completes la atención</li>
                <li>• Mantén un seguimiento de tus leads</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
