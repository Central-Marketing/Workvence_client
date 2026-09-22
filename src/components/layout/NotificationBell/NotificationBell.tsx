"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";
import { FiBell } from "react-icons/fi";
import { playNotificationSound } from "@/utils/soundUtil";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui";

interface NotificationBellProps {
  currentUser: any;
  triggerClassName?: string;
  iconClassName?: string;
}

const processedNotifIds = new Set<string>();
const processedNotifMessageIds = new Set<string>();

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser, triggerClassName, iconClassName }) => {
  const storeUser = useUserStore((state) => state.user);
  const activeUser = currentUser || storeUser;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 1. Fetch initial notifications from REST API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosFetch.get("/notifications");
        if (!res.data.error) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 401 && status !== 502 && status !== 503) {
          console.error("Failed to load notifications:", err);
        }
      }
    };

    if (currentUser?._id || currentUser?.id) {
      fetchNotifications();
    }
  }, [currentUser]);

  // 2. Connect Socket.io & listen for real-time 'new_notification' and 'receive_message'
  useEffect(() => {
    const currentUserId = String(activeUser?._id || activeUser?.id || '').trim();
    const currentUsername = String(activeUser?.username || '').trim().toLowerCase();
    if (!currentUserId) return;

    // Join personal socket room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("user_connected", currentUserId);

    const isCurrentChatPage = () => {
      if (typeof window === 'undefined') return false;
      const path = window.location.pathname;
      return path.startsWith('/message') || path.startsWith('/messages');
    };

    const isSenderCurrentUser = (idOrObj?: any, username?: string) => {
      if (!idOrObj && !username) return false;
      const idStr = String(typeof idOrObj === 'object' ? (idOrObj?._id || idOrObj?.id || '') : (idOrObj || '')).trim();
      if (idStr && currentUserId && idStr === currentUserId) return true;
      const uStr = String(typeof idOrObj === 'object' ? (idOrObj?.username || '') : (username || '')).trim().toLowerCase();
      if (uStr && currentUsername && uStr === currentUsername) return true;
      return false;
    };

    const isChatMessageNotif = (notif: any) => {
      if (!notif) return false;
      const type = String(notif.type || '').toLowerCase();
      const title = String(notif.title || '').toLowerCase();
      const msg = String(notif.message || notif.desc || notif.description || '').toLowerCase();
      const link = String(notif.link || notif.url || '').toLowerCase();

      return (
        type === 'message' ||
        type === 'chat' ||
        type === 'conversation' ||
        type === 'new_message' ||
        type === 'custom_offer' ||
        Boolean(notif.conversationID || notif.conversationId || notif.conversationUUID || notif.conversation) ||
        link.includes('/message') ||
        link.includes('/messages') ||
        /message|chat|conversation|custom proposal|custom offer/i.test(title) ||
        /sent you a message|sent a message|new message|sent you a custom proposal|sent you an offer/i.test(msg)
      );
    };

    // Listen for real-time notification broadcast from server
    const handleNewNotification = (newNotif: any) => {
      if (!newNotif) return;

      // Robust check: don't notify if user is the sender / creator of this notification
      const notifSenderId =
        newNotif.senderId ||
        newNotif.senderID ||
        newNotif.sender?._id ||
        newNotif.sender?.id ||
        newNotif.sender ||
        newNotif.from?._id ||
        newNotif.from?.id ||
        newNotif.from ||
        newNotif.creatorId ||
        newNotif.creator?._id;

      const notifSenderName =
        newNotif.senderUsername ||
        newNotif.sender_username ||
        newNotif.sender?.username ||
        newNotif.from?.username;

      if (isSenderCurrentUser(notifSenderId, notifSenderName)) return;

      // Add new notification to top of list for all instances
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger subtle animation on the icon
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);

      // ALWAYS skip toast for chat messages (handled exclusively by handleReceiveMessage)
      if (isChatMessageNotif(newNotif)) {
        return;
      }

      // If user is currently on the notifications page or chat page, skip toast
      if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/notifications') || isCurrentChatPage())) {
        return;
      }

      const notifId = String(
        newNotif._id ||
        newNotif.id ||
        `${newNotif.title || ''}-${newNotif.message || ''}`
      ).trim();

      // Deduplicate across simultaneously mounted desktop & mobile instances
      if (processedNotifIds.has(notifId)) return;
      processedNotifIds.add(notifId);
      setTimeout(() => processedNotifIds.delete(notifId), 8000);

      // Play notification sound once
      playNotificationSound('notification');

      toast.custom((t) => (
        <div className={`relative bg-white border-l-4 border-[#6ad724] shadow-xl p-4 rounded-lg max-w-[350px] flex flex-col gap-1 transition-all duration-300 ${t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-0 w-5 h-5 h-auto min-h-0 border-none shadow-none hover:bg-transparent"
            onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          >
            ×
          </Button>
          <strong className="text-[#333] text-sm font-bold">🔔 {newNotif.title}</strong>
          <p className="text-[#666] text-[13px] m-0 leading-snug">{newNotif.message}</p>
        </div>
      ), { id: `sys-notif-${notifId}`, duration: 5000 });
    };

    // Listen for real-time incoming messages (chat messages from other users)
    const handleReceiveMessage = (newMsg: any) => {
      if (!newMsg) return;

      // Extract sender ID and sender username from all common fields
      const senderId =
        newMsg.userID?._id ||
        newMsg.userID?.id ||
        newMsg.senderID?._id ||
        newMsg.senderID?.id ||
        newMsg.senderID ||
        newMsg.senderId ||
        newMsg.sender?._id ||
        newMsg.sender?.id ||
        newMsg.sender ||
        newMsg.from?._id ||
        newMsg.from?.id ||
        newMsg.from ||
        (typeof newMsg.userID === 'string' ? newMsg.userID : '');

      const senderName =
        newMsg.userID?.username ||
        newMsg.senderName ||
        newMsg.sender_username ||
        newMsg.senderUsername ||
        newMsg.sender?.username ||
        newMsg.from?.username ||
        newMsg.user?.username ||
        '';

      // Robust check: NEVER notify for messages sent by the current user
      if (isSenderCurrentUser(senderId, senderName)) return;

      // Play message sound and show toast ONLY if user is NOT on the chat page
      if (isCurrentChatPage()) return;

      const conversationId = String(
        newMsg.conversationID ||
        newMsg.conversationId ||
        newMsg.conversationUUID ||
        newMsg.uuid ||
        ''
      );

      const msgId = newMsg._id || newMsg.id || newMsg.uuid;
      const msgKey = String(msgId || `${String(senderId || '')}-${newMsg.description || newMsg.text || newMsg.message || ''}`).trim();

      // Deduplicate across simultaneously mounted desktop & mobile instances
      if (processedNotifMessageIds.has(msgKey)) return;
      processedNotifMessageIds.add(msgKey);
      setTimeout(() => processedNotifMessageIds.delete(msgKey), 8000);

      // Play message notification sound once
      playNotificationSound('message');

      const displayName = senderName || 'Someone';
      const msgPreview = newMsg.description?.startsWith('[CUSTOM_OFFER]') 
        ? 'sent you a custom proposal' 
        : newMsg.description?.slice(0, 60) || newMsg.text?.slice(0, 60) || newMsg.message?.slice(0, 60) || 'sent a message';

      const targetConvId = conversationId || newMsg.conversationID;

      // Show toast for incoming message with 5s duration and unique ID
      toast.custom((t) => (
        <div 
          className={`relative bg-white border-l-4 border-[#6ad724] shadow-xl p-4 rounded-lg max-w-[350px] flex flex-col gap-1 transition-all duration-300 cursor-pointer pr-6 ${t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          onClick={() => {
            toast.dismiss(t.id);
            if (targetConvId) {
              window.location.href = `/message/${targetConvId}`;
            }
          }}
        >
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-0 w-5 h-5 h-auto min-h-0 border-none shadow-none hover:bg-transparent"
            onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          >
            ×
          </Button>
          <strong className="text-[#333] text-sm font-bold">💬 {displayName}</strong>
          <p className="text-[#666] text-[13px] m-0 leading-snug">{msgPreview}</p>
        </div>
      ), { id: `chat-toast-${msgKey}`, duration: 5000 });

      // Also invalidate conversations to update the header inbox badge instantly
      window.dispatchEvent(new CustomEvent('new-message-received'));
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [currentUser, storeUser]);

  // 3. Mark Single Notification as Read and Navigate
  const handleNotificationClick = async (n: any) => {
    setIsOpen(false);
    
    // Navigate if there's a link
    if (n.link) {
      router.push(n.link);
    } else if (n.orderID) {
      router.push(`/orders/${n.orderID}`);
    } else if (n.briefID) {
      router.push(`/briefs/${n.briefID}`);
    } else if (n.proposalID) {
      router.push("/briefs/my-proposals");
    }

    if (n.isRead) return;
    try {
      const res = await axiosFetch.patch(`/notifications/${n._id}/read`);
      if (!res.data.error) {
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === n._id ? { ...notif, isRead: true } : notif))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // 4. Mark All as Read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await axiosFetch.patch("/notifications/read-all");
      if (!res.data.error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="notification-wrapper relative flex items-center" ref={dropdownRef}>
      {/* Header Bell Icon with Red Badge */}
      <Button 
        type="button"
        variant="ghost"
        size="icon"
        radius="full"
        className={triggerClassName || "bell-btn text-gray-500 hover:text-brand-green transition-colors relative p-0 w-8 h-8 h-auto min-h-0 border-none shadow-none hover:bg-transparent"} 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FiBell className={iconClassName || `text-[22px] transition-transform ${isAnimating ? 'animate-bounce text-brand-green' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-[6px] shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="dropdown-header px-3.5 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
            <h4 className="font-bold text-gray-800 text-sm m-0">Notifications</h4>
            {unreadCount > 0 && (
              <Button 
                type="button"
                variant="ghost"
                size="xs"
                className="mark-all-btn text-teal-700 hover:text-teal-800 text-xs font-semibold hover:underline p-0 h-auto border-none shadow-none hover:bg-transparent" 
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="dropdown-body max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="empty-text text-center text-gray-500 text-sm py-6 m-0">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-teal-50/40 ${!n.isRead ? "bg-teal-50/20" : "bg-white"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notif-title text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-teal-600 inline-block shrink-0"></span>}
                    <span className="truncate">{n.title}</span>
                  </div>
                  <div className="notif-message text-xs text-gray-600 mb-1 line-clamp-2">{n.message}</div>
                  <div className="notif-time text-[10px] text-gray-400 font-medium">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="dropdown-footer px-3.5 py-2.5 border-t border-gray-100 bg-gray-50/70 text-center flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">
              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              rightIcon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              }
              className="text-xs font-bold text-teal-800 hover:text-teal-900 hover:underline p-0 h-auto border-none shadow-none hover:bg-transparent"
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
