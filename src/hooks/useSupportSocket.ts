import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketSupportMessage {
  id: string;
  ticketId: string;
  thread: string;
  sender: string;
  role: string;
  message: string;
  attachments?: any[];
  createdAt: string;
}

interface UseSupportSocketProps {
  ticketId: string;
  thread?: string;
  userDisplayName?: string;
  onMessageReceived?: (msg: SocketSupportMessage) => void;
}

const getAdminSocketURL = () => {
  if (process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL;
  }
  if (process.env.NEXT_PUBLIC_ADMIN_API_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    return `${window.location.protocol}//${window.location.hostname}:8082`;
  }
  return 'http://localhost:8082';
};

let adminSocketInstance: Socket | null = null;

const getAdminSocket = () => {
  if (!adminSocketInstance && typeof window !== 'undefined') {
    adminSocketInstance = io(getAdminSocketURL(), {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });
  }
  return adminSocketInstance;
};

export function useSupportSocket({
  ticketId,
  thread = 'creator',
  userDisplayName = 'User',
  onMessageReceived,
}: UseSupportSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!ticketId) return;

    const socket = getAdminSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }
    setIsConnected(socket.connected);

    socket.emit('join_ticket_room', { ticketId, thread });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleReceiveMessage = (payload: any) => {
      if (payload && payload.ticketId === ticketId) {
        const formatted: SocketSupportMessage = {
          id: payload.id || `msg-${Date.now()}`,
          ticketId: payload.ticketId,
          thread: payload.thread || thread,
          sender: payload.sender || 'Admin Support',
          role: payload.role || 'admin',
          message: payload.message || '',
          attachments: payload.attachments || [],
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        if (onMessageRef.current) {
          onMessageRef.current(formatted);
        }
      }
    };

    const handleUserTyping = (data: { ticketId: string; username: string }) => {
      if (data && data.ticketId === ticketId) {
        setTypingUser(data.username);
      }
    };

    const handleUserStoppedTyping = (data: { ticketId: string }) => {
      if (data && data.ticketId === ticketId) {
        setTypingUser(null);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_support_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.emit('leave_ticket_room', { ticketId, thread });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_support_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [ticketId, thread]);

  const sendSupportMessage = useCallback(
    (message: string, attachments: any[] = []) => {
      const socket = getAdminSocket();
      if (!ticketId || !message.trim() || !socket) return;

      socket.emit('send_support_message', {
        ticketId,
        thread,
        message: message.trim(),
        attachments,
        senderName: userDisplayName,
        role: 'creator',
      });
    },
    [ticketId, thread, userDisplayName]
  );

  const startTyping = useCallback(() => {
    const socket = getAdminSocket();
    if (ticketId && socket) {
      socket.emit('typing_start', { ticketId, thread, username: userDisplayName });
    }
  }, [ticketId, thread, userDisplayName]);

  const stopTyping = useCallback(() => {
    const socket = getAdminSocket();
    if (ticketId && socket) {
      socket.emit('typing_stop', { ticketId, thread, username: userDisplayName });
    }
  }, [ticketId, thread, userDisplayName]);

  return {
    isConnected,
    typingUser,
    sendSupportMessage,
    startTyping,
    stopTyping,
  };
}

export default useSupportSocket;
