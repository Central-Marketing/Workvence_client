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
    const match = document.cookie.match(/(?:^|; )\s*accessToken\s*=\s*([^;]+)/i);
    if (match) return decodeURIComponent(match[1]);
    return localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  } catch {
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

export interface SupportParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'creator' | 'admin';
}

export interface SupportMessage {
  id: string;
  sender: string;
  senderID: string;
  role: 'admin' | 'buyer' | 'seller' | 'creator' | 'system';
  message: string;
  attachments?: any[];
  createdAt: string;
  thread?: string;
}

export interface SupportTicketItem {
  id: string;
  _id?: string;
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
  messageCount?: number;
  createdAt: string;
  messages: SupportMessage[];
  participants: SupportParticipant[];
  disputeID?: string | null;
  ticket?: any;
  /** @deprecated use `messages` instead */
  threads?: {
    creator?: any[];
    buyer?: any[];
    seller?: any[];
    group?: any[];
    directBuyerSellerChat?: any[];
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
    const normalize = (list: any[]) => {
      if (!Array.isArray(list)) return [];
      return list.map((t: any) => {
        const id = String(t.id || t._id || "");
        const ticketNumber = t.ticketNumber || (id ? `#TK-${id.substring(0, 6).toUpperCase()}` : "#TK-000000");
        return {
          ...t,
          id,
          _id: t._id || id,
          ticketNumber,
        };
      });
    };

    // 1. Try /admin/support/tickets/my-tickets
    let myTicketsList: any[] = [];
    try {
      const res = await adminAxiosFetch.get('/admin/support/tickets/my-tickets');
      const data = res.data;
      myTicketsList = Array.isArray(data)
        ? data
        : Array.isArray(data?.tickets)
          ? data.tickets
          : Array.isArray(data?.data?.tickets)
            ? data.data.tickets
            : Array.isArray(data?.data)
              ? data.data
              : [];
    } catch (err) {
      console.warn("Could not fetch from /my-tickets:", err);
    }

    if (myTicketsList.length > 0) {
      return normalize(myTicketsList);
    }

    // 2. If my-tickets returned empty (e.g. admin user or participant query), fallback to /admin/support/tickets
    try {
      const res = await adminAxiosFetch.get('/admin/support/tickets');
      const data = res.data;
      const allList = Array.isArray(data)
        ? data
        : Array.isArray(data?.tickets)
          ? data.tickets
          : Array.isArray(data?.data?.tickets)
            ? data.data.tickets
            : Array.isArray(data?.data)
              ? data.data
              : [];
      return normalize(allList);
    } catch {
      return [];
    }
  },

  /**
   * Get single support ticket details & shared messages
   */
  async getTicketById(ticketId: string): Promise<SupportTicketItem> {
    const res = await adminAxiosFetch.get(`/admin/support/tickets/${ticketId}`);
    const payload = res.data;
    const ticketObj = payload?.data?.ticket || payload?.ticket || payload?.data || payload;
    if (ticketObj) {
      if (!ticketObj.messages && Array.isArray(ticketObj.threads?.group)) {
        ticketObj.messages = ticketObj.threads.group;
      }
      if (!Array.isArray(ticketObj.messages)) {
        ticketObj.messages = [];
      }
      if (!Array.isArray(ticketObj.participants)) {
        ticketObj.participants = [];
      }
    }
    return ticketObj;
  },

  /**
   * Reply to an existing support ticket (shared conversation)
   */
  async replyTicket(
    ticketId: string,
    payload: { message?: string; attachments?: any[]; thread?: string }
  ) {
    const text = payload.message?.trim();
    const cleanPayload: { message: string; attachments?: any[]; thread?: string } = {
      message: text && text.length > 0 ? text : 'attachment',
      thread: payload.thread,
    };
    if (payload.attachments && payload.attachments.length > 0) {
      cleanPayload.attachments = payload.attachments;
    }
    const res = await adminAxiosFetch.post(`/admin/support/tickets/${ticketId}/reply`, cleanPayload);
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
   * Get Cloudinary upload signature from backend storage service
   */
  async getCloudinarySignature(folder: string = 'chat_attachments', type: string = 'upload') {
    const foldersToTry = [folder, 'chat_attachments', 'uploads'];
    const uniqueFolders = Array.from(new Set(foldersToTry));

    for (const f of uniqueFolders) {
      try {
        const res = await axiosFetch.post('/storage/cloudinary-signature', { folder: f, type });
        if (res.data?.data?.signature || res.data?.signature) {
          return res.data;
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || '';
        if (msg.includes('not permitted')) {
          continue;
        }
        try {
          const fallbackRes = await adminAxiosFetch.post('/storage/cloudinary-signature', { folder: f, type });
          if (fallbackRes.data?.data?.signature || fallbackRes.data?.signature) {
            return fallbackRes.data;
          }
        } catch {}
      }
    }

    try {
      const fallbackRes = await adminAxiosFetch.post('/storage/cloudinary-signature', { folder: 'chat_attachments', type });
      return fallbackRes.data;
    } catch {
      return null;
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
  async uploadCloudinaryFile(file: File, folder: string = 'chat_attachments', customType?: string) {
    return this.uploadFileToCloudinary(file, folder, customType);
  },

  async uploadFileToCloudinary(file: File, folder: string = 'chat_attachments', customType?: string) {
    const isPrivate = folder === 'kyc_documents';
    const uploadType = customType || (isPrivate ? 'authenticated' : 'upload');

    try {
      const sigData = await this.getCloudinarySignature(folder, uploadType).catch(() => null);
      const sigObj = sigData?.data || sigData;

      if (sigObj && sigObj.signature && sigObj.apiKey && sigObj.cloudName) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigObj.apiKey);
        formData.append('timestamp', String(sigObj.timestamp));
        formData.append('signature', sigObj.signature);
        formData.append('folder', sigObj.folder || folder);
        if (sigObj.type || uploadType) {
          formData.append('type', sigObj.type || uploadType);
        }

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
