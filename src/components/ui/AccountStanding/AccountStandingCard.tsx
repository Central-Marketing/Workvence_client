"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, AlertOctagon, ArrowRight, Clock } from "lucide-react";
import { useAccountStanding } from "@/hooks/useAccountStanding";

interface AccountStandingCardProps {
  className?: string;
}

export const AccountStandingCard: React.FC<AccountStandingCardProps> = ({ className = "" }) => {
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

  // Suspended state - Grace Active
  if ((standing === "suspended" || isSuspended) && isGraceActive) {
    return (
      <div
        className={`bg-[#ffffff] border border-[#FAB0B0] rounded-[6px] p-5 shadow-xs transition-all ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-white border border-[#FAB0B0] flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-amber-950">
                  Account Standing: Suspended
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#FAB0B0] text-black font-semibold">
                  Grace Period: {graceDaysLeft} {graceDaysLeft === 1 ? "Day" : "Days"} Left
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                {suspensionReason
                  ? `Reason: ${suspensionReason}`
                  : "Your account is suspended with restricted fulfillment access to complete running orders."}
              </p>
              {formattedAccessDeadline && (
                <p className="text-[11px] text-amber-900 font-medium mt-1">
                  Fulfillment window active until {formattedAccessDeadline}. Deliver active orders before deadline.
                </p>
              )}
              {suspensionCount && suspensionCount > 1 && (
                <p className="text-[11px] text-amber-900 mt-1">
                  Suspension incident: #{suspensionCount}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#FAB0B0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-amber-800 text-[11px]">
            New packages & payouts frozen. In-progress order completion allowed.
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/manage-orders"
              className="text-amber-900 hover:text-amber-950 font-medium underline inline-flex items-center gap-1"
            >
              Running Orders <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/support/new"
              className="text-amber-900 hover:text-amber-950 font-medium underline inline-flex items-center gap-1"
            >
              Contact Support
            </Link>
            <Link
              href="/trust-safety"
              className="text-amber-900 hover:text-amber-950 font-medium underline inline-flex items-center gap-1"
            >
              Trust & Safety
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Suspended state - Expired or Standard
  if (standing === "suspended" || isSuspended) {
    return (
      <div
        className={`bg-rose-50 border border-rose-200/90 rounded-[6px] p-5 shadow-xs transition-all ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-rose-900">
                  Account Standing: Suspended
                </h3>
                {isGraceExpired ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-rose-300 text-rose-950 font-semibold">
                    Grace Expired
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-rose-200/70 text-rose-800 font-medium">
                    Restricted Fulfillment Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                {suspensionReason
                  ? `Reason: ${suspensionReason}`
                  : "Your account is temporarily suspended due to a terms or policy violation."}
              </p>
              {formattedAccessDeadline && (
                <p className="text-[11px] text-amber-900 font-medium mt-1">
                  Fulfillment access expired on {formattedAccessDeadline}.
                </p>
              )}
              {suspensionCount && suspensionCount > 1 && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Suspension incident: #{suspensionCount}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-rose-700 text-[11px]">
            {isGraceExpired
              ? "Account access locked. Please contact support to submit an appeal."
              : "New packages & payouts frozen. In-progress order completion allowed."}
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/support/new"
              className="text-rose-700 hover:text-rose-900 font-medium underline inline-flex items-center gap-1"
            >
              Contact Support
            </Link>
            <Link
              href="/trust-safety"
              className="text-rose-700 hover:text-rose-900 font-medium underline inline-flex items-center gap-1"
            >
              Trust & Safety <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Warning state
  if (standing === "warning" || isWarningActive) {
    return (
      <div
        className={`bg-amber-50/70 border border-amber-200/90 rounded-[6px] p-5 shadow-xs transition-all ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-amber-900">
                  Account Standing: Under Active Warning
                </h3>
                {warningDaysLeft !== null && warningDaysLeft > 0 ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-amber-200/70 text-amber-800 font-medium">
                    Expires in {warningDaysLeft} {warningDaysLeft === 1 ? "day" : "days"}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-amber-200/70 text-amber-800 font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                {warningReason
                  ? `Notice: ${warningReason}`
                  : "An administrative policy warning was placed on your account."}
              </p>
              {warningCount && warningCount > 1 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Total warnings issued: {warningCount}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-amber-700 text-[11px]">
            Repeated infractions will lead to account suspension.
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/community-standards"
              className="text-amber-800 hover:text-amber-950 font-medium underline inline-flex items-center gap-1"
            >
              Community Standards
            </Link>
            <Link
              href="/trust-safety"
              className="text-amber-800 hover:text-amber-950 font-medium underline inline-flex items-center gap-1"
            >
              Review Guidelines <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If no active warning and not suspended, do not render anything
  return null;
};
