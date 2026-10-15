import { User } from './user';

export interface CustomOffer {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  desc?: string;
  price: number | string;
  deliveryTime?: number | string;
  deliveryTimeDays?: number | string;
  revisionNumber?: number | string;
  revisions?: number | string;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | string;
  packageId?: string;
  packageID?: string;
  packageTitle?: string;
  gigID?: string | null;
  gigTitle?: string | null;
  briefId?: string;
  briefID?: string | null;
  briefTitle?: string | null;
  sellerID?: string;
  withdrawn?: boolean;
}

export interface MeetingInvite {
  meetingId: string;
  roomUrl: string;
  joinUrl?: string;
  title: string;
  hostEmail?: string;
  password?: string;
  isPrivate?: boolean;
  autoRecording?: string;
  createdAt?: string;
  status?: string;
}

export interface MessageAttachment {
  url: string;
  name?: string;
  type?: string;
  public_id?: string;
  size?: number;
}

export type ModerationWarningLevel = 'low' | 'medium' | 'high' | 'critical' | string;

export interface MessageModeration {
  flagged: boolean;
  warningLevel?: ModerationWarningLevel;
  matchedWord?: string;
  flagReason?: string | null;
  flaggedAt?: string | null;
}

export interface ChatMessage {
  _id: string;
  id?: string;
  conversationID?: string;
  conversationUUID?: string;
  userID: string | User;
  to?: string;
  from?: string;
  desc?: string;
  text?: string;
  message?: string;
  file?: string | null;
  attachment?: MessageAttachment | null;
  isCustomOffer?: boolean;
  offerStatus?: 'active' | 'withdrawn' | 'accepted' | string;
  withdrawn?: boolean;
  senderID?: string;
  customOffer?: CustomOffer | null;
  gigID?: string | null;
  gigTitle?: string | null;
  briefID?: string | null;
  briefTitle?: string | null;
  orderID?: string | null;
  orderId?: string | null;
  isOfferAccepted?: boolean;
  isAudio?: boolean;
  audioUrl?: string;
  createdAt: string;
  read?: boolean;
  moderation?: MessageModeration | null;
}

export interface Conversation {
  _id: string;
  id?: string;
  uuid?: string;
  conversationID?: string;
  sellerID: string | User;
  buyerID: string | User;
  seller_username?: string;
  buyer_username?: string;
  lastMessage?: string;
  readBySeller: boolean;
  readByBuyer: boolean;
  tags?: string[];
  updatedAt: string;
  createdAt: string;
}
