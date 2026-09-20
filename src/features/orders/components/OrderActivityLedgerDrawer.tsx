"use client";

import React, { useEffect, useMemo } from "react";
import moment from "moment";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui";
import { NormalizedOrder } from "../types";

export interface LedgerEventItem {
  id: string;
  timestamp: string | Date;
  category: "order" | "dispute";
  boldPrefix?: string;
  description?: string;
}

export interface LedgerEventGroup {
  dateStr: string;
  category: "order" | "dispute";
  items: LedgerEventItem[];
}

interface OrderActivityLedgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: NormalizedOrder;
}

/**
 * Parses freeform action strings or log text into bold prefix and description.
 * Examples:
 *   "Requested 1 day(s) extension: Please give me 1 day more" -> { boldPrefix: "Requested 1 day(s) extension:", description: "Please give me 1 day more" }
 *   "Accepted 1 day(s) extension." -> { boldPrefix: "Accepted 1 day(s) extension.", description: "" }
 *   "Explain the decision based on terms of service..." -> { boldPrefix: "", description: "Explain the decision..." }
 */
function parseTextParts(str: string): { boldPrefix: string; description: string } {
  if (!str) return { boldPrefix: "", description: "" };
  const trimmed = str.trim();

  // If contains a colon in the first 45 characters
  const colonIndex = trimmed.indexOf(":");
  if (colonIndex > 0 && colonIndex < 45) {
    return {
      boldPrefix: trimmed.slice(0, colonIndex + 1),
      description: trimmed.slice(colonIndex + 1).trim(),
    };
  }

  // Short action statement with period
  if (
    trimmed.startsWith("Accepted") ||
    trimmed.startsWith("Rejected") ||
    trimmed.startsWith("Delivered") ||
    trimmed.startsWith("Completed") ||
    (trimmed.endsWith(".") && trimmed.length < 40)
  ) {
    return {
      boldPrefix: trimmed,
      description: "",
    };
  }

  // Descriptive text
  return {
    boldPrefix: "",
    description: trimmed,
  };
}

/**
 * Normalizes an item from the backend history array into a uniform LedgerEventItem.
 */
function parseHistoryItem(item: any, idx: number, fallbackTime: string | Date): LedgerEventItem {
  const timestamp =
    item.timestamp || item.createdAt || item.date || item.time || fallbackTime || new Date();
  const id = String(item._id || item.id || `hist_${idx}`);

  const rawText =
    item.note || item.message || item.details || item.reason || item.description || item.text || "";
  const action = item.action || item.title || item.type || "";
  const combined = `${action} ${rawText}`.toLowerCase();

  const isDispute =
    combined.includes("dispute") ||
    combined.includes("terms of service") ||
    combined.includes("evidence submitted") ||
    combined.includes("admin decision") ||
    item.category === "dispute";
  const category: "order" | "dispute" = isDispute ? "dispute" : "order";

  if (item.boldPrefix !== undefined) {
    return {
      id,
      timestamp,
      category,
      boldPrefix: item.boldPrefix,
      description: item.description || "",
    };
  }

  // Specific backend action enums
  if (action === "EXTENSION_REQUESTED") {
    const days = item.days || item.extraDays || 1;
    const reason =
      item.reason || item.details || rawText || "Additional time requested to deliver quality work.";
    const cleanReason = reason.replace(/^Requested \d+ day\(s\) extension:?\s*/i, "");
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Requested ${days} day(s) extension:`,
      description: cleanReason,
    };
  }

  if (
    action === "EXTENSION_ACCEPTED" ||
    action === "EXTENSION_RESPONDED" ||
    action === "EXTENSION_APPROVED"
  ) {
    const days = item.days || item.extraDays || 1;
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Accepted ${days} day(s) extension.`,
      description: item.details || "",
    };
  }

  if (action === "EXTENSION_REJECTED") {
    const days = item.days || item.extraDays || 1;
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Rejected ${days} day(s) extension.`,
      description: item.details || item.reason || "",
    };
  }

  if (action === "REVISION_REQUESTED") {
    const reason = item.reason || item.details || rawText || "Modifications requested.";
    const cleanReason = reason.replace(/^Revision requested:?\s*/i, "");
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Revision requested:`,
      description: cleanReason,
    };
  }

  if (action === "WORK_DELIVERED" || action === "DELIVERY_SUBMITTED") {
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Work delivered:`,
      description: item.details || rawText || "Seller submitted work deliverables for inspection.",
    };
  }

  if (
    action === "ORDER_CREATED" ||
    action === "ESCROW_DEPOSITED" ||
    action === "PAYMENT_SECURED"
  ) {
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Escrow payment secured:`,
      description: item.details || rawText || "Payment secured in Workvence Escrow.",
    };
  }

  if (action === "ORDER_COMPLETED" || action === "ORDER_ACCEPTED") {
    return {
      id,
      timestamp,
      category,
      boldPrefix: `Order accepted:`,
      description: item.details || rawText || "Buyer accepted delivery. Escrow funds released.",
    };
  }

  // Freeform fallback
  const full = rawText
    ? action && !rawText.includes(action)
      ? `${action}: ${rawText}`
      : rawText
    : action;
  const parsed = parseTextParts(full);

  return {
    id,
    timestamp,
    category,
    boldPrefix: parsed.boldPrefix,
    description: parsed.description,
  };
}

