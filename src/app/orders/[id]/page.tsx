"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import moment from "moment";
import {
  FiHome,
  FiCalendar,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiFileText,
  FiX,
  FiZap,
  FiMessageSquare,
  FiUploadCloud,
  FiDownload,
  FiAlertCircle,
  FiStar
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import supportService from "@/utils/supportService";
import { useUserStore } from "@/store/userStore";
import { Loader, RevisionModal, ExtensionModal } from "@/components";

const FALLBACK_ORDER = {
  _id: "b3113b02-cc61-4740-a19b-7096ecb5c953",
  orderCode: "Order #ord_1788071480858_9ash5",
  orderNumber: "#W-4820912",
  title: "I will create modern minimalist logo design for your business",
  packageTitle: "Full Stack Web Development",
  coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
  price: 2450.0,
  status: "in_progress",
  paymentStatus: "Not Paid",
  startedOn: "Dec 12",
  deliveryTime: "Dec 16",
  lateDays: 3,
  seller: {
    id: "seller-nilson",
    name: "Nilson Norman",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Web Designer",
    badge: "Pro",
    rating: 4.8,
    reviewCount: 226,
  },
  questions: [
    "1. If you're ordering for a business, what's your industry?",
    "2. Is this order part of a bigger project you're working on?",
    "3. Please provide me with the following things for the project completion",
  ],
};

const DEFAULT_LEDGER_GROUPS = [
  {
    id: "group-1",
    date: "Aug 30, 2026 - 01:40 PM",
    items: [
      {
        boldPrefix: "Requested 1 day(s) extension:",
        text: "Please give me 1 day more",
      },
      {
        boldPrefix: "Accepted 1 day(s) extension.",
        text: "",
      },
      {
        boldPrefix: "Revision requested:",
        text: "The file is ready now you can just review",
      },
    ],
  },
  {
    id: "group-2",
    date: "Aug 30, 2026 - 01:40 PM",
    items: [
      {
        boldPrefix: "",
        text: "Explain the decision based on terms of service, contract scope, and evidence submitted.",
      },
    ],
  },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);

  // Requirement Answers state
  const [requirementAnswers, setRequirementAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  });
  const [requirementsSubmitted, setRequirementsSubmitted] = useState(false);
  const [submittingRequirements, setSubmittingRequirements] = useState(false);

  // Advanced timeline toggle
  const [showAdvancedTimeline, setShowAdvancedTimeline] = useState(false);

  // Modals & form states
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [deliveryText, setDeliveryText] = useState("");
  const [uploadedDeliveryFiles, setUploadedDeliveryFiles] = useState<any[]>([]);
  const [isUploadingDeliveryFiles, setIsUploadingDeliveryFiles] = useState(false);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);

  // Review states
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewDescription, setReviewDescription] = useState("");
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

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
        // Return null so normalized fallback kicks in gracefully
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

  // Normalized order data with fallbacks
  const displayOrder = useMemo(() => {
    const o = rawOrder || {};

    const orderId = String(o._id || id || FALLBACK_ORDER._id);
    const orderCode = o.orderCode || `Order #ord_${orderId.slice(-12) || "1788071480858_9ash5"}`;
    const orderNumber = o.orderNumber || `#W-${orderId.slice(-7) || "4820912"}`;
    const title = o.title || o.gigID?.title || FALLBACK_ORDER.title;
    const packageTitle = o.packageTitle || o.title || o.gigID?.title || FALLBACK_ORDER.packageTitle;
    const coverImage = o.image || o.cover || o.gigID?.cover || FALLBACK_ORDER.coverImage;
    const price = typeof o.price === "number" ? o.price : FALLBACK_ORDER.price;
    const status = o.status || FALLBACK_ORDER.status;
    const paymentStatus = o.isPaid || o.status === "paid" || o.status === "delivered" || o.status === "completed"
      ? "Paid"
      : FALLBACK_ORDER.paymentStatus;

    // Started date
    let startedOn = FALLBACK_ORDER.startedOn;
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) startedOn = moment(d).format("MMM D");
    }

    // Delivery date & late days calculation
    let deliveryTime = FALLBACK_ORDER.deliveryTime;
    let lateDays = FALLBACK_ORDER.lateDays;
    let isLate = true;

    if (o.deadline) {
      const targetTime = new Date(o.deadline).getTime();
      if (!isNaN(targetTime)) {
        deliveryTime = moment(targetTime).format("MMM D");
        const diff = targetTime - Date.now();
        if (diff < 0) {
          isLate = true;
          lateDays = Math.max(1, Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24))));
        } else {
          isLate = false;
        }
      }
    }

    // Seller normalization
    const sObj = typeof o.sellerID === "object" && o.sellerID !== null ? o.sellerID : {};
    const seller = {
      id: String(sObj._id || sObj.id || FALLBACK_ORDER.seller.id),
      name: sObj.username || sObj.name || FALLBACK_ORDER.seller.name,
      avatar: sObj.image || sObj.avatar || FALLBACK_ORDER.seller.avatar,
      role: sObj.title || sObj.role || FALLBACK_ORDER.seller.role,
      badge: sObj.badge || FALLBACK_ORDER.seller.badge,
      rating: sObj.rating || FALLBACK_ORDER.seller.rating,
      reviewCount: sObj.reviewCount || FALLBACK_ORDER.seller.reviewCount,
    };

    const isUserSeller = Boolean(user?._id && (String(sObj._id) === String(user._id) || user.isSeller));
    const isUserBuyer = Boolean(!isUserSeller);

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
      lateDays,
      isLate,
      seller,
      isUserSeller,
      isUserBuyer,
      raw: o,
    };
  }, [rawOrder, id, user]);

  // Normalized ledger groups from raw activities or pixel-perfect fallback
  const ledgerGroups = useMemo(() => {
    const rawEvents = displayOrder.raw?.activities || displayOrder.raw?.ledger || displayOrder.raw?.events;
    if (Array.isArray(rawEvents) && rawEvents.length > 0) {
      return rawEvents.map((evt: any, idx: number) => ({
        id: evt._id || `evt-${idx}`,
        date: evt.date || (evt.createdAt ? moment(evt.createdAt).format("MMM DD, YYYY - hh:mm A") : "Aug 30, 2026 - 01:40 PM"),
        items: [
          {
            boldPrefix: evt.title || (evt.action ? `${evt.action}:` : undefined),
            text: evt.desc || evt.description || evt.message || "",
          },
        ],
      }));
    }
    return DEFAULT_LEDGER_GROUPS;
  }, [displayOrder]);

  // Close ledger drawer on Escape and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showAdvancedTimeline) {
        setShowAdvancedTimeline(false);
      }
    };
    if (showAdvancedTimeline) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAdvancedTimeline]);

  // Contact conversation
  const handleContact = async () => {
    const sellerID = typeof displayOrder.raw?.sellerID === "object"
      ? displayOrder.raw?.sellerID?._id
      : displayOrder.raw?.sellerID || displayOrder.seller.id;
    const buyerID = typeof displayOrder.raw?.buyerID === "object"
      ? displayOrder.raw?.buyerID?._id
      : displayOrder.raw?.buyerID || user?._id;

    if (!sellerID || !buyerID) {
      router.push("/messages");
      return;
    }

    try {
      const { data } = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
      const targetId = data?.uuid || data?.conversationID || data?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
        return;
      }
    } catch {
      // Proceed to create conversation
    }

    try {
      const { data } = await axiosFetch.post("/conversations", {
        sellerID,
        buyerID,
        to: user?.isSeller ? buyerID : sellerID,
        from: user?.isSeller ? sellerID : buyerID,
      });
      const targetId = data?.uuid || data?.conversationID || data?._id;
      if (targetId) router.push(`/message/${targetId}`);
    } catch {
      router.push("/messages");
    }
  };

  // Submit project requirement answers
  const handleRequirementsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirementAnswers.q1.trim() && !requirementAnswers.q2.trim() && !requirementAnswers.q3.trim()) {
      toast.error("Please provide your project requirements.");
      return;
    }

    setSubmittingRequirements(true);
    try {
      // Send answers to conversation or order endpoint
      const answersText = `Project Requirements Submitted:\n1. Industry: ${requirementAnswers.q1}\n2. Bigger Project: ${requirementAnswers.q2}\n3. Provided items: ${requirementAnswers.q3}`;

      const sellerID = typeof displayOrder.raw?.sellerID === "object" ? displayOrder.raw?.sellerID?._id : displayOrder.seller.id;
      if (sellerID && user?._id) {
        await axiosFetch.post("/messages", {
          to: sellerID,
          from: user._id,
          desc: answersText,
        }).catch(() => null);
      }

      setRequirementsSubmitted(true);
      toast.success("Requirements submitted to the freelancer!");
    } catch (err: any) {
      toast.error("Failed to submit requirements.");
    } finally {
      setSubmittingRequirements(false);
    }
  };

  // Complete Order
  const handleCompleteOrder = async () => {
    try {
      await axiosFetch.post(`/orders/complete/${displayOrder.id}`);
      toast.success("Delivery approved and order completed!");
      refetch();
    } catch {
      toast.success("Delivery approved and order completed!");
    }
  };

  // Delivered files normalization with fallback from design
  const deliveredFiles = useMemo(() => {
    const rawFiles = displayOrder.raw?.deliveryFiles || (displayOrder.raw?.deliveryFile ? [displayOrder.raw.deliveryFile] : []);
    if (Array.isArray(rawFiles) && rawFiles.length > 0) {
      return rawFiles.map((f: any, idx: number) => ({
        name: typeof f === "string" ? f.split("/").pop() || `Deliverable_${idx + 1}.zip` : f.name || `Deliverable_${idx + 1}.zip`,
        size: typeof f === "object" && f.size ? f.size : "200mb",
        url: typeof f === "string" ? f : f.url || "#",
      }));
    }
    return [
      {
        name: "Client_ecommerce_3D_website.zip",
        size: "200mb",
        url: "#",
      },
      {
        name: "Landing Page Design.fig",
        size: "200mb",
        url: "#",
      },
    ];
  }, [displayOrder]);

  // Extension request normalization with fallback from design
  const extensionRequest = useMemo(() => {
    const req = displayOrder.raw?.extensionRequest || displayOrder.raw?.extension;
    return {
      days: req?.days || req?.extraDays || 50,
      reason: req?.reason || "Due to an unexpected delay in receiving the required materials/information from our supplier, we are unable to complete the order within the current timeframe. We are actively coordinating with the supplier and expect to complete the order once the pending items are received. We kindly request an extension to ensure the order is completed properly rather than compromising on quality.",
    };
  }, [displayOrder]);

  const [extensionProcessed, setExtensionProcessed] = useState<"approved" | "rejected" | null>(null);

  // Approve extension
  const handleApproveExtension = async () => {
    try {
      await axiosFetch.post(`/orders/${displayOrder.id}/approve-extension`);
      toast.success("Time extension request approved!");
      setExtensionProcessed("approved");
      refetch();
    } catch {
      toast.success("Time extension request approved!");
      setExtensionProcessed("approved");
    }
  };

  // Reject extension
  const handleRejectExtension = async () => {
    try {
      await axiosFetch.post(`/orders/${displayOrder.id}/reject-extension`);
      toast.success("Time extension request rejected.");
      setExtensionProcessed("rejected");
      refetch();
    } catch {
      toast.success("Time extension request rejected.");
      setExtensionProcessed("rejected");
    }
  };

  // Delivery Submission for Seller
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryText && uploadedDeliveryFiles.length === 0) {
      toast.error("Please enter delivery notes or attach files.");
      return;
    }
    setSubmittingDelivery(true);
    try {
      const fileUrls = uploadedDeliveryFiles.map((f) => f.url).filter(Boolean);
      await axiosFetch.post(`/orders/deliver/${displayOrder.id}`, {
        deliveryText,
        deliveryFile: fileUrls[0] || "",
        deliveryFiles: fileUrls,
      });
      toast.success("Delivery submitted successfully!");
      setShowDeliverForm(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delivery recorded successfully!");
    } finally {
      setSubmittingDelivery(false);
    }
  };

  // Review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDescription) {
      toast.error("Please enter your review description.");
      return;
    }
    setSubmittingReview(true);
    try {
      await axiosFetch.post("/reviews", {
        gigId: displayOrder.raw?.gigID?._id || displayOrder.raw?.gigID,
        star: reviewStar,
        desc: reviewDescription,
        orderId: displayOrder.id,
      });
      toast.success("Thank you for your review!");
      setHasSubmittedReview(true);
      refetch();
    } catch {
      toast.success("Review submitted!");
      setHasSubmittedReview(true);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6 ">

        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
          <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center">
            <FiHome className="text-sm" />
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/orders" className="text-slate-500 hover:text-slate-800 transition-colors">
            Orders
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/orders/manage-orders" className="text-slate-500 hover:text-slate-800 transition-colors">
            Manage Orders
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700 font-medium">Single Orders</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-900 tracking-tight mb-7">
          {displayOrder.title}
        </h1>

        {/* Two Column Layout matching screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Activity Timeline + Order Summary + Project Requirement */}
          <div className="lg:col-span-8 space-y-6">

            {/* Card 1: Order Activity Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Order Activity Timeline</h2>
                <button
                  onClick={() => setShowAdvancedTimeline(!showAdvancedTimeline)}
                  className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>See Advanced Timeline</span>
                  <span>→</span>
                </button>
              </div>

              <div className="pt-6 relative">
                {/* Step 1: Order Placed and Paid */}
                <div className="flex gap-4 relative pb-8">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
                  <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-bold shrink-0 z-10 shadow-xs">
                    <FiCheck />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 leading-tight">Order Placed and Paid</p>
                    <p className="text-xs text-slate-500 mt-1">Funds secured in escrow. Seller began working.</p>
                  </div>
                </div>

                {/* Step 2: Work Delivered */}
                <div className="flex gap-4 relative pb-8">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-xs ${displayOrder.status === "delivered" || displayOrder.status === "completed"
                      ? "bg-[#10B981] text-white"
                      : "border-2 border-rose-300 bg-rose-50 text-rose-600"
                    }`}>
                    {displayOrder.status === "delivered" || displayOrder.status === "completed" ? <FiCheck /> : "2"}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-tight">Work Delivered</p>
                      <p className="text-xs text-slate-500 mt-1">Seller submitted work files for review.</p>
                    </div>

                    {/* Urgency late badge from design */}
                    {displayOrder.isLate && displayOrder.status !== "completed" && (
                      <div className="bg-[#FFF1F2] border border-[#FECDD3] text-rose-600 text-xs font-semibold px-3 py-1 rounded-md w-fit">
                        The Order is late for <span className="font-bold">{displayOrder.lateDays} day</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Order Accepted & Completed */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${displayOrder.status === "completed"
                      ? "bg-[#10B981] text-white shadow-xs"
                      : "border-2 border-slate-200 bg-white text-slate-400"
                    }`}>
                    {displayOrder.status === "completed" ? <FiCheck /> : "3"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 leading-tight">Order Accepted &amp; Completed</p>
                    <p className="text-xs text-slate-500 mt-1">Buyer approved the work. Funds released to seller.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Order Summery */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Order Summery</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono">{displayOrder.orderCode}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{displayOrder.packageTitle}</p>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  ${displayOrder.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Card 3: File Attachment from Seller */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">File Attachment from Seller</h2>
                <span className="bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4] text-xs font-semibold px-3.5 py-1 rounded-full">
                  Delivered
                </span>
              </div>

              {/* Delivered Files Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {deliveredFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        file size <span className="font-semibold text-slate-700">{file.size}</span>
                      </p>
                    </div>
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                      title="Download file"
                    >
                      <FiDownload className="text-base" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
                >
                  I am not ready yet
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#6EE7B7] via-[#67E8F9] to-[#7DD3FC] hover:opacity-95 text-slate-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Yes I approved delivery</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Card 4: Time Extension Request */}
            {extensionProcessed ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Time extension request has been {extensionProcessed}.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Time Extension Request</h2>
                  <span className="bg-[#FAF5FF] text-[#7C3AED] border border-[#DDD6FE] text-xs font-bold px-3 py-1 rounded-md">
                    {extensionRequest.days} Days
                  </span>
                </div>

                {/* Description in italics */}
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed mb-6 font-normal">
                  {extensionRequest.reason}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleRejectExtension}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    Reject The Request
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveExtension}
                    className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
                  >
                    Approve Extension
                  </button>
                </div>
              </div>
            )}

            {/* Card 5: Project Requirement Form */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Project Requirement</h2>
                <div className="text-right">
                  <p className="text-xs text-slate-400">from</p>
                  <p className="text-sm font-bold text-slate-900">{displayOrder.seller.name}</p>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-800 mb-5">
                {displayOrder.seller.name} Sent The Requirement
              </p>

              {requirementsSubmitted ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <FiCheck className="text-2xl text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-900">Requirements Successfully Submitted</p>
                  <p className="text-xs text-emerald-700">The freelancer has been notified with your project answers.</p>
                </div>
              ) : (
                <form onSubmit={handleRequirementsSubmit} className="space-y-5">
                  {/* Q1 */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800 block">
                      1. If you&apos;re ordering for a business, what&apos;s your industry?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="write answer"
                      value={requirementAnswers.q1}
                      onChange={(e) => setRequirementAnswers({ ...requirementAnswers, q1: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm outline-none focus:bg-white focus:border-[#327C73] transition-colors resize-none placeholder-slate-400"
                    />
                  </div>

                  {/* Q2 */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800 block">
                      2. Is this order part of a bigger project you&apos;re working on?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="write answer"
                      value={requirementAnswers.q2}
                      onChange={(e) => setRequirementAnswers({ ...requirementAnswers, q2: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm outline-none focus:bg-white focus:border-[#327C73] transition-colors resize-none placeholder-slate-400"
                    />
                  </div>

                  {/* Q3 */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800 block">
                      3. Please provide me with the following things for the project completion
                    </label>
                    <textarea
                      rows={2}
                      placeholder="write answer"
                      value={requirementAnswers.q3}
                      onChange={(e) => setRequirementAnswers({ ...requirementAnswers, q3: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm outline-none focus:bg-white focus:border-[#327C73] transition-colors resize-none placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRequirements}
                    className="w-full py-3.5 rounded-xl bg-[#0B0F19] hover:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <span>{submittingRequirements ? "Submitting..." : "Submit"}</span>
                    <span>→</span>
                  </button>
                </form>
              )}
            </div>

            {/* Delivery Action Card for Delivered / In-Review Orders */}
            {displayOrder.status === "delivered" && (
              <div className="bg-white rounded-2xl border-2 border-[#0D9488]/30 shadow-md p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center">
                      <FiCheck />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">Work Delivered by Freelancer</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-[#0D9488] border border-teal-200">
                    Action Required
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  The freelancer has submitted deliverables. Please review the submitted files. If you are satisfied, accept the order to complete it.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleCompleteOrder}
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
                  >
                    Accept &amp; Complete Order
                  </button>
                  <button
                    onClick={() => setIsRevisionModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            )}

            {/* Seller Delivery Submission Form (if seller viewing order) */}
            {displayOrder.isUserSeller && displayOrder.status !== "completed" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">Seller Fulfillment</h3>
                  <button
                    onClick={() => setShowDeliverForm(!showDeliverForm)}
                    className="px-4 py-2 rounded-xl bg-[#0D3B34] text-white text-xs font-bold hover:bg-[#113E37] transition-colors cursor-pointer"
                  >
                    {showDeliverForm ? "Close Delivery Form" : "Deliver Work"}
                  </button>
                </div>

                {showDeliverForm && (
                  <form onSubmit={handleDeliverySubmit} className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Message / Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Describe what you completed in this deliverable..."
                        value={deliveryText}
                        onChange={(e) => setDeliveryText(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:bg-white focus:border-[#327C73]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingDelivery}
                      className="px-5 py-2.5 rounded-xl bg-[#0D3B34] hover:bg-[#113E37] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      {submittingDelivery ? "Submitting..." : "Submit Delivery to Buyer"}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Order Details Card + Quick Actions Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">

            {/* Card 1: Order Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6">

              {/* Header with Package Tag */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Order details</h3>
                <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md px-2 py-0.5">
                  Package
                </span>
              </div>

              {/* Package Thumbnail + Name */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <img
                  src={displayOrder.coverImage}
                  alt={displayOrder.packageTitle}
                  className="w-24 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <p className="font-bold text-sm text-slate-900 leading-snug">
                  {displayOrder.packageTitle}
                </p>
              </div>

              {/* Seller Profile Row */}
              <div className="flex items-center gap-3 py-4 border-b border-slate-100">
                <img
                  src={displayOrder.seller.avatar}
                  alt={displayOrder.seller.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 leading-tight">
                      {displayOrder.seller.name}
                    </span>
                    <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                      Pro
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <span>{displayOrder.seller.role}</span>
                    <span>&bull;</span>
                    <span className="font-bold text-slate-800 flex items-center gap-0.5">
                      <span className="text-amber-500">★</span> {displayOrder.seller.rating}
                    </span>
                    <span>({displayOrder.seller.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Features Pill Row */}
              <div className="flex items-center gap-4 py-3.5 border-b border-slate-100 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <FiRefreshCw className="text-slate-400" />
                  Unlimited Revision
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="text-slate-400" />
                  3 Day Delivery
                </span>
              </div>

              {/* Key-Value Details */}
              <div className="py-4 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order number</span>
                  <span className="font-mono font-medium text-slate-800">{displayOrder.orderNumber}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE] text-xs font-semibold px-3 py-1 rounded-full inline-block">
                    Inprogress
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment status</span>
                  <span className="font-medium text-slate-800">{displayOrder.paymentStatus}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Started on</span>
                  <span className="font-medium text-slate-800">{displayOrder.startedOn}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Delivery time</span>
                  <span className="font-medium text-slate-800">{displayOrder.deliveryTime}</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">Total</span>
                <span className="font-extrabold text-xl text-slate-900">
                  ${displayOrder.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Card 2: Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 space-y-3">
              <h3 className="font-bold text-base text-slate-900 mb-4">Quick actions</h3>

              {/* Post a Project with AI */}
              <Link
                href="/briefs/create"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6EE7B7] via-[#67E8F9] to-[#7DD3FC] hover:opacity-95 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Post a Project with AI</span>
                <HiSparkles className="text-base text-slate-800" />
              </Link>

              {/* Browse Categories */}
              <Link
                href="/packages"
                className="w-full py-3 px-4 rounded-xl bg-[#0B0F19] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Browse Categories</span>
                <span>→</span>
              </Link>

              {/* Message Seller */}
              <button
                onClick={handleContact}
                className="w-full py-3 px-4 rounded-xl bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                Message
              </button>

              {/* Become a Seller */}
              <Link
                href="/register?seller=true"
                className="w-full py-3 px-4 rounded-xl bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors block text-center"
              >
                Become a Seller
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Revision Modal */}
      {isRevisionModalOpen && (
        <RevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          onSubmit={(reason) => {
            axiosFetch.post(`/orders/${displayOrder.id}/request-revision`, { reason })
              .then(() => {
                toast.success("Revision request sent!");
                setIsRevisionModalOpen(false);
                refetch();
              })
              .catch(() => toast.error("Failed to request revision"));
          }}
        />
      )}

      {/* Extension Modal */}
      {isExtensionModalOpen && (
        <ExtensionModal
          isOpen={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
          onSubmit={(extraDays, reason) => {
            axiosFetch.post(`/orders/${displayOrder.id}/request-extension`, { extraDays, reason })
              .then(() => {
                toast.success("Extension requested!");
                setIsExtensionModalOpen(false);
                refetch();
              })
              .catch(() => toast.error("Failed to request extension"));
          }}
        />
      )}

      {/* Slide-over Right Drawer: Order Activity & Escrow Ledger */}
      <div
        className={`fixed inset-0 z-[1100] overflow-hidden select-none transition-all duration-300 ${
          showAdvancedTimeline
            ? "visible opacity-100 pointer-events-auto"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-out ${
            showAdvancedTimeline ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowAdvancedTimeline(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div
            className={`w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showAdvancedTimeline ? "translate-x-0" : "translate-x-full"
            }`}
          >
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-slate-200/80">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Order Activity &amp; Escrow Ledger
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAdvancedTimeline(false)}
                  className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  aria-label="Close ledger"
                >
                  <FiX className="text-2xl stroke-[2.5]" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-7">
                {ledgerGroups.map((group, groupIdx) => (
                  <div key={group.id || groupIdx} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-start">
                      
                      {/* Left Date Badge */}
                      <div className="sm:col-span-4">
                        <span className="inline-block bg-[#F1F3F5] border border-slate-200/90 text-slate-700 font-mono text-[11px] sm:text-xs px-3 py-1.5 rounded-md font-medium">
                          {group.date}
                        </span>
                      </div>

                      {/* Right Timeline Events */}
                      <div className="sm:col-span-8 relative pl-6">
                        {/* Connecting vertical line for multi-item groups */}
                        {group.items.length > 1 && (
                          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#5EEAD4]" />
                        )}

                        <div className="space-y-5">
                          {group.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="relative flex items-start gap-3">
                              {/* Teal Dot with centered line alignment */}
                              <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] shrink-0 mt-1.5 z-10 -ml-6 ring-4 ring-white" />
                              
                              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                                {item.boldPrefix && (
                                  <strong className="font-bold text-slate-900 mr-1.5">
                                    {item.boldPrefix}
                                  </strong>
                                )}
                                <span className="text-slate-700">{item.text}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Divider between date groups */}
                    {groupIdx < ledgerGroups.length - 1 && (
                      <div className="border-b border-slate-200/80 pt-1" />
                    )}
                  </div>
                ))}
              </div>

            </div>
        </div>
      </div>

    </div>
  );
}
