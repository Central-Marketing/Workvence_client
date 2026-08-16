// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RiSearchLine,
  RiCheckboxCircleFill,
  RiStarFill,
  RiPhoneLine,
  RiMore2Fill,
  RiCheckDoubleLine,
  RiAddLine,
  RiEmotionLine,
  RiSendPlaneFill,
  RiTimeLine,
  RiRefreshLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine,
  RiMenuLine,
  RiInformationLine,
  RiCloseLine
} from "react-icons/ri";

import axios from 'axios';
import { axiosFetch, socket, getAvatarUrl } from "@/utils";
import supportService from "@/utils/supportService";
import { getOtherUser, isConversationUnread, isTargetConversation, renderMessageTextWithLinks } from '@/utils/chatHelpers';
import { useUserStore } from "@/store/userStore";
import { Loader, ChatSkeleton, Skeleton } from "@/components";
import moment from 'moment';
import "./Message.scss";

const Message = () => {
  const user = useUserStore((state: any) => state.user);
  const params = useParams();
  const conversationID = (params?.id || params?.conversationID) as string;
  const isValidId = Boolean(conversationID && conversationID !== 'undefined' && conversationID !== 'null');
  const queryClient = useQueryClient();
  const navigate = useRouter();
  const messagesEndRef = useRef(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [convSearchQuery, setSearchTerm] = useState("");
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [isMsgSearchActive, setIsMsgSearchActive] = useState(false);
  const [isLeftSideOpen, setIsLeftSideOpen] = useState(false);
  const [isRightSideOpen, setIsRightSideOpen] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const isSendingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useRef(user);
  const convIdRef = useRef(conversationID);
  const activeConvRef = useRef<any>(null);
  const recipientTypingTimerRef = useRef<any>(null);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { convIdRef.current = conversationID; }, [conversationID]);

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
        console.warn("Failed to delete attachment from CDN:", err);
      }
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

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
        navigate.push(`/message/${firstId}`, { replace: true });
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

      // 2. Patch backend
      axiosFetch.patch(`/conversations/${conversationID}/mark-read`)
        .then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))
        .catch(console.error);
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
              lastMessage: newMsg.description,
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

  // Fetch messages history for active conversation (1-time initial fetch, 0 polling)
  const { isLoading: msgsLoading, isError: msgsError, error: msgsQueryError, data: messages = [] } = useQuery({
    queryKey: ['messages', conversationID],
    queryFn: async () => {
      const { data } = await axiosFetch.get(`/conversations/${conversationID}/messages`);
      if (Array.isArray(data)) return data;
      if (data?.data?.messages) return data.data.messages;
      if (data?.messages) return data.messages;
      return [];
    },
    enabled: isValidId,
    retry: false,
    staleTime: 60000,
    refetchInterval: false
  });

  // Manage room subscription & realtime events for active conversation
  useEffect(() => {
    if (!isValidId) return;

    const joinRoom = () => {
      socket.emit('join_conversation', conversationID);
      socket.emit('join_room', conversationID);
      socket.emit('join', conversationID);
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

      const incomingId = String(data?.conversationUUID || data?.conversationID || data?.uuid || data?.id || data?.conversation || '').trim();
      if (!incomingId || incomingId === 'undefined') return false;

      const currentParamId = String(convIdRef.current || '').trim();
      if (currentParamId && incomingId === currentParamId) return true;

      const convDoc = activeConvRef.current;
      if (convDoc) {
        if (convDoc.uuid && incomingId === String(convDoc.uuid).trim()) return true;
        if (convDoc.conversationID && incomingId === String(convDoc.conversationID).trim()) return true;
        if (convDoc._id && incomingId === String(convDoc._id).trim()) return true;
      }
      return false;
    };

    const handleReceiveMessage = (newMsg: any) => {
      const isForCurrent = isEventForCurrentChat(newMsg, false);

      // 1. If message belongs to current open chat, append to messages list
      if (isForCurrent) {
        queryClient.setQueryData(['messages', conversationID], (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          if (arr.some((m: any) => String(m._id) === String(newMsg._id))) return arr;

          // Replace matching temp message or remove temp- messages
          const withoutTemp = arr.filter((m: any) => {
            if (typeof m._id === 'string' && m._id.startsWith('temp-')) {
              return m.description !== newMsg.description;
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
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, incomingCid)) {
            return {
              ...c,
              lastMessage: newMsg.description,
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
    enabled: isValidId && conversations.length > 0 && !conversations.some((c: any) => isTargetConversation(c, conversationID)),
    staleTime: 30000
  });

  const activeConversation =
    activeConvData ||
    conversations.find((c: any) => isTargetConversation(c, conversationID));

  const recipientUser = getOtherUser(activeConversation, user);

  // If conversation room isn't populated yet, attempt fallback recipient resolution from 48-char ID
  const fallbackRecipientId =
    !recipientUser && conversationID?.length === 48
      ? conversationID.substring(0, 24) === String(user?._id || user?.id)
        ? conversationID.substring(24)
        : conversationID.substring(0, 24)
      : null;

  const { data: fallbackUser } = useQuery({
    queryKey: ['user-fallback', fallbackRecipientId],
    queryFn: () => axiosFetch.get(`/users/${fallbackRecipientId}`).then(({ data }) => data).catch(() => null),
    enabled: !recipientUser && !!fallbackRecipientId
  });

  const finalRecipientUser = recipientUser || fallbackUser;

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);



  const contactOrders = allOrders.filter((o: any) => {
    const sId = o.sellerID?._id || o.sellerID;
    const bId = o.buyerID?._id || o.buyerID;
    return (sId === user._id || bId === user._id) &&
      (sId === recipientUser?._id || bId === recipientUser?._id);
  });

  const mutation = useMutation({
    mutationFn: (msg: any) => axiosFetch.post(`/conversations/${conversationID}/messages`, msg),
    onMutate: async (newMsg: any) => {
      // Optimistically update the conversations list with the new lastMessage and correct read status
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        const incomingCid = String(newMsg?.conversationUUID || newMsg?.conversationID || newMsg?.uuid || newMsg?.id || conversationID || '').trim();
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, incomingCid)) {
            return {
              ...c,
              lastMessage: newMsg.description,
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
      const savedMsg = res?.data?.data || res?.data;
      if (savedMsg && savedMsg._id) {
        queryClient.setQueryData(['messages', conversationID], (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          if (arr.some((m: any) => m._id === savedMsg._id)) return arr;
          const withoutTemp = arr.filter((m: any) => typeof m._id === 'string' && !m._id.startsWith('temp-'));
          return [...withoutTemp, savedMsg];
        });
      }
    }
  });

  const activeRoomID = activeConversation?.uuid || activeConversation?.conversationID || activeConversation?._id || (conversationID !== 'undefined' ? conversationID : null);

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
    clearTimeout(typingTimeoutRef.current);
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
      conversationID,
      userID: {
        _id: user?._id || user?.id,
        username: user?.username || 'User',
        image: getAvatarUrl(user?.image, user?.username || 'User')
      },
      description: currentText,
      file: currentAttachment?.url || null,
      attachments: currentAttachment?.url ? [currentAttachment.url] : [],
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(['messages', conversationID], (oldData: any = []) => {
      const arr = Array.isArray(oldData) ? oldData : [];
      return [...arr, tempMessage];
    });

    const msgPayload = {
      conversationID,
      description: currentText,
      file: currentAttachment?.url || null,
      attachments: currentAttachment?.url ? [currentAttachment.url] : [],
      userID: user?._id || user?.id,
      isSeller: Boolean(user?.isSeller)
    };

    // 2. Perform DB save & single automatic WebSocket broadcast via HTTP mutation
    mutation.mutate(msgPayload, {
      onSettled: () => {
        isSendingRef.current = false;
      }
    });
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
      clearTimeout(typingTimeoutRef.current);
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
      sellerID: user._id
    };
    if (selectedPackageId) payload.packageID = selectedPackageId;
    if (selectedBriefId) payload.briefID = selectedBriefId;

    mutation.mutate({ conversationID, description: `[CUSTOM_OFFER]${JSON.stringify(payload)}` });
    setSelectedPackageId(""); setSelectedBriefId(""); setOfferDesc(""); setOfferPrice(""); setOfferDelivery("");
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer) => {
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

  const handleWithdraw = async (msgId) => {
    try {
      await axiosFetch.patch(`/messages/withdraw/${msgId}`);
      toast.success("Offer withdrawn.");
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
    } catch { toast.error("Failed to withdraw."); }
  };

  const parseOffer = (desc) => {
    if (desc?.startsWith('[CUSTOM_OFFER]')) {
      try { return JSON.parse(desc.replace('[CUSTOM_OFFER]', '')); } catch { return null; }
    }
    return null;
  };

  const fmt = (d) => moment(d).format('MMM DD, HH:mm');

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
    if (!convSearchQuery) return true;
    const contact = getOtherUser(conv, user);
    const searchLower = convSearchQuery.toLowerCase();
    const username = (contact?.username || '').toLowerCase();
    const lastMsg = (conv.lastMessage || '').toLowerCase();
    return username.includes(searchLower) || lastMsg.includes(searchLower);
  });

  const filteredMessages = messages.filter((msg: any) => {
    if (!msgSearchQuery) return true;
    return msg.description?.toLowerCase().includes(msgSearchQuery.toLowerCase());
  });

  const renderMessageAttachment = (msg: any) => {
    const fileUrl = msg.file || (Array.isArray(msg.attachments) && msg.attachments[0]) || null;
    if (!fileUrl) return null;

    const isImage =
      /\.(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(fileUrl) ||
      fileUrl.includes('/image/upload/') ||
      (fileUrl.includes('cloudinary.com') && fileUrl.includes('/image/')) ||
      msg.fileType?.includes('image');

    if (isImage) {
      return (
        <div className="my-1.5 overflow-hidden rounded-lg border border-slate-200 shadow-sm max-w-[280px]">
          <img
            src={fileUrl}
            alt="Attachment"
            className="w-full max-h-[220px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setLightboxImage(fileUrl)}
          />
        </div>
      );
    }

    const isVideo =
      /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)/i.test(fileUrl) ||
      fileUrl.includes('/video/upload/') ||
      (fileUrl.includes('cloudinary.com') && fileUrl.includes('/video/')) ||
      msg.fileType?.includes('video');

    if (isVideo) {
      return (
        <div className="my-1.5 overflow-hidden rounded-xl border border-slate-200 shadow-sm max-w-[340px] bg-black">
          <video
            src={fileUrl}
            controls
            preload="metadata"
            className="w-full max-h-[280px] rounded-xl object-contain"
          />
        </div>
      );
    }

    const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'Attachment';

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="flex items-center gap-2 px-3 py-2 my-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-200 transition-colors border text-xs font-medium"
      >
        <span className="text-base">📄</span>
        <span className="truncate max-w-[180px]">{fileName}</span>
        <span className="ml-auto text-slate-400">⬇️</span>
      </a>
    );
  };

  if (convsLoading && conversations.length === 0) {
    return <ChatSkeleton />;
  }

  return (
    <div className="message-page">
      <div className="inbox-layout">

        <div className={`md:hidden fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 ease-in-out ${isLeftSideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsLeftSideOpen(false)}></div>

        {/* ── LEFT: Conversation List ── */}
        <aside className={`conversation-list transform transition-transform duration-300 ease-in-out max-md:absolute max-md:z-40 max-md:w-[320px] max-md:h-full max-md:shadow-xl max-md:!flex ${isLeftSideOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>
          <div className="inbox-header">
            <div className="search-bar">
              <RiSearchLine className="search-icon" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={convSearchQuery}
                onChange={(e) => setConvSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="conv-items">
            {convsLoading ? (
              <div className="list-loader"><Loader size={28} /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="list-empty">{convSearchQuery ? "No conversations found" : "No conversations yet"}</div>
            ) : filteredConversations.map((conv: any) => {
              const isUnread = isConversationUnread(conv, user);
              const contact = getOtherUser(conv, user);
              const lastMsg = conv.lastMessage?.startsWith('[CUSTOM_OFFER]')
                ? '📋 Custom Offer'
                : conv.lastMessage || 'No messages yet';
              const canonicalId = conv.uuid || conv.conversationID || conv._id || conv.id;
              const isActive = isTargetConversation(conv, conversationID);
              return (
                <div
                  key={conv._id || canonicalId}
                  className={`conv-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                  onClick={() => {
                    navigate.push(`/message/${canonicalId}`);
                    setIsLeftSideOpen(false);
                  }}
                >
                  <div className="conv-avatar">
                    <img src={contact?.image || '/media/noavatar.png'} alt="" />
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">
                      {contact?.username || 'User'}
                      <RiCheckboxCircleFill className="verified-badge" />
                    </div>
                    <p className="conv-preview">{lastMsg}</p>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{moment(conv.updatedAt).format('HH:mm')}</span>
                    <div className="conv-meta-icons">
                      <RiStarFill className="star-icon" />
                      {isUnread && <span className="unread-dot"></span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER: Chat Window ── */}
        <main className="chat-window">
          {!conversationID ? (
            <div className="chat-empty-state">
              <div className="empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose from your inbox on the left to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-head max-md:px-3.5 max-md:py-2.5">
                <button className="md:hidden mr-3 text-slate-500 text-xl flex-shrink-0" onClick={() => setIsLeftSideOpen(true)}>
                  <RiMenuLine />
                </button>
                {finalRecipientUser ? (
                  <>
                    <div className="head-user flex-1 cursor-pointer" onClick={() => setIsRightSideOpen(true)}>
                      <div className="head-avatar">
                        <img src={finalRecipientUser.image || '/media/noavatar.png'} alt="" />
                      </div>
                      <div className="head-info">
                        <h3>{finalRecipientUser.username}</h3>
                        <span className="head-status font-medium">
                          {isRecipientTyping ? (
                            <span className="text-brand-green font-semibold animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span> typing...
                            </span>
                          ) : (
                            "Active Contact"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="head-actions">
                      {isMsgSearchActive ? (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '20px', padding: '2px 10px' }}>
                          <input
                            type="text"
                            placeholder="Search in chat..."
                            value={msgSearchQuery}
                            onChange={(e) => setMsgSearchQuery(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px', width: '150px' }}
                            autoFocus
                          />
                          <button className="action-icon" onClick={() => { setIsMsgSearchActive(false); setMsgSearchQuery(''); }} style={{ margin: 0, padding: 0, fontSize: '18px' }}>&times;</button>
                        </div>
                      ) : (
                        <button className="action-icon" onClick={() => setIsMsgSearchActive(true)}><RiSearchLine /></button>
                      )}
                      <button className="lg:hidden action-icon ml-1" onClick={() => setIsRightSideOpen(true)}><RiInformationLine /></button>
                    </div>
                  </>
                ) : <h3>Conversation</h3>}
              </div>
              {/* Messages */}
              <div className="messages-scroll">
                {msgsError ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 m-6 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm">
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
                        <Skeleton className="w-48 h-12 rounded-2xl rounded-tl-none" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                    <div className="flex gap-3 max-w-md ml-auto flex-row-reverse">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="space-y-2 flex flex-col items-end">
                        <Skeleton className="w-64 h-16 rounded-2xl rounded-tr-none" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                    <div className="flex gap-3 max-w-md">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="w-36 h-10 rounded-2xl rounded-tl-none" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="scroll-empty">{msgSearchQuery ? "No messages found" : "Send the first message!"}</div>
                ) : filteredMessages.map((msg: any, index: number) => {
                  const senderObj = msg.senderID || msg.userID;
                  const senderIdStr = String(senderObj?._id || senderObj?.id || senderObj || '');
                  const currentUserIdStr = String(user?._id || user?.id || '');
                  const isOwner = currentUserIdStr !== '' && senderIdStr === currentUserIdStr;
                  const offer = msg.isCustomOffer || msg.description?.startsWith('[CUSTOM_OFFER]') ? parseOffer(msg.description) : null;
                  const isOfferAccepted = Boolean(msg.isOfferAccepted || msg.offerStatus === 'accepted');
                  const isWithdrawn = Boolean(msg.withdrawn || msg.offerStatus === 'withdrawn');
                  const acceptedOrder = offer ? contactOrders.find((o: any) => (msg.orderID && (o._id === msg.orderID || o.id === msg.orderID)) || (o.title === offer.desc && Number(o.price) === Number(offer.price))) : null;
                  const targetOrderId = msg.orderID || acceptedOrder?._id || acceptedOrder?.id;
                  const isAccepted = isOfferAccepted || Boolean(acceptedOrder);

                  const msgDate = moment(msg.createdAt).format('MMM DD');
                  const prevMsgDate = index > 0 ? moment(filteredMessages[index - 1].createdAt).format('MMM DD') : null;
                  const showDateDivider = msgDate !== prevMsgDate;

                  return (
                    <div key={msg._id || msg.id} className="msg-wrapper">
                      {showDateDivider && (
                        <div className="date-separator">
                          <span className="date-pill">{msgDate === moment().format('MMM DD') ? 'Today' : msgDate}</span>
                        </div>
                      )}
                      <div className={`msg-row max-md:max-w-[85%] ${isOwner ? 'msg-owner' : 'msg-other'} ${offer ? 'has-offer !max-w-[95%] xl:!max-w-[85%]' : ''}`}>
                        {!isOwner && (
                          <img className="msg-avatar" src={senderObj?.image || finalRecipientUser?.image || '/media/noavatar.png'} alt="" />
                        )}

                        {offer ? (
                          <div className={`offer-card max-md:p-3.5 ${isWithdrawn ? 'withdrawn' : ''}`}>
                            {isWithdrawn ? (
                              <p className="withdrawn-text">↩ This offer was withdrawn by the seller.</p>
                            ) : (
                              <div className="offer-content flex flex-col w-full">
                                {isAccepted && (
                                  <div className="flex items-center justify-between gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl px-3.5 py-1.5 text-xs font-bold mb-2.5">
                                    <span>✓ Custom Proposal Accepted</span>
                                    {targetOrderId && (
                                      <span className="text-[11px] font-mono text-emerald-700">Order #{String(targetOrderId).slice(-6)}</span>
                                    )}
                                  </div>
                                )}

                                <div className="flex justify-between items-start mb-2 gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-bold text-slate-900 leading-tight mb-1.5">Custom Proposal</h4>
                                    {(() => {
                                      const isExpanded = Boolean(expandedProposalIds[msg._id || msg.id]);
                                      const descText = offer.desc || 'No description provided.';
                                      const isLongDesc = descText.length > 80;

                                      return (
                                        <div className="text-sm text-slate-700">
                                          <p className={isExpanded ? "whitespace-pre-wrap leading-relaxed text-slate-800" : "line-clamp-2 text-slate-600"}>
                                            {renderMessageTextWithLinks(descText)}
                                          </p>
                                          {isLongDesc && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleProposalExpand(msg._id || msg.id);
                                              }}
                                              className="text-xs font-bold text-brand-green hover:underline mt-1 cursor-pointer inline-flex items-center gap-1"
                                            >
                                              {isExpanded ? "See less ▲" : "... See more ▼"}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div className="text-xl sm:text-2xl font-black text-slate-900 shrink-0 whitespace-nowrap flex-shrink-0">${offer.price}</div>
                                </div>

                                <div className="flex items-center gap-5 py-3 border-y border-slate-100 my-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                    <RiTimeLine className="text-slate-400 text-lg" />
                                    <span className="font-semibold">{offer.delivery} Days Delivery</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 w-full mt-1">
                                  {isAccepted ? (
                                    <button
                                      className="flex-1 py-2 px-3 rounded-lg font-bold text-sm bg-brand-green text-white hover:brightness-95 transition-all text-center"
                                      onClick={() => {
                                        if (targetOrderId) navigate.push(`/orders/${targetOrderId}`);
                                        else navigate.push('/orders');
                                      }}
                                    >
                                      View Order
                                    </button>
                                  ) : (
                                    <>
                                      {!isOwner && (
                                        <button className="flex-1 py-2 px-3 rounded-lg font-bold text-sm bg-brand-green text-white hover:brightness-95 transition-all" onClick={() => handleAcceptOffer(offer)}>Accept</button>
                                      )}
                                      {isOwner && (
                                        <button className="flex-1 py-2 px-3 rounded-lg font-bold text-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all" onClick={() => handleWithdraw(msg._id || msg.id)}>Withdraw</button>
                                      )}
                                    </>
                                  )}
                                  <button
                                    className="flex-1 py-2 px-3 rounded-lg font-bold text-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                                    onClick={() => {
                                      const gigId = offer?.packageID || offer?.gigID || msg?.gigID || (msg?.gig ? (msg.gig._id || msg.gig.id) : null);
                                      const briefId = offer?.briefID || msg?.briefID || (msg?.brief ? (msg.brief._id || msg.brief.id) : null);

                                      if (gigId) {
                                        navigate.push(`/package/${gigId}`);
                                      } else if (briefId) {
                                        navigate.push(`/briefs/${briefId}`);
                                      } else {
                                        setViewingOfferDetails({ offer, msgId: msg._id || msg.id, acceptedOrder: isAccepted ? (targetOrderId || true) : null, isOwner });
                                      }
                                    }}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="msg-bubble [overflow-wrap:anywhere] [word-break:break-word]">
                            {renderMessageAttachment(msg)}
                            {msg.description && <p className="[overflow-wrap:anywhere] [word-break:break-word]">{renderMessageTextWithLinks(msg.description)}</p>}
                            <span className="msg-time">
                              {moment(msg.createdAt).format('HH:mm')}
                              {/* {isOwner && <RiCheckDoubleLine className={`check-icon ${isMsgReadByRecipient(msg) ? 'read' : ''}`} />} */}
                            </span>
                          </div>
                        )}
                        {isOwner && (
                          <img className="msg-avatar" src={user?.image || '/media/noavatar.png'} alt="" />
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
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Area */}
              <div className="compose-area max-md:p-3 relative">
                {attachment && (
                  <div className="flex items-center gap-3 mb-3 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 shadow-sm max-w-sm">
                    {attachment.type?.includes('image') || /\.(png|jpe?g|gif|webp|svg)/i.test(attachment.name) || attachment.url?.includes('/image/upload/') ? (
                      <div className="relative group flex-shrink-0">
                        <img
                          src={attachment.previewUrl || attachment.url}
                          alt="Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-300 shadow-xs"
                        />
                      </div>
                    ) : attachment.type?.includes('video') || /\.(mp4|webm|ogg|mov|mkv|avi)/i.test(attachment.name) || attachment.url?.includes('/video/upload/') ? (
                      <div className="w-16 h-16 bg-black rounded-lg overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-slate-300 shadow-xs">
                        <video src={attachment.previewUrl || attachment.url} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">▶</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0">
                        📄
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{attachment.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Attachment'} • Ready to send
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-slate-400 hover:text-red-500 font-bold p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Remove attachment from server"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {!msgsError && (
                  <form
                    onSubmit={handleSend}
                    className="compose-form relative flex items-end gap-2 p-2 bg-white border border-gray-200 rounded-2xl shadow-sm max-md:px-2 max-md:py-1.5 max-md:gap-1.5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileAttachmentChange}
                      className="hidden"
                    />

                    {/* Plus / Attach Button */}
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 mb-0.5 cursor-pointer disabled:opacity-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAttachment}
                      title="Attach file or image to CDN"
                      aria-label="Attach file or image to CDN"
                    >
                      {isUploadingAttachment ? (
                        <Loader size={18} />
                      ) : (
                        <RiAddLine className="w-5 h-5" />
                      )}
                    </button>

                    {/* Optional Seller Offer Button */}
                    {user?.isSeller && (
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0 mb-0.5"
                        onClick={() => setShowOfferModal(true)}
                      >
                        Create Offer
                      </button>
                    )}

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
                      className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors flex-shrink-0 mb-0.5"
                      disabled={(!messageText.trim() && !attachment?.url) || isUploadingAttachment || mutation.isPending}
                      aria-label="Send message"
                    >
                      <RiSendPlaneFill className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </main>

        <div className={`lg:hidden fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 ease-in-out ${isRightSideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsRightSideOpen(false)}></div>

        {/* ── RIGHT: About This Contact ── */}
        {finalRecipientUser && (
          <aside className={`contact-sidebar transform transition-transform duration-300 ease-in-out max-lg:absolute max-lg:right-0 max-lg:z-40 max-lg:shadow-xl max-lg:h-full max-lg:!flex ${isRightSideOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'}`}>
            <div className="sidebar-card relative">
              <button className="lg:hidden absolute top-2 right-2 text-gray-500 text-2xl" onClick={() => setIsRightSideOpen(false)}><RiCloseLine /></button>
              <div className="sidebar-section-header">
                <h3>About {finalRecipientUser.username}</h3>
              </div>
              <div className="sidebar-details">
                <div className="detail-row">
                  <span className="detail-label">From</span>
                  <span className="detail-value">{finalRecipientUser.country || 'United States'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">On Workvence since</span>
                  <span className="detail-value">{moment(finalRecipientUser.createdAt).format('MMM YYYY')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">English</span>
                  <span className="detail-value">Native</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Response rate</span>
                  <span className="detail-value">1 h</span>
                </div>
                <button className="view-profile-btn" onClick={() => navigate.push(`/seller/${finalRecipientUser._id}`)}>
                  View Profile
                </button>
              </div>
            </div>

            {contactOrders.length > 0 && (
              <div className="sidebar-card" style={{ marginTop: '20px' }}>
                <div className="sidebar-section-header" style={{ marginBottom: '14px' }}>
                  <h3>Orders ({contactOrders.length})</h3>
                </div>
                <div className="flex flex-col gap-2.5 px-2">
                  {contactOrders.slice(0, 4).map((order: any) => (
                    <div
                      key={order._id}
                      className="relative rounded-lg border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
                      onClick={() => navigate.push(`/orders/${order._id}`)}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${order.status === 'completed' ? 'bg-green-500' :
                        order.status === 'delivered' ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />
                      <div className="px-2 py-2.5">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded ${order.status === 'completed' ? 'bg-green-50 text-green-600' :
                            order.status === 'delivered' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                            {order.status === 'completed' ? 'Completed' : order.status === 'delivered' ? 'Delivered' : 'In Progress'}
                          </span>
                          <span className="text-sm font-extrabold text-slate-800">${order.price}</span>
                        </div>
                        <h4 className="text-[12px] font-medium text-slate-600 line-clamp-1 group-hover:text-slate-900 transition-colors">
                          {order.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
                {contactOrders.length > 3 && (
                  <button
                    className="w-full mt-3 py-2 text-[12px] font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    onClick={() => navigate.push('/orders')}
                  >
                    View All Orders →
                  </button>
                )}
              </div>
            )}


          </aside>
        )}
      </div>

      {/* Custom Offer Modal */}
      {showOfferModal && (
        <div className="modal-backdrop" onClick={() => setShowOfferModal(false)}>
          <div className="modal-box max-md:w-[96%] max-md:max-h-[95vh] max-md:overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Create Custom Offer</h3>
              <button onClick={() => setShowOfferModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleOfferSubmit} className="offer-form">
              <div className="fg">
                <label>Package Reference <span className="text-xs text-gray-400">(optional)</span></label>
                <select value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)}>
                  <option value="">-- Select one of your Packages --</option>
                  {sellerPackages.map((g: any) => <option key={g._id || g.id} value={g._id || g.id}>{g.title}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Project Reference <span className="text-xs text-gray-400">(optional)</span></label>
                <select value={selectedBriefId} onChange={e => setSelectedBriefId(e.target.value)}>
                  <option value="">-- Select a Project --</option>
                  {chatBriefs.length === 0
                    ? <option disabled>No projects available for this chat</option>
                    : chatBriefs.map((b: any) => <option key={b._id} value={b._id}>{b.title} — ${b.budget}</option>)
                  }
                </select>
              </div>
              {!selectedPackageId && !selectedBriefId && (
                <p className="text-amber-600 text-xs mt-1">⚠ Please select at least a Package or a Project</p>
              )}
              <div className="fg">
                <label>Offer Description</label>
                <textarea placeholder="Describe the service…" value={offerDesc} onChange={e => setOfferDesc(e.target.value)} rows={3} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
                <div className="fg">
                  <label>Price (USD)</label>
                  <input type="number" placeholder="150" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} required min="1" />
                </div>
                <div className="fg">
                  <label>Delivery (Days)</label>
                  <input type="number" placeholder="3" value={offerDelivery} onChange={e => setOfferDelivery(e.target.value)} required min="1" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit">Send Offer</button>
                <button type="button" className="cancel" onClick={() => setShowOfferModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Proposal Details Modal */}
      {viewingOfferDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingOfferDetails(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Custom Proposal Details</h3>
              <button
                onClick={() => setViewingOfferDetails(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Price</span>
                <span className="text-2xl font-black text-emerald-700">${viewingOfferDetails.offer?.price}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Delivery Time</span>
                <span className="text-base font-bold text-slate-800">{viewingOfferDetails.offer?.delivery} Days</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Description</h4>
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {renderMessageTextWithLinks(viewingOfferDetails.offer?.desc || 'No description provided.')}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              {viewingOfferDetails.acceptedOrder ? (
                <button
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-brand-green text-white hover:brightness-95 transition-all text-center shadow-sm"
                  onClick={() => {
                    const orderId = typeof viewingOfferDetails.acceptedOrder === 'string' ? viewingOfferDetails.acceptedOrder : viewingOfferDetails.acceptedOrder?._id;
                    setViewingOfferDetails(null);
                    if (orderId && orderId !== true) navigate.push(`/orders/${orderId}`);
                    else navigate.push('/orders');
                  }}
                >
                  View Order
                </button>
              ) : (
                <>
                  {!viewingOfferDetails.isOwner && (
                    <button
                      className="flex-1 py-3 rounded-xl font-bold text-sm bg-brand-green text-white hover:brightness-95 transition-all text-center shadow-sm"
                      onClick={() => {
                        const offer = viewingOfferDetails.offer;
                        setViewingOfferDetails(null);
                        handleAcceptOffer(offer);
                      }}
                    >
                      Accept & Proceed to Checkout
                    </button>
                  )}
                  {viewingOfferDetails.isOwner && (
                    <button
                      className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all text-center"
                      onClick={() => {
                        const msgId = viewingOfferDetails.msgId;
                        setViewingOfferDetails(null);
                        handleWithdraw(msgId);
                      }}
                    >
                      Withdraw Proposal
                    </button>
                  )}
                </>
              )}
              <button
                type="button"
                className="py-3 px-5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all"
                onClick={() => setViewingOfferDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Enlarged preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 text-white bg-black/60 hover:bg-black/90 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;