// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import "./MyBriefs.scss";

const MyBriefs = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, data: briefs = [] } = useQuery({
    queryKey: ["my-briefs"],
    queryFn: () =>
      axiosFetch
        .get("/briefs/my-briefs")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.briefs)) return data.briefs;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  const closeMutation = useMutation({
    mutationFn: (briefId) =>
      axiosFetch.patch(`/briefs/${briefId}/close`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-briefs"] });
      toast.success("Project closed successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to close project");
    },
  });

  const filtered = useMemo(() => {
    const briefsArray = Array.isArray(briefs) ? briefs : [];
    if (filter === "all") return briefsArray;
    if (filter === "open")
      return briefsArray.filter((b) => !b.isClosed && b.status !== "closed");
    return briefsArray.filter((b) => b.isClosed || b.status === "closed");
  }, [briefs, filter]);

  const briefsArray = Array.isArray(briefs) ? briefs : [];
  const openCount = briefsArray.filter(
    (b) => !b.isClosed && b.status !== "closed"
  ).length;
  const closedCount = briefsArray.length - openCount;

  if (!user) {
    return (
      <div className="my-briefs">
        <div className="container">
          <div className="loader">
            <Loader size={45} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-briefs">
      <div className="container">
        {/* Banner */}
        <div className="page-banner">
          <div className="banner-text">
            <h1>My Projects</h1>
            <p>Manage your posted job projects and review proposals</p>
          </div>
          <div className="banner-actions">
            <Link href="/briefs" className="btn-browse">
              Browse All Projects
            </Link>
            {!user?.isSeller && (
              <Link href="/briefs/create" className="btn-create">
                + New Project
              </Link>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({briefsArray.length})
          </button>
          <button
            className={`tab-btn ${filter === "open" ? "active" : ""}`}
            onClick={() => setFilter("open")}
          >
            Open ({openCount})
          </button>
          <button
            className={`tab-btn ${filter === "closed" ? "active" : ""}`}
            onClick={() => setFilter("closed")}
          >
            Closed ({closedCount})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="loader">
            <Loader size={45} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>
              {filter === "all"
                ? "No projects yet"
                : `No ${filter} projects`}
            </h3>
            <p>
              {filter === "all"
                ? "Post your first job project and start receiving proposals from sellers"
                : "No projects match this filter"}
            </p>
            {filter === "all" && !user?.isSeller ? (
              <Link href="/briefs/create" className="btn-cta">
                Post Your First Project
              </Link>
            ) : filter !== "all" ? (
              <button className="btn-cta" onClick={() => setFilter("all")} style={{ cursor: 'pointer', border: 'none' }}>
                Show All Projects
              </button>
            ) : null}
          </div>
        ) : (
          <div className="briefs-list">
            {filtered.map((brief) => {
              const isClosed = brief.isClosed || brief.status === "closed";
              return (
                <div
                  key={brief._id}
                  className="brief-row"
                  onClick={() => router.push(`/briefs/${brief._id}`)}
                >
                  <div className="brief-info">
                    <h3 className="brief-title">{brief.title}</h3>
                    <div className="brief-meta">
                      {brief.category && (
                        <span>
                          Category:{" "}
                          <span className="meta-value">{brief.category}</span>
                        </span>
                      )}
                      {brief.budget && (
                        <span>
                          Budget:{" "}
                          <span className="meta-value">${brief.budget}</span>
                        </span>
                      )}
                      <span>
                        Posted:{" "}
                        <span className="meta-value">
                          {moment(brief.createdAt).fromNow()}
                        </span>
                      </span>
                      {brief.proposalCount !== undefined && (
                        <span>
                          Proposals:{" "}
                          <span className="meta-value">
                            {brief.proposalCount}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="brief-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`status-badge ${isClosed ? "closed" : "open"}`}
                    >
                      {isClosed ? "Closed" : "Open"}
                    </span>

                    {!isClosed && brief.proposalCount > 0 && (
                      <Link
                        href={`/briefs/${brief._id}/proposals`}
                        className="btn-proposals"
                      >
                        View Proposals
                      </Link>
                    )}

                    <Link
                      href={`/briefs/${brief._id}`}
                      className="btn-view"
                    >
                      Details
                    </Link>

                    {!isClosed && (
                      <button
                        className="btn-close"
                        onClick={() => closeMutation.mutate(brief._id)}
                        disabled={closeMutation.isPending}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
const MyProposals = () => {
  const router = useRouter();
  const { isLoading, data: proposals = [] } = useQuery({
    queryKey: ["my-proposals"],
    queryFn: () =>
      axiosFetch
        .get("/briefs/my-proposals")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.proposals)) return data.proposals;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  return (
    <div className="my-briefs">
      <div className="container">
        {/* Banner */}
        <div className="page-banner">
          <div className="banner-text">
            <h1>My Proposals</h1>
            <p>Track your submitted proposals for job projects</p>
          </div>
          <div className="banner-actions">
            <Link href="/briefs" className="btn-browse">
              Browse Open Projects
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="loader">
            <Loader size={45} />
          </div>
        ) : proposals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No proposals submitted</h3>
            <p>You haven't submitted any proposals yet. Browse open projects and start pitching!</p>
            <Link href="/briefs" className="btn-cta">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="briefs-list">
            {proposals.map((proposal: any) => {
              const briefId = proposal.briefID?._id || proposal.briefID;
              return (
                <div
                  key={proposal._id}
                  className="brief-row"
                  onClick={() => router.push(`/briefs/${briefId}`)}
                >
                  <div className="brief-info">
                    <h3 className="brief-title">
                      {proposal.briefID?.title || "Unknown Project"}
                    </h3>
                    <div className="brief-meta">
                      {proposal.price && (
                        <span>
                          Your Offer:{" "}
                          <span className="meta-value">${proposal.price}</span>
                        </span>
                      )}
                      {proposal.deliveryTime && (
                        <span>
                          Delivery:{" "}
                          <span className="meta-value">{proposal.deliveryTime} Days</span>
                        </span>
                      )}
                      <span>
                        Submitted:{" "}
                        <span className="meta-value">
                          {moment(proposal.createdAt).fromNow()}
                        </span>
                      </span>
                    </div>
                    {proposal.coverLetter && (
                      <div style={{ marginTop: '14px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                        <strong style={{ color: '#1e293b' }}>Cover Letter:</strong>
                        <div style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>{proposal.coverLetter}</div>
                      </div>
                    )}
                  </div>

                  <div
                    className="brief-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/briefs/${briefId}`}
                      className="btn-view"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyBriefsPage() {
  const user = useUserStore((state) => state.user);

  return (
    <PrivateRoute>
      {user?.isSeller ? <MyProposals /> : <MyBriefs />}
    </PrivateRoute>
  );
}
