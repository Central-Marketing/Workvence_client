"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

interface KycRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const KycRequiredModal: React.FC<KycRequiredModalProps> = ({
  isOpen,
  onClose,
  title = "Identity Verification Required",
  description = "To withdraw your earnings, you must complete a one-time identity verification.",
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[6px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="full"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer w-8 h-8 min-h-[32px] p-0"
          icon={<X size={20} />}
        />

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-[6px] bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 text-amber-600 shadow-xs">
          <ShieldAlert size={32} strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="xl"
            onClick={onClose}
            className="flex-1 text-slate-700 font-semibold text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            size="md"
            radius="xl"
            onClick={() => {
              onClose();
              router.push("/kyc");
            }}
            className="flex-1 font-bold text-sm shadow-md hover:shadow-lg"
            rightIcon={<ArrowRight size={16} />}
          >
            Verify Identity Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KycRequiredModal;
