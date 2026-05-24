'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useNotificationStore } from '@/store/notification.store';
import { Message, Notification } from '@/types';

let socket: Socket | null = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addMessage, setTyping, updateConversationLastMessage } = useChatStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || initialized.current) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      initialized.current = true;
    });

    socket.on('message:new', (message: Message) => {
      addMessage(message.conversationId, message);
      updateConversationLastMessage(message.conversationId, message.content);
    });

    socket.on('typing:start', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTyping(conversationId, userId, true);
    });

    socket.on('typing:stop', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTyping(conversationId, userId, false);
    });

    socket.on('notification', (notification: Notification) => {
      addNotification(notification);
    });

    socket.on('disconnect', () => {
      initialized.current = false;
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, accessToken]);

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}
