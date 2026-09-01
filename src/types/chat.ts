import { User } from './user';

export interface CustomOffer {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number | string;
  deliveryTime: number | string;
  revisionNumber?: number | string;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | string;
  packageId?: string;
  briefId?: string;
}

export interface MeetingInvite {
  meetingId: string;
  roomUrl: string;
  title: string;
  hostEmail?: string;
  isPrivate?: boolean;
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
  customOffer?: CustomOffer | null;
  isAudio?: boolean;
  audioUrl?: string;
  createdAt: string;
  read?: boolean;
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
  updatedAt: string;
  createdAt: string;
}
