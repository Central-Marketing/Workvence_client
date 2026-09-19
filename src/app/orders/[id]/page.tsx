"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import { BuyerOrderView, SellerOrderView, NormalizedOrder } from "@/features/orders";

export default function OrderDetailPage() {
  const { id } = useParams();
  const user = useUserStore((state: any) => state.user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch real order from backend API
  const { data: rawOrder, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get(`/orders/${id}`);
        return data?.order || data?.data || data;
      } catch {
        return null;
      }
    },
    staleTime: 30000,
  });

  // Real-time socket sync
  useEffect(() => {
    if (id) {
      socket.emit("join_order", id);
    }
    const handleOrderUpdate = (data: any) => {
      if (data?.orderId === id || data?.order?._id === id || data?.metadata?.orderId === id) {
        refetch();
      }
    };
    socket.on("order_updated", handleOrderUpdate);
    socket.on("new_notification", handleOrderUpdate);
    socket.on("notification", handleOrderUpdate);
    return () => {
      socket.off("order_updated", handleOrderUpdate);
      socket.off("new_notification", handleOrderUpdate);
      socket.off("notification", handleOrderUpdate);
    };
  }, [id, refetch]);

  // Normalized order data
  const normalizedOrder: NormalizedOrder | null = useMemo(() => {
    if (!rawOrder) return null;
    const o = rawOrder;

    const orderId = String(o._id || id || "");
    const orderCode = o.orderCode || (orderId ? `FO_${orderId.slice(-8).toUpperCase()}` : "-");
    const orderNumber = typeof o.orderNumber === "number" ? o.orderNumber : Number(orderId.slice(-4)) || 1001;
    const title = o.title || o.gigID?.title || o.packageID?.title || "Deliverable Project";
    const packageTitle = o.packageTitle || o.title || o.gigID?.title || o.packageID?.title || "Standard Package";
    const coverImage = o.image || o.cover || o.packageID?.cover || o.packageID?.image || o.gigID?.cover || "/images/dashboard/orders/order_1.jpg";
    const price = typeof o.price === "number" ? o.price : 0;
    const status = (o.status || "inprogress").toLowerCase();
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

    if (deadline) {
      const targetTime = new Date(deadline).getTime();
      if (!isNaN(targetTime)) {
        deliveryTime = moment(targetTime).format("MMM D, YYYY");
        const diff = targetTime - Date.now();
        if (diff < 0) {
          isLate = true;
          lateDays = Math.max(1, Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24))));
        }
      }
    } else if (o.createdAt && o.deliveryTime) {
      const days = Number(o.deliveryTime);
      if (!isNaN(days)) {
        const est = new Date(o.createdAt).getTime() + days * 86400000;
        deliveryTime = moment(est).format("MMM D, YYYY");
        deadline = new Date(est).toISOString();
      }
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
    const isExtPending = Boolean(
      extReq &&
      (extStatus === "pending" || (!extStatus && (extReq.extraDays || extReq.days))) &&
      extStatus !== "accepted" &&
      extStatus !== "approved" &&
      extStatus !== "rejected"
    );
    const extensionRequest = (extReq && isExtPending)
      ? {
        days: extReq.days || extReq.extraDays || 1,
        reason: extReq.reason || "Time extension requested.",
        status: extReq.status || "pending",
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
      seller,
      buyer,
      requirements,
      deliveryFiles,
      deliveryMessage: o.deliveryMessage || o.deliveryText,
      extensionRequest,
      revisionReason: o.revisionReason || o.revision?.reason,
      hasReviewed: Boolean(o.hasReviewed || o.isReviewed || o.review || o.reviewID),
      isUserSeller,
      isUserBuyer,
      raw: o,
    };
  }, [rawOrder, id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 flex justify-center items-center font-sans">
        <Loader size={45} />
      </div>
    );
  }

  if (!normalizedOrder) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 flex flex-col items-center justify-center font-sans px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
          The order you are trying to view does not exist or you do not have permission to view it.
        </p>
        <Link
          href={user?.isSeller ? "/manage-orders" : "/orders"}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors"
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
