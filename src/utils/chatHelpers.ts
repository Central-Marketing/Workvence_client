import toast from 'react-hot-toast';
import axiosFetch from './axiosFetch';

/**
 * Universal helper for dynamic recipient matching:
 * Determines the other participant (buyer or seller) by comparing sellerID._id against current user._id
 */
export const getOtherUser = (conv: any, currentUser: any) => {
  if (!conv || (!currentUser?._id && !currentUser?.id)) return null;
  const currentUid = String(currentUser._id || currentUser.id || '');
  const sellerIdStr = String(conv.sellerID?._id || conv.sellerID || '');
  const buyerIdStr = String(conv.buyerID?._id || conv.buyerID || '');

  if (sellerIdStr === currentUid) return conv.buyerID;
  if (buyerIdStr === currentUid) return conv.sellerID;
  return conv.sellerID;
};

/**
 * Dynamic unread check:
 * Compares current user ID with conversation seller ID to check readBySeller vs readByBuyer
 */
export const isConversationUnread = (conversation: any, currentUser: any) => {
  if (!conversation || (!currentUser?._id && !currentUser?.id)) return false;
  const currentUid = String(currentUser._id || currentUser.id || '');
  const sellerIdStr = String(conversation.sellerID?._id || conversation.sellerID || '');

  if (sellerIdStr === currentUid) {
    return !conversation.readBySeller;
  }
  return !conversation.readByBuyer;
};

/**
 * Universal Contact Helper (Initiating Contact from any page: Gig, Order, Proposal, Profile):
 * Always passes 'to' as the target recipient ID and 'from' as the current user's ID
 */
export const handleContactUser = async (targetUserId: string, currentUser: any, navigate: any) => {
  if (!targetUserId || (!currentUser?._id && !currentUser?.id)) {
    toast.error("Please sign in to contact this user.");
    return;
  }

  const currentUid = String(currentUser._id || currentUser.id || '');
  if (String(targetUserId) === currentUid) {
    toast.error("You cannot message yourself.");
    return;
  }

  try {
    // 1. Try fetching existing single conversation
    const { data } = await axiosFetch.get(`/conversations/single/${targetUserId}/${currentUid}`);
    const conv = data?.data || data;
    const canonicalId = conv?.conversationID || conv?._id || conv?.id;
    if (canonicalId) {
      navigate.push(`/message/${canonicalId}`);
      return;
    }
  } catch (err) {
    // Fallback: Proceed to create conversation
  }

  try {
    // 2. Create conversation if non-existent
    const { data } = await axiosFetch.post('/conversations', {
      to: targetUserId,
      from: currentUid
    });
    const newConv = data?.data || data;
    const canonicalId = newConv?.conversationID || newConv?._id || newConv?.id;
    if (canonicalId) {
      navigate.push(`/message/${canonicalId}`);
    } else {
      toast.error('Failed to initiate conversation.');
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to initiate conversation.');
  }
};
