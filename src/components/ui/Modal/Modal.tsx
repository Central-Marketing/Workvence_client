"use client";

import React, { ReactNode, useEffect, useId } from "react";
import { X } from "lucide-react";
import { Button } from "../Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string; // defaults to 'max-w-[700px]'
  isLoading?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-[700px]",
  isLoading = false,
  showCloseButton = true,
  className = "",
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => !isLoading && onClose()}
    >
      {/* 3px Gradient Border Outer Shell */}
      <div
        className={`w-full ${maxWidth} p-[3px] rounded-[6px] shadow-[0_0_54px_0_rgba(0,0,0,0.15)] bg-gradient-to-br from-[#00A6FF] via-[#3ED419] to-[#F29EFF] animate-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner White Container */}
        <div className="bg-white rounded-[3px] p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 max-h-[calc(100dvh-3rem)] overflow-y-auto">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <h3 id={titleId} className="text-xl sm:text-2xl font-bold text-gray-950 font-sf-pro tracking-tight">
                {title}
              </h3>
              {showCloseButton && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  radius="full"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors p-0 shrink-0 cursor-pointer"
                  aria-label="Close modal"
                  icon={<X size={20} />}
                />
              )}
            </div>
          )}

          {/* Body Content */}
          <div className="text-sm sm:text-base text-slate-600 leading-relaxed font-sf-pro select-text">
            {children}
          </div>

          {/* Footer Actions */}
          {footer && (
            <div className="flex items-center justify-end gap-3 pt-2 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
