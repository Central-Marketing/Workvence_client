import { io, Socket } from 'socket.io-client';

const getSocketURL = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/api\/?$/, '');
  }
  const envUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';
  return `http://${hostname}:8080`;
};

const options = {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket', 'polling'],
  path: '/socket.io/'
};

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  if (match && match[1]) return decodeURIComponent(match[1]);
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
};

let realSocket: Socket | null = null;

const getSocket = (): Socket | null => {
  if (!realSocket && typeof window !== 'undefined') {
    const token = getAuthToken();
    realSocket = io(getSocketURL(), {
      ...options,
      auth: token ? { token } : undefined,
      query: token ? { token } : undefined,
    });
  }
  return realSocket;
};

export interface SocketClient {
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, cb: (...args: any[]) => void) => void;
  once: (event: string, cb: (...args: any[]) => void) => void;
  off: (event: string, cb?: (...args: any[]) => void) => void;
  readonly connected: boolean;
}

export const socket: SocketClient = {
  connect() {
    const s = getSocket();
    if (s && !s.connected) {
      s.connect();
    }
  },
  disconnect() {
    if (realSocket) {
      if (realSocket.connected) {
        realSocket.emit('leave_conversation');
      }
      realSocket.disconnect();
      realSocket = null;
    }
  },
  emit(event: string, ...args: any[]) {
    const s = getSocket();
    s?.emit(event, ...args);
  },
  on(event: string, cb: (...args: any[]) => void) {
    const s = getSocket();
    s?.on(event, cb);
  },
  once(event: string, cb: (...args: any[]) => void) {
    const s = getSocket();
    s?.once(event, cb);
  },
  off(event: string, cb?: (...args: any[]) => void) {
    if (realSocket) {
      realSocket.off(event, cb);
    }
  },
  get connected(): boolean {
    return !!(realSocket && realSocket.connected);
  }
};

export default socket;
