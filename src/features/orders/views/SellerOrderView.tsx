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
import { Button } from "@/components/ui";
import { NormalizedOrder } from "../types";
import { OrderTimelineStepper } from "../components/OrderTimelineStepper";
import { OrderDeliverablesList } from "../components/OrderDeliverablesList";
import { OrderActivityLedgerDrawer } from "../components/OrderActivityLedgerDrawer";

interface SellerOrderViewProps {
  order: NormalizedOrder;
  refetch: () => void;
}

export const SellerOrderView: React.FC<SellerOrderViewProps> = ({ order, refetch }) => {
  const router = useRouter();

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

  // Status flags
  const statusLower = order.status?.toLowerCase() || "";
  const isCompleted = statusLower === "completed" || statusLower === "complete";
  const isDelivered = statusLower === "delivered";
  const isLate = statusLower === "late";
  const isDisputed = statusLower === "disputed" || statusLower === "escalated_to_dispute";
  const isCancelled = statusLower === "cancelled" || statusLower === "canceled";

  // Extension state
  const extensionData = order.raw?.extensionRequest || order.raw?.extension || order.extensionRequest;
  const hasPendingExtension = extensionData?.status === "pending";
  const extensionDays = extensionData?.extraDays || extensionData?.requestedDays || extensionData?.days || 1;
  const extensionReason = extensionData?.reason || "Additional time requested to deliver quality work.";
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6 ">

        {/* Top Breadcrumb & Seller Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              href="/manage-orders"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors"
            >
              <FiChevronLeft className="text-sm" />
              <span>Back to Manage Orders</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold font-mono">Order #{order.orderCode}</span>
          </div>

          <div className="flex items-center gap-2">
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

          </div>
        </div>

        {/* Order Main Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
          {order.title || order.packageTitle}
        </h1>

        {/* TOP STATUS HERO BANNER (Fiverr Style) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Left: Status & Timer */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${isDisputed
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : isCancelled
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isDelivered
                          ? "bg-teal-100 text-teal-800 border border-teal-200"
                          : isLate
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                >
                  {isDisputed ? "Disputed" : isCancelled ? "Cancelled" : order.status}
                </span>
                <span className="text-xs text-slate-400">Order placed {order.startedOn}</span>
              </div>

              {isDisputed ? (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-900 flex items-center gap-2">
                    <FiShield className="text-amber-600" />
                    Order Under Dispute
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-700 mt-1">
                    Workvence administration is reviewing this order. Payouts and deliveries are temporarily paused.
                  </p>
                </div>
              ) : isCancelled ? (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-rose-900 flex items-center gap-2">
                    <FiAlertCircle className="text-rose-600" />
                    Order Cancelled
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    This order was cancelled. Reach out to Workvence Support if you need assistance.
                  </p>
                </div>
              ) : isCompleted ? (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FiCheck className="text-emerald-500" />
                    Order Completed!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Your net earnings of <span className="font-bold text-slate-900">${netEarnings}</span>{" "}
                    {isCleared
                      ? "have cleared to your balance."
                      : clearsAt
                        ? `will clear ${moment(clearsAt).fromNow()} (${moment(clearsAt).format("MMM DD, YYYY")}).`
                        : "are currently pending clearance."}
                  </p>
                </div>
              ) : isDelivered ? (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 text-teal-700">
                    Work Delivered — In Review
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    You have submitted the deliverables. Waiting for the buyer to inspect and complete the order.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm sm:text-base">
                    <FiClock className="text-slate-500 text-lg" />
                    <span>Time Left to Deliver:</span>
                  </div>
                  <div className="bg-[#F0FAF8] border border-[#2DD4BF] text-[#0D9488] font-mono font-bold text-sm sm:text-base px-3.5 py-1 rounded-full shadow-2xs">
                    {countdown.days}D : {countdown.hours}H : {countdown.seconds}S
                  </div>
                </div>
              )}
            </div>

            {/* Right: Primary CTAs (Deliver Now / Extend) */}
            {!isCompleted && !isCancelled && !isDisputed && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                {!isDelivered ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      radius="fiverr"
                      onClick={() => setIsExtensionModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      Extend Delivery Date
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="md"
                      radius="fiverr"
                      leftIcon={<FiUploadCloud className="text-lg" />}
                      onClick={() => setShowDeliverModal(true)}
                      className="w-full sm:w-auto px-6 font-bold shadow-sm"
                    >
                      Deliver Completed Work
                    </Button>
                  </>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs sm:text-sm font-semibold w-full sm:w-auto justify-center">
                    <FiCheckCircle className="text-teal-600 text-base" />
                    <span>Work Delivered — In Review</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dispute Alert Banner */}
        {isDisputed && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FiShield className="text-xl" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base text-amber-950">Workvence Support is handling your dispute</h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  Our Support & Administration team is actively investigating the details of this order. All payment releases
                  and work deliveries are temporarily paused while administrators review the communication history and deliverables.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    Go to Support Desk
                  </Link>
                  <a
                    href="mailto:support@workvence.com"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold hover:bg-amber-100/50 transition-colors"
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
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <FiAlertCircle className="text-xl" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base text-rose-950">This Order Has Been Cancelled</h4>
                <p className="text-xs sm:text-sm text-rose-800 mt-1 leading-relaxed">
                  This order was marked as cancelled. If you believe this cancellation was processed in error or need assistance
                  with payment details, please submit an inquiry to Workvence Support.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Extension Request Banner */}
        {hasPendingExtension && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-sky-950">
                    {isExtensionRequestedByBuyer
                      ? `Buyer Requested a Time Extension (+${extensionDays} days)`
                      : `Time Extension Requested (+${extensionDays} days)`}
                  </h4>
                  <p className="text-xs sm:text-sm text-sky-800 mt-1">
                    {isExtensionRequestedByBuyer
                      ? `Reason: "${extensionReason}"`
                      : `Waiting for the buyer to review your request for an additional ${extensionDays} days.`}
                  </p>
                </div>
              </div>

              {isExtensionRequestedByBuyer && (
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="brand"
                    size="md"
                    radius="fiverr"
                    disabled={isRespondingExtension}
                    isLoading={isRespondingExtension}
                    onClick={() => handleRespondExtension("accept")}
                    className="w-full sm:w-auto font-bold shadow-xs"
                  >
                    Accept Extension
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    radius="fiverr"
                    disabled={isRespondingExtension}
                    onClick={() => handleRespondExtension("reject")}
                    className="w-full sm:w-auto font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revision alert banner if buyer requested changes */}
        {!isDelivered && order.revisionReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <FiAlertCircle className="text-amber-600 text-xl shrink-0 mt-0.5" />
            <div>
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Review + Requirements + Deliveries + Stepper + Activity & Escrow Ledger */}
          <div className="lg:col-span-8 space-y-6">

            {/* CARD 0: Buyer Review (Fiverr Style) */}
            {isCompleted && buyerReview && (
              <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <FiStar className="text-lg fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Review from Buyer</h3>
                      <p className="text-xs text-slate-400">Feedback submitted for this completed order</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    <span className="text-amber-500 text-base">★</span>
                    <span className="text-sm font-extrabold text-amber-900">
                      {typeof buyerReview.star === "number" && buyerReview.star > 0
                        ? Number(buyerReview.star).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </div>

                {/* Rating Criteria Breakdown */}
                {(buyerReview.communicationRating || buyerReview.qualityRating || buyerReview.valueRating) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                    {buyerReview.communicationRating && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-600">Communication</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          {Number(buyerReview.communicationRating).toFixed(1)} <FiStar className="text-amber-400 fill-amber-400 text-[11px]" />
                        </span>
                      </div>
                    )}
                    {buyerReview.qualityRating && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-600">Service Quality</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          {Number(buyerReview.qualityRating).toFixed(1)} <FiStar className="text-amber-400 fill-amber-400 text-[11px]" />
                        </span>
                      </div>
                    )}
                    {buyerReview.valueRating && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-600">Value for Money</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          {Number(buyerReview.valueRating).toFixed(1)} <FiStar className="text-amber-400 fill-amber-400 text-[11px]" />
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {buyerReview.description && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      "{buyerReview.description}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CARD 1: Buyer Project Requirements */}
            {/* <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
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
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-700 mb-1">1. Business / Industry</p>
                      <p className="text-slate-900">{order.requirements.q1}</p>
                    </div>
                  )}
                  {order.requirements.q2 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-700 mb-1">2. Part of a Bigger Project?</p>
                      <p className="text-slate-900">{order.requirements.q2}</p>
                    </div>
                  )}
                  {order.requirements.q3 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-700 mb-1">3. Provided Assets & Details</p>
                      <p className="text-slate-900">{order.requirements.q3}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center">
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

            {/* CARD 2: Submitted Work Deliverables */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Work Deliverables</h3>
                  <p className="text-xs text-slate-400">Files and notes you provided for this order</p>
                </div>
                {!isCompleted && !isCancelled && !isDelivered && (
                  <Button
                    type="button"
                    variant="soft"
                    size="md"
                    radius="fiverr"
                    onClick={() => setShowDeliverModal(true)}
                    className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold"
                  >
                    + Deliver Work
                  </Button>
                )}
                {isDelivered && (
                  <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
                    Delivered
                  </span>
                )}
              </div>

              {/* Delivery Note / Message */}
              {deliveryText && (
                <div className="mb-5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
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

            {/* CARD 3: Order Activity Timeline Stepper */}
            <OrderTimelineStepper order={order} />

            {/* CARD 4: Order Activity & Escrow Ledger Trigger Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">Order Activity &amp; Escrow Ledger</h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      Escrow Protected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Chronological statement of escrow events, payment milestones, and order status updates
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="dark"
                size="md"
                radius="fiverr"
                onClick={() => setIsLedgerOpen(true)}
                rightIcon={<FiArrowRight className="text-sm" />}
                className="w-full sm:w-auto shrink-0 shadow-xs"
              >
                View Full Ledger
              </Button>
            </div>

          </div>

          {/* RIGHT COLUMN (Sidebar): Buyer Profile + Order Details */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">

            {/* Buyer Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <h3 className="font-bold text-base text-slate-900 mb-4">Buyer Information</h3>

              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <img
                  src={order.buyer.avatar || "/media/noavatar.png"}
                  alt={order.buyer.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <p className="font-bold text-sm text-slate-900">{order.buyer.name}</p>
                  <p className="text-xs text-slate-500">Client</p>
                </div>
              </div>

              <div className="py-4 space-y-2.5 text-xs border-b border-slate-100">
                {order.buyer.country && (
                  <div className="flex justify-between text-slate-600">
                    <span>From</span>
                    <span className="font-semibold text-slate-900">{order.buyer.country}</span>
                  </div>
                )}
                {order.buyer.joinedDate && (
                  <div className="flex justify-between text-slate-600">
                    <span>Member Since</span>
                    <span className="font-semibold text-slate-900">{order.buyer.joinedDate}</span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="dark"
                size="md"
                fullWidth
                radius="fiverr"
                disabled={isContacting}
                isLoading={isContacting}
                leftIcon={<FiMessageSquare className="text-base" />}
                onClick={handleContact}
                className="mt-4 shadow-xs font-semibold"
              >
                Message Buyer
              </Button>
            </div>

            {/* Order Details & Earnings Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Order Summary</h3>
                <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md px-2 py-0.5">
                  Package
                </span>
              </div>

              {/* Package Cover & Title */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <img
                  src={order.coverImage}
                  alt={order.packageTitle}
                  className="w-20 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <p className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                  {order.packageTitle}
                </p>
              </div>

              {/* Financial breakdown */}
              <div className="py-4 space-y-2.5 text-xs border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Order Total Price</span>
                  <span className="font-semibold text-slate-900">${order.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee ({commissionRate}%)</span>
                  <span className="text-rose-600 font-medium">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
                  <span>Your Net Earnings</span>
                  <span className="text-emerald-600 font-extrabold">${netEarnings}</span>
                </div>
              </div>

              {/* Escrow Clearance Schedule */}
              <div className="py-3 border-b border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-600 font-medium">Escrow Clearance</span>
                  {isCleared ? (
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Cleared
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Holding Period
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                      In Escrow
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-slate-500">
                  {isCleared ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <FiCheckCircle className="text-emerald-600" />
                      Funds cleared {clearedAt ? `(${moment(clearedAt).format("MMM DD, YYYY")})` : "to balance"}
                    </span>
                  ) : clearsAt ? (
                    <span className="text-amber-700 font-semibold">
                      Clears {moment(clearsAt).format("MMM DD, YYYY")}{" "}
                      <span className="text-slate-400 font-normal">({moment(clearsAt).fromNow()})</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="text-slate-500">Pending standard clearance window</span>
                  ) : (
                    <span className="text-slate-400">Holding period starts upon order completion</span>
                  )}
                </div>
              </div>

              <Button
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
              </Button>

              {/* Delivery Duration & Dates */}
              <div className="pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Delivery Date</span>
                  <span className="font-semibold text-slate-900">{order.deliveryTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Number</span>
                  <span className="font-mono text-slate-900">#{order.orderNumber}</span>
                </div>
              </div>
            </div>

            {/* Resolution Center Card */}
            {!isCompleted && !isCancelled && !isDisputed && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">Resolution Center</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Need more time or need help resolving an issue with this order?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  radius="fiverr"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="bg-white hover:bg-slate-100"
                >
                  Ask for Time Extension
                </Button>
              </div>
            )}

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
            className="bg-white rounded-3xl max-w-xl w-full max-h-[calc(100dvh-2rem)] flex flex-col overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <FiUploadCloud size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Deliver Your Work</h3>
                <p className="text-xs text-slate-500">Attach deliverables and add completion notes for the buyer</p>
              </div>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Delivery Notes / Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what you completed, instructions, or notes for the buyer..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors resize-none placeholder-slate-400"
                />
              </div>

              {/* Upload Files Section */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-[280px]">{f.name}</span>
                        <span className="text-slate-400">{f.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  variant="brand"
                  size="md"
                  radius="fiverr"
                  disabled={isSubmittingDelivery || isUploading}
                  isLoading={isSubmittingDelivery}
                  rightIcon={<FiCheck />}
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
