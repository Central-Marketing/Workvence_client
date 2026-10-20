import React from 'react';
import axiosFetch from './axiosFetch';
import { toast } from "@/utils/toast";

export const getOtherUser = (conversation: any, currentUser: any) => {
  if (!conversation) return null;
  if (conversation.otherUser && typeof conversation.otherUser === 'object') {
    return conversation.otherUser;
  }

  const currentUid = String(currentUser?._id || currentUser?.id || '');
  const currentUsername = String(currentUser?.username || '').toLowerCase();

  const sellerObj = conversation.sellerID || conversation.seller || conversation.sellerId || conversation.sellerDetails;
  const buyerObj = conversation.buyerID || conversation.buyer || conversation.buyerId || conversation.buyerDetails;

  const sellerId = String(sellerObj?._id || sellerObj?.id || (typeof sellerObj === 'string' ? sellerObj : ''));
  const buyerId = String(buyerObj?._id || buyerObj?.id || (typeof buyerObj === 'string' ? buyerObj : ''));
  const sellerUsername = String(conversation.seller_username || sellerObj?.username || '').toLowerCase();
  const buyerUsername = String(conversation.buyer_username || buyerObj?.username || '').toLowerCase();

  if ((sellerId && sellerId === currentUid) || (sellerUsername && sellerUsername === currentUsername)) {
    return typeof buyerObj === 'object' ? buyerObj : null;
  }
  if ((buyerId && buyerId === currentUid) || (buyerUsername && buyerUsername === currentUsername)) {
    return typeof sellerObj === 'object' ? sellerObj : null;
  }

  return currentUser?.isSeller ? buyerObj : sellerObj;
};

export const isConversationUnread = (conversation: any, currentUser: any) => {
  if (!conversation) return false;

  const currentUid = String(currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.userID || '');
  const currentUsername = String(currentUser?.username || '').toLowerCase();

  // 1. If the last message was sent by the current user, it is NEVER unread for the current user!
  const lastSender = String(
    conversation.lastMessageSender ||
    conversation.lastSender ||
    (typeof conversation.lastMessage === 'object' && (conversation.lastMessage?.sender || conversation.lastMessage?.user || conversation.lastMessage?.userID)) ||
    ''
  ).trim();

  if (lastSender && currentUid && (lastSender === currentUid || (currentUsername && lastSender.toLowerCase() === currentUsername))) {
    return false;
  }

  // 2. Explicit unreadCount from real-time socket tracking
  if (typeof conversation.unreadCount === "number") {
    return conversation.unreadCount > 0;
  }

  // 3. Direct boolean unread flag returned by backend
  if (typeof conversation.unread === "boolean") {
    return conversation.unread;
  }

  if (!currentUser) return false;

  // 4. Role-based read flag fallback:
  const sellerObj = conversation.sellerID || conversation.seller || conversation.sellerId || conversation.sellerDetails;
  const buyerObj = conversation.buyerID || conversation.buyer || conversation.buyerId || conversation.buyerDetails;

  const sellerId = String(sellerObj?._id || sellerObj?.id || (typeof sellerObj === 'string' ? sellerObj : ''));
  const buyerId = String(buyerObj?._id || buyerObj?.id || (typeof buyerObj === 'string' ? buyerObj : ''));
  const sellerUsername = String(conversation.seller_username || sellerObj?.username || '').toLowerCase();
  const buyerUsername = String(conversation.buyer_username || buyerObj?.username || '').toLowerCase();

  if ((sellerId && sellerId === currentUid) || (sellerUsername && sellerUsername === currentUsername)) {
    return conversation.readBySeller === false;
  }
  if ((buyerId && buyerId === currentUid) || (buyerUsername && buyerUsername === currentUsername)) {
    return conversation.readByBuyer === false;
  }

  return currentUser?.isSeller
    ? conversation.readBySeller === false
    : conversation.readByBuyer === false;
};

