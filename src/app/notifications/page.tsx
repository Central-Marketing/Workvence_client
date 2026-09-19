"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { axiosFetch, socket } from "@/utils";
import toast from "react-hot-toast";
import moment from "moment";
import {
  Bell,
  CheckCheck,
  Check,
  Search,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  DollarSign,
  AlertCircle,
  FileText,
  Trash2,
  ArrowUpRight,
  ChevronRight,
  Filter,
  X,
  Inbox
} from "lucide-react";

type TabFilter = "all" | "unread" | "read";

const NotificationsPage = () => {
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // 1. Fetch notifications for authenticated user
  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await axiosFetch.get("/notifications");
      if (!res.data.error) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 401 && status !== 502 && status !== 503) {
        console.error("Failed to load notifications:", err);
      }
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Real-time notification socket listener
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = String(user._id || user.id);

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("user_connected", userId);

    const handleNewNotification = (newNotif: any) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [user]);

  // 3. Mark single notification as read
  const handleMarkAsRead = async (e: React.MouseEvent, n: any) => {
    e.stopPropagation();
    if (n.isRead) return;

    try {
      const res = await axiosFetch.patch(`/notifications/${n._id}/read`);
      if (!res.data.error) {
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        toast.success("Marked as read");
      }
    } catch {
      toast.error("Could not update notification");
    }
  };

  // 4. Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadExist = notifications.some((n) => !n.isRead);
    if (!unreadExist) {
      toast("All notifications are already read");
      return;
    }

    setIsMarkingAll(true);
    try {
      const res = await axiosFetch.patch("/notifications/read-all");
      if (!res.data.error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // 5. Delete single notification
  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    toast.success("Notification dismissed");
  };

  // 6. Navigate on notification click
  const handleNotificationClick = async (n: any) => {
    // Optimistically mark as read
    if (!n.isRead) {
      try {
        axiosFetch.patch(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
      } catch {
        // silent fail
      }
    }

    if (n.link) {
      router.push(n.link);
    } else if (n.orderID) {
      router.push(`/orders/${n.orderID}`);
    } else if (n.proposalID) {
      router.push(`/proposals/${n.proposalID}`);
    }
  };

  // Helper to categorize and style each notification
  const getNotificationCategory = (n: any) => {
    const title = (n.title || "").toLowerCase();
    const msg = (n.message || "").toLowerCase();

    if (n.orderID || title.includes("order") || msg.includes("order") || title.includes("delivery") || msg.includes("delivered")) {
      return {
        label: "Order Update",
        icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        iconBg: "bg-emerald-50 border-emerald-100",
      };
    }
    if (n.proposalID || title.includes("proposal") || title.includes("offer") || title.includes("custom proposal")) {
      return {
        label: "Proposal",
        icon: <FileText className="w-5 h-5 text-purple-600" />,
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
        iconBg: "bg-purple-50 border-purple-100",
      };
    }
    if (title.includes("message") || msg.includes("message") || title.includes("chat")) {
      return {
        label: "Message",
        icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
        iconBg: "bg-indigo-50 border-indigo-100",
      };
    }
    if (title.includes("payment") || title.includes("payout") || title.includes("earnings") || title.includes("refund")) {
      return {
        label: "Billing",
        icon: <DollarSign className="w-5 h-5 text-amber-600" />,
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200/60",
        iconBg: "bg-amber-50 border-amber-100",
      };
    }
    if (title.includes("warning") || title.includes("alert") || title.includes("policy") || title.includes("suspended")) {
      return {
        label: "Notice",
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200/60",
        iconBg: "bg-rose-50 border-rose-100",
      };
    }

    return {
      label: "System",
      icon: <Bell className="w-5 h-5 text-[#0E3834]" />,
      badgeBg: "bg-teal-50 text-[#0E3834] border-teal-200/60",
      iconBg: "bg-teal-50/70 border-teal-100",
    };
  };

  // Filter & search logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === "unread" && n.isRead) return false;
      if (activeTab === "read" && !n.isRead) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (n.title || "").toLowerCase();
        const message = (n.message || "").toLowerCase();
        return title.includes(query) || message.includes(query);
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const readCount = useMemo(() => {
    return notifications.filter((n) => n.isRead).length;
  }, [notifications]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredNotifications.forEach((n) => {
      const date = moment(n.createdAt);
      if (date.isSame(moment(), "day")) {
        groups.Today.push(n);
      } else if (date.isSame(moment().subtract(1, "day"), "day")) {
        groups.Yesterday.push(n);
      } else {
        groups.Earlier.push(n);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const dashboardRoute = user?.isSeller ? "/dashboard/seller" : "/dashboard/buyer";

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 pt-6 sm:pt-8 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4 select-none">
          <Link href="/" className="hover:text-slate-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={dashboardRoute} className="hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0E3834] font-semibold">Notifications</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sf-pro m-0">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-[#0E3834] text-white text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 m-0 leading-relaxed max-w-xl">
              Stay updated on your active orders, client discussions, project offers, and account notifications.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-slate-300 active:scale-95 disabled:opacity-60"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#0E3834]" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || unreadCount === 0}
              className="px-4 py-2.5 rounded-xl bg-[#0E3834] hover:bg-[#092724] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0E3834]"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div className="bg-[#F3F4F6] p-1 rounded-xl flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === "all"
                ? "bg-[#0E3834] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>All</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                }`}>
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === "unread"
                ? "bg-[#0E3834] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === "unread" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                  }`}>
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("read")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === "read"
                ? "bg-[#0E3834] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>Read</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "read" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                }`}>
                {readCount}
              </span>
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-8 py-2 bg-[#F9FAFB] hover:bg-white focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-[#0E3834] focus:ring-1 focus:ring-[#0E3834] outline-hidden transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Content */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-start gap-4 animate-pulse"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-100 rounded-md w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-md w-16" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0E3834] flex items-center justify-center mb-4 shadow-2xs">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
              {searchQuery
                ? "No matching notifications"
                : activeTab === "unread"
                  ? "No unread notifications"
                  : "All caught up!"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
              {searchQuery
                ? `No notifications found matching "${searchQuery}". Try searching for another keyword.`
                : activeTab === "unread"
                  ? "You have read all your notifications. New alerts will show up here automatically."
                  : "You don't have any notifications at the moment. When orders, messages, or updates arrive, they will appear right here."}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear search filter
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push(dashboardRoute)}
                className="px-5 py-2.5 rounded-xl bg-[#0E3834] hover:bg-[#092724] text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        ) : (
          /* Grouped Notifications List */
          <div className="flex flex-col gap-6">
            {(["Today", "Yesterday", "Earlier"] as const).map((groupKey) => {
              const list = groupedNotifications[groupKey];
              if (!list || list.length === 0) return null;

              return (
                <div key={groupKey} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {groupKey}
                    </span>
                    <div className="flex-1 h-[1px] bg-slate-200/70" />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {list.map((n) => {
                      const category = getNotificationCategory(n);
                      const hasDirectLink = Boolean(n.link || n.orderID || n.proposalID);

                      return (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer group flex items-start gap-3.5 sm:gap-4 shadow-2xs hover:shadow-md hover:border-slate-300 ${!n.isRead
                            ? "bg-white border-slate-200/90 ring-1 ring-[#0E3834]/5"
                            : "bg-white/80 hover:bg-white border-slate-200/60 opacity-85 hover:opacity-100"
                            }`}
                        >
                          {/* Category Icon Badge */}
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${category.iconBg} shadow-2xs mt-0.5`}
                          >
                            {category.icon}
                          </div>

                          {/* Content Body */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${category.badgeBg}`}
                                >
                                  {category.label}
                                </span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-[#0E3834] ring-4 ring-[#0E3834]/10 shrink-0" />
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                {moment(n.createdAt).fromNow()}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0E3834] transition-colors leading-snug m-0">
                              {n.title}
                            </h4>

                            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mt-1 m-0">
                              {n.message}
                            </p>

                            {/* Direct Action Link Hint */}
                            {hasDirectLink && (
                              <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#0E3834] group-hover:underline">
                                <span>
                                  {n.orderID
                                    ? "View Order"
                                    : n.proposalID
                                      ? "Review Proposal"
                                      : "View Details"}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          {/* Item Actions */}
                          <div className="flex items-center gap-1 shrink-0 self-center pl-1">
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(e, n)}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                                title="Mark as read"
                                aria-label="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotification(e, n._id)}
                              className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer opacity-0 group-hover:opacity-100 max-sm:opacity-100"
                              title="Dismiss notification"
                              aria-label="Dismiss notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
