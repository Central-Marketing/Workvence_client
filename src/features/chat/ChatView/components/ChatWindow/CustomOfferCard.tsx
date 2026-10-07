"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components";
import { parseRevisionNumber } from "@/utils";
import { renderMessageTextWithLinks } from "@/utils/chatHelpers";

interface CustomOfferCardProps {
  offer: any;
  msg: any;
  isOwner: boolean;
  isWithdrawn: boolean;
  isAccepted: boolean;
  targetOrderId?: string | null;
  sellerPackages: any[];
  chatBriefs: any[];
  onReadFullProposal: (
    offer: any,
    msgId: string,
    acceptedOrder: any,
    isOwner: boolean,
    isWithdrawn: boolean
  ) => void;
  onViewOrder: (targetOrderId?: string | null) => void;
  onAcceptOffer: (offer: any) => void;
  onWithdraw: (msgId: string) => void;
}

export const CustomOfferCard: React.FC<CustomOfferCardProps> = ({
  offer,
  msg,
  isOwner,
  isWithdrawn,
  isAccepted,
  targetOrderId,
  sellerPackages,
  chatBriefs,
  onReadFullProposal,
  onViewOrder,
  onAcceptOffer,
  onWithdraw,
}) => {
  return (
    <div
      className={`w-[410px] max-w-full p-5 flex flex-col justify-center items-start gap-5 shadow-sm custom-gradient-card ${
        isWithdrawn ? "opacity-80" : ""
      }`}
      style={{
        borderRadius: "20px",
        border: "3px solid transparent",
        background:
          "linear-gradient(#FFF, #FFF) padding-box, linear-gradient(135deg, #00A6FF 0%, #3ED419 50%, #F29EFF 100%) border-box",
        WebkitBackgroundClip: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {isWithdrawn && (
        <p className="text-xs text-red-600 italic font-medium m-0">
          ↩ This offer was withdrawn by the seller.
        </p>
      )}

      {isAccepted && (
        <div className="w-full flex items-center justify-between gap-2 bg-white text-emerald-800 border border-[rgba(0,0,0,0.10)] rounded-[6px] px-3.5 py-2 text-xs font-bold">
          <span className="flex items-center gap-1">
            <Check size={20} /> Custom Proposal Accepted
          </span>
          {targetOrderId && (
            <span className="text-[11px] font-mono text-emerald-700">
              Order #{String(targetOrderId).slice(-6)}
            </span>
          )}
        </div>
      )}

      {/* Top Row: Package/Offer Title + Price */}
      <div className="w-full flex items-start justify-between gap-4">
        <h4 className="text-[17px] sm:text-[18px] font-bold text-slate-900 leading-[1.3] flex-1 min-w-0 pr-2">
          {offer.packageTitle ||
            offer.gigTitle ||
            offer.title ||
            (offer.packageID &&
              sellerPackages.find((p: any) => (p._id || p.id) === offer.packageID)?.title) ||
            (offer.briefID &&
              chatBriefs.find((b: any) => (b._id || b.id) === offer.briefID)?.title) ||
            "I will help you design better landing landing pages"}
        </h4>
        <div className="text-[26px] sm:text-[28px] font-bold text-black shrink-0 leading-none">
          ${offer.price}
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

      {/* Middle Section: Title + Description + Read Full Proposal */}
      <div className="w-full flex flex-col gap-2">
        <span className="text-[15px] font-medium text-slate-900">Title</span>
        <p className="text-[14px] text-slate-600 leading-relaxed m-0 font-normal">
          {renderMessageTextWithLinks(
            offer.desc ||
              "1 Screen -Clean Dashboard UI UX design - Developer-ready Figma files - Unlimited revisions"
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onReadFullProposal(
              offer,
              msg._id || msg.id,
              isAccepted ? targetOrderId || true : null,
              isOwner,
              isWithdrawn
            );
          }}
          className="text-[14px] font-medium text-[#007A64] hover:text-[#005c4b] hover:!bg-transparent !p-0 !min-h-0 !h-auto flex items-center gap-1.5 w-fit mt-0.5"
          rightIcon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          }
        >
          <span>Read Full Proposal</span>
        </Button>
      </div>

      <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

      {/* Inclusions Row: Header + Revisions + Delivery */}
      <div className="w-full flex flex-col gap-3">
        <span className="text-[15px] font-medium text-slate-900">The offer includes</span>
        <div className="flex items-center gap-6 text-[14px] text-slate-700 flex-wrap">
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#292929"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            <span>
              {parseRevisionNumber(offer.revision ?? offer.revisions, 0) === 1
                ? "1 Revision"
                : `${parseRevisionNumber(offer.revision ?? offer.revisions, 0)} Revisions`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#292929"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            <span>{offer.delivery} Day Delivery</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full pt-1">
        {isAccepted ? (
          <Button
            type="button"
            variant="dark"
            size="md"
            fullWidth
            radius="fiverr"
            rightIcon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            }
            onClick={() => onViewOrder(targetOrderId)}
            className="h-10 font-semibold shadow-xs"
          >
            View Order
          </Button>
        ) : isWithdrawn ? (
          <div className="w-full h-10 rounded-[6px] font-semibold text-[15px] bg-[#F3F4F6] text-slate-400 flex items-center justify-center select-none">
            Withdrawn
          </div>
        ) : !isOwner ? (
          <Button
            type="button"
            variant="dark"
            size="md"
            fullWidth
            radius="fiverr"
            rightIcon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            }
            onClick={() => onAcceptOffer(offer)}
            className="h-10 font-semibold shadow-xs"
          >
            Accept Offer
          </Button>
        ) : (
          <Button
            type="button"
            variant="soft"
            size="md"
            fullWidth
            radius="fiverr"
            onClick={() => onWithdraw(msg._id || msg.id)}
            className="h-10 font-semibold text-[#1E293B] shadow-xs"
          >
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
};
