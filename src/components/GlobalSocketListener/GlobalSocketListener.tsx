"use client";

import { useEffect } from "react";
import { socket } from "@/utils";
import { useUserStore } from "@/store/userStore";

export default function GlobalSocketListener() {
  const { user } = useUserStore();

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;

    if (!socket.connected) {
      socket.connect();
    }

    const joinUser = () => {
      socket.emit("user_connected", userId);
    };

    joinUser();
    socket.on("connect", joinUser);

    return () => {
      socket.off("connect", joinUser);
    };
  }, [user]);

  return null;
}
