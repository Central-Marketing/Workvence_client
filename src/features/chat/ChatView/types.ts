export interface ChatAttachment {
  name?: string;
  url?: string;
  previewUrl?: string;
  size?: number;
  type?: string;
  public_id?: string;
  secure_url?: string;
}

export interface AttachmentMetaItem {
  url: string;
  name: string;
  size: number;
  type: string;
  publicId?: string;
}

export interface CustomOfferPayload {
  packageID?: string;
  briefID?: string;
  title?: string;
  packageTitle?: string;
  gigTitle?: string;
  desc?: string;
  description?: string;
  price: number | string;
  delivery: number | string;
  revisions?: number | string;
  revision?: number | string;
  sellerID?: string;
  [key: string]: any;
}

export interface MeetingPayload {
  meetingId?: string;
  roomUrl?: string;
  joinUrl?: string;
  title?: string;
  hostEmail?: string;
  password?: string;
  passcode?: string;
  isPrivate?: boolean;
  autoRecording?: string;
  createdAt?: string;
  status?: string;
  description?: string;
  [key: string]: any;
}

export interface ViewingOfferDetailsState {
  offer: CustomOfferPayload;
  msgId: string;
  acceptedOrder: any;
  isOwner: boolean;
  isWithdrawn: boolean;
}

export interface MediaFileItem {
  id?: string;
  name: string;
  sizeText: string | null;
  url: string;
  mimeType?: string;
  type?: 'image' | 'video' | 'audio' | 'document' | string;
  sizeBytes?: number;
  createdAt?: string;
  messageId?: string;
  sender?: {
    id?: string;
    username?: string;
    image?: string;
  };
}

export interface MediaItemDTO {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  type: 'image' | 'video' | 'audio' | 'document' | string;
  sizeBytes: number;
  createdAt: string;
  messageId?: string;
  sender?: {
    id: string;
    username: string;
    image?: string;
  };
}

export interface MediaGalleryResponse {
  success: boolean;
  media: MediaItemDTO[];
  total: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface ConversationCursorResponse {
  success: boolean;
  conversations: any[];
  hasMore: boolean;
  nextCursor: string | null;
}
