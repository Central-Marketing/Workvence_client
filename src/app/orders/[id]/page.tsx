"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import moment from "moment";
import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import { useUserStore } from "@/store/userStore";
import { OrderSkeleton } from "@/components/ui";
import { BuyerOrderView, SellerOrderView, NormalizedOrder, ExtensionRequestData } from "@/features/orders";

export default function OrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = useUserStore((state: any) => state.user);

  // Persistent reference to preserve order data during background refetches or transient errors
  const lastValidOrderRef = useRef<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch real order from backend API
  const { data: rawOrder, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get(`/orders/${id}`);
        const orderData = data?.order || data?.data || data;
        if (orderData) {
          lastValidOrderRef.current = orderData;
        }
        return orderData;
      } catch (err: any) {
        if (err?.response?.status === 429) {
          toast.error("Too many requests. Please wait a moment and try again.", {
            id: "order-429-toast",
          });
          // If we already have previous valid data, keep it intact
          if (lastValidOrderRef.current) {
            return lastValidOrderRef.current;
          }
        }
        throw err;
      }
    },
    staleTime: 30000,
    retry: (failureCount, err: any) => {
      // Do not auto-retry on 429, 404, or 403
      if (err?.response?.status === 429 || err?.response?.status === 404 || err?.response?.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // Query for linked dispute or escalated support ticket
  const { data: linkedTicket } = useQuery({
    queryKey: ["order-dispute-ticket", id],
    queryFn: async () => {
      try {
        const res = await axiosFetch.get(`/support/tickets?orderID=${id}`).catch(() => null) ||
                    await axiosFetch.get(`/admin/support/tickets?orderID=${id}`).catch(() => null);
        const data = res?.data;
        const list = Array.isArray(data) ? data : data?.tickets || data?.data || [];
        const found = list.find((t: any) =>
          (String(t.orderID || t.orderId || t.order?._id || t.order?.id) === String(id)) &&
          (t.status === 'escalated_to_dispute' || t.disputeID || t.disputeId)
        );
        return found || null;
      } catch {
        return null;
      }
    },
    staleTime: 10000,
  });

  const activeRawOrder = rawOrder || lastValidOrderRef.current;

  // Real-time socket sync
  useEffect(() => {
    if (!id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      socket.emit("join_order", id);
      socket.emit("join_room", `order_${id}`);
    };

    joinRoom();
    socket.on("connect", joinRoom);

    let debounceTimer: NodeJS.Timeout | null = null;

    const handleOrderUpdate = (data: any) => {
      const incomingId = String(
        data?.orderID ||
        data?.orderId ||
        data?.order?._id ||
        data?.order?.id ||
        data?.metadata?.orderID ||
        data?.metadata?.orderId ||
        data?._id ||
        ""
      ).trim();

      const isLinkMatch =
        typeof data?.link === "string" && data.link.includes(String(id));

      const hasOrderKeywords =
        Boolean(
          data?.title &&
          /order|delivery|extension|revision/i.test(String(data.title))
        ) ||
        Boolean(
          data?.message &&
          /order|delivery extension|revision/i.test(String(data.message))
        );

      const isReviewReplied =
        data?.event === "review_replied" ||
        /review|reply/i.test(String(data?.title || data?.message || ""));

      if (
        (incomingId && incomingId === String(id)) ||
        isLinkMatch ||
        isReviewReplied ||
        (!incomingId && hasOrderKeywords)
      ) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["order", id] });
          queryClient.invalidateQueries({ queryKey: ["reviews"] });
        }, 600);
      }
    };

    socket.on("order_updated", handleOrderUpdate);
    socket.on("order_status_changed", handleOrderUpdate);
    socket.on("new_notification", handleOrderUpdate);
    socket.on("notification", handleOrderUpdate);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      socket.emit("leave_order", id);
      socket.emit("leave_room", `order_${id}`);
      socket.off("connect", joinRoom);
      socket.off("order_updated", handleOrderUpdate);
      socket.off("order_status_changed", handleOrderUpdate);
      socket.off("new_notification", handleOrderUpdate);
      socket.off("notification", handleOrderUpdate);
    };
  }, [id, queryClient]);

  // Normalized order data
  const normalizedOrder: NormalizedOrder | null = useMemo(() => {
    if (!activeRawOrder) return null;
    const o = activeRawOrder;

    const orderId = String(o._id || id || "");
    const orderCode = o.orderCode || (orderId ? `FO_${orderId.slice(-8).toUpperCase()}` : "-");
    const orderNumber = typeof o.orderNumber === "number" ? o.orderNumber : Number(orderId.slice(-4)) || 1001;
    const title = o.title || o.gigID?.title || o.packageID?.title || "Deliverable Project";
    const packageTitle = o.packageTitle || o.title || o.gigID?.title || o.packageID?.title || "Standard Package";
    const coverImage = o.image || o.cover || o.packageID?.cover || o.packageID?.image || o.gigID?.cover || "/images/dashboard/orders/order_1.jpg";
    const price = typeof o.price === "number" ? o.price : 0;
    const rawStatus = (o.status || "inprogress").toLowerCase();
    const isCompleted = rawStatus === "completed" || rawStatus === "complete" || Boolean(o.isCompleted);
    const isCancelled = rawStatus === "cancelled" || rawStatus === "canceled" || rawStatus === "failed";
    const isDisputed = !isCompleted && !isCancelled && Boolean(
      (rawStatus === "disputed" || rawStatus === "escalated_to_dispute") ||
      (o.escrowStatus && String(o.escrowStatus).toLowerCase() === "disputed") ||
      (linkedTicket && (linkedTicket.status === 'escalated_to_dispute' || linkedTicket.disputeID))
    );

    const status = isDisputed ? "disputed" : rawStatus;
    const paymentStatus = o.isPaid || o.status === "paid" || o.status === "delivered" || o.status === "completed"
      ? "Paid"
      : (o.paymentStatus || "Unpaid");

    // Started date
    let startedOn = "-";
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) startedOn = moment(d).format("MMM D, YYYY");
    }

    // Delivery date & late days calculation
    let deliveryTime = "-";
    let lateDays = 0;
    let isLate = false;
    let deadline = o.deadline;

    if (!deadline && o.createdAt && o.deliveryTime) {
      const days = Number(o.deliveryTime);
      if (!isNaN(days)) {
        const est = new Date(o.createdAt).getTime() + days * 86400000;
        deadline = new Date(est).toISOString();
      }
    }

    let overdueMs = 0;
    if (deadline) {
      const targetTime = new Date(deadline).getTime();
      if (!isNaN(targetTime)) {
        deliveryTime = moment(targetTime).format("MMM D, YYYY");
        const diff = targetTime - Date.now();
        if (diff < 0) {
          overdueMs = Math.abs(diff);
          lateDays = Math.max(1, Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24))));
        }
      }
    }

    const isTerminal = ["completed", "complete", "cancelled", "canceled", "failed"].includes(status);
    const isDelivered = status === "delivered";
    const isRevision = status === "revision" || status === "in_revision";

    // Active order after deadline provided it's not completed, delivered, cancelled, or in revision
    if (!isTerminal && !isDelivered && !isRevision && overdueMs > 0) {
      isLate = true;
    }

    // Delivered late detection
    const deliveredAt = o.deliveredAt || o.deliveredOn;
    const deadlineTime = deadline ? new Date(deadline).getTime() : 0;
    const deliveredTime = deliveredAt ? new Date(deliveredAt).getTime() : 0;
    const wasLateDelivered = Boolean(
      isDelivered && (
        o.wasLateDelivered ||
        (deliveredTime && deadlineTime && deliveredTime > deadlineTime)
      )
    );

    let displayStatus = status;
    if (isRevision) {
      displayStatus = "in_revision";
    } else if (isLate) {
      displayStatus = "late";
    } else if (isDelivered && wasLateDelivered) {
      displayStatus = "delivered_late";
    }

    // Seller normalization
    const sObj = typeof o.sellerID === "object" && o.sellerID !== null ? o.sellerID : {};
    const sellerRating = Number(
      sObj.rating ??
      sObj.starRating ??
      (sObj.starNumber && sObj.totalStars ? sObj.totalStars / sObj.starNumber : undefined) ??
      0
    );
    const sellerReviewCount = Number(
      sObj.reviewCount ??
      sObj.starNumber ??
      sObj.totalReviews ??
      0
    );
    const seller = {
      id: String(sObj._id || sObj.id || (typeof o.sellerID === "string" ? o.sellerID : "")),
      name: sObj.username || sObj.name || "Seller",
      username: sObj.username || sObj.name,
      avatar: sObj.image || sObj.avatar || "/media/noavatar.png",
      role: sObj.title || sObj.shortTitle || sObj.role || "--",
      badge: sObj.badge,
      rating: sellerRating,
      reviewCount: sellerReviewCount,
      country: sObj.country || sObj.location
    };

    // Buyer normalization
    const bObj = typeof o.buyerID === "object" && o.buyerID !== null ? o.buyerID : {};
    const buyer = {
      id: String(bObj._id || bObj.id || (typeof o.buyerID === "string" ? o.buyerID : "")),
      name: bObj.username || bObj.name || "Client",
      avatar: bObj.image || bObj.avatar || "/media/noavatar.png",
      country: bObj.country || bObj.location,
      joinedDate: bObj.createdAt ? moment(bObj.createdAt).format("MMM YYYY") : undefined,
    };

    // User role check
    const isUserSeller = Boolean(
      user?._id && (
        String(sObj._id || o.sellerID) === String(user._id) ||
        (user.isSeller && String(bObj._id || o.buyerID) !== String(user._id))
      )
    );
    const isUserBuyer = !isUserSeller;

    // Delivery files
    const rawFiles = o.deliveryFiles || o.deliverables || [];
    const deliveryFiles = Array.isArray(rawFiles)
      ? rawFiles.map((f: any, idx: number) => ({
        name: typeof f === "string" ? f.split("/").pop() || `Deliverable_${idx + 1}` : f.name || `Deliverable_${idx + 1}`,
        size: typeof f === "object" && f.size ? f.size : "-",
        url: typeof f === "string" ? f : f.url || "#",
      }))
      : [];

    // Requirements
    const reqs = o.requirements || o.projectRequirements || {};
    const requirements = {
      q1: reqs.q1 || "",
      q2: reqs.q2 || "",
      q3: reqs.q3 || "",
      submitted: Boolean(reqs.submitted || o.requirementsSubmitted || reqs.q1),
      submittedAt: reqs.submittedAt,
    };

    // Extension request
    const extReq = o.extensionRequest || o.extension;
    const extStatus = String(extReq?.status || "").toLowerCase().trim();
    const extensionRequest: ExtensionRequestData | null = extReq
      ? {
        days: extReq.days || extReq.extraDays || 1,
        reason: extReq.reason || "Time extension requested.",
        status: extStatus || "pending",
        rejectionReason: extReq.rejectionReason || o.rejectionReason || "",
        rejectedAt: extReq.rejectedAt || o.rejectedAt || "",
        extraDays: extReq.extraDays || extReq.days,
        requestedBy: extReq.requestedBy,
        createdAt: extReq.createdAt,
      }
      : null;

    return {
      id: orderId,
      orderCode,
      orderNumber,
      title,
      packageTitle,
      coverImage,
      price,
      status,
      paymentStatus,
      startedOn,
      deliveryTime,
      deadline,
      lateDays,
      isLate,
      wasLateDelivered,
      deliveredAt,
      overdueMs,
      displayStatus,
      seller,
      buyer,
      requirements,
      deliveryFiles,
      deliveryMessage: o.deliveryMessage || o.deliveryText,
      deliveryText: o.deliveryText || o.deliveryMessage,
      extensionRequest,
      revisionReason: o.revisionReason || o.revision?.reason,
      disputeSummary: o.disputeSummary || o.raw?.disputeSummary || o.dispute?.summary,
      disputeDetails:
        o.disputeDetails ||
        o.raw?.disputeDetails ||
        o.dispute?.details ||
        o.dispute?.decisionReason ||
        o.raw?.dispute?.decisionReason,
      hasReviewed: Boolean(o.hasReviewed || o.isReviewed || o.review || o.reviewID),
      reviewDeadline: o.reviewDeadline || o.review_deadline || o.raw?.reviewDeadline,
      replyDeadline: o.replyDeadline || o.reply_deadline || o.raw?.replyDeadline,
      isUserSeller,
      isUserBuyer,
      raw: {
        ...o,
        supportTicketID: o.supportTicketID || o.supportTicketId || linkedTicket?.id || linkedTicket?._id,
      },
    };
  }, [activeRawOrder, id, user]);

  // 1. Initial loading state (only while first fetch is pending and no cached data exists)
  if (isLoading && !activeRawOrder) {
    return <OrderSkeleton />;
  }

  // 2. Scenario 2: First visit gets 429 (Rate Limit on initial load, no data yet)
  if (!activeRawOrder && (error as any)?.response?.status === 429) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 flex flex-col items-center justify-center font-sans px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Too Many Requests</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
          You have made too many requests in a short period. Please wait a moment and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. Scenario 3: Genuine 404 or missing order
  if (!normalizedOrder) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 flex flex-col items-center justify-center font-sans px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
          The order you are trying to view does not exist or you do not have permission to view it.
        </p>
        <Link
          href={user?.isSeller ? "/manage-orders" : "/orders"}
          className="px-5 py-2.5 rounded-[6px] bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Render role-specific view (Fiverr style)
  if (normalizedOrder.isUserSeller) {
    return <SellerOrderView order={normalizedOrder} refetch={refetch} />;
  }

  return <BuyerOrderView order={normalizedOrder} refetch={refetch} />;
}
