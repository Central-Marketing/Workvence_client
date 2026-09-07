"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import {
  FiHome,
  FiSliders,
  FiArrowRight,
  FiArrowLeft,
  FiSearch,
  FiX,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import { ClientBrief } from "@/types";

// Categorized taxonomy data matching user target design with pixel-perfect precision
interface ProjectTaxonomyItem {
  id: string;
  title: string;
  subtitle: string;
  items: {
    title: string;
    description: string;
  }[];
}

const PROJECT_CATEGORIES: ProjectTaxonomyItem[] = [
  {
    id: "ai-and-automation",
    title: "AI & Automation",
    subtitle:
      "Browse AI and automation projects and start earning by bidding on work that matches your skills.",
    items: [
      {
        title: "Visual Design Elements",
        description: "Participate in innovative AI challenges",
      },
      {
        title: "User Interface Components",
        description: "Explore groundbreaking machine learning tasks",
      },
      {
        title: "Logo & Brand Identity",
        description: "Bid on cutting-edge AI projects",
      },
      {
        title: "Typography & Fonts",
        description: "Engage with futuristic AI development bids",
      },
      {
        title: "Color Schemes & Palettes",
        description: "Join creative AI algorithm contests",
      },
      {
        title: "Iconography Styles",
        description: "Compete in next-gen AI software projects",
      },
      {
        title: "Interactive Prototypes",
        description: "Submit proposals for advanced AI solutions",
      },
      {
        title: "Motion Graphics",
        description: "Collaborate on pioneering AI applications",
      },
      {
        title: "Brand Guidelines",
        description: "Contribute to revolutionary AI model design",
      },
      {
        title: "Packaging Design",
        description: "Pitch ideas for state-of-the-art AI tools",
      },
      {
        title: "Digital Illustration",
        description: "Tender for transformative AI system builds",
      },
      {
        title: "Creative Direction",
        description: "Apply for high-impact AI innovation projects",
      },
    ],
  },
  {
    id: "development-and-it",
    title: "Development & IT",
    subtitle:
      "Web and app builds, servers, databases, DevOps, and everything in between.",
    items: [
      {
        title: "Cloud Infrastructure",
        description: "Manage scalable and secure cloud environments",
      },
      {
        title: "DevOps Automation",
        description: "Implement CI/CD pipelines for seamless deployments",
      },
      {
        title: "Cybersecurity",
        description: "Develop protocols to protect data integrity",
      },
      {
        title: "Backend Development",
        description: "Build robust server-side applications",
      },
      {
        title: "Frontend Development",
        description: "Create responsive and accessible user interfaces",
      },
      {
        title: "Mobile App Development",
        description: "Design apps optimized for iOS and Android platforms",
      },
      {
        title: "Database Administration",
        description: "Optimize database performance and security",
      },
      {
        title: "API Development",
        description: "Design RESTful and GraphQL APIs for integration",
      },
      {
        title: "Machine Learning Engineering",
        description: "Develop models for predictive analytics",
      },
      {
        title: "Network Engineering",
        description: "Configure and maintain enterprise networks",
      },
      {
        title: "Software Testing",
        description: "Conduct automated and manual testing for quality assurance",
      },
      {
        title: "IT Support",
        description: "Provide technical assistance and troubleshooting",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    subtitle:
      "Grow audiences, drive conversions, and amplify brand presence with digital marketing.",
    items: [
      {
        title: "Search Engine Optimization (SEO)",
        description: "Rank content higher and generate sustained organic traffic",
      },
      {
        title: "Social Media Marketing",
        description: "Grow viral followings across Instagram, TikTok, and X",
      },
      {
        title: "Performance Marketing & PPC",
        description: "Optimize ad spend on Google, Meta, and LinkedIn",
      },
      {
        title: "Content Strategy & Copy",
        description: "Craft compelling messages that turn readers into buyers",
      },
      {
        title: "Email Marketing Automation",
        description: "Build high-converting drip sequences and newsletters",
      },
      {
        title: "Influencer Partnerships",
        description: "Coordinate sponsored creator campaigns and outreach",
      },
      {
        title: "Public Relations & Media",
        description: "Secure placements in top industry publications and news",
      },
      {
        title: "Brand Positioning & Strategy",
        description: "Define unique value propositions and market competitive fit",
      },
      {
        title: "Conversion Rate Optimization",
        description: "Analyze funnels and maximize user checkout completions",
      },
      {
        title: "Market Research & Analysis",
        description: "Gather competitive intelligence and customer survey insights",
      },
      {
        title: "Affiliate & Partner Programs",
        description: "Scale word-of-mouth growth and partner commission networks",
      },
      {
        title: "Community Management",
        description: "Engage loyal brand advocates and online Discord/Telegram groups",
      },
    ],
  },
  {
    id: "design-and-creative",
    title: "Design & Creative",
    subtitle:
      "Visual identities, product design, illustrations, and art direction.",
    items: [
      {
        title: "Web & Mobile UI/UX",
        description: "Design intuitive and delightful digital user experiences",
      },
      {
        title: "Brand Identity Systems",
        description: "Build cohesive logos, color palettes, and brand guidelines",
      },
      {
        title: "Vector Illustration",
        description: "Custom visual illustrations for products and editorial media",
      },
      {
        title: "Print & Packaging Design",
        description: "Tangible packaging, boxes, labels, and stationery design",
      },
      {
        title: "3D Modeling & Rendering",
        description: "Hyper-realistic product renders and environment 3D assets",
      },
      {
        title: "Design Systems & Tokens",
        description: "Scalable component libraries in Figma and clean code tokens",
      },
      {
        title: "Typography & Layout",
        description: "Editorial layout for magazines, e-books, and reports",
      },
      {
        title: "Infographic Design",
        description: "Transform complex statistics into clear graphical visual stories",
      },
      {
        title: "Motion Design",
        description: "Fluid micro-animations for modern apps and landing pages",
      },
      {
        title: "Game Art & Concept Art",
        description: "Character concepts, environments, and game sprite sheets",
      },
      {
        title: "Photo Retouching",
        description: "Commercial product retouching and advanced color grading",
      },
      {
        title: "Merchandise & Apparel",
        description: "Custom graphic t-shirts, hoodies, and promotional merchandise",
      },
    ],
  },
  {
    id: "video-and-audio",
    title: "Video & Audio",
    subtitle:
      "Commercials, video editing, voiceovers, sound design, and music production.",
    items: [
      {
        title: "Video Editing & Post-Production",
        description: "Cinematic cutting, pacing, and color grading for films",
      },
      {
        title: "Voiceover & Narration",
        description: "Studio-grade voice acting in multiple accents and languages",
      },
      {
        title: "Music Production & Mixing",
        description: "Original beats, jingles, and full track sound mastering",
      },
      {
        title: "Sound Effects & Foley",
        description: "Immersive audio effects for video, games, and podcasts",
      },
      {
        title: "Explainer & Promo Videos",
        description: "Engaging product walkthroughs and animated explainer ads",
      },
      {
        title: "Visual Effects (VFX)",
        description: "Green screen compositing, 3D tracking, and cleanup work",
      },
      {
        title: "Podcast Audio Engineering",
        description: "Noise removal, vocal leveling, and intro/outro mastering",
      },
      {
        title: "Shorts & Reels Editing",
        description: "Fast-paced vertical clips with viral subtitles and b-roll",
      },
      {
        title: "Subtitles & Captions",
        description: "Accurate multi-lingual captioning and burned-in styling",
      },
      {
        title: "Audio Restoration",
        description: "Repair hiss, echo, and distorted live field audio recordings",
      },
      {
        title: "2D Character Animation",
        description: "Story-driven character animations and animated shorts",
      },
      {
        title: "3D Motion Graphics",
        description: "Dynamic 3D logo reveals and futuristic broadcast bumpers",
      },
    ],
  },
  {
    id: "writing-and-content",
    title: "Writing & Content",
    subtitle:
      "Articles, copywriting, technical documentation, and translations.",
    items: [
      {
        title: "Technical Documentation",
        description: "API references, developer guides, and system architecture docs",
      },
      {
        title: "SEO Articles & Blog Posts",
        description: "Authoritative long-form articles that rank on search engines",
      },
      {
        title: "Landing Page Copywriting",
        description: "High-converting headlines and benefit-driven sales copy",
      },
      {
        title: "Whitepapers & E-Books",
        description: "In-depth industry research and lead-generating assets",
      },
      {
        title: "Scriptwriting & Storyboards",
        description: "Compelling scripts for YouTube, video ads, and commercials",
      },
      {
        title: "Translation & Localization",
        description: "Fluent translation preserving cultural nuance and tone",
      },
      {
        title: "Proofreading & Editing",
        description: "Grammar, tone, and clarity polish for manuscripts and copy",
      },
      {
        title: "Grant & Tender Proposals",
        description: "Persuasive funding applications and RFP bidding responses",
      },
      {
        title: "UX Writing & Microcopy",
        description: "Clear button labels, modals, onboarding, and error messaging",
      },
      {
        title: "Press Releases & Kits",
        description: "Newsworthy announcements formatted for media journalists",
      },
      {
        title: "Email Newsletters",
        description: "Engaging weekly dispatches that retain active subscribers",
      },
      {
        title: "Resume & Career Branding",
        description: "Executive career branding and LinkedIn profile optimization",
      },
    ],
  },
  {
    id: "admin-and-support",
    title: "Admin & Support",
    subtitle:
      "Virtual assistance, data entry, customer support, and project management.",
    items: [
      {
        title: "Virtual Assistance",
        description: "Calendar management, inbox zero, and executive scheduling",
      },
      {
        title: "Customer Support Operations",
        description: "Multi-channel ticket handling via Zendesk and live chat",
      },
      {
        title: "Data Entry & Cleaning",
        description: "Accurate spreadsheet organization and database hygiene",
      },
      {
        title: "CRM & Pipeline Management",
        description: "HubSpot and Salesforce contact tracking and workflow automations",
      },
      {
        title: "Lead Generation & Prospecting",
        description: "B2B list building and verified email contact discovery",
      },
      {
        title: "Project & Agile Management",
        description: "Jira, Trello, and Notion task tracking and sprint scrums",
      },
      {
        title: "Executive Travel Planning",
        description: "Complex itinerary planning and travel orchestration",
      },
      {
        title: "Web Data Scraping",
        description: "Automated extraction of public directories and listings",
      },
      {
        title: "Transcription & Meeting Notes",
        description: "Fast, precise transcripts with key action-item summaries",
      },
      {
        title: "Billing & Invoicing Support",
        description: "Accounts payable/receivable tracking and receipt audits",
      },
      {
        title: "Inventory & Order Management",
        description: "Stock replenishment tracking across multiple channels",
      },
      {
        title: "E-Commerce Store Admin",
        description: "Shopify, Amazon, and WooCommerce product catalog management",
      },
    ],
  },
];

const PILL_FILTERS = [
  { id: "all", title: "All Projects" },
  { id: "ai-and-automation", title: "AI & Automation" },
  { id: "development-and-it", title: "Development & IT" },
  { id: "marketing", title: "Marketing" },
  { id: "design-and-creative", title: "Design & Creative" },
  { id: "video-and-audio", title: "Video & Audio" },
  { id: "writing-and-content", title: "Writing & Content" },
  { id: "admin-and-support", title: "Admin & Support" },
];

function BriefsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.user);

  const initialSearch = searchParams?.get("search") || "";
  const initialCategory = searchParams?.get("category") || "";

  const [activePill, setActivePill] = useState<string>("all");
  const [search, setSearch] = useState<string>(initialSearch);
  const [viewMode, setViewMode] = useState<"hub" | "feed">(
    initialSearch || initialCategory ? "feed" : "hub"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync state if URL query params change externally
  useEffect(() => {
    const qSearch = searchParams?.get("search") || "";
    const qCat = searchParams?.get("category") || "";
    if (qSearch || qCat) {
      setSearch(qSearch);
      setViewMode("feed");
    }
  }, [searchParams]);

  // Fetch real client briefs from backend
  const { isLoading, data: briefs = [] } = useQuery<ClientBrief[]>({
    queryKey: ["briefs-feed"],
    queryFn: () =>
      axiosFetch
        .get("/briefs")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.briefs)) return data.briefs;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  // Filter backend briefs
  const filteredBriefs = useMemo(() => {
    return briefs.filter((brief) => {
      const matchesSearch =
        !search.trim() ||
        brief.title?.toLowerCase().includes(search.toLowerCase()) ||
        brief.description?.toLowerCase().includes(search.toLowerCase()) ||
        brief.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activePill === "all" ||
        brief.category
          ?.toLowerCase()
          .replace(/&/g, "and")
          .replace(/\s+/g, "-")
          .includes(activePill);

      return matchesSearch && matchesCategory;
    });
  }, [briefs, search, activePill]);

  // Handle pill click
  const handlePillClick = (pillId: string) => {
    setActivePill(pillId);
    if (viewMode === "hub") {
      if (pillId === "all") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const targetSection = document.getElementById(`section-${pillId}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  // Handle subcategory card click (transitions to feed filtered by that sub-service)
  const handleSubcategoryClick = (itemTitle: string, categoryId: string) => {
    setSearch(itemTitle);
    setActivePill(categoryId);
    setViewMode("feed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtered categories to display in hub mode
  const displayedCategories = useMemo(() => {
    if (activePill === "all") {
      return PROJECT_CATEGORIES;
    }
    return PROJECT_CATEGORIES.filter((cat) => cat.id === activePill);
  }, [activePill]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top User Navigation Action Bar */}
      <div className="container mx-auto px-4 md:px-6 pt-4 pb-1 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Explore Open Projects</span>
          <span className="text-gray-300">•</span>
          <span>{briefs.length} Active Bids</span>
        </div>
        <div className="flex items-center gap-3">
          {user && !user.isSeller && (
            <Link
              href="/briefs/create"
              className="inline-flex items-center gap-1 font-semibold text-[#327C73] hover:underline"
            >
              + Post a Project
            </Link>
          )}
          {user && !user.isSeller && (
            <Link
              href="/briefs/my-briefs"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
            >
              My Projects
            </Link>
          )}
          {user && user.isSeller && (
            <Link
              href="/briefs/my-briefs"
              className="inline-flex items-center gap-1 font-semibold text-[#327C73] hover:underline"
            >
              My Proposals
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* ============================================================ */}
        {/* HERO BANNER - Exact Architectural 3-Step Pillars & Style     */}
        {/* ============================================================ */}
        <div className="relative w-full h-[190px] sm:h-[220px] md:h-[250px] rounded-2xl sm:rounded-[20px] overflow-hidden bg-[#0f232b] flex items-center justify-center text-center shadow-xs select-none my-5 sm:my-6">
          {/* Architectural 3-Step Pillars Matching Target Screenshot */}
          <div className="absolute inset-0 pointer-events-none flex justify-between">
            {/* Left Step Pillars */}
            <div className="h-full flex items-end w-[32%] sm:w-[30%] md:w-[28%]">
              {/* Outer Left Pillar */}
              <div className="h-[86.4%] w-[33%] bg-[#173e4a]" />
              {/* Middle Left Pillar */}
              <div className="h-[56.7%] w-[34%] bg-[#13323c]" />
              {/* Inner Left Step */}
              <div className="h-[27.9%] w-[33%] bg-[#0f262e]" />
            </div>

            {/* Right Step Pillars */}
            <div className="h-full flex items-end justify-end w-[32%] sm:w-[30%] md:w-[28%]">
              {/* Inner Right Step */}
              <div className="h-[27.9%] w-[33%] bg-[#0f262e]" />
              {/* Middle Right Pillar */}
              <div className="h-[56.7%] w-[34%] bg-[#13323c]" />
              {/* Outer Right Pillar */}
              <div className="h-[86.4%] w-[33%] bg-[#173e4a]" />
            </div>
          </div>

          {/* Center Banner Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4">
            {/* Breadcrumb Navigation */}
            <div className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12.5px] text-[#8fa2a8] mb-2 sm:mb-2.5 font-normal tracking-wide">
              <Link
                href="/"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <FiHome className="w-3.5 h-3.5 text-[#8fa2a8] stroke-[1.8]" />
              </Link>
              <span className="text-[#59717a]">/</span>
              <span>Find Projects</span>
            </div>

            {/* Oblique Italic Display Title */}
            <h1 className="italic text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] leading-tight text-[#74d5de] font-serif font-normal tracking-tight drop-shadow-sm">
              Projects
            </h1>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CATEGORY BAR / PILLS / EXPLORE ALL LINK                     */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between gap-4 my-6 sm:my-7 pb-2 overflow-x-auto no-scrollbar border-b border-transparent">
          {/* Left Group: Filter Button + Category Pills */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 text-gray-800 font-medium text-[13px] sm:text-[13.5px] hover:text-black transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0 mr-1"
            >
              <FiSliders className="w-4 h-4 text-gray-700" />
              <span>Filter</span>
            </button>

            {/* Category Pills */}
            {PILL_FILTERS.map((pill) => {
              const isActive = activePill === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handlePillClick(pill.id)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12.5px] sm:text-[13.5px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-gray-900 text-white border border-gray-900 shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200/90 hover:border-gray-900 hover:text-black"
                  }`}
                >
                  {pill.title}
                </button>
              );
            })}
          </div>

          {/* Right Action: Explore All Projects */}
          <button
            type="button"
            onClick={() => {
              if (viewMode === "hub") {
                setViewMode("feed");
                setActivePill("all");
                setSearch("");
              } else {
                setViewMode("hub");
                setSearch("");
                setActivePill("all");
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="shrink-0 text-[#327C73] hover:text-[#256059] font-medium text-[13px] sm:text-[14px] flex items-center gap-1.5 transition-colors cursor-pointer pl-4"
          >
            <span>{viewMode === "hub" ? "Explore All Projects" : "Browse Category Directory"}</span>
            <FiArrowRight className="w-4 h-4 text-[#327C73]" />
          </button>
        </div>

        {/* Collapsible Search/Filter Drawer for Feed Mode */}
        {isFilterOpen && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 mb-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="text"
                  placeholder="Search projects by skills, role, or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setViewMode("feed")}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#327C73]"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewMode("feed")}
                className="bg-[#327C73] hover:bg-[#256059] text-white font-medium text-sm px-6 py-2 rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Search Projects
              </button>
              {(search || activePill !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActivePill("all");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 underline px-2 py-2"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 1: CATEGORY DIRECTORY HUB (Matching Screenshot)         */}
        {/* ============================================================ */}
        {viewMode === "hub" ? (
          <div className="space-y-12 sm:space-y-14 animate-fadeIn">
            {displayedCategories.map((category) => (
              <section
                key={category.id}
                id={`section-${category.id}`}
                className="scroll-mt-24"
              >
                {/* Section Header */}
                <div className="mb-5 sm:mb-6">
                  <h2 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
                    {category.title}
                  </h2>
                  <p className="text-gray-500 text-[13px] sm:text-[14px] mt-1">
                    {category.subtitle}
                  </p>
                </div>

                {/* 4-Column Grid of 12 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSubcategoryClick(item.title, category.id)}
                      className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-5 sm:p-5.5 transition-all duration-200 hover:border-gray-300 hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-[15px] sm:text-[15.5px] font-bold text-gray-900 tracking-tight leading-snug group-hover:text-[#327C73] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[12.5px] sm:text-[13px] text-gray-500 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* VIEW 2: ACTIVE PROJECTS FEED (Live Backend Bids & Projects) */
          <div className="animate-fadeIn py-2">
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("hub");
                    setSearch("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#327C73] hover:underline mb-2"
                >
                  <FiArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Categories</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {search ? `Projects matching "${search}"` : "All Open Job Projects"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing {filteredBriefs.length} verified client briefs available for proposal submission
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {user && !user.isSeller && (
                  <Link
                    href="/briefs/create"
                    className="px-4 py-2 rounded-xl bg-[#327C73] hover:bg-[#256059] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    + Post New Project
                  </Link>
                )}
              </div>
            </div>

            {/* Content State */}
            {isLoading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <Loader size={40} />
              </div>
            ) : filteredBriefs.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 p-8">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#327C73] flex items-center justify-center mb-4">
                  <FiBriefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No projects currently found
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  {search
                    ? `No open briefs matching "${search}". Try searching for another discipline or clear your filters.`
                    : "No open briefs available in this category yet. Check back shortly!"}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSearch("");
                      setActivePill("all");
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition shadow-xs"
                  >
                    Clear Filter
                  </button>
                  <button
                    onClick={() => setViewMode("hub")}
                    className="px-4 py-2 bg-[#327C73] text-white text-xs font-semibold rounded-xl hover:bg-[#256059] transition shadow-xs"
                  >
                    Browse Categories Directory
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBriefs.map((brief) => {
                  const client = (brief.userID || brief.userId) as any;
                  const clientAvatar = client?.image || client?.img || "/media/noavatar.png";
                  const clientUsername = client?.username || client?.name || "Client";

                  return (
                    <div
                      key={brief._id}
                      onClick={() => router.push(`/briefs/${brief._id}`)}
                      className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-xs cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top: Category Tag & Post Date */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#327C73] tracking-wide">
                            {brief.category || "General"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {moment(brief.createdAt).fromNow()}
                          </span>
                        </div>

                        {/* Brief Title */}
                        <h3 className="text-base sm:text-[17px] font-bold text-gray-900 group-hover:text-[#327C73] transition-colors leading-snug line-clamp-2 mb-2">
                          {brief.title}
                        </h3>

                        {/* Brief Description */}
                        <p className="text-xs sm:text-[13px] text-gray-500 line-clamp-3 leading-relaxed mb-4">
                          {brief.description}
                        </p>
                      </div>

                      <div>
                        {/* Meta: Budget & Proposals */}
                        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4 text-xs">
                          {brief.budget ? (
                            <div>
                              <span className="text-gray-400 block text-[11px]">Budget</span>
                              <span className="font-bold text-gray-900 text-sm">
                                ${brief.budget}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-gray-400 block text-[11px]">Budget</span>
                              <span className="font-medium text-gray-600">Open Offer</span>
                            </div>
                          )}

                          {brief.deadline && (
                            <div>
                              <span className="text-gray-400 block text-[11px]">Deadline</span>
                              <span className="font-semibold text-gray-800">
                                {moment(brief.deadline).format("MMM D")}
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="text-gray-400 block text-[11px]">Proposals</span>
                            <span className="font-semibold text-gray-800">
                              {brief.proposalCount ?? brief.proposalsCount ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Footer: Client Info & Action */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={clientAvatar}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-gray-100 shrink-0"
                            />
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[110px]">
                              @{clientUsername}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/briefs/${brief._id}`);
                            }}
                            className="text-xs font-semibold text-white bg-[#327C73] hover:bg-[#256059] px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                          >
                            View Project
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BriefsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader size={45} />
        </div>
      }
    >
      <BriefsContent />
    </React.Suspense>
  );
}
