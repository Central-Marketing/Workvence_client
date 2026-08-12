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
