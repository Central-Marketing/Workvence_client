import React from 'react';
import axiosFetch from './axiosFetch';
import Swal from 'sweetalert2';

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
  const username = currentUser.username;

  if (Array.isArray(conversation.readBy) && username) {
    return !conversation.readBy.includes(username);
  }

  const currentUid = String(currentUser._id || currentUser.id || '');
  const sellerId = String(conversation.sellerID?._id || conversation.sellerID || '');
  const buyerId = String(conversation.buyerID?._id || conversation.buyerID || '');

  if (sellerId === currentUid) {
    return !conversation.readBySeller;
  }
  if (buyerId === currentUid) {
    return !conversation.readByBuyer;
  }
  return currentUser.isSeller ? !conversation.readBySeller : !conversation.readByBuyer;
};

export const handleStartChat = async (targetUsername: string, currentUser: any, navigate: any) => {
  if (!targetUsername || !currentUser) return;

  const currentUsername = currentUser.username;
  if (currentUsername && currentUsername.toLowerCase() === targetUsername.toLowerCase()) {
    Swal.fire({
      icon: 'info',
      title: 'Action Blocked',
      text: 'Users cannot start a conversation with themselves!',
      confirmButtonColor: '#6ad724'
    });
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
    Swal.fire({
      icon: 'error',
      title: 'Chat Failed',
      text: err.response?.data?.message || 'Could not start conversation',
      confirmButtonColor: '#6ad724'
    });
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

  const sId = String(conversation.sellerID?._id || conversation.sellerID || '');
  const bId = String(conversation.buyerID?._id || conversation.buyerID || '');
  if (sId && bId && (`${sId}${bId}` === tid || `${bId}${sId}` === tid)) return true;

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
