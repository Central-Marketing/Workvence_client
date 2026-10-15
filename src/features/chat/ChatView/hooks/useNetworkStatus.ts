"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "@/utils";

export type ChatConnectionState = "connected" | "reconnecting" | "offline";

export interface NetworkStatusReturn {
  connectionState: ChatConnectionState;
  isOnline: boolean;
  isSocketConnected: boolean;
  justReconnected: boolean;
  reconnect: () => void;
}

export function useNetworkStatus(): NetworkStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(() => {
    return socket.connected;
  });

  const [justReconnected, setJustReconnected] = useState(false);
  const wasDisconnectedRef = useRef(false);
  const reconnectedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual reconnect trigger
  const reconnect = useCallback(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  // Listen to browser network events (online/offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!socket.connected) {
        socket.connect();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasDisconnectedRef.current = true;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen to Socket.IO connection events
  useEffect(() => {
    const handleConnect = () => {
      setIsSocketConnected(true);
      if (wasDisconnectedRef.current) {
        wasDisconnectedRef.current = false;
        setJustReconnected(true);
        if (reconnectedTimerRef.current) clearTimeout(reconnectedTimerRef.current);
        reconnectedTimerRef.current = setTimeout(() => {
          setJustReconnected(false);
        }, 2000);
      }
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
      wasDisconnectedRef.current = true;
    };

    const handleConnectError = () => {
      setIsSocketConnected(false);
      wasDisconnectedRef.current = true;
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Initial check
    setIsSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      if (reconnectedTimerRef.current) clearTimeout(reconnectedTimerRef.current);
    };
  }, []);

  // Derive composite connection state
  let connectionState: ChatConnectionState = "connected";
  if (!isOnline) {
    connectionState = "offline";
  } else if (!isSocketConnected) {
    connectionState = "reconnecting";
  }

  return {
    connectionState,
    isOnline,
    isSocketConnected,
    justReconnected,
    reconnect,
  };
}
