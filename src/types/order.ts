import { User } from './user';
import { GigPackage } from './gig';

export type OrderStatus = 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed' | 'revision' | string;

export interface OrderDeliveryFile {
  name: string;
  url: string;
  size?: number;
  public_id?: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber?: string;
  code?: string;
  gigID?: string | GigPackage;
  packageID?: string | GigPackage;
  title: string;
  price: number;
  sellerID: string | User;
  buyerID: string | User;
  status: OrderStatus;
  deadline?: string;
  deliveryTime?: number | string;
  deliveryText?: string;
  deliveryFiles?: OrderDeliveryFile[];
  deliveredAt?: string;
  completedAt?: string;
  revisionsUsed?: number;
  revisionNumber?: number | string;
  isCompleted?: boolean;
  packageType?: 'basic' | 'standard' | 'premium' | string;
  hasReview?: boolean;
  createdAt: string;
  updatedAt: string;
}
