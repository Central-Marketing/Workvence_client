"use client";

import React, { useState } from "react";
import { axiosFetch } from "@/utils";
import "./SubmitProposalModal.scss";
import { RiCloseLine } from "react-icons/ri";

const SubmitProposalModal = ({ brief, onClose, onSuccess }: any) => {
  const [price, setPrice] = useState(brief.budget || "");
  const [deliveryTime, setDeliveryTime] = useState(brief.deliveryTime || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !deliveryTime || !coverLetter) {
      setErrorMsg("Please fill in price, delivery time, and cover letter!");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosFetch.post(
        `/briefs/${brief._id}/proposals`,
        {
          price: Number(price),
          deliveryTime: Number(deliveryTime),
          coverLetter,
          attachments: attachmentUrl ? [attachmentUrl] : []
        }
      );
      if (!response.data.error) {
        onSuccess(response.data.proposal || response.data);
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Proposal submission failed.";
      setErrorMsg(msg);
      
      if (msg.toLowerCase().includes("already submitted")) {
        setTimeout(() => {
          onSuccess(null, true);
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proposal-modal-overlay">
      <div className="proposal-modal-card">
        <div className="modal-header">
          <h3>Submit Proposal for: {brief.title}</h3>
          <button className="close-btn" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>
        
        {errorMsg && <div className="alert-danger">{errorMsg}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 250"
              required
            />
          </div>
          <div className="form-group">
            <label>Delivery Time (Days)</label>
            <input
              type="number"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="e.g. 4"
              required
            />
          </div>
          <div className="form-group">
            <label>Cover Letter</label>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you are the best fit for this project..."
              required
            />
          </div>
          <div className="form-group">
            <label>Attachment URL (Optional)</label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://example.com/portfolio.pdf"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProposalModal;
