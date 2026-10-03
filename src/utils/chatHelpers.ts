import React from 'react';
import axiosFetch from './axiosFetch';
import { toast } from "sonner";

export const getOtherUser = (conversation: any, currentUser: any) => {
  if (!conversation || !currentUser) return null;
  const currentUid = String(currentUser._id || currentUser.id || '');

  const sellerId = String(conversation.sellerID?._id || conversation.sellerID || '');
  const buyerId = String(conversation.buyerID?._id || conversation.buyerID || '');

  if (sellerId === currentUid) {
    return typeof conversation.buyerID === 'object' ? conversation.buyerID : null;
  }
  if (buyerId === currentUid) {
    return typeof conversation.sellerID === 'object' ? conversation.sellerID : null;
  }
  return conversation.sellerID?._id === currentUid ? conversation.buyerID : conversation.sellerID;
};

export const isConversationUnread = (conversation: any, currentUser: any) => {
  if (!conversation || !currentUser) return false;

  const currentUid = String(currentUser._id || currentUser.id || '');
  const sellerId = String(conversation.sellerID?._id || conversation.sellerID?.id || conversation.sellerID || '');
  const buyerId = String(conversation.buyerID?._id || conversation.buyerID?.id || conversation.buyerID || '');

  if (sellerId === currentUid) {
    return conversation.readBySeller === false;
  }
  if (buyerId === currentUid) {
    return conversation.readByBuyer === false;
  }

  return currentUser.isSeller ? conversation.readBySeller === false : conversation.readByBuyer === false;
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
  const tid = String(targetId).trim();
  if (!tid) return false;

  const cUuid = conversation.uuid ? String(conversation.uuid).trim() : '';
  const cConvId = conversation.conversationID ? String(conversation.conversationID).trim() : '';
  const cId = conversation._id ? String(conversation._id).trim() : '';
  const cGenId = conversation.id ? String(conversation.id).trim() : '';

  if (cUuid && cUuid === tid) return true;
  if (cConvId && cConvId === tid) return true;
  if (cId && cId === tid) return true;
  if (cGenId && cGenId === tid) return true;

  const sId = String(conversation.sellerID?._id || conversation.sellerID?.id || conversation.sellerID || '');
  const bId = String(conversation.buyerID?._id || conversation.buyerID?.id || conversation.buyerID || '');
  if (sId && bId && (`${sId}${bId}` === tid || `${bId}${sId}` === tid)) return true;
  if (sId === tid || bId === tid) return true;

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
