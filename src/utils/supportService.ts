import axios from 'axios';
import axiosFetch from './axiosFetch';

const getAdminApiUrl = () => {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL || "https://devadmin.workvence.com/api";
};

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  try {
    const match = document.cookie.match(/(?:^|; )\s*(?:accessToken|token|jwt|auth_token)\s*=\s*([^;]+)/i);
    if (match) return decodeURIComponent(match[1]);
    return localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  } catch (e) {
    return "";
  }
};

const adminAxiosFetch = axios.create({
  baseURL: getAdminApiUrl(),
  withCredentials: true
});

adminAxiosFetch.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
    const res = await adminAxiosFetch.post('/admin/support/tickets', payload);
    return res.data;
  },

  /**
   * Get all support tickets submitted by current authenticated user
   */
  async getMyTickets(): Promise<SupportTicketItem[]> {
    const res = await adminAxiosFetch.get('/admin/support/tickets/my-tickets');
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
    const res = await adminAxiosFetch.get(`/admin/support/tickets/${ticketId}`);
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
    const res = await adminAxiosFetch.post(`/admin/support/tickets/${ticketId}/reply`, payload);
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
   * Helper to extract clean public_id from full Cloudinary URL
   */
  extractPublicId(url: string): string {
    if (!url) return '';
    if (!url.includes('cloudinary.com')) return url;
    const match = url.match(/(?:upload|authenticated)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/);
    return match ? match[1] : url;
  },

  /**
   * Get a time-limited signed URL for viewing/downloading private Cloudinary attachments
   */
  async getSignedAssetUrl(public_id: string, ticketId?: string, thread?: string, orderId?: string): Promise<string> {
    if (!public_id) return '';
    try {
      const cleanPublicId = this.extractPublicId(public_id);
      const params: Record<string, string> = { public_id: cleanPublicId };
      if (ticketId) params.ticketId = ticketId;
      if (thread) params.thread = thread;
      if (orderId) params.orderId = orderId;

      const res = await adminAxiosFetch.get('/storage/signed-url', { params }).catch(() => axiosFetch.get('/storage/signed-url', { params }));
      const data = res.data?.data || res.data;
      return data?.url || data?.signedUrl || '';
    } catch (err) {
      console.warn('Failed to fetch signed asset URL:', err);
      return '';
    }
  },

  /**
   * Upload a File object directly to Cloudinary using signed authentication parameters
   */
  async uploadCloudinaryFile(file: File, folder: string = 'chat_attachments') {
    return this.uploadFileToCloudinary(file, folder);
  },

  async uploadFileToCloudinary(file: File, folder: string = 'chat_attachments') {
    try {
      const sigData = await this.getCloudinarySignature(folder, 'authenticated').catch(() => null);
      const sigObj = sigData?.data || sigData;

      if (sigObj && sigObj.signature && sigObj.apiKey && sigObj.cloudName) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigObj.apiKey);
        formData.append('timestamp', String(sigObj.timestamp));
        formData.append('signature', sigObj.signature);
        formData.append('folder', sigObj.folder || folder);
        formData.append('type', sigObj.type || 'authenticated');

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
          console.warn('Cloudinary signed upload response error:', errJson);
        }
      }
    } catch (err) {
      console.warn('Cloudinary signed upload failed:', err);
    }

    // Try ImgBB fallback for image files
    if (file.type?.startsWith('image/')) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY || "6857715a54c637cd1d21c558202e7c9c";
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const url = imgData?.data?.url;
          if (url) {
            return {
              name: file.name,
              public_id: `imgbb_${Date.now()}`,
              url,
              secure_url: url,
              bytes: file.size,
              type: file.type
            };
          }
        }
      } catch (err) {
        console.warn('ImgBB CDN upload fallback failed:', err);
      }
    }

    throw new Error('CDN upload failed. Please try again.');
  },

  /**
   * Delete uploaded file from Cloudinary (accepts public_id or full Cloudinary URL)
   */
  async deleteCloudinaryFile(urlOrPublicId: string) {
    if (!urlOrPublicId) return;

    let public_id = urlOrPublicId;
    if (urlOrPublicId.includes('/upload/')) {
      try {
        const parts = urlOrPublicId.split('/upload/');
        if (parts.length > 1) {
          let pathAfterUpload = parts[1];
          // Strip version tag (e.g. v170000000/)
          pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
          // Strip file extension (.png, .jpg, .pdf)
          const lastDotIndex = pathAfterUpload.lastIndexOf('.');
          if (lastDotIndex !== -1) {
            pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
          }
          public_id = pathAfterUpload;
        }
      } catch (e) {
        console.warn('Failed to parse public_id from URL:', e);
      }
    }

    try {
      const res = await adminAxiosFetch.post('/storage/delete-file', { public_id }).catch(() => axiosFetch.post('/storage/delete-file', { public_id }));
      return res.data;
    } catch (err) {
      console.warn('Failed to delete Cloudinary file:', err);
    }
  },
};

export default supportService;