export const OrderActivityLedgerDrawer: React.FC<OrderActivityLedgerDrawerProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  // ESC key listener & body scroll-lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Build events and groups from backend real data
  const groups: LedgerEventGroup[] = useMemo(() => {
    if (!order) return [];

    const rawList =
      (Array.isArray(order.raw?.history) && order.raw.history.length > 0
        ? order.raw.history
        : null) ||
      (Array.isArray(order.raw?.activities) && order.raw.activities.length > 0
        ? order.raw.activities
        : null) ||
      (Array.isArray(order.raw?.timeline) && order.raw.timeline.length > 0
        ? order.raw.timeline
        : null) ||
      (Array.isArray(order.raw?.events) && order.raw.events.length > 0
        ? order.raw.events
        : null) ||
      (Array.isArray(order.raw?.ledger) && order.raw.ledger.length > 0
        ? order.raw.ledger
        : null);

    let allEvents: LedgerEventItem[] = [];

    if (rawList && rawList.length > 0) {
      allEvents = rawList.map((item: any, idx: number) =>
        parseHistoryItem(item, idx, order.raw?.createdAt || new Date())
      );
    } else {
      // Synthesize complete timeline from order's real properties
      const synth: LedgerEventItem[] = [];

      // 1. Escrow secured
      if (order.raw?.createdAt || order.startedOn) {
        synth.push({
          id: "evt_created",
          timestamp: order.raw?.createdAt || new Date(),
          category: "order",
          boldPrefix: "Escrow payment secured:",
          description: `Stripe confirmed gross payment of $${order.price.toFixed(
            2
          )} secured in Workvence Escrow.`,
        });
      }

      // 2. Extension request
      const ext =
        order.raw?.extensionRequest || order.raw?.extension || order.extensionRequest;
      if (ext) {
        const days = ext.extraDays || ext.days || ext.requestedDays || 1;
        const reason = ext.reason || "Please give me 1 day more";
        const extCreated =
          ext.createdAt || order.raw?.updatedAt || order.raw?.createdAt || new Date();

        synth.push({
          id: "evt_ext_req",
          timestamp: extCreated,
          category: "order",
          boldPrefix: `Requested ${days} day(s) extension:`,
          description: reason,
        });

        const extStatus = String(ext.status || "").toLowerCase();
        if (extStatus === "accepted" || extStatus === "approved") {
          synth.push({
            id: "evt_ext_acc",
            timestamp: ext.respondedAt || ext.updatedAt || extCreated,
            category: "order",
            boldPrefix: `Accepted ${days} day(s) extension.`,
            description: "",
          });
        } else if (extStatus === "rejected") {
          synth.push({
            id: "evt_ext_rej",
            timestamp: ext.respondedAt || ext.updatedAt || extCreated,
            category: "order",
            boldPrefix: `Rejected ${days} day(s) extension.`,
            description: "",
          });
        }
      }

      // 3. Revision requested
      const revReason =
        order.revisionReason ||
        order.raw?.revisionReason ||
        (typeof order.raw?.revisions === "string" ? order.raw?.revisions : "");
      if (revReason) {
        synth.push({
          id: "evt_rev_req",
          timestamp: order.raw?.revisionRequestedAt || order.raw?.updatedAt || new Date(),
          category: "order",
          boldPrefix: "Revision requested:",
          description: revReason,
        });
      }

      // 4. Dispute note or decision
      const statusLower = String(order.status || "").toLowerCase();
      const isDisputed =
        statusLower === "disputed" || statusLower === "escalated_to_dispute";
      const disputeReason =
        order.raw?.disputeReason ||
        order.raw?.dispute?.reason ||
        order.raw?.dispute?.resolution ||
        order.raw?.dispute?.note ||
        (isDisputed
          ? "Explain the decision based on terms of service, contract scope, and evidence submitted."
          : "");

      if (disputeReason) {
        synth.push({
          id: "evt_dispute",
          timestamp: order.raw?.dispute?.createdAt || order.raw?.updatedAt || new Date(),
          category: "dispute",
          boldPrefix: "",
          description: disputeReason,
        });
      }

      // 5. Work delivered
      const isDelivered = statusLower === "delivered";
      const isCompleted = statusLower === "completed";
      const deliveryText =
        order.deliveryText ||
        order.deliveryMessage ||
        order.raw?.deliveryText ||
        order.raw?.deliveryMessage ||
        "";
      if (order.deliveryFiles.length > 0 || isDelivered || isCompleted || deliveryText) {
        synth.push({
          id: "evt_delivered",
          timestamp: order.raw?.deliveredAt || order.raw?.updatedAt || new Date(),
          category: "order",
          boldPrefix: "Work delivered:",
          description:
            deliveryText || "Seller submitted deliverables and work files for inspection.",
        });
      }

      // 6. Order completed
      if (isCompleted) {
        synth.push({
          id: "evt_completed",
          timestamp: order.raw?.completedAt || order.raw?.updatedAt || new Date(),
          category: "order",
          boldPrefix: "Escrow cleared · Order accepted:",
          description: "Buyer approved deliverables. Net funds released to seller balance.",
        });
      }

      allEvents = synth;
    }

    // Group consecutive events by formatted date string and category
    const grouped: LedgerEventGroup[] = [];

    allEvents.forEach((event) => {
      const d = new Date(event.timestamp);
      const isValidDate = !isNaN(d.getTime());
      const dateStr = isValidDate
        ? moment(d).format("MMM DD, YYYY - hh:mm A")
        : String(event.timestamp);

      const lastGroup = grouped[grouped.length - 1];

      if (
        lastGroup &&
        lastGroup.dateStr === dateStr &&
        lastGroup.category === event.category
      ) {
        lastGroup.items.push(event);
      } else {
        grouped.push({
          dateStr,
          category: event.category,
          items: [event],
        });
      }
    });

    return grouped;
  }, [order]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-200"
      }`}
    >
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel from Right */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Order Activity and Escrow Ledger"
      >
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
              Order Activity &amp; Escrow Ledger
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              onClick={onClose}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors p-1 cursor-pointer w-8 h-8 min-h-[32px]"
              title="Close"
              aria-label="Close ledger"
              icon={<FiX className="w-6 h-6" />}
            />
          </div>

          {/* Top Divider */}
          <div className="border-b border-gray-100 mb-8" />

          {/* Timeline Event Groups */}
          <div className="space-y-0">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  {/* Left Column: Date Badge */}
                  <div className="shrink-0 sm:w-48">
                    <span className="inline-block px-3.5 py-1.5 rounded-lg bg-[#EFF1F4] border border-gray-200/80 text-xs sm:text-[13px] font-medium text-gray-700 whitespace-nowrap shadow-2xs">
                      {group.dateStr}
                    </span>
                  </div>

                  {/* Right Column: Connected Timeline Items */}
                  <div className="flex-1">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={item.id || itemIdx}
                        className="relative flex items-start gap-3.5 pb-5 last:pb-0"
                      >
                        {/* Connecting vertical teal line if not the last item in this group */}
                        {itemIdx < group.items.length - 1 && (
                          <div
                            className="absolute left-[4.25px] top-[14px] bottom-[-4px] w-[1.5px]"
                            style={{ backgroundColor: "#99F6E4" }}
                          />
                        )}

                        {/* Teal Dot */}
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 relative z-10"
                          style={{ backgroundColor: "#3DB9AB" }}
                        />

                        {/* Content */}
                        <div className="text-xs sm:text-[13px] leading-relaxed text-gray-700">
                          {item.boldPrefix && (
                            <strong className="font-bold text-gray-900">
                              {item.boldPrefix}{" "}
                            </strong>
                          )}
                          {item.description && (
                            <span className="text-gray-600 font-normal">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider between distinct groups */}
                {groupIdx < groups.length - 1 && (
                  <div className="border-b border-gray-100 my-7" />
                )}
              </div>
            ))}

            {groups.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">
                No activity recorded yet for this order.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
