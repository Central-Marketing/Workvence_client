"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  PlusCircle,
  ThumbsUp,
  MessageCircle,
  Eye,
  Sparkles,
  Tag,
  User,
  ChevronRight,
  X,
  Send,
  Flame,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

interface Thread {
  id: string;
  title: string;
  category: string;
  author: string;
  authorBadge?: string;
  timeAgo: string;
  replies: number;
  upvotes: number;
  views: number;
  tags: string[];
  isPinned?: boolean;
}

const initialThreads: Thread[] = [
  {
    id: "t-1",
    title: "Guide: How I scaled from $500/month to $8,000/month in 6 months on Workvence",
    category: "Tips for Sellers",
    author: "Alex Rivera",
    authorBadge: "Top Rated Seller",
    timeAgo: "2 hours ago",
    replies: 42,
    upvotes: 189,
    views: 1420,
    tags: ["Pricing", "Packages", "Growth"],
    isPinned: true
  },
  {
    id: "t-2",
    title: "What are your best practices for client requirement onboarding before starting work?",
    category: "Client Communication",
    author: "Sophie Dubois",
    authorBadge: "Level 2",
    timeAgo: "4 hours ago",
    replies: 28,
    upvotes: 76,
    views: 890,
    tags: ["Onboarding", "Briefs", "Escrow"]
  },
  {
    id: "t-3",
    title: "Showcase: Redesigned a modern SaaS dashboard in Figma — feedback appreciated!",
    category: "Design Showcase",
    author: "Dmitri Volkov",
    authorBadge: "Level 1",
    timeAgo: "1 day ago",
    replies: 19,
    upvotes: 64,
    views: 650,
    tags: ["UI/UX", "Figma", "Feedback"]
  },
  {
    id: "t-4",
    title: "Discussion: Tips for setting up Next.js 16 App Router with Supabase & Stripe webhooks",
    category: "Web & Tech",
    author: "Kenji Sato",
    authorBadge: "Pro Seller",
    timeAgo: "2 days ago",
    replies: 35,
    upvotes: 112,
    views: 1800,
    tags: ["Next.js", "TypeScript", "Stripe"]
  },
  {
    id: "t-5",
    title: "Feature Request: Automatic multi-milestone invoice generator for repeat clients",
    category: "Platform Feedback",
    author: "Rachel Green",
    timeAgo: "3 days ago",
    replies: 51,
    upvotes: 215,
    views: 2400,
    tags: ["Invoicing", "Workspace"]
  }
];

const categories = [
  "All Categories",
  "Tips for Sellers",
  "Client Communication",
  "Web & Tech",
  "Design Showcase",
  "Platform Feedback"
];

export default function ForumPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedCat, setSelectedCat] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    category: "Tips for Sellers",
    content: "",
    tags: ""
  });

  const filteredThreads = threads.filter((t) => {
    const matchesCat = selectedCat === "All Categories" || t.category === selectedCat;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleUpvote = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
    toast.success("Upvoted!");
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      toast.error("Please fill in title and discussion content.");
      return;
    }
    const created: Thread = {
      id: "t-" + Date.now(),
      title: newPost.title,
      category: newPost.category,
      author: "You (Community Member)",
      authorBadge: "Member",
      timeAgo: "Just now",
      replies: 0,
      upvotes: 1,
      views: 1,
      tags: newPost.tags ? newPost.tags.split(",").map((s) => s.trim()) : ["Community"]
    };
    setThreads([created, ...threads]);
    setIsCreatingPost(false);
    setNewPost({ title: "", category: "Tips for Sellers", content: "", tags: "" });
    toast.success("Discussion posted to community forum!");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#112131] font-sans pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#327C73] uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Workvence Community Forum</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
                Discussions, Knowledge & Ideas
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Ask questions, share workflows, get feedback from peers, and vote on platform feature requests.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingPost(true)}
              className="px-6 py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Discussion</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Categories & Stats (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      selectedCat === cat
                        ? "bg-[#327C73] text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{cat}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-3 text-xs text-gray-600">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Forum Rules</h3>
              <p>• Be constructive and respectful.</p>
              <p>• No spamming or self-promotion outside showcase.</p>
              <p>• Protect client confidentiality & private contracts.</p>
            </div>
          </div>

          {/* Right Column: Search + Discussion Threads (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Search Input Bar */}
            <div className="bg-white p-3 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search topics, questions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-gray-800 bg-transparent outline-none"
              />
            </div>

            {/* Threads List */}
            <div className="space-y-3">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#327C73] hover:shadow-sm transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {thread.isPinned && (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pinned
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-gray-100 text-gray-600">
                        {thread.category}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 font-medium">{thread.author}</span>
                      {thread.authorBadge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#10b981]/10 text-[#327C73] font-semibold">
                          {thread.authorBadge}
                        </span>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{thread.timeAgo}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#0f172a] hover:text-[#327C73] transition cursor-pointer">
                      {thread.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {thread.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-[#f1f5f9] text-gray-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Upvotes & Replies Counters */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => handleUpvote(thread.id)}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-[#327C73] border border-gray-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thread.upvotes}</span>
                    </button>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {thread.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {thread.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Start Discussion Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsCreatingPost(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-xl font-bold text-[#0f172a]">Start a Discussion</h3>
              <p className="text-xs text-gray-500">Share with the global Workvence community.</p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                >
                  {categories.filter((c) => c !== "All Categories").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. What are your tips for increasing conversion on gig thumbnails?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Content / Details *</label>
                <textarea
                  rows={4}
                  required
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Provide context, examples, or your specific questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="e.g. Design, Packages, Conversions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Discussion</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
