"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { supportService, SupportTicketItem } from "@/utils/supportService";
import { useSupportSocket, SocketSupportMessage } from "@/hooks/useSupportSocket";
import { useUserStore } from "@/store/userStore";

function AttachmentDisplayItem({ att, ticketId }: { att: any; ticketId: string }) {
  const [resolvedUrl, setResolvedUrl] = useState<string>(att.url || att.secure_url || "");
  const [loadingUrl, setLoadingUrl] = useState<boolean>(!att.url || att.url.startsWith("blob:") || Boolean(att.public_id));

  useEffect(() => {
    let isMounted = true;
    async function resolveSignedUrl() {
      if (att.public_id) {
        const signed = await supportService.getSignedAssetUrl(att.public_id, ticketId, "creator");
        if (isMounted && signed) {
          setResolvedUrl(signed);
          setLoadingUrl(false);
          return;
        }
      }
      if (isMounted) {
        setLoadingUrl(false);
      }
    }
    resolveSignedUrl();
    return () => {
      isMounted = false;
    };
  }, [att.public_id, att.url, ticketId]);

  const name = att.name || "Attachment";
  const url = resolvedUrl || att.url || att.secure_url || "#";
  const isImage = Boolean(
    att.type?.startsWith("image") ||
    /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(name) ||
    /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(url)
  );

  if (isImage && url && !url.startsWith("blob:")) {
    return (
      <div className="mt-2 space-y-1">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block group overflow-hidden rounded-xl border border-black/10 dark:border-white/10 max-w-sm bg-black/5 hover:opacity-95 transition"
        >
          {loadingUrl ? (
            <div className="p-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1dbf73]" />
              <span>Loading image...</span>
            </div>
          ) : (
            <img
              src={url}
              alt={name}
              className="max-h-60 w-auto object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
        </a>
        <span className="text-[10px] opacity-80 font-medium block truncate max-w-sm">
          📷 {name}
        </span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-semibold underline truncate max-w-xs transition"
    >
      <FileText className="w-4 h-4 flex-shrink-0 text-[#1dbf73]" />
      <span className="truncate">{name}</span>
    </a>
  );
}

export default function TicketDetailsPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const { user } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; public_id?: string; type?: string }[]>([]);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

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
      if (prev.some((m) => m.id === newMsg.id || (m.message === newMsg.message && m.createdAt === newMsg.createdAt))) {
        return prev;
      }
      return [...prev, newMsg];
    });
    setTimeout(scrollToBottom, 100);
  }, []);

  const { isConnected, typingUser, sendSupportMessage, startTyping, stopTyping } = useSupportSocket({
    ticketId,
    thread: "creator",
    userDisplayName: user?.username || user?.name || user?.email || "User",
    onMessageReceived: handleMessageReceived,
  });

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getTicketById(ticketId);
      const ticketObj = (data as any)?.ticket || (data as any)?.data?.ticket || data;
      setTicket(ticketObj);

      const rawMessages =
        ticketObj?.threads?.creator ||
        ticketObj?.messages ||
        (data as any)?.threads?.creator ||
        (data as any)?.messages ||
        [];

      setMessages(rawMessages);
    } catch (err: any) {
      console.error("Failed to load ticket details:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load support ticket details.");
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 150);
    }
  }, [ticketId]);

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
      const uploaded = await supportService.uploadFileToCloudinary(file, "support_chat_attachments");
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
    if (!replyText.trim() || sending) return;

    const messageContent = replyText.trim();
    const currentAttachments = [...attachments];

    setReplyText("");
    setAttachments([]);
    setSending(true);

    try {
      if (isConnected) {
        sendSupportMessage(messageContent, currentAttachments);
        const localMsg = {
          id: `msg-${Date.now()}`,
          ticketId,
          thread: "creator",
          sender: user?.username || user?.name || user?.email || "You",
          senderName: user?.username || user?.name || user?.email || "You",
          role: "creator",
          message: messageContent,
          attachments: currentAttachments,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => {
          if (prev.some((m) => m.message === messageContent && m.role === "creator" && Math.abs(new Date(m.createdAt).getTime() - Date.now()) < 2000)) {
            return prev;
          }
          return [...prev, localMsg];
        });
      } else {
        await supportService.replyTicket(ticketId, {
          message: messageContent,
          thread: "creator",
          attachments: currentAttachments,
        });
        await fetchTicketDetails();
      }
    } catch (err: any) {
      console.error("Failed to send reply:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 mx-auto animate-spin text-[#1dbf73]" />
          <p className="text-xs font-semibold text-[#64748b]">Loading support conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center space-y-4 shadow-xs">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-600" />
          <h2 className="text-lg font-bold text-[#0f172a]">Ticket Not Found</h2>
          <p className="text-xs text-[#64748b]">{error || "The requested support ticket could not be found."}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/support"
              className="px-5 py-2.5 rounded-lg bg-[#f1f5f9] text-[#334155] font-semibold text-xs hover:bg-[#e2e8f0] transition"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={fetchTicketDetails}
              className="px-5 py-2.5 rounded-lg bg-[#1dbf73] text-white font-semibold text-xs hover:bg-[#19a463] transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#1dbf73] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Support Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1dbf73] animate-pulse" />
            <span className="text-xs font-semibold text-[#1dbf73]">
              {isConnected ? "Real-time Support Connected" : "Connected"}
            </span>
          </div>
        </div>

        {/* Ticket Header Details */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
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
              <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">
                {ticket.subject}
              </h1>
            </div>

            <button
              onClick={fetchTicketDetails}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] text-xs font-semibold transition cursor-pointer self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Linked Order Banner */}
          {ticket.order && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1dbf73]/5 border border-[#1dbf73]/20 text-xs">
              <ShoppingBag className="w-5 h-5 text-[#1dbf73] flex-shrink-0" />
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
        </div>

        {/* Conversation Stream */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col min-h-[500px]">

          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1dbf73]" />
              <span className="text-xs font-semibold text-[#0f172a]">
                Official Support Communication Stream
              </span>
            </div>
            <span className="text-xs text-[#64748b]">
              {messages.length} Message(s)
            </span>
          </div>

          {/* Message List */}
          <div ref={messageContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px] bg-[#f8fafc]/50 scroll-smooth">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <User className="w-8 h-8 mx-auto text-[#cbd5e1]" />
                <p className="text-xs text-[#64748b]">No messages yet. Send a reply below.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isAdmin = msg.role === "admin" || msg.role === "system";
                const senderName = msg.senderName || msg.sender || (isAdmin ? "Support Agent" : "You");
                const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start gap-3 ${isAdmin ? "justify-start" : "justify-end"}`}
                  >
                    {isAdmin && (
                      <div className="w-8 h-8 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        S
                      </div>
                    )}

                    <div className={`space-y-1 max-w-lg ${isAdmin ? "items-start" : "items-end text-right"}`}>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#64748b] px-1">
                        <span>{senderName}</span>
                        {timeStr && <span>• {timeStr}</span>}
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${isAdmin
                            ? "bg-white text-[#0f172a] rounded-tl-none border border-[#e2e8f0] shadow-2xs"
                            : "bg-[#1dbf73] text-white rounded-tr-none shadow-2xs"
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>

                        {/* Attachments rendering with Signed URL resolution & Image Previews */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-black/10 text-[11px] space-y-2">
                            <span className="font-semibold uppercase tracking-wider block opacity-80 text-[10px]">
                              Attachments ({msg.attachments.length}):
                            </span>
                            {msg.attachments.map((att: any, aIdx: number) => (
                              <AttachmentDisplayItem key={aIdx} att={att} ticketId={ticketId} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAdmin && (
                      <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        {user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {typingUser && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1dbf73] animate-pulse">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1dbf73]/10 border border-[#1dbf73]/20 text-[#1dbf73] text-xs font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <form onSubmit={handleSendReply} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  placeholder="Type your message reply to support..."
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    startTyping();
                  }}
                  onBlur={stopTyping}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs text-[#0f172a] focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 outline-none resize-none transition"
                />

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1dbf73]/10 text-[#1dbf73] border border-[#1dbf73]/30 text-xs font-bold hover:bg-[#1dbf73]/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {uploadingFile ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || uploadingFile || !replyText.trim()}
                className="px-6 py-3 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer h-[46px]"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
