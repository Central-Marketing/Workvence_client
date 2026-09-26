"use client";

import React, { useState } from "react";
import { axiosFetch } from "@/utils";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";

const SubmitProposalModal = ({ brief, onClose, onSuccess }: any) => {
  const [price, setPrice] = useState(brief?.budget || "");
  const [deliveryTime, setDeliveryTime] = useState(brief?.deliveryTime || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !deliveryTime || !coverLetter) {
      setErrorMsg("Please fill in price, delivery time, and cover letter!");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const briefId = brief?._id || brief?.id;
      const response = await axiosFetch.post(
        `/briefs/${briefId}/proposals`,
        {
          price: Number(price),
          deliveryTime: Number(deliveryTime),
          coverLetter,
          attachments: attachmentUrl ? [attachmentUrl] : []
        }
      );
      if (!response.data.error) {
        toast.success("Proposal submitted successfully!", { id: "proposal-submitted" });
        onSuccess(response.data.proposal || response.data);
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Proposal submission failed.";
      setErrorMsg(msg);

      if (msg.toLowerCase().includes("already submitted")) {
        setTimeout(() => {
          onSuccess(null, true);
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[620px] max-h-[calc(100vh-40px)] rounded-[6px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center py-4 px-6 border-b border-gray-100 bg-white shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-950 truncate font-sf-pro">
              Submit Proposal
            </h3>
            {brief?.title && (
              <p className="text-xs text-gray-400 truncate mt-0.5 font-normal">
                For: {brief.title}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            className="w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 border-none shadow-none shrink-0"
            onClick={onClose}
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 p-3 rounded-[6px] text-xs sm:text-[13px] border border-red-200 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Offer Price */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
              Your Offer Price ($)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 font-semibold text-sm pointer-events-none">
                $
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 250"
                required
                min={1}
                className="w-full h-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] pl-8 pr-3.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors font-medium"
              />
            </div>
          </div>

          {/* Delivery Time */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
              Delivery Time (Days)
            </label>
            <input
              type="number"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="e.g. 4"
              required
              min={1}
              className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors font-medium"
            />
          </div>

          {/* Cover Letter */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
              Cover Letter & Proposal Pitch
            </label>
            <textarea
              rows={8}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you are the best fit for this project, your approach, and experience..."
              required
              className="w-full bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors font-normal resize-y min-h-[110px]"
            />
          </div>

          {/* Attachment URL */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
              Work Sample / Attachment URL <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://example.com/portfolio.pdf"
              className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors font-normal"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-1">
            <Button
              type="button"
              variant="soft"
              size="md"
              radius="fiverr"
              onClick={onClose}
              disabled={loading}
              className="font-semibold text-xs sm:text-[13px] bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="dark"
              size="md"
              radius="fiverr"
              disabled={loading}
              isLoading={loading}
              loadingText="Submitting..."
              className="py-2.5 px-6 font-semibold text-xs sm:text-[13px] shadow-xs"
            >
              Submit Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProposalModal;
