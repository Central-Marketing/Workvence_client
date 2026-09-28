"use client";

import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui";
import { NormalizedOrder } from "../types";
import { OrderActivityLedgerDrawer } from "./OrderActivityLedgerDrawer";

interface OrderTimelineStepperProps {
  order: NormalizedOrder;
}

export const OrderTimelineStepper: React.FC<OrderTimelineStepperProps> = ({ order }) => {
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const isDeliveredOrCompleted = order.status === "delivered" || order.status === "completed";
  const isCompleted = order.status === "completed";
  const isLate = order.status === "late";

  const rawActivities = order.raw?.history || order.raw?.ledger || order.raw?.events || [];

  return (
    <div className="bg-[#f5f5f5] rounded-[6px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <h2 className="text-xl font-bold text-[#292929] font-inter">Order Activity Timeline</h2>

        {rawActivities.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setIsLedgerOpen(true)}
            className="!p-0 !h-auto !min-h-0 text-xs font-semibold !text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
            rightIcon={<span>→</span>}
          >
            <span>See Advanced Timeline</span>
          </Button>
        )}
      </div>

      <hr className="text-[#D9D9D9] mt-4 mb-4" />

      <div className="pt-2 relative">
        {/* Step 1: Order Placed and Paid */}
        <div className="flex items-start gap-4 relative pb-9">
          <div className={`absolute left-[23px] top-6 bottom-0 w-0.5 z-0 ${isDeliveredOrCompleted ? "bg-[#005B00]" : "bg-slate-200"}`} />
          <div className="w-12 h-12 rounded-full bg-[#005B00] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="white" strokeWidth="1.5" />
              <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pt-1.5">
            <p className="font-bold text-sm text-slate-900 leading-tight">Order Placed and Paid</p>
            <p className="text-xs text-slate-500 mt-1">Funds secured in escrow. Seller began working.</p>
          </div>
        </div>

        {/* Step 2: Work Delivered */}
        <div className="flex items-start gap-4 relative pb-9">
          <div className={`absolute left-[23px] top-6 bottom-0 w-0.5 z-0 ${isCompleted ? "bg-[#005B00]" : "bg-slate-200"}`} />
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 z-10 shadow-xs ${isDeliveredOrCompleted
              ? "bg-[#005B00] text-white"
              : isLate
                ? "border-2 border-rose-300 bg-rose-50 text-rose-600"
                : "border-2 border-slate-200 bg-white text-slate-500"
              }`}
          >
            {isDeliveredOrCompleted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="white" strokeWidth="1.5" />
                <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              "2"
            )}
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5">
            <div>
              <p className="font-bold text-sm text-slate-900 leading-tight">Work Delivered</p>
              <p className="text-xs text-slate-500 mt-1">Seller submitted work files for review.</p>
            </div>

            {/* Urgency late badge only if status is actually late */}
            {isLate && (
              <div className="bg-[#FFF1F2] border border-[#FECDD3] text-rose-600 text-xs font-semibold px-3 py-1 rounded-[6px] w-fit">
                The Order is late for <span className="font-bold">{order.lateDays || 1} day</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Order Accepted & Completed */}
        <div className="flex items-start gap-4 relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 z-10 ${isCompleted
              ? "bg-[#005B00] text-white shadow-xs"
              : "border-2 border-slate-200 bg-white text-slate-500"
              }`}
          >
            {isCompleted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="white" strokeWidth="1.5" />
                <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              "3"
            )}
          </div>
          <div className="pt-1.5">
            <p className="font-bold text-sm text-slate-900 leading-tight">Order Accepted &amp; Completed</p>
            <p className="text-xs text-slate-500 mt-1">Buyer approved the work. Funds released to seller.</p>
          </div>
        </div>
      </div>

      {/* ORDER ACTIVITY & ESCROW LEDGER SLIDE-OVER DRAWER */}
      <OrderActivityLedgerDrawer
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        order={order}
      />
    </div>
  );
};
