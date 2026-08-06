"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";


import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to complete order");
    }
  };

  if (isLoading) return <div className="loader-container"><Loader size={50} /></div>;
  if (error || !order) return <div className="error-container">Failed to load order.</div>;

  const contactUser = user?.isSeller ? order.buyerID : order.sellerID;
  const isPaid = order.status === 'paid' || !order.status;
  const isDelivered = order.status === 'delivered';
  const isCompleted = order.status === 'completed';

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
              <div className={`step ${isDelivered || isCompleted ? "completed" : "pending"}`}>
                <div className="step-bullet">2</div>
                <div className="step-content">
                  <h5>Work Delivered</h5>
                  <p>
                    {isDelivered || isCompleted 
                      ? "Seller submitted work files for review." 
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
              
              {!user.isSeller && (
                <div className="delivery-actions">
                  <button className="approve-order-btn" onClick={handleCompleteOrder}>
                    Approve Work & Release Funds
                  </button>
                  <p className="action-hint">
                    By clicking, you accept the work and authorize release of funds.
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

          {/* Interactive Delivery Submission Form for Seller */}
          {user.isSeller && isPaid && (
            <div className="card action-form-card">
              {!showDeliverForm ? (
                <div className="delivery-teaser">
                  <h4>Ready to submit your work?</h4>
                  <p>Upload files or supply external links along with instructions to complete the order.</p>
                  <button className="start-delivery-btn" onClick={() => setShowDeliverForm(true)}>
                    Deliver Now
                  </button>
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
              <div className="ledger-event">
                <span className="ledger-date">
                  {moment(order.createdAt).format("MMM DD, YYYY - hh:mm A")}
                </span>
                <p className="ledger-desc">
                  💰 Escrow Payment Secured. Stripe confirmed payment of <strong>{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</strong>.
                </p>
              </div>

              {(isDelivered || isCompleted) && (
                <div className="ledger-event">
                  <span className="ledger-date">
                    {moment(order.updatedAt).format("MMM DD, YYYY - hh:mm A")}
                  </span>
                  <p className="ledger-desc">
                    📦 Work Delivered. Seller submitted delivery statement and work files.
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
                {isCompleted ? "Completed" : isDelivered ? "Delivered" : "In Progress"}
              </span>
            </div>
            <div className="statement-row">
              <span className="label">Payment ID</span>
              <span className="value font-mono">{order.payment_intent}</span>
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
