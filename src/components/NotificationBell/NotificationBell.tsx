"use client";
import React, { useState, useEffect } from "react";
import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";
import { FiBell } from "react-icons/fi";
import "./NotificationBell.scss";

interface NotificationBellProps {
  currentUser: any;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Fetch initial notifications from REST API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosFetch.get("/notifications");
        if (!res.data.error) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
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

      // Show real-time Toast popup on screen
      toast.custom((t) => (
        <div className={`toast-notification ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <strong>🔔 {newNotif.title}</strong>
          <p>{newNotif.message}</p>
        </div>
      ), { duration: 4000 });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [currentUser]);

  // 3. Mark Single Notification as Read
  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      const res = await axiosFetch.patch(`/notifications/${id}/read`);
      if (!res.data.error) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
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
    <div className="notification-wrapper relative flex items-center">
      {/* Header Bell Icon with Red Badge */}
      <button 
        className="bell-btn text-gray-500 hover:text-brand-green transition-colors relative" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FiBell className="text-[22px]" />
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
                  onClick={() => handleMarkAsRead(n._id, n.isRead)}
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
