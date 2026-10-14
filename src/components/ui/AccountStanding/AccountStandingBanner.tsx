"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, AlertOctagon, ArrowRight, Clock } from "lucide-react";
import { useAccountStanding } from "@/hooks/useAccountStanding";

interface AccountStandingBannerProps {
  className?: string;
}

export const AccountStandingBanner: React.FC<AccountStandingBannerProps> = ({ className = "" }) => {
  const {
    standing,
    isSuspended,
    isGraceActive,
    isGraceExpired,
    graceDaysLeft,
    formattedAccessDeadline,
    isWarningActive,
    warningDaysLeft,
    warningReason,
    suspensionReason,
    suspensionCount,
    warningCount,
  } = useAccountStanding();

  // If in good standing, do not display a banner
  if (standing === "good") {
    return null;
  }

  // 1. Suspension Banner with Active Grace Window
  if ((standing === "suspended" || isSuspended) && isGraceActive) {
    return (
      <div
        role="alert"
        className={`w-full bg-[#FFE7E5] border border-[#FCD2CD] rounded-[6px] p-2.5 sm:p-3 shadow-xs transition-all ${className}`}
      >
        {/* Floating White Card */}
        <div className="bg-white rounded-[6px] border border-[#F6DCD8]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Left Side Icon Badge */}
            <div className="w-9 h-9 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#D05756] shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                  Account Standing: Suspended
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#FAB0B0] text-black font-semibold">
                  Grace Period: {graceDaysLeft} {graceDaysLeft === 1 ? "Day" : "Days"} Left
                </span>
              </div>

              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Your account is suspended. You have <strong>{graceDaysLeft} days remaining until {formattedAccessDeadline}</strong> to complete and deliver your running orders. After this deadline, your account will be fully locked.
              </p>

              {suspensionReason && (
                <p className="text-xs text-amber-800 mt-1">
                  Reason: {suspensionReason}
                </p>
              )}

              {suspensionCount && suspensionCount > 1 && (
                <p className="text-[11px] text-amber-700/90 font-medium mt-1">
                  Suspension incident: #{suspensionCount}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Link
              href="/manage-orders"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1 active:scale-98"
            >
              <span>Running Orders</span>
              <ArrowRight className="w-3 h-3 text-neutral-500" />
            </Link>
            <Link
              href="/support"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/60 rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-98"
            >
              <span>Customer Support</span>
              <ArrowRight className="w-3 h-3 text-neutral-600" />
            </Link>
          </div>
        </div>

        {/* Centered Footer Notification */}
        <div className="pt-2 pb-0.5 text-center">
          <p className="text-xs text-neutral-500 font-normal">
            New packages & payouts frozen • Fulfillment access active until{" "}
            <span className="font-semibold text-rose-600">{formattedAccessDeadline}</span>
          </p>
        </div>
      </div>
    );
  }

  // 2. Suspension Banner with Expired Grace Window (Lockout Active)
  if ((standing === "suspended" || isSuspended) && isGraceExpired) {
    return (
      <div
        role="alert"
        className={`w-full bg-[#FFE7E5] border border-[#FCD2CD] rounded-[6px] p-2.5 sm:p-3 shadow-xs transition-all ${className}`}
      >
        {/* Floating White Card */}
        <div className="bg-white rounded-[6px] border border-[#F6DCD8]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Left Side Icon Badge */}
            <div className="w-9 h-9 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#D05756] shrink-0">
              <AlertOctagon className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                  Account Standing: Suspended
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-rose-200 text-rose-950 font-semibold">
                  Grace Expired
                </span>
              </div>

              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Your suspension grace period ended on <strong>{formattedAccessDeadline}</strong>. The fulfillment access window has expired and your account is locked.
              </p>

              {suspensionReason && (
                <p className="text-xs text-rose-700 mt-1">
                  Reason: {suspensionReason}
                </p>
              )}

              {suspensionCount && suspensionCount > 1 && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Suspension incident: #{suspensionCount}
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Link
              href="/support"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/60 rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-98"
            >
              <span>Customer Support</span>
              <ArrowRight className="w-3 h-3 text-neutral-600" />
            </Link>
          </div>
        </div>

        {/* Centered Footer Notification */}
        <div className="pt-2 pb-0.5 text-center">
          <p className="text-xs text-neutral-500 font-normal">
            Account access locked • Please contact support to submit an appeal
          </p>
        </div>
      </div>
    );
  }

  // 3. Standard Suspension Banner (Legacy or indefinite without accessUntil)
  if (standing === "suspended" || isSuspended) {
    return (
      <div
        role="alert"
        className={`w-full bg-[#FFE7E5] border border-[#FCD2CD] rounded-[6px] p-2.5 sm:p-3 shadow-xs transition-all ${className}`}
      >
        {/* Floating White Card */}
        <div className="bg-white rounded-[6px] border border-[#F6DCD8]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Left Side Icon Badge */}
            <div className="w-9 h-9 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#D05756] shrink-0">
              <AlertOctagon className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                  Account Standing: Suspended
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-rose-200/70 text-rose-800 font-medium">
                  Restricted Fulfillment Mode
                </span>
              </div>

              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {suspensionReason
                  ? `Reason: ${suspensionReason}`
                  : "Your account is temporarily suspended due to a terms or policy violation."}
              </p>

              {suspensionCount && suspensionCount > 1 && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Suspension incident: #{suspensionCount}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Link
              href="/manage-orders"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1 active:scale-98"
            >
              <span>Running Orders</span>
              <ArrowRight className="w-3 h-3 text-neutral-500" />
            </Link>
            <Link
              href="/support"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/60 rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-98"
            >
              <span>Customer Support</span>
              <ArrowRight className="w-3 h-3 text-neutral-600" />
            </Link>
          </div>
        </div>

        {/* Centered Footer Notification */}
        <div className="pt-2 pb-0.5 text-center">
          <p className="text-xs text-neutral-500 font-normal">
            New packages & payouts frozen • In-progress order completion allowed
          </p>
        </div>
      </div>
    );
  }

  // 4. Active Warning Banner
  if (standing === "warning" || isWarningActive) {
    return (
      <div
        role="alert"
        className={`w-full bg-[#FFE7E5] border border-[#FCD2CD] rounded-[6px] p-2.5 sm:p-3 shadow-xs transition-all ${className}`}
      >
        {/* Floating White Card */}
        <div className="bg-white rounded-[6px] border border-[#F6DCD8]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Left Side Icon Badge */}
            <div className="w-9 h-9 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#D05756] shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                Account Standing: Under Active Warning
              </h3>

              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {warningReason
                  ? `Notice: ${warningReason}`
                  : "An administrative policy warning was placed on your account. Your buying, selling, and withdrawal privileges remain active."}
              </p>

              {warningCount && warningCount > 1 && (
                <p className="text-[11px] text-amber-700/90 font-medium mt-1">
                  Total warnings issued: {warningCount}
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Link
              href="/support"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/60 rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-98"
            >
              <span>Customer Support</span>
              <ArrowRight className="w-3 h-3 text-neutral-600" />
            </Link>
          </div>
        </div>

        {/* Centered Footer Expiration Notification */}
        <div className="pt-2 pb-0.5 text-center">
          {warningDaysLeft !== null && warningDaysLeft > 0 ? (
            <p className="text-xs text-neutral-500 font-normal">
              This warning will automatically expire in{" "}
              <span className="font-semibold text-rose-600">
                {warningDaysLeft} {warningDaysLeft === 1 ? "day" : "days"}
              </span>
              <span className="mx-2 text-neutral-300">•</span>
              Repeated infractions will lead to{" "}
              <span className="font-medium text-neutral-700">account suspension</span>
            </p>
          ) : (
            <p className="text-xs text-neutral-500 font-normal">
              Repeated infractions will lead to{" "}
              <span className="font-semibold text-rose-600">account suspension</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};
