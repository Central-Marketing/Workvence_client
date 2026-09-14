export interface OrderUser {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  country?: string;
  joinedDate?: string;
}

export interface DeliverableFile {
  name: string;
  size: string;
  url: string;
}

export interface ExtensionRequestData {
  days: number;
  reason: string;
  status?: string;
}

export interface NormalizedOrder {
  id: string;
  orderCode: string;
  orderNumber: number;
  title: string;
  packageTitle: string;
  coverImage: string;
  price: number;
  sellerEarnings?: number;
  status: string;
  paymentStatus: string;
  startedOn: string;
  deliveryTime: string;
  deadline?: string;
  lateDays: number;
  isLate: boolean;
  seller: OrderUser;
  buyer: OrderUser;
  requirements?: {
    q1?: string;
    q2?: string;
    q3?: string;
    submitted?: boolean;
    submittedAt?: string;
  };
  deliveryFiles: DeliverableFile[];
  deliveryMessage?: string;
  extensionRequest: ExtensionRequestData | null;
  revisionReason?: string;
  isUserSeller: boolean;
  isUserBuyer: boolean;
  raw: any;
}
