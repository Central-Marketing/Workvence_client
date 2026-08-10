import { io } from 'socket.io-client';

const getSocketURL = () => {
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
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
};

let realSocket = null;

const getSocket = () => {
    if (!realSocket && typeof window !== 'undefined') {
        realSocket = io(getSocketURL(), options);
    }
    return realSocket;
};

const socket = {
    connect() {
        const s = getSocket();
        if (s && !s.connected) {
            s.connect();
        }
    },
    disconnect() {
        if (realSocket) {
            realSocket.disconnect();
        }
    },
    emit(event, ...args) {
        const s = getSocket();
        s?.emit(event, ...args);
    },
    on(event, cb) {
        const s = getSocket();
        s?.on(event, cb);
    },
    once(event, cb) {
        const s = getSocket();
        s?.once(event, cb);
    },
    off(event, cb) {
        if (realSocket) {
            realSocket.off(event, cb);
        }
    },
    get connected() {
        return !!(realSocket && realSocket.connected);
    }
};

export { socket };
export default socket;
