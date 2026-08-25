export interface SupportThreadMessage {
  id?: string;
  _id?: string;
  senderId?: string;
  senderRole?: 'user' | 'admin' | string;
  message: string;
  attachments?: Array<{ url: string; name?: string; type?: string }>;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  _id?: string;
  ticketNumber: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'escalated_to_dispute' | 'resolved' | 'closed' | string;
  adminResponded: boolean;
  orderID?: string | null;
  order?: {
    id: string;
    code: string;
    title: string;
    price: string | number;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  messageCount: number;
  createdAt: string;
  messages?: SupportThreadMessage[];
  threads?: {
    creator?: SupportThreadMessage[];
    buyer?: SupportThreadMessage[];
    seller?: SupportThreadMessage[];
  };
}
