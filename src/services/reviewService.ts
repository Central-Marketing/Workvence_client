import { axiosFetch } from "@/utils";

export interface SubmitSellerReplyParams {
  reviewId?: string;
  orderId?: string;
  reply: string;
}

export interface ReviewReplyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Submit or update a seller's public reply to a buyer's review.
 * Supports both /reviews/:reviewId/reply and /reviews/order/:orderId/reply.
 */
export async function submitSellerReviewReply(
  params: SubmitSellerReplyParams
): Promise<ReviewReplyResponse> {
  const { reviewId, orderId, reply } = params;
  const trimmedReply = reply.trim();

  if (!trimmedReply) {
    return { success: false, error: "Reply text cannot be empty." };
  }

  if (trimmedReply.length > 1000) {
    return { success: false, error: "Reply text cannot exceed 1,000 characters." };
  }

  const payload = { reply: trimmedReply };

  // 1. Try reviewId endpoint if reviewId is present
  if (reviewId) {
    try {
      const res = await axiosFetch.post(`/reviews/${reviewId}/reply`, payload);
      return { success: true, data: res.data?.review || res.data?.data || res.data };
    } catch (err: any) {
      // If error is 404 and orderId is available, fallback to orderId route
      if ((err?.response?.status === 404 || err?.response?.status === 400) && orderId) {
        try {
          const res = await axiosFetch.post(`/reviews/order/${orderId}/reply`, payload);
          return { success: true, data: res.data?.review || res.data?.data || res.data };
        } catch (orderErr: any) {
          const msg = orderErr?.response?.data?.message || orderErr?.message || "Failed to post reply.";
          return { success: false, error: Array.isArray(msg) ? msg.join(", ") : msg };
        }
      }
      const msg = err?.response?.data?.message || err?.message || "Failed to post reply.";
      return { success: false, error: Array.isArray(msg) ? msg.join(", ") : msg };
    }
  }

  // 2. Otherwise try orderId endpoint
  if (orderId) {
    try {
      const res = await axiosFetch.post(`/reviews/order/${orderId}/reply`, payload);
      return { success: true, data: res.data?.review || res.data?.data || res.data };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to post reply.";
      return { success: false, error: Array.isArray(msg) ? msg.join(", ") : msg };
    }
  }

  return { success: false, error: "Neither review ID nor order ID was provided." };
}
