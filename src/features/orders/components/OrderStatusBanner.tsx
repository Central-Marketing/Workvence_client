"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, AlertOctagon, ArrowRight, Info, FileText } from "lucide-react";

export type OrderStatusBannerVariant = "disputed" | "resolved" | "cancelled";

export interface OrderStatusBannerProps {
  variant: OrderStatusBannerVariant;
  role: "buyer" | "seller";
  orderId: string;
  supportTicketId?: string | null;
  disputeSummary?: string | null;
  disputeDetailsText?: string | null;
  className?: string;
}

const VARIANT_THEMES: Record<
  OrderStatusBannerVariant,
  {
    shell: string;
    cardBorder: string;
    iconColor: string;
    pillClass: string;
    pillLabel: string;
    title: string;
    noteBox: string;
    noteHeading: string;
    footerPrefix: string;
    footerAccent: string;
  }
> = {
  disputed: {
    shell: "bg-[#FFF4E0] border-[#FDE2B0]",
    cardBorder: "border-[#FDE2B0]/70",
    iconColor: "text-[#D97706]",
    pillClass: "bg-[#FEF3C7] text-[#92400E]",
    pillLabel: "Escrow Locked",
    title: "Workvence Support is handling your dispute",
    noteBox: "bg-amber-50/60 border-amber-200/80 text-neutral-800",
    noteHeading: "text-amber-900",
    footerPrefix: "Escrow funds locked",
    footerAccent: "text-amber-700",
  },
  resolved: {
    shell: "bg-[#E7F8F2] border-[#C5EFE0]",
    cardBorder: "border-[#C5EFE0]/70",
    iconColor: "text-[#0D9488]",
    pillClass: "bg-[#CCF6F1] text-[#115E59]",
    pillLabel: "Escrow Settled",
    title: "Dispute Resolved & Order Completed",
    noteBox: "bg-emerald-50/50 border-emerald-200/80 text-neutral-800",
    noteHeading: "text-emerald-900",
    footerPrefix: "Arbitration finalized & escrow settled",
    footerAccent: "text-teal-700",
  },
  cancelled: {
    shell: "bg-[#FFE7E5] border-[#FCD2CD]",
    cardBorder: "border-[#F6DCD8]/60",
    iconColor: "text-[#D05756]",
    pillClass: "bg-rose-200/70 text-rose-800",
    pillLabel: "Cancelled",
    title: "This Order Has Been Cancelled",
    noteBox: "bg-rose-50/50 border-rose-200/80 text-neutral-800",
    noteHeading: "text-rose-900",
    footerPrefix: "Order closed",
    footerAccent: "text-rose-600",
  },
};

export const OrderStatusBanner: React.FC<OrderStatusBannerProps> = ({
  variant,
  role,
  orderId,
  supportTicketId,
  disputeSummary,
  disputeDetailsText,
  className = "",
}) => {
  const theme = VARIANT_THEMES[variant];

  const description =
    variant === "disputed"
      ? "Our Support & Administration team is actively investigating the details of this order. Escrow funds are locked and work deliveries are on hold while administrators review the communication history and deliverables."
      : variant === "resolved"
        ? "Our Support & Administration team has reviewed and finalized the dispute arbitration for this order. The order has been completed and escrow funds have been settled according to the final decision."
        : role === "buyer"
          ? "This order was marked as cancelled. Any refunded funds have been returned to your payment balance or original payment method."
          : "This order was marked as cancelled. If you believe this cancellation was processed in error or need assistance with payment details, please submit an inquiry to Workvence Support.";

  const supportHref = supportTicketId
    ? `/support/${supportTicketId}`
    : variant === "cancelled"
      ? "/support"
      : `/support?orderId=${orderId}`;

  const ctaLabel = supportTicketId
    ? "View Dispute Ticket"
    : variant === "cancelled"
      ? "Contact Support"
      : "Support Desk";

  const summaryLabel =
    variant === "disputed" ? "Dispute Summary" : "Dispute Resolution Summary";

  return (
    <div
      role="alert"
      className={`w-full border rounded-[6px] p-2.5 sm:p-3 shadow-xs transition-all ${theme.shell} ${className}`.trim()}
    >
      {/* Floating White Card */}
      <div
        className={`bg-white rounded-[6px] border ${theme.cardBorder} p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]`}
      >
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Left Side Icon Badge */}
          <div
            className={`w-9 h-9 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center shrink-0 ${theme.iconColor}`}
          >
            {variant === "disputed" ? (
              <ShieldAlert className="w-4.5 h-4.5" />
            ) : variant === "resolved" ? (
              <CheckCircle2 className="w-4.5 h-4.5" />
            ) : (
              <AlertOctagon className="w-4.5 h-4.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                {theme.title}
              </h3>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-[4px] font-semibold ${theme.pillClass}`}
              >
                {theme.pillLabel}
              </span>
            </div>

            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              {description}
            </p>

            {disputeSummary && (
              <div
                className={`mt-2.5 px-3 py-2 rounded-[6px] border text-xs leading-relaxed ${theme.noteBox}`}
              >
                <div
                  className={`flex items-center gap-1.5 font-semibold mb-0.5 ${theme.noteHeading}`}
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{summaryLabel}</span>
                </div>
                <p className="text-neutral-800 font-medium">{disputeSummary}</p>
              </div>
            )}

            {disputeDetailsText && disputeDetailsText !== disputeSummary && (
              <div
                className={`mt-2 px-3 py-2 rounded-[6px] border text-xs leading-relaxed ${theme.noteBox}`}
              >
                <div
                  className={`flex items-center gap-1.5 font-semibold mb-0.5 ${theme.noteHeading}`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Resolution Details</span>
                </div>
                <p className="text-neutral-700 font-normal whitespace-pre-line">
                  {disputeDetailsText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bar with Support CTA */}
      <div className="pt-2.5 pb-0.5 px-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <p className="text-xs text-neutral-600 font-normal text-center sm:text-left">
          {theme.footerPrefix}
          <span className="mx-2 text-neutral-400/70">•</span>
          Questions?{" "}
          <a
            href="mailto:support@workvence.com"
            className={`font-semibold hover:underline ${theme.footerAccent}`}
          >
            support@workvence.com
          </a>
        </p>

        <Link
          href={supportHref}
          className="px-3.5 py-1.5 text-xs font-medium text-neutral-900 bg-white hover:bg-neutral-50 border border-[rgba(0,0,0,0.10)] rounded-[6px] shadow-2xs transition-all inline-flex items-center gap-1.5 shrink-0 active:scale-98"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3 h-3 text-neutral-600" />
        </Link>
      </div>
    </div>
  );
};

export default OrderStatusBanner;

