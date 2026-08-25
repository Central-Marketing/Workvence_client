import { Order } from './order';

export interface PayoutMethodStatus {
  isConnected: boolean;
  accountId?: string | null;
  payeeId?: string | null;
  payoutsEnabled?: boolean;
  canPayout?: boolean;
  status?: string;
}

export interface UnifiedPayoutStatus {
  error: boolean;
  availableMethods: string[];
  stripe?: PayoutMethodStatus;
  payoneer?: PayoutMethodStatus;
}

export interface PayoutHistoryItem {
  _id: string;
  id?: string;
  amount: number;
  currency?: string;
  method: 'stripe' | 'payoneer' | string;
  status: 'pending' | 'completed' | 'failed' | string;
  createdAt: string;
}

export interface SellerEarningsStatement {
  orders: Order[];
  summary: {
    totalEarned?: number;
    availableForWithdrawal?: number;
    pendingClearance?: number;
    withdrawn?: number;
  };
}
