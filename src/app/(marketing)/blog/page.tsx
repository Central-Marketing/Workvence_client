"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Sparkles,
  Tag,
  Share2,
  X,
  Mail
} from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  isFeatured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "b-1",
    title: "The Ultimate Guide to Packaging & Pricing Your Freelance Services in 2026",
    category: "Freelance Tips",
    author: "Elena Rostova",
    authorRole: "Top Rated Design Lead",
    date: "August 26, 2026",
    readTime: "6 min read",
    isFeatured: true,
    summary: "Move away from low-margin hourly billing. Discover how 3-tier value packaging helps you attract higher-quality clients and double your monthly revenue.",
    content: `Freelancing in 2026 is no longer about selling raw hours—it is about delivering guaranteed outcomes.

When clients hire on Workvence, they want predictability. A transparent 3-tier package (Basic, Standard, Premium) allows buyers to self-select the exact scope they need without friction.

Key Takeaways:
1. Anchor High: Ensure your Premium tier offers unmatched VIP value (e.g. source files, expedited delivery, brand strategy consultation).
2. Clarify Deliverables: State exactly what is included and what constitutes an extra add-on.
3. Use Milestone Escrow: For projects over $500, break deliverables into clear milestones to maintain positive cash flow.`
  },
  {
    id: "b-2",
    title: "How to Leverage AI in Your Full-Stack Web Development Workflow",
    category: "Tech & AI",
    author: "Kenji Sato",
    authorRole: "Principal Engineer",
    date: "August 14, 2026",
    readTime: "5 min read",
    summary: "Practical techniques for using LLMs and vector search to automate boilerplate code, generate schema migrations, and ship client apps 3x faster.",
    content: `Artificial intelligence is changing the nature of software contracting. Senior engineers who embrace automated testing suites, LLM-based refactoring, and vector embedding workflows can deliver enterprise-grade applications in days rather than months.`
  },
  {
    id: "b-3",
    title: "Building Trust with Enterprise Buyers: Contracts, NDAs, and Escrow",
    category: "Business Growth",
    author: "Marcus Vance",
    authorRole: "Marketplace Operations",
    date: "July 30, 2026",
    readTime: "4 min read",
    summary: "Why enterprise clients care more about compliance, IP ownership transfer, and clear communication than raw cost.",
    content: `When corporate teams look for external talent, their primary concern is risk mitigation. Having standardized NDAs, escrow protection, and documented commercial IP transfer makes hiring you an easy decision for corporate directors.`
  },
  {
    id: "b-4",
    title: "10 UI/UX Micro-Interactions That Transform E-Commerce Conversion Rates",
    category: "Design",
    author: "Sophie Dubois",
    authorRole: "Senior Product Designer",
    date: "July 18, 2026",
    readTime: "5 min read",
    summary: "Explore dynamic hover states, fluid cart drawers, and skeleton loaders that elevate checkout completion by over 24%.",
    content: `Subtle visual feedback communicates speed and reliability. Implementing smooth micro-interactions in modern web apps creates an intuitive experience that keeps users engaged through the payment flow.`
  }
];

const categories = ["All", "Freelance Tips", "Tech & AI", "Business Growth", "Design"];

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCat = selectedCat === "All" || post.category === selectedCat;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    toast.success("Subscribed to Workvence Insights newsletter!");
    setSubscribeEmail("");
  };

  const featured = blogPosts.find((p) => p.isFeatured) || blogPosts[0];

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section / Featured Post */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
                <BookOpen className="w-4 h-4 text-[#10b981]" />
                <span>Workvence Insights & Blog</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a]">
                Ideas, Playbooks & Strategies
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                In-depth articles from top creators, engineers, and marketplace leaders.
              </p>
            </div>

            {/* Featured Article Card */}
            <div
              onClick={() => setSelectedPost(featured)}
              className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xs hover:border-[#327C73] hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full font-bold bg-[#10b981]/10 text-[#327C73]">
                  Featured • {featured.category}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{featured.date}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{featured.readTime}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] hover:text-[#327C73] transition-colors leading-tight">
                {featured.title}
              </h2>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                {featured.summary}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs">
                  <span className="font-bold text-[#0f172a] block">{featured.author}</span>
                  <span className="text-gray-400">{featured.authorRole}</span>
                </div>
                <span className="text-xs font-bold text-[#327C73] inline-flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* Controls: Search & Categories */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCat === cat
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#327C73] outline-none"
              />
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-7 hover:bg-white hover:border-[#327C73] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-md font-bold bg-[#10b981]/10 text-[#327C73]">
                      {post.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0f172a] hover:text-[#327C73] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-normal line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{post.author}</span>
                    <span className="text-[11px] text-gray-400">{post.date}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#327C73]" />
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Box */}
          <div className="mt-20 bg-[#0f172a] text-white rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold">Stay Ahead in the Creator Economy</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
              Get our weekly digest of top freelance playbooks, marketplace trends, and exclusive interviews delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#10b981]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-3 mb-6">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#10b981]/10 text-[#327C73]">
                {selectedPost.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] leading-snug">
                {selectedPost.title}
              </h2>
              <div className="text-xs text-gray-500">
                By {selectedPost.author} ({selectedPost.authorRole}) • {selectedPost.date} • {selectedPost.readTime}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedPost.content}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Workvence Insights Editorial</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Article link copied!");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
