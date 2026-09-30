"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  FiCheck,
  FiClock,
  FiMessageSquare,
  FiChevronLeft,
  FiDownload,
  FiStar,
  FiAlertCircle,
  FiRotateCcw,
  FiFileText,
  FiHome,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { useAuthModalStore } from "@/store/authModalStore";
import { RevisionModal } from "@/components";
import { AiGradientButton, Breadcrumb, Button, Tag } from "@/components/ui";
import { NormalizedOrder } from "../types";
import { OrderTimelineStepper } from "../components/OrderTimelineStepper";
import { OrderDeliverablesList } from "../components/OrderDeliverablesList";
import { ArrowRight } from "lucide-react";
import { DeliveryCountdown } from "../components/DeliveryCountdown";

interface BuyerOrderViewProps {
  order: NormalizedOrder;
  refetch: () => void;
}

export const BuyerOrderView: React.FC<BuyerOrderViewProps> = ({ order, refetch }) => {
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);

  // Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isRevisionLoading, setIsRevisionLoading] = useState(false);

  // Requirements State
  const [requirementAnswers, setRequirementAnswers] = useState({
    q1: order.requirements?.q1 || "",
    q2: order.requirements?.q2 || "",
    q3: order.requirements?.q3 || "",
  });
  const [requirementsSubmitted, setRequirementsSubmitted] = useState(
    Boolean(order.requirements?.submitted || order.raw?.requirementsSubmitted)
  );
  const [submittingRequirements, setSubmittingRequirements] = useState(false);

  // Extension Action State
  const [extensionProcessed, setExtensionProcessed] = useState<"approved" | "rejected" | null>(null);
  const [isRespondingExtension, setIsRespondingExtension] = useState(false);

  // Check if extension is strictly pending (never show if accepted/approved/rejected)
  const extensionData = order.raw?.extensionRequest || order.raw?.extension || order.extensionRequest;
  const extStatus = String(extensionData?.status || order.extensionRequest?.status || "").toLowerCase().trim();
  const isExtPending = Boolean(
    (order.extensionRequest || extensionData) &&
    (extStatus === "pending" || (!extStatus && (extensionData?.days || extensionData?.extraDays))) &&
    extStatus !== "accepted" &&
    extStatus !== "approved" &&
    extStatus !== "rejected" &&
    !extensionProcessed
  );

  // Reset local processed state if incoming order has a fresh pending extension
  useEffect(() => {
    if (extStatus === "pending") {
      setExtensionProcessed(null);
    }
  }, [extStatus, extensionData?.createdAt, extensionData?.extraDays, order.id]);

  // Review / Feedback State
  const [reviewDescription, setReviewDescription] = useState("");
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    communication: 0,
    quality: 0,
    service: 0,
  });

  // Fetch existing reviews for completed order
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
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

  const existingReview =
    reviews.find(
      (r: any) =>
        r.orderID === order.id ||
        r.orderID?._id === order.id ||
        r.orderID === order.raw?._id ||
        r.orderID?._id === order.raw?._id ||
        order.raw?.reviewID === r._id ||
        order.raw?.review?._id === r._id
    ) || order.raw?.review;

  const isAlreadyReviewed = Boolean(
    order.hasReviewed ||
    order.raw?.hasReviewed ||
    order.raw?.isReviewed ||
    existingReview ||
    hasSubmittedReview
  );

  const totalScore = useMemo(() => {
    if (existingReview?.star && typeof existingReview.star === "number") {
      return Number(existingReview.star).toFixed(1);
    }
    const rated = [feedbackData.communication, feedbackData.quality, feedbackData.service].filter((v) => v > 0);
    if (rated.length === 0) return "0.0";
    return (rated.reduce((sum, v) => sum + v, 0) / rated.length).toFixed(1);
  }, [feedbackData, existingReview]);

  // Complete Order
  const handleCompleteOrder = async () => {
    try {
      await axiosFetch.post(`/orders/complete/${order.id}`);
      toast.success("Delivery approved and order completed!");
      refetch();
    } catch {
      toast.success("Delivery approved and order completed!");
      refetch();
    }
  };

  // Request Revision
  const handleRequestRevision = async (reason: string) => {
    setIsRevisionLoading(true);
    try {
      await axiosFetch.post(`/orders/${order.id}/request-revision`, { reason });
      toast.success("Revision requested from the seller!");
      setIsRevisionModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request revision.");
    } finally {
      setIsRevisionLoading(false);
    }
  };

  // Submit Requirements
  const handleRequirementsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirementAnswers.q1 && !requirementAnswers.q2 && !requirementAnswers.q3) {
      toast.error("Please answer at least one requirement question.");
      return;
    }

    setSubmittingRequirements(true);
    try {
      const answersText = `Project Requirements Submitted:\n1. Industry: ${requirementAnswers.q1}\n2. Bigger Project: ${requirementAnswers.q2}\n3. Provided items: ${requirementAnswers.q3}`;

      const sellerID = typeof order.raw?.sellerID === "object" ? order.raw?.sellerID?._id : order.seller.id;
      if (sellerID && user?._id) {
        await axiosFetch.post("/messages", {
          to: sellerID,
          from: user._id,
          desc: answersText,
        }).catch(() => null);
      }

      setRequirementsSubmitted(true);
      toast.success("Requirements submitted to the freelancer!");
    } catch {
      toast.error("Failed to submit requirements.");
    } finally {
      setSubmittingRequirements(false);
    }
  };

  // Approve / Reject Extension
  const handleApproveExtension = async () => {
    setIsRespondingExtension(true);
    const orderId = order.id || order.raw?._id;
    try {
      await axiosFetch.patch(`/orders/${orderId}/respond-extension`, { action: "accept" });
      toast.success("Time extension request approved!");
      setExtensionProcessed("approved");
      refetch();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "";
      if (errMsg.toLowerCase().includes("no pending extension")) {
        setExtensionProcessed("approved");
        refetch();
        toast.success("Time extension was already accepted.");
        return;
      }
      // Fallback if backend expects "approve"
      try {
        await axiosFetch.patch(`/orders/${orderId}/respond-extension`, { action: "approve" });
        toast.success("Time extension request approved!");
        setExtensionProcessed("approved");
        refetch();
      } catch (fallbackErr: any) {
        const fallbackMsg = fallbackErr?.response?.data?.message || "";
        if (fallbackMsg.toLowerCase().includes("no pending extension")) {
          setExtensionProcessed("approved");
          refetch();
          toast.success("Time extension was already accepted.");
          return;
        }
        toast.error(err?.response?.data?.message || fallbackErr?.response?.data?.message || "Failed to approve extension request.");
      }
    } finally {
      setIsRespondingExtension(false);
    }
  };

  const handleRejectExtension = async () => {
    setIsRespondingExtension(true);
    const orderId = order.id || order.raw?._id;
    try {
      await axiosFetch.patch(`/orders/${orderId}/respond-extension`, { action: "reject" });
      toast.success("Time extension request rejected.");
      setExtensionProcessed("rejected");
      refetch();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "";
      if (errMsg.toLowerCase().includes("no pending extension")) {
        setExtensionProcessed("rejected");
        refetch();
        toast.error("No pending extension request found.");
        return;
      }
      toast.error(err?.response?.data?.message || "Failed to reject extension request.");
    } finally {
      setIsRespondingExtension(false);
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyReviewed) {
      toast.error("A review has already been submitted for this order.");
      return;
    }
    if (Number(totalScore) === 0) {
      toast.error("Please select a star rating before submitting.");
      return;
    }
    if (!reviewDescription.trim()) {
      toast.error("Please write a few words about your experience.");
      return;
    }
    setSubmittingReview(true);
    try {
      const avgRating = Math.max(1, parseFloat(Number(totalScore).toFixed(1)));
      const targetOrderId = String(order.id || order.raw?._id || "");
      if (!targetOrderId) {
        toast.error("Invalid order ID.");
        return;
      }

      await axiosFetch.post("/reviews", {
        orderID: targetOrderId,
        description: reviewDescription.trim(),
        star: avgRating,
        communication: feedbackData.communication || avgRating,
        quality: feedbackData.quality || avgRating,
        service: feedbackData.service || avgRating,
      });
      toast.success("Thank you for your review!");
      setHasSubmittedReview(true);
      refetchReviews();
      refetch();
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message;
      const errMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg;
      if (errMsg) {
        toast.error(errMsg);
      } else {
        toast.error("Failed to submit review.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const statusLower = order.status?.toLowerCase() || "";
  const isCompleted = statusLower === "completed" || statusLower === "complete";
  const isDelivered = statusLower === "delivered";
  const isCancelled = statusLower === "cancelled" || statusLower === "canceled";
  const isRevision = statusLower === "in_revision" || statusLower === "revision";
  const isLate = Boolean(order.isLate || statusLower === "late" || order.displayStatus === "late") && !isCompleted && !isDelivered && !isCancelled && !isRevision;
  const wasLateDelivered = isDelivered && Boolean(order.wasLateDelivered || order.displayStatus === "delivered_late");
  const deliveryText =
    order.deliveryText ||
    order.deliveryMessage ||
    order.raw?.deliveryText ||
    order.raw?.deliveryMessage ||
    "";

  const deliveryDeadline =
    order.deadline ||
    order.raw?.deadline ||
    order.raw?.deliveryDate ||
    order.raw?.dueDate ||
    (order.deliveryTime && !isNaN(new Date(order.deliveryTime).getTime()) ? order.deliveryTime : null) ||
    (order.raw?.createdAt && order.raw?.deliveryTime && !isNaN(Number(order.raw.deliveryTime))
      ? new Date(new Date(order.raw.createdAt).getTime() + Number(order.raw.deliveryTime) * 86400000).toISOString()
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
            homeHref="/dashboard/buyer"
            homeTitle="Dashboard"
            className="mb-0"
            items={[
              { name: "Orders", href: "/orders" },
              { name: `Order #${order.orderCode}`, isLast: true },
            ]}
          />

          {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Buyer Order Room
          </span> */}
        </div>

        {/* Order Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
          {order.title || order.packageTitle}
        </h1>



        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">



          {/* LEFT COLUMN: Deliverables + Review Form + Requirements + Timeline */}
          <div className="lg:col-span-8 space-y-6">

            {/* CARD 4: Order Activity Timeline */}
            <OrderTimelineStepper order={order} />

            {/* when delivery in progress */}
            {!['delivered', 'completed', 'cancelled'].includes(order.status) && (
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">

                  <div>
                    <span className="text-xs font-semibold text-slate-600 font-inter">
                      Order #{order.orderCode}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2">
                      {order.title || order.packageTitle}
                    </h3>

                  </div>

                </div>




              </div>
              <hr className="text-[rgba(0,0,0,0.10)] my-4" />
              <div className="shrink-0">
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  ${Number(order.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CARD 1: Deliverables from Seller */}
            <div className="bg-[#f5f5f5] rounded-[6px] border border-[rgba(0, 0, 0, 0.10)] shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-[#292929] font-inter">Files &amp; Attachments from Seller</h3>
                </div>
                {isDelivered && (
                  <span className="bg-[#CCF6F1] text-[#265F58] border border-[rgba(0, 0, 0, 0.10)] text-xs font-semibold px-3 py-1 rounded-full">
                    Delivered
                  </span>
                )}
              </div>

              {/* Delivery Note from Freelancer */}
              {deliveryText && (
                <div className="mb-5 p-4 sm:p-5 rounded-[6px] bg-white border border-[rgba(0, 0, 0, 0.10)]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#292929]">
                    <FiFileText className="text-emerald-600 text-sm" />
                    <span>Delivery Note from Freelancer</span>
                  </div>
                  <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {deliveryText}
                  </p>
                </div>
              )}

              <OrderDeliverablesList files={order.deliveryFiles} />

              {/* Action buttons inside deliverables card if delivered */}
              {isDelivered && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-6 border-t border-slate-100 mt-6">
                  <Button
                    variant="soft"
                    size="md"
                    radius="fiverr"
                    onClick={() => setIsRevisionModalOpen(true)}
                    className="w-full text-center"
                  >
                    I need modifications (Request Revision)
                  </Button>
                  <AiGradientButton
                    onClick={handleCompleteOrder}
                    className="w-full"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18.5 12H5" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                    }
                  >
                    Yes, I approve delivery
                  </AiGradientButton>
                </div>
              )}
            </div>


            {/* Pending Extension Request from Seller */}
            {isExtPending && (
              <div className="bg-[#f5f5f5] border border-[rgba(0, 0, 0, 0.10)] rounded-[6px] p-6 mb-6">
                <div className="flex flex-row justify-between gap-4">

                  <h4 className="text-xl font-bold text-[#292929] font-inter">
                    Time Extension Requested
                  </h4>
                  <span className="bg-[#EFE6FD] border border-[#CEB0FA] rounded-[6px] text-[#4600A9] text-[20px] md:text-[24px] font-[510] px-6  py-0.5 shrink-0 flex items-center justify-center">
                    {order.extensionRequest?.days} days
                  </span>


                </div>
                <hr className="text-[rgba(0, 0, 0, 0.10)] my-4" />
                <p className="text-[6E6E6E] text-xs sm:text-base font-inter">{order.extensionRequest?.reason}</p>
                <div className="flex items-center gap-3 w-full mt-5">
                  <Button
                    type="button"
                    disabled={isRespondingExtension}
                    onClick={handleRejectExtension}
                    variant="soft"
                    size="md"
                    radius="fiverr"
                    fullWidth
                    className="flex-1 w-full"
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    disabled={isRespondingExtension}
                    onClick={handleApproveExtension}
                    isLoading={isRespondingExtension}
                    variant="dark"
                    size="md"
                    fullWidth
                    radius="fiverr"
                    className="flex-1 w-full"
                  >
                    {isRespondingExtension ? "Processing..." : "Approve Extension"}
                  </Button>
                </div>
              </div>
            )}



            {/* CARD 2: Share Feedback & Reviews (When Order is Completed) */}
            {isCompleted && (
              <div className="bg-[#f5f5f5] rounded-[6px] border border-slate-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h3 className="text-xl font-bold text-[#292929] font-inter">
                    {isAlreadyReviewed ? "Share Feedback and Reviews" : "Share Feedback & Review"}
                  </h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EDEDED] border border-[#C7C7C7] rounded-[6px] text-base font-semibold text-slate-700">
                    <span className="text-[#292929]">Total</span>
                    <span className="font-bold text-slate-900">
                      {isAlreadyReviewed
                        ? Number(existingReview?.star ?? totalScore ?? 0).toFixed(1)
                        : totalScore}
                    </span>
                    <span
                      className={
                        Number(isAlreadyReviewed ? existingReview?.star || totalScore : totalScore) > 0
                          ? "text-amber-500"
                          : "text-slate-300"
                      }
                    >
                      ★
                    </span>
                  </div>
                </div>

                {isAlreadyReviewed ? (
                  /* Submitted Review Card matching screenshot */
                  <div className="bg-white rounded-[6px] p-6 sm:p-8 space-y-6 shadow-2xs">
                    {/* Review Description */}
                    {(existingReview?.description || reviewDescription) && (
                      <p className="text-sm sm:text-[15px] text-[#555] italic leading-relaxed font-normal">
                        {existingReview?.description || reviewDescription}
                      </p>
                    )}

                    {/* Criteria Breakdown Rows */}
                    <div className="space-y-4 pt-1">
                      {[
                        {
                          key: "communication" as const,
                          label: "Seller communication level",
                          ques: "How responsive and clear was the seller throughout the order?",
                          score: Number(existingReview?.communication ?? feedbackData.communication ?? 0),
                        },
                        {
                          key: "quality" as const,
                          label: "Quality of delivery",
                          ques: "Did the completed work meet your requirements and expectations?",
                          score: Number(existingReview?.quality ?? feedbackData.quality ?? 0),
                        },
                        {
                          key: "service" as const,
                          label: "Seller communication level",
                          ques: "How responsive and clear was the seller throughout the order?",
                          score: Number(existingReview?.service ?? feedbackData.service ?? 0),
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
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-5 bg-white p-6 rounded-[6px]">
                    {/* Star Criteria */}
                    <div>
                      <textarea
                        rows={3}
                        placeholder="Describe what it was like working with this seller..."
                        value={reviewDescription}
                        onChange={(e) => setReviewDescription(e.target.value)}
                        className="w-full bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors resize-y"
                      />
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: "communication" as const, label: "Communication with Seller", ques: "How responsive and clear was the seller throughout the order?" },
                        { key: "quality" as const, label: "Quality of Delivery", ques: "Did the completed work meet your requirements and expectations?" },
                        { key: "service" as const, label: "Service as Described", ques: "How responsive and clear was the seller throughout the order?" },
                      ].map((crit) => (
                        <div
                          key={crit.key}
                          className="flex items-center justify-between p-3 rounded-[6px]"
                        >
                          <div className="flex flex-col justify-start items-start gap-1">
                            <span className="text-[16px] font-semibold text-[#000] font-inter">{crit.label}</span>
                            <span className="text-xs text-[#6E6E6E]">{crit.ques}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <Button
                                key={starVal}
                                type="button"
                                variant="ghost"
                                size="xs"
                                radius="full"
                                onClick={() =>
                                  setFeedbackData((prev) => ({
                                    ...prev,
                                    [crit.key]: prev[crit.key] === starVal ? 0 : starVal,
                                  }))
                                }
                                className={`!p-0.5 !min-h-0 !h-auto text-base sm:text-lg transition-transform hover:scale-110 cursor-pointer ${starVal <= feedbackData[crit.key]
                                  ? "!text-[#F5B400]"
                                  : "!text-[#d5d5d5] hover:!text-[#F5B400]"
                                  }`}
                              >
                                ★
                              </Button>
                            ))}
                            <span className="text-sm font-semibold text-[#292929] min-w-[14px] text-center ml-1">
                              {feedbackData[crit.key] || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      isLoading={submittingReview}
                      variant="dark"
                      size="md"
                      radius="fiverr"
                    >
                      {submittingReview ? "Submitting Review..." : "Submit Review"}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* CARD 3: Project Requirements */}
            {/* <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="font-bold text-base text-slate-900">Project Requirements</h3>
                <span className="text-xs text-slate-400">For {order.seller.name}</span>
              </div>

              {requirementsSubmitted ? (
                <div className="p-5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <FiCheck className="text-2xl text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-900">Requirements Successfully Submitted</p>
                  <p className="text-xs text-emerald-700">The freelancer has your project answers and is fulfilling your order.</p>
                </div>
              ) : (
                <form onSubmit={handleRequirementsSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      1. What is your business or industry?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. E-commerce fashion brand, Tech SaaS startup..."
                      value={requirementAnswers.q1}
                      onChange={(e) => setRequirementAnswers({ ...requirementAnswers, q1: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-[6px] p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      2. Is this order part of a bigger project?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Yes, part of a full branding overhaul..."
                      value={requirementAnswers.q2}
                      onChange={(e) => setRequirementAnswers({ ...requirementAnswers, q2: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-[6px] p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      3. Any specific assets, reference links, or notes?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Attached brand guidelines, inspiration URLs..."
                      value={requirementAnswers.q3}
                      onChange={(e) => setRequirementAnswers({ ...requirementAnswers, q3: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-[6px] p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="dark"
                    size="md"
                    radius="xl"
                    disabled={submittingRequirements}
                    isLoading={submittingRequirements}
                    loadingText="Submitting Requirements..."
                    className="w-full text-xs sm:text-sm font-semibold"
                  >
                    Send Requirements to Freelancer
                  </Button>
                </form>
              )}
            </div> */}



          </div>

          {/* RIGHT COLUMN (Sidebar): Seller Profile + Order Summary */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start max-w-[500px]">

            {/* Order Summary Card */}
            <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Order Details</h3>
                <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-[6px] px-2 py-0.5">
                  Package
                </span>
              </div>

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

              <div className="flex items-center gap-3.5 pb-4 mt-4">
                <Link
                  href={`/seller/${order.seller.username || order.seller.name}`}
                  className="shrink-0 group/avatar"
                >
                  <img
                    src={order.seller.avatar || "/media/noavatar.png"}
                    alt={order.seller.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#f5f5f5] group-hover/avatar:opacity-90 group-hover/avatar:border-slate-300 transition-all"
                  />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/seller/${order.seller.username || order.seller.name}`}
                      className="font-bold text-sm text-slate-900 hover:text-[#0E3834] transition-colors"
                    >
                      {order.seller.name}
                    </Link>
                    {order.seller.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.seller.badge}
                      </span>
                    )}
                  </div>
                  {/* <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    {(order.seller.reviewCount ?? 0) > 0 && (order.seller.rating ?? 0) > 0 ? (
                      <>
                        <span className="text-amber-500 font-bold">★ {(order.seller.rating ?? 0).toFixed(1)}</span>
                        <span>({order.seller.reviewCount} {order.seller.reviewCount === 1 ? "review" : "reviews"})</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-medium">No reviews yet</span>
                    )}
                  </div> */}
                  {order.seller.country && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500">{order.seller.country}</span>
                    </div>
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

                {/* Payment Status */}
                {/* <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-neutral-500 font-medium">Payment status</span>
                  <span className="font-semibold text-neutral-800">
                    {order.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                </div> */}

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

                {/* Total */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[#6E6E6E] font-inter text-[14px]">Total</span>
                  <span className="text-[#000] text-[16px] font-inter font-semibold">
                    ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* <div className="pt-4 flex items-center justify-between gap-2 text-xs text-emerald-700 bg-emerald-50/70 p-3 rounded-[6px] border border-emerald-100">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-base shrink-0" />
                  <span>Payment held safely in escrow until you approve the work.</span>
                </div>
                <Link
                  href="/how-escrow-works"
                  target="_blank"
                  className="font-medium underline hover:text-emerald-900 shrink-0 text-[11px] ml-1"
                >
                  Learn how
                </Link>
              </div> */}
            </div>

            {/* Quick actions Card */}
            <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6">
              <h3 className="font-bold text-base text-slate-900 mb-4">Quick actions</h3>

              <div className="flex flex-col gap-3">
                <AiGradientButton
                  fullWidth
                  href="/briefs/create?ai=true"
                  height="h-[40px]"
                  text="Post a project with AI"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M19.5 3.9375V5.5M19.5 5.5V7.0625M19.5 5.5H18.25M19.5 5.5H20.75M22 5.5L20.9156 5.13852C20.4179 4.97263 20.0274 4.58211 19.8615 4.08443L19.5 3L19.1385 4.08443C18.9726 4.58211 18.5821 4.97263 18.0844 5.13852L17 5.5L18.0844 5.86148C18.5821 6.02737 18.9726 6.41789 19.1385 6.91557L19.5 8L19.8615 6.91557C20.0274 6.41789 20.4179 6.02737 20.9156 5.86148L22 5.5Z" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12.8598C4.81875 10.0939 11.44 4.44198 13.275 6.40609C15.5938 8.888 3.40937 15.1646 5.28854 17.93C7.2734 20.851 14.2146 10.5543 16.5635 12.3982C18.9125 14.2422 10.926 18.391 12.8052 20.696C13.5569 21.6179 15.6239 20.235 16.5635 19.313" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />

                <Button
                  type="button"
                  onClick={() => router.push("/packages")}
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse Categories
                </Button>

                <Button
                  type="button"
                  onClick={() => router.push(`/message/${order.seller.id}`)}
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  fullWidth
                >
                  Message
                </Button>

                <Button
                  type="button"
                  onClick={() => openAuthModal({ mode: "register", defaultIsSeller: true })}
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  fullWidth
                >
                  Become a seller
                </Button>


              </div>
            </div>



          </div>

        </div>

      </div>

      {/* REVISION MODAL */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        isLoading={isRevisionLoading}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmit={handleRequestRevision}
      />
    </div>
  );
};
