"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";


import { axiosFetch } from "@/utils";
import { socket } from "@/utils/socket";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import Swal from 'sweetalert2';
import moment from "moment";
import "./OrderDetail.scss";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const user = useUserStore((state: any) => state.user);

  // Delivery states
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [deliveryText, setDeliveryText] = useState("");
  const [deliveryFile, setDeliveryFile] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Countdown timer state
  const [countdownText, setCountdownText] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  // Review states
  const [reviewStar, setReviewStar] = useState(5);
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
      // Re-fetch or update order state in-place without page reload!
      if (data.orderId === id) {
        refetch(); // Trigger react-query refetch
      }
    };
    socket.on("order_updated", handleOrderUpdate);
    return () => {
      socket.off("order_updated", handleOrderUpdate);
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
    const sellerID = order.sellerID.hasOwnProperty("_id") ? order.sellerID._id : order.sellerID;
    const buyerID = order.buyerID.hasOwnProperty("_id") ? order.buyerID._id : order.buyerID;

    axiosFetch
      .get(`/conversations/single/${sellerID}/${buyerID}`)
      .then(({ data }) => {
        navigate.push(`/message/${data.conversationID}`);
      })
      .catch(async () => {
        const { data } = await axiosFetch.post("/conversations", {
          to: user.isSeller ? buyerID : sellerID,
          from: user.isSeller ? sellerID : buyerID,
        });
        navigate.push(`/message/${data.conversationID}`);
      });
  };

  const handleDeliverSubmit = async (e: any) => {
    e.preventDefault();
    if (!deliveryText) {
      toast.error("Please enter delivery notes.");
      return;
    }
    setSubmitting(true);
    try {
      await axiosFetch.post(`/orders/deliver/${order._id}`, {
        deliveryText,
        deliveryFile
      });
      toast.success("Delivery submitted!");
      setShowDeliverForm(false);
      setDeliveryText("");
      setDeliveryFile("");
      refetch();
    } catch (err: any) {
      toast.error("Failed to submit delivery");
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

  const handleRequestRevision = async () => {
    const { value: text } = await Swal.fire({
      title: 'Request Revision',
      input: 'textarea',
      inputLabel: 'What needs to be changed?',
      inputPlaceholder: 'Please describe the revisions needed clearly...',
      showCancelButton: true,
      confirmButtonColor: '#6ad724',
      inputValidator: (value) => {
        if (!value) return 'You need to write a reason!';
      }
    });

    if (text) {
      setSubmitting(true);
      try {
        await axiosFetch.post(`/orders/${order._id}/request-revision`, { reason: text });
        Swal.fire('Sent!', 'Your revision request has been sent to the seller.', 'success');
        refetch();
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to request revision', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRequestExtension = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Request Time Extension',
      html:
        '<input id="swal-input1" type="number" min="1" class="swal2-input" placeholder="Extra Days Needed (e.g. 2)">' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="Reason for extension..."></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#6ad724',
      preConfirm: () => {
        const days = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const reason = (document.getElementById('swal-input2') as HTMLTextAreaElement).value;
        if (!days || !reason) {
          Swal.showValidationMessage('Both fields are required');
        }
        return { extraDays: parseInt(days), reason };
      }
    });

    if (formValues) {
      setSubmitting(true);
      try {
        await axiosFetch.post(`/orders/${order._id}/request-extension`, formValues);
        Swal.fire('Sent!', 'Your extension request has been sent to the buyer.', 'success');
        refetch();
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to request extension', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRespondExtension = async (action: string) => {
    try {
      await axiosFetch.patch(`/orders/${order._id}/respond-extension`, { action });
      Swal.fire('Success', `Extension request has been ${action}ed.`, 'success');
      refetch();
    } catch (err: any) {
      toast.error("Failed to respond to extension request.");
    }
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    if (!reviewDescription) {
      toast.error("Please enter a review description.");
      return;
    }
    setSubmitting(true);
    try {
      await axiosFetch.post(`/reviews`, {
        orderID: order._id,
        star: reviewStar,
        description: reviewDescription,
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

  if (isLoading) return <div className="loader-container"><Loader size={50} /></div>;
  if (error || !order) return <div className="error-container">Failed to load order.</div>;

  const isCurrentUserSeller = (user?._id && order?.sellerID && (user._id === order.sellerID._id || user._id === order.sellerID)) || (user?.isSeller && user?.username === order?.sellerID?.username);
  const contactUser = isCurrentUserSeller ? order.buyerID : order.sellerID;
  const isRevision = order?.status?.toLowerCase() === 'revision' || order?.status?.toLowerCase() === 'in_revision' || order?.status?.toLowerCase() === 'in revision' || !!order?.revisionReason;
  const isPaid = order?.status?.toLowerCase() === 'paid' || order?.status?.toLowerCase() === 'in_progress' || order?.status?.toLowerCase() === 'in progress' || isRevision || !order?.status;
  const isDelivered = order?.status?.toLowerCase() === 'delivered';
  const isCompleted = order?.status?.toLowerCase() === 'completed';
  const extensionData = order?.extensionRequest || order?.extension;
  const hasPendingExtension = extensionData?.status === 'pending';

  return (
    <div className="order-detail">
      <div className="container">
        
        {/* Left Side: Order Main Details Card */}
        <div className="main-content">
          
          {/* Order Header Info */}
          <div className="card order-header-card">
            <div className="order-header-info">
              <span className="order-number">Order #{order._id}</span>
              <h1>{order.title}</h1>
              <p className="order-meta">
                Buyer: <strong>{order.buyerID?.username}</strong> | Seller: <strong>{order.sellerID?.username}</strong>
              </p>
            </div>
            <div className="order-price-badge">
              <span>Amount Paid</span>
              <h2>{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>
            </div>
          </div>

          {/* Extension Request Banner for Buyer */}
          {!isCurrentUserSeller && hasPendingExtension && (
            <div className="card delivery-card" style={{ borderLeft: '4px solid #0095ff' }}>
              <div className="delivery-badge-tag" style={{ background: '#e0f2fe', color: '#0284c7' }}>Time Extension Request</div>
              <div className="delivery-content">
                <h5>The Seller has requested more time ({extensionData.extraDays || extensionData.requestedDays} days)</h5>
                <p className="message-text">Reason: "{extensionData.reason}"</p>
              </div>
              <div className="delivery-actions" style={{ display: 'flex', gap: '15px' }}>
                <button className="approve-order-btn" onClick={() => handleRespondExtension('accept')}>
                  Approve Extension
                </button>
                <button 
                  onClick={() => handleRespondExtension('reject')}
                  style={{ background: 'white', color: '#ff6b4a', border: '1px solid #ff6b4a', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
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
            <div className="card delivery-card" style={{ borderLeft: '4px solid #ff9800' }}>
              <div className="delivery-badge-tag" style={{ background: '#fff3e0', color: '#e65100' }}>In Revision</div>
              <div className="delivery-content">
                <h5>{!isCurrentUserSeller ? "Feedback from me:" : "Feedback from Buyer:"}</h5>
                <p className="message-text">"{order.revisionReason || order.revisions?.[order.revisions.length - 1]?.reason || order.revisions?.[order.revisions.length - 1] || "No specific feedback provided."}"</p>
              </div>
            </div>
          )}

          {/* Deliveries Display Details */}
          {isDelivered && (
            <div className="card delivery-card">
              <div className="delivery-badge-tag">Delivered Work</div>
              <div className="delivery-content">
                <h5>Message from Seller:</h5>
                <p className="message-text">"{order.deliveryText}"</p>
                {order.deliveryFile && (
                  <div className="attachment-box">
                    <span>Attachment:</span>
                    <a href={order.deliveryFile} target="_blank" rel="noopener noreferrer" className="download-btn">
                      View Delivery Attachment / Link
                    </a>
                  </div>
                )}
              </div>
              
              {!isCurrentUserSeller && (
                <div className="delivery-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="approve-order-btn" onClick={handleCompleteOrder}>
                    Approve Work & Release Funds
                  </button>
                  <button 
                    className="request-revision-btn" 
                    onClick={handleRequestRevision}
                    disabled={submitting}
                    style={{ background: 'white', color: '#ff6b4a', border: '1px solid #ff6b4a', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Request Revision
                  </button>
                  <p className="action-hint" style={{ width: '100%', marginTop: '5px' }}>
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
          {isCompleted && !isCurrentUserSeller && !hasSubmittedReview && !order.isReviewed && (
            <div className="card action-form-card" style={{ marginTop: '24px' }}>
              <div className="delivery-teaser">
                <h4>Leave a Review</h4>
                <p>Share your experience with this seller to help others.</p>
              </div>
              <form onSubmit={handleReviewSubmit} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Rating (1-5)</label>
                  <select 
                    value={reviewStar} 
                    onChange={(e) => setReviewStar(Number(e.target.value))}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Review Description</label>
                  <textarea 
                    rows={4}
                    value={reviewDescription}
                    onChange={(e) => setReviewDescription(e.target.value)}
                    placeholder="Outstanding work! Code is clean, well-tested, and delivered ahead of schedule."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', resize: 'vertical' }}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ width: '100%', padding: '14px', background: '#6ad724', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Review Display for Seller */}
          {isCompleted && (() => {
            const currentReview = reviews.find((r: any) => 
              r.orderID === order._id || r.orderID?._id === order._id || order.reviewID === r._id
            ) || order.review;

            if (currentReview) {
              return (
                <div className="card delivery-card" style={{ marginTop: '24px', borderLeft: '4px solid #f59e0b' }}>
                  <div className="delivery-badge-tag" style={{ background: '#fef3c7', color: '#b45309' }}>Review from Buyer</div>
                  <div className="delivery-content">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginRight: '8px' }}>{currentReview.star} ★</span>
                    </div>
                    <p className="message-text" style={{ fontStyle: 'italic' }}>"{currentReview.description}"</p>
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
                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px', justifyContent: 'center' }}>
                    <button className="start-delivery-btn" onClick={() => setShowDeliverForm(true)}>
                      Deliver Now
                    </button>
                    {!hasPendingExtension && (
                      <button 
                        onClick={handleRequestExtension}
                        style={{ background: 'white', color: '#6ad724', border: '1px solid #6ad724', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Request Time Extension
                      </button>
                    )}
                  </div>
                  {hasPendingExtension && (
                    <div style={{ marginTop: '24px', padding: '16px 20px', background: '#f0f9ff', borderLeft: '4px solid #0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '24px' }}>⏳</div>
                      <div>
                        <h4 style={{ margin: 0, color: '#0369a1', fontSize: '16px', fontWeight: 600 }}>Time Extension Requested</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#0284c7', fontSize: '14px' }}>
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
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Attachment URL / Download Link</label>
                    <input 
                      type="text" 
                      placeholder="e.g. https://github.com, https://drive.google.com/..."
                      value={deliveryFile}
                      onChange={(e: any) => setDeliveryFile(e.target.value)}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={submitting}>
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
                {isCompleted ? "Completed" : isDelivered ? "Delivered" : isRevision ? "In Revision" : "In Progress"}
              </span>
            </div>
            <div className="statement-row">
              <span className="label">Order ID</span>
              <span className="value font-mono">{order._id}</span>
            </div>
            <div className="statement-row">
              <span className="label">Your Role</span>
              <span className="value">{user.isSeller ? "Seller" : "Buyer"}</span>
            </div>
            {order.deadline && (
              <div className="statement-row">
                <span className="label">Deadline Date</span>
                <span className="value">{moment(order.deadline).format("MMM DD, YYYY")}</span>
              </div>
            )}
          </div>

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
                {contactUser.description || "No bio description provided."}
              </p>
              <button className="chat-btn" onClick={handleContact}>
                Send Message / Chat
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default OrderDetail;
