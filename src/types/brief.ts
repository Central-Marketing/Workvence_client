import { User } from './user';

export interface FreelancerProposal {
  _id: string;
  id?: string;
  briefId: string;
  sellerId?: string | User;
  sellerID?: string | User;
  coverLetter?: string;
  price: number;
  deliveryTime: number | string;
  status: 'pending' | 'accepted' | 'rejected' | string;
  createdAt: string;
  [key: string]: any;
}

export interface ClientBrief {
  _id: string;
  id?: string;
  userId?: string | User;
  userID?: string | User;
  title: string;
  description: string;
  category: string;
  budget: number | string;
  deliveryTime?: number | string;
  deadline?: string;
  status?: 'open' | 'in_progress' | 'closed' | string;
  proposalsCount?: number;
  proposalCount?: number;
  proposals?: FreelancerProposal[];
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}
