"use client";

import toast from 'react-hot-toast';
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Flag, ArrowRight, Download, Eye } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BsThreeDotsVertical } from "react-icons/bs";

import {
  RiSearchLine,
  RiCheckboxCircleFill,
  RiStarFill,
  RiPhoneLine,
  RiMore2Fill,
  RiCheckDoubleLine,
  RiAddLine,
  RiEmotionLine,
  RiTimeLine,
  RiRefreshLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine,
  RiMenuLine,
  RiInformationLine,
  RiCloseLine,
  RiVideoChatLine,
  RiVidiconLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiArrowDownSLine
} from "react-icons/ri";

import axios from 'axios';
import { axiosFetch, socket, getAvatarUrl, parseRevisionNumber, getOnlineStatus } from "@/utils";
import supportService from "@/utils/supportService";
import { getOtherUser, isConversationUnread, isTargetConversation, renderMessageTextWithLinks } from '@/utils/chatHelpers';
import { useUserStore } from "@/store/userStore";
import { Loader, ChatSkeleton, Skeleton, AiGradientButton, Button } from "@/components";
import { MessageModerationBadge } from "@/features/chat";
import { formatFileSize } from "@/lib";
import moment from 'moment';
// Helper to reliably extract file extension from URL, item metadata, or MIME type
const extractFileExtension = (url: string, itemObj?: any, msgObj?: any): string => {
  if (!url && !itemObj && !msgObj) return '';

  // 1. Check if format or extension is explicitly specified in itemObj or msgObj
  const explicitFormat =
    itemObj?.format ||
    itemObj?.ext ||
    itemObj?.extension ||
    msgObj?.format ||
    msgObj?.fileFormat ||
    msgObj?.attachment?.format;
  if (explicitFormat && typeof explicitFormat === 'string') {
    return explicitFormat.replace(/^\./, '').toLowerCase();
  }

  const rawUrl = String(url || itemObj?.url || itemObj?.secure_url || itemObj?.file || '');

  // 2. Check query params or Cloudinary URL transformations for format (e.g. format=pdf, format=png, f_pdf, f_png)
  const formatQueryMatch = rawUrl.match(/[?&]format=([a-zA-Z0-9]+)/i);
  if (formatQueryMatch) {
    return formatQueryMatch[1].toLowerCase();
  }

  const cldFormatMatch = rawUrl.match(/\/f_([a-zA-Z0-9]+)[\/,]/i);
  if (cldFormatMatch && cldFormatMatch[1].toLowerCase() !== 'auto') {
    return cldFormatMatch[1].toLowerCase();
  }

  // 3. Check if PDF is indicated anywhere in the URL (path, filename, or query)
  if (
    /\.pdf($|[?#])/i.test(rawUrl) ||
    /format=pdf/i.test(rawUrl) ||
    rawUrl.toLowerCase().includes('.pdf') ||
    rawUrl.toLowerCase().includes('format=pdf')
  ) {
    return 'pdf';
  }

  // 4. Check url path for standard file extension (before query string)
  const cleanUrl = rawUrl.split('?')[0].split('#')[0];
  const urlExtMatch = cleanUrl.match(/\.([a-zA-Z0-9]{2,6})$/);
  if (urlExtMatch) {
    return urlExtMatch[1].toLowerCase();
  }

  // 5. Check MIME types
  const mime = (
    itemObj?.type ||
    itemObj?.mimeType ||
    msgObj?.fileType ||
    msgObj?.attachment?.type ||
    ''
  ).toLowerCase();
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('image/png')) return 'png';
  if (mime.includes('image/jpeg') || mime.includes('image/jpg')) return 'jpg';
  if (mime.includes('image/webp')) return 'webp';
  if (mime.includes('image/gif')) return 'gif';
  if (mime.includes('image/svg')) return 'svg';
  if (mime.includes('application/zip') || mime.includes('zip')) return 'zip';
  if (mime.includes('text/csv') || mime.includes('csv')) return 'csv';
  if (mime.includes('text/plain')) return 'txt';
  if (mime.includes('word') || mime.includes('docx')) return 'docx';
  if (mime.includes('sheet') || mime.includes('xlsx')) return 'xlsx';

  // 6. Check common video extensions
  if (/\.(mp4|webm|ogg|mov|mkv|avi|m4v)($|[?#])/i.test(rawUrl) || rawUrl.includes('/video/')) {
    return 'mp4';
  }

  // 7. Check if Cloudinary raw file
  if (cleanUrl.includes('cloudinary.com') && cleanUrl.includes('/raw/')) {
    return '';
  }

  // 8. If Cloudinary image upload and not pdf/doc/video, fallback to image format (jpg/png)
  if (
    cleanUrl.includes('cloudinary.com') &&
    cleanUrl.includes('/image/') &&
    !rawUrl.toLowerCase().includes('pdf') &&
    !rawUrl.toLowerCase().includes('format=')
  ) {
    return 'png';
  }

  return '';
};

// Formats file name to ensure it ALWAYS has its proper extension
const formatFileNameWithExtension = (name: string, url: string, itemObj?: any, msgObj?: any): string => {
  let trimmed = (name || '').trim();

  // Try extracting filename from URL query params (e.g. ?filename=my_doc.pdf or ?name=photo.jpg)
  if (!trimmed || trimmed === 'Attachment' || trimmed === 'download' || trimmed === 'download.png') {
    const rawUrl = String(url || itemObj?.url || '');
    const qNameMatch = rawUrl.match(/[?&](?:filename|original_filename|name|file|title)=([^&#]+)/i);
    if (qNameMatch) {
      try {
        const decoded = decodeURIComponent(qNameMatch[1]).trim();
        if (decoded) trimmed = decoded;
      } catch {
        // ignore decoding error
      }
    }
  }

  if (!trimmed) {
    trimmed = 'Attachment';
  }

  const ext = extractFileExtension(url, itemObj, msgObj);

  // If the name already ends with the correct extension (case insensitive)
  if (ext && new RegExp(`\\.${ext}$`, 'i').test(trimmed)) {
    return trimmed;
  }

  // If name has a different extension (e.g. name was "download.png", but format is "pdf"!)
  if (ext && /\.[a-zA-Z0-9]{2,6}$/.test(trimmed)) {
    const currentExtMatch = trimmed.match(/\.([a-zA-Z0-9]{2,6})$/);
    const currentExt = currentExtMatch ? currentExtMatch[1].toLowerCase() : '';
    if (currentExt !== ext) {
      return trimmed.replace(/\.[a-zA-Z0-9]{2,6}$/, `.${ext}`);
    }
    return trimmed;
  }

  if (/\.[a-zA-Z0-9]{2,6}$/.test(trimmed)) {
    return trimmed;
  }

  return ext ? `${trimmed}.${ext}` : trimmed;
};

// Subcomponent to reliably render attachments without broken images and open in a new tab
const ChatMessageAttachmentItem = ({
  msg,
  onImagePreview,
}: {
  msg: any;
  onImagePreview?: (url: string) => void;
}) => {
  const rawUrl = msg.file || (Array.isArray(msg.attachments) && msg.attachments[0]) || null;
  const [resolvedUrl, setResolvedUrl] = useState<string>(rawUrl || '');
  const [imgError, setImgError] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const isAuthenticated = Boolean(
    rawUrl &&
    typeof rawUrl === 'string' &&
    rawUrl.includes('cloudinary.com') &&
    rawUrl.includes('/authenticated/')
  );

  // Background auto-resolve for private/authenticated Cloudinary attachments
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && rawUrl) {
      setIsResolving(true);
      const publicId = supportService.extractPublicId(rawUrl);
      const withoutExt = publicId.replace(/\.[^/.]+$/, '');

      (async () => {
        try {
          let signed = await supportService.getSignedAssetUrl(publicId);
          if (!signed && withoutExt !== publicId) {
            signed = await supportService.getSignedAssetUrl(withoutExt);
          }
          if (isMounted && signed) {
            setResolvedUrl(signed);
          }
        } catch (err) {
          console.warn('Failed to auto-resolve signed asset URL:', err);
        } finally {
          if (isMounted) setIsResolving(false);
        }
      })();
    } else {
      setResolvedUrl(rawUrl || '');
    }
    return () => {
      isMounted = false;
    };
  }, [rawUrl, isAuthenticated]);

  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const currentUrl = resolvedUrl || rawUrl;
  const hasMsgText = Boolean(msg.description || msg.desc || msg.text || msg.message);

  // Determine file type
  const isPdf =
    /\.pdf($|[?#])/i.test(rawUrl) ||
    rawUrl.toLowerCase().includes('.pdf') ||
    rawUrl.toLowerCase().includes('format=pdf') ||
    msg.fileType?.includes('pdf') ||
    msg.attachment?.type?.includes('pdf');

  const isVideo =
    /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)($|[?#])/i.test(rawUrl) ||
    rawUrl.includes('/video/upload/') ||
    (rawUrl.includes('cloudinary.com') && rawUrl.includes('/video/')) ||
    msg.fileType?.includes('video');

  const isDoc =
    isPdf ||
    /\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)($|[?#])/i.test(rawUrl) ||
    msg.fileType?.includes('document') ||
    /[?&]format=(docx?|xlsx?|pptx?|zip|rar|tar|gz|txt|csv)/i.test(rawUrl);

  const isImage =
    !isDoc &&
    !isVideo &&
    !imgError &&
    (/\.(png|jpe?g|gif|webp|svg|bmp|avif)($|[?#])/i.test(rawUrl) ||
      /[?&]format=(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(rawUrl) ||
      (rawUrl.includes('cloudinary.com') && rawUrl.includes('/image/') && !isPdf && !isDoc) ||
      msg.fileType?.includes('image'));

  const rawFileName = rawUrl.split('/').pop()?.split('?')[0] || 'Attachment';
  const fileName = formatFileNameWithExtension(rawFileName, currentUrl, null, msg);

  // Always open in a new tab when clicked (for documents and files)
  const handleOpenInNewTab = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If authenticated Cloudinary asset and signed URL hasn't arrived or doesn't have signature query params
    if (isAuthenticated && (!resolvedUrl || resolvedUrl === rawUrl || !resolvedUrl.includes('?'))) {
      const toastId = toast.loading('Opening secure attachment in new tab...');
      const publicId = supportService.extractPublicId(rawUrl);
      const withoutExt = publicId.replace(/\.[^/.]+$/, '');
      try {
        let signed = await supportService.getSignedAssetUrl(publicId);
        if (!signed && withoutExt !== publicId) {
          signed = await supportService.getSignedAssetUrl(withoutExt);
        }
        if (signed) {
          toast.dismiss(toastId);
          window.open(signed, '_blank', 'noopener,noreferrer');
          return;
        }
      } catch (err) {
        console.warn('Could not retrieve signed URL:', err);
      }
      toast.dismiss(toastId);
    }

    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  // Image attachment view - Opens directly in lightbox preview modal without opening new tab
  if (isImage && !imgError) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onImagePreview) {
            onImagePreview(currentUrl);
          } else {
            handleOpenInNewTab(e);
          }
        }}
        className={`mt-1 overflow-hidden rounded-[6px] border border-slate-200/90 shadow-sm max-w-[280px] bg-slate-50 cursor-pointer group hover:border-[#327C73]/50 transition-all ${!hasMsgText ? 'mb-5' : 'mb-1.5'}`}
        title="Click to preview image"
      >
        <img
          src={currentUrl}
          alt={fileName}
          onError={() => setImgError(true)}
          className="w-full max-h-[220px] object-cover group-hover:scale-[1.02] transition-transform duration-200"
        />
      </div>
    );
  }

  // Video attachment view
  if (isVideo) {
    return (
      <div className={`mt-1 overflow-hidden rounded-[6px] border border-slate-200 shadow-sm max-w-[340px] bg-black ${!hasMsgText ? 'mb-5' : 'mb-1.5'}`}>
        <video
          src={currentUrl}
          controls
          preload="metadata"
          className="w-full max-h-[280px] rounded-[6px] object-contain"
        />
      </div>
    );
  }

  // Document, PDF, or Fallback view (Clickable -> Opens in new tab)
  return (
    <div
      onClick={handleOpenInNewTab}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 mt-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-[6px] transition-all border border-slate-200/90 text-xs font-semibold cursor-pointer select-none max-w-[280px] group shadow-2xs ${!hasMsgText ? 'mb-5' : 'mb-1.5'}`}
      title="Click to open file in a new tab"
    >
      <div className="w-8 h-8 rounded-[6px] bg-white flex items-center justify-center text-base shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
        {isPdf ? '📕' : '📄'}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="truncate text-slate-900 text-[12.5px] font-medium leading-tight group-hover:text-[#327C73] transition-colors">
          {fileName}
        </span>
        <span className="text-[10.5px] text-slate-400 font-normal mt-0.5 flex items-center gap-1">
          <span>Click to open in new tab</span>

        </span>
      </div>
      <span className="text-slate-400 group-hover:text-slate-700 text-sm shrink-0">
        {isResolving ? '⏳' : '↗'}
      </span>
    </div>
  );
};

const ChatView = () => {
  const user = useUserStore((state: any) => state.user);
  const params = useParams();
  const conversationID = (params?.id || params?.conversationID) as string;
  const isValidId = Boolean(conversationID && conversationID !== 'undefined' && conversationID !== 'null');
  const queryClient = useQueryClient();
  const navigate = useRouter();

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");
  const [offerRevisions, setOfferRevisions] = useState<number | string>(0);
  const [messageText, setMessageText] = useState("");
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [convSearchQuery, setConvSearchQuery] = useState("");
  const [convFilterTab, setConvFilterTab] = useState<'all' | 'read' | 'unread'>('all');
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [isMsgSearchActive, setIsMsgSearchActive] = useState(false);
  const [isLeftSideOpen, setIsLeftSideOpen] = useState(false);
  const [isRightSideOpen, setIsRightSideOpen] = useState(false);
  const [contactSidebarTab, setContactSidebarTab] = useState<'profile' | 'media'>('profile');
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);
  const isSendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const lastConversationIdRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useRef(user);
  const convIdRef = useRef(conversationID);
  const activeConvRef = useRef<any>(null);
  const recipientTypingTimerRef = useRef<any>(null);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { convIdRef.current = conversationID; }, [conversationID]);

  // Ensure user session is hydrated immediately even when Navbar is not rendered
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          useUserStore.getState().setUser(JSON.parse(stored));
        } catch (e) {
          console.warn("Could not parse user from localStorage:", e);
        }
      }
      axiosFetch.get('/auth/me').then(({ data }) => {
        if (data?.user) {
          useUserStore.getState().setUser(data.user);
        }
      }).catch(() => { });
    }
  }, [user]);

  const [attachment, setAttachment] = useState<any>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [viewingOfferDetails, setViewingOfferDetails] = useState<any>(null);
  const [expandedProposalIds, setExpandedProposalIds] = useState<Record<string, boolean>>({});

  const toggleProposalExpand = (msgId: string) => {
    setExpandedProposalIds(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleFileAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    try {
      const uploadedData = await supportService.uploadCloudinaryFile(file);
      setAttachment(uploadedData);
      toast.success("File attached successfully");
    } catch (err: any) {
      toast.error(err?.message || "Attachment upload failed");
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = async () => {
    if (!attachment) return;
    const targetPublicId = attachment.public_id;
    setAttachment(null);
    if (targetPublicId) {
      try {
        await supportService.deleteCloudinaryFile(targetPublicId);
        toast.success("Attachment deleted from server", { id: "delete-file" });
      } catch (err) {
        console.warn("Failed to delete attachment:", err);
      }
    }
  };

  // Scroll management: direct container scroll with fallback to element scrollIntoView
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (behavior === 'auto') {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  const handleMessagesScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // User is considered near bottom if within 150px
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    isNearBottomRef.current = distanceFromBottom <= 150;
  }, []);

  // Fetch all conversations
  const { isLoading: convsLoading, data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || [])).catch(() => [])
  });

  // Auto-navigate to first conversation if none selected or invalid ID
  useEffect(() => {
    if (!isValidId && conversations.length > 0) {
      const firstId = conversations[0].uuid || conversations[0].conversationID || conversations[0]._id;
      if (firstId && firstId !== 'undefined') {
        navigate.replace(`/message/${firstId}`);
      }
    }
  }, [isValidId, conversations, navigate]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (isValidId) {
      // 1. Update local cache immediately to clear unread dots instantly
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, conversationID)) {
            return {
              ...c,
              readBySeller: true,
              readByBuyer: true
            };
          }
          return c;
        });
      });

      // 2. Patch backend silently without re-sorting the list
      axiosFetch.patch(`/conversations/${conversationID}/mark-read`).catch(console.error);
    }
  }, [isValidId, conversationID, queryClient]);

  // Socket: global connection and online users
  useEffect(() => {
    if (!user?._id) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('user_connected', user._id);

    const handleOnlineUsers = (users: any) => setOnlineUsers(users);

    // Global listener for new messages to update the sidebar/header even if in a different chat
    const handleGlobalReceiveMessage = (newMsg: any) => {
      const incomingCid = String(newMsg?.conversationUUID || newMsg?.conversationID || newMsg?.uuid || newMsg?.id || '').trim();
      if (!incomingCid) return;

      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, incomingCid)) {
            const isCurrentlyViewingThisChat = window.location.pathname.includes(`/message/${incomingCid}`);
            return {
              ...c,
              lastMessage: newMsg.description || newMsg.desc || newMsg.text || newMsg.message || c.lastMessage,
              updatedAt: new Date().toISOString(),
              readBySeller: user?.isSeller ? isCurrentlyViewingThisChat : c.readBySeller,
              readByBuyer: !user?.isSeller ? isCurrentlyViewingThisChat : c.readByBuyer
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('receive_message', handleGlobalReceiveMessage);


    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('receive_message', handleGlobalReceiveMessage);

    };
  }, [user?._id, queryClient]);

  // Fetch messages history for active conversation
  const { isLoading: msgsLoading, isError: msgsError, error: msgsQueryError, data: messages = [] } = useQuery({
    queryKey: ['messages', conversationID],
    queryFn: async () => {
      const extractMessages = (data: any): any[] | null => {
        if (!data) return null;
        if (Array.isArray(data) && data.length > 0) return data;
        if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
        if (Array.isArray(data?.messages) && data.messages.length > 0) return data.messages;
        if (Array.isArray(data?.data?.messages) && data.data.messages.length > 0) return data.data.messages;
        if (Array.isArray(data?.result) && data.result.length > 0) return data.result;
        return null;
      };

      const targetId = conversationID || activeConvRef.current?.uuid || activeConvRef.current?._id;
      if (!targetId) return [];

      try {
        const { data } = await axiosFetch.get(`/conversations/${targetId}/messages`);
        return extractMessages(data) || [];
      } catch (err: any) {
        // Fallback to alternative ObjectId if available on the conversation model
        const altId = activeConvRef.current?._id;
        if (altId && String(altId) !== String(targetId)) {
          try {
            const { data } = await axiosFetch.get(`/conversations/${altId}/messages`);
            return extractMessages(data) || [];
          } catch {
            // End of attempts
          }
        }
        return [];
      }
    },
    enabled: isValidId,
    retry: false,
    staleTime: 5000,
    // Periodic polling disabled: real-time messages are delivered via Socket.io
    // refetchInterval: 5000,
    // refetchIntervalInBackground: false
  });

  // Manage room subscription & realtime events for active conversation
  useEffect(() => {
    if (!isValidId) return;

    const joinRoom = () => {
      const convDoc = activeConvRef.current;
      const idsToJoin = new Set(
        [
          conversationID,
          convDoc?._id,
          convDoc?.uuid,
          convDoc?.conversationID,
        ]
          .filter(Boolean)
          .map((id) => String(id).trim())
      );

      idsToJoin.forEach((id) => {
        socket.emit('join_conversation', id);
        socket.emit('join_room', id);
        socket.emit('join', id);
      });
      if (user?._id) socket.emit('user_connected', user._id);
    };

    socket.connect();
    joinRoom();

    const handleConnect = () => {
      joinRoom();
    };
    socket.on('connect', handleConnect);

    setIsRecipientTyping(false);

    const isEventForCurrentChat = (data: any, isTypingEvent = true) => {
      if (!data) return false;

      const currentUser = userRef.current;
      if (isTypingEvent && data.username && currentUser?.username && data.username.toLowerCase() === currentUser.username.toLowerCase()) {
        return false; // Ignore typing events from self
      }

      const convFieldId = typeof data?.conversation === 'object'
        ? (data.conversation?._id || data.conversation?.id || data.conversation?.uuid)
        : data?.conversation;

      const incomingId = String(
        data?.conversationUUID ||
        data?.conversationID ||
        data?.conversationId ||
        data?.uuid ||
        data?.id ||
        convFieldId ||
        ''
      ).trim();

      if (!incomingId || incomingId === 'undefined') return false;

      const currentParamId = String(convIdRef.current || '').trim();
      if (currentParamId && incomingId === currentParamId) return true;

      const convDoc = activeConvRef.current;
      if (convDoc) {
        if (convDoc.uuid && incomingId === String(convDoc.uuid).trim()) return true;
        if (convDoc.conversationID && incomingId === String(convDoc.conversationID).trim()) return true;
        if (convDoc._id && incomingId === String(convDoc._id).trim()) return true;
        if (convDoc.id && incomingId === String(convDoc.id).trim()) return true;

        const sId = String(convDoc.sellerID?._id || convDoc.sellerID?.id || convDoc.sellerID || '');
        const bId = String(convDoc.buyerID?._id || convDoc.buyerID?.id || convDoc.buyerID || '');
        if (sId && bId && (`${sId}${bId}` === incomingId || `${bId}${sId}` === incomingId)) return true;
        if (sId && incomingId === sId) return true;
        if (bId && incomingId === bId) return true;
      }
      return false;
    };

    const handleReceiveMessage = (newMsg: any) => {
      const isForCurrent = isEventForCurrentChat(newMsg, false);

      // 1. If message belongs to current open chat, append to messages list
      if (isForCurrent) {
        queryClient.setQueryData(['messages', conversationID], (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          const newMsgId = newMsg?._id || newMsg?.id;
          const incomingText = (newMsg.description || newMsg.desc || newMsg.text || newMsg.message || '').trim();
          const incomingFile = newMsg.file || (Array.isArray(newMsg.attachments) && newMsg.attachments[0]) || '';

          // 1. If already in cache by ID, update existing message in place (e.g., status/withdrawal update)
          if (newMsgId && arr.some((m: any) => String(m._id || m.id) === String(newMsgId))) {
            return arr.map((m: any) => String(m._id || m.id) === String(newMsgId) ? { ...m, ...newMsg } : m);
          }

          // 2. If a non-temp message with identical text and file already exists, skip duplicate socket echo
          const alreadyHasReal = arr.some((m: any) => {
            const mId = String(m._id || m.id || '');
            if (!mId || mId.startsWith('temp-')) return false;
            const mText = (m.description || m.desc || m.text || m.message || '').trim();
            const mFile = m.file || (Array.isArray(m.attachments) && m.attachments[0]) || '';
            return mText === incomingText && mFile === incomingFile;
          });
          if (alreadyHasReal) return arr;

          // 3. Replace matching temp message or remove matching temp- messages
          const withoutTemp = arr.filter((m: any) => {
            const mId = String(m._id || m.id || '');
            if (mId.startsWith('temp-')) {
              const tempText = (m.description || m.desc || m.text || m.message || '').trim();
              return tempText !== incomingText;
            }
            return true;
          });
          return [...withoutTemp, newMsg];
        });
      }

      // 2. Instantly update conversation sidebar and header unread badge
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        const incomingCid = String(newMsg?.conversationUUID || newMsg?.conversationID || newMsg?.uuid || newMsg?.id || '').trim();
        if (!incomingCid) return oldConvs;
        const incomingText = newMsg.description || newMsg.desc || newMsg.text || newMsg.message || '';
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, incomingCid)) {
            return {
              ...c,
              lastMessage: incomingText || c.lastMessage,
              updatedAt: new Date().toISOString(),
              readBySeller: user?.isSeller ? isForCurrent : c.readBySeller,
              readByBuyer: !user?.isSeller ? isForCurrent : c.readByBuyer
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    const handleUserTyping = (data: any) => {
      if (isEventForCurrentChat(data, true)) {
        setIsRecipientTyping(true);
        if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
        recipientTypingTimerRef.current = setTimeout(() => setIsRecipientTyping(false), 3000);
      }
    };

    const handleUserStoppedTyping = (data: any) => {
      if (isEventForCurrentChat(data, true)) {
        setIsRecipientTyping(false);
        if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing_start', handleUserTyping);
    socket.on('user_typing', handleUserTyping);
    socket.on('typing_stop', handleUserStoppedTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing_start', handleUserTyping);
      socket.off('user_typing', handleUserTyping);
      socket.off('typing_stop', handleUserStoppedTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
    };
  }, [isValidId, conversationID, queryClient]);

  // Fetch all orders to show contact's orders in sidebar
  const { data: allOrders = [] } = useQuery({
    queryKey: ['orders-all'],
    queryFn: () => axiosFetch.get('/orders').then(({ data }) => Array.isArray(data) ? data : (data?.orders || data?.data || [])).catch(() => [])
  });

  // Fetch active packages created by the current contact user (to populate package selector dropdown in Custom Offer modal)
  const { data: sellerPackages = [] } = useQuery({
    queryKey: ['seller-packages', user?._id || user?.id || user?.username],
    queryFn: () => axiosFetch.get(`/gigs/seller/${user?.username || user?.id}`).then(({ data }) => Array.isArray(data) ? data : (data?.gigs || data?.packages || data?.data || [])).catch(() => []),
    enabled: !!user?.isSeller
  });

  // Fetch active briefs created by the recipient user (if current user is seller)
  const { data: chatBriefs = [] } = useQuery({
    queryKey: ['chat-briefs', conversationID, conversations.length],
    queryFn: async () => {
      const activeConvDoc = conversations.find((c: any) => isTargetConversation(c, conversationID));
      const targetUser = getOtherUser(activeConvDoc, user);
      const targetUserId = targetUser?._id || targetUser?.id;
      if (!targetUserId) return [];
      const res = await axiosFetch.get(`/briefs/user/${targetUserId}`).catch(() => axiosFetch.get(`/briefs?userId=${targetUserId}`)).catch(() => null);
      const data = res?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.briefs)) return data.briefs;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
    enabled: !!user?.isSeller && isValidId
  });

  // Fetch single conversation details if needed
  const { data: activeConvData } = useQuery({
    queryKey: ['conversation-detail', conversationID],
    queryFn: () =>
      axiosFetch
        .get(`/conversations/${conversationID}`)
        .then(({ data }) => data?.conversation || data?.data || data)
        .catch(() => null),
    enabled: isValidId && !conversations.some((c: any) => isTargetConversation(c, conversationID)),
    staleTime: 30000
  });

  const activeConversation =
    activeConvData ||
    conversations.find((c: any) => isTargetConversation(c, conversationID));

  const recipientUser = getOtherUser(activeConversation, user);

  // Extract other user's ID and username from activeConversation if available
  const targetOtherUserId = (() => {
    if (recipientUser?._id || recipientUser?.id) return String(recipientUser._id || recipientUser.id);
    if (!activeConversation) return null;
    const currentUid = String(user?._id || user?.id || '');
    const sId = String(activeConversation.sellerID?._id || activeConversation.sellerID || '');
    const bId = String(activeConversation.buyerID?._id || activeConversation.buyerID || '');
    if (sId && sId !== currentUid) return sId;
    if (bId && bId !== currentUid) return bId;
    return null;
  })();

  const targetOtherUsername = (() => {
    if (recipientUser?.username) return recipientUser.username;
    if (!activeConversation) return null;
    const currentUsername = String(user?.username || '').toLowerCase();
    const sName = activeConversation.seller_username || activeConversation.sellerID?.username;
    const bName = activeConversation.buyer_username || activeConversation.buyerID?.username;
    if (sName && sName.toLowerCase() !== currentUsername) return sName;
    if (bName && bName.toLowerCase() !== currentUsername) return bName;
    return null;
  })();

  // Fallback resolution if conversationID is a 48-char combined ID
  const fallbackRecipientId =
    !targetOtherUserId && conversationID?.length === 48
      ? conversationID.substring(0, 24) === String(user?._id || user?.id)
        ? conversationID.substring(24)
        : conversationID.substring(0, 24)
      : null;

  const resolveUserId = targetOtherUserId || fallbackRecipientId;

  // Fetch complete real user profile from backend
  const { data: fetchedProfileUser, isLoading: isFetchingTargetUser } = useQuery({
    queryKey: ['user-profile', resolveUserId],
    queryFn: () => axiosFetch.get(`/users/${resolveUserId}`).then(({ data }) => data?.user || data?.data || data).catch(() => null),
    enabled: Boolean(resolveUserId && (!recipientUser?.createdAt || !recipientUser?.country))
  });

  const finalRecipientUser =
    (fetchedProfileUser && typeof fetchedProfileUser === 'object' ? { ...recipientUser, ...fetchedProfileUser } : null) ||
    recipientUser ||
    (targetOtherUsername || resolveUserId ? { username: targetOtherUsername || 'User', _id: resolveUserId } : null);

  const socketIsRecipientOnline = Boolean(
    finalRecipientUser &&
    onlineUsers?.some((u: any) => {
      const uId = String(typeof u === 'string' ? u : u?.userId || u?._id || u?.id || '');
      const rId = String(finalRecipientUser?._id || finalRecipientUser?.id || '');
      return Boolean(uId && rId && uId === rId);
    })
  );

  const recipientStatus = getOnlineStatus(
    finalRecipientUser?.lastActiveAt || finalRecipientUser?.updatedAt || finalRecipientUser?.lastSeen,
    socketIsRecipientOnline,
    10
  );
  const isRecipientOnline = recipientStatus.isOnline;
  const recipientLastSeenText = recipientStatus.lastSeenText;

  useEffect(() => {
    activeConvRef.current = activeConversation;
    if (activeConversation && socket) {
      if (!socket.connected) {
        socket.connect();
      }
      const extraIds = [
        activeConversation._id,
        activeConversation.uuid,
        activeConversation.conversationID,
      ]
        .filter(Boolean)
        .map((id) => String(id).trim());

      extraIds.forEach((id) => {
        socket.emit("join_conversation", id);
        socket.emit("join_room", id);
        socket.emit("join", id);
      });
    }
  }, [activeConversation]);



  const contactOrders = allOrders.filter((o: any) => {
    const sId = String(o.sellerID?._id || o.sellerID || "");
    const bId = String(o.buyerID?._id || o.buyerID || "");
    const currentUserId = String(user?._id || user?.id || "");
    const targetUserId = String(finalRecipientUser?._id || finalRecipientUser?.id || recipientUser?._id || "");
    return (
      (sId === currentUserId || bId === currentUserId) &&
      (sId === targetUserId || bId === targetUserId)
    );
  });

  const activeRoomID =
    activeConversation?._id ||
    activeConversation?.conversationID ||
    activeConversation?.uuid ||
    activeConversation?.id ||
    (conversationID !== 'undefined' ? conversationID : null);

  const mutation = useMutation({
    mutationFn: async (msg: any) => {
      const targetId = activeRoomID || conversationID;
      const httpPayload: Record<string, any> = {
        description: msg.description || msg.desc || msg.text || msg.message || "",
      };
      if (msg.file) {
        httpPayload.file = msg.file;
      }
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        httpPayload.attachments = msg.attachments;
      }

      try {
        return await axiosFetch.post(`/conversations/${targetId}/messages`, httpPayload);
      } catch (err) {
        return await axiosFetch.post('/messages', {
          ...httpPayload,
          conversationID: targetId,
        });
      }
    },
    onMutate: async (newMsg: any) => {
      // Optimistically update the conversations list with the new lastMessage and correct read status
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        const incomingCid = String(newMsg?.conversationUUID || newMsg?.conversationID || newMsg?.uuid || newMsg?.id || conversationID || '').trim();
        const incomingText = newMsg.description || newMsg.desc || newMsg.text || newMsg.message || '';
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, incomingCid)) {
            return {
              ...c,
              lastMessage: incomingText,
              updatedAt: new Date().toISOString(),
              readBySeller: user?.isSeller ? true : false,
              readByBuyer: user?.isSeller ? false : true
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    },
    onSuccess: (res: any) => {
      const savedMsg = res?.data?.data || res?.data?.message || res?.data;
      const msgId = savedMsg?._id || savedMsg?.id;
      if (savedMsg && typeof savedMsg === 'object' && msgId) {
        const savedText = (savedMsg.description || savedMsg.desc || savedMsg.text || savedMsg.message || '').trim();
        const updateMsgCache = (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          const filtered = arr.filter((m: any) => {
            const mId = String(m._id || m.id || '');
            if (mId === String(msgId)) return false;
            if (mId.startsWith('temp-')) {
              const tempText = (m.description || m.desc || m.text || m.message || '').trim();
              return tempText !== savedText;
            }
            return true;
          });
          return [...filtered, savedMsg];
        };
        queryClient.setQueryData(['messages', conversationID], updateMsgCache);
        if (activeRoomID && activeRoomID !== conversationID) {
          queryClient.setQueryData(['messages', activeRoomID], updateMsgCache);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
    }
  });

  const stopTypingIndicator = () => {
    if (isTypingRef.current && activeRoomID && activeRoomID !== 'undefined' && user?.username) {
      isTypingRef.current = false;
      socket.emit("typing_stop", {
        conversationID: activeRoomID,
        conversationUUID: activeRoomID,
        username: user.username
      });
    }
  };

  const handleSend = (e?: any) => {
    if (e) e.preventDefault();
    if (isSendingRef.current || mutation.isPending) return;
    if (!messageText.trim() && !attachment?.url) return;

    isSendingRef.current = true;

    // Immediately stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTypingIndicator();

    const currentText = messageText;
    const currentAttachment = attachment;

    setMessageText("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 1. Optimistically append temporary message to local UI (0ms latency)
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      conversationID: activeRoomID || conversationID,
      userID: {
        _id: user?._id || user?.id,
        username: user?.username || 'User',
        image: getAvatarUrl(user?.image, user?.username || 'User')
      },
      description: currentText,
      desc: currentText,
      text: currentText,
      message: currentText,
      file: currentAttachment?.url || null,
      attachments: currentAttachment?.url ? [currentAttachment.url] : [],
      createdAt: new Date().toISOString()
    };

    const appendTempMessage = (oldData: any = []) => {
      const arr = Array.isArray(oldData) ? oldData : [];
      return [...arr, tempMessage];
    };

    queryClient.setQueryData(['messages', conversationID], appendTempMessage);
    if (activeRoomID && activeRoomID !== conversationID) {
      queryClient.setQueryData(['messages', activeRoomID], appendTempMessage);
    }

    const msgPayload = {
      conversationID: activeRoomID || conversationID,
      conversationUUID: activeRoomID || conversationID,
      conversationId: activeRoomID || conversationID,
      description: currentText,
      desc: currentText,
      text: currentText,
      message: currentText,
      file: currentAttachment?.url || null,
      attachments: currentAttachment?.url ? [currentAttachment.url] : [],
      userID: user?._id || user?.id,
      from: user?._id || user?.id,
      to: targetOtherUserId || undefined,
      isSeller: Boolean(user?.isSeller)
    };

    // 2. Perform DB save via authenticated HTTP mutation
    mutation.mutate(msgPayload, {
      onSettled: () => {
        isSendingRef.current = false;
      }
    });

    // 3. Emit message directly via WebSocket for instant real-time broadcast
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("send_message", msgPayload);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter -> Insert newline in textarea
        return;
      } else {
        // Pressing Enter alone -> Send message
        e.preventDefault();
        handleSend(e);
      }
    }
  };


  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setMessageText(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
      if (textareaRef.current.scrollHeight > 150) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }

    if (activeRoomID && activeRoomID !== 'undefined' && user?.username) {
      // Emit 'typing_start' on first keystroke
      if (!isTypingRef.current && value.length > 0) {
        isTypingRef.current = true;
        socket.emit("typing_start", {
          conversationID: activeRoomID,
          conversationUUID: activeRoomID,
          username: user.username
        });
      }

      // Reset 2-second timer on every keypress
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTypingIndicator();
      }, 2000);
    }
  };

  const handleOfferSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedPackageId && !selectedBriefId) { toast.error("Select at least a Package or a Project."); return; }
    if (!offerDesc || !offerPrice || !offerDelivery) { toast.error("Fill all fields."); return; }

    const payload: any = {
      price: Number(offerPrice),
      desc: offerDesc,
      delivery: Number(offerDelivery),
      revisions: parseRevisionNumber(offerRevisions, 0),
      sellerID: user._id
    };
    if (selectedPackageId) {
      payload.packageID = selectedPackageId;
      const pkg = sellerPackages.find((p: any) => (p._id || p.id) === selectedPackageId);
      if (pkg?.title) payload.title = pkg.title;
    }
    if (selectedBriefId) {
      payload.briefID = selectedBriefId;
      const brief = chatBriefs.find((b: any) => (b._id || b.id) === selectedBriefId);
      if (brief?.title) payload.title = brief.title;
    }

    const offerText = `[CUSTOM_OFFER]${JSON.stringify(payload)}`;
    const targetRoomId = activeRoomID || conversationID;

    // 1. Optimistic temp message for 0ms UI latency
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      id: tempId,
      conversationID: targetRoomId,
      conversationUUID: targetRoomId,
      userID: {
        _id: user?._id || user?.id,
        username: user?.username || 'User',
        image: getAvatarUrl(user?.image, user?.username || 'User')
      },
      senderID: user?._id || user?.id,
      sender: user,
      user: user,
      description: offerText,
      desc: offerText,
      text: offerText,
      message: offerText,
      isCustomOffer: true,
      file: null,
      attachments: [],
      isSeller: true,
      createdAt: new Date().toISOString()
    };

    const appendTempMessage = (oldData: any = []) => {
      const arr = Array.isArray(oldData) ? oldData : [];
      return [...arr, tempMessage];
    };

    queryClient.setQueryData(['messages', conversationID], appendTempMessage);
    if (activeRoomID && activeRoomID !== conversationID) {
      queryClient.setQueryData(['messages', activeRoomID], appendTempMessage);
    }

    // 2. Transmit to backend
    const msgPayload = {
      conversationID: targetRoomId,
      conversationUUID: targetRoomId,
      conversationId: targetRoomId,
      description: offerText,
      desc: offerText,
      text: offerText,
      message: offerText,
      isCustomOffer: true,
      file: null,
      attachments: [],
      userID: user?._id || user?.id,
      from: user?._id || user?.id,
      to: targetOtherUserId || undefined,
    };

    mutation.mutate(msgPayload);

    // 3. Emit via socket
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("send_message", msgPayload);
      socket.emit("sendMessage", msgPayload);
    }

    setSelectedPackageId(""); setSelectedBriefId(""); setOfferDesc(""); setOfferPrice(""); setOfferDelivery(""); setOfferRevisions(0);
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer: any) => {
    if (offer?.withdrawn || offer?.offerStatus === 'withdrawn') {
      toast.error("This proposal has been withdrawn by the seller.");
      return;
    }
    try {
      const { data } = await axiosFetch.post('/orders/create-payment-intent/custom', {
        packageID: offer.packageID,
        briefID: offer.briefID,
        customPrice: offer.price,
        customTitle: offer.desc,
        sellerID: offer.sellerID,
        delivery: offer.delivery
      });
      if (data.url) window.location.href = data.url;
    } catch { toast.error("Failed to initiate payment."); }
  };

  const handleWithdraw = async (msgId: string) => {
    try {
      const res = await axiosFetch.patch(`/messages/withdraw/${msgId}`);
      const updatedMsg = res.data?.messageDoc;
      toast.success(res.data?.message || "Custom offer withdrawn successfully.");
      queryClient.setQueryData(['messages', conversationID], (oldData: any = []) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((m: any) =>
          String(m._id || m.id) === String(msgId)
            ? { ...m, ...(updatedMsg || {}), withdrawn: true, offerStatus: 'withdrawn' }
            : m
        );
      });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to withdraw.");
    }
  };

  const parseOffer = (desc?: any) => {
    if (!desc) return null;
    if (typeof desc === 'object' && (desc.price !== undefined || desc.packageID || desc.delivery)) {
      return desc;
    }
    if (typeof desc !== 'string') return null;
    const str = desc.trim();
    if (str.includes('[CUSTOM_OFFER]')) {
      try {
        const jsonPart = str.substring(str.indexOf('[CUSTOM_OFFER]') + '[CUSTOM_OFFER]'.length).trim();
        return JSON.parse(jsonPart);
      } catch (err) {
        console.error("Failed to parse custom offer json:", err);
        return null;
      }
    }
    return null;
  };

  const parseMeeting = (desc?: any) => {
    if (!desc) return null;
    if (typeof desc === 'object' && (desc.roomUrl || desc.meetingId || desc.joinUrl)) {
      return desc;
    }
    if (typeof desc !== 'string') return null;
    const str = desc.trim();
    if (str.includes('[MEETING_INVITE]')) {
      try {
        const jsonPart = str.substring(str.indexOf('[MEETING_INVITE]') + '[MEETING_INVITE]'.length).trim();
        return JSON.parse(jsonPart);
      } catch (err) {
        console.error("Failed to parse meeting invite json:", err);
        return null;
      }
    }
    return null;
  };

  const handleCreateMeeting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isCreatingMeeting) return;

    const targetContactName = finalRecipientUser?.username || partnerUsername || 'Client';
    const title = meetingTitle.trim() || `Job Discussion with @${targetContactName}`;

    setIsCreatingMeeting(true);
    const toastId = toast.loading("Generating video meeting link...");

    try {
      const targetRoomId = activeRoomID || conversationID;
      const { data } = await axiosFetch.post(
        '/meetings',
        {
          title,
          conversationId: targetRoomId,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      const resData = data?.data || data;
      if (resData && (resData.roomUrl || resData.joinUrl || resData.meeting || resData.meetingId)) {
        const meetingPayload = {
          meetingId: resData.meetingId || '',
          roomUrl: resData.joinUrl || resData.roomUrl || resData.meeting || '',
          title: resData.title || title,
          hostEmail: resData.hostEmail || '',
          password: resData.password || '',
          isPrivate: Boolean(resData.isPrivate),
          autoRecording: resData.autoRecording || '',
          createdAt: resData.createdAt || new Date().toISOString(),
          status: resData.status || 'success'
        };

        const meetingText = `[MEETING_INVITE]${JSON.stringify(meetingPayload)}`;

        // Optimistically append temp message to local UI (0ms latency)
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          _id: tempId,
          id: tempId,
          conversationID: targetRoomId,
          userID: {
            _id: user?._id || user?.id,
            username: user?.username || 'User',
            image: getAvatarUrl(user?.image, user?.username || 'User')
          },
          senderID: user?._id || user?.id,
          sender: user,
          user: user,
          description: meetingText,
          isSeller: Boolean(user?.isSeller),
          createdAt: new Date().toISOString()
        };

        const appendTempMessage = (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          return [...arr, tempMessage];
        };

        queryClient.setQueryData(['messages', conversationID], appendTempMessage);
        if (activeRoomID && activeRoomID !== conversationID) {
          queryClient.setQueryData(['messages', activeRoomID], appendTempMessage);
        }

        // Send meeting message via WebSocket (or fallback to HTTP if socket unavailable)
        if (socket && socket.connected) {
          const socketPayload = {
            conversationID: targetRoomId,
            conversationUUID: targetRoomId,
            conversationId: targetRoomId,
            description: meetingText,
            desc: meetingText,
            text: meetingText,
            message: meetingText,
            meeting: meetingPayload,
            meetingPayload,
            userID: user?._id || user?.id,
            from: user?._id || user?.id,
            to: targetOtherUserId || undefined,
            user: {
              _id: user?._id || user?.id,
              username: user?.username || 'User',
              image: getAvatarUrl(user?.image, user?.username || 'User')
            },
            sender: {
              _id: user?._id || user?.id,
              username: user?.username || 'User',
              image: getAvatarUrl(user?.image, user?.username || 'User')
            },
            createdAt: new Date().toISOString()
          };
          socket.emit("send_message", socketPayload);
        } else {
          mutation.mutate({
            conversationID: targetRoomId,
            description: meetingText,
          });
        }

        toast.success("Meeting room created and sent to chat!", { id: toastId });
        setShowMeetingModal(false);
        setMeetingTitle("");
      } else {
        toast.error("Failed to generate meeting link. Please try again.", { id: toastId });
      }
    } catch (err: any) {
      console.error("Meeting creation error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to create meeting", { id: toastId });
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleCopyMeetingLink = (roomUrl: string) => {
    if (!roomUrl) return;
    navigator.clipboard.writeText(roomUrl)
      .then(() => toast.success("Meeting link copied to clipboard!"))
      .catch(() => toast.error("Could not copy link"));
  };

  const handleCopyText = (text: string, msg: string = "Copied to clipboard!") => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => toast.success(msg))
      .catch(() => toast.error("Could not copy text"));
  };

  const fmt = (d: any) => moment(d).format('MMM DD, HH:mm');

  const activeConv = conversations.find((c: any) => {
    if (c.conversationID === conversationID || c.id === conversationID || c._id === conversationID) return true;
    const sId = String(c.sellerID?._id || c.sellerID || '');
    const bId = String(c.buyerID?._id || c.buyerID || '');
    return `${sId}${bId}` === conversationID || `${bId}${sId}` === conversationID;
  });

  const recipientUsername = finalRecipientUser?.username || getOtherUser(activeConv || activeConversation, user)?.username;
  const isUserSellerInActiveConv = String(activeConv?.sellerID?._id || activeConv?.sellerID || '') === String(user?._id || user?.id || '');

  const isReadByRecipient = (() => {
    const targetConv = activeConv || activeConversation;
    if (!targetConv) return false;

    // 1. Username-based standard read status check
    if (Array.isArray(targetConv.readBy) && recipientUsername) {
      return targetConv.readBy.includes(recipientUsername);
    }

    // 2. Legacy flag fallback
    return isUserSellerInActiveConv ? targetConv?.readByBuyer : targetConv?.readBySeller;
  })();

  const isMsgReadByRecipient = (msg: any) => {
    if (!msg) return false;
    if (Array.isArray(msg.readBy) && recipientUsername) {
      return msg.readBy.includes(recipientUsername);
    }
    return isReadByRecipient;
  };

  const filteredConversations = conversations.filter((conv: any) => {
    const isUnread = isConversationUnread(conv, user);
    if (convFilterTab === 'read' && isUnread) return false;
    if (convFilterTab === 'unread' && !isUnread) return false;

    if (!convSearchQuery) return true;
    const contact = getOtherUser(conv, user);
    const searchLower = convSearchQuery.toLowerCase();
    const username = (contact?.username || contact?.name || '').toLowerCase();
    const lastMsg = (conv.lastMessage || '').toLowerCase();
    return username.includes(searchLower) || lastMsg.includes(searchLower);
  });

  const filteredMessages = messages
    .filter((msg: any, index: number, self: any[]) => {
      // 1. Deduplicate by unique real message ID
      const msgId = String(msg._id || msg.id || '');
      if (msgId && !msgId.startsWith('temp-')) {
        const firstIdx = self.findIndex((m: any) => String(m._id || m.id || '') === msgId);
        if (firstIdx !== index) return false;
      }

      const text = (msg.description || msg.desc || msg.text || msg.message || '').trim();
      const fileUrl = msg.file || (Array.isArray(msg.attachments) && msg.attachments[0]) || '';
      const isTemp = !msgId || msgId.startsWith('temp-');

      // 2. If this is a temp message, discard if a confirmed real message with the same content exists
      if (isTemp) {
        const hasRealDuplicate = self.some((m: any, mIdx: number) => {
          if (mIdx === index) return false;
          const otherId = String(m._id || m.id || '');
          if (!otherId || otherId.startsWith('temp-')) return false;
          const otherText = (m.description || m.desc || m.text || m.message || '').trim();
          const otherFile = m.file || (Array.isArray(m.attachments) && m.attachments[0]) || '';
          return otherText === text && otherFile === fileUrl;
        });
        if (hasRealDuplicate) return false;
      }

      // 3. Deduplicate messages with identical text/file and matching sender created within 15 seconds
      const senderId = String(
        (typeof msg.sender === 'object' && (msg.sender?._id || msg.sender?.id)) ||
        (typeof msg.user === 'object' && (msg.user?._id || msg.user?.id)) ||
        (typeof msg.userID === 'object' && (msg.userID?._id || msg.userID?.id)) ||
        msg.sender ||
        msg.user ||
        msg.senderID ||
        msg.userID ||
        msg.from ||
        ''
      );

      const firstDuplicateIdx = self.findIndex((m: any) => {
        const otherText = (m.description || m.desc || m.text || m.message || '').trim();
        const otherFile = m.file || (Array.isArray(m.attachments) && m.attachments[0]) || '';
        if (otherText !== text || otherFile !== fileUrl) return false;

        const otherSenderId = String(
          (typeof m.sender === 'object' && (m.sender?._id || m.sender?.id)) ||
          (typeof m.user === 'object' && (m.user?._id || m.user?.id)) ||
          (typeof m.userID === 'object' && (m.userID?._id || m.userID?.id)) ||
          m.sender ||
          m.user ||
          m.senderID ||
          m.userID ||
          m.from ||
          ''
        );
        if (senderId && otherSenderId && senderId !== otherSenderId) return false;

        const t1 = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
        const t2 = m.createdAt ? new Date(m.createdAt).getTime() : 0;
        if (t1 && t2 && Math.abs(t1 - t2) > 15000) return false;

        return true;
      });

      if (firstDuplicateIdx !== index) {
        const otherMsg = self[firstDuplicateIdx];
        const otherId = String(otherMsg?._id || otherMsg?.id || '');
        // If current is temp and other is real, drop current
        if (isTemp && otherId && !otherId.startsWith('temp-')) return false;
        // Keep the earlier one
        if (firstDuplicateIdx < index) return false;
      }

      // 4. Collapse duplicate meeting invites for the same meetingId
      const meeting = parseMeeting(msg.meeting || msg.meetingPayload || text);
      if (meeting?.meetingId) {
        const firstMeetingIdx = self.findIndex((m: any) => {
          const mText = (m.description || m.desc || m.text || m.message || '').trim();
          const mMeeting = parseMeeting(m.meeting || m.meetingPayload || mText);
          return mMeeting?.meetingId && String(mMeeting.meetingId) === String(meeting.meetingId);
        });
        if (firstMeetingIdx !== index) return false;
      }

      return true;
    })
    .filter((msg: any) => {
      if (!msgSearchQuery) return true;
      const text = (msg.description || msg.desc || msg.text || msg.message || '').toLowerCase();
      return text.includes(msgSearchQuery.toLowerCase());
    });

  // Auto-scroll on initial load, conversation switch, or new messages
  useEffect(() => {
    if (!isValidId) return;

    const isNewConv = lastConversationIdRef.current !== conversationID;
    if (isNewConv) {
      lastConversationIdRef.current = conversationID;
      isNearBottomRef.current = true;
    }

    if (!msgsLoading && filteredMessages.length > 0) {
      if (isNewConv) {
        // Instant jump to bottom when switching conversation or initial load
        scrollToBottom('auto');
        requestAnimationFrame(() => scrollToBottom('auto'));
        const timer = setTimeout(() => scrollToBottom('auto'), 100);
        return () => clearTimeout(timer);
      } else {
        const prevCount = prevMessageCountRef.current;
        const newCount = filteredMessages.length;
        if (newCount > prevCount) {
          const lastMsg = filteredMessages[filteredMessages.length - 1];
          const senderId = String(
            (typeof lastMsg?.sender === 'object' && (lastMsg.sender?._id || lastMsg.sender?.id)) ||
            (typeof lastMsg?.user === 'object' && (lastMsg.user?._id || lastMsg.user?.id)) ||
            (typeof lastMsg?.userID === 'object' && (lastMsg.userID?._id || lastMsg.userID?.id)) ||
            lastMsg?.sender || lastMsg?.user || lastMsg?.userID || ''
          );
          const isOwnMessage = Boolean(user?._id && String(user._id) === senderId);

          if (isOwnMessage || isNearBottomRef.current) {
            scrollToBottom('smooth');
            requestAnimationFrame(() => scrollToBottom('smooth'));
          }
        }
      }
    }
    prevMessageCountRef.current = filteredMessages.length;
  }, [conversationID, isValidId, msgsLoading, filteredMessages, scrollToBottom, user?._id]);

  // Handle dynamic height changes (images, attachments, custom proposals loading asynchronously)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let prevHeight = container.scrollHeight;

    const ro = new ResizeObserver(() => {
      if (!messagesContainerRef.current) return;
      const currentHeight = messagesContainerRef.current.scrollHeight;
      if (currentHeight !== prevHeight) {
        prevHeight = currentHeight;
        if (isNearBottomRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
    });

    Array.from(container.children).forEach((child) => ro.observe(child));
    ro.observe(container);

    return () => ro.disconnect();
  }, [filteredMessages.length, msgsLoading]);

  const renderMessageAttachment = (msg: any) => {
    return <ChatMessageAttachmentItem msg={msg} onImagePreview={(url: string) => setLightboxImage(url)} />;
  };

  const renderMessageContent = (msg: any) => {
    const text = msg.description || msg.desc || msg.text || msg.message || '';
    if (!text) return null;

    const matchedWord = msg.moderation?.matchedWord || '';
    if (msg.moderation?.flagged && matchedWord && matchedWord.trim().length > 0) {
      try {
        const escaped = matchedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const parts = text.split(regex);
        return (
          <p className="text-[13.5px] text-slate-900 m-0 whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed">
            {parts.map((part: string, idx: number) =>
              regex.test(part) ? (
                <mark key={idx} className="bg-[#FFE600] text-slate-900 px-0.5 rounded-[2px] font-medium">
                  {part}
                </mark>
              ) : (
                renderMessageTextWithLinks(part)
              )
            )}
          </p>
        );
      } catch { }
    }

    return (
      <p className="text-[13.5px] text-slate-800 m-0 whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed">
        {renderMessageTextWithLinks(text)}
      </p>
    );
  };

  if (convsLoading && conversations.length === 0) {
    return <ChatSkeleton />;
  }

  return (
    <div className="h-full max-h-full min-h-0 bg-white flex overflow-hidden w-full flex-1">
      <div className="flex w-full h-full max-h-full min-h-0 flex-1 overflow-hidden relative">

        <div className={`md:hidden fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 ease-in-out ${isLeftSideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsLeftSideOpen(false)}></div>

        {/* ── LEFT: Conversation List ── */}
        {(() => {
          const readCount = conversations.filter((c: any) => !isConversationUnread(c, user)).length;
          const displayedConversations = filteredConversations;

          return (
            <aside className={`w-[300px] min-w-[280px] md:w-[320px] lg:w-[340px] xl:w-[350px] border-r border-[rgba(0,0,0,0.10)] flex flex-col bg-[var(--Foundation-White-white-200,#F8F8F8)] overflow-hidden box-border transform transition-transform duration-300 ease-in-out max-md:absolute max-md:z-40 max-md:w-[320px] max-md:h-full max-md:shadow-xl max-md:flex ${isLeftSideOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>
              {/* Header: Back Button + Messages Heading */}
              <div className="p-4 sm:p-5 pb-3 flex flex-col gap-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    radius="full"
                    onClick={() => {
                      const targetDashboard = user?.isSeller ? '/dashboard/seller' : '/dashboard/buyer';
                      navigate.push(targetDashboard);
                    }}
                    className="w-9 h-9 min-h-[36px] !p-0 border-slate-200 text-[#126D6B] bg-white hover:bg-slate-50 shrink-0"
                    aria-label="Back to Dashboard"
                    title="Back to Dashboard"
                    icon={<ArrowLeft className="w-4 h-4 text-slate-700" />}
                  />
                  <h2 className="text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] macbook:text-[32px] 2xl:text-[36px] font-normal leading-tight tracking-tight text-[#292929] font-sf-pro">
                    Messages
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                  <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Find seller..."
                    value={convSearchQuery}
                    onChange={(e) => setConvSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-[6px] focus:outline-none focus:border-slate-400 placeholder:text-slate-400 text-slate-800 transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant={convFilterTab === 'all' ? 'pill-tab' : 'ghost'}
                    size="xs"
                    radius="full"
                    onClick={() => setConvFilterTab('all')}
                    className={`px-4 py-1.5 text-xs font-medium border transition-colors ${convFilterTab === 'all'
                      ? '!border-teal-700 !text-teal-800 !bg-white shadow-2xs font-semibold'
                      : '!border-slate-200 text-slate-700 !bg-white hover:!bg-slate-50'
                      }`}
                  >
                    All
                  </Button>
                  <Button
                    type="button"
                    variant={convFilterTab === 'read' ? 'pill-tab' : 'ghost'}
                    size="xs"
                    radius="full"
                    onClick={() => setConvFilterTab('read')}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 ${convFilterTab === 'read'
                      ? '!border-teal-700 !text-teal-800 !bg-white shadow-2xs font-semibold'
                      : '!border-slate-200 text-slate-700 !bg-white hover:!bg-slate-50'
                      }`}
                  >
                    <span>Read</span>
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold shrink-0 leading-none">
                      {readCount}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant={convFilterTab === 'unread' ? 'pill-tab' : 'ghost'}
                    size="xs"
                    radius="full"
                    onClick={() => setConvFilterTab('unread')}
                    className={`px-3.5 py-1.5 text-xs font-medium border transition-colors ${convFilterTab === 'unread'
                      ? '!border-teal-700 !text-teal-800 !bg-white shadow-2xs font-semibold'
                      : '!border-slate-200 text-slate-700 !bg-white hover:!bg-slate-50'
                      }`}
                  >
                    Unread
                  </Button>
                </div>
              </div>

              {/* Conversation Items List */}
              <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
                {convsLoading ? (
                  <div className="list-loader py-10 flex justify-center"><Loader size={28} /></div>
                ) : displayedConversations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    {convSearchQuery ? "No conversations found" : "No conversations yet"}
                  </div>
                ) : (
                  displayedConversations.map((conv: any) => {
                    const isUnread = isConversationUnread(conv, user);
                    const contact = getOtherUser(conv, user);
                    const contactName =
                      contact?.username ||
                      contact?.name ||
                      (user?.isSeller ? conv.buyer_username : conv.seller_username) ||
                      'User';
                    const avatarSrc = getAvatarUrl(contact?.image || contact?.img || contact?.avatar || '/media/noavatar.png');
                    const lastMsg = conv.lastMessage?.startsWith('[CUSTOM_OFFER]')
                      ? '📋 Custom Offer'
                      : conv.lastMessage?.startsWith('[MEETING_INVITE]')
                        ? '📹 Video Meeting Invitation'
                        : conv.lastMessage || 'No messages yet';
                    const canonicalId = conv.uuid || conv.conversationID || conv._id || conv.id;
                    const isActive = isTargetConversation(conv, conversationID);
                    const timeText = conv.updatedAt ? moment(conv.updatedAt).format('h:mm A') : '';
                    const unreadCountBadge = conv.unreadCount || (isUnread ? 1 : 0);

                    return (
                      <div
                        key={conv._id || canonicalId}
                        className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-[6px] cursor-pointer transition-all duration-150 ${isActive ? 'bg-white' : 'hover:bg-slate-50'
                          }`}
                        onClick={() => {
                          if (canonicalId) {
                            navigate.push(`/message/${canonicalId}`);
                          }
                          setIsLeftSideOpen(false);
                        }}
                      >
                        <img
                          src={avatarSrc}
                          alt={contactName}
                          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-semibold text-slate-900 text-sm truncate leading-tight">
                                {contactName}
                              </span>
                              {unreadCountBadge > 0 && (
                                <span className="w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 leading-none">
                                  {unreadCountBadge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal shrink-0">
                              {timeText}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate leading-snug">
                            {lastMsg}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
          );
        })()}

        {/* ── CENTER: Chat Window ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white min-w-0">
          {!conversationID || (!isValidId && conversations.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white gap-3 select-none">
              <div className="w-16 h-16 rounded-[6px] bg-[#E6F7F3] text-[#0D6D5F] flex items-center justify-center shadow-2xs mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  <path d="M8 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M16 12h.01" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-sf-pro tracking-tight">
                No Messages Yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed font-normal">
                When you contact a seller or receive a message from a buyer, your conversations will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-30 shrink-0 min-h-[64px] px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-[rgba(0,0,0,0.10)] flex items-center bg-[#F8F8F8]">
                {/* Mobile Full-Width Search Takeover */}
                {isMsgSearchActive && (
                  <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-[64px] bg-white px-3 flex items-center gap-2 border-b border-slate-200 shadow-xs animate-in fade-in duration-150">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      onClick={() => {
                        setIsMsgSearchActive(false);
                        setMsgSearchQuery('');
                      }}
                      className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 shrink-0"
                      aria-label="Close search"
                      icon={<ArrowLeft className="w-5 h-5" />}
                    />
                    <div className="flex-1 flex items-center bg-slate-100 rounded-[6px] px-3 py-1.5 min-w-0">
                      <input
                        type="text"
                        placeholder="Search in chat..."
                        value={msgSearchQuery}
                        onChange={(e) => setMsgSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 py-0.5"
                        autoFocus
                      />
                      {msgSearchQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          radius="full"
                          onClick={() => setMsgSearchQuery('')}
                          className="text-slate-400 hover:text-slate-700 shrink-0 ml-1 !p-0.5 !min-h-0 !h-auto text-xs"
                          aria-label="Clear search"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setIsMsgSearchActive(false);
                        setMsgSearchQuery('');
                      }}
                      className="text-xs font-semibold text-teal-800 hover:text-teal-900 shrink-0 px-1 py-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Mobile Menu */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  radius="md"
                  className="md:hidden mr-2 sm:mr-3 shrink-0 w-8 h-8 sm:w-9 sm:h-9 text-slate-600 hover:bg-slate-100"
                  onClick={() => setIsLeftSideOpen(true)}
                  aria-label="Open conversations"
                  icon={<RiMenuLine className="text-lg sm:text-xl" />}
                />

                {finalRecipientUser ? (
                  <>
                    {/* Recipient */}
                    <div
                      className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setIsRightSideOpen(true)}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={finalRecipientUser.image || '/media/noavatar.png'}
                          alt=""
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                        />
                        {isRecipientOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 leading-tight truncate">
                          {finalRecipientUser.username}
                        </h3>

                        <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          {isRecipientTyping ? (
                            <span className="text-brand-green font-semibold animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-brand-green rounded-full shrink-0" />
                              typing...
                            </span>
                          ) : isRecipientOnline ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                              Online
                            </span>
                          ) : recipientLastSeenText ? (
                            <span>Last seen {recipientLastSeenText}</span>
                          ) : (
                            'Offline'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1 sm:ml-2">

                      {/* Create Offer - Visible on desktop, moved to 3-dots drawer on mobile */}
                      {user?.isSeller && (
                        <Button
                          type="button"
                          variant="dark"
                          size="md"
                          radius="fiverr"
                          onClick={() => setShowOfferModal(true)}
                          className="hidden xl:inline-flex h-10 text-[16px] font-semibold px-4 whitespace-nowrap shrink-0"
                        >
                          Create Offer
                        </Button>
                      )}

                      {/* Video Meeting */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        radius="lg"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-emerald-50 text-emerald-600 shrink-0"
                        onClick={() => {
                          setMeetingTitle(
                            `Job Discussion with @${finalRecipientUser?.username || 'Client'}`
                          );
                          setShowMeetingModal(true);
                        }}
                        title="Start Video Meeting"
                        aria-label="Start Video Meeting"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="sm:w-6 sm:h-6"
                          >
                            <path
                              d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 18.9749 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z"
                              stroke="#292929"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2998 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941"
                              stroke="#292929"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
                              stroke="#292929"
                              strokeWidth="1.5"
                            />
                          </svg>
                        }
                      />

                      {/* Search */}
                      {isMsgSearchActive ? (
                        <div
                          className="
        hidden md:flex items-center
        h-8 sm:h-9
        w-[160px] lg:w-[200px]
        bg-slate-100
        rounded-[6px]
        px-2
        shrink-0
      "
                        >
                          <input
                            type="text"
                            placeholder="Search in chat..."
                            value={msgSearchQuery}
                            onChange={(e) => setMsgSearchQuery(e.target.value)}
                            className="
                border-none
                bg-transparent
                outline-none
                text-xs sm:text-sm
                py-1
                min-w-0
                flex-1
                text-slate-800
                placeholder:text-slate-400
              "
                            autoFocus
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            radius="full"
                            className="w-5 h-5 min-h-0 !p-0 text-slate-500 hover:text-slate-800 text-lg leading-none"
                            onClick={() => {
                              setIsMsgSearchActive(false);
                              setMsgSearchQuery('');
                            }}
                            aria-label="Close search"
                            icon={<span>&times;</span>}
                          />
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          radius="lg"
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-slate-100 text-slate-600 shrink-0"
                          onClick={() => setIsMsgSearchActive(true)}
                          aria-label="Search messages"
                          icon={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="21"
                              height="21"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="sm:w-6 sm:h-6"
                            >
                              <path
                                d="M17 17L21 21"
                                stroke="#292929"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                                stroke="#292929"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          }
                        />
                      )}

                      {/* Mobile Right Sidebar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        radius="lg"
                        className="xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-slate-100 text-slate-600 shrink-0"
                        onClick={() => setIsRightSideOpen(true)}
                        aria-label="Open contact info"
                        icon={
                          <BsThreeDotsVertical />
                        }
                      />

                    </div>
                  </>
                ) : (
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                    Conversation
                  </h3>
                )}
              </div>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 flex flex-col gap-4 bg-[#F0F0F0] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {msgsError ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 m-6 rounded-[6px] border border-red-200 dark:border-red-900/50 shadow-sm">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-3xl mb-4 font-bold">🚫</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Access Denied (403)</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm leading-relaxed">
                      You are not a participant in this conversation. You do not have permission to view or send messages in this chat.
                    </p>
                  </div>
                ) : msgsLoading ? (
                  <div className="p-6 space-y-6 flex-1 overflow-hidden">
                    <div className="flex gap-3 max-w-md">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="w-48 h-12 rounded-[10px_10px_10px_0]" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                    <div className="flex gap-3 max-w-md ml-auto flex-row-reverse">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="space-y-2 flex flex-col items-end">
                        <Skeleton className="w-64 h-16 rounded-[10px_10px_0_10px]" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                    <div className="flex gap-3 max-w-md">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="w-36 h-10 rounded-[10px_10px_10px_0]" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="py-12 m-auto text-center text-sm text-slate-400 font-medium">{msgSearchQuery ? "No messages found" : "Send the first message!"}</div>
                ) : filteredMessages.map((msg: any, index: number) => {
                  const senderObj =
                    (typeof msg.sender === 'object' && msg.sender) ||
                    (typeof msg.user === 'object' && msg.user) ||
                    (typeof msg.userID === 'object' && msg.userID) ||
                    (typeof msg.senderID === 'object' && msg.senderID) ||
                    msg.sender ||
                    msg.user ||
                    msg.senderID ||
                    msg.userID;
                  const senderIdStr = String(senderObj?._id || senderObj?.id || senderObj || '');
                  const currentUserIdStr = String(user?._id || user?.id || '');
                  const currentUsername = String(user?.username || '').toLowerCase();
                  const senderUsername = String(senderObj?.username || msg.username || '').toLowerCase();
                  const isOwner = Boolean(
                    (currentUserIdStr && senderIdStr && currentUserIdStr === senderIdStr) ||
                    (currentUsername && senderUsername && currentUsername === senderUsername)
                  );
                  const msgRawText = msg.description || msg.desc || msg.text || msg.message || '';
                  const offer = msg.isCustomOffer || (typeof msgRawText === 'string' && msgRawText.includes('[CUSTOM_OFFER]'))
                    ? parseOffer(msg.offer || msg.customOffer || msgRawText)
                    : (msg.offer ? parseOffer(msg.offer) : null);
                  const meeting = (typeof msgRawText === 'string' && msgRawText.includes('[MEETING_INVITE]')) || msg.meeting || msg.meetingPayload
                    ? parseMeeting(msg.meeting || msg.meetingPayload || msgRawText)
                    : null;
                  const isOfferAccepted = Boolean(msg.isOfferAccepted || msg.offerStatus === 'accepted');
                  const isWithdrawn = Boolean(msg.withdrawn || msg.offerStatus === 'withdrawn');
                  const acceptedOrder = offer ? contactOrders.find((o: any) => (msg.orderID && (o._id === msg.orderID || o.id === msg.orderID)) || (o.title === offer.desc && Number(o.price) === Number(offer.price))) : null;
                  const targetOrderId = msg.orderID || acceptedOrder?._id || acceptedOrder?.id;
                  const isAccepted = isOfferAccepted || Boolean(acceptedOrder);
                  const isModerated = Boolean(msg.moderation?.flagged);
                  const modLevel = String(msg.moderation?.warningLevel || 'medium').toLowerCase();
                  const bubbleModerationClass = isModerated
                    ? '!rounded-[10px_10px_10px_0] !border !border-[var(--warning-500,#F00000)] !bg-[#FFF]'
                    : '';

                  const msgDateKey = moment(msg.createdAt).format('YYYY-MM-DD');
                  const prevMsgDateKey = index > 0 ? moment(filteredMessages[index - 1].createdAt).format('YYYY-MM-DD') : null;
                  const showDateDivider = msgDateKey !== prevMsgDateKey;
                  const isToday = moment(msg.createdAt).isSame(moment(), 'day');
                  const dateText = isToday ? 'Today' : moment(msg.createdAt).format('dddd, MMMM D');

                  return (
                    <div key={msg._id || msg.id} className="flex flex-col gap-4">
                      {showDateDivider && (
                        <div className="flex items-center justify-center gap-4 my-2 w-full before:flex-1 before:h-[1px] before:bg-slate-200 after:flex-1 after:h-[1px] after:bg-slate-200">
                          <span className="text-xs text-slate-400 font-normal px-1 whitespace-nowrap">{dateText}</span>
                        </div>
                      )}
                      <div className={`flex gap-3 items-end max-w-[85%] sm:max-w-[75%] [overflow-wrap:anywhere] [word-break:break-word] ${isOwner ? 'self-end justify-end ml-auto' : 'self-start mr-auto'} ${offer || meeting ? '!max-w-[95%] xl:!max-w-[85%]' : ''}`}>
                        {!isOwner && (
                          <img className="w-8 h-8 rounded-full object-cover self-end shrink-0 border border-slate-100" src={senderObj?.image || finalRecipientUser?.image || '/media/noavatar.png'} alt="" />
                        )}

                        {offer ? (
                          <div
                            className={`w-[410px] max-w-full p-5 flex flex-col justify-center items-start gap-5 shadow-sm custom-gradient-card ${isWithdrawn ? 'opacity-80' : ''
                              }`}
                            style={{
                              borderRadius: '20px',
                              border: '3px solid transparent',
                              background:
                                'linear-gradient(#FFF, #FFF) padding-box, linear-gradient(135deg, #00A6FF 0%, #3ED419 50%, #F29EFF 100%) border-box',
                              WebkitBackgroundClip: 'padding-box, border-box',
                              backgroundClip: 'padding-box, border-box',
                            }}
                          >
                            {isWithdrawn && (
                              <p className="text-xs text-red-600 italic font-medium m-0">
                                ↩ This offer was withdrawn by the seller.
                              </p>
                            )}

                            {isAccepted && (
                              <div className="w-full flex items-center justify-between gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-[6px] px-3.5 py-2 text-xs font-bold">
                                <span>✓ Custom Proposal Accepted</span>
                                {targetOrderId && (
                                  <span className="text-[11px] font-mono text-emerald-700">
                                    Order #{String(targetOrderId).slice(-6)}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Top Row: Package/Offer Title + Price */}
                            <div className="w-full flex items-start justify-between gap-4">
                              <h4 className="text-[17px] sm:text-[18px] font-bold text-slate-900 leading-[1.3] flex-1 min-w-0 pr-2">
                                {offer.packageTitle ||
                                  offer.gigTitle ||
                                  offer.title ||
                                  (offer.packageID && sellerPackages.find((p: any) => (p._id || p.id) === offer.packageID)?.title) ||
                                  (offer.briefID && chatBriefs.find((b: any) => (b._id || b.id) === offer.briefID)?.title) ||
                                  "I will help you design better landing landing pages"}
                              </h4>
                              <div className="text-[26px] sm:text-[28px] font-bold text-black shrink-0 leading-none">
                                ${offer.price}
                              </div>
                            </div>

                            <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

                            {/* Middle Section: Title + Description + Read Full Proposal */}
                            <div className="w-full flex flex-col gap-2">
                              <span className="text-[15px] font-medium text-slate-900">Title</span>
                              <p className="text-[14px] text-slate-600 leading-relaxed m-0 font-normal">
                                {renderMessageTextWithLinks(offer.desc || "1 Screen -Clean Dashboard UI UX design - Developer-ready Figma files - Unlimited revisions")}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingOfferDetails({
                                    offer,
                                    msgId: msg._id || msg.id,
                                    acceptedOrder: isAccepted ? (targetOrderId || true) : null,
                                    isOwner,
                                    isWithdrawn,
                                  });
                                }}
                                className="text-[14px] font-medium text-[#007A64] hover:text-[#005c4b] hover:!bg-transparent !p-0 !min-h-0 !h-auto flex items-center gap-1.5 w-fit mt-0.5"
                                rightIcon={
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                  </svg>
                                }
                              >
                                <span>Read Full Proposal</span>
                              </Button>
                            </div>

                            <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

                            {/* Inclusions Row: Header + Revisions + Delivery */}
                            <div className="w-full flex flex-col gap-3">
                              <span className="text-[15px] font-medium text-slate-900">The offer includes</span>
                              <div className="flex items-center gap-6 text-[14px] text-slate-700 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#292929" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                    <path d="M21 21v-5h-5" />
                                  </svg>
                                  <span>
                                    {parseRevisionNumber(offer.revision ?? offer.revisions, 0) === 1
                                      ? "1 Revision"
                                      : `${parseRevisionNumber(offer.revision ?? offer.revisions, 0)} Revisions`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#292929" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="9" />
                                    <polyline points="12 7 12 12 15 14" />
                                  </svg>
                                  <span>{offer.delivery} Day Delivery</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full pt-1">
                              {isAccepted ? (
                                <Button
                                  type="button"
                                  variant="dark"
                                  size="md"
                                  fullWidth
                                  radius="fiverr"
                                  rightIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="5" y1="12" x2="19" y2="12"></line>
                                      <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                  }
                                  onClick={() => {
                                    if (targetOrderId) navigate.push(`/orders/${targetOrderId}`);
                                    else navigate.push('/orders');
                                  }}
                                  className="h-10 font-semibold shadow-xs"
                                >
                                  View Order
                                </Button>
                              ) : isWithdrawn ? (
                                <div className="w-full h-10 rounded-[6px] font-semibold text-[15px] bg-[#F3F4F6] text-slate-400 flex items-center justify-center select-none">
                                  Withdrawn
                                </div>
                              ) : !isOwner ? (
                                <Button
                                  type="button"
                                  variant="dark"
                                  size="md"
                                  fullWidth
                                  radius="fiverr"
                                  rightIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="5" y1="12" x2="19" y2="12"></line>
                                      <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                  }
                                  onClick={() => handleAcceptOffer(offer)}
                                  className="h-10 font-semibold shadow-xs"
                                >
                                  Accept Offer
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="soft"
                                  size="md"
                                  fullWidth
                                  radius="fiverr"
                                  onClick={() => handleWithdraw(msg._id || msg.id)}
                                  className="h-10 font-semibold text-[#1E293B] shadow-xs"
                                >
                                  Withdraw
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : meeting ? (
                          <div
                            className="w-[410px] max-w-full p-5 flex flex-col justify-center items-start gap-5 shadow-sm custom-gradient-card"
                            style={{
                              borderRadius: '20px',
                              border: '3px solid transparent',
                              background:
                                'linear-gradient(#FFF, #FFF) padding-box, linear-gradient(135deg, #00A6FF 0%, #3ED419 50%, #F29EFF 100%) border-box',
                              WebkitBackgroundClip: 'padding-box, border-box',
                              backgroundClip: 'padding-box, border-box',
                            }}
                          >
                            {/* Top Header: Video Camera Icon + Title + Copy Link */}
                            <div className="w-full flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z" stroke="#354B9A" strokeWidth="1.5" />
                                  <path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941" stroke="#354B9A" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="#354B9A" strokeWidth="1.5" />
                                </svg>
                                <span className="text-[16px] font-bold text-slate-900 leading-none">Video Meeting Invitation</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                radius="md"
                                onClick={() => handleCopyText(meeting.roomUrl || meeting.joinUrl || `Meeting ID: ${meeting.meetingId || ''}`, "Meeting link copied to clipboard!")}
                                className="text-slate-700 hover:text-black p-1 hover:bg-slate-100"
                                title="Copy meeting link"
                                aria-label="Copy meeting link"
                                icon={
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="8" y="8" width="13" height="13" rx="3" />
                                    <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                                  </svg>
                                }
                              />
                            </div>

                            <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

                            {/* Credentials Row: ID & Passcode pills */}
                            <div className="w-full flex items-center gap-3">
                              <div className="flex-1 bg-[#F0F0F0] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm font-medium text-slate-700 truncate">
                                  ID- {meeting.meetingId || (meeting.roomUrl ? String(meeting.roomUrl).split('/').pop() : '81346682237')}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  radius="md"
                                  onClick={() => handleCopyText(meeting.meetingId || (meeting.roomUrl ? String(meeting.roomUrl).split('/').pop() : ''), "Meeting ID copied!")}
                                  className="text-slate-600 hover:text-black shrink-0 !p-0.5 !min-h-0 !h-auto w-auto"
                                  title="Copy Meeting ID"
                                  aria-label="Copy Meeting ID"
                                  icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="8" y="8" width="13" height="13" rx="3" />
                                      <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                                    </svg>
                                  }
                                />
                              </div>

                              <div className="flex-1 bg-[#F0F0F0] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm font-medium text-slate-700 truncate">
                                  Pass- {meeting.password || meeting.passcode || 'i4Rs8N'}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  radius="md"
                                  onClick={() => handleCopyText(meeting.password || meeting.passcode || '', "Passcode copied!")}
                                  className="text-slate-600 hover:text-black shrink-0 !p-0.5 !min-h-0 !h-auto w-auto"
                                  title="Copy Passcode"
                                  aria-label="Copy Passcode"
                                  icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="8" y="8" width="13" height="13" rx="3" />
                                      <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                                    </svg>
                                  }
                                />
                              </div>
                            </div>

                            <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

                            {/* Title & Description */}
                            <div className="w-full flex flex-col gap-2">
                              <h5 className="text-[16px] font-bold text-slate-900 leading-snug m-0">
                                {meeting.title || `Job Discussion with @${finalRecipientUser?.username || partnerUsername || 'Nilson_dev'}`}
                              </h5>
                              <p className="text-[14px] text-slate-600 leading-relaxed m-0 font-normal">
                                {meeting.description || "Join the real-time video consultation room to discuss projectrequirement, scope and deliverable"}
                              </p>
                            </div>

                            {/* Action Button: Join Meeting */}
                            <div className="w-full pt-1">
                              <a
                                href={meeting.roomUrl || meeting.joinUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-10 rounded-[6px] font-semibold text-[16px] bg-[#000000] text-white hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                              >
                                <span>Join Meeting</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                  <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`relative px-4 py-3 min-w-[100px] max-w-full shadow-2xs [overflow-wrap:anywhere] [word-break:break-word] ${bubbleModerationClass} ${isOwner
                                ? 'rounded-[10px_10px_10px_0] border border-[rgba(0,0,0,0.10)] bg-[var(--Foundation-White-white-300,#F5F5F5)]'
                                : 'rounded-[10px_10px_10px_0] bg-[#FFF] border-0'
                                }`}
                            >
                              {renderMessageAttachment(msg)}
                              {renderMessageContent(msg)}
                              <span className="text-[11px] text-slate-400 block mt-1">
                                {moment(msg.createdAt).format('h:mm A')}
                              </span>
                            </div>
                            {isModerated && (
                              <div
                                className="self-end mb-1 shrink-0 select-none cursor-pointer"
                                title={msg.moderation?.flagReason || "Flagged content"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path d="M5.0249 21C5.04385 19.2643 5.04366 17.5541 5.0366 15.9209M5.0366 15.9209C5.01301 10.4614 4.91276 5.86186 5.19475 4.04271C5.5611 1.67939 9.39301 3.82993 13.9703 5.59842L16.0328 6.48729C17.5508 7.1415 19.7187 8.30352 18.7662 9.66084C18.3738 10.22 17.56 10.8596 16.0575 11.567L5.0366 15.9209Z" stroke="#DA0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  );
                })}
                {isRecipientTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-14 italic mb-4">
                    <span className="flex gap-[3px]">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                    💬 {partnerUsername || recipientUser?.username || 'User'} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} className="h-3 shrink-0" aria-hidden="true" />
              </div>

              {/* Compose Area */}
              <div className="p-4 sm:px-5 sm:py-4 bg-[#f0f0f0] relative max-md:p-3 shrink-0">
                {attachment && (
                  <div className="flex items-center gap-3 mb-3 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-[6px] border border-slate-200 shadow-sm max-w-sm">
                    {attachment.type?.includes('image') || /\.(png|jpe?g|gif|webp|svg)/i.test(attachment.name) || attachment.url?.includes('/image/upload/') ? (
                      <div className="relative group flex-shrink-0">
                        <img
                          src={attachment.previewUrl || attachment.url}
                          alt="Preview"
                          className="w-16 h-16 rounded-[6px] object-cover border border-slate-300 shadow-xs"
                        />
                      </div>
                    ) : attachment.type?.includes('video') || /\.(mp4|webm|ogg|mov|mkv|avi)/i.test(attachment.name) || attachment.url?.includes('/video/upload/') ? (
                      <div className="w-16 h-16 bg-black rounded-[6px] overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-slate-300 shadow-xs">
                        <video src={attachment.previewUrl || attachment.url} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">▶</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-[6px] flex items-center justify-center font-bold text-xl flex-shrink-0">
                        📄
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{attachment.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Attachment'} • Ready to send
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      onClick={handleRemoveAttachment}
                      className="w-6 h-6 min-h-0 !p-0 text-slate-400 hover:text-red-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="Remove attachment from server"
                      aria-label="Remove attachment"
                    >
                      ✕
                    </Button>
                  </div>
                )}

                {!msgsError && (
                  <form
                    onSubmit={handleSend}
                    className="relative flex items-end gap-2 p-2 bg-white border border-gray-200 rounded-[6px] shadow-sm max-md:px-2 max-md:py-1.5 max-md:gap-1.5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileAttachmentChange}
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
                      disabled={isUploadingAttachment}
                      title="Attach file or image"
                      aria-label="Attach file or image"
                      icon={
                        isUploadingAttachment ? (
                          <Loader size={18} />
                        ) : (
                          <RiAddLine className="w-5 h-5" />
                        )
                      }
                    />


                    {/* Message Textarea */}
                    <textarea
                      ref={textareaRef}
                      placeholder="Message"
                      value={messageText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-sm py-1.5 px-1 min-h-[36px] max-h-32 overflow-y-auto scrollbar-hide scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={(!messageText.trim() && !attachment?.url) || isUploadingAttachment || mutation.isPending}
                      aria-label="Send message"
                      title="Send message"
                      className="w-[28px] h-[28px] rounded-[60px] bg-[var(--Foundation-Grey-grey-900,#1F1F1F)] hover:bg-[#111111] active:scale-95 disabled:opacity-30 disabled:hover:bg-[var(--Foundation-Grey-grey-900,#1F1F1F)] disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-sm mb-0.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 shrink-0"
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
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </main>

        <div className={`xl:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300 ease-in-out ${isRightSideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsRightSideOpen(false)}></div>

        {/* ── RIGHT: About This Contact ── */}
        {isValidId && (() => {
          if (!finalRecipientUser && isFetchingTargetUser) {
            return (
              <aside className={`w-[320px] min-w-[280px] xl:w-[340px] xl:min-w-[320px] h-full max-h-full min-h-0 border-l border-[rgba(0, 0, 0, 0.10)] bg-[#F8F8F8] overflow-y-auto overflow-x-hidden p-4 xl:p-5 flex flex-col shrink-0 box-border max-xl:fixed max-xl:top-0 max-xl:bottom-0 max-xl:right-0 max-xl:z-50 max-xl:shadow-2xl max-xl:h-full max-xl:flex max-xl:transform max-xl:transition-transform max-xl:duration-300 max-xl:ease-in-out max-sm:w-[85vw] max-sm:max-w-[340px] ${isRightSideOpen ? 'max-xl:translate-x-0' : 'max-xl:translate-x-full'}`}>
                <div className="flex flex-col gap-4">
                  <Skeleton className="w-full h-44 rounded-[6px]" />
                  <Skeleton className="w-full h-36 rounded-[6px]" />
                </div>
              </aside>
            );
          }

          if (!finalRecipientUser) return null;

          const displayedOrders = contactOrders.slice(0, 8);

          const formattedLanguages =
            Array.isArray(finalRecipientUser?.languages) && finalRecipientUser.languages.length > 0
              ? finalRecipientUser.languages
                .map((item: any) => (typeof item === 'string' ? item : item?.language || item?.lang || item?.name))
                .filter(Boolean)
                .join(', ')
              : '';


          const conversationMediaFiles: Array<{ name: string; sizeText: string | null; url: string }> = (messages || [])
            .flatMap((m: any) => {
              const items: Array<{ name: string; sizeText: string | null; url: string }> = [];
              const parseItem = (item: any) => {
                if (!item) return;
                if (typeof item === 'string' && item.trim().length > 0) {
                  const rawName =
                    m.attachment?.name ||
                    m.fileName ||
                    m.name ||
                    m.originalName ||
                    item.split('/').pop()?.split('?')[0] ||
                    'Attachment';
                  const fileName = formatFileNameWithExtension(rawName, item, null, m);
                  const rawSize = m.fileSize || m.size || m.bytes || m.attachment?.size;
                  items.push({
                    name: fileName,
                    sizeText: formatFileSize(rawSize),
                    url: item,
                  });
                } else if (typeof item === 'object' && (item.url || item.file || item.secure_url)) {
                  const url = item.url || item.file || item.secure_url;
                  if (typeof url === 'string' && url.trim().length > 0) {
                    const rawName =
                      item.name ||
                      item.fileName ||
                      item.original_filename ||
                      m.attachment?.name ||
                      m.fileName ||
                      m.name ||
                      url.split('/').pop()?.split('?')[0] ||
                      'Attachment';
                    const fileName = formatFileNameWithExtension(rawName, url, item, m);
                    const rawSize = item.sizeText || item.size || item.bytes || m.fileSize || m.size || m.attachment?.size;
                    items.push({
                      name: fileName,
                      sizeText: formatFileSize(rawSize),
                      url,
                    });
                  }
                }
              };
              if (m.file) parseItem(m.file);
              if (m.attachment && m.attachment.url && m.attachment.url !== m.file) parseItem(m.attachment);
              if (Array.isArray(m.attachments)) m.attachments.forEach(parseItem);
              return items;
            });

          const isImageFile = (file: { name: string; url: string }) => {
            const url = (file.url || '').toLowerCase();
            const name = (file.name || '').toLowerCase();

            // Check if PDF (never treat as image!)
            const isPdf =
              url.includes('format=pdf') ||
              url.includes('.pdf') ||
              name.endsWith('.pdf') ||
              /\.pdf($|[?#])/i.test(url);
            if (isPdf) return false;

            const isDoc =
              /\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)($|[?#])/i.test(url) ||
              /\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)$/i.test(name) ||
              /[?&]format=(docx?|xlsx?|pptx?|zip|rar|tar|gz|txt|csv)/i.test(url);
            if (isDoc) return false;

            const isVideo =
              /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)($|[?#])/i.test(url) ||
              /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)$/i.test(name) ||
              /[?&]format=(mp4|webm|ogg|mov)/i.test(url);
            if (isVideo) return false;

            return (
              /\.(png|jpe?g|gif|webp|svg|bmp|avif)($|[?#])/i.test(url) ||
              /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(name) ||
              /[?&]format=(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(url) ||
              (url.includes('cloudinary.com') && url.includes('/image/upload/') && !url.includes('pdf'))
            );
          };

          const handlePreviewMedia = (file: { name: string; url: string }) => {
            if (!file.url || file.url === '#') {
              toast.error('File URL is not available');
              return;
            }
            if (isImageFile(file)) {
              setLightboxImage(file.url);
            } else {
              window.open(file.url, '_blank', 'noopener,noreferrer');
            }
          };

          const handleDownloadMedia = async (file: { name: string; url: string }) => {
            if (file.url && file.url !== '#') {
              try {
                const res = await fetch(file.url);
                if (res.ok) {
                  const blob = await res.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = file.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(blobUrl);
                  return;
                }
              } catch {
                // Fallback to direct anchor if fetch blocked by CORS
              }
              const link = document.createElement('a');
              link.href = file.url;
              link.download = file.name;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              toast.success(`Downloading ${file.name}`);
            }
          };

          const renderOrderStatusBadge = (status: string) => {
            const normalized = (status || '').toLowerCase().replace(/[\s_-]/g, '');
            if (normalized === 'inprogress' || normalized === 'active' || normalized === 'pending') {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ede9fe] text-[#4f46e5] shrink-0">
                  Inprogress
                </span>
              );
            }
            if (normalized === 'delivered') {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ccfbf1] text-[#0f766e] shrink-0">
                  Delivered
                </span>
              );
            }
            if (normalized === 'completed') {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-[#15803d] shrink-0">
                  Completed
                </span>
              );
            }
            if (normalized === 'cancelled') {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ffe4e6] text-[#be123c] shrink-0">
                  Cancelled
                </span>
              );
            }
            return (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 shrink-0 capitalize">
                {status || 'Inprogress'}
              </span>
            );
          };

          return (
            <aside className={`w-[320px] min-w-[280px] xl:w-[340px] xl:min-w-[320px] h-full max-h-full min-h-0 border-l border-[rgba(0, 0, 0, 0.10)] bg-[#F8F8F8] overflow-y-auto overflow-x-hidden p-4 xl:p-5 flex flex-col shrink-0 box-border [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full max-xl:fixed max-xl:top-0 max-xl:bottom-0 max-xl:right-0 max-xl:z-50 max-xl:shadow-2xl max-xl:h-full max-xl:flex max-xl:transform max-xl:transition-transform max-xl:duration-300 max-xl:ease-in-out max-sm:w-[85vw] max-sm:max-w-[340px] ${isRightSideOpen ? 'max-xl:translate-x-0' : 'max-xl:translate-x-full'}`}>
              <div className="w-full flex flex-col gap-4 pb-20">
                {/* Mobile Drawer Top Bar */}
                <div className="xl:hidden flex items-center justify-between pb-3 border-b border-slate-200/80 -mt-1">
                  <span className="font-bold text-slate-900 text-base">Contact Details</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    radius="full"
                    className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                    onClick={() => setIsRightSideOpen(false)}
                    aria-label="Close sidebar"
                    icon={<RiCloseLine className="w-5 h-5" />}
                  />
                </div>

                {/* Top Segmented Controls: Profile | Media */}
                <div className="bg-[#f0f2f5] p-1 rounded-[6px] flex items-center border border-slate-200/70 shadow-xs">
                  <Button
                    type="button"
                    variant={contactSidebarTab === 'profile' ? 'dark' : 'ghost'}
                    size="sm"
                    radius="xl"
                    onClick={() => setContactSidebarTab('profile')}
                    className={`flex-1 py-2 text-sm font-semibold text-center ${contactSidebarTab === 'profile'
                      ? '!bg-[#0e3834] !text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Profile
                  </Button>
                  <Button
                    type="button"
                    variant={contactSidebarTab === 'media' ? 'dark' : 'ghost'}
                    size="sm"
                    radius="xl"
                    onClick={() => setContactSidebarTab('media')}
                    className={`flex-1 py-2 text-sm font-semibold text-center ${contactSidebarTab === 'media'
                      ? '!bg-[#0e3834] !text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Media
                  </Button>
                </div>

                {contactSidebarTab === 'profile' ? (
                  <>
                    {/* ── Quick Actions (Fiverr Style: Create Offer & Video Meeting - Mobile Drawer Only) ── */}
                    <div className="flex xl:hidden bg-white rounded-[6px] p-4 border border-slate-200/80 shadow-xs flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight">Quick Actions</span>
                        {/* {user?.isSeller && (
                          <span className="text-[10px] font-semibold text-[#0D6D5F] bg-[#0D6D5F]/10 px-2 py-0.5 rounded-full">
                            Seller Tools
                          </span>
                        )} */}
                      </div>

                      {user?.isSeller && (
                        <Button
                          type="button"
                          variant="brand"
                          size="md"
                          radius="fiverr"
                          fullWidth
                          onClick={() => {
                            setIsRightSideOpen(false);
                            setShowOfferModal(true);
                          }}
                          leftIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="12" y1="18" x2="12" y2="12"></line>
                              <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                          }
                          className="font-bold shadow-xs justify-center gap-2"
                        >
                          Create an Offer
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        radius="fiverr"
                        fullWidth
                        onClick={() => {
                          setIsRightSideOpen(false);
                          setMeetingTitle(`Job Discussion with @${finalRecipientUser?.username || 'Client'}`);
                          setShowMeetingModal(true);
                        }}
                        leftIcon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 4H10C13.3 4 15 4 16 5C17 6 17 7.7 17 11V13C17 16.3 17 18 16 19C15 20 13.3 20 10 20H9C5.7 20 4 20 3 19C2 18 2 16.3 2 13V11C2 7.7 2 6 3 5C4 4 5.7 4 9 4Z" />
                            <path d="M17 8.9L17.13 8.8C19.24 7.06 20.3 6.18 21.15 6.6C22 7.03 22 8.42 22 11.22V12.78C22 15.58 22 16.97 21.15 17.4C20.3 17.82 19.24 16.94 17.13 15.2L17 15.1" />
                          </svg>
                        }
                        className="font-semibold text-slate-700 hover:text-slate-900 justify-center shadow-2xs"
                      >
                        Start Video Meeting
                      </Button>
                    </div>

                    {/* ── Card 1: About Contact ── */}
                    <div className="bg-white rounded-[6px] p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3 relative">
                      <h3 className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight">
                        About {finalRecipientUser.username || finalRecipientUser.name || 'Contact'}
                      </h3>

                      {/* Avatar & Contact Info */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="relative shrink-0">
                          <img
                            src={getAvatarUrl(finalRecipientUser?.image || finalRecipientUser?.img || finalRecipientUser?.avatar || '/media/noavatar.png')}
                            alt={finalRecipientUser.username || 'Contact'}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-slate-100 shadow-xs"
                          />
                          {isRecipientOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                              {finalRecipientUser.name || finalRecipientUser.username || 'User'}
                            </span>
                            <span className="bg-[#4c1d95] text-white text-[10px] font-bold px-2 py-1 rounded-[6px] leading-none tracking-wide">
                              {finalRecipientUser.badge || (finalRecipientUser.isSeller ? 'Seller' : 'Buyer')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">@{finalRecipientUser.username}</span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 flex-wrap">
                            {(finalRecipientUser.shortTitle || finalRecipientUser.occupation || finalRecipientUser.title) && (
                              <span className="font-medium text-slate-600">
                                {finalRecipientUser.shortTitle || finalRecipientUser.occupation || finalRecipientUser.title}
                              </span>
                            )}
                            {(finalRecipientUser.rating || finalRecipientUser.sellerRating) ? (
                              <>
                                <span className="font-bold text-slate-900 ml-1">
                                  {finalRecipientUser.rating || finalRecipientUser.sellerRating}
                                </span>
                                <RiStarFill className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 -mt-0.5" />
                                <span className="text-slate-400 font-normal">
                                  ({finalRecipientUser.reviewCount || finalRecipientUser.totalReviews || 0})
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {finalRecipientUser.createdAt && (
                        <>
                          <div className="border-t border-slate-100 my-1" />
                          <div className="text-xs text-slate-500 font-normal">
                            Member Since,{' '}
                            <span className="font-bold text-slate-900">
                              {moment(finalRecipientUser.createdAt).format('MMM YYYY')}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-0.5" />

                      {/* Details: Status, From & Language */}
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="grid grid-cols-[75px_1fr] items-center">
                          <span className="text-slate-500">Status</span>
                          <span className="text-slate-800 font-medium">
                            {isRecipientOnline ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                Online
                              </span>
                            ) : recipientLastSeenText ? (
                              <span>Last seen {recipientLastSeenText}</span>
                            ) : (
                              'Offline'
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-[75px_1fr] items-center">
                          <span className="text-slate-500">From</span>
                          <span className="text-slate-800 font-medium">
                            {finalRecipientUser.country || 'Not specified'}
                          </span>
                        </div>
                        <div className="grid grid-cols-[75px_1fr] items-start">
                          <span className="text-slate-500">Language</span>
                          <span className="text-slate-800 font-medium leading-relaxed">
                            {formattedLanguages || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {/* Analysis Seller Profile CTA */}
                      <div className="pt-2">
                        <AiGradientButton
                          onClick={() => {
                            const targetId = finalRecipientUser._id || finalRecipientUser.id;
                            if (targetId) {
                              navigate.push(`/seller/${targetId}`);
                            } else {
                              toast.success('AI Profile Analysis: Verified user profile.');
                            }
                          }}
                          className="w-full text-[16px] font-semibold py-3 rounded-[6px] shadow-xs"
                          text="View Profile"
                          icon={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square shrink-0"
                            >
                              <path
                                d="M19.5 3.9375V5.5M19.5 5.5V7.0625M19.5 5.5H18.25M19.5 5.5H20.75M22 5.5L20.9156 5.13852C20.4179 4.97263 20.0274 4.58211 19.8615 4.08443L19.5 3L19.1385 4.08443C18.9726 4.58211 18.5821 4.97263 18.0844 5.13852L17 5.5L18.0844 5.86148C18.5821 6.02737 18.9726 6.41789 19.1385 6.91557L19.5 8L19.8615 6.91557C20.0274 6.41789 20.4179 6.02737 20.9156 5.86148L22 5.5Z"
                                stroke="#292929"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 12.8598C4.81875 10.0939 11.44 4.44198 13.275 6.40609C15.5938 8.888 3.40937 15.1646 5.28854 17.93C7.2734 20.851 14.2146 10.5543 16.5635 12.3982C18.9125 14.2422 10.926 18.391 12.8052 20.696C13.5569 21.6179 15.6239 20.235 16.5635 19.313"
                                stroke="#292929"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          }
                        />
                      </div>
                    </div>

                    {/* ── Card 2: Order History ── */}
                    <div className="bg-white rounded-[6px] p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
                      <div
                        className="flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                      >
                        <h3 className="text-base sm:text-[17px] font-bold text-slate-800">Order History</h3>
                        <RiArrowDownSLine
                          className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${isOrdersExpanded ? '' : '-rotate-90'
                            }`}
                        />
                      </div>

                      {isOrdersExpanded && (
                        <>
                          {displayedOrders.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400">
                              No order history yet
                            </div>
                          ) : (
                            <div className="flex flex-col divide-y divide-slate-100 pt-1">
                              {displayedOrders.map((order: any, idx: number) => (
                                <div
                                  key={order._id || idx}
                                  className="flex items-center justify-between py-2.5 gap-2 cursor-pointer hover:bg-slate-50/80 rounded-[6px] px-1 transition-colors group"
                                  onClick={() => {
                                    if (order._id) {
                                      navigate.push(`/orders/${order._id}`);
                                    } else {
                                      navigate.push('/orders');
                                    }
                                  }}
                                >
                                  <span
                                    className="text-xs text-slate-600 font-normal truncate flex-1 group-hover:text-slate-900 transition-colors"
                                    title={order.title}
                                  >
                                    {order.title || `Order #${String(order._id || idx).substring(0, 8)}`}
                                  </span>
                                  {renderOrderStatusBadge(order.status)}
                                </div>
                              ))}
                            </div>
                          )}

                          {displayedOrders.length > 0 && (
                            <Button
                              type="button"
                              variant="soft"
                              size="sm"
                              radius="xl"
                              fullWidth
                              className="mt-2 py-2.5 bg-[#f1f3f5] hover:bg-[#e4e7eb] text-[#292929] font-semibold text-[16px] text-center"
                              onClick={() => {
                                const targetUserId =
                                  finalRecipientUser?._id ||
                                  finalRecipientUser?.id ||
                                  recipientUser?._id ||
                                  recipientUser?.id;
                                if (targetUserId) {
                                  navigate.push(`/orders/contact/${targetUserId}`);
                                } else {
                                  navigate.push(user?.isSeller ? '/manage-orders' : '/orders');
                                }
                              }}
                            >
                              View all
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  /* ── MEDIA TAB ── */
                  <div className="flex flex-col gap-2.5 pt-0.5">
                    {conversationMediaFiles.length > 0 ? (
                      conversationMediaFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-[16px] px-4 py-3.5 flex items-center justify-between border border-slate-100/90 shadow-2xs hover:border-slate-200 transition-all group"
                        >
                          <div
                            className="min-w-0 flex-1 pr-3 cursor-pointer"
                            onClick={() => {
                              if (isImageFile(file)) {
                                handlePreviewMedia(file);
                              } else {
                                handleDownloadMedia(file);
                              }
                            }}
                            title={isImageFile(file) ? `Preview ${file.name}` : `Download ${file.name}`}
                          >
                            <h4
                              className="font-bold text-gray-950 text-[13.5px] leading-tight truncate font-sf-pro group-hover:text-[#0E3834] transition-colors"
                              title={file.name}
                            >
                              {file.name}
                            </h4>
                            {file.sizeText ? (
                              <span className="text-xs text-gray-400 font-normal mt-1 block">
                                {file.sizeText}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isImageFile(file) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                radius="xl"
                                onClick={() => handlePreviewMedia(file)}
                                className="w-10 h-10 rounded-[12px] border border-[#E5E7EB] hover:border-[#0E3834] hover:bg-slate-50 text-[#5F71B0] hover:text-[#0E3834] transition-all shrink-0 shadow-2xs active:scale-95"
                                title={`Preview ${file.name}`}
                                aria-label={`Preview ${file.name}`}
                                icon={<Eye className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                              />
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              radius="xl"
                              onClick={() => handleDownloadMedia(file)}
                              className="w-10 h-10 rounded-[12px] border border-[#E5E7EB] hover:border-[#0E3834] hover:bg-slate-50 text-[#5F71B0] hover:text-[#0E3834] transition-all shrink-0 shadow-2xs active:scale-95"
                              title={`Download ${file.name}`}
                              aria-label={`Download ${file.name}`}
                              icon={<Download className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-[16px] p-6 text-center border border-slate-100/90 shadow-2xs">
                        <p className="text-xs text-slate-400 font-normal m-0">No media shared yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>
          );
        })()}
      </div>

      {/* Custom Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity" onClick={() => setShowOfferModal(false)}>
          <div className="bg-white w-[92%] max-w-[460px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden rounded-[6px] shadow-2xl border border-slate-100 max-md:w-[96%] max-md:max-h-[95vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
              <h3 className="text-[15px] font-bold text-slate-900 m-0">Create Custom Offer</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1"
                aria-label="Close modal"
              >
                &times;
              </Button>
            </div>
            <form onSubmit={handleOfferSubmit} className="p-5 flex flex-col gap-3.5 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Package Reference <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                <select
                  value={selectedPackageId}
                  onChange={e => setSelectedPackageId(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                >
                  <option value="">-- Select one of your Packages --</option>
                  {sellerPackages.map((g: any) => <option key={g._id || g.id} value={g._id || g.id}>{g.title}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Project Reference <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                <select
                  value={selectedBriefId}
                  onChange={e => setSelectedBriefId(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                >
                  <option value="">-- Select a Project --</option>
                  {chatBriefs.length === 0
                    ? <option disabled>No projects available for this chat</option>
                    : chatBriefs.map((b: any) => <option key={b._id} value={b._id}>{b.title} — ${b.budget}</option>)
                  }
                </select>
              </div>
              {!selectedPackageId && !selectedBriefId && (
                <p className="text-amber-600 text-xs mt-0.5">⚠ Please select at least a Package or a Project</p>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Offer Description</label>
                <textarea
                  placeholder="Describe the service…"
                  value={offerDesc}
                  onChange={e => setOfferDesc(e.target.value)}
                  rows={3}
                  required
                  className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white resize-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Price (USD)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                    required
                    min="1"
                    className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Delivery (Days)</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={offerDelivery}
                    onChange={e => setOfferDelivery(e.target.value)}
                    required
                    min="1"
                    className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Revisions</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={offerRevisions}
                    onChange={e => setOfferRevisions(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 mt-2">
                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  className="flex-1 font-bold"
                >
                  Send Offer
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  className="flex-1 font-semibold border border-slate-200"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Meeting Creation Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => !isCreatingMeeting && setShowMeetingModal(false)}>
          <div className="w-[92%] max-w-md p-6 bg-white rounded-[6px] shadow-2xl border border-slate-100 max-h-[calc(100vh-40px)] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[6px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                  <RiVideoChatLine className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create Video Meeting</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                disabled={isCreatingMeeting}
                onClick={() => setShowMeetingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold"
                aria-label="Close modal"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Meeting Topic / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Freelancer Job Discussion"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[6px] border border-slate-200 text-sm focus:outline-none focus:border-brand-green bg-slate-50/50"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  A dedicated video room will be created and instantly sent to the buyer in this chat.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  disabled={isCreatingMeeting}
                  isLoading={isCreatingMeeting}
                  leftIcon={<RiVideoChatLine className="w-4 h-4" />}
                  className="flex-1 font-semibold shadow-sm"
                >
                  Create & Send Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  radius="fiverr"
                  disabled={isCreatingMeeting}
                  onClick={() => setShowMeetingModal(false)}
                  className="font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Proposal Details Modal */}
      {viewingOfferDetails && (() => {
        const targetMsg = (messages || []).find((m: any) => String(m._id || m.id) === String(viewingOfferDetails.msgId));
        const isOfferWithdrawn = Boolean(
          viewingOfferDetails.isWithdrawn ||
          targetMsg?.withdrawn ||
          targetMsg?.offerStatus === 'withdrawn'
        );

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setViewingOfferDetails(null)}
          >
            <div
              className="bg-white rounded-[6px] border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Custom Proposal Details</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  radius="full"
                  onClick={() => setViewingOfferDetails(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-lg"
                  aria-label="Close modal"
                >
                  ✕
                </Button>
              </div>

              {isOfferWithdrawn && (
                <div className="w-full flex items-center gap-2 bg-red-50 text-red-700 border border-red-200/80 rounded-[6px] px-3.5 py-2.5 text-xs font-semibold">
                  ↩ This offer was withdrawn by the seller.
                </div>
              )}

              <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-200/60 rounded-[6px] p-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Price</span>
                  <span className="text-2xl font-bold text-emerald-700">${viewingOfferDetails.offer?.price}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Revisions</span>
                  <span className="text-base font-bold text-slate-800">
                    {parseRevisionNumber(viewingOfferDetails.offer?.revision ?? viewingOfferDetails.offer?.revisions, 0) === 1
                      ? "1 Revision"
                      : `${parseRevisionNumber(viewingOfferDetails.offer?.revision ?? viewingOfferDetails.offer?.revisions, 0)} Revisions`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Delivery Time</span>
                  <span className="text-base font-bold text-slate-800">{viewingOfferDetails.offer?.delivery} Days</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Description</h4>
                <div className="bg-slate-50 border border-slate-200/70 rounded-[6px] p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {renderMessageTextWithLinks(viewingOfferDetails.offer?.desc || 'No description provided.')}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                {viewingOfferDetails.acceptedOrder ? (
                  <Button
                    variant="brand"
                    size="md"
                    radius="fiverr"
                    className="flex-1 font-bold shadow-sm"
                    onClick={() => {
                      const orderId = typeof viewingOfferDetails.acceptedOrder === 'string' ? viewingOfferDetails.acceptedOrder : viewingOfferDetails.acceptedOrder?._id;
                      setViewingOfferDetails(null);
                      if (orderId && orderId !== true) navigate.push(`/orders/${orderId}`);
                      else navigate.push('/orders');
                    }}
                  >
                    View Order
                  </Button>
                ) : isOfferWithdrawn ? (
                  <Button
                    disabled
                    variant="outline"
                    size="md"
                    radius="fiverr"
                    className="flex-1 font-semibold text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed select-none"
                  >
                    Withdrawn
                  </Button>
                ) : (
                  <>
                    {!viewingOfferDetails.isOwner && (
                      <Button
                        variant="brand"
                        size="md"
                        radius="fiverr"
                        className="flex-1 font-bold shadow-sm"
                        onClick={() => {
                          const offer = viewingOfferDetails.offer;
                          setViewingOfferDetails(null);
                          handleAcceptOffer(offer);
                        }}
                      >
                        Accept & Proceed to Checkout
                      </Button>
                    )}
                    {viewingOfferDetails.isOwner && (
                      <Button
                        variant="danger"
                        size="md"
                        radius="fiverr"
                        className="flex-1 font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        onClick={() => {
                          const msgId = viewingOfferDetails.msgId;
                          setViewingOfferDetails(null);
                          handleWithdraw(msgId);
                        }}
                      >
                        Withdraw Proposal
                      </Button>
                    )}
                  </>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  radius="fiverr"
                  className="font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
                  onClick={() => setViewingOfferDetails(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Enlarged preview" className="max-w-full max-h-[90vh] object-contain rounded-[6px] shadow-2xl" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 text-white bg-black/60 hover:bg-black/90 w-8 h-8 font-bold"
              aria-label="Close preview"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;