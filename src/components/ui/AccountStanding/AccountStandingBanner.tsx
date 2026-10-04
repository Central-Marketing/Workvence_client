"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";
import { useAccountStanding } from "@/hooks/useAccountStanding";

interface AccountStandingBannerProps {
  className?: string;
}

export const AccountStandingBanner: React.FC<AccountStandingBannerProps> = ({ className = "" }) => {
  const {
    standing,
    suspensionCount,
    suspensionReason,
    warningDaysLeft,
    warningReason,
    warningExpiresAt,
  } = useAccountStanding();

  // If in good standing, do not display a banner
  if (standing === "good") {
    return null;
  }

  // 1. Suspension Banner (Restricted Fulfillment Mode)
  if (standing === "suspended") {
    return (
      <div
        role="alert"
        className={`w-full bg-[#F5f5f5] border border-[#FECDD3] rounded-[6px] p-4 sm:p-5 shadow-2xs ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#ffffff] border border-[rgba(0,0,0,0.10)] text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-[4px] bg-rose-600 text-white text-[11px] font-semibold tracking-wide uppercase">
                  Suspension #{suspensionCount}
                </span>
                <span className="text-xs font-semibold text-rose-900">
                  Restricted Fulfillment Mode Active
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-rose-950 leading-relaxed font-inter">
                Your account is currently suspended.{" "}
                <span className="font-semibold text-rose-950">Restricted Fulfillment Mode is active:</span>{" "}
                You may continue to view and fulfill your active running orders, but your packages are hidden from search, and you cannot accept new orders or request withdrawals.
              </p>

              {suspensionReason && (
                <p className="text-xs text-rose-800/90 font-inter">
                  <span className="font-medium">Recorded Reason:</span> {suspensionReason}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0 pt-2 md:pt-0">
            <Link
              href="/manage-orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-rose-200 text-xs font-medium text-rose-900 hover:bg-rose-50 transition-colors shadow-2xs"
            >
              <span>Running Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/trust-safety"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-rose-600 hover:bg-rose-700 text-xs font-medium text-white transition-colors shadow-2xs"
            >
              <span>Trust &amp; Safety</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Warning Banner
  const formattedWarningDate = (() => {
    if (!warningExpiresAt) return null;
    try {
      return new Date(warningExpiresAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  })();

  return (
    <div
      role="alert"
      className={`w-full bg-[#f5f5f5] border border-[#FDE68A] rounded-[6px] p-4 sm:p-5 shadow-2xs ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#ffffff] border border-[rgba(0,0,0,0.10)] text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-[4px] bg-amber-600 text-white text-[11px] font-semibold tracking-wide uppercase">
                Policy Warning Active
              </span>
              <span className="text-xs font-medium text-amber-800">
                Expires in {warningDaysLeft > 0 ? `${warningDaysLeft} ${warningDaysLeft === 1 ? "day" : "days"}` : "soon"}
                {formattedWarningDate ? ` (${formattedWarningDate})` : ""}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-amber-950 leading-relaxed font-inter">
              An official policy warning has been issued to your account. Your buying, selling, and withdrawal privileges remain active. Please adhere to marketplace rules to avoid account suspension.
            </p>

            {warningReason && (
              <p className="text-xs text-amber-900/90 font-inter">
                <span className="font-medium">Reason:</span> {warningReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0 pt-2 md:pt-0">
          <Link
            href="/community-standards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-amber-300 text-xs font-medium text-amber-950 hover:bg-amber-50 transition-colors shadow-2xs"
          >
            <span>Community Standards</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
