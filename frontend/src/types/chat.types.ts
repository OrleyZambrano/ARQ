export interface ChatSession {
  id: string;
  property_id: string;
  user_id: string;
  agent_id: string;
  status: "active" | "closed" | "archived";
  last_message_at: string;
  created_at: string;

  // Datos relacionados que se pueden incluir
  property?: {
    id: string;
    title: string;
    price: number;
    transaction_type: string;
    images?: string[];
  };
  buyer?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string; // Cambiado de session_id a conversation_id
  sender_id: string;
  sender_type?: string;
  message_text: string; // Cambiado de message a message_text
  message_type: "text" | "image" | "file" | "system";
  is_read: boolean;
  created_at: string;
  updated_at: string;

  // Datos del remitente
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface ChatParticipant {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: "buyer" | "agent";
  is_online?: boolean;
  last_seen?: string;
}

export interface NewChatData {
  property_id: string;
  agent_id: string;
  initial_message?: string;
}

export interface SendMessageData {
  conversation_id: string; // Cambiado de session_id a conversation_id
  message_text: string; // Cambiado de message a message_text
  message_type?: "text" | "image" | "file" | "system";
}