export const handleStartChat = async (targetUsername: string, currentUser: any, navigate: any) => {
  if (!targetUsername || !currentUser) return;

  const currentUsername = currentUser.username;
  if (currentUsername && currentUsername.toLowerCase() === targetUsername.toLowerCase()) {
    toast.error('Users cannot start a conversation with themselves!');
    return;
  }

  try {
    const isSeller = currentUser.isSeller;
    const payload = isSeller
      ? { seller_username: currentUsername, buyer_username: targetUsername }
      : { buyer_username: currentUsername, seller_username: targetUsername };

    const { data } = await axiosFetch.post('/conversations', payload);
    const convUUID = data?.uuid || data?.conversationID || data?._id;
    if (convUUID) {
      navigate.push(`/message/${convUUID}`);
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Could not start conversation');
  }
};

export const isTargetConversation = (conversation: any, targetId: string) => {
  if (!conversation || !targetId) return false;
  const tid = String(targetId).trim().toLowerCase();
  if (!tid) return false;

  const cUuid = (conversation.uuid ? String(conversation.uuid).trim() : '').toLowerCase();
  const cConvId = (conversation.conversationID ? String(conversation.conversationID).trim() : '').toLowerCase();
  const cId = (conversation._id ? String(conversation._id).trim() : '').toLowerCase();
  const cGenId = (conversation.id ? String(conversation.id).trim() : '').toLowerCase();

  if (cUuid && cUuid === tid) return true;
  if (cConvId && cConvId === tid) return true;
  if (cId && cId === tid) return true;
  if (cGenId && cGenId === tid) return true;

  const sId = String(conversation.sellerID?._id || conversation.sellerID?.id || conversation.sellerID || '').toLowerCase();
  const bId = String(conversation.buyerID?._id || conversation.buyerID?.id || conversation.buyerID || '').toLowerCase();
  if (sId && bId && (`${sId}${bId}` === tid || `${bId}${sId}` === tid)) return true;

  const sUser = String(conversation.seller_username || conversation.sellerID?.username || '').toLowerCase();
  const bUser = String(conversation.buyer_username || conversation.buyerID?.username || '').toLowerCase();
  if (sUser && bUser && (`${sUser}${bUser}` === tid || `${bUser}${sUser}` === tid)) return true;
  if (sUser && sUser === tid) return true;
  if (bUser && bUser === tid) return true;

  if (sId && sId === tid) return true;
  if (bId && bId === tid) return true;

  return false;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const renderMessageTextWithLinks = (text: string) => {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//i)) {
      return React.createElement(
        'a',
        {
          key: index,
          href: part,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-emerald-600 underline font-medium hover:text-emerald-700 break-all transition-colors cursor-pointer',
          onClick: (e: any) => e.stopPropagation()
        },
        part
      );
    }
    return part;
  });
};

export { formatFileSize } from '@/lib/formatters';

export const PRESET_TAGS = ['Urgent', 'Lead', 'VIP', 'Follow Up', 'In Review'];

export const sanitizeTags = (rawTags: string[]): string[] => {
  if (!Array.isArray(rawTags)) return [];
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const raw of rawTags) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const truncated = trimmed.slice(0, 50);
    const lowerKey = truncated.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      sanitized.push(truncated);
      if (sanitized.length >= 20) break;
    }
  }

  return sanitized;
};

export const getTagColor = (tagName: string) => {
  const lower = (tagName || '').toLowerCase();
  if (lower.includes('urgent') || lower.includes('priority')) {
    return 'bg-white text-rose-700 border-[rgba(0,0,0,0.10)]';
  }
  if (lower.includes('vip') || lower.includes('star')) {
    return 'bg-white text-purple-700 border-[rgba(0,0,0,0.10)]';
  }
  if (lower.includes('lead') || lower.includes('client') || lower.includes('deal')) {
    return 'bg-white text-emerald-800 border-[rgba(0,0,0,0.10)]';
  }
  if (lower.includes('follow') || lower.includes('pending')) {
    return 'bg-white text-sky-800 border-[rgba(0,0,0,0.10)]';
  }
  if (lower.includes('review') || lower.includes('wait') || lower.includes('hold')) {
    return 'bg-white text-amber-800 border-[rgba(0,0,0,0.10)]';
  }
  return 'bg-white text-slate-700 border-[rgba(0,0,0,0.10)]';
};

export const updateConversationTagsApi = async (conversationId: string, tags: string[]) => {
  if (!conversationId) throw new Error('Missing conversation ID');
  const sanitized = sanitizeTags(tags);

  try {
    const res = await axiosFetch.patch(`/chat/conversations/${conversationId}/tags`, { tags: sanitized });
    return res.data;
  } catch (err: any) {
    // Fallback to /conversations/:id/tags if /chat/ prefix rewrite differs
    const res = await axiosFetch.patch(`/conversations/${conversationId}/tags`, { tags: sanitized });
    return res.data;
  }
};

export const getMessageText = (m: any): string => {
  if (!m) return "";
  return (
    m.customOffer?.description ||
    m.description ||
    m.desc ||
    m.text ||
    m.message ||
    ""
  ).trim();
};

export const getAttachmentUrl = (m: any): string => {
  if (!m) return "";
  let raw: any = m.file;
  if (!raw && Array.isArray(m.attachments) && m.attachments.length > 0) {
    const first = m.attachments[0];
    raw = typeof first === "string" ? first : first?.url || first?.secure_url || first?.path || "";
  }
  if (!raw && m.attachment) {
    raw = typeof m.attachment === "string" ? m.attachment : m.attachment.url || m.attachment.secure_url || "";
  }
  if (!raw && Array.isArray(m.attachmentMeta) && m.attachmentMeta.length > 0) {
    raw = m.attachmentMeta[0]?.url || "";
  }
  if (!raw || typeof raw !== "string") return "";
  return raw.replace(/^https?:\/\//, "").split(/[?#]/)[0].trim().toLowerCase();
};
