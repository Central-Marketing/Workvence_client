"use client";

import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Flag, ArrowRight } from "lucide-react";
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
  RiCloseLine,
  RiVideoChatLine,
  RiVidiconLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiArrowDownSLine
} from "react-icons/ri";

import axios from 'axios';
import { axiosFetch, socket, getAvatarUrl } from "@/utils";
import supportService from "@/utils/supportService";
import { getOtherUser, isConversationUnread, isTargetConversation, renderMessageTextWithLinks } from '@/utils/chatHelpers';
import { useUserStore } from "@/store/userStore";
import { Loader, ChatSkeleton, Skeleton, AiGradientButton } from "@/components";
import { MessageModerationBadge } from "@/features/chat";
import moment from 'moment';

const Message = () => {
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
  const [offerRevisions, setOfferRevisions] = useState("Unlimited Revision");
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

  useEffect(() => {
    activeConvRef.current = activeConversation;
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
      revisions: offerRevisions || "Unlimited Revision",
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

    mutation.mutate({ conversationID, description: `[CUSTOM_OFFER]${JSON.stringify(payload)}` });
    setSelectedPackageId(""); setSelectedBriefId(""); setOfferDesc(""); setOfferPrice(""); setOfferDelivery(""); setOfferRevisions("Unlimited Revision");
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer: any) => {
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
      await axiosFetch.patch(`/messages/withdraw/${msgId}`);
      toast.success("Offer withdrawn.");
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
    } catch { toast.error("Failed to withdraw."); }
  };

  const parseOffer = (desc?: string) => {
    if (desc?.startsWith('[CUSTOM_OFFER]')) {
      try { return JSON.parse(desc.replace('[CUSTOM_OFFER]', '')); } catch { return null; }
    }
    return null;
  };

  const parseMeeting = (desc?: string) => {
    if (desc?.startsWith('[MEETING_INVITE]')) {
      try { return JSON.parse(desc.replace('[MEETING_INVITE]', '')); } catch { return null; }
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
      const { data } = await axiosFetch.post(
        '/meetings',
        {
          title,
          conversationId: conversationID,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (data && (data.roomUrl || data.joinUrl || data.meeting || data.meetingId)) {
        const meetingPayload = {
          meetingId: data.meetingId || '',
          roomUrl: data.joinUrl || data.roomUrl || data.meeting || '',
          title: data.title || title,
          hostEmail: data.hostEmail || '',
          password: data.password || '',
          isPrivate: Boolean(data.isPrivate),
          autoRecording: data.autoRecording || '',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'success'
        };

        mutation.mutate({
          conversationID,
          description: `[MEETING_INVITE]${JSON.stringify(meetingPayload)}`,
          isSeller: Boolean(user?.isSeller)
        });

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
        <div className={`mt-1 overflow-hidden rounded-lg border border-slate-200 shadow-sm max-w-[280px] ${!msg.description ? 'mb-5' : 'mb-1.5'}`}>
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
        <div className={`mt-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm max-w-[340px] bg-black ${!msg.description ? 'mb-5' : 'mb-1.5'}`}>
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
        className={`flex items-center gap-2 px-3 py-2 mt-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-200 transition-colors border text-xs font-medium ${!msg.description ? 'mb-5' : 'mb-1.5'}`}
      >
        <span className="text-base">📄</span>
        <span className="truncate max-w-[180px]">{fileName}</span>
        <span className="ml-auto text-slate-400">⬇️</span>
      </a>
    );
  };

  const renderMessageContent = (msg: any) => {
    const text = msg.description || '';
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
                  <button
                    type="button"
                    onClick={() => navigate.push('/messages')}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-[#126D6B] bg-[#ffffff] hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                    aria-label="Back to messages"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <h2 className="text-[32px]
  sm:text-[36px]
  md:text-[40px]
  lg:text-[44px]
  xl:text-[48px]
  font-normal
  leading-normal
  tracking-normal
  text-[#292929]
  font-sf-pro">
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
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400 text-slate-800 transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setConvFilterTab('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${convFilterTab === 'all'
                      ? 'border-teal-700 text-teal-800 bg-white shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvFilterTab('read')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${convFilterTab === 'read'
                      ? 'border-teal-700 text-teal-800 bg-white shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                  >
                    <span>Read</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
                      {readCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvFilterTab('unread')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${convFilterTab === 'unread'
                      ? 'border-teal-700 text-teal-800 bg-white shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Unread
                  </button>
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
                        className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-150 ${isActive ? 'bg-white' : 'hover:bg-slate-50'
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
          {!conversationID ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="text-lg font-bold text-slate-800">Select a conversation</h3>
              <p className="text-sm text-slate-500">Choose from your inbox on the left to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[rgba(0,0,0,0.10)] flex justify-between items-center bg-[#F8F8F8] max-md:px-3.5 max-md:py-2.5">
                <button className="md:hidden mr-3 text-slate-500 text-xl flex-shrink-0 cursor-pointer" onClick={() => setIsLeftSideOpen(true)}>
                  <RiMenuLine />
                </button>
                {finalRecipientUser ? (
                  <>
                    <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setIsRightSideOpen(true)}>
                      <div className="shrink-0">
                        <img src={finalRecipientUser.image || '/media/noavatar.png'} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{finalRecipientUser.username}</h3>
                        <span className="text-xs text-slate-500 font-medium">
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
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Optional Seller Action Buttons: Create Offer */}
                      {user?.isSeller && (
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#000000] text-white hover:bg-gray-200 hover:text-black transition-colors whitespace-nowrap flex-shrink-0 mb-0.5 cursor-pointer"
                          onClick={() => setShowOfferModal(true)}
                        >
                          Create Offer
                        </button>
                      )}

                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          setMeetingTitle(`Job Discussion with @${finalRecipientUser?.username || 'Client'}`);
                          setShowMeetingModal(true);
                        }}
                        title="Start Video Meeting"
                        aria-label="Start Video Meeting"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z" stroke="#292929" stroke-width="1.5" />
                          <path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941" stroke="#292929" stroke-width="1.5" stroke-linecap="round" />
                          <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="#292929" stroke-width="1.5" />
                        </svg>
                      </button>

                      {isMsgSearchActive ? (
                        <div className="flex items-center bg-slate-100 rounded-full px-2.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search in chat..."
                            value={msgSearchQuery}
                            onChange={(e) => setMsgSearchQuery(e.target.value)}
                            className="border-none bg-transparent outline-none text-sm p-1 w-36 text-slate-800 placeholder:text-slate-400"
                            autoFocus
                          />
                          <button className="text-slate-500 hover:text-slate-800 p-0 text-lg cursor-pointer leading-none" onClick={() => { setIsMsgSearchActive(false); setMsgSearchQuery(''); }}>&times;</button>
                        </div>
                      ) : (
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center cursor-pointer" onClick={() => setIsMsgSearchActive(true)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M17 17L21 21" stroke="#292929" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
                          <path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="#292929" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
                        </svg></button>
                      )}
                      <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center cursor-pointer ml-1 text-xl" onClick={() => setIsRightSideOpen(true)}><RiInformationLine /></button>
                    </div>
                  </>
                ) : <h3 className="text-base font-bold text-slate-800">Conversation</h3>}
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 flex flex-col gap-4 bg-[#F0F0F0] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                  const senderObj = msg.senderID || msg.userID;
                  const senderIdStr = String(senderObj?._id || senderObj?.id || senderObj || '');
                  const currentUserIdStr = String(user?._id || user?.id || '');
                  const currentUsername = String(user?.username || '').toLowerCase();
                  const senderUsername = String(senderObj?.username || msg.username || '').toLowerCase();
                  const isOwner = Boolean(
                    (currentUserIdStr && senderIdStr && currentUserIdStr === senderIdStr) ||
                    (currentUsername && senderUsername && currentUsername === senderUsername)
                  );
                  const offer = msg.isCustomOffer || msg.description?.startsWith('[CUSTOM_OFFER]') ? parseOffer(msg.description) : null;
                  const meeting = msg.description?.startsWith('[MEETING_INVITE]') ? parseMeeting(msg.description) : null;
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
                              <div className="w-full flex items-center justify-between gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl px-3.5 py-2 text-xs font-bold">
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
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingOfferDetails({
                                    offer,
                                    msgId: msg._id || msg.id,
                                    acceptedOrder: isAccepted ? (targetOrderId || true) : null,
                                    isOwner,
                                  });
                                }}
                                className="text-[14px] font-medium text-[#007A64] hover:text-[#005c4b] cursor-pointer flex items-center gap-1.5 w-fit mt-0.5 transition-colors"
                              >
                                <span>Read Full Proposal</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                  <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                              </button>
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
                                  <span>{offer.revision || offer.revisions || "Unlimited Revision"}</span>
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
                                <button
                                  type="button"
                                  className="w-full h-12 rounded-[10px] font-semibold text-[15px] bg-[#000000] text-white hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                                  onClick={() => {
                                    if (targetOrderId) navigate.push(`/orders/${targetOrderId}`);
                                    else navigate.push('/orders');
                                  }}
                                >
                                  <span>View Order</span>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                  </svg>
                                </button>
                              ) : isWithdrawn ? (
                                <div className="w-full h-12 rounded-[10px] font-semibold text-[15px] bg-[#F3F4F6] text-slate-400 flex items-center justify-center select-none">
                                  Withdrawn
                                </div>
                              ) : !isOwner ? (
                                <button
                                  type="button"
                                  className="w-full h-12 rounded-[10px] font-semibold text-[15px] bg-[#000000] text-white hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                                  onClick={() => handleAcceptOffer(offer)}
                                >
                                  <span>Accept Offer</span>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="w-full h-12 rounded-[10px] font-semibold text-[15px] bg-[#ECECEC] text-[#1E293B] hover:bg-[#E0E0E0] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                                  onClick={() => handleWithdraw(msg._id || msg.id)}
                                >
                                  <span>Withdraw</span>
                                </button>
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
                                  <path d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z" stroke="#354B9A" stroke-width="1.5" />
                                  <path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941" stroke="#354B9A" stroke-width="1.5" stroke-linecap="round" />
                                  <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="#354B9A" stroke-width="1.5" />
                                </svg>
                                <span className="text-[16px] font-bold text-slate-900 leading-none">Video Meeting Invitation</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(meeting.roomUrl || meeting.joinUrl || `Meeting ID: ${meeting.meetingId || ''}`, "Meeting link copied to clipboard!")}
                                className="text-slate-700 hover:text-black cursor-pointer p-1 rounded-md hover:bg-slate-100 transition-colors"
                                title="Copy meeting link"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="8" y="8" width="13" height="13" rx="3" />
                                  <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            </div>

                            <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

                            {/* Credentials Row: ID & Passcode pills */}
                            <div className="w-full flex items-center gap-3">
                              <div className="flex-1 bg-[#F0F0F0] rounded-[10px] px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm font-medium text-slate-700 truncate">
                                  ID- {meeting.meetingId || (meeting.roomUrl ? String(meeting.roomUrl).split('/').pop() : '81346682237')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(meeting.meetingId || (meeting.roomUrl ? String(meeting.roomUrl).split('/').pop() : ''), "Meeting ID copied!")}
                                  className="text-slate-600 hover:text-black shrink-0 cursor-pointer p-0.5"
                                  title="Copy Meeting ID"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="8" y="8" width="13" height="13" rx="3" />
                                    <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                                  </svg>
                                </button>
                              </div>

                              <div className="flex-1 bg-[#F0F0F0] rounded-[10px] px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm font-medium text-slate-700 truncate">
                                  Pass- {meeting.password || meeting.passcode || 'i4Rs8N'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(meeting.password || meeting.passcode || '', "Passcode copied!")}
                                  className="text-slate-600 hover:text-black shrink-0 cursor-pointer p-0.5"
                                  title="Copy Passcode"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="8" y="8" width="13" height="13" rx="3" />
                                    <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                                  </svg>
                                </button>
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
                                className="w-full h-12 rounded-[10px] font-semibold text-[15px] bg-[#000000] text-white hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
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
                                  <path d="M5.0249 21C5.04385 19.2643 5.04366 17.5541 5.0366 15.9209M5.0366 15.9209C5.01301 10.4614 4.91276 5.86186 5.19475 4.04271C5.5611 1.67939 9.39301 3.82993 13.9703 5.59842L16.0328 6.48729C17.5508 7.1415 19.7187 8.30352 18.7662 9.66084C18.3738 10.22 17.56 10.8596 16.0575 11.567L5.0366 15.9209Z" stroke="#DA0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Area */}
              <div className="p-4 sm:px-5 sm:py-4 bg-[#f0f0f0] relative max-md:p-3">
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
                    className="relative flex items-end gap-2 p-2 bg-white border border-gray-200 rounded-2xl shadow-sm max-md:px-2 max-md:py-1.5 max-md:gap-1.5"
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
                      title="Attach file or image "
                      aria-label="Attach file or image"
                    >
                      {isUploadingAttachment ? (
                        <Loader size={18} />
                      ) : (
                        <RiAddLine className="w-5 h-5" />
                      )}
                    </button>


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
        {isValidId && (() => {
          if (!finalRecipientUser && isFetchingTargetUser) {
            return (
              <aside className={`w-[320px] min-w-[280px] xl:w-[340px] xl:min-w-[320px] h-full max-h-full min-h-0 border-l border-[rgba(0, 0, 0, 0.10)] bg-[#F8F8F8] overflow-y-auto overflow-x-hidden p-4 xl:p-5 flex flex-col shrink-0 box-border max-lg:fixed max-lg:top-0 max-lg:bottom-0 max-lg:right-0 max-lg:z-40 max-lg:shadow-2xl max-lg:h-full max-lg:flex max-lg:transform max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out ${isRightSideOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'}`}>
                <div className="flex flex-col gap-4">
                  <Skeleton className="w-full h-44 rounded-2xl" />
                  <Skeleton className="w-full h-36 rounded-2xl" />
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

          const conversationMedia = (messages || [])
            .flatMap((m: any) => {
              const list: string[] = [];
              if (m.file && typeof m.file === 'string') list.push(m.file);
              if (Array.isArray(m.attachments)) list.push(...m.attachments);
              return list;
            })
            .filter((url: string) => typeof url === 'string' && url.length > 0);

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
            <aside className={`w-[320px] min-w-[280px] xl:w-[340px] xl:min-w-[320px] h-full max-h-full min-h-0 border-l border-[rgba(0, 0, 0, 0.10)] bg-[#F8F8F8] overflow-y-auto overflow-x-hidden p-4 xl:p-5 flex flex-col shrink-0 box-border [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full max-lg:fixed max-lg:top-0 max-lg:bottom-0 max-lg:right-0 max-lg:z-40 max-lg:shadow-2xl max-lg:h-full max-lg:flex max-lg:transform max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out ${isRightSideOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'}`}>
              <div className="w-full flex flex-col gap-4 pb-20">
                <button
                  type="button"
                  className="lg:hidden self-end text-gray-500 hover:text-gray-800 text-2xl -mb-2 cursor-pointer"
                  onClick={() => setIsRightSideOpen(false)}
                  aria-label="Close sidebar"
                >
                  <RiCloseLine />
                </button>

                {/* Top Segmented Controls: Profile | Media */}
                <div className="bg-[#f0f2f5] p-1 rounded-2xl flex items-center border border-slate-200/70 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setContactSidebarTab('profile')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 text-center cursor-pointer ${contactSidebarTab === 'profile'
                      ? 'bg-[#0e3834] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactSidebarTab('media')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 text-center cursor-pointer ${contactSidebarTab === 'media'
                      ? 'bg-[#0e3834] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Media
                  </button>
                </div>

                {contactSidebarTab === 'profile' ? (
                  <>
                    {/* ── Card 1: About Contact ── */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3 relative">
                      <h3 className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight">
                        About {finalRecipientUser.username || finalRecipientUser.name || 'Contact'}
                      </h3>

                      {/* Avatar & Contact Info */}
                      <div className="flex items-center gap-3 pt-1">
                        <img
                          src={getAvatarUrl(finalRecipientUser?.image || finalRecipientUser?.img || finalRecipientUser?.avatar || '/media/noavatar.png')}
                          alt={finalRecipientUser.username || 'Contact'}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-slate-100 shadow-xs"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                              {finalRecipientUser.name || finalRecipientUser.username || 'User'}
                            </span>
                            <span className="bg-[#4c1d95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md leading-none tracking-wide">
                              {finalRecipientUser.badge || (finalRecipientUser.isSeller ? 'Seller' : 'Buyer')}
                            </span>
                          </div>
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

                      {/* Details: From & Language */}
                      <div className="flex flex-col gap-2 text-xs">
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
                          className="w-full text-xs font-bold py-3 rounded-xl shadow-xs"
                          text="Analysis Seller Profile"
                        />
                      </div>
                    </div>

                    {/* ── Card 2: Order History ── */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
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
                                  className="flex items-center justify-between py-2.5 gap-2 cursor-pointer hover:bg-slate-50/80 rounded-md px-1 transition-colors group"
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
                            <button
                              type="button"
                              className="w-full mt-2 py-2.5 bg-[#f1f3f5] hover:bg-[#e4e7eb] text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors text-center cursor-pointer"
                              onClick={() => navigate.push('/orders')}
                            >
                              view all
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  /* ── MEDIA TAB ── */
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
                    <h3 className="text-base font-bold text-slate-800">Shared Media</h3>
                    {conversationMedia.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {conversationMedia.map((mediaUrl: string, idx: number) => (
                          <a
                            key={idx}
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity block bg-slate-100"
                          >
                            <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No media shared yet
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
          <div className="bg-white w-[92%] max-w-[460px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-slate-100 max-md:w-[96%] max-md:max-h-[95vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
              <h3 className="text-[15px] font-bold text-slate-900 m-0">Create Custom Offer</h3>
              <button type="button" onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-800 text-2xl leading-none cursor-pointer p-1">&times;</button>
            </div>
            <form onSubmit={handleOfferSubmit} className="p-5 flex flex-col gap-3.5 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Package Reference <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                <select
                  value={selectedPackageId}
                  onChange={e => setSelectedPackageId(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
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
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
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
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green bg-white resize-none transition-colors"
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
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
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
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Revisions</label>
                  <input
                    type="text"
                    placeholder="Unlimited Revision"
                    value={offerRevisions}
                    onChange={e => setOfferRevisions(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Send Offer
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Meeting Creation Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => !isCreatingMeeting && setShowMeetingModal(false)}>
          <div className="w-[92%] max-w-md p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[calc(100vh-40px)] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                  <RiVideoChatLine className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create Video Meeting</h3>
              </div>
              <button
                type="button"
                disabled={isCreatingMeeting}
                onClick={() => setShowMeetingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-green bg-slate-50/50"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  A dedicated video room will be created and instantly sent to the buyer in this chat.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isCreatingMeeting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-brand-green text-white hover:brightness-95 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  style={{ background: '#000000', color: '#ffffff' }}
                >
                  {isCreatingMeeting ? (
                    <>
                      <Loader size={18} />
                      <span>Creating Room...</span>
                    </>
                  ) : (
                    <>
                      <RiVideoChatLine className="w-4 h-4" />
                      <span>Create & Send Link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isCreatingMeeting}
                  onClick={() => setShowMeetingModal(false)}
                  className="py-3 px-4 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
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
                <span className="text-2xl font-bold text-emerald-700">${viewingOfferDetails.offer?.price}</span>
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