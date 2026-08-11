"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { socket } from "@/utils";
import { useUserStore } from "@/store/userStore";

export default function GlobalSocketListener() {
  const pathname = usePathname();
  const router = useRouter();
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

    const handleGlobalMessage = (newMsg: any) => {
      const senderId = newMsg.userID?._id || newMsg.userID?.id || newMsg.userID;
      if (String(senderId) === String(userId)) return;

      const currentChatPage = `/message/${newMsg.conversationID}`;
      if (pathname === currentChatPage) return;

      const senderName = newMsg.userID?.username || "Someone";
      toast(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              router.push(`/message/${newMsg.conversationID}`);
            }}
            className="cursor-pointer flex items-center space-x-3 p-1"
          >
            <div>
              <p className="font-semibold text-sm text-gray-800">{senderName}</p>
              <p className="text-xs text-gray-600 truncate max-w-[200px]">
                {newMsg.description}
              </p>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    };

    socket.on("receive_message", handleGlobalMessage);

    return () => {
      socket.off("connect", joinUser);
      socket.off("receive_message", handleGlobalMessage);
    };
  }, [user, pathname, router]);

  return null;
}
