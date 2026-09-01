"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";


import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import supportService from "@/utils/supportService";
import { useUserStore } from "@/store/userStore";
import { Loader, OrderSkeleton, RevisionModal, ExtensionModal } from "@/components";
import moment from "moment";
import "./OrderDetail.scss";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const user = useUserStore((state: any) => state.user);

  // Modal states
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // Delivery states
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [deliveryText, setDeliveryText] = useState("");
  const [deliveryFile, setDeliveryFile] = useState("");
  const [uploadedDeliveryFiles, setUploadedDeliveryFiles] = useState<any[]>([]);
  const [isUploadingDeliveryFiles, setIsUploadingDeliveryFiles] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Countdown timer state
  const [countdownText, setCountdownText] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  // Review states
  const [communicationRating, setCommunicationRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [reviewDescription, setReviewDescription] = useState("");
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, error, data: order, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () =>
      axiosFetch
        .get(`/orders/${id}`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          toast.error(response?.data?.message || "Failed to load order");
        }),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      axiosFetch.get("/reviews").then(({ data }) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.reviews)) return data.reviews;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      }).catch(() => []),
  });

  // Real-time order updates without page reload
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

  // Countdown clock effect
  useEffect(() => {
    if (!order || order.status === 'completed' || !order.deadline) {
      setCountdownText("");
      return;
    }

    const interval = setInterval(() => {
      const targetTime = new Date(order.deadline).getTime();
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        setCountdownText("LATE - Delivery time is over!");
        setIsOverdue(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdownText(
          `${days}d ${hours}h ${minutes}m ${seconds}s remaining`
        );
        setIsOverdue(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const handleContact = async () => {
    if (!order) return;
    const sellerID = typeof order.sellerID === "object" && order.sellerID !== null ? (order.sellerID._id || order.sellerID.id) : order.sellerID;
    const buyerID = typeof order.buyerID === "object" && order.buyerID !== null ? (order.buyerID._id || order.buyerID.id) : order.buyerID;

    const sellerUsername = typeof order.sellerID === "object" ? order.sellerID.username : null;
    const buyerUsername = typeof order.buyerID === "object" ? order.buyerID.username : null;

    try {
      const { data } = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
      const targetId = data?.uuid || data?.conversationID || data?._id || data?.id || data?.data?.uuid || data?.data?.conversationID || data?.data?._id;
      if (targetId) {
        navigate.push(`/message/${targetId}`);
        return;
      }
    } catch {
      // Fetch failed, proceed to create/fetch conversation via POST
    }

    try {
      const { data } = await axiosFetch.post("/conversations", {
        sellerID,
        buyerID,
        to: user?.isSeller ? buyerID : sellerID,
        from: user?.isSeller ? sellerID : buyerID,
        seller_username: sellerUsername,
        buyer_username: buyerUsername
      });
      const targetId = data?.uuid || data?.conversationID || data?._id || data?.id || data?.data?.uuid || data?.data?.conversationID || data?.data?._id;
      if (targetId) {
        navigate.push(`/message/${targetId}`);
      } else {
        toast.error("Could not resolve conversation ID");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to open conversation");
    }
  };

  const handleDeliveryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploadingDeliveryFiles(true);
      toast.loading(`Uploading ${files.length} file(s)...`, { id: "upload-delivery" });
      const newUploaded: any[] = [];

      for (const file of files) {
        const uploaded = await supportService.uploadFileToCloudinary(file, "order_deliveries");
        const localPreview = file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i)
          ? URL.createObjectURL(file)
          : null;

        newUploaded.push({
          name: file.name,
          public_id: uploaded.public_id || null,
          url: uploaded.secure_url || uploaded.url,
          previewUrl: localPreview || uploaded.secure_url || uploaded.url,
          type: file.type || (file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? 'image' : 'file'),
          size: file.size
        });
      }

      setUploadedDeliveryFiles(prev => [...prev, ...newUploaded]);
      toast.success(`${files.length} file(s) attached!`, { id: "upload-delivery" });
    } catch (err) {
      console.error("Failed to upload delivery files:", err);
      toast.error("Failed to upload file(s). Please try again.", { id: "upload-delivery" });
    } finally {
      setIsUploadingDeliveryFiles(false);
      if (deliveryFileInputRef.current) deliveryFileInputRef.current.value = "";
    }
  };

  const handleRemoveDeliveryFile = async (index: number) => {
    const target = uploadedDeliveryFiles[index];
    setUploadedDeliveryFiles(prev => prev.filter((_, i) => i !== index));
    if (target?.public_id) {
      try {
        await supportService.deleteCloudinaryFile(target.public_id);
        toast.success("File deleted from server", { id: "delete-file" });
      } catch (err) {
        console.warn("Failed to delete ", err);
      }
    }
  };

  const handleSecureFileAccess = async (fileUrl: string, action: 'preview' | 'download' = 'download') => {
    if (!fileUrl) return;
    if (fileUrl.includes('signature=') || fileUrl.includes('/download?') || (!fileUrl.includes('cloudinary') && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')))) {
      if (action === 'preview' && /\.(png|jpe?g|gif|webp|svg)/i.test(fileUrl)) {
        setLightboxImage(fileUrl);
      } else {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    try {
      toast.loading("Generating time-limited link...", { id: "sec-file" });
      const signedUrl = await supportService.getSignedAssetUrl(fileUrl, undefined, undefined, order?._id);
      const targetUrl = signedUrl || fileUrl;
      toast.dismiss("sec-file");

      if (action === 'preview') {
        setLightboxImage(targetUrl);
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      toast.error("Access denied or failed to generate secure link.", { id: "sec-file" });
    }
  };

  const handleDeliverSubmit = async (e: any) => {
    e.preventDefault();
    if (!deliveryText && uploadedDeliveryFiles.length === 0) {
      toast.error("Please enter delivery notes or attach files.");
      return;
    }
    setSubmitting(true);
    try {
      const fileUrls = uploadedDeliveryFiles.map(f => f.url).filter(Boolean);

      await axiosFetch.post(`/orders/deliver/${order._id}`, {
        deliveryText,
        deliveryFile: fileUrls[0] || "",
        deliveryFiles: fileUrls
      });
      toast.success("Delivery submitted!");
      setShowDeliverForm(false);
      setDeliveryText("");
      setDeliveryFile("");
      setUploadedDeliveryFiles([]);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit delivery");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await axiosFetch.post(`/orders/complete/${order._id}`);
      toast.success("Order accepted and marked as completed!");
      refetch();
    } catch (err: any) {
      toast.error("Failed to complete order");
    }
  };

  const handleRequestRevisionSubmit = async (reason: string) => {
    setSubmitting(true);
    try {
      await axiosFetch.post(`/orders/${order._id}/request-revision`, { reason });
      toast.success('Your revision request has been sent to the seller.');
      setIsRevisionModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request revision');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestExtensionSubmit = async (extraDays: number, reason: string) => {
    setSubmitting(true);
    try {
      await axiosFetch.post(`/orders/${order._id}/request-extension`, { extraDays, reason });
      toast.success('Your extension request has been sent to the buyer.');
      setIsExtensionModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request extension');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondExtension = async (action: string) => {
    try {
      await axiosFetch.patch(`/orders/${order._id}/respond-extension`, { action });
      toast.success(`Extension request has been ${action}ed.`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to respond to extension request.");
    }
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    if (!reviewDescription.trim()) {
      toast.error("Please enter a review description.");
      return;
    }
    setSubmitting(true);
    try {
      const calculatedStar = Math.round(((communicationRating + qualityRating + valueRating) / 3) * 10) / 10;
      await axiosFetch.post(`/reviews`, {
        orderID: order._id,
        communicationRating,
        qualityRating,
        valueRating,
        description: reviewDescription,
        star: calculatedStar,
      });
      toast.success("Review submitted successfully!");
      setHasSubmittedReview(true);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <OrderSkeleton />;
  if (error || !order) return <div className="error-container">Failed to load order.</div>;

  const isCurrentUserSeller = (user?._id && order?.sellerID && (user._id === order.sellerID._id || user._id === order.sellerID)) || (user?.isSeller && user?.username === order?.sellerID?.username);
  const contactUser = isCurrentUserSeller ? order.buyerID : order.sellerID;
  const isRevision = order?.status?.toLowerCase() === 'revision' || order?.status?.toLowerCase() === 'in_revision' || order?.status?.toLowerCase() === 'in revision' || !!order?.revisionReason;
  const isPaid = order?.status?.toLowerCase() === 'paid' || order?.status?.toLowerCase() === 'in_progress' || order?.status?.toLowerCase() === 'in progress' || isRevision || !order?.status;
  const isDelivered = order?.status?.toLowerCase() === 'delivered';
  const isCompleted = order?.status?.toLowerCase() === 'completed' || order?.status?.toLowerCase() === 'complete';
  const isDisputed = order?.status?.toLowerCase() === 'disputed' || order?.status?.toLowerCase() === 'escalated_to_dispute';
  const isCancelled = order?.status?.toLowerCase() === 'cancelled' || order?.status?.toLowerCase() === 'canceled';
  const extensionData = order?.extensionRequest || order?.extension;
  const hasPendingExtension = extensionData?.status === 'pending';

  const hasAlreadyReviewed =
    hasSubmittedReview ||
    !!order?.hasReviewed ||
    !!order?.isReviewed ||
    !!order?.hasReview ||
    !!order?.isReviewedByBuyer ||
    !!order?.review ||
    !!order?.reviewID;

  return (
    <div className="order-detail">
      <div className="container">

        {/* Left Side: Order Main Details Card */}
        <div className="main-content">

          {/* Order Header Info */}
          <div className="card order-header-card">
            <div className="order-header-info">
              <span className="order-number">Order #{order._id}</span>
              <h1 className='text-xl md:text-2xl font-semibold'>{order.title}</h1>
              <p className="order-meta">
                Buyer: <strong>{order.buyerID?.username}</strong> | Seller: <strong>{order.sellerID?.username}</strong>
              </p>
            </div>
            <div className="order-price-badge">
              <span>Amount Paid</span>
              <h2>{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>
            </div>
          </div>

          {/* Dispute Notice Card */}
          {isDisputed && (
            <div className="card delivery-card border-l-4 border-l-amber-500">
              <div className="delivery-badge-tag bg-amber-100 text-amber-700">🛡️ Order Under Dispute</div>
              <div className="delivery-content">
                <h5 className="text-base font-bold text-slate-900 mb-2">
                  Workvence Support is handling your issue
                </h5>
                <p className="message-text not-italic text-slate-600 text-sm leading-[22px] bg-slate-50 p-4 rounded-lg border border-slate-200 my-2 mb-4">
                  Our Support & Administration team is actively investigating and taking care of this dispute. All payment releases and work deliveries are temporarily paused while administrators review the details. Both parties will be contacted via support tickets.
                </p>
                <div className="delivery-actions flex flex-wrap gap-3 mt-3 pt-0">
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-1.5 bg-[#6ad724] hover:brightness-95 text-white px-5 py-2.5 rounded-lg font-semibold text-sm no-underline transition-all"
                  >
                    🎧 Go to Support Desk
                  </Link>
                  <a
                    href="mailto:support@workvence.com"
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4.5 py-2.5 rounded-lg font-semibold text-sm no-underline transition-all"
                  >
                    ✉️ Email: support@workvence.com
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Notice Card */}
          {isCancelled && (
            <div className="card delivery-card border-l-4 border-l-red-500">
              <div className="delivery-badge-tag bg-red-100 text-red-700">❌ Order Cancelled</div>
              <div className="delivery-content">
                <h5 className="text-base font-bold text-slate-900 mb-2">
                  This order has been cancelled
                </h5>
                <p className="message-text not-italic text-slate-600 text-sm leading-[22px] bg-slate-50 p-4 rounded-lg border border-slate-200 my-2 mb-4">
                  This order was marked as cancelled. If you believe this cancellation was an issue, need assistance with refund details, or wish to appeal, please contact Workvence Support.
                </p>
                <div className="delivery-actions flex flex-wrap gap-3 mt-3 pt-0">
                  <Link
                    href="/support/new"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm no-underline transition-all"
                  >
                    🎧 Contact Support
                  </Link>
                  <a
                    href="mailto:support@workvence.com"
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4.5 py-2.5 rounded-lg font-semibold text-sm no-underline transition-all"
                  >
                    ✉️ Email: support@workvence.com
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Extension Request Banner for Buyer */}
          {!isCurrentUserSeller && hasPendingExtension && (
            <div className="card delivery-card border-l-4 border-l-sky-500">
              <div className="delivery-badge-tag bg-sky-100 text-sky-700">Time Extension Request</div>
              <div className="delivery-content">
                <h5>The Seller has requested more time ({extensionData.extraDays || extensionData.requestedDays} days)</h5>
                <p className="message-text">Reason: "{extensionData.reason}"</p>
              </div>
              <div className="delivery-actions flex gap-4">
                <button className="approve-order-btn" onClick={() => handleRespondExtension('accept')}>
                  Approve Extension
                </button>
                <button
                  onClick={() => handleRespondExtension('reject')}
                  className="bg-white hover:bg-orange-50 text-[#ff6b4a] border border-[#ff6b4a] px-5 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Countdown Clock Display Banner */}
          {countdownText && (
            <div className={`card countdown-card ${isOverdue ? 'overdue' : ''}`}>
              <div className="countdown-icon">⏱</div>
              <div>
                <h5>{isOverdue ? "Order is Late!" : "Time Left to Deliver"}</h5>
                <p className="timer">{countdownText}</p>
              </div>
            </div>
          )}

          {/* Visual Progress Timeline */}
          <div className="card timeline-card">
            <h3>Order Activity Timeline</h3>
            <div className="timeline-steps">
              <div className="step completed">
                <div className="step-bullet">1</div>
                <div className="step-content">
                  <h5>Order Placed & Paid</h5>
                  <p>Funds secured in escrow. Seller began working.</p>
                </div>
              </div>
              <div className={`step ${isDelivered || isCompleted || isRevision ? "completed" : "pending"}`}>
                <div className="step-bullet">2</div>
                <div className="step-content">
                  <h5>Work Delivered</h5>
                  <p>
                    {isDelivered || isCompleted
                      ? "Seller submitted work files for review."
                      : isRevision ? "Buyer requested revisions. Seller is working on them."
                        : "Seller is currently working on your delivery."}
                  </p>
                </div>
              </div>
              <div className={`step ${isCompleted ? "completed" : "pending"}`}>
                <div className="step-bullet">3</div>
                <div className="step-content">
                  <h5>Order Accepted & Completed</h5>
                  <p>
                    {isCompleted
                      ? "Buyer approved the work. Funds released to seller."
                      : "Awaiting buyer review and acceptance."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isRevision && (
            <div className="card delivery-card border-l-4 border-l-amber-500">
              <div className="delivery-badge-tag bg-amber-100 text-amber-800">In Revision</div>
              <div className="delivery-content">
                <h5>{!isCurrentUserSeller ? "Feedback from me:" : "Feedback from Buyer:"}</h5>
                <p className="message-text">"{order.revisionReason || order.revisions?.[order.revisions.length - 1]?.reason || order.revisions?.[order.revisions.length - 1] || "No specific feedback provided."}"</p>
              </div>
            </div>
          )}

          {/* Deliveries Display Details */}
          {(isDelivered || isCompleted) && (order.deliveryText || order.deliveryFile || (order.deliveryFiles && order.deliveryFiles.length > 0)) && (
            <div className="card delivery-card">
              <div className="delivery-badge-tag">Delivered Work</div>
              <div className="delivery-content">
                {order.deliveryText && (
                  <>
                    <h5>Message from Seller:</h5>
                    <p className="message-text">"{order.deliveryText}"</p>
                  </>
                )}

                {(() => {
                  const allDeliveredFiles = [
                    ...(Array.isArray(order.deliveryFiles) ? order.deliveryFiles : []),
                    ...(order.deliveryFile && !order.deliveryFiles?.includes(order.deliveryFile) ? [order.deliveryFile] : [])
                  ].filter(Boolean);

                  if (allDeliveredFiles.length === 0) return null;

                  return (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <h5 className="font-bold text-sm mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>📦 Delivered Attachments ({allDeliveredFiles.length}):</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allDeliveredFiles.map((fileUrl: string, index: number) => {
                          const isImage = /\.(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(fileUrl) || fileUrl.includes('/image/upload/');
                          const isVideo = /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)/i.test(fileUrl) || fileUrl.includes('/video/upload/');
                          const isZip = /\.(zip|rar|7z|tar|gz)/i.test(fileUrl);
                          const isPdf = /\.(pdf)/i.test(fileUrl);
                          const fileName = fileUrl.split('/').pop()?.split('?')[0] || `Attachment ${index + 1}`;

                          if (isImage) {
                            return (
                              <div key={index} className="overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-xs group relative bg-emerald-50/60 dark:bg-emerald-950/30">
                                <img
                                  src={fileUrl}
                                  alt={`Delivery ${index + 1}`}
                                  className="w-full h-40 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                                  onClick={() => handleSecureFileAccess(fileUrl, 'preview')}
                                />
                                <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md shadow-xs">
                                  Image
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSecureFileAccess(fileUrl, 'download')}
                                  className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  Download
                                </button>
                              </div>
                            );
                          }

                          if (isVideo) {
                            return (
                              <div key={index} className="overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-xs bg-emerald-50/60 dark:bg-emerald-950/40 p-2 flex flex-col gap-2">
                                <div className="relative rounded-lg overflow-hidden bg-emerald-950 border border-emerald-300 dark:border-emerald-700">
                                  <video
                                    src={fileUrl}
                                    controls
                                    preload="metadata"
                                    className="w-full max-h-48 object-contain rounded-lg"
                                  />
                                  <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md shadow-xs">
                                    Video Delivery
                                  </div>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{fileName}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSecureFileAccess(fileUrl, 'download')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs font-medium hover:border-emerald-300 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 bg-emerald-600 text-white shadow-xs">
                                  {isZip ? '📦' : isPdf ? '📑' : '📄'}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[160px] sm:max-w-[200px]">{fileName}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    {isZip ? 'Zip Archive' : isPdf ? 'PDF Document' : 'Delivery Asset'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSecureFileAccess(fileUrl, 'download')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 shadow-xs"
                              >
                                Download
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {!isCurrentUserSeller && isDelivered && !isCompleted && (
                <div className="delivery-actions flex gap-4 items-center flex-wrap">
                  <button className="approve-order-btn" onClick={handleCompleteOrder}>
                    Approve Work & Release Funds
                  </button>
                  <button
                    className="request-revision-btn bg-white hover:bg-orange-50 text-[#ff6b4a] border border-[#ff6b4a] px-5 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                    onClick={() => setIsRevisionModalOpen(true)}
                    disabled={submitting}
                  >
                    Request Revision
                  </button>
                  <p className="action-hint w-full mt-1.5">
                    By clicking Approve, you accept the work and authorize release of funds.
                  </p>
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="card delivery-card completed-state">
              <div className="delivery-badge-tag success">✓ Order Completed</div>
              <div className="delivery-content">
                <h5>Final Work Delivery:</h5>
                <p className="message-text">"{order.deliveryText}"</p>
                {order.deliveryFile && (
                  <div className="attachment-box">
                    <span>Attachment:</span>
                    <a href={order.deliveryFile} target="_blank" rel="noopener noreferrer" className="download-btn">
                      View Work Files
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Form for Buyer */}
          {isCompleted && !isCurrentUserSeller && !hasAlreadyReviewed && (
            <div className="card action-form-card mt-6">
              <div className="delivery-teaser">
                <h4>Leave a Review</h4>
                <p>Rate your experience with this seller across the 3 key criteria below.</p>
              </div>
              <form onSubmit={handleReviewSubmit} className="mt-5">
                {/* 3 Criteria Star Selectors */}
                <div className="flex flex-col gap-3.5 mb-5">
                  {[
                    {
                      label: 'Seller communication level',
                      description: 'How responsive and clear was the seller throughout the order?',
                      value: communicationRating,
                      setValue: setCommunicationRating,
                    },
                    {
                      label: 'Quality of delivery',
                      description: 'Did the completed work meet your requirements and expectations?',
                      value: qualityRating,
                      setValue: setQualityRating,
                    },
                    {
                      label: 'Value of delivery',
                      description: 'How satisfied are you with the quality relative to the price paid?',
                      value: valueRating,
                      setValue: setValueRating,
                    },
                  ].map((crit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:px-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{crit.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{crit.description}</div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starNum) => (
                            <button
                              key={starNum}
                              type="button"
                              onClick={() => crit.setValue(starNum)}
                              className="p-0.5 flex items-center hover:scale-125 transition-transform duration-150 cursor-pointer bg-transparent border-0"
                              aria-label={`${crit.label} ${starNum} stars`}
                            >
                              <svg
                                className={`w-5.5 h-5.5 ${starNum <= crit.value ? 'fill-amber-400' : 'fill-slate-300'}`}
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                        <span className="text-[13px] font-bold text-slate-800 min-w-[24px] text-right">
                          {crit.value}.0
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Calculated Overall Rating Preview */}
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-5">
                  <span className="text-[13px] font-semibold text-emerald-800">
                    Calculated Overall Rating:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4.5 h-4.5 fill-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[15px] font-extrabold text-emerald-800">
                      {((communicationRating + qualityRating + valueRating) / 3).toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>

                {/* Review Description Textarea */}
                <div className="mb-5">
                  <label className="block mb-2 font-semibold text-slate-700 text-sm">Review Description</label>
                  <textarea
                    rows={4}
                    value={reviewDescription}
                    onChange={(e) => setReviewDescription(e.target.value)}
                    placeholder="Outstanding work! Code is clean, well-tested, and delivered ahead of schedule."
                    className="w-full p-3 rounded-lg border border-slate-200 text-[15px] resize-y focus:outline-none focus:border-brand-green"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full p-3.5 bg-[#6ad724] hover:brightness-95 text-white rounded-lg text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Review Display for Seller & Buyer */}
          {isCompleted && (() => {
            const currentReview = reviews.find((r: any) =>
              r.orderID === order._id || r.orderID?._id === order._id || order.reviewID === r._id
            ) || order.review;

            if (currentReview) {
              const overallScore = typeof currentReview.star === 'number' && currentReview.star > 0
                ? Number(currentReview.star).toFixed(1)
                : '5.0';

              return (
                <div className="card delivery-card mt-6 border-l-4 border-l-amber-500">
                  <div className="delivery-badge-tag bg-amber-100 text-amber-700">Review from Buyer</div>
                  <div className="delivery-content">
                    <div className="flex items-center mb-2">
                      <span className="text-lg font-bold text-amber-500 mr-2">
                        {overallScore} ★
                      </span>
                    </div>

                    {/* Breakdown Badges if available */}
                    {(Boolean(currentReview.communicationRating) || Boolean(currentReview.qualityRating) || Boolean(currentReview.valueRating)) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentReview.communicationRating && (
                          <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                            Communication: <strong>{Number(currentReview.communicationRating).toFixed(1)} ★</strong>
                          </span>
                        )}
                        {currentReview.qualityRating && (
                          <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                            Quality: <strong>{Number(currentReview.qualityRating).toFixed(1)} ★</strong>
                          </span>
                        )}
                        {currentReview.valueRating && (
                          <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                            Value: <strong>{Number(currentReview.valueRating).toFixed(1)} ★</strong>
                          </span>
                        )}
                      </div>
                    )}

                    <p className="message-text italic">"{currentReview.description}"</p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Interactive Delivery Submission Form for Seller */}
          {isCurrentUserSeller && isPaid && (
            <div className="card action-form-card">
              {!showDeliverForm ? (
                <div className="delivery-teaser">
                  <h4>Ready to submit your work?</h4>
                  <p>Upload files or supply external links along with instructions to complete the order.</p>
                  <div className="flex gap-4 mt-4 justify-center flex-wrap">
                    <button className="start-delivery-btn" onClick={() => setShowDeliverForm(true)}>
                      Deliver Now
                    </button>
                    {!hasPendingExtension && (
                      <button
                        onClick={() => setIsExtensionModalOpen(true)}
                        className="bg-white hover:bg-emerald-50 text-[#6ad724] border border-[#6ad724] px-5 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                      >
                        Request Time Extension
                      </button>
                    )}
                  </div>
                  {hasPendingExtension && (
                    <div className="mt-6 p-4 sm:p-5 bg-sky-50 border-l-4 border-l-sky-500 rounded-lg flex items-center gap-4">
                      <div className="text-2xl flex-shrink-0">⏳</div>
                      <div>
                        <h4 className="m-0 text-sky-900 text-base font-semibold">Time Extension Requested</h4>
                        <p className="mt-1 text-sky-700 text-sm">
                          Waiting for the buyer to review your request for an additional {extensionData.extraDays || extensionData.requestedDays} days.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleDeliverSubmit} className="deliver-form">
                  <h3>Submit Order Delivery</h3>

                  <div className="field-group">
                    <label>Instructions & Work Details</label>
                    <textarea
                      placeholder="Describe what work is included in this delivery..."
                      value={deliveryText}
                      onChange={(e: any) => setDeliveryText(e.target.value)}
                      rows={5}
                    />
                  </div>

                  {/* CDN Upload Attachments Section */}
                  <div className="field-group">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-bold text-slate-800 dark:text-slate-100 text-sm">Delivery Attachments (Images, Videos, Zip Archives)</label>
                      <span className="text-xs text-slate-500 font-medium">Max file size 100MB</span>
                    </div>

                    <input
                      type="file"
                      ref={deliveryFileInputRef}
                      onChange={handleDeliveryFileSelect}
                      multiple
                      className="hidden"
                    />

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onClick={() => !isUploadingDeliveryFiles && deliveryFileInputRef.current?.click()}
                      className={`group border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 rounded-2xl p-6 text-center transition-all cursor-pointer ${isUploadingDeliveryFiles ? 'opacity-80 pointer-events-none' : ''}`}
                    >
                      {isUploadingDeliveryFiles ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                            <Loader size={26} />
                          </div>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                            Uploading Attachment(s)...
                          </p>
                          <p className="text-xs text-slate-500 font-medium">Please wait while your files are processed and secured.</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
                            ☁️
                          </div>
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            Click or Drag & Drop Delivery Files Here
                          </p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Upload high-res images (PNG, JPG, WEBP), videos (MP4, MOV, WEBM), source code, or ZIP archives.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Render Uploaded Delivery Attachments Grid */}
                    {(uploadedDeliveryFiles.length > 0 || isUploadingDeliveryFiles) && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                          <span>Uploaded Delivery Assets ({uploadedDeliveryFiles.length}):</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {isUploadingDeliveryFiles && (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-700 animate-pulse">
                              <div className="w-14 h-14 rounded-lg bg-emerald-200 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                                <Loader size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Uploading file...</p>
                                {/* <p className="text-[11px] text-emerald-600 font-medium">Securing on Cloudinary CDN</p> */}
                              </div>
                            </div>
                          )}
                          {uploadedDeliveryFiles.map((fileObj, idx) => {
                            const isImg = fileObj.type?.includes('image') || /\.(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(fileObj.name) || fileObj.url?.includes('/image/upload/');
                            const isVid = fileObj.type?.includes('video') || /\.(mp4|webm|ogg|mov|mkv|avi)/i.test(fileObj.name) || fileObj.url?.includes('/video/upload/');
                            const isZip = fileObj.type?.includes('zip') || /\.(zip|rar|7z|tar|gz)/i.test(fileObj.name);
                            const isPdf = fileObj.type?.includes('pdf') || /\.(pdf)/i.test(fileObj.name);

                            return (
                              <div
                                key={idx}
                                className="relative flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-xs group hover:border-emerald-300 transition-all"
                              >
                                {isImg ? (
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-700 flex-shrink-0 bg-emerald-100 dark:bg-emerald-950">
                                    <img
                                      src={fileObj.previewUrl || fileObj.url}
                                      alt="Delivery preview"
                                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setLightboxImage(fileObj.previewUrl || fileObj.url)}
                                    />
                                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.2">
                                      IMAGE
                                    </span>
                                  </div>
                                ) : isVid ? (
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-700 flex-shrink-0 bg-emerald-950 flex items-center justify-center">
                                    <video src={fileObj.previewUrl || fileObj.url} className="w-full h-full object-cover" />
                                    <span className="absolute inset-0 bg-emerald-600/60 flex items-center justify-center text-white text-xs font-bold">
                                      ▶
                                    </span>
                                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.2">
                                      VIDEO
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-lg bg-emerald-600 text-white border border-emerald-700 flex flex-col items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
                                    <span>{isZip ? '📦' : isPdf ? '📑' : '📄'}</span>
                                    <span className="text-[9px] font-bold uppercase mt-0.5 text-emerald-100">
                                      {isZip ? 'ZIP' : isPdf ? 'PDF' : 'FILE'}
                                    </span>
                                  </div>
                                )}

                                <div className="flex-1 min-w-0 pr-6">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{fileObj.name}</p>
                                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                                    {fileObj.size ? `${(fileObj.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDeliveryFile(idx);
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 hover:bg-red-500 hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shadow-xs"
                                  title="Remove file"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={submitting || isUploadingDeliveryFiles}>
                      {submitting ? "Submitting..." : "Submit Delivery"}
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => setShowDeliverForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Activity Statement Ledger Card */}
          <div className="card ledger-card">
            <h3>Order Activity & Escrow Ledger</h3>
            <div className="ledger-timeline">
              {order.history && order.history.length > 0 ? (
                order.history.map((item: any, index: number) => {
                  let icon = "📌";
                  if (item.action === "ORDER_CREATED") icon = "💰";
                  if (item.action === "EXTENSION_REQUESTED" || item.action === "EXTENSION_RESPONDED") icon = "⏳";
                  if (item.action === "WORK_DELIVERED" || item.action === "DELIVERY_SUBMITTED") icon = "📦";
                  if (item.action === "REVISION_REQUESTED") icon = "⚠️";
                  if (item.action === "ORDER_COMPLETED" || item.action === "ORDER_ACCEPTED") icon = "✓";

                  return (
                    <div className="ledger-event" key={item._id || index}>
                      <span className="ledger-date">
                        {moment(item.timestamp).format("MMM DD, YYYY - hh:mm A")}
                      </span>
                      <p className="ledger-desc">
                        {icon} {item.note}
                      </p>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="ledger-event">
                    <span className="ledger-date">
                      {moment(order.createdAt).format("MMM DD, YYYY - hh:mm A")}
                    </span>
                    <p className="ledger-desc">
                      💰 Escrow Payment Secured. Stripe confirmed payment of <strong>{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</strong>.
                    </p>
                  </div>

                  {(isDelivered || isCompleted || isRevision) && (
                    <div className="ledger-event">
                      <span className="ledger-date">
                        {moment(order.updatedAt).format("MMM DD, YYYY - hh:mm A")}
                      </span>
                      <p className="ledger-desc">
                        📦 Work Delivered. Seller submitted delivery statement and work files.
                      </p>
                    </div>
                  )}

                  {isRevision && (
                    <div className="ledger-event">
                      <span className="ledger-date">
                        {moment(order.updatedAt).format("MMM DD, YYYY - hh:mm A")}
                      </span>
                      <p className="ledger-desc">
                        ⚠️ Revision Requested. Buyer asked for changes: "{order.revisionReason}".
                      </p>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="ledger-event">
                      <span className="ledger-date">
                        {moment(order.updatedAt).format("MMM DD, YYYY - hh:mm A")}
                      </span>
                      <p className="ledger-desc">
                        ✓ Escrow Cleared. Buyer accepted delivery. Funds of <strong>{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</strong> released to seller's statement ledger.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar Info & Escrow Statement Cards */}
        <div className="sidebar-content">

          {/* Statement Payment Details Card */}
          <div className="card statement-card">
            <h3>Statement Details</h3>
            <hr />
            <div className="statement-row">
              <span className="label">Order Status</span>
              <span className={`status-tag ${order.status || 'paid'}`}>
                {isDisputed ? "Disputed" : isCancelled ? "Cancelled" : isCompleted ? "Completed" : isDelivered ? "Delivered" : isRevision ? "In Revision" : "In Progress"}
              </span>
            </div>
            <div className="statement-row">
              <span className="label">Order ID</span>
              <span className="value font-mono">{order._id}</span>
            </div>
            <div className="statement-row">
              <span className="label">Your Role</span>
              <span className="value">{user?.isSeller ? "Seller" : "Buyer"}</span>
            </div>
            {order.deadline && (
              <div className="statement-row">
                <span className="label">Deadline Date</span>
                <span className="value">{moment(order.deadline).format("MMM DD, YYYY")}</span>
              </div>
            )}
          </div>

          {/* Seller Financial Breakdown Card */}
          {isCurrentUserSeller && (
            <div className={`card statement-card ${isCompleted ? '!border-emerald-200 !bg-emerald-50/40' : '!border-slate-200 !bg-white'}`}>
              <div className="flex justify-between items-center mb-2 gap-2">
                <h3 className="m-0 text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
                  <span>💰</span> Seller Earnings Breakdown
                </h3>
                {order.isCleared ? (
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                    Cleared
                  </span>
                ) : isCompleted ? (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap shrink-0">
                    Holding Period
                  </span>
                ) : (
                  <span className="text-[11px] font-bold bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200 whitespace-nowrap shrink-0">
                    In Escrow
                  </span>
                )}
              </div>
              <hr />

              <div className="statement-row">
                <span className="label">Gross Price</span>
                <span className="value">{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
              </div>

              {(() => {
                const commissionRate = order.commissionRate !== undefined ? Number(order.commissionRate) : 15;
                const platformFee = order.platformFee !== undefined
                  ? Number(order.platformFee)
                  : (order.price * (commissionRate / 100));
                const netEarnings = order.netEarnings !== undefined
                  ? Number(order.netEarnings)
                  : (order.price - platformFee);

                return (
                  <>
                    <div className="statement-row">
                      <span className="label">Platform Fee ({commissionRate}%)</span>
                      <span className="value text-rose-600 font-semibold">
                        -${platformFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="statement-row mt-1.5 pt-2 border-t border-dashed border-slate-300">
                      <span className="label font-bold text-slate-900">Net Seller Payout</span>
                      <span className="value text-base font-extrabold text-emerald-700">
                        ${netEarnings.toFixed(2)}
                      </span>
                    </div>

                    <div className="statement-row mt-1">
                      <span className="label">Clearance Schedule</span>
                      <span className="value text-xs text-right max-w-[60%]">
                        {order.isCleared ? (
                          <span className="text-emerald-700 font-bold">
                            ✓ Cleared {order.clearedAt ? `(${moment(order.clearedAt).format('MMM DD, YYYY')})` : ''}
                          </span>
                        ) : order.clearsAt ? (
                          <span className="text-amber-700 font-semibold">
                            {moment(order.clearsAt).format('MMM DD, YYYY')}
                            <span className="block text-[10.5px] text-stone-500">
                              ({moment(order.clearsAt).fromNow()})
                            </span>
                          </span>
                        ) : isCompleted ? (
                          <span className="text-slate-500">Pending clearance</span>
                        ) : (
                          <span className="text-slate-500">Holding period applies on completion</span>
                        )}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}


          {/* Contact User Profile Card */}
          {contactUser && (
            <div className="card contact-user-card">
              <h3>Contact Details</h3>
              <hr />
              <div className="contact-user-info">
                <img src={contactUser.image || "/media/noavatar.png"} alt="user pic" />
                <div>
                  <h4>{contactUser.username}</h4>
                  <span className="country">{contactUser.country || "United States"}</span>
                </div>
              </div>
              <p className="bio-desc">
                {contactUser.description.slice(0, 100) + "..." || "No bio description provided."}
              </p>
              <button className="chat-btn" onClick={handleContact}>
                Send Message / Chat
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Enlarged preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 text-white bg-black/60 hover:bg-black/90 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        isLoading={submitting}
        onSubmit={handleRequestRevisionSubmit}
        onClose={() => setIsRevisionModalOpen(false)}
      />

      {/* Extension Modal */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        isLoading={submitting}
        onSubmit={handleRequestExtensionSubmit}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </div>
  );
};

export default OrderDetail;
