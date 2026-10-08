"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decline Extension Request"
      isLoading={isLoading}
      footer={
        <>
          <Button
            type="button"
            variant="soft"
            size="md"
            radius="fiverr"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="dark"
            size="md"
            radius="fiverr"
            disabled={isLoading}
            onClick={handleSubmit}
            className="cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin mr-1.5" />
                Declining...
              </>
            ) : (
              "Confirm Decline"
            )}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 font-sf-pro">
          {extensionDays
            ? `The seller requested an additional ${extensionDays} day${extensionDays > 1 ? "s" : ""}.`
            : "The seller requested additional delivery time."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="decline-reason"
              className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1.5 font-sf-pro"
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
              className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] p-3 text-xs sm:text-[13px] text-slate-800 placeholder-slate-400 outline-none transition resize-none font-sf-pro"
            />
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <span className="text-[11px] text-slate-400">
                Helps the seller understand your project schedule
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {reason.length}/{MAX_CHARS}
              </span>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DeclineExtensionModal;

