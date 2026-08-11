"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";
import { FiBell } from "react-icons/fi";
import { playNotificationSound } from "@/utils/soundUtil";
import "./NotificationBell.scss";

interface NotificationBellProps {
  currentUser: any;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser }) => {
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
        if (err.response?.status !== 401) {
          console.error("Failed to load notifications:", err);
        }
      }
    };

    if (currentUser?._id) {
      fetchNotifications();
    }
  }, [currentUser]);

  // 2. Connect Socket.io & listen for real-time 'new_notification'
  useEffect(() => {
    if (!currentUser?._id) return;

    // Join personal socket room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("user_connected", currentUser._id);

    // Listen for real-time notification broadcast from server
    const handleNewNotification = (newNotif: any) => {
      // Add new notification to top of list
      setNotifications((prev) => [newNotif, ...prev]);
      
      // Increment unread badge count
      setUnreadCount((prev) => prev + 1);

      // Trigger subtle animation on the icon
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000); // 2 seconds of bounce

      toast.custom((t) => (
        <div className={`toast-notification relative ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold px-1"
            onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          >
            ×
          </button>
          <strong>🔔 {newNotif.title}</strong>
          <p>{newNotif.message}</p>
        </div>
      ), { duration: 86400000 });
      
      // Play notification sound for all non-chat notifications
      playNotificationSound('notification');
    };

    // Listen for real-time incoming messages (chat messages from other users)
    const handleReceiveMessage = (newMsg: any) => {
      // Don't notify for messages sent by the current user
      const senderId = newMsg.userID?._id || newMsg.userID;
      if (senderId === currentUser._id) return;

      // Play message sound and show toast ONLY if user is NOT on the chat page
      const isViewingCurrentChat = typeof window !== 'undefined' && window.location.pathname.includes(`/message/${newMsg.conversationID}`);
      const isAnyChatPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/message');

      if (isViewingCurrentChat || isAnyChatPage) return;

      // Play message notification sound
      playNotificationSound('message');

      const senderName = newMsg.userID?.username || 'Someone';
      const msgPreview = newMsg.description?.startsWith('[CUSTOM_OFFER]') 
        ? 'sent you a custom proposal' 
        : newMsg.description?.slice(0, 60) || 'sent a message';

      // Show toast for incoming message
      toast.custom((t) => (
        <div 
          className={`toast-notification relative ${t.visible ? 'animate-enter' : 'animate-leave'}`}
          style={{ cursor: 'pointer', paddingRight: '24px' }}
          onClick={() => {
            toast.dismiss(t.id);
            window.location.href = `/message/${newMsg.conversationID}`;
          }}
        >
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold px-1"
            onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          >
            ×
          </button>
          <strong>💬 {senderName}</strong>
          <p>{msgPreview}</p>
        </div>
      ), { duration: 86400000 });

      // Also invalidate conversations to update the header inbox badge instantly
      // (uses window event to signal HeaderInboxIcon to refetch)
      window.dispatchEvent(new CustomEvent('new-message-received'));
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [currentUser]);

  // 3. Mark Single Notification as Read and Navigate
  const handleNotificationClick = async (n: any) => {
    setIsOpen(false);
    
    // Navigate if there's a link
    if (n.link) {
      router.push(n.link);
    } else if (n.orderID) {
      router.push(`/orders/${n.orderID}`);
    } else if (n.proposalID) {
      router.push(`/proposals/${n.proposalID}`);
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
      <button 
        className="bell-btn text-gray-500 hover:text-brand-green transition-colors relative" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FiBell className={`text-[22px] transition-transform ${isAnimating ? 'animate-bounce text-brand-green' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col">
          <div className="dropdown-header p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h4 className="font-bold text-gray-800 text-sm m-0">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                className="mark-all-btn text-brand-green text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer" 
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="dropdown-body max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="empty-text text-center text-gray-500 text-sm py-6 m-0">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${!n.isRead ? "bg-green-50/30" : "bg-white"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notif-title text-sm font-bold text-gray-800 mb-1 flex items-center gap-1">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-green inline-block"></span>}
                    {n.title}
                  </div>
                  <div className="notif-message text-xs text-gray-600 mb-1 line-clamp-2">{n.message}</div>
                  <div className="notif-time text-[10px] text-gray-400 font-medium">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
