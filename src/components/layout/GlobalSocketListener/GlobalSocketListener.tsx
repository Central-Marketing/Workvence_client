"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/utils";
import { useUserStore } from "@/store/userStore";

export default function GlobalSocketListener() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;

    if (!socket.connected) {
      socket.connect();
    }

    const joinUser = () => {
      socket.emit("user_connected", userId);
    };

    const handleMessageUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleOrderUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
    };

    joinUser();
    socket.on("connect", joinUser);
    socket.on("receive_message", handleMessageUpdate);
    socket.on("order_updated", handleOrderUpdate);
    socket.on("new_notification", handleOrderUpdate);
    socket.on("notification", handleOrderUpdate);

    return () => {
      socket.off("connect", joinUser);
      socket.off("receive_message", handleMessageUpdate);
      socket.off("order_updated", handleOrderUpdate);
      socket.off("new_notification", handleOrderUpdate);
      socket.off("notification", handleOrderUpdate);
    };
  }, [user, queryClient]);

  return null;
}

