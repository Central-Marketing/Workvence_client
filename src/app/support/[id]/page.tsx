"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, File02Icon } from "@hugeicons/core-free-icons";
import {
  ArrowLeft,
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
} from "lucide-react";
import { supportService, SupportTicketItem, SupportMessage } from "@/utils/supportService";
import { useSupportSocket, SocketSupportMessage } from "@/hooks/useSupportSocket";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui";

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
  const params = useParams();
  const ticketId = params?.id as string;
  const { user } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is403, setIs403] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; public_id?: string; type?: string }[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{ url: string; name: string } | null>(null);

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

  const handleMessageReceived = useCallback((newMsg: SocketSupportMessage) => {
    setMessages((prev) => {
      // Dedupe incoming socket message against existing message list using id or createdAt
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
      };
      return [...prev, mappedMsg];
    });
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const { isConnected, isUnauthorized, typingUser, sendSupportMessage, startTyping, stopTyping } = useSupportSocket({
    ticketId,
    thread: "group",
    userDisplayName: user?.username || user?.name || user?.email || "User",
    onMessageReceived: handleMessageReceived,
  });

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    setIs403(false);
    try {
      const data = await supportService.getTicketById(ticketId);
      const ticketObj = (data as any)?.ticket || (data as any)?.data?.ticket || data;
      setTicket(ticketObj);

      // Single shared messages stream
      let allSupportMessages: SupportMessage[] = [];
      if (Array.isArray(ticketObj?.messages)) {
        allSupportMessages = ticketObj.messages;
      } else if (Array.isArray(ticketObj?.threads?.group)) {
        allSupportMessages = ticketObj.threads.group;
      }

      // Deduplicate and sort chronologically by createdAt (oldest to newest)
      const uniqueMap = new Map<string, SupportMessage>();
      allSupportMessages.forEach((m: any) => {
        const key = m.id || `${m.senderID || m.sender}-${m.createdAt}-${m.message || ""}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, m);
        }
      });

      const sortedMessages = Array.from(uniqueMap.values()).sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
    } catch (err: any) {
      console.error("Failed to load ticket details:", err);
      const status = err?.response?.status;
      if (status === 403) {
        setIs403(true);
      }
      setError(err?.response?.data?.message || err.message || "Failed to load support ticket details.");
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 150);
    }
  }, [ticketId, scrollToBottom]);

  useEffect(() => {
    fetchTicketDetails();
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
      // Post reply to backend HTTP API (clean payload: message and attachments, no thread/role)
      const res = await supportService.replyTicket(ticketId, {
        message: messageContent,
        attachments: currentAttachments,
      });

      // If backend returns updated ticket with messages, sync immediately
      const updatedTicket = res?.data?.ticket || res?.ticket || res;
      if (updatedTicket && Array.isArray(updatedTicket.messages)) {
        setTicket(updatedTicket);
        setMessages(updatedTicket.messages);
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
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
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">
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
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 mx-auto animate-spin text-[#0D6D5F]" />
          <p className="text-xs font-semibold text-[#64748b]">Loading support conversation...</p>
        </div>
      </div>
    );
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
              onClick={fetchTicketDetails}
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
  const participants = Array.isArray(ticket.participants) && ticket.participants.length > 0
    ? ticket.participants
    : [
      ticket.user ? { id: ticket.user.id, name: ticket.user.name, avatar: ticket.user.avatar, role: "creator" as const } : null,
      { id: "support", name: "Support Agent", role: "admin" as const },
    ].filter(Boolean);

  const canSendReply = !sending && !uploadingFile && (replyText.trim().length > 0 || attachments.length > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 pb-[80px] min-[1400px]:pb-[100px] px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto px-4 md:px-6 space-y-6">

        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#0D6D5F] transition font-sf-pro"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Support Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 font-inter">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D6D5F] animate-pulse" />
            <span className="text-xs font-semibold text-[#0D6D5F]">
              {isConnected ? "Real-time Support Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Ticket Header Details */}
          <div className="lg:col-span-1 bg-white p-6 md:p-6 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-4 self-start lg:sticky lg:top-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#64748b]">
                  {ticket.ticketNumber || `#TK-${ticketId.substring(0, 6).toUpperCase()}`}
                </span>
                {formatStatusPill(ticket.status)}
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#475569]">
                  {ticket.category || "General Support"}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-[#0f172a] font-sf-pro">
                {ticket.subject}
              </h1>
            </div>

            <Button
              onClick={fetchTicketDetails}
              variant="soft"
              size="sm"
              radius="fiverr"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="px-3.5 py-2 text-xs font-semibold self-start md:self-auto font-sf-pro"
            >
              Refresh
            </Button>
          </div>

          {/* Linked Order Banner */}
          {ticket.order && (
            <div className="flex items-center gap-3 p-4 rounded-[6px] bg-[#0D6D5F]/5 border border-[#0D6D5F]/20 text-xs font-inter">
              <ShoppingBag className="w-5 h-5 text-[#0D6D5F] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[#0f172a] block truncate">
                  Linked Order: {ticket.order.title || ticket.order.code}
                </span>
                <span className="text-[#64748b] text-[11px]">
                  Price: {ticket.order.price}
                </span>
              </div>
            </div>
          )}

          {/* Participants Strip */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-[#f1f5f9]">
            <div className="flex items-center gap-2 text-[#64748b] font-medium">
              <span>Participants:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {participants.map((p: any, idx: number) => {
                  const isUser = p.id === currentUserId;
                  const displayName = p.role === "admin" ? "Support Agent" : p.name || "Member";
                  return (
                    <div
                      key={p.id || idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-semibold text-[#0f172a]"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#0D6D5F]" />
                      <span>{displayName} {isUser && "(You)"}</span>
                      {getRoleBadge(p.role)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Stream */}
          <div className="lg:col-span-2 bg-white rounded-[6px] border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col min-h-[500px] max-h-[80vh]">

          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0D6D5F]" />
              <span className="text-xs font-semibold text-[#0f172a]">
                Shared Support Conversation
              </span>
            </div>
            <span className="text-xs text-[#64748b]">
              {messages.length} Message{messages.length === 1 ? "" : "s"}
            </span>
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

          {/* Reply Form */}
          <div className="p-4 md:p-6 border-t border-[#e2e8f0] bg-white space-y-3">

            {/* Attachment preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#0D6D5F]/10 border border-[#0D6D5F]/20 text-[#0D6D5F] text-xs font-semibold font-inter"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{att.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:text-rose-600 p-0 w-4 h-4 h-auto min-h-0 border-none shadow-none hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </span>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSendReply}
              className="bg-[#f8fafc] border border-[#e2e8f0] focus-within:border-[#0D6D5F] focus-within:ring-2 focus-within:ring-[#0D6D5F]/10 rounded-[6px] p-3 sm:p-4 transition-all space-y-3"
            >
              {/* Textarea */}
              <textarea
                rows={3}
                placeholder="Type your message reply..."
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  startTyping();
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (canSendReply) {
                      handleSendReply(e);
                    }
                  }
                }}
                onBlur={stopTyping}
                className="w-full bg-transparent border-0 text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-0 resize-none font-inter leading-relaxed"
              />

              {/* Actions Bottom Bar */}
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#e2e8f0]">
                {/* Left: Upload file attachment */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    radius="fiverr"
                    disabled={uploadingFile}
                    isLoading={uploadingFile}
                    loadingText="Uploading..."
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-3.5 h-3.5 text-[#0D6D5F]" />}
                    className="bg-white border-[#e2e8f0] hover:border-[#0D6D5F]/40 text-[#475569] hover:text-[#0D6D5F] text-xs font-semibold font-sf-pro shadow-2xs"
                  >
                    Upload File
                  </Button>

                  <span className="text-[11px] text-[#94a3b8] hidden md:inline">
                    Press Ctrl + Enter to send
                  </span>
                </div>

                {/* Right: Send Button */}
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  radius="xl"
                  disabled={!canSendReply}
                  isLoading={sending}
                  loadingText="Sending..."
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 text-xs font-semibold shadow-xs font-sf-pro shrink-0"
                >
                  Send Reply
                </Button>
              </div>
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
