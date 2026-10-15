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
  const hasInitiallyConnectedRef = useRef(socket.connected);
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
      const wasLost = wasDisconnectedRef.current;
      hasInitiallyConnectedRef.current = true;
      wasDisconnectedRef.current = false;

      if (wasLost) {
        setJustReconnected(true);
        if (reconnectedTimerRef.current) clearTimeout(reconnectedTimerRef.current);
        reconnectedTimerRef.current = setTimeout(() => {
          setJustReconnected(false);
        }, 2000);
      }
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
      // Only treat as a connection drop if we had already initially connected
      if (hasInitiallyConnectedRef.current) {
        wasDisconnectedRef.current = true;
      }
    };

    const handleConnectError = () => {
      setIsSocketConnected(false);
      if (hasInitiallyConnectedRef.current) {
        wasDisconnectedRef.current = true;
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Initial check
    if (socket.connected) {
      setIsSocketConnected(true);
      hasInitiallyConnectedRef.current = true;
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      if (reconnectedTimerRef.current) clearTimeout(reconnectedTimerRef.current);
    };
  }, []);

  // Derive composite connection state:
  // On reload/initial mount when user is online, do not show "reconnecting" banner
  // while initial socket connection is quietly completing.
  let connectionState: ChatConnectionState = "connected";
  if (!isOnline) {
    connectionState = "offline";
  } else if (!isSocketConnected && wasDisconnectedRef.current) {
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
