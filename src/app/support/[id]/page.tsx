"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { RiAddLine } from "react-icons/ri";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, File02Icon } from "@hugeicons/core-free-icons";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShoppingBag,
  User,
  ShieldCheck,
  RefreshCw,
  Upload,
  FileText,
  ImageIcon,
  Eye,
  Download,
  X,
  File,
  Lock,
} from "lucide-react";
import { supportService, SupportTicketItem, SupportMessage } from "@/utils/supportService";
import { useSupportSocket, SocketSupportMessage } from "@/hooks/useSupportSocket";
import { useUserStore } from "@/store/userStore";
import { Button, PageHeader, SupportTicketSkeleton, AIPolishButton } from "@/components/ui";

interface SupportAttachmentCardProps {
  att: any;
  isMe: boolean;
  onPreview: (img: { url: string; name: string }) => void;
  onDownload: (e: React.MouseEvent, url: string, name: string) => void;
}

function SupportAttachmentCard({ att, isMe, onPreview, onDownload }: SupportAttachmentCardProps) {
  const fileUrl =
    att.url ||
    att.secure_url ||
    (att.public_id && att.public_id.startsWith("http")
      ? att.public_id
      : att.public_id
        ? `https://res.cloudinary.com/cqtrqtyu/image/upload/${att.public_id}`
        : "");

  const name = att.name || "Attachment";
  const sizeText =
    att.size ||
    (att.bytes ? `${(att.bytes / 1024).toFixed(0)} KB` : "Attachment");

  const isImg = Boolean(
    att.type === "image" ||
    att.type?.startsWith("image") ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)($|[?#])/i.test(fileUrl) ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i.test(name) ||
    (fileUrl.includes("cloudinary.com") && fileUrl.includes("/image/") && !fileUrl.includes("pdf"))
  );

  const isPdf = /\.(pdf)($|[?#])/i.test(fileUrl) || /\.(pdf)$/i.test(name) || att.type === "pdf";

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isImg && fileUrl) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPreview({ url: fileUrl, name });
        }}
        className="mt-1 overflow-hidden rounded-[6px] border border-slate-200/90 shadow-sm max-w-[280px] bg-slate-50 cursor-pointer group hover:border-[#327C73]/50 transition-all mb-1.5"
        title="Click to preview image"
      >
        <img
          src={fileUrl}
          alt={name}
          className="w-full max-h-[220px] object-cover group-hover:scale-[1.02] transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleOpenInNewTab}
      className="flex items-center gap-2.5 px-3.5 py-2.5 mt-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-[6px] transition-all border border-slate-200/90 text-xs font-semibold cursor-pointer select-none max-w-[280px] group shadow-2xs mb-1.5"
      title="Click to open file in a new tab"
    >
      <div className="w-8 h-8 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
        {isPdf ? (
          <HugeiconsIcon icon={Pdf01Icon} size={18} className="text-rose-500" />
        ) : (
          <HugeiconsIcon icon={File02Icon} size={18} className="text-[#0D6D5F]" />
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span className="truncate text-slate-900 text-[12.5px] font-medium leading-tight group-hover:text-[#327C73] transition-colors">
          {name}
        </span>
        <span className="text-[10.5px] text-slate-400 font-normal mt-0.5 flex items-center gap-1">
          <span>Click to open in new tab</span>
        </span>
      </div>
      <span className="text-slate-400 group-hover:text-slate-700 text-sm shrink-0">
        ↗
      </span>
    </div>
  );
}

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;
  const { user } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [is403, setIs403] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; public_id?: string; type?: string }[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"group" | "private">("group");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleDownload = async (e: React.MouseEvent, url: string, fileName: string = "attachment") => {
    e.stopPropagation();
    e.preventDefault();
    if (!url || url === "#") return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName || "attachment";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch {
      // Fallback
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = String(user?._id || user?.id || "").trim();

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Auto-scroll only the chat container (NOT the page window) when messages load or change
  useEffect(() => {
    if (messages.length > 0 && messageContainerRef.current) {
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, scrollToBottom]);

  const extractThreadMessages = useCallback((ticketObj: any, threadName: string): SupportMessage[] => {
    if (!ticketObj) return [];
    const targetThread = (threadName || 'group').toLowerCase();

    // 1. Thread array from ticketObj.threads (if backend provides threads object)
    const threadArray = Array.isArray(ticketObj.threads?.[targetThread]) ? ticketObj.threads[targetThread] : [];

    // 2. Filter from ticketObj.messages
    const allMessages = Array.isArray(ticketObj.messages) ? ticketObj.messages : [];
    const filteredMessages = allMessages.filter((m: any) => {
      const mThread = (m.thread || 'group').toLowerCase();
      if (targetThread === 'group') {
        return !m.thread || mThread === 'group';
      }
      return mThread === targetThread;
    });

    // Deduplicate and sort chronologically by createdAt (oldest to newest)
    const uniqueMap = new Map<string, SupportMessage>();
    [...threadArray, ...filteredMessages].forEach((m: any) => {
      const key = m.id || m._id || `${m.senderID || m.sender}-${m.createdAt}-${m.message || ""}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, m);
      }
    });

    return Array.from(uniqueMap.values()).sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, []);

  const [adminPrivateTarget, setAdminPrivateTarget] = useState<"buyer" | "seller">("buyer");

  const currentUserParticipant = ticket?.participants?.find((p: any) => {
    const pid = String(p.id || p._id || p.userId || "").trim();
    return pid && pid === currentUserId;
  });
  let userRole = ticket?.userRole || currentUserParticipant?.role?.toLowerCase();
  if (!userRole || userRole === 'creator' || userRole === 'user') {
    userRole = user?.isSeller ? "seller" : "buyer";
  }
  const isUserAdmin = Boolean(user?.isAdmin || userRole === 'admin');
  const privateThreadId = isUserAdmin
    ? adminPrivateTarget
    : (userRole === "seller" ? "seller" : "buyer");
  const hasPrivateThread = Boolean(privateThreadId);
  const currentThreadName = (activeTab === "private" && privateThreadId) ? privateThreadId : "group";

  const handleMessageReceived = useCallback((newMsg: SocketSupportMessage) => {
    const incomingThread = (newMsg.thread || 'group').toLowerCase();
    const activeThread = (currentThreadName || 'group').toLowerCase();

    // Cache into ticket state so switching tabs preserves real-time incoming messages
    setTicket((prevTicket: any) => {
      if (!prevTicket) return prevTicket;
      const updatedMessages = Array.isArray(prevTicket.messages) ? [...prevTicket.messages] : [];
      const formattedMsg: SupportMessage = {
        id: newMsg.id || newMsg.createdAt,
        sender: newMsg.sender,
        senderID: newMsg.senderID || (newMsg.role === "admin" ? "support" : ""),
        role: (newMsg.role as any) || "admin",
        message: newMsg.message,
        attachments: newMsg.attachments || [],
        createdAt: newMsg.createdAt,
        thread: incomingThread,
      };

      if (!updatedMessages.some((m: any) => (newMsg.id && m.id === newMsg.id) || (m.createdAt === newMsg.createdAt && m.message === newMsg.message))) {
        updatedMessages.push(formattedMsg);
      }

      const existingThreads = prevTicket.threads || {};
      const threadArr = Array.isArray(existingThreads[incomingThread]) ? [...existingThreads[incomingThread]] : [];
      if (!threadArr.some((m: any) => (newMsg.id && m.id === newMsg.id) || (m.createdAt === newMsg.createdAt && m.message === newMsg.message))) {
        threadArr.push(formattedMsg);
      }

      return {
        ...prevTicket,
        messages: updatedMessages,
        threads: {
          ...existingThreads,
          [incomingThread]: threadArr,
        }
      };
    });

    // Only update view if message belongs to current thread
    if (incomingThread === activeThread) {
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              (newMsg.id && m.id === newMsg.id) ||
              (m.createdAt === newMsg.createdAt && (m.message === newMsg.message || m.senderID === newMsg.senderID))
          )
        ) {
          return prev;
        }
        const mappedMsg: SupportMessage = {
          id: newMsg.id || newMsg.createdAt,
          sender: newMsg.sender,
          senderID: newMsg.senderID || (newMsg.role === "admin" ? "support" : ""),
          role: (newMsg.role as any) || "admin",
          message: newMsg.message,
          attachments: newMsg.attachments || [],
          createdAt: newMsg.createdAt,
          thread: incomingThread,
        };
        return [...prev, mappedMsg];
      });
      setTimeout(scrollToBottom, 100);
    }
  }, [scrollToBottom, currentThreadName]);

  const { isConnected, isUnauthorized, typingUser, sendSupportMessage, startTyping, stopTyping } = useSupportSocket({
    ticketId,
    thread: currentThreadName,
    userDisplayName: user?.username || user?.name || user?.email || "User",
    onMessageReceived: handleMessageReceived,
  });

  const currentThreadNameRef = useRef(currentThreadName);
  useEffect(() => {
    currentThreadNameRef.current = currentThreadName;
  }, [currentThreadName]);

  const fetchTicketDetails = useCallback(async (showLoader = false) => {
    if (!ticketId) return;
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    setIs403(false);
    try {
      const data = await supportService.getTicketById(ticketId);
      const ticketObj = (data as any)?.ticket || (data as any)?.data?.ticket || data;
      setTicket(ticketObj);

      const sortedMessages = extractThreadMessages(ticketObj, currentThreadNameRef.current);
      setMessages(sortedMessages);
    } catch (err: any) {
      console.error("Failed to load ticket details:", err);
      const status = err?.response?.status;
      if (status === 403) {
        setIs403(true);
      }
      setError(err?.response?.data?.message || err.message || "Failed to load support ticket details.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setTimeout(scrollToBottom, 150);
    }
  }, [ticketId, scrollToBottom, extractThreadMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTicketDetails(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails(true);
  }, [ticketId, fetchTicketDetails]);

  // Sync messages immediately upon switching tabs or when ticket updates
  useEffect(() => {
    if (!ticket) return;
    const threadMsgs = extractThreadMessages(ticket, currentThreadName);
    setMessages(threadMsgs);
    setTimeout(scrollToBottom, 50);
  }, [activeTab, ticket, currentThreadName, extractThreadMessages, scrollToBottom]);

  // Auto-sync when user switches back to this browser tab (production best practice)
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchTicketDetails(false);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchTicketDetails]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingFile(true);
    setError(null);

    try {
      const uploaded = await supportService.uploadFileToCloudinary(file, "chat_attachments");
      setAttachments((prev) => [
        ...prev,
        {
          name: uploaded.name,
          url: uploaded.secure_url || uploaded.url,
          public_id: uploaded.public_id,
          type: uploaded.type,
        },
      ]);
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const canSend = !sending && !uploadingFile && (replyText.trim().length > 0 || attachments.length > 0);
    if (!canSend) return;

    const currentAttachments = [...attachments];
    const messageContent = replyText.trim() || (currentAttachments.length > 0 ? "attachment" : "");

    setReplyText("");
    setAttachments([]);
    setSending(true);

    try {
      // Post reply to backend HTTP API (clean payload: message and attachments, thread/role)
      const res = await supportService.replyTicket(ticketId, {
        message: messageContent,
        attachments: currentAttachments,
        thread: currentThreadName,
      });

      // If backend returns updated ticket with messages, sync immediately
      const updatedTicket = res?.data?.ticket || res?.ticket || res;
      if (updatedTicket && (updatedTicket.id || updatedTicket._id)) {
        setTicket(updatedTicket);
        const threadMsgs = extractThreadMessages(updatedTicket, currentThreadName);
        setMessages(threadMsgs);
      } else {
        // Fallback: emit via socket if supported
        if (isConnected) {
          sendSupportMessage(messageContent, currentAttachments);
        }
        await fetchTicketDetails();
      }
    } catch (err: any) {
      console.error("Failed to send reply:", err);
      const status = err?.response?.status;
      if (status === 403) {
        setIs403(true);
      }
      setError(err?.response?.data?.message || "Failed to send message reply.");
    } finally {
      setSending(false);
      stopTyping();
      setTimeout(scrollToBottom, 100);
    }
  };

  const formatStatusPill = (status?: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0D6D5F]/10 text-[#0D6D5F] border border-[#0D6D5F]/20">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case "escalated_to_dispute":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5" /> Escalated to Dispute
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {status || "Open"}
          </span>
        );
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0D6D5F]/15 text-[#0D6D5F] border border-[#0D6D5F]/30 uppercase">
            Support Agent
          </span>
        );
      case "buyer":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
            Buyer
          </span>
        );
      case "seller":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase">
            Seller
          </span>
        );
      case "creator":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase">
            Creator
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <SupportTicketSkeleton />;
  }

  // Unauthorized (403) or socket unauthorized state
  if (is403 || isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-[6px] border border-[#e2e8f0] text-center space-y-4 shadow-xs">
          <ShieldAlert className="w-12 h-12 mx-auto text-rose-600" />
          <h2 className="text-lg font-bold text-[#0f172a] font-sf-pro">Access Restricted</h2>
          <p className="text-xs text-[#64748b] font-inter">
            You are not authorized to view or reply to this support ticket. Tickets are private to the participants of the associated order and support agents.
          </p>
          <div className="pt-2">
            <Link
              href="/support"
              className="inline-flex px-5 py-2.5 rounded-[6px] bg-[#0f172a] text-white font-semibold text-xs hover:bg-[#1e293b] transition font-sf-pro"
            >
              Back to Support Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-[6px] border border-[#e2e8f0] text-center space-y-4 shadow-xs">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-600" />
          <h2 className="text-lg font-bold text-[#0f172a] font-sf-pro">Ticket Not Found</h2>
          <p className="text-xs text-[#64748b] font-inter">{error || "The requested support ticket could not be found."}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/support"
              className="px-5 py-2.5 rounded-[6px] bg-[#f1f5f9] text-[#334155] font-semibold text-xs hover:bg-[#e2e8f0] transition font-sf-pro"
            >
              Back to Dashboard
            </Link>
            <Button
              onClick={() => fetchTicketDetails(true)}
              variant="brand"
              size="sm"
              radius="fiverr"
              className="px-5 py-2.5 font-semibold text-xs font-sf-pro"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Participants list from backend, with fallback for backward compatibility
  const rawParticipants = Array.isArray(ticket.participants) && ticket.participants.length > 0
    ? [...ticket.participants]
    : [
      ticket.user ? { id: ticket.user.id, name: ticket.user.name, avatar: ticket.user.avatar, role: "creator" as const } : null,
      { id: "support", name: "Support Agent", role: "admin" as const },
    ].filter(Boolean);

  if (ticket.otherParty && !rawParticipants.some((p: any) => p.id === ticket.otherParty?.id)) {
    rawParticipants.push({
      id: ticket.otherParty.id,
      name: ticket.otherParty.name,
      avatar: ticket.otherParty.avatar,
      role: (ticket.otherParty.role as any) || "user",
    });
  }
  if (ticket.creator && !rawParticipants.some((p: any) => p.id === ticket.creator?.id)) {
    rawParticipants.unshift({
      id: ticket.creator.id,
      name: ticket.creator.name,
      avatar: ticket.creator.avatar,
      role: "creator",
    });
  }
  const participants = rawParticipants;

  const canSendReply = !sending && !uploadingFile && (replyText.trim().length > 0 || attachments.length > 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 md:pt-12 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-7">
        <PageHeader
          homeHref="/dashboard/seller"
          homeTitle="Dashboard"
          breadcrumbs={[
            { name: "Support", href: "/support" },
            { name: ticket.ticketNumber || `#TK-${ticketId.substring(0, 6).toUpperCase()}`, isLast: true },
          ]}
          title={ticket.subject}

          actions={
            <div className="flex items-center gap-2.5">
              {/* Alert indicator when socket is disconnected or reconnecting */}
              {!isConnected ? (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium font-inter animate-in fade-in duration-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Connection lost • Reconnecting...</span>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="ml-0.5 text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer disabled:opacity-50"
                  >
                    {refreshing ? "Syncing..." : "Sync Now"}
                  </button>
                </div>
              ) : (
                /* Subtle status indicator when live & healthy */
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold font-inter">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Live</span>
                </div>
              )}

              {/* Discreet manual refresh icon button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh conversation"
                aria-label="Refresh conversation"
                className="p-2 rounded-[6px] text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#0D6D5F]" : ""}`} />
              </button>
            </div>
          }
        />

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Ticket Details & Context Sidebar (Fiverr/Upwork Style) */}
          <div className="lg:col-span-1 space-y-4 self-start lg:sticky lg:top-24">

            {/* 1. Linked Order Context Card (if order linked) */}
            {(ticket.order || ticket.orderID) && (
              <div className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0D6D5F]" />
                    <span className="text-xs font-bold font-sf-pro text-[#0f172a] uppercase tracking-wider">
                      Linked Order
                    </span>
                  </div>
                  {ticket.isCreator === false && (
                    <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#0D6D5F]/10 text-[#0D6D5F] border border-[#0D6D5F]/20 uppercase">
                      {ticket.userRole ? `${ticket.userRole} view` : user?.isSeller ? "Seller View" : "Buyer View"}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs font-inter">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-bold text-[#0f172a] text-sm">
                      {ticket.order?.orderCode || ticket.order?.code || ticket.orderID}
                    </span>
                    {ticket.order?.price && (
                      <span className="font-bold text-[#0D6D5F] text-sm">
                        {typeof ticket.order.price === "number" ? `$${ticket.order.price}` : ticket.order.price.startsWith("$") ? ticket.order.price : `$${ticket.order.price}`}
                      </span>
                    )}
                  </div>
                  {ticket.order?.title && (
                    <p className="text-[#475569] text-xs line-clamp-2 leading-relaxed">
                      {ticket.order.title}
                    </p>
                  )}
                </div>

                {ticket.isCreator === false && (
                  <p className="text-[11px] text-[#64748b] leading-relaxed pt-1 border-t border-[#f8fafc]">
                    Opened by <strong className="text-[#0f172a]">{ticket.creator?.name || ticket.otherParty?.name || "the other party"}</strong>. You can participate in the group chat or reply privately to support.
                  </p>
                )}

                {ticket.order?.id && (
                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <Link
                      href={`/orders/${ticket.order.id}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-[6px] bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0D6D5F] border border-[#e2e8f0] text-xs font-bold transition-colors"
                    >
                      <span>View Order Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 2. Ticket Information & Timeline Card */}
            <div className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-4">
              <h3 className="text-xs font-bold font-sf-pro text-[#0f172a] uppercase tracking-wider pb-2.5 border-b border-[#f1f5f9]">
                Ticket Information
              </h3>

              <div className="space-y-2.5 text-xs font-inter">
                <div className="flex items-center justify-between py-1 border-b border-[#f8fafc]">
                  <span className="text-[#64748b]">Ticket ID:</span>
                  <span className="font-mono font-bold text-[#0f172a]">
                    {ticket.ticketNumber || `#TK-${ticketId.substring(0, 6).toUpperCase()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#f8fafc]">
                  <span className="text-[#64748b]">Category:</span>
                  <span className="font-semibold text-[#0f172a] text-right">
                    {ticket.category || "General Support"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#f8fafc]">
                  <span className="text-[#64748b]">Status:</span>
                  <div>{formatStatusPill(ticket.status)}</div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#f8fafc]">
                  <span className="text-[#64748b]">Created:</span>
                  <span className="text-[#0f172a] font-medium">
                    {ticket.createdAt ? moment(ticket.createdAt).format("MMM D, YYYY") : "Recently"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#64748b]">Relationship:</span>
                  <span className="text-[#0f172a] font-medium">
                    {ticket.isCreator !== false ? "Created by you" : "Linked Order Participant"}
                  </span>
                </div>
              </div>

              {/* Participants */}
              <div className="pt-3 border-t border-[#f1f5f9] space-y-2.5">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block font-sf-pro">
                  Participants ({participants.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {participants.map((p: any, idx: number) => {
                    const isUser = p.id === currentUserId;
                    const displayName = p.role === "admin" ? "Support Agent" : p.name || "Member";
                    return (
                      <div
                        key={p.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-semibold text-[#0f172a]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0D6D5F]" />
                        <span>{displayName} {isUser && "(You)"}</span>
                        {getRoleBadge(p.role)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Safety Notice (Fiverr / Upwork Trust & Safety Banner) */}
            <div className="p-4 rounded-[6px] bg-slate-50 border border-slate-200/80 text-[11.5px] text-[#64748b] leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-[#0f172a] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D6D5F]" />
                <span>Workvence Trust & Safety</span>
              </div>
              <p>
                All communications and order escalations are monitored by Workvence. Never share passwords, bank credentials, or take payments outside the platform.
              </p>
            </div>

          </div>

          {/* Conversation Stream */}
          <div className="lg:col-span-2 bg-white rounded-[6px] border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col min-h-[500px] max-h-[80vh]">

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0D6D5F] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0f172a]">
                    {activeTab === "private"
                      ? (isUserAdmin ? `Private Support Conversation (${adminPrivateTarget.toUpperCase()})` : "Private Support Conversation")
                      : "Shared Group Conversation"}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {activeTab === "private"
                      ? "🔒 Messages here are private between you and Support."
                      : "👥 Messages here are visible to all participants (Buyer, Seller & Support)."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasPrivateThread && (() => {
                  const groupCount = extractThreadMessages(ticket, "group").length;
                  const privateCount = extractThreadMessages(ticket, privateThreadId).length;
                  const buyerCount = extractThreadMessages(ticket, "buyer").length;
                  const sellerCount = extractThreadMessages(ticket, "seller").length;

                  return (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center bg-white border border-[#e2e8f0] rounded-[6px] p-0.5 shadow-2xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveTab("group")}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 ${activeTab === "group" ? "bg-[#0D6D5F] text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                        >
                          <span>Group Chat</span>
                          <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${activeTab === "group" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {groupCount}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("private")}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 ${activeTab === "private" ? "bg-[#0D6D5F] text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                        >
                          <span>Private with Support</span>
                          <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${activeTab === "private" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {privateCount}
                          </span>
                        </button>
                      </div>

                      {isUserAdmin && activeTab === "private" && (
                        <div className="flex items-center bg-white border border-[#e2e8f0] rounded-[6px] p-0.5 shadow-2xs shrink-0 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setAdminPrivateTarget("buyer")}
                            className={`px-2.5 py-1 font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 ${adminPrivateTarget === "buyer" ? "bg-[#0D6D5F] text-white" : "text-slate-500 hover:bg-slate-50"}`}
                          >
                            <span>Buyer</span>
                            <span className="px-1 text-[9px] rounded bg-white/70 font-bold">{buyerCount}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminPrivateTarget("seller")}
                            className={`px-2.5 py-1 font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 ${adminPrivateTarget === "seller" ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                          >
                            <span>Seller</span>
                            <span className="px-1 text-[9px] rounded bg-white/70 font-bold">{sellerCount}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <span className="text-[11px] text-[#64748b] hidden sm:inline-block">
                  {messages.length} Message{messages.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Message List */}
            <div ref={messageContainerRef} className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[600px] bg-[#f8fafc]/50 scroll-smooth">
              {messages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <User className="w-8 h-8 mx-auto text-[#cbd5e1]" />
                  <p className="text-xs text-[#64748b]">No messages yet. Send a reply below.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isSystem = msg.role === "system";
                  const isAdmin = msg.role === "admin" || msg.senderID === "support";
                  const isMe = Boolean(currentUserId && msg.senderID && msg.senderID === currentUserId);
                  const displayName = isAdmin ? "Support Agent" : msg.sender || (isMe ? "You" : "Participant");
                  const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                  // System message rendering (e.g. escalated to dispute)
                  if (isSystem) {
                    return (
                      <div key={msg.id || idx} className="flex items-center justify-center my-3">
                        <div className="px-4 py-2 rounded-[6px] bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium text-center max-w-md shadow-2xs">
                          <span className="font-bold mr-1">System Notice:</span>
                          <span>{msg.message}</span>
                          {timeStr && <span className="block text-[10px] text-purple-600 mt-0.5">{timeStr}</span>}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 items-end max-w-[85%] sm:max-w-[75%] [overflow-wrap:anywhere] [word-break:break-word] ${isMe ? "self-end justify-end ml-auto" : "self-start mr-auto"}`}
                    >
                      {!isMe && (
                        <div
                          className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0 border border-slate-100 ${isAdmin ? "bg-[#0D6D5F]" : "bg-[#0f172a]"}`}
                        >
                          {isAdmin ? "S" : displayName[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <div className={`flex items-center gap-2 text-[11px] font-semibold text-[#64748b] px-1 mb-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span>{isMe ? "You" : displayName}</span>
                          {getRoleBadge(msg.role)}
                          {(msg.thread === "buyer" || msg.thread === "seller" || activeTab === "private") && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Lock className="w-2.5 h-2.5" /> Private
                            </span>
                          )}
                        </div>

                        <div
                          className={`relative px-4 py-3 min-w-[100px] max-w-full shadow-2xs [overflow-wrap:anywhere] [word-break:break-word] ${isMe ? "rounded-[10px_10px_10px_0] border border-[rgba(0,0,0,0.10)] bg-[var(--Foundation-White-white-300,#F5F5F5)] text-slate-800" : "rounded-[10px_10px_10px_0] bg-[#FFF] border-0 text-[#0f172a]"}`}
                        >
                          {msg.message && <p className="text-[13.5px] m-0 whitespace-pre-wrap leading-relaxed">{msg.message}</p>}
                          <span className="text-[11px] text-slate-400 block mt-1">{timeStr}</span>

                          {/* Attachments rendering with Signed URL resolution & Image Previews */}
                          {/* Attachments Section */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`mt-3 pt-3 border-t ${isMe ? "border-white/20" : "border-[#e2e8f0]"} space-y-2`}>
                              <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isMe ? "text-white/80" : "text-[#64748b]"}`}>
                                <FileText className="w-3 h-3" />
                                <span>Attachments ({msg.attachments.length})</span>
                              </p>

                              <div className="grid grid-cols-1 gap-2">
                                {msg.attachments.map((att: any, aIdx: number) => (
                                  <SupportAttachmentCard
                                    key={att.id || att.public_id || `${att.name}-${aIdx}`}
                                    att={att}
                                    isMe={isMe}
                                    onPreview={(img) => setSelectedPreviewImage(img)}
                                    onDownload={handleDownload}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>


                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {typingUser && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0D6D5F] animate-pulse font-inter">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{typingUser} is typing a response...</span>
                </div>
              )}
            </div>

            {/* Message Composer (ChatView Style) */}
            <div className="p-4 sm:px-5 sm:py-4 bg-[#f0f0f0] border-t border-[#e2e8f0] relative max-md:p-3 shrink-0">

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((att, idx) => {
                    const isImg =
                      att.type?.includes("image") ||
                      /\.(png|jpe?g|gif|webp|svg)/i.test(att.name) ||
                      att.url?.includes("/image/upload/");
                    const isPdf =
                      att.type?.includes("pdf") ||
                      /\.pdf$/i.test(att.name) ||
                      att.url?.includes(".pdf");

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-white rounded-[6px] border border-gray-200 shadow-xs max-w-sm"
                      >
                        {isImg ? (
                          <img
                            src={att.url}
                            alt="Attachment preview"
                            className="w-12 h-12 rounded-[4px] object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-[4px] bg-slate-50 border border-gray-200 flex items-center justify-center shrink-0">
                            {isPdf ? (
                              <HugeiconsIcon icon={Pdf01Icon} size={22} className="text-rose-500" />
                            ) : (
                              <HugeiconsIcon icon={File02Icon} size={22} className="text-[#0D6D5F]" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {att.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Ready to send
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          radius="full"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="w-6 h-6 min-h-0 !p-0 text-slate-400 hover:text-red-500 font-bold hover:bg-slate-100"
                          title="Remove attachment"
                          aria-label="Remove attachment"
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <form
                onSubmit={handleSendReply}
                className="relative flex items-end gap-2 p-2 bg-white border border-gray-200 rounded-[6px] shadow-sm max-md:px-2 max-md:py-1.5 max-md:gap-1.5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Plus / Attach Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  radius="xl"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0 mb-0.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  title="Attach file or image"
                  aria-label="Attach file or image"
                  icon={uploadingFile ? <Loader2 className="w-4 h-4 animate-spin text-[#0D6D5F]" /> : <RiAddLine className="w-5 h-5" />}
                />

                {/* Message Textarea */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder={
                    activeTab === "private"
                      ? "Type a private message to Support..."
                      : "Type a group message (visible to all participants)..."
                  }
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    startTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (canSendReply) {
                        handleSendReply(e);
                      }
                    }
                  }}
                  onBlur={stopTyping}
                  disabled={isPolishing}
                  className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-sm py-1.5 px-1 min-h-[36px] max-h-32 overflow-y-auto scrollbar-hide scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-inter leading-relaxed"
                />

                {/* AI Polish Button */}
                <AIPolishButton
                  text={replyText}
                  onSuccess={(polishedText) => setReplyText(polishedText)}
                  onStateChange={setIsPolishing}
                  className="mb-0.5"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!canSendReply || isPolishing}
                  aria-label="Send message"
                  title={activeTab === "private" ? "Send Privately" : "Send Reply"}
                  className="w-[28px] h-[28px] rounded-[60px] bg-[var(--Foundation-Grey-grey-900,#1F1F1F)] hover:bg-[#111111] active:scale-95 disabled:opacity-30 disabled:hover:bg-[var(--Foundation-Grey-grey-900,#1F1F1F)] disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-sm mb-0.5"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-5 h-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 5.5V19"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 11C18 11 13.5811 5.00001 12 5C10.4188 4.99999 6 11 6 11"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>

      {/* High-Res Image Preview Lightbox Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-rose-400 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-[6px] overflow-hidden border border-white/20 shadow-2xl bg-[#0f172a] max-h-[80vh] flex items-center justify-center">
              <img
                src={selectedPreviewImage.url}
                alt={selectedPreviewImage.name}
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3 text-white text-xs font-semibold">
              <span className="truncate max-w-xs">{selectedPreviewImage.name}</span>
              <button
                type="button"
                onClick={(e) => handleDownload(e, selectedPreviewImage.url, selectedPreviewImage.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#0D6D5F] text-white hover:bg-[#0D6D5F]/90 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
