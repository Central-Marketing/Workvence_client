import axios from 'axios';
import axiosFetch from './axiosFetch';

const getAdminApiUrl = () => {
  return process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL || "http://localhost:8082/api";
};

const adminAxiosFetch = axios.create({
  baseURL: getAdminApiUrl(),
  withCredentials: true
});

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'escalated_to_dispute' | 'resolved' | 'closed';
  adminResponded: boolean;
  orderID?: string | null;
  order?: {
    id: string;
    code: string;
    title: string;
    price: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  messageCount: number;
  createdAt: string;
  messages?: any[];
  ticket?: any;
  threads?: {
    creator?: any[];
    buyer?: any[];
    seller?: any[];
  };
}

export const supportService = {
  /**
   * Create a new support ticket
   */
  async createTicket(payload: {
    subject: string;
    message: string;
    category?: string;
    orderID?: string;
    attachments?: any[];
  }) {
    const res = await axiosFetch.post('/support/tickets', payload);
    return res.data;
  },

  /**
   * Get all support tickets submitted by current authenticated user
   */
  async getMyTickets(): Promise<SupportTicketItem[]> {
    const res = await axiosFetch.get('/support/tickets/my-tickets');
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.tickets)) return data.tickets;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  /**
   * Get single support ticket details & thread messages
   */
  async getTicketById(ticketId: string): Promise<SupportTicketItem> {
    const res = await axiosFetch.get(`/support/tickets/${ticketId}`);
    const payload = res.data;
    return payload?.data?.ticket || payload?.ticket || payload?.data || payload;
  },

  /**
   * Reply to an existing support ticket
   */
  async replyTicket(
    ticketId: string,
    payload: { message: string; thread?: string; attachments?: any[] }
  ) {
    const res = await axiosFetch.post(`/support/tickets/${ticketId}/reply`, payload);
    return res.data;
  },

  /**
   * Fetch orders for the current user (for linking orders to tickets)
   */
  async getUserOrders(): Promise<any[]> {
    try {
      const res = await axiosFetch.get('/orders');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.orders)) return data.orders;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get Cloudinary upload signature from admin backend storage service
   */
  async getCloudinarySignature(folder: string = 'support_chat_attachments', type: string = 'authenticated') {
    try {
      const res = await adminAxiosFetch.post('/storage/cloudinary-signature', { folder, type });
      return res.data;
    } catch {
      const fallbackRes = await axiosFetch.post('/storage/cloudinary-signature', { folder, type });
      return fallbackRes.data;
    }
  },

  /**
   * Get a time-limited signed URL for viewing/downloading private Cloudinary attachments
   */
  async getSignedAssetUrl(public_id: string, ticketId?: string, thread: string = 'creator'): Promise<string> {
    if (!public_id) return '';
    try {
      const params: Record<string, string> = { public_id };
      if (ticketId) params.ticketId = ticketId;
      if (thread) params.thread = thread;

      const res = await adminAxiosFetch.get('/storage/signed-url', { params }).catch(() => axiosFetch.get('/storage/signed-url', { params }));
      return res.data?.url || res.data?.signedUrl || '';
    } catch (err) {
      console.warn('Failed to fetch signed asset URL:', err);
      return '';
    }
  },

  /**
   * Upload a File object directly to Cloudinary using signed authentication parameters
   */
  async uploadFileToCloudinary(file: File, folder: string = 'support_chat_attachments') {
    try {
      const sigData = await this.getCloudinarySignature(folder, 'authenticated');
      const sigObj = sigData?.data || sigData;

      if (sigObj && sigObj.signature && sigObj.apiKey && sigObj.cloudName) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigObj.apiKey);
        formData.append('timestamp', String(sigObj.timestamp));
        formData.append('signature', sigObj.signature);
        formData.append('folder', sigObj.folder || folder);
        formData.append('type', 'authenticated');

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigObj.cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (cloudRes.ok) {
          const uploaded = await cloudRes.json();
          return {
            name: file.name,
            public_id: uploaded.public_id,
            url: uploaded.secure_url || uploaded.url,
            secure_url: uploaded.secure_url || uploaded.url,
            bytes: uploaded.bytes || file.size,
            type: file.type || (file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? 'image' : 'file'),
          };
        } else {
          const errJson = await cloudRes.json().catch(() => null);
          console.warn('Cloudinary upload error response:', errJson || cloudRes.statusText);
        }
      }
    } catch (err) {
      console.warn('Cloudinary signed upload failed:', err);
    }

    // Return structured asset representation fallback
    return {
      name: file.name,
      public_id: `support_chat_attachments/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      url: '',
      secure_url: '',
      bytes: file.size,
      type: file.type,
    };
  },

  /**
   * Delete uploaded file from Cloudinary
   */
  async deleteCloudinaryFile(public_id: string) {
    if (!public_id) return;
    try {
      const res = await adminAxiosFetch.post('/storage/delete-file', { public_id }).catch(() => axiosFetch.post('/storage/delete-file', { public_id }));
      return res.data;
    } catch (err) {
      console.warn('Failed to delete Cloudinary file:', err);
    }
  },
};

export default supportService;
