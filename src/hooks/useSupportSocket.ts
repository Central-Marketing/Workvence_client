import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { socket as mainSocket } from '@/utils/socket';

export interface SocketSupportMessage {
  id: string;
  ticketId: string;
  thread?: string;
  sender: string;
  senderID?: string;
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
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });
  }
  return adminSocketInstance;
};

export function useSupportSocket({
  ticketId,
  thread = 'group',
  userDisplayName = 'User',
  onMessageReceived,
}: UseSupportSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const threadRef = useRef(thread);
  useEffect(() => {
    threadRef.current = thread;
  }, [thread]);

  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!ticketId) return;

    setIsUnauthorized(false);
    const adminSocket = getAdminSocket();

    if (adminSocket && !adminSocket.connected) {
      adminSocket.connect();
    }
    if (!mainSocket.connected) {
      mainSocket.connect();
    }
    setIsConnected(Boolean(adminSocket?.connected || mainSocket.connected));

    const joinTicketRooms = () => {
      setIsConnected(true);
      const payload = { ticketId };

      if (adminSocket) {
        adminSocket.emit('join_ticket', payload);
        adminSocket.emit('join_ticket_room', payload);
        adminSocket.emit('join_room', `ticket_${ticketId}`);
        adminSocket.emit('join_room', `ticket:${ticketId}`);
        adminSocket.emit('join_room', `ticket:${ticketId}:group`);
        adminSocket.emit('join_room', `ticket:${ticketId}:buyer`);
        adminSocket.emit('join_room', `ticket:${ticketId}:seller`);
        adminSocket.emit('join_room', `ticket_${ticketId}_buyer`);
        adminSocket.emit('join_room', `ticket_${ticketId}_seller`);
        adminSocket.emit('join_room', `room:support:ticket:${ticketId}:buyer`);
        adminSocket.emit('join_room', `room:support:ticket:${ticketId}:seller`);
      }

      mainSocket.emit('join_ticket', payload);
      mainSocket.emit('join_ticket_room', payload);
      mainSocket.emit('join_room', `ticket_${ticketId}`);
      mainSocket.emit('join_room', `ticket:${ticketId}`);
      mainSocket.emit('join_room', `ticket:${ticketId}:group`);
      mainSocket.emit('join_room', `ticket:${ticketId}:buyer`);
      mainSocket.emit('join_room', `ticket:${ticketId}:seller`);
      mainSocket.emit('join_room', `ticket_${ticketId}_buyer`);
      mainSocket.emit('join_room', `ticket_${ticketId}_seller`);
      mainSocket.emit('join_room', `room:support:ticket:${ticketId}:buyer`);
      mainSocket.emit('join_room', `room:support:ticket:${ticketId}:seller`);
    };

    joinTicketRooms();

    const handleConnect = () => joinTicketRooms();
    const handleDisconnect = () => {
      setIsConnected(Boolean(adminSocket?.connected || mainSocket.connected));
    };

    const handleReceiveMessage = (payload: any) => {
      const incomingTicketId = String(payload?.ticketId || payload?.ticketID || payload?.id || '');
      if (incomingTicketId && incomingTicketId === String(ticketId)) {
        const senderName = payload.senderName || payload.sender || 'Support Agent';
        const formatted: SocketSupportMessage = {
          id: payload.id || payload._id || payload.createdAt || `msg-${Date.now()}`,
          ticketId: String(ticketId),
          thread: payload.thread || 'group',
          sender: senderName,
          senderID: String(payload.senderID || payload.senderId || ''),
          role: payload.role || payload.senderRole || 'admin',
          message: payload.message || payload.text || payload.content || '',
          attachments: payload.attachments || [],
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        if (onMessageRef.current) {
          onMessageRef.current(formatted);
        }
      }
    };

    const handleError = (err: any) => {
      const msg = String(err?.message || err || '');
      if (/unauthorized/i.test(msg)) {
        setIsUnauthorized(true);
      }
    };

    const handleRateLimited = (data: any) => {
      if (data?.event === 'join_ticket' || data?.event === 'join_ticket_room') {
        setTimeout(joinTicketRooms, 2000);
      }
    };

    const handleUserTyping = (data: { ticketId: string; username: string }) => {
      if (data && String(data.ticketId) === String(ticketId)) {
        setTypingUser(data.username);
      }
    };

    const handleUserStoppedTyping = (data: { ticketId: string }) => {
      if (data && String(data.ticketId) === String(ticketId)) {
        setTypingUser(null);
      }
    };

    if (adminSocket) {
      adminSocket.on('connect', handleConnect);
      adminSocket.on('disconnect', handleDisconnect);
      adminSocket.on('receive_support_message', handleReceiveMessage);
      adminSocket.on('error', handleError);
      adminSocket.on('rate_limited', handleRateLimited);
      adminSocket.on('user_typing', handleUserTyping);
      adminSocket.on('user_stopped_typing', handleUserStoppedTyping);
    }

    mainSocket.on('connect', handleConnect);
    mainSocket.on('disconnect', handleDisconnect);
    mainSocket.on('receive_support_message', handleReceiveMessage);
    mainSocket.on('error', handleError);
    mainSocket.on('rate_limited', handleRateLimited);
    mainSocket.on('user_typing', handleUserTyping);
    mainSocket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      const payload = { ticketId };

      if (adminSocket) {
        adminSocket.emit('leave_ticket', payload);
        adminSocket.emit('leave_ticket_room', payload);
        adminSocket.emit('leave_room', `ticket_${ticketId}`);
        adminSocket.emit('leave_room', `ticket:${ticketId}`);
        if (thread && thread !== 'group') {
          adminSocket.emit('leave_room', `ticket:${ticketId}:${thread}`);
          adminSocket.emit('leave_room', `ticket_${ticketId}_${thread}`);
          adminSocket.emit('leave_room', `room:support:ticket:${ticketId}:${thread}`);
        }
        adminSocket.off('connect', handleConnect);
        adminSocket.off('disconnect', handleDisconnect);
        adminSocket.off('receive_support_message', handleReceiveMessage);
        adminSocket.off('error', handleError);
        adminSocket.off('rate_limited', handleRateLimited);
        adminSocket.off('user_typing', handleUserTyping);
        adminSocket.off('user_stopped_typing', handleUserStoppedTyping);
      }

      mainSocket.emit('leave_ticket', payload);
      mainSocket.emit('leave_ticket_room', payload);
      mainSocket.emit('leave_room', `ticket_${ticketId}`);
      mainSocket.emit('leave_room', `ticket:${ticketId}`);
      mainSocket.off('connect', handleConnect);
      mainSocket.off('disconnect', handleDisconnect);
      mainSocket.off('receive_support_message', handleReceiveMessage);
      mainSocket.off('error', handleError);
      mainSocket.off('rate_limited', handleRateLimited);
      mainSocket.off('user_typing', handleUserTyping);
      mainSocket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [ticketId]);

  const sendSupportMessage = useCallback(
    (message: string, attachments: any[] = []) => {
      if (!ticketId || (!message.trim() && attachments.length === 0)) return;

      const payload = {
        ticketId,
        thread: threadRef.current || 'group',
        message: message.trim(),
        attachments,
        senderName: userDisplayName,
      };

      const adminSocket = getAdminSocket();
      if (adminSocket && adminSocket.connected) {
        adminSocket.emit('send_support_message', payload);
      }
      if (mainSocket.connected) {
        mainSocket.emit('send_support_message', payload);
      }
    },
    [ticketId, userDisplayName]
  );

  const startTyping = useCallback(() => {
    if (!ticketId) return;
    const payload = { ticketId, username: userDisplayName };
    const adminSocket = getAdminSocket();
    if (adminSocket && adminSocket.connected) adminSocket.emit('typing_start', payload);
    if (mainSocket.connected) mainSocket.emit('typing_start', payload);
  }, [ticketId, userDisplayName]);

  const stopTyping = useCallback(() => {
    if (!ticketId) return;
    const payload = { ticketId, username: userDisplayName };
    const adminSocket = getAdminSocket();
    if (adminSocket && adminSocket.connected) adminSocket.emit('typing_stop', payload);
    if (mainSocket.connected) mainSocket.emit('typing_stop', payload);
  }, [ticketId, userDisplayName]);

  return {
    isConnected,
    isUnauthorized,
    typingUser,
    sendSupportMessage,
    startTyping,
    stopTyping,
  };
}

export default useSupportSocket;

