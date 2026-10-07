"use client";

import React from "react";
import { Button } from "@/components";

interface LightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Enlarged preview"
          className="max-w-full max-h-[90vh] object-contain rounded-[6px] shadow-2xl"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="full"
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black/60 hover:bg-black/90 w-8 h-8 font-bold"
          aria-label="Close preview"
        >
          ✕
        </Button>
      </div>
    </div>
  );
};
