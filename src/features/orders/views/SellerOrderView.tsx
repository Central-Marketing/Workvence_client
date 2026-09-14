"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
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
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { axiosFetch } from "@/utils";
import generateImageURL from "@/utils/generateImageURL";
import { ExtensionModal } from "@/components";
import { NormalizedOrder } from "../types";
import { OrderTimelineStepper } from "../components/OrderTimelineStepper";
import { OrderDeliverablesList } from "../components/OrderDeliverablesList";

interface SellerOrderViewProps {
  order: NormalizedOrder;
  refetch: () => void;
}

export const SellerOrderView: React.FC<SellerOrderViewProps> = ({ order, refetch }) => {
  const router = useRouter();

  // Modals & form state
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isExtensionLoading, setIsExtensionLoading] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; url: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, seconds: 0 });

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

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await generateImageURL(file);
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

  const isCompleted = order.status === "completed";
  const isDelivered = order.status === "delivered";
  const isLate = order.status === "late";

  const netEarnings = (order.price * 0.8).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

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

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Seller Workspace
          </span>
        </div>

        {/* Order Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
          {order.title || order.packageTitle}
        </h1>

        {/* TOP STATUS HERO BANNER (Fiverr Style) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Left: Status & Timer */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : isDelivered
                      ? "bg-teal-100 text-teal-800"
                      : isLate
                      ? "bg-rose-100 text-rose-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
                <span className="text-xs text-slate-400">Order placed {order.startedOn}</span>
              </div>

              {isCompleted ? (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FiCheck className="text-emerald-500" />
                    Order Completed!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Your payment of <span className="font-bold text-slate-900">${netEarnings}</span> has cleared to your balance.
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
            {!isCompleted && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Extend Delivery Date
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <FiUploadCloud className="text-lg" />
                  <span>{isDelivered ? "Deliver Again" : "Deliver Completed Work"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Revision alert banner if buyer requested changes */}
        {order.revisionReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <FiAlertCircle className="text-amber-600 text-xl shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Buyer Requested a Revision</h4>
              <p className="text-xs sm:text-sm text-amber-800 mt-1">{order.revisionReason}</p>
              <button
                type="button"
                onClick={() => setShowDeliverModal(true)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Upload Revised Files →
              </button>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Deliveries + Requirements + Timeline */}
          <div className="lg:col-span-8 space-y-6">

            {/* CARD 1: Buyer Project Requirements */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
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
                  <button
                    type="button"
                    onClick={() => router.push(`/message/${order.buyer.id}`)}
                    className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-black transition-colors"
                  >
                    Contact Buyer
                  </button>
                </div>
              )}
            </div>

            {/* CARD 2: Submitted Work Deliverables */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Work Deliverables</h3>
                  <p className="text-xs text-slate-400">Files and notes you provided for this order</p>
                </div>
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => setShowDeliverModal(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    + Deliver Work
                  </button>
                )}
              </div>

              <OrderDeliverablesList files={order.deliveryFiles} />
            </div>

            {/* CARD 3: Order Activity Timeline */}
            <OrderTimelineStepper order={order} />

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

              <button
                type="button"
                onClick={() => router.push(`/message/${order.buyer.id}`)}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FiMessageSquare className="text-base" />
                <span>Message Buyer</span>
              </button>
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
                  <span>Platform Fee (20%)</span>
                  <span className="text-slate-500">-${(order.price * 0.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
                  <span>Your Net Earnings</span>
                  <span className="text-emerald-600">${netEarnings}</span>
                </div>
              </div>

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
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">Resolution Center</h4>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Need more time or need help resolving an issue with this order?
              </p>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Ask for Time Extension
              </button>
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
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
              onClick={() => setShowDeliverModal(false)}
              disabled={isSubmittingDelivery}
            >
              <FiX size={20} />
            </button>

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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <FiUploadCloud className="text-2xl text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {isUploading ? "Uploading files..." : "Click to browse and upload files"}
                  </span>
                  <span className="text-[11px] text-slate-400">ZIP, PNG, PDF, JPG, or design files</span>
                </button>

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

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(false)}
                  disabled={isSubmittingDelivery}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDelivery || isUploading}
                  className="flex-1 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isSubmittingDelivery ? "Submitting..." : "Send Delivery"}</span>
                  <FiCheck />
                </button>
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
    </div>
  );
};
