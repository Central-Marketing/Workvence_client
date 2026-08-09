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
      toast.success("Brief closed successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to close brief");
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
            <h1>My Briefs</h1>
            <p>Manage your posted job briefs and review proposals</p>
          </div>
          <div className="banner-actions">
            <Link href="/briefs" className="btn-browse">
              Browse All Briefs
            </Link>
            {!user?.isSeller && (
              <Link href="/briefs/create" className="btn-create">
                + New Brief
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
                ? "No briefs yet"
                : `No ${filter} briefs`}
            </h3>
            <p>
              {filter === "all"
                ? "Post your first job brief and start receiving proposals from sellers"
                : "No briefs match this filter"}
            </p>
            {filter === "all" && !user?.isSeller ? (
              <Link href="/briefs/create" className="btn-cta">
                Post Your First Brief
              </Link>
            ) : filter !== "all" ? (
              <button className="btn-cta" onClick={() => setFilter("all")} style={{ cursor: 'pointer', border: 'none' }}>
                Show All Briefs
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

export default function MyBriefsPage() {
  return (
    <PrivateRoute>
      <MyBriefs />
    </PrivateRoute>
  );
}
