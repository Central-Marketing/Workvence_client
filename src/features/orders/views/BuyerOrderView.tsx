"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiClock,
  FiMessageSquare,
  FiChevronLeft,
  FiDownload,
  FiStar,
  FiAlertCircle,
  FiRotateCcw,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { RevisionModal } from "@/components";
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
  const [hasReviewedOnce, setHasReviewedOnce] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    communication: 0,
    quality: 0,
    service: 0,
  });

  const totalScore = useMemo(() => {
    const rated = [feedbackData.communication, feedbackData.quality, feedbackData.service].filter((v) => v > 0);
    if (rated.length === 0) return "0.0";
    return (rated.reduce((sum, v) => sum + v, 0) / rated.length).toFixed(1);
  }, [feedbackData]);

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
      await axiosFetch.post("/reviews", {
        gigId: order.raw?.gigID?._id || order.raw?.gigID,
        star: avgRating,
        desc: reviewDescription.trim(),
        orderId: order.id,
        communication: feedbackData.communication,
        quality: feedbackData.quality,
        service: feedbackData.service,
      });
      toast.success("Thank you for your review!");
      setHasSubmittedReview(true);
      setHasReviewedOnce(true);
      refetch();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message;
      if (errMsg && !errMsg.toLowerCase().includes("already")) {
        toast.error(errMsg);
      } else {
        toast.success("Review submitted!");
        setHasSubmittedReview(true);
        setHasReviewedOnce(true);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const isCompleted = order.status === "completed";
  const isDelivered = order.status === "delivered";
  const isLate = order.status === "late";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              href="/orders"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors"
            >
              <FiChevronLeft className="text-sm" />
              <span>Back to Orders</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold font-mono">Order #{order.orderCode}</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Buyer Order Room
          </span>
        </div>

        {/* Order Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
          {order.title || order.packageTitle}
        </h1>

        {/* TOP BANNER: When Delivered, Prominently Prompt Buyer Review (Fiverr Style) */}
        {isDelivered && (
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300/80 rounded-2xl p-6 sm:p-7 shadow-sm mb-6">
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

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Accept &amp; Complete Order</span>
                  <FiCheck className="text-base" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Extension Request from Seller */}
        {isExtPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
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
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isRespondingExtension}
                  onClick={handleRejectExtension}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={isRespondingExtension}
                  onClick={handleApproveExtension}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black cursor-pointer disabled:opacity-50"
                >
                  {isRespondingExtension ? "Processing..." : "Approve Extension"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Deliverables + Review Form + Requirements + Timeline */}
          <div className="lg:col-span-8 space-y-6">

            {/* CARD 1: Deliverables from Seller */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
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

              <OrderDeliverablesList files={order.deliveryFiles} />

              {/* Action buttons inside deliverables card if delivered */}
              {isDelivered && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-6 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsRevisionModalOpen(true)}
                    className="py-3 px-4 rounded-xl bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    I need modifications (Request Revision)
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    className="py-3 px-4 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Yes, I approve delivery</span>
                    <FiCheck />
                  </button>
                </div>
              )}
            </div>

            {/* CARD 2: Share Feedback & Reviews (When Order is Completed) */}
            {isCompleted && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h3 className="font-bold text-base text-slate-900">Share Feedback &amp; Review</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700">
                    <span className="text-slate-500 font-medium">Rating</span>
                    <span className="font-bold text-slate-900">{totalScore}</span>
                    <span className={Number(totalScore) > 0 ? "text-amber-500" : "text-slate-300"}>★</span>
                  </div>
                </div>

                {hasSubmittedReview ? (
                  <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg shadow-xs">
                      <FiCheck />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Review Submitted</p>
                      <p className="text-xs text-emerald-700 mt-0.5">Thank you for sharing your feedback with the community!</p>
                    </div>
                    <div className="pt-1 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHasSubmittedReview(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <FiRotateCcw className="text-xs" />
                        <span>Submit Again</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    {hasReviewedOnce && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                          <FiCheck className="text-emerald-600 text-sm shrink-0" />
                          <span>Review submitted. You can update your feedback and submit again.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackData({ communication: 0, quality: 0, service: 0 });
                            setReviewDescription("");
                          }}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer shrink-0"
                        >
                          Reset
                        </button>
                      </div>
                    )}

                    {/* Star Criteria */}
                    <div className="space-y-3">
                      {[
                        { key: "communication" as const, label: "Communication with Seller" },
                        { key: "quality" as const, label: "Quality of Delivery" },
                        { key: "service" as const, label: "Service as Described" },
                      ].map((crit) => (
                        <div key={crit.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-xs font-semibold text-slate-800">{crit.label}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() =>
                                  setFeedbackData((prev) => ({
                                    ...prev,
                                    [crit.key]: prev[crit.key] === starVal ? 0 : starVal,
                                  }))
                                }
                                className={`text-base sm:text-lg transition-transform hover:scale-110 cursor-pointer p-0.5 ${
                                  starVal <= feedbackData[crit.key] ? "text-amber-400" : "text-slate-200 hover:text-amber-200"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Your Public Review
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe what it was like working with this seller..."
                        value={reviewDescription}
                        onChange={(e) => setReviewDescription(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 transition-colors resize-none placeholder-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {submittingReview
                        ? "Submitting Review..."
                        : hasReviewedOnce
                        ? "Submit Review Again"
                        : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* CARD 3: Project Requirements */}
            {/* <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="font-bold text-base text-slate-900">Project Requirements</h3>
                <span className="text-xs text-slate-400">For {order.seller.name}</span>
              </div>

              {requirementsSubmitted ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
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
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 resize-none"
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
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 resize-none"
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
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-800 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRequirements}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submittingRequirements ? "Submitting Requirements..." : "Send Requirements to Freelancer"}
                  </button>
                </form>
              )}
            </div> */}

            {/* CARD 4: Order Activity Timeline */}
            <OrderTimelineStepper order={order} />

          </div>

          {/* RIGHT COLUMN (Sidebar): Seller Profile + Order Summary */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">

            {/* Seller Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <h3 className="font-bold text-base text-slate-900 mb-4">About the Seller</h3>

              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <img
                  src={order.seller.avatar || "/media/noavatar.png"}
                  alt={order.seller.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900">{order.seller.name}</p>
                    {order.seller.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.seller.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <span className="text-amber-500 font-bold">★ {order.seller.rating?.toFixed(1) || "0"}</span>
                    <span>({order.seller.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/message/${order.seller.id}`)}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FiMessageSquare className="text-base" />
                <span>Message Freelancer</span>
              </button>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Order Details</h3>
                <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md px-2 py-0.5">
                  Package
                </span>
              </div>

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

              <div className="py-4 space-y-2.5 text-xs border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Order Number</span>
                  <span className="font-mono text-slate-900">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Order Date</span>
                  <span className="font-semibold text-slate-900">{order.startedOn}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Expected Delivery</span>
                  <span className="font-semibold text-slate-900">{order.deliveryTime}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-slate-900">${order.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <FiCheck className="text-base shrink-0" />
                <span>Payment held safely in escrow until you approve the work.</span>
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
