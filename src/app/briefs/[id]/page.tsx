// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, SubmitProposalModal } from "@/components";
import "./BriefDetail.scss";

const BriefDetail = () => {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id;
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const [proposalSent, setProposalSent] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch brief details
  const {
    isLoading,
    error,
    data: brief,
  } = useQuery({
    queryKey: ["brief", briefId],
    queryFn: () =>
      axiosFetch.get(`/briefs/${briefId}`).then(({ data }) => data?.brief || data?.data || data),
    enabled: !!briefId,
  });

  // Close brief mutation (buyer)
  const closeMutation = useMutation({
    mutationFn: () =>
      axiosFetch.patch(`/briefs/${briefId}/close`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief", briefId] });
      toast.success("Brief closed");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to close brief");
    },
  });

  const handleProposalSuccess = () => {
    setProposalSent(true);
    toast.success("Proposal submitted successfully!");
  };

  const isClosed = brief?.isClosed || brief?.status === "closed";
  const isOwner =
    brief &&
    user &&
    (brief.userID?._id === user._id || brief.userID === user._id);
  const isSeller = user?.isSeller;

  if (isLoading) {
    return (
      <div className="brief-detail">
        <div className="container">
          <div className="loader">
            <Loader size={45} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="brief-detail">
        <div className="container">
          <div className="error-state">
            <h3>Brief not found</h3>
            <p>This brief may have been removed or the link is invalid.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-detail">
      <div className="container">
        {/* Back */}
        <Link href="/briefs" className="back-link">
          ← Back to Briefs
        </Link>

        {/* Main Detail Card */}
        <div className="detail-card">
          <div className="detail-header">
            <div className="header-left">
              <h1>{brief.title}</h1>
              <div className="header-meta">
                {brief.category && (
                  <span className="category-tag">{brief.category}</span>
                )}
                <span>Posted {moment(brief.createdAt).fromNow()}</span>
                {brief.deadline && (
                  <span>
                    Deadline: {moment(brief.deadline).format("MMM D, YYYY")}
                  </span>
                )}
              </div>
            </div>
            <span className={`status-badge ${isClosed ? "closed" : "open"}`}>
              {isClosed ? "Closed" : "Open"}
            </span>
          </div>

          <div className="detail-body">
            {/* Description */}
            <div>
              <h3 className="section-title">Description</h3>
              <p className="description-text">{brief.description}</p>
            </div>

            {/* Info Grid */}
            <div className="info-grid">
              {brief.budget && (
                <div className="info-item">
                  <div className="info-label">Budget</div>
                  <div className="info-value green">${brief.budget}</div>
                </div>
              )}
              {brief.deadline && (
                <div className="info-item">
                  <div className="info-label">Deadline</div>
                  <div className="info-value">
                    {moment(brief.deadline).format("MMM D, YYYY")}
                  </div>
                </div>
              )}
              {brief.proposalCount !== undefined && (
                <div className="info-item">
                  <div className="info-label">Proposals</div>
                  <div className="info-value">{brief.proposalCount}</div>
                </div>
              )}
            </div>

            {/* Buyer Info */}
            <div className="buyer-section">
              <img
                src={brief.userID?.image || "/media/noavatar.png"}
                alt=""
              />
              <div>
                <div className="buyer-name">
                  {brief.userID?.username || "Anonymous"}
                </div>
                <div className="buyer-label">Brief Owner</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="detail-footer">
            {isOwner && !isClosed && (
              <>
                <Link
                  href={`/briefs/${briefId}/proposals`}
                  className="btn-primary"
                >
                  View Proposals
                </Link>
                <button
                  className="btn-danger"
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                >
                  {closeMutation.isPending ? "Closing..." : "Close Brief"}
                </button>
              </>
            )}
            {isOwner && isClosed && (
              <Link
                href={`/briefs/${briefId}/proposals`}
                className="btn-secondary"
              >
                View Past Proposals
              </Link>
            )}
          </div>
        </div>

        {/* Proposal Action — Sellers only, open briefs only */}
        {isSeller && !isOwner && !isClosed && (
          <div className="proposal-form-card">
            {proposalSent ? (
              <div className="proposal-submitted">
                <div className="check-icon">✅</div>
                <h3>Proposal Submitted!</h3>
                <p>
                  The buyer will review your proposal and may initiate a
                  conversation.
                </p>
              </div>
            ) : (
              <div className="submit-action-area" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2>Ready to submit?</h2>
                <p className="subtitle" style={{ marginBottom: '20px' }}>
                  Convince the buyer why you are the best fit for this project
                </p>
                <button 
                  className="btn-primary" 
                  onClick={() => setShowModal(true)}
                  style={{ padding: '12px 32px', fontSize: '1.1rem' }}
                >
                  Submit Proposal
                </button>
              </div>
            )}
          </div>
        )}

        {/* Closed notice for sellers */}
        {isSeller && !isOwner && isClosed && (
          <div className="proposal-form-card">
            <div className="proposal-submitted">
              <div className="check-icon">🔒</div>
              <h3>This Brief is Closed</h3>
              <p>The buyer is no longer accepting proposals for this project.</p>
            </div>
          </div>
        )}
      </div>
      
      {showModal && (
        <SubmitProposalModal 
          brief={brief} 
          onClose={() => setShowModal(false)}
          onSuccess={handleProposalSuccess}
        />
      )}
    </div>
  );
};

export default BriefDetail;
