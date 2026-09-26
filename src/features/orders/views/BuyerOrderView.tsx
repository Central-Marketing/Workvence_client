"use client";

import React, { useState, useMemo } from "react";
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
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { RevisionModal } from "@/components";
import { Button } from "@/components/ui";
import { NormalizedOrder } from "../types";
import { OrderTimelineStepper } from "../components/OrderTimelineStepper";
import { OrderDeliverablesList } from "../components/OrderDeliverablesList";

interface BuyerOrderViewProps {
  order: NormalizedOrder;
  refetch: () => void;
}

export const BuyerOrderView: React.FC<BuyerOrderViewProps> = ({ order, refetch }) => {
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);

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
      const avgRating = Math.max(1, Math.round(Number(totalScore)));
      const targetOrderId = String(order.id || order.raw?._id || "");
      if (!targetOrderId) {
        toast.error("Invalid order ID.");
        return;
      }

      await axiosFetch.post("/reviews", {
        orderID: targetOrderId,
        description: reviewDescription.trim(),
        star: avgRating,
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

  const isCompleted = order.status === "completed";
  const isDelivered = order.status === "delivered";
  const isLate = order.status === "late";
  const deliveryText =
    order.deliveryText ||
    order.deliveryMessage ||
    order.raw?.deliveryText ||
    order.raw?.deliveryMessage ||
    "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-6 sm:pt-8 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6">

        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <nav aria-label="Breadcrumb" className="mb-0">
            <ol className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap list-none p-0 m-0">
              <li className="inline-flex items-center">
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-gray-900 hover:underline transition-colors font-normal inline-flex items-center gap-1 p-0 h-auto bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded-xs"
                >
                  <FiChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Back to Orders</span>
                </Link>
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="text-gray-300 select-none" aria-hidden="true">
                  /
                </span>
                <span
                  aria-current="page"
                  className="text-gray-900 font-medium font-mono truncate max-w-[200px] sm:max-w-xs"
                >
                  Order #{order.orderCode}
                </span>
              </li>
            </ol>
          </nav>

          {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Buyer Order Room
          </span> */}
        </div>

        {/* Order Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
          {order.title || order.packageTitle}
        </h1>

        {/* TOP BANNER: When Delivered, Prominently Prompt Buyer Review (Fiverr Style) */}
        {isDelivered && (
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300/80 rounded-[6px] p-6 sm:p-7 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                  Action Required
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  Your delivery is ready for review!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  {order.seller.name} has submitted the completed work files. Please inspect the deliverables. If everything looks great, accept and complete the order.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
                <Button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)}
                  variant="outline"
                  size="md"
                  radius="fiverr"
                  className="w-full sm:w-auto text-center"
                >
                  Request Revision
                </Button>
                <Button
                  type="button"
                  onClick={handleCompleteOrder}
                  variant="brand"
                  size="md"
                  radius="fiverr"
                  rightIcon={<FiCheck className="text-base" />}
                  className="w-full sm:w-auto"
                >
                  Accept &amp; Complete Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Extension Request from Seller */}
        {isExtPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FiClock className="text-amber-600 text-xl shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">
                    Seller Requested a Delivery Extension ({order.extensionRequest?.days || extensionData?.days || extensionData?.extraDays || 1} extra days)
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1">
                    &ldquo;{order.extensionRequest?.reason || extensionData?.reason || "Additional time requested to deliver quality work."}&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <Button
                  type="button"
                  disabled={isRespondingExtension}
                  onClick={handleRejectExtension}
                  variant="outline"
                  size="md"
                  radius="fiverr"
                  className="w-full sm:w-auto"
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
                  radius="fiverr"
                  className="w-full sm:w-auto"
                >
                  {isRespondingExtension ? "Processing..." : "Approve Extension"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Deliverables + Review Form + Requirements + Timeline */}
          <div className="lg:col-span-8 space-y-6">

            {/* CARD 1: Deliverables from Seller */}
            <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Files &amp; Attachments from Freelancer</h3>
                  <p className="text-xs text-slate-400">Download the completed deliverables submitted by {order.seller.name}</p>
                </div>
                {isDelivered && (
                  <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
                    Delivered
                  </span>
                )}
              </div>

              {/* Delivery Note from Freelancer */}
              {deliveryText && (
                <div className="mb-5 p-4 sm:p-5 rounded-[6px] bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                  <Button
                    variant="brand"
                    size="md"
                    radius="fiverr"
                    onClick={handleCompleteOrder}
                    rightIcon={<FiCheck />}
                    className="w-full"
                  >
                    Yes, I approve delivery
                  </Button>
                </div>
              )}
            </div>

            {/* CARD 2: Share Feedback & Reviews (When Order is Completed) */}
            {isCompleted && (
              <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h3 className="font-bold text-base text-slate-900">
                    {isAlreadyReviewed ? "Your Feedback & Review" : "Share Feedback & Review"}
                  </h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-[6px] text-xs font-semibold text-slate-700">
                    <span className="text-slate-500 font-medium">Rating</span>
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
                  <div className="p-6 rounded-[6px] bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg shadow-xs">
                      <FiCheck />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Review Submitted</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Thank you for sharing your feedback with the community!
                      </p>
                    </div>

                    {(existingReview?.description || reviewDescription) && (
                      <div className="bg-white/90 border border-emerald-200/80 rounded-[6px] p-4 mt-3 w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center shadow-2xs">
                        <div className="flex items-center justify-center gap-1 text-sm mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={
                                s <= Number(existingReview?.star ?? totalScore ?? 0)
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1.5 font-bold text-slate-700 text-xs sm:text-sm">
                            {Number(existingReview?.star ?? totalScore ?? 0).toFixed(1)}
                          </span>
                        </div>
                        <p className="w-full text-center text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                          "{existingReview?.description || reviewDescription}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    {/* Star Criteria */}
                    <div className="space-y-3">
                      {[
                        { key: "communication" as const, label: "Communication with Seller" },
                        { key: "quality" as const, label: "Quality of Delivery" },
                        { key: "service" as const, label: "Service as Described" },
                      ].map((crit) => (
                        <div
                          key={crit.key}
                          className="flex items-center justify-between p-3 rounded-[6px] bg-slate-50 border border-slate-100"
                        >
                          <span className="text-xs font-semibold text-slate-800">{crit.label}</span>
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
                                  ? "!text-amber-400"
                                  : "!text-slate-200 hover:!text-amber-200"
                                  }`}
                              >
                                ★
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs sm:text-[13px] font-medium text-gray-700 block mb-1.5">
                        Your Public Review
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe what it was like working with this seller..."
                        value={reviewDescription}
                        onChange={(e) => setReviewDescription(e.target.value)}
                        className="w-full bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors resize-y"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      isLoading={submittingReview}
                      variant="dark"
                      size="md"
                      radius="fiverr"
                      fullWidth
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

            {/* CARD 4: Order Activity Timeline */}
            <OrderTimelineStepper order={order} />

          </div>

          {/* RIGHT COLUMN (Sidebar): Seller Profile + Order Summary */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">

            {/* Seller Profile Card */}
            <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-sm p-6">
              <h3 className="font-bold text-base text-slate-900 mb-4">About the Seller</h3>

              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <Link
                  href={`/seller/${order.seller.username || order.seller.name}`}
                  className="shrink-0 group/avatar"
                >
                  <img
                    src={order.seller.avatar || "/media/noavatar.png"}
                    alt={order.seller.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover/avatar:opacity-90 group-hover/avatar:border-slate-300 transition-all"
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

              <Button
                type="button"
                onClick={() => router.push(`/message/${order.seller.id}`)}
                variant="dark"
                size="md"
                radius="fiverr"
                fullWidth
                leftIcon={<FiMessageSquare className="text-base" />}
              >
                Message Freelancer
              </Button>
            </div>

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

              <div className="py-4 space-y-2.5 text-xs border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Order Number</span>
                  <span className="font-mono text-slate-900">#{order.orderCode}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Order Date</span>
                  <span className="font-semibold text-slate-900">{order.startedOn}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Deadline</span>
                  <span className="font-semibold text-slate-900">{order.deliveryTime}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-slate-900">${order.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 text-xs text-emerald-700 bg-emerald-50/70 p-3 rounded-[6px] border border-emerald-100">
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
