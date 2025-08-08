import { useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

interface ChatNotificationProps {
  children: React.ReactNode;
}

export function ChatNotification({ children }: ChatNotificationProps) {
  const { sessions } = useChat();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (sessions) {
      const total = sessions.reduce(
        (acc, session) => acc + (session.unread_count || 0),
        0
      );
      setUnreadCount(total);
    }
  }, [sessions]);

  return (
    <div className="relative">
      {children}
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
}
