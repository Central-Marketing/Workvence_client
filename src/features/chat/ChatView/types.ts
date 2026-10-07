export interface ChatAttachment {
  name?: string;
  url?: string;
  previewUrl?: string;
  size?: number;
  type?: string;
  public_id?: string;
  secure_url?: string;
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
  name: string;
  sizeText: string | null;
  url: string;
}
