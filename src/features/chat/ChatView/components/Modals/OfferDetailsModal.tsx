"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui";
import { parseRevisionNumber } from "@/utils";
import { renderMessageTextWithLinks } from "@/utils/chatHelpers";
import { ViewingOfferDetailsState } from "../../types";

interface OfferDetailsModalProps {
  details: ViewingOfferDetailsState | null;
  messages: any[];
  onClose: () => void;
  onAccept: (offer: any) => void;
  onWithdraw: (msgId: string) => void;
  onViewOrder: (orderId?: string) => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  details,
  messages,
  onClose,
  onAccept,
  onWithdraw,
  onViewOrder,
}) => {
  const [isMounted, setIsMounted] = useState(Boolean(details));
  const [isVisible, setIsVisible] = useState(false);
  const [cachedDetails, setCachedDetails] = useState<ViewingOfferDetailsState | null>(details);

  // Sync mount and visibility states with smooth rAF enter transition
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let timer: ReturnType<typeof setTimeout>;

    if (details) {
      setCachedDetails(details);
      setIsMounted(true);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsMounted(false);
        setCachedDetails(null);
      }, 300);
    }

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(timer);
    };
  }, [details]);

  // Smooth exit transition handler
  const handleRequestClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Body scroll lock and ESC key listener while mounted
  useEffect(() => {
    if (!isMounted) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, handleRequestClose]);

  const activeDetails = details || cachedDetails;
  if (!isMounted || !activeDetails) return null;

  const targetMsg = (messages || []).find(
    (m: any) => String(m._id || m.id) === String(activeDetails.msgId)
  );
  const isOfferWithdrawn = Boolean(
    activeDetails.isWithdrawn ||
    targetMsg?.withdrawn ||
    targetMsg?.offerStatus === "withdrawn"
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end select-none"
      onClick={handleRequestClose}
      role="dialog"
      aria-modal="true"
      aria-label="Custom Proposal Details Drawer"
    >
      {/* Backdrop overlay with smooth fade transition */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-out Drawer Panel with smooth slide transition */}
      <aside
        className={`relative w-full sm:max-w-xl md:max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none select-text ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b border-gray-100 shrink-0">
          <h3 className="text-xl sm:text-2xl font-bold font-sf-pro text-slate-900 tracking-tight">
            Custom Proposal Details
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            onClick={handleRequestClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors p-0 cursor-pointer shrink-0"
            aria-label="Close drawer"
            icon={<FiX size={20} />}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isOfferWithdrawn && (
            <div className="w-full flex items-center gap-2 bg-red-50 text-red-700 border border-red-200/80 rounded-[6px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold font-sf-pro">
              ↩ This offer was withdrawn by the seller.
            </div>
          )}

          {/* Pricing & Terms Summary Card */}
          <div className="grid grid-cols-3 gap-2 bg-emerald-50/70 border border-emerald-200/60 rounded-[6px] p-4 text-center">
            <div className="text-left">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block font-sf-pro">
                Price
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-sf-pro">
                ${activeDetails.offer?.price}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block font-sf-pro">
                Revisions
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 font-sf-pro">
                {parseRevisionNumber(
                  activeDetails.offer?.revision ?? activeDetails.offer?.revisions,
                  0
                ) === 1
                  ? "1 Revision"
                  : `${parseRevisionNumber(
                      activeDetails.offer?.revision ?? activeDetails.offer?.revisions,
                      0
                    )} Revisions`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block font-sf-pro">
                Delivery Time
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 font-sf-pro">
                {activeDetails.offer?.delivery} Days
              </span>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sf-pro">
              Full Description
            </h4>
            <div className="bg-slate-50 border border-slate-200/70 rounded-[6px] p-4 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap font-sf-pro max-h-96 overflow-y-auto">
              {renderMessageTextWithLinks(
                activeDetails.offer?.desc || activeDetails.offer?.description || "No description provided."
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 sm:px-8 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="soft"
            size="md"
            radius="fiverr"
            className="cursor-pointer"
            onClick={handleRequestClose}
          >
            Close
          </Button>

          {activeDetails.acceptedOrder ? (
            <Button
              variant="dark"
              size="md"
              radius="fiverr"
              className="cursor-pointer font-bold"
              onClick={() => {
                const orderId =
                  typeof activeDetails.acceptedOrder === "string"
                    ? activeDetails.acceptedOrder
                    : activeDetails.acceptedOrder?._id;
                handleRequestClose();
                onViewOrder(orderId && orderId !== true ? orderId : undefined);
              }}
            >
              View Order
            </Button>
          ) : isOfferWithdrawn ? (
            <Button
              disabled
              variant="soft"
              size="md"
              radius="fiverr"
              className="cursor-not-allowed select-none opacity-60"
            >
              Withdrawn
            </Button>
          ) : (
            <>
              {activeDetails.isOwner && (
                <Button
                  variant="danger"
                  size="md"
                  radius="fiverr"
                  className="font-bold cursor-pointer"
                  onClick={() => {
                    const msgId = activeDetails.msgId;
                    handleRequestClose();
                    onWithdraw(msgId);
                  }}
                >
                  Withdraw Proposal
                </Button>
              )}
              {!activeDetails.isOwner && (
                <Button
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  className="font-bold cursor-pointer"
                  onClick={() => {
                    const offer = activeDetails.offer;
                    handleRequestClose();
                    onAccept(offer);
                  }}
                >
                  Accept &amp; Proceed to Checkout
                </Button>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
};


