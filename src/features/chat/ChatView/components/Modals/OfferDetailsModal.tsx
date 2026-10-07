"use client";

import React from "react";
import { Button } from "@/components";
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
  if (!details) return null;

  const targetMsg = (messages || []).find(
    (m: any) => String(m._id || m.id) === String(details.msgId)
  );
  const isOfferWithdrawn = Boolean(
    details.isWithdrawn ||
    targetMsg?.withdrawn ||
    targetMsg?.offerStatus === "withdrawn"
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[6px] border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">Custom Proposal Details</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-lg"
            aria-label="Close modal"
          >
            ✕
          </Button>
        </div>

        {isOfferWithdrawn && (
          <div className="w-full flex items-center gap-2 bg-red-50 text-red-700 border border-red-200/80 rounded-[6px] px-3.5 py-2.5 text-xs font-semibold">
            ↩ This offer was withdrawn by the seller.
          </div>
        )}

        <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-200/60 rounded-[6px] p-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Price
            </span>
            <span className="text-2xl font-bold text-emerald-700">
              ${details.offer?.price}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Revisions
            </span>
            <span className="text-base font-bold text-slate-800">
              {parseRevisionNumber(
                details.offer?.revision ?? details.offer?.revisions,
                0
              ) === 1
                ? "1 Revision"
                : `${parseRevisionNumber(
                    details.offer?.revision ?? details.offer?.revisions,
                    0
                  )} Revisions`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Delivery Time
            </span>
            <span className="text-base font-bold text-slate-800">
              {details.offer?.delivery} Days
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Full Description
          </h4>
          <div className="bg-slate-50 border border-slate-200/70 rounded-[6px] p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {renderMessageTextWithLinks(
              details.offer?.desc || details.offer?.description || "No description provided."
            )}
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          {details.acceptedOrder ? (
            <Button
              variant="brand"
              size="md"
              radius="fiverr"
              className="flex-1 font-bold shadow-sm"
              onClick={() => {
                const orderId =
                  typeof details.acceptedOrder === "string"
                    ? details.acceptedOrder
                    : details.acceptedOrder?._id;
                onClose();
                onViewOrder(orderId && orderId !== true ? orderId : undefined);
              }}
            >
              View Order
            </Button>
          ) : isOfferWithdrawn ? (
            <Button
              disabled
              variant="outline"
              size="md"
              radius="fiverr"
              className="flex-1 font-semibold text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed select-none"
            >
              Withdrawn
            </Button>
          ) : (
            <>
              {!details.isOwner && (
                <Button
                  variant="brand"
                  size="md"
                  radius="fiverr"
                  className="flex-1 font-bold shadow-sm"
                  onClick={() => {
                    const offer = details.offer;
                    onClose();
                    onAccept(offer);
                  }}
                >
                  Accept & Proceed to Checkout
                </Button>
              )}
              {details.isOwner && (
                <Button
                  variant="danger"
                  size="md"
                  radius="fiverr"
                  className="flex-1 font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  onClick={() => {
                    const msgId = details.msgId;
                    onClose();
                    onWithdraw(msgId);
                  }}
                >
                  Withdraw Proposal
                </Button>
              )}
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="fiverr"
            className="font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
