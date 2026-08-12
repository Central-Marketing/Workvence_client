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
