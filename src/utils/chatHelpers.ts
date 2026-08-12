export const isConversationUnread = (conversation: any, currentUser: any) => {
  if (!conversation || !currentUser) return false;
  return currentUser.isSeller
    ? !conversation.readBySeller
    : !conversation.readByBuyer;
};
