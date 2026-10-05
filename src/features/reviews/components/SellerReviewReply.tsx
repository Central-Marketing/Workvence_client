"use client";

import React, { useState, useEffect } from "react";
import moment from "moment";
import { CornerDownRight, MessageSquareReply, Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { submitSellerReviewReply } from "@/services/reviewService";

export interface SellerReviewReplyProps {
  reviewId?: string;
  orderId?: string;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  sellerName?: string;
  sellerAvatar?: string;
  canReply?: boolean;
  onReplySuccess?: (updatedReply: { sellerReply: string; sellerReplyAt: string }) => void;
  className?: string;
}

export const SellerReviewReply: React.FC<SellerReviewReplyProps> = ({
  reviewId,
  orderId,
  sellerReply: initialSellerReply,
  sellerReplyAt: initialSellerReplyAt,
  sellerName = "Seller",
  sellerAvatar = "/media/noavatar.png",
  canReply = false,
  onReplySuccess,
  className = "",
}) => {
  const queryClient = useQueryClient();

  const [currentReply, setCurrentReply] = useState<string | null>(initialSellerReply || null);
  const [currentReplyAt, setCurrentReplyAt] = useState<string | null>(initialSellerReplyAt || null);

  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentReply(initialSellerReply || null);
    setCurrentReplyAt(initialSellerReplyAt || null);
  }, [initialSellerReply, initialSellerReplyAt]);

  // Open edit / reply form
  const handleOpenForm = () => {
    setReplyInput(currentReply || "");
    setIsReplying(true);
  };

  const handleCancel = () => {
    setIsReplying(false);
    setReplyInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyInput.trim();

    if (!trimmed) {
      toast.error("Please enter a reply before posting.");
      return;
    }

    if (trimmed.length > 1000) {
      toast.error("Reply cannot exceed 1,000 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSellerReviewReply({
        reviewId,
        orderId,
        reply: trimmed,
      });

      if (res.success) {
        const nowIso = new Date().toISOString();
        const updatedText = res.data?.sellerReply || trimmed;
        const updatedTime = res.data?.sellerReplyAt || nowIso;

        setCurrentReply(updatedText);
        setCurrentReplyAt(updatedTime);
        setIsReplying(false);

        toast.success(currentReply ? "Response updated successfully!" : "Reply posted successfully!");

        // Invalidate reviews query cache across app
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
        if (orderId) {
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        }

        onReplySuccess?.({
          sellerReply: updatedText,
          sellerReplyAt: updatedTime,
        });
      } else {
        toast.error(res.error || "Failed to post reply.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to post reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's no reply and user can't reply, don't render anything
  if (!currentReply && !canReply) {
    return null;
  }

  return (
    <div className={`mt-3 ${className}`}>
      {/* 1. Reply Form (Inline) */}
      {isReplying ? (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FAFBFB] border border-gray-200/90 rounded-[6px] p-4 sm:p-5 space-y-3 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5 text-[#0D6D5F]">
              <MessageSquareReply className="w-3.5 h-3.5" />
              {currentReply ? "Edit Response to Client" : "Reply to Client Review"}
            </span>
            <span
              className={`text-xs ${replyInput.length > 900 ? "text-amber-600 font-bold" : "text-gray-400"
                }`}
            >
              {replyInput.length} / 1,000
            </span>
          </div>

          <textarea
            rows={3}
            maxLength={1000}
            placeholder="Thank the client and share your feedback..."
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white border border-gray-200 focus:border-[#0D6D5F] focus:ring-1 focus:ring-[#0D6D5F]/20 rounded-[6px] p-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-y disabled:opacity-60"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-3.5 h-10 bg-gray-100 text-[16px] font-medium text-gray-600 hover:text-gray-900 rounded-[6px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyInput.trim() || isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 h-10 text-[16px] font-semibold bg-[#0D6D5F] hover:bg-[#0b5c50] text-white rounded-[6px] transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>{currentReply ? "Save Changes" : "Post Reply"}</span>
              )}
            </button>
          </div>
        </form>
      ) : currentReply ? (
        /* 2. Display Nested Seller Response */
        <div className="ml-2 sm:ml-4 pl-3.5 sm:pl-4 py-3 pr-4 bg-[#ffffff] border border-[rgba(0,0,0,0.10)] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <img
                src={sellerAvatar || "/media/noavatar.png"}
                alt={sellerName}
                className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/media/noavatar.png";
                }}
              />
              <span className="text-xs font-bold text-gray-900 font-sf-pro">
                Response from {sellerName}
              </span>
              {currentReplyAt && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] text-gray-400 font-normal">
                    {moment(currentReplyAt).isValid()
                      ? moment(currentReplyAt).fromNow()
                      : String(currentReplyAt)}
                  </span>
                </>
              )}
            </div>

            {/* {canReply && (
              <button
                type="button"
                onClick={handleOpenForm}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D6D5F] hover:text-[#0b5c50] hover:underline cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )} */}
          </div>

          <p className="text-xs sm:text-[14px] text-[#292929] leading-relaxed font-normal font-sf-pro">
            {currentReply}
          </p>
        </div>
      ) : canReply ? (
        /* 3. "Reply to Review" trigger button for the seller */
        <div className="pt-1">
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D6D5F] hover:text-[#0b5c50] hover:underline py-1 cursor-pointer transition-colors"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Reply to Review</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SellerReviewReply;
