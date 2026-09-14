"use client";

import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { NormalizedOrder } from "../types";

interface OrderTimelineStepperProps {
  order: NormalizedOrder;
}

export const OrderTimelineStepper: React.FC<OrderTimelineStepperProps> = ({ order }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isDeliveredOrCompleted = order.status === "delivered" || order.status === "completed";
  const isCompleted = order.status === "completed";
  const isLate = order.status === "late";

  const rawActivities = order.raw?.activities || order.raw?.ledger || order.raw?.events || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Order Activity Timeline</h2>
        {rawActivities.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvanced ? "Hide Advanced Timeline" : "See Advanced Timeline"}</span>
            <span>→</span>
          </button>
        )}
      </div>

      <div className="pt-6 relative">
        {/* Step 1: Order Placed and Paid */}
        <div className="flex gap-4 relative pb-8">
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-bold shrink-0 z-10 shadow-xs">
            <FiCheck />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 leading-tight">Order Placed and Paid</p>
            <p className="text-xs text-slate-500 mt-1">Funds secured in escrow. Seller began working.</p>
          </div>
        </div>

        {/* Step 2: Work Delivered */}
        <div className="flex gap-4 relative pb-8">
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-xs ${
              isDeliveredOrCompleted
                ? "bg-[#10B981] text-white"
                : isLate
                ? "border-2 border-rose-300 bg-rose-50 text-rose-600"
                : "border-2 border-slate-200 bg-white text-slate-400"
            }`}
          >
            {isDeliveredOrCompleted ? <FiCheck /> : "2"}
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold text-sm text-slate-900 leading-tight">Work Delivered</p>
              <p className="text-xs text-slate-500 mt-1">Seller submitted work files for review.</p>
            </div>

            {/* Urgency late badge only if status is actually late */}
            {isLate && (
              <div className="bg-[#FFF1F2] border border-[#FECDD3] text-rose-600 text-xs font-semibold px-3 py-1 rounded-md w-fit">
                The Order is late for <span className="font-bold">{order.lateDays || 1} day</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Order Accepted & Completed */}
        <div className="flex gap-4 relative">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
              isCompleted
                ? "bg-[#10B981] text-white shadow-xs"
                : "border-2 border-slate-200 bg-white text-slate-400"
            }`}
          >
            {isCompleted ? <FiCheck /> : "3"}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 leading-tight">Order Accepted &amp; Completed</p>
            <p className="text-xs text-slate-500 mt-1">Buyer approved the work. Funds released to seller.</p>
          </div>
        </div>
      </div>

      {/* Advanced Activity Log */}
      {showAdvanced && rawActivities.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Detailed Activity History</h4>
          <div className="space-y-3">
            {rawActivities.map((act: any, idx: number) => (
              <div key={idx} className="text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800">{act.title || act.action || "Activity"}</p>
                  <p className="text-slate-600 mt-0.5">{act.desc || act.description || act.message || ""}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{act.date || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
