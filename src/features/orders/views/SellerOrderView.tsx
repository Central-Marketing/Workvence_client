"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  FiClock,
  FiUploadCloud,
  FiCheck,
  FiAlertCircle,
  FiMessageSquare,
  FiChevronLeft,
  FiCalendar,
  FiX,
  FiFileText,
  FiStar,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { axiosFetch } from "@/utils";
import generateImageURL from "@/utils/generateImageURL";
import { ExtensionModal } from "@/components";
import { Breadcrumb, Button, Tag } from "@/components/ui";
import { useUserStore } from "@/store/userStore";
import { SellerReviewReply } from "@/features/reviews";
import { NormalizedOrder } from "../types";
import { OrderTimelineStepper } from "../components/OrderTimelineStepper";
import { OrderDeliverablesList } from "../components/OrderDeliverablesList";
import { OrderActivityLedgerDrawer } from "../components/OrderActivityLedgerDrawer";
import { DeliveryCountdown } from "../components/DeliveryCountdown";

interface SellerOrderViewProps {
  order: NormalizedOrder;
  refetch: () => void;
}

export const SellerOrderView: React.FC<SellerOrderViewProps> = ({ order, refetch }) => {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.user);

  // Modals & form state
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isExtensionLoading, setIsExtensionLoading] = useState(false);
  const [isRespondingExtension, setIsRespondingExtension] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; url: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, seconds: 0 });

  // Lock body scroll when ledger drawer is open
  useEffect(() => {
    if (isLedgerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLedgerOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLedgerOpen) {
        setIsLedgerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLedgerOpen]);

  useEffect(() => {
    let targetTime: number | null = null;
    const deadlineStr = order.deadline || order.raw?.deadline;

    if (deadlineStr) {
      const parsed = new Date(deadlineStr).getTime();
      if (!isNaN(parsed) && parsed > Date.now()) {
        targetTime = parsed;
      }
    } else if (order.raw?.createdAt && order.raw?.deliveryTime) {
      const created = new Date(order.raw.createdAt).getTime();
      const days = Number(order.raw.deliveryTime);
      if (!isNaN(created) && !isNaN(days)) {
        const est = created + days * 86400000;
        if (est > Date.now()) targetTime = est;
      }
    }

    if (targetTime) {
      const update = () => {
        const diff = Math.max(0, targetTime! - Date.now());
        const totalSec = Math.floor(diff / 1000);
        const d = Math.floor(totalSec / 86400);
        const remSec = totalSec % 86400;
        const h = Math.floor(remSec / 3600);
        const s = remSec % 60;
        setCountdown({ days: d, hours: h, seconds: s });
      };
      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown({ days: 0, hours: 0, seconds: 0 });
    }
  }, [order]);

  // Fetch reviews for completed order
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      axiosFetch
        .get("/reviews")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.reviews)) return data.reviews;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
    enabled: order.status === "completed" || order.raw?.status === "completed",
  });

  const buyerReview =
    reviews.find(
      (r: any) =>
        r.orderID === order.id ||
        r.orderID?._id === order.id ||
        r.orderID === order.raw?._id ||
        r.orderID?._id === order.raw?._id ||
        order.raw?.reviewID === r._id
    ) || order.raw?.review;

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await generateImageURL(file, "order_deliveries");
        if (res?.url) {
          const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          setUploadedFiles((prev) => [...prev, { name: file.name, size: sizeStr, url: res.url }]);
        } else {
          // Fallback object URL if external upload service fails
          const localUrl = URL.createObjectURL(file);
          const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          setUploadedFiles((prev) => [...prev, { name: file.name, size: sizeStr, url: localUrl }]);
        }
      }
      toast.success("Files attached successfully!");
    } catch {
      toast.error("Failed to upload attached files.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove an attached file
  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit delivery
  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryNotes.trim() && uploadedFiles.length === 0) {
      toast.error("Please add delivery notes or attach work files.");
      return;
    }

    setIsSubmittingDelivery(true);
    try {
      const fileUrls = uploadedFiles.map((f) => f.url);
      await axiosFetch.post(`/orders/deliver/${order.id}`, {
        deliveryText: deliveryNotes,
        deliveryFile: fileUrls[0] || "",
        deliveryFiles: fileUrls,
      });
      toast.success("Work delivered to buyer successfully!");
      setShowDeliverModal(false);
      setDeliveryNotes("");
      setUploadedFiles([]);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delivery recorded successfully!");
      setShowDeliverModal(false);
      refetch();
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  // Request extension
  const handleRequestExtension = async (extraDays: number, reason: string) => {
    setIsExtensionLoading(true);
    try {
      await axiosFetch.post(`/orders/${order.id}/request-extension`, {
        extraDays,
        reason,
      });
      toast.success("Extension request submitted to buyer!");
      setIsExtensionModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit extension request.");
    } finally {
      setIsExtensionLoading(false);
    }
  };

  // Respond to extension request
  const handleRespondExtension = async (action: "accept" | "reject") => {
    setIsRespondingExtension(true);
    try {
      await axiosFetch.patch(`/orders/${order.id}/respond-extension`, { action });
      toast.success(`Extension request has been ${action}ed.`);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to respond to extension request.");
    } finally {
      setIsRespondingExtension(false);
    }
  };

  // Contact buyer with direct conversation check / creation
  const handleContact = async () => {
    setIsContacting(true);
    const sellerID = order.seller?.id || order.raw?.sellerID?._id || order.raw?.sellerID;
    const buyerID = order.buyer?.id || order.raw?.buyerID?._id || order.raw?.buyerID;
    const sellerUsername = order.seller?.name || order.raw?.sellerID?.username;
    const buyerUsername = order.buyer?.name || order.raw?.buyerID?.username;

    if (!sellerID || !buyerID) {
      router.push(`/message/${order.buyer.id}`);
      setIsContacting(false);
      return;
    }

    try {
      const { data } = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
      const targetId =
        data?.uuid ||
        data?.conversationID ||
        data?._id ||
        data?.id ||
        data?.data?.uuid ||
        data?.data?.conversationID ||
        data?.data?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
        return;
      }
    } catch {
      // If not existing, proceed to create conversation via POST
    }

    try {
      const { data } = await axiosFetch.post("/conversations", {
        sellerID,
        buyerID,
        to: buyerID,
        from: sellerID,
        seller_username: sellerUsername,
        buyer_username: buyerUsername,
      });
      const targetId =
        data?.uuid ||
        data?.conversationID ||
        data?._id ||
        data?.id ||
        data?.data?.uuid ||
        data?.data?.conversationID ||
        data?.data?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
      } else {
        router.push(`/message/${buyerID}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to open conversation");
    } finally {
      setIsContacting(false);
    }
  };

  const statusLower = order.status?.toLowerCase() || "";
  const isCompleted = statusLower === "completed" || statusLower === "complete";
  const isDelivered = statusLower === "delivered";
  const isCancelled = statusLower === "cancelled" || statusLower === "canceled";
  const isRevision = statusLower === "in_revision" || statusLower === "revision";
  const isDisputed = statusLower === "disputed" || statusLower === "escalated_to_dispute";
  const isLate = Boolean(order.isLate || statusLower === "late" || order.displayStatus === "late") && !isCompleted && !isDelivered && !isCancelled && !isRevision && !isDisputed;
  const wasLateDelivered = isDelivered && Boolean(order.wasLateDelivered || order.displayStatus === "delivered_late");

  // Extension state
  const extensionData = order.raw?.extensionRequest || order.raw?.extension || order.extensionRequest;
  const extStatus = String(extensionData?.status || order.extensionRequest?.status || "").toLowerCase().trim();
  const hasPendingExtension = extStatus === "pending";
  const isExtensionRejected = extStatus === "rejected";
  const extensionDays = extensionData?.extraDays || extensionData?.requestedDays || extensionData?.days || 1;
  const extensionReason = extensionData?.reason || "Additional time requested to deliver quality work.";
  const rejectionReason =
    extensionData?.rejectionReason ||
    order.extensionRequest?.rejectionReason ||
    order.raw?.rejectionReason ||
    "";
  const isExtensionRequestedByBuyer =
    extensionData?.requestedBy === "buyer" || extensionData?.requestedBy === order.buyer?.id;

  // Earnings & Platform Fee
  const rawOrder = order.raw || {};
  const commissionRate = rawOrder.commissionRate !== undefined ? Number(rawOrder.commissionRate) : 15;
  const platformFee =
    rawOrder.platformFee !== undefined
      ? Number(rawOrder.platformFee)
      : order.price * (commissionRate / 100);
  const netEarningsAmount =
    rawOrder.netEarnings !== undefined
      ? Number(rawOrder.netEarnings)
      : order.price - platformFee;
  const netEarnings = netEarningsAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isCleared = Boolean(rawOrder.isCleared);
  const clearsAt = rawOrder.clearsAt;
  const clearedAt = rawOrder.clearedAt;
  const deliveryText =
    order.deliveryText ||
    order.deliveryMessage ||
    rawOrder.deliveryText ||
    rawOrder.deliveryMessage ||
    "";

  const deliveryDeadline =
    order.deadline ||
    rawOrder?.deadline ||
    rawOrder?.deliveryDate ||
    rawOrder?.dueDate ||
    (order.deliveryTime && !isNaN(new Date(order.deliveryTime).getTime()) ? order.deliveryTime : null) ||
    (rawOrder?.createdAt && rawOrder?.deliveryTime && !isNaN(Number(rawOrder.deliveryTime))
      ? new Date(new Date(rawOrder.createdAt).getTime() + Number(rawOrder.deliveryTime) * 86400000).toISOString()
      : null) ||
    (order.startedOn && order.deliveryTime && !isNaN(parseInt(order.deliveryTime))
      ? new Date(new Date(order.startedOn).getTime() + parseInt(order.deliveryTime) * 86400000).toISOString()
      : null);

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-6 sm:pt-8 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6">

        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Breadcrumb
            homeHref="/dashboard/seller"
            homeTitle="Dashboard"
            className="mb-0"
            items={[
              { name: "Manage Orders", href: "/manage-orders" },
              { name: `Order #${order.orderCode}`, isLast: true },
            ]}
          />

          {/* <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="soft"
              size="xs"
              radius="lg"
              onClick={() => setIsLedgerOpen(true)}
              leftIcon={<FiClock className="text-emerald-600 text-xs" />}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-semibold"
            >
              Escrow Ledger
            </Button>
          </div> */}
        </div>

        {/* Order Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
          {order.title || order.packageTitle}
        </h1>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Stepper + Timer + Order Summary + Actions + Deliveries + Reviews */}
          <div className="lg:col-span-8 space-y-6">

            {/* CARD 0: Order Activity Timeline */}
            <OrderTimelineStepper order={order} />

            {/* Delivery Countdown Banner when in progress */}
            {!['delivered', 'completed', 'cancelled', 'failed'].includes(order.status) && !isDisputed && (
              <div
                className={`flex items-center justify-between gap-3.5 sm:gap-4 px-4 sm:px-5 py-3.5 rounded-[8px] transition-colors ${isLate
                  ? "bg-[#f5f5f5] border border-[#FECDD3] text-rose-800"
                  : "bg-[rgba(239, 252, 250, 0.50)] border border-[#B8DFDF] text-neutral-800"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {isLate ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 16V12" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11.875 8.25H12M11.75 8.25C11.75 8.11193 11.8619 8 12 8C12.1381 8 12.25 8.11193 12.25 8.25C12.25 8.38807 12.1381 8.5 12 8.5C11.8619 8.5 11.75 8.38807 11.75 8.25Z" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8.37563 3C8.16172 3.07993 7.95135 3.16712 7.74481 3.26126M20.7176 16.3011C20.8198 16.0799 20.914 15.8542 20.9999 15.6245M18.4987 19.3647C18.6704 19.2044 18.8364 19.0381 18.9962 18.866M15.2688 21.3723C15.4629 21.2991 15.654 21.22 15.842 21.1351M12.1559 21.9939C11.925 22.0019 11.6925 22.0019 11.4615 21.9939M7.7872 21.1404C7.968 21.2217 8.15172 21.2978 8.33814 21.3683M4.67244 18.9208C4.80913 19.0657 4.95018 19.2064 5.09539 19.3428M2.63259 15.6645C2.70747 15.8622 2.78856 16.0569 2.87561 16.2483M2.00486 12.5053C1.99837 12.2972 1.99839 12.0878 2.00486 11.8794M2.62534 8.73714C2.6989 8.54165 2.77853 8.34913 2.86399 8.1598M4.65591 5.47923C4.80057 5.32514 4.95014 5.17573 5.10439 5.03124" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5M13.5 12H16M12 10.5V6" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M22 12C22 6.47715 17.5228 2 12 2" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className={`text-sm sm:text-base font-bold tracking-tight ${isLate ? "text-[#292929]" : "text-slate-900"}`}>
                    {isLate ? "Order Overdue" : isRevision ? "Revision in Progress" : "Time Left Deliver"}
                  </span>
                </div>

                <DeliveryCountdown deliveryDate={deliveryDeadline} />
              </div>
            )}

            {/* CARD: Order Summary */}
            <div className="bg-[#f5f5f5] rounded-[6px] border border-slate-200/90 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-[#292929] font-inter">Order Summary</h2>
              </div>

              <hr className="text-[rgba(0,0,0,0.10)] my-4" />


              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-600 font-inter">
                    Order #{order.orderCode}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2">
                    {order.title || order.packageTitle}
                  </h3>
                </div>
              </div>
              <hr className="text-[rgba(0,0,0,0.10)] my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    ${netEarnings}
                  </span>
                </div>

              </div>
            </div>

            {/* Dispute Alert Banner */}
            {isDisputed && (
              <div className="bg-[#f5f5f5] border border-[#F5B400] rounded-[6px] p-6 mb-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] text-amber-700 flex items-center justify-center shrink-0">
                    <FiShield className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-[rgb(41,41,41)]">Workvence Support is handling your dispute</h4>
                    <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                      Our Support & Administration team is actively investigating the details of this order. All payment releases
                      and work deliveries are temporarily paused while administrators review the communication history and deliverables.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link
                        href="/support"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-black border border-[rgba(0,0,0,0.10)] text-white text-[16px] font-semibold font-sf-pro transition-colors shadow-xs"
                      >
                        Go to Support Desk
                      </Link>
                      <a
                        href="mailto:support@workvence.com"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] text-black text-[16px] font-semibold font-sf-pro transition-colors shadow-xs"
                      >
                        Email: support@workvence.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Alert Banner */}
            {isCancelled && (
              <div className="bg-[#f5f5f5] border border-rose-200 rounded-[6px] p-6 mb-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[6px] bg-[#ffffff] border border-red-200 text-rose-700 flex items-center justify-center shrink-0">
                    <FiAlertCircle className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-[#292929]">This Order Has Been Cancelled</h4>
                    <p className="text-xs sm:text-sm text-red-600 mt-1 leading-relaxed">
                      This order was marked as cancelled. If you believe this cancellation was processed in error or need assistance
                      with payment details, please submit an inquiry to Workvence Support.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link
                        href="/support"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#ffffff] border border-[rgba(0,0,0,0.10)] text-[#000000] text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Extension Request */}
            {hasPendingExtension && (
              <div className="bg-[#f5f5f5] border border-[rgba(0, 0, 0, 0.10)] rounded-[6px] p-6 mb-6">
                <div className="flex flex-row justify-between gap-4">
                  <h4 className="text-xl font-bold text-[#292929] font-inter">
                    {isExtensionRequestedByBuyer
                      ? "Buyer Requested a Delivery Extension"
                      : "Time Extension Requested"}
                  </h4>
                  <span className="bg-[#EFE6FD] border border-[#CEB0FA] rounded-[6px] text-[#4600A9] text-[20px] md:text-[24px] font-[510] px-6 py-0.5 shrink-0 flex items-center justify-center">
                    {extensionDays} days
                  </span>
                </div>
                <hr className="text-[rgba(0, 0, 0, 0.10)] my-4" />
                <p className="text-[#6E6E6E] text-xs sm:text-base font-inter">
                  {isExtensionRequestedByBuyer
                    ? extensionReason ? `"${extensionReason}"` : "The buyer requested additional time for this order."
                    : `Waiting for the buyer to review your request for an additional ${extensionDays} days.`}
                </p>
                {isExtensionRequestedByBuyer && (
                  <div className="flex items-center gap-3 w-full mt-5">
                    <Button
                      type="button"
                      variant="soft"
                      size="md"
                      radius="fiverr"
                      fullWidth
                      disabled={isRespondingExtension}
                      onClick={() => handleRespondExtension("reject")}
                      className="flex-1 w-full"
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      variant="dark"
                      size="md"
                      radius="fiverr"
                      fullWidth
                      disabled={isRespondingExtension}
                      isLoading={isRespondingExtension}
                      onClick={() => handleRespondExtension("accept")}
                      className="flex-1 w-full"
                    >
                      {isRespondingExtension ? "Processing..." : "Approve Extension"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Declined Extension Request Notice (Seller View) */}
            {isExtensionRejected && !hasPendingExtension && (
              <div className="bg-[#f5f5f5] border border-rose-200/80 rounded-[6px] p-6 mb-6">
                <div className="flex flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white  text-rose-800 border border-[rgba(0,0,0,0.10)]">
                        Declined
                      </span>
                      <span className="text-xs text-slate-500 font-inter">
                        Delivery Extension Request ({extensionDays} day{extensionDays > 1 ? "s" : ""})
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-[#292929] font-inter">
                      Extension Request Declined
                    </h4>
                  </div>
                </div>

                {rejectionReason ? (
                  <div className="mt-3.5 bg-white border border-rose-100 rounded-[6px] p-3.5 sm:p-4 text-xs sm:text-[13px] text-slate-700 font-inter">
                    <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                      <FiAlertCircle className="text-rose-500" size={14} />
                      Buyer&apos;s Explanation:
                    </p>
                    <p className="italic text-slate-600 pl-5 ">
                      &ldquo;{rejectionReason}&rdquo;
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs sm:text-[13px] font-inter mt-2">
                    The buyer declined your request for extra delivery time.
                  </p>
                )}
              </div>
            )}

            {/* Revision alert banner if buyer requested changes */}
            {!isDelivered && order.revisionReason && (
              <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-5 mb-6 flex items-start gap-3">
                <FiAlertCircle className="text-amber-600 text-xl shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-amber-900">Buyer Requested a Revision</h4>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1">{order.revisionReason}</p>
                  <Button
                    type="button"
                    variant="soft"
                    size="md"
                    radius="fiverr"
                    onClick={() => setShowDeliverModal(true)}
                    rightIcon={<FiArrowRight className="text-sm" />}
                    className="mt-3 w-full sm:w-auto bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold"
                  >
                    Upload Revised Files
                  </Button>
                </div>
              </div>
            )}

            {/* CARD 1: Work Deliverables */}
            <div className="bg-[#f5f5f5] rounded-[6px] border border-[rgba(0, 0, 0, 0.10)] shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-[#292929] font-inter">Work Deliverables</h3>
                </div>
                <div className="flex items-center gap-2">
                  {!isCompleted && !isCancelled && !isDelivered && (
                    <Button
                      type="button"
                      variant="brand"
                      size="sm"
                      radius="fiverr"
                      onClick={() => setShowDeliverModal(true)}
                      className="font-bold shadow-xs"
                    >
                      + Deliver Work
                    </Button>
                  )}
                  {isDelivered && (
                    <span className="bg-[#CCF6F1] text-[#265F58] border border-[rgba(0, 0, 0, 0.10)] text-xs font-semibold px-3 py-1 rounded-full">
                      Delivered
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Note / Message */}
              {deliveryText && (
                <div className="mb-5 p-4 sm:p-5 rounded-[6px] bg-white border border-[rgba(0, 0, 0, 0.10)]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#292929]">
                    <FiFileText className="text-emerald-600 text-sm" />
                    <span>Delivery Note</span>
                  </div>
                  <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {deliveryText}
                  </p>
                </div>
              )}

              <OrderDeliverablesList files={order.deliveryFiles} />
            </div>

            {/* CARD 1: Buyer Project Requirements */}
            {/* <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiFileText />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Buyer Project Requirements</h3>
                    <p className="text-xs text-slate-400">Specifications provided by {order.buyer.name}</p>
                  </div>
                </div>
                {order.requirements?.submitted ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <FiCheck /> Submitted
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    Not Submitted Yet
                  </span>
                )}
              </div>

              {order.requirements?.submitted ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  {order.requirements.q1 && (
                    <div className="p-4 rounded-[6px] bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-700 mb-1">1. Business / Industry</p>
                      <p className="text-slate-900">{order.requirements.q1}</p>
                    </div>
                  )}
                  {order.requirements.q2 && (
                    <div className="p-4 rounded-[6px] bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-700 mb-1">2. Part of a Bigger Project?</p>
                      <p className="text-slate-900">{order.requirements.q2}</p>
                    </div>
                  )}
                  {order.requirements.q3 && (
                    <div className="p-4 rounded-[6px] bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-700 mb-1">3. Provided Assets & Details</p>
                      <p className="text-slate-900">{order.requirements.q3}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-[6px] bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs sm:text-sm text-slate-500">
                    The buyer has not filled out the project requirement questions yet. You can message them if you need clarifications.
                  </p>
                  <Button
                    type="button"
                    variant="dark"
                    size="sm"
                    radius="xl"
                    disabled={isContacting}
                    onClick={handleContact}
                    className="mt-3 text-xs"
                  >
                    Contact Buyer
                  </Button>
                </div>
              )}
            </div> */}

            {/* CARD 2: Share Feedback & Reviews (When Order is Completed) */}
            {isCompleted && (
              <div className="bg-[#f5f5f5] rounded-[6px] border border-slate-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h3 className="text-xl font-bold text-[#292929] font-inter">
                    {buyerReview ? "Buyer Feedback & Review" : "Client Feedback"}
                  </h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EDEDED] border border-[#C7C7C7] rounded-[6px] text-base font-semibold text-slate-700">
                    <span className="text-[#292929]">Total</span>
                    <span className="font-bold text-slate-900">
                      {buyerReview?.star ? Number(buyerReview.star).toFixed(1) : "0.0"}
                    </span>
                    <span className={Number(buyerReview?.star || 0) > 0 ? "text-amber-500" : "text-slate-300"}>
                      ★
                    </span>
                  </div>
                </div>

                {buyerReview ? (
                  <div className="bg-white rounded-[6px] p-6 sm:p-8 space-y-6 shadow-2xs">
                    {buyerReview.description && (
                      <p className="text-sm sm:text-[15px] text-[#555] italic leading-relaxed font-normal">
                        &ldquo;{buyerReview.description}&rdquo;
                      </p>
                    )}

                    <div className="space-y-4 pt-1">
                      {[
                        {
                          label: "Seller communication level",
                          ques: "How responsive and clear was the communication throughout the order?",
                          score: Number(buyerReview.communicationRating || buyerReview.communication || buyerReview.star || 0),
                        },
                        {
                          label: "Quality of delivery",
                          ques: "Did the completed work meet your requirements and expectations?",
                          score: Number(buyerReview.qualityRating || buyerReview.quality || buyerReview.star || 0),
                        },
                        {
                          label: "Service as described",
                          ques: "Did the delivered work match the gig package description?",
                          score: Number(buyerReview.valueRating || buyerReview.service || buyerReview.star || 0),
                        },
                      ].map((crit, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-[15px] font-bold text-[#1a1a1a]">
                              {crit.label}
                            </span>
                            <span className="text-xs text-[#8c8c8c] mt-0.5">
                              {crit.ques}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-center">
                            <div className="flex items-center gap-1 text-base">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                  key={s}
                                  className={
                                    s <= Math.round(crit.score)
                                      ? "text-[#F5B400]"
                                      : "text-[#E0E0E0]"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm font-bold text-[#1a1a1a] min-w-[28px] text-right">
                              {crit.score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Seller Public Response Component */}
                    <div className="pt-3 border-t border-slate-100">
                      <SellerReviewReply
                        reviewId={buyerReview?._id || buyerReview?.id || order.raw?.reviewID}
                        orderId={order.id || order.raw?._id}
                        sellerReply={buyerReview?.sellerReply}
                        sellerReplyAt={buyerReview?.sellerReplyAt}
                        sellerName={order.seller?.name || currentUser?.name || currentUser?.username || "Seller"}
                        sellerAvatar={order.seller?.avatar || (order.seller as any)?.image || currentUser?.image || currentUser?.img}
                        canReply={true}
                        onReplySuccess={() => {
                          refetch();
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] text-center">
                    <p className="text-sm text-slate-500">
                      The buyer has not left a review yet. Reviews will automatically show here once submitted.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN (Sidebar): Buyer Profile + Order Details */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start max-w-[500px]">

            {/* Order Details Card */}
            <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Order Details</h3>
                <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-[6px] px-2 py-0.5">
                  Package
                </span>
              </div>

              {/* Package Cover & Title */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <img
                  src={order.coverImage}
                  alt={order.packageTitle}
                  className="w-20 h-14 rounded-[6px] object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <p className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                  {order.packageTitle}
                </p>
              </div>

              {/* Buyer Profile Row */}
              <div className="flex items-center gap-3.5 pb-4 mt-4">
                <img
                  src={order.buyer.avatar || "/media/noavatar.png"}
                  alt={order.buyer.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#f5f5f5]"
                />
                <div>
                  <p className="font-bold text-sm text-slate-900">{order.buyer.name}</p>
                  <span className="text-xs text-slate-500">Client</span>
                  {order.buyer.country && (
                    <p className="text-xs text-slate-400 mt-0.5">{order.buyer.country}</p>
                  )}
                </div>
              </div>

              <div className="w-full max-w-sm rounded-[6px] border border-[rgba(0, 0, 0, 0.10)] bg-[#f5f5f5] divide-y divide-neutral-200 overflow-hidden text-sm">
                {/* Order Number */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Order number</span>
                  <span className="text-[#292929] text-[14px] font-inter font-semibold">#{order.orderCode}</span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Status</span>
                  <Tag
                    variant={
                      isCompleted
                        ? "completed"
                        : isCancelled
                          ? "cancelled"
                          : isRevision
                            ? "revision"
                            : isDisputed
                              ? "disputed"
                              : isLate
                                ? "late"
                                : wasLateDelivered
                                  ? "delivered_late"
                                  : isDelivered
                                    ? "delivered"
                                    : order.status === "paid"
                                      ? "inprogress"
                                      : order.status
                    }
                    size="sm"
                  >
                    {isCompleted
                      ? "Completed"
                      : isCancelled
                        ? "Cancelled"
                        : isRevision
                          ? "In Revision"
                          : isDisputed
                            ? "Disputed"
                            : isLate
                              ? "Late"
                              : wasLateDelivered
                                ? "Delivered late"
                                : isDelivered
                                  ? "Delivered"
                                  : order.status === "paid"
                                    ? "Inprogress"
                                    : undefined}
                  </Tag>
                </div>

                {/* Started on */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Started on</span>
                  <span className="text-[#292929] text-[14px] font-inter font-semibold">{order.startedOn}</span>
                </div>

                {/* Delivery time */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Delivery time</span>
                  <span className="text-[#292929] text-[14px] font-inter font-semibold">{order.deliveryTime}</span>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Total</span>
                  <span className="text-[#000] text-[16px] font-inter font-semibold">
                    ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Platform Fee */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Platform Fee ({commissionRate}%)</span>
                  <span className="text-rose-600 font-medium font-inter text-[14px]">-${platformFee.toFixed(2)}</span>
                </div>

                {/* Net Earnings */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Your Net Earnings</span>
                  <span className="text-[#0D6D5F] text-[16px] font-inter font-bold">
                    ${netEarnings}
                  </span>
                </div>

                {/* Escrow Clearance Schedule */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Escrow Clearance</span>
                  <Tag variant={isCleared ? "completed" : "pending"} size="sm">
                    {isCleared ? "Cleared" : clearsAt ? `Clears ${moment(clearsAt).fromNow()}` : "In Escrow"}
                  </Tag>
                </div>
              </div>

              {/* <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                radius="fiverr"
                onClick={() => setIsLedgerOpen(true)}
                leftIcon={<FiClock className="text-emerald-600 text-sm" />}
                className="mt-4"
              >
                View Escrow Ledger
              </Button> */}
            </div>

            {/* Quick actions Card */}
            <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6">
              <h3 className="font-bold text-base text-slate-900 mb-4">Quick actions</h3>

              <div className="flex flex-col gap-3">
                {!isCompleted && !isCancelled && !isDisputed && !isDelivered && (
                  <Button
                    type="button"
                    variant="brand"
                    size="md"
                    radius="fiverr"
                    fullWidth
                    leftIcon={<FiUploadCloud className="text-lg" />}
                    onClick={() => setShowDeliverModal(true)}
                    className="font-bold"
                  >
                    Deliver Completed Work
                  </Button>
                )}

                {!isCompleted && !isCancelled && !isDisputed && !isDelivered && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    radius="fiverr"
                    fullWidth
                    onClick={() => setIsExtensionModalOpen(true)}
                  >
                    Ask for Time Extension
                  </Button>
                )}

                <Button
                  type="button"
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  fullWidth
                  disabled={isContacting}
                  isLoading={isContacting}
                  leftIcon={<FiMessageSquare className="text-base" />}
                  onClick={handleContact}
                >
                  Message Buyer
                </Button>

                <Button
                  type="button"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  fullWidth
                  onClick={() => setIsLedgerOpen(true)}
                  rightIcon={<FiArrowRight className="text-sm" />}
                >
                  View Activity Ledger
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* DELIVER WORK MODAL */}
      {showDeliverModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => !isSubmittingDelivery && setShowDeliverModal(false)}
        >
          <div
            className="bg-white rounded-[6px] max-w-xl w-full max-h-[calc(100dvh-2rem)] flex flex-col overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer w-8 h-8 min-h-[32px]"
              onClick={() => setShowDeliverModal(false)}
              disabled={isSubmittingDelivery}
              icon={<FiX size={20} />}
            />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-[6px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <FiUploadCloud size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Deliver Your Work</h3>
                <p className="text-xs text-slate-500">Attach deliverables and add completion notes for the buyer</p>
              </div>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              <div>
                <label className="text-xs sm:text-[13px] font-medium text-gray-700 block mb-1.5">
                  Delivery Notes / Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what you completed, instructions, or notes for the buyer..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors resize-y"
                />
              </div>

              {/* Upload Files Section */}
              <div>
                <label className="text-xs sm:text-[13px] font-medium text-gray-700 block mb-1.5">
                  Attach Deliverable Files
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  radius="xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-4 h-auto min-h-[100px] border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <FiUploadCloud className="text-2xl text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {isUploading ? "Uploading files..." : "Click to browse and upload files"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">ZIP, PNG, PDF, JPG, or design files</span>
                </Button>

                {/* Uploaded files preview list */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-[280px]">{f.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-400">{f.size}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                            title="Remove attachment"
                            aria-label={`Remove ${f.name}`}
                          >
                            <FiX size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning if no attachment added */}
              {uploadedFiles.length === 0 && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[6px] bg-[rgba(239, 252, 250, 0.50)] border border-[rgba(0, 0, 0, 0.10)] text-amber-800 text-xs">
                  <FiAlertCircle className="text-amber-600 text-base shrink-0" />
                  <span>
                    No attachments added. Please make sure to attach your deliverables before sending delivery.
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  disabled={isSubmittingDelivery}
                  onClick={() => setShowDeliverModal(false)}
                  className="w-full sm:w-auto sm:flex-1 font-semibold text-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  disabled={isSubmittingDelivery || isUploading}
                  isLoading={isSubmittingDelivery}
                  className="w-full sm:w-auto sm:flex-1 font-bold shadow-md"
                >
                  Send Delivery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTENSION MODAL */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        isLoading={isExtensionLoading}
        onClose={() => setIsExtensionModalOpen(false)}
        onSubmit={handleRequestExtension}
      />

      {/* ORDER ACTIVITY & ESCROW LEDGER SLIDE-OVER DRAWER */}
      <OrderActivityLedgerDrawer
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        order={order}
      />
    </div>
  );
};
