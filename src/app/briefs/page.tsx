// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import { RiSearchLine } from "react-icons/ri";

import { axiosFetch } from "@/utils";
import adminAxios from "@/utils/adminAxios";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import "./Briefs.scss";

const DEFAULT_CATEGORIES = [
  { name: "All Categories", slug: "All" },
  { name: "AI Services", slug: "ai-services" },
  { name: "Programming & Tech", slug: "programming-and-tech" },
  { name: "Graphics & Design", slug: "graphics-and-design" },
  { name: "Writing & Translation", slug: "writing-and-translation" },
  { name: "Digital Marketing", slug: "digital-marketing" },
  { name: "Video & Animation", slug: "video-and-animation" },
  { name: "Data & Analytics", slug: "data-and-analytics" },
  { name: "E-Commerce", slug: "e-commerce" },
  { name: "Business & Consulting", slug: "business-and-consulting" },
  { name: "Other & General", slug: "other-and-general" },
];

const BriefsFeed = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch categories dynamically from backend
  const { data: fetchedCategories } = useQuery({
    queryKey: ['admin-categories-briefs-page'],
    queryFn: () => adminAxios.get('/categories').then(({ data }: any) => data).catch(() => []),
  });

  const categories = useMemo(() => {
    const categoryList = Array.isArray(fetchedCategories)
      ? fetchedCategories
      : Array.isArray(fetchedCategories?.data)
        ? fetchedCategories.data
        : fetchedCategories?.categories || [];

    if (categoryList.length === 0) return DEFAULT_CATEGORIES;

    const formatted = categoryList.map((c: any) => {
      if (typeof c === 'string') {
        const slug = c.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return { name: c, slug };
      }
      const name = c.name || c.title || String(c);
      const slug = c.slug || name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return { name, slug };
    }).filter((c: any) => Boolean(c.name));

    return [{ name: "All Categories", slug: "All" }, ...formatted];
  }, [fetchedCategories]);

  const categoryQuery = category && category !== "All" ? category : "";

  const { isLoading, data: briefs = [] } = useQuery({
    queryKey: ["briefs-feed", categoryQuery],
    queryFn: () =>
      axiosFetch
        .get(`/briefs${categoryQuery ? `?category=${encodeURIComponent(categoryQuery)}` : ""}`)
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.briefs)) return data.briefs;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  // Client-side keyword search
  const filtered = useMemo(() => {
    if (!search.trim()) return briefs;
    const q = search.toLowerCase();
    return briefs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
    );
  }, [briefs, search]);

  return (
    <div className="briefs-feed">
      <div className="container">
        {/* Banner */}
        <div className="page-banner">
          <div className="banner-text">
            <h1>Job Projects</h1>
            <p>
              {user?.isSeller
                ? "Browse open projects and submit your proposals"
                : "Post project requirements and find the best sellers"}
            </p>
          </div>
          <div className="banner-actions">
            {user && !user.isSeller && (
              <Link href="/briefs/create" className="btn-create">
                + Post a Project
              </Link>
            )}
            {user && !user.isSeller && (
              <Link
                href="/briefs/my-briefs"
                className="btn-my-briefs"
              >
                My Projects
              </Link>
            )}
            {user && user.isSeller && (
              <Link
                href="/briefs/my-briefs"
                className="btn-my-briefs"
              >
                My All Proposal
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="filters-bar">
          <div className="search-input-wrap">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search projects by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="loader">
            <Loader size={45} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No projects found</h3>
            <p>
              {search
                ? "Try adjusting your search or category filter"
                : "No open projects at the moment. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="briefs-grid">
            {filtered.map((brief) => (
              <div
                key={brief._id}
                className="brief-card"
                onClick={() => router.push(`/briefs/${brief._id}`)}
              >
                <div className="card-top">
                  <span className="category-tag">
                    {brief.category || "General"}
                  </span>
                  <span className="posted-date">
                    {moment(brief.createdAt).fromNow()}
                  </span>
                </div>

                <h3 className="card-title">{brief.title}</h3>
                <p className="card-desc">{brief.description}</p>

                <div className="card-meta">
                  {brief.budget && (
                    <div className="meta-item">
                      <span className="meta-label">Budget</span>
                      <span className="meta-value green">
                        ${brief.budget}
                      </span>
                    </div>
                  )}
                  {brief.deadline && (
                    <div className="meta-item">
                      <span className="meta-label">Deadline</span>
                      <span className="meta-value">
                        {moment(brief.deadline).format("MMM D")}
                      </span>
                    </div>
                  )}
                  {brief.proposalCount !== undefined && (
                    <div className="meta-item">
                      <span className="meta-label">Proposals</span>
                      <span className="meta-value">
                        {brief.proposalCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="buyer-info">
                    <img
                      src={brief.userID?.image || "/media/noavatar.png"}
                      alt=""
                    />
                    <span>{brief.userID?.username || "Anonymous"}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/briefs/${brief._id}`);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#6ad724',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    View Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BriefsFeed;
