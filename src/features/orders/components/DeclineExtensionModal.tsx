"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

interface DeclineExtensionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  extensionDays?: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const DeclineExtensionModal: React.FC<DeclineExtensionModalProps> = ({
  isOpen,
  isLoading = false,
  extensionDays,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const MAX_CHARS = 500;

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => !isLoading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decline-extension-title"
        className="bg-white rounded-[8px] max-w-lg w-full max-h-[calc(100dvh-2rem)] flex flex-col overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-[6px] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <Clock size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h3 id="decline-extension-title" className="text-xl font-bold text-slate-900 font-inter">
              Decline Extension Request
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 font-inter mt-0.5">
              {extensionDays
                ? `The seller requested an additional ${extensionDays} day${extensionDays > 1 ? "s" : ""}.`
                : "The seller requested additional delivery time."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="decline-reason"
              className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1.5 font-inter"
            >
              Reason for declining <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="decline-reason"
              rows={4}
              maxLength={MAX_CHARS}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are declining extra time (e.g., our marketing campaign launches this Friday)..."
              disabled={isLoading}
              className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] p-3 text-xs sm:text-[13px] text-slate-800 placeholder-slate-400 outline-none transition resize-none font-inter"
            />
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <AlertCircle size={12} />
                Helps the seller understand your project schedule
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {reason.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              radius="fiverr"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 text-slate-700 font-semibold text-xs sm:text-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="dark"
              size="md"
              radius="fiverr"
              disabled={isLoading}
              className="px-5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Declining...
                </>
              ) : (
                "Confirm Decline"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeclineExtensionModal;
