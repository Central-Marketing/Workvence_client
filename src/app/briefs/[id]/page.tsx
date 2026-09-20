"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import toast from "react-hot-toast";
import {
  FiHome,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiFileText,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiX,
  FiSend,
  FiStar,
  FiHeart,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, SubmitProposalModal } from "@/components";

function formatCategoryName(cat?: string): string {
  if (!cat) return "";
  const cleaned = cat.trim();
  if (cleaned.includes("&") || (cleaned.includes(" ") && !cleaned.includes("-"))) {
    return cleaned;
  }
  return cleaned
    .split("-")
    .map((w) => {
      const lower = w.toLowerCase();
      if (lower === "and") return "&";
      if (lower === "ai") return "AI";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

const normalizeProposal = (p: any, idx: number, fullSellerData?: any) => {
  const rawSeller = p?.seller || (typeof p?.sellerID === "object" ? p?.sellerID : null) || {};
  const resolvedFull = fullSellerData?.user || fullSellerData?.seller || fullSellerData?.data || fullSellerData || {};
  const seller = { ...rawSeller, ...resolvedFull };
  const id = p?._id || p?.id || `prop-${idx}`;
  const sellerId =
    seller?._id ||
    seller?.id ||
    (typeof p?.sellerID === "string" ? p.sellerID : p?.sellerID?._id || p?.sellerID?.id) ||
    p?.sellerId ||
    "";
  const name = seller?.username || seller?.name || "Freelancer";
  const avatar = seller?.image || seller?.avatar || "";
  const country = seller?.country || "";
  const badge = seller?.sellerLevel || (seller?.isTopRated ? "Top Rated" : "");
  const tagline = seller?.headline || seller?.tagline || seller?.title || "";
  const rating =
    typeof seller?.starRating === "number"
      ? seller.starRating
      : typeof seller?.rating === "number"
        ? seller.rating
        : typeof seller?.metrics?.overall?.starRating === "number"
          ? seller.metrics.overall.starRating
          : null;
  const reviewCount =
    typeof seller?.totalReviews === "number"
      ? seller.totalReviews
      : typeof seller?.reviewCount === "number"
        ? seller.reviewCount
        : typeof seller?.metrics?.overall?.totalReviews === "number"
          ? seller.metrics.overall.totalReviews
          : null;
  const completedProjects =
    typeof seller?.metrics?.overall?.completedOrdersCount === "number"
      ? seller.metrics.overall.completedOrdersCount
      : typeof seller?.completedOrdersCount === "number"
        ? seller.completedOrdersCount
        : typeof seller?.completedProjects === "number"
          ? seller.completedProjects
          : typeof seller?.ordersCount === "number"
            ? seller.ordersCount
            : null;
  const successRate =
    typeof seller?.metrics?.overall?.jobSuccessRate === "number"
      ? `${seller.metrics.overall.jobSuccessRate}%`
      : typeof seller?.jobSuccessRate === "number"
        ? `${seller.jobSuccessRate}%`
        : seller?.successRate
          ? String(seller.successRate).includes("%")
            ? String(seller.successRate)
            : `${seller.successRate}%`
          : "";
  const memberSince = seller?.createdAt ? moment(seller.createdAt).format("YYYY") : "";
  const price = typeof p?.price === "number" ? p.price : Number(p?.price) || 0;
  const deliveryTime = p?.deliveryTime || 0;
  const coverLetter = p?.coverLetter || p?.description || p?.message || "";
  const attachments = Array.isArray(p?.attachments) ? p.attachments.filter(Boolean) : [];
  const createdAt = p?.createdAt || "";
  const skills = Array.isArray(seller?.skills) && seller.skills.length > 0
    ? seller.skills
    : Array.isArray(p?.skills) && p.skills.length > 0
      ? p.skills
      : [];

  return {
    id,
    proposal: p,
    sellerId,
    name,
    avatar,
    country,
    badge,
    tagline,
    rating,
    reviewCount,
    completedProjects,
    successRate,
    memberSince,
    price,
    deliveryTime,
    coverLetter,
    attachments,
    createdAt,
    skills,
  };
};

const BriefDetail = () => {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id as string;
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  // Modals state
  const [proposalSent, setProposalSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMyProposalModal, setShowMyProposalModal] = useState(false);
  const [submittedProposalData, setSubmittedProposalData] = useState<any>(null);

  // Proposals modal states
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [modalView, setModalView] = useState<"list" | "detail" | "ai">("list");
  const [previousModalView, setPreviousModalView] = useState<"list" | "ai">("list");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<any>(null);
  const [messagingSellerId, setMessagingSellerId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const aiRecommendationsList = useMemo(() => {
    if (!aiResult) return [];
    return (
      (Array.isArray(aiResult.top3Recommendations) && aiResult.top3Recommendations) ||
      (Array.isArray(aiResult.recommendation?.top3) && aiResult.recommendation.top3) ||
      (Array.isArray(aiResult.topProposals) && aiResult.topProposals) ||
      (Array.isArray(aiResult.rankedProposals) && aiResult.rankedProposals) ||
      (Array.isArray(aiResult.recommendations) && aiResult.recommendations) ||
      (Array.isArray(aiResult) && aiResult) ||
      []
    );
  }, [aiResult]);

  // Fetch full seller profile on demand for genuine database details
  const { data: selectedSellerProfile } = useQuery({
    queryKey: ["seller-full-profile", selectedProposal?.sellerId],
    queryFn: () =>
      axiosFetch
        .get(`/users/${selectedProposal?.sellerId}`)
        .then(({ data }) => data?.user || data?.seller || data?.data || data)
        .catch(() => null),
    enabled: !!selectedProposal?.sellerId && modalView === "detail",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== "undefined" && localStorage.getItem(`proposed_${briefId}`)) {
      setProposalSent(true);
    }
  }, [briefId]);

  // Lock scroll when proposals modal is open
  useEffect(() => {
    if (showProposalsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showProposalsModal]);

  // Fetch real brief details from backend API
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

  // Fetch real proposals for this brief if not included in brief payload
  const { data: fetchedProposals = [] } = useQuery<any[]>({
    queryKey: ["brief-proposals", briefId],
    queryFn: () =>
      axiosFetch
        .get(`/briefs/${briefId}/proposals`)
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.proposals)) return data.proposals;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
    enabled: !!briefId && (!brief?.proposals || brief.proposals.length === 0),
  });

  const rawProposals: any[] = useMemo(() => {
    if (Array.isArray(brief?.proposals) && brief.proposals.length > 0) {
      return brief.proposals;
    }
    if (Array.isArray(fetchedProposals) && fetchedProposals.length > 0) {
      return fetchedProposals;
    }
    return [];
  }, [brief?.proposals, fetchedProposals]);

  const isClosed = Boolean(brief?.isClosed || brief?.status === "closed");
  const isOwner = Boolean(
    brief &&
    user &&
    (brief.userID?._id === user._id ||
      brief.userID === user._id ||
      brief.userID === user.id ||
      brief.user?.id === user._id ||
      brief.user?.id === user.id)
  );
  const isSeller = Boolean(user?.isSeller);

  // Extract unique seller IDs from proposals to fetch their full live profiles
  const uniqueSellerIds: string[] = useMemo(() => {
    const ids = new Set<string>();
    rawProposals.forEach((p: any) => {
      const s = p?.seller || (typeof p?.sellerID === "object" ? p?.sellerID : null);
      const sid = s?._id || s?.id || (typeof p?.sellerID === "string" ? p.sellerID : p?.sellerId);
      if (sid) ids.add(sid);
    });
    return Array.from(ids);
  }, [rawProposals]);

  const sellerProfilesQueries = useQueries({
    queries: uniqueSellerIds.map((sid) => ({
      queryKey: ["seller-full-profile", sid],
      queryFn: () =>
        axiosFetch
          .get(`/users/${sid}`)
          .then(({ data }) => data?.user || data?.seller || data?.data || data)
          .catch(() => null),
      enabled: Boolean(sid && (showProposalsModal || isOwner)),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const sellerProfilesMap: Record<string, any> = useMemo(() => {
    const map: Record<string, any> = {};
    uniqueSellerIds.forEach((sid, idx) => {
      const query = sellerProfilesQueries[idx];
      if (query?.data) {
        map[sid] = query.data;
      }
    });
    return map;
  }, [uniqueSellerIds, sellerProfilesQueries]);

  const normalizedProposals = useMemo(() => {
    return rawProposals.map((p, idx) => {
      const s = p?.seller || (typeof p?.sellerID === "object" ? p?.sellerID : null);
      const sid = s?._id || s?.id || (typeof p?.sellerID === "string" ? p.sellerID : p?.sellerId);
      const fullProfile = sid ? sellerProfilesMap[sid] : null;
      return normalizeProposal(p, idx, fullProfile);
    });
  }, [rawProposals, sellerProfilesMap]);

  const detailedProposal = useMemo(() => {
    if (!selectedProposal) return null;
    const fullProfile =
      (selectedProposal.sellerId ? sellerProfilesMap[selectedProposal.sellerId] : null) ||
      selectedSellerProfile;
    return normalizeProposal(selectedProposal.proposal, 0, fullProfile);
  }, [selectedProposal, sellerProfilesMap, selectedSellerProfile]);

  const displayedProposals = useMemo(() => {
    if (modalView !== "ai" || aiRecommendedIds.length === 0) {
      return normalizedProposals;
    }
    return [...normalizedProposals].sort((a: any, b: any) => {
      const idxA = aiRecommendedIds.indexOf(a.id);
      const idxB = aiRecommendedIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [modalView, normalizedProposals, aiRecommendedIds]);

  const totalProposalsCount =
    normalizedProposals.length ||
    brief?.proposalCount ||
    brief?._count?.proposals ||
    brief?.proposalsCount ||
    0;

  // Check if seller already submitted a proposal
  const { data: myProposals = [] } = useQuery({
    queryKey: ["my-proposals-for-brief", briefId],
    queryFn: () =>
      axiosFetch
        .get(`/briefs/my-proposals`)
        .then(({ data }) => {
          let props = [];
          if (Array.isArray(data)) props = data;
          else if (Array.isArray(data?.proposals)) props = data.proposals;
          else if (Array.isArray(data?.data)) props = data.data;

          return props.filter(
            (p: any) =>
              p.briefID === briefId ||
              p.briefID?._id === briefId ||
              p.briefID?.id === briefId ||
              p.briefID === brief?._id ||
              p.briefID === brief?.id
          );
        })
        .catch(() => []),
    enabled: Boolean(briefId && user && isSeller && !isOwner),
  });

  const sellerUserId = user?._id || user?.id;
  const proposalFromBrief = useMemo(() => {
    if (!sellerUserId || !rawProposals.length) return null;
    return rawProposals.find((p: any) => {
      const s = p.seller || (typeof p.sellerID === "object" ? p.sellerID : null);
      const sid = s?._id || s?.id || p.sellerID || p.sellerId;
      return sid === sellerUserId;
    });
  }, [sellerUserId, rawProposals]);

  const myProposal = myProposals[0] || proposalFromBrief;
  const hasAlreadyProposed = !!myProposal;
  const activeProposal = submittedProposalData || myProposal;
  const showSubmittedUI = proposalSent || hasAlreadyProposed;

  // Unified proposal action handler for guest user vs logged-in seller vs owner
  const handleProposalAction = () => {
    // 1. Guest user: redirect to login/register
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/briefs/${briefId}`)}`);
      return;
    }

    // 2. Project owner: view proposals
    if (isOwner) {
      setModalView("list");
      setShowProposalsModal(true);
      return;
    }

    // 3. Logged-in Seller: send or view proposal
    if (isSeller) {
      if (isClosed) {
        toast.error("This project is closed and no longer accepting proposals");
        return;
      }
      if (showSubmittedUI) {
        setShowMyProposalModal(true);
      } else {
        setShowModal(true);
      }
      return;
    }

    // 4. Logged-in non-seller (buyer): prompt to become a seller
    toast.error("Only registered sellers can send proposals. Please register as a seller to apply.");
    router.push("/register?seller=true");
  };

  // Close brief mutation (buyer)
  const closeMutation = useMutation({
    mutationFn: () =>
      axiosFetch.patch(`/briefs/${briefId}/close`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief", briefId] });
      toast.success("Project closed successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to close project");
    },
  });

  const handleProposalSuccess = (data?: any, isAlreadySubmitted?: boolean) => {
    setProposalSent(true);
    setSubmittedProposalData(data);
    if (typeof window !== "undefined") {
      localStorage.setItem(`proposed_${briefId}`, "true");
    }
    queryClient.invalidateQueries({ queryKey: ["brief", briefId] });
    queryClient.invalidateQueries({ queryKey: ["brief-proposals", briefId] });
    queryClient.invalidateQueries({ queryKey: ["my-proposals-for-brief", briefId] });
  };

  const skills: string[] = useMemo(() => {
    if (Array.isArray(brief?.requiredSkills) && brief.requiredSkills.length > 0) {
      return brief.requiredSkills;
    }
    if (Array.isArray(brief?.skills) && brief.skills.length > 0) {
      return brief.skills;
    }
    return [];
  }, [brief]);

  const attachments: string[] = useMemo(() => {
    if (Array.isArray(brief?.attachments) && brief.attachments.length > 0) {
      return brief.attachments;
    }
    return [];
  }, [brief]);

  // Message seller handler
  const handleMessageSeller = async (sellerId: string, sellerName: string) => {
    if (messagingSellerId) return;
    const buyerId = user?._id || user?.id;
    if (!buyerId) {
      toast.error("Please login to message this seller");
      return;
    }
    if (!sellerId) {
      toast.error("Seller information missing");
      return;
    }

    setMessagingSellerId(sellerId);
    try {
      try {
        const res = await axiosFetch.get(`/conversations/single/${sellerId}/${buyerId}`);
        const targetId =
          res.data?.uuid ||
          res.data?.conversationID ||
          res.data?._id ||
          res.data?.id ||
          res.data?.data?.uuid;
        if (targetId) {
          router.push(`/message/${targetId}`);
          return;
        }
      } catch {
        // Proceed to create
      }

      const newConv = await axiosFetch.post("/conversations", {
        to: sellerId,
        from: buyerId,
        sellerID: sellerId,
        buyerID: buyerId,
        seller_username: sellerName,
        buyer_username: user?.username || "Buyer",
      });
      const convId =
        newConv.data?.uuid ||
        newConv.data?.conversationID ||
        newConv.data?._id ||
        newConv.data?.data?.uuid;
      if (convId) {
        router.push(`/message/${convId}`);
      } else {
        router.push("/messages");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate conversation");
    } finally {
      setMessagingSellerId(null);
    }
  };

  // AI Recommendation handler
  const handleGetAiRecommendation = async () => {
    setAiLoading(true);
    try {
      const res = await axiosFetch.get(`/briefs/${briefId}/ai-recommendation`);
      const data = res.data;
      setAiResult(data);
      const recList =
        (Array.isArray(data?.top3Recommendations) && data.top3Recommendations) ||
        (Array.isArray(data?.recommendation?.top3) && data.recommendation.top3) ||
        (Array.isArray(data?.rankedProposals) && data.rankedProposals) ||
        (Array.isArray(data?.topProposals) && data.topProposals) ||
        (Array.isArray(data?.recommendations) && data.recommendations) ||
        (Array.isArray(data) && data) ||
        [];
      if (recList.length > 0) {
        setAiRecommendedIds(
          recList
            .map((r: any) => r.proposalID || r.proposal?.id || r.proposal?._id || r._id || r.id)
            .filter(Boolean)
        );
      }
      setModalView("ai");
      toast.success("AI recommendations ready!");
    } catch (err: any) {
      setModalView("ai");
      toast.error(err?.response?.data?.message || "Failed to get AI recommendations");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center bg-[#F8FAFC] py-16 min-h-[80vh]">
        <div className="container mx-auto px-4 md:px-6 flex justify-center items-center py-20">
          <Loader size={45} />
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="flex justify-center bg-[#F8FAFC] py-16 min-h-[80vh]">
        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center py-20">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Project not found</h3>
          <p className="text-slate-500 mb-6">This project may have been removed or the link is invalid.</p>
          <Link
            href="/briefs"
            className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold"
          >
            ← Browse All Projects
          </Link>
        </div>
      </div>
    );
  }

  // Spec values from real backend data with Fiverr-style fallbacks
  const locationValue = brief.user?.country || brief.location || brief.workType || "Worldwide";
  const budgetValue =
    brief.budget !== undefined && brief.budget !== null
      ? typeof brief.budget === "number"
        ? `$${brief.budget.toLocaleString()}`
        : String(brief.budget).startsWith("$")
          ? brief.budget
          : `$${brief.budget}`
      : "Flexible";

  const durationValue = brief.deliveryTime
    ? `${brief.deliveryTime} Days`
    : brief.duration || "Flexible";
  const experienceValue = brief.experienceLevel || "Intermediate";
  const projectTypeValue = isClosed
    ? "Closed"
    : brief.projectType || (brief.budget ? "Fixed Project" : "Ongoing");
  const rateBadge = budgetValue;
  const categoryFormatted = formatCategoryName(brief.category);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pb-20 pt-6 sm:pt-8 font-sans">
      <div className="container mx-auto">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-5 select-none">
          <Link
            href="/"
            className="text-[#327C73] hover:text-[#256059] transition-colors flex items-center gap-1"
          >
            <FiHome className="text-sm text-[#327C73]" />
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/briefs"
            className="hover:text-slate-800 transition-colors"
          >
            Briefs
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 truncate max-w-[200px] sm:max-w-none font-normal">
            {categoryFormatted}
          </span>
        </div>

        {/* Main Title & Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 tracking-tight font-sf-pro leading-tight">
              {brief.title}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
              Explore briefs from clients looking for the right talent, skills, and expertise to bring their ideas to life.
            </p>
          </div>

          {/* Right Badges & Heart Icon */}
          <div className="flex items-center gap-2.5 shrink-0 self-start">
            {/* Purple Rate / Budget Badge */}
            <span className="bg-[#ECEBFE] text-[#6B5AED] text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap tracking-tight">
              {rateBadge}
            </span>

            {/* Category Pill */}
            {categoryFormatted && (
              <span className="bg-white border border-slate-200 text-slate-800 text-xs font-medium px-4 py-1.5 rounded-full whitespace-nowrap shadow-2xs tracking-tight">
                {categoryFormatted}
              </span>
            )}

            {/* Closed Status Pill */}
            {isClosed && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap tracking-tight">
                Closed
              </span>
            )}

            {/* Favorite Button */}
            {/* <button
              type="button"
              onClick={() => setIsFavorited(!isFavorited)}
              className="w-9 h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Save project"
            >
              <FiHeart className={`w-4 h-4 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </button> */}
          </div>
        </div>

        {/* Thin Divider Line */}
        <hr className="border-slate-200/70 my-6" />

        {/* Posted Time */}
        <p className="text-xs text-slate-400 font-normal mb-6">
          Posted {moment(brief.createdAt).fromNow()}
        </p>

        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-base sm:text-[17px] font-bold text-slate-900 mb-2.5">
            Overview
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap max-w-5xl">
            {brief.description}
          </div>
        </div>

        {/* 5-Column Specification Metric Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 my-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Spec 1: Location */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3 first:pl-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <FiMapPin className="text-rose-500 text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">
                Location
              </span>
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {locationValue}
              </p>
            </div>
          </div>

          {/* Spec 2: Hourly/Budget */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <FiClock className="text-amber-500 text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                Budget
              </span>
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {budgetValue}
              </p>
            </div>
          </div>

          {/* Spec 3: Duration */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <FiCalendar className="text-emerald-500 text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">
                Duration
              </span>
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {durationValue}
              </p>
            </div>
          </div>

          {/* Spec 4: Experience Level */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <FiBarChart2 className="text-purple-500 text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">
                Experience level
              </span>
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {experienceValue}
              </p>
            </div>
          </div>

          {/* Spec 5: Project Type / Status */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div
              className={`w-10 h-10 rounded-xl ${isClosed
                ? "bg-rose-50 border border-rose-100"
                : "bg-amber-50 border border-amber-100"
                } flex items-center justify-center shrink-0`}
            >
              <FiFileText
                className={`${isClosed ? "text-rose-500" : "text-amber-500"} text-base`}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">
                Project type
              </span>
              <p
                className={`font-bold text-sm sm:text-[15px] ${isClosed ? "text-rose-600" : "text-slate-900"
                  } truncate`}
              >
                {projectTypeValue}
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Skills Section */}
        <div className="mb-6">
          <h2 className="text-base sm:text-[17px] font-bold text-slate-900 mb-3">
            Mandatory Skills
          </h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {skills.slice(0, 5).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="bg-[#F1F3F5] text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/60">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No specific mandatory skills listed for this project.
            </p>
          )}
        </div>

        {/* Nice to Skills Section */}
        {attachments.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 mb-3">
              Attachments ({attachments.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {attachments.map((att: string, idx: number) => (
                <a
                  key={idx}
                  href={att}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-600 text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors shadow-2xs"
                >
                  <FiFileText className="text-teal-600 text-sm" />
                  <span className="truncate max-w-[220px]">Attachment #{idx + 1}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {/* Proposal Activity / Proposal Sender Section */}
        <div className="mb-10">
          {isOwner ? (
            /* PROJECT OWNER VIEW (Exact Match to Screenshot) */
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-slate-900 mb-3">
                Proposal Sender ({totalProposalsCount})
              </h2>

              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => {
                  setModalView("list");
                  setShowProposalsModal(true);
                }}
              >
                {/* Real Seller Avatars Stack */}
                <div className="flex items-center -space-x-2">
                  {normalizedProposals.slice(0, 3).map((item, aIdx) =>
                    item.avatar ? (
                      <img
                        key={aIdx}
                        src={item.avatar}
                        alt={item.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        key={aIdx}
                        className="w-8 h-8 rounded-full bg-teal-50 border-2 border-white text-[11px] font-bold text-teal-800 flex items-center justify-center shadow-2xs uppercase group-hover:scale-105 transition-transform"
                      >
                        {item.name.slice(0, 2)}
                      </div>
                    )
                  )}
                  {totalProposalsCount > 3 ? (
                    <div className="w-8 h-8 rounded-full bg-[#E6F4F2] border-2 border-white text-[11px] font-bold text-slate-700 flex items-center justify-center shadow-2xs">
                      {totalProposalsCount - 3}+
                    </div>
                  ) : totalProposalsCount === 0 ? (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white text-[11px] font-bold text-slate-400 flex items-center justify-center shadow-2xs">
                      0
                    </div>
                  ) : null}
                </div>

                {/* Underlined Clickable Proposals Link */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalView("list");
                    setShowProposalsModal(true);
                  }}
                  className="text-xs sm:text-[13px] font-medium text-slate-900 underline group-hover:text-[#327C73] transition-colors cursor-pointer text-left"
                >
                  View {totalProposalsCount} {totalProposalsCount === 1 ? "proposal" : "proposals"}
                </button>
              </div>
            </div>
          ) : (
            /* FREELANCER / GUEST VIEW */
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-slate-900 mb-3">
                Proposal Activity
              </h2>

              <div className="flex items-center gap-3">
                {/* Real Seller Avatars Stack */}
                <div className="flex items-center -space-x-2">
                  {normalizedProposals.slice(0, 3).map((item, aIdx) =>
                    item.avatar ? (
                      <img
                        key={aIdx}
                        src={item.avatar}
                        alt={item.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        key={aIdx}
                        className="w-8 h-8 rounded-full bg-teal-50 border-2 border-white text-[11px] font-bold text-teal-800 flex items-center justify-center shadow-2xs uppercase"
                      >
                        {item.name.slice(0, 2)}
                      </div>
                    )
                  )}
                  {totalProposalsCount > 3 ? (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white text-[11px] font-bold text-slate-700 flex items-center justify-center shadow-2xs">
                      {totalProposalsCount}+
                    </div>
                  ) : totalProposalsCount === 0 ? (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white text-[11px] font-bold text-slate-400 flex items-center justify-center shadow-2xs">
                      0
                    </div>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight">
                    {totalProposalsCount} {totalProposalsCount === 1 ? "proposal" : "proposals"}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {totalProposalsCount > 0
                      ? "Review candidate proposals"
                      : "Be the first to submit a proposal"}
                  </p>
                </div>
              </div>

              {/* Action Button: Guest ("Join Now") vs Logged-in Seller ("Send Proposal" / "Proposal Submitted") */}
              <div className="mt-4">
                {!user ? (
                  <button
                    type="button"
                    onClick={handleProposalAction}
                    className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Join Now</span>
                    <FiArrowRight className="text-xs" />
                  </button>
                ) : isSeller ? (
                  showSubmittedUI ? (
                    <button
                      type="button"
                      onClick={handleProposalAction}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <FiCheck className="text-xs" />
                      <span>Proposal Submitted</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleProposalAction}
                      disabled={isClosed}
                      className={`text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors ${isClosed
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-black hover:bg-slate-800 text-white cursor-pointer"
                        }`}
                    >
                      <span>{isClosed ? "Project Closed" : "Send Proposal"}</span>
                      {!isClosed && <FiArrowRight className="text-xs" />}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleProposalAction}
                    className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Join as Seller</span>
                    <FiArrowRight className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner: "Find the Right Project" - Only visible to Freelancers / Guest Users (NOT Project Owner) */}
        {!isOwner && (
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mt-12 mb-6 bg-[#042823] min-h-[300px] sm:min-h-[360px] md:min-h-[420px] flex items-center shadow-lg">
            {/* Background 3D Layered Cards Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/media/find_project_banner1.jpg"
                alt="Find the Right Project"
                fill
                className="object-cover object-right md:object-center"
                priority
              />
              {/* Deep Green Gradient Overlay for readability on left */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#042823] via-[#042823]/85 to-transparent w-full md:w-3/5" />
            </div>

            {/* Banner Left Content */}
            <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-lg">
              <h2 className="text-2xl sm:text-3xl md:text-[38px] font-bold text-white tracking-tight leading-tight font-sf-pro mb-3">
                Find the Right Project
              </h2>
              <p className="text-emerald-100/75 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                Explore real project opportunities from clients looking for the right skills and expertise.
              </p>
              <button
                type="button"
                onClick={handleProposalAction}
                disabled={isClosed}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 ${isClosed
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-white hover:bg-emerald-50 text-slate-900 cursor-pointer"
                  }`}
              >
                <span>
                  {isClosed
                    ? "Project Closed"
                    : !user
                      ? "Send Proposal"
                      : isSeller && showSubmittedUI
                        ? "View My Proposal"
                        : isSeller
                          ? "Send Proposal"
                          : "Join as Seller"}
                </span>
                {!isClosed && (
                  isSeller && showSubmittedUI ? (
                    <FiCheck className="text-emerald-700 text-xs" />
                  ) : (
                    <FiArrowRight className="text-xs" />
                  )
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROPOSALS MODAL (List, Details, AI Recommendations) */}
      {showProposalsModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
          onClick={() => setShowProposalsModal(false)}
        >
          <div
            className={`bg-white rounded-2xl w-full ${modalView === "ai" ? "max-w-2xl" : "max-w-xl"
              } max-h-[90vh] flex flex-col overflow-hidden relative transition-all ${modalView === "ai"
                ? "border-2 border-[#0D6D5F]/30 ring-4 ring-[#0D6D5F]/10 shadow-2xl"
                : "border border-slate-100 shadow-2xl"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                {modalView !== "list" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (modalView === "detail") {
                        setModalView(previousModalView);
                      } else {
                        setModalView("list");
                      }
                    }}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer mr-1"
                    title={modalView === "detail" ? "Back" : "Back to proposals"}
                  >
                    <FiArrowLeft className="text-base" />
                  </button>
                )}
                <h2 className={`${modalView === "ai" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} font-bold text-slate-900 font-sf-pro`}>
                  {modalView === "list" && `Proposals (${totalProposalsCount})`}
                  {modalView === "detail" && "Proposal Details"}
                  {modalView === "ai" && (
                    <span className="inline-flex items-center gap-2 text-xl sm:text-2xl font-bold leading-normal">
                      <span className="text-slate-900">Recommended by</span>
                      <span className="bg-gradient-to-r from-[#8A38F5]/80 to-[#82C2FD] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] font-sf-pro font-extrabold text-xl sm:text-2xl">
                        AI
                      </span>
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {modalView === "list" && normalizedProposals.length > 0 && (
                  <button
                    type="button"
                    onClick={handleGetAiRecommendation}
                    disabled={aiLoading}
                    className="bg-[#D8F5ED] hover:bg-[#C3F0E4] text-[#0D6B5D] border border-[#BCE8DE] text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <HiSparkles className="text-[#0D6B5D] text-sm" />
                    <span>{aiLoading ? "Analyzing..." : "Get AI Recommendation"}</span>
                  </button>
                )}

                {/* Red Close Button */}
                <button
                  type="button"
                  onClick={() => setShowProposalsModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer text-2xl font-light leading-none"
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* MODAL CONTENT: VIEW 1 (List Proposals) */}
            {modalView === "list" && (
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                {displayedProposals.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-xl mx-auto mb-3">
                      📁
                    </div>
                    <h3 className="font-bold text-base text-slate-800">No proposals yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Freelancers will submit their proposals soon. Check back or share your project link.
                    </p>
                  </div>
                ) : (
                  displayedProposals.map((item: any) => {
                    return (
                      <div
                        key={item.id}
                        className="bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-2xs border-slate-200/90 hover:border-slate-300"
                      >
                        {/* Sender Profile Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-800 font-bold text-sm flex items-center justify-center border border-teal-200 shrink-0 uppercase">
                                {item.name.slice(0, 2)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                {item.tagline && (
                                  <span className="font-medium text-slate-600 truncate max-w-[180px]">
                                    {item.tagline}
                                  </span>
                                )}
                                {typeof item.rating === "number" && item.rating > 0 && (
                                  <span className="font-bold text-slate-800 flex items-center gap-0.5">
                                    <FiStar className="fill-amber-400 text-amber-400 text-xs" />
                                    {item.rating}
                                  </span>
                                )}
                                {typeof item.reviewCount === "number" && item.reviewCount > 0 && (
                                  <span>({item.reviewCount})</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.completedProjects !== null && (
                                  <span>{item.completedProjects} Projects Completed</span>
                                )}
                                {item.createdAt && (
                                  <span>
                                    {item.completedProjects !== null ? " | " : ""}Submitted {moment(item.createdAt).fromNow()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <span
                              className="font-bold text-[24px] leading-normal font-sf-pro"
                              style={{
                                color: "var(--Foundation-Green-green-500, #1A9997)",
                                fontFamily: '"SF Pro", sans-serif',
                                fontSize: "24px",
                                fontStyle: "normal",
                                fontWeight: 700,
                                lineHeight: "normal",
                              }}
                            >
                              ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Proposal Cover Letter Pitch */}
                        {item.coverLetter && (
                          <p className="text-xs text-slate-600 line-clamp-2 my-3.5 leading-relaxed font-normal">
                            {item.coverLetter}
                          </p>
                        )}

                        {/* Action Buttons: View Proposal & Message */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviousModalView("list");
                              setSelectedProposal(item);
                              setModalView("detail");
                            }}
                            className="flex-1 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                          >
                            View Proposal
                          </button>
                          <button
                            type="button"
                            disabled={messagingSellerId === item.sellerId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessageSeller(item.sellerId, item.name);
                            }}
                            className="flex-1 py-2.5 rounded-[10px] bg-black hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                          >
                            <span>
                              {messagingSellerId === item.sellerId ? "Connecting..." : "Message"}
                            </span>
                            <FiArrowRight className="text-xs" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* MODAL CONTENT: VIEW 3 (AI Recommendations with Pros & Cons in Current Theme) */}
            {modalView === "ai" && (
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                {aiLoading ? (
                  <div className="py-16 px-6 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#0D6D5F]/10 text-[#0D6D5F] flex items-center justify-center text-2xl animate-pulse">
                      <HiSparkles />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Workvence AI is evaluating proposals...</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Analyzing seller credentials, past performance, proposal details, pricing, and project fit.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Analysis Summary Banner */}
                    {(aiResult?.summary || aiResult?.recommendation?.summary) && (
                      <div className="bg-gradient-to-br from-[#0D6D5F]/5 via-[#0D6D5F]/10 to-slate-50/50 border border-[#0D6D5F]/20 rounded-2xl p-4 sm:p-5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#0D6D5F]/15 flex items-center justify-center text-[#0D6D5F]">
                              <HiSparkles className="text-base" />
                            </div>
                            <h3 className="font-bold text-sm text-slate-900">
                              AI Evaluation Summary
                            </h3>
                          </div>
                          {(aiResult?.totalProposalsEvaluated || aiRecommendationsList.length > 0) && (
                            <span className="text-[11px] font-semibold bg-white text-[#0D6D5F] border border-[#0D6D5F]/20 px-2.5 py-0.5 rounded-full shadow-2xs">
                              {aiResult?.totalProposalsEvaluated || aiRecommendationsList.length} Evaluated
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                          {aiResult?.summary || aiResult?.recommendation?.summary}
                        </p>
                      </div>
                    )}

                    {/* AI Recommendations List */}
                    {aiRecommendationsList.length > 0 ? (
                      aiRecommendationsList.map((rec: any, index: number) => {
                        const recProposal = rec.proposal || rec;
                        const recId = rec.proposalID || recProposal?._id || recProposal?.id || rec.id;
                        const matched = normalizedProposals.find(
                          (np: any) => np.id === recId || np.proposal?._id === recId || np.proposal?.id === recId
                        );
                        const displayItem = matched || normalizeProposal(recProposal, index, null);
                        const rank = rec.rank || index + 1;
                        const score = rec.score !== undefined && rec.score !== null ? rec.score : null;
                        const pros: string[] = Array.isArray(rec.pros) ? rec.pros : [];
                        const cons: string[] = Array.isArray(rec.cons) ? rec.cons : [];
                        const summaryRationale = rec.summaryRationale || "";

                        return (
                          <div
                            key={displayItem.id || `ai-rec-${index}`}
                            className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-2xs ${rank === 1
                              ? "border-[#0D6D5F]/40 ring-2 ring-[#0D6D5F]/10 hover:border-[#0D6D5F]/60"
                              : "border-slate-200/90 hover:border-slate-300"
                              }`}
                          >
                            {/* Card Top Bar: Rank, Score & Price */}
                            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2 flex-wrap">
                                {rank === 1 ? (
                                  <span className="inline-flex items-center gap-1.5 bg-[#0D6D5F] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs tracking-wide">
                                    <HiSparkles className="text-xs text-amber-300" />
                                    #1 Top Match
                                  </span>
                                ) : rank === 2 ? (
                                  <span className="inline-flex items-center gap-1 bg-slate-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                                    #2 Recommendation
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                                    #{rank} Recommendation
                                  </span>
                                )}

                                {score !== null && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#0D6D5F] border border-[#0D6D5F]/20 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                                    Score: {score}/100
                                  </span>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-lg sm:text-xl text-[#0D6D5F] font-sf-pro">
                                  ${displayItem.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>

                            {/* Sender Profile Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {displayItem.avatar ? (
                                  <img
                                    src={displayItem.avatar}
                                    alt={displayItem.name}
                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full bg-[#0D6D5F]/10 text-[#0D6D5F] font-bold text-sm flex items-center justify-center border border-[#0D6D5F]/20 shrink-0 uppercase">
                                    {displayItem.name.slice(0, 2)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900 truncate">
                                      {displayItem.name}
                                    </span>
                                    {displayItem.badge && (
                                      <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                                        {displayItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    {displayItem.tagline && (
                                      <span className="font-medium text-slate-600 truncate max-w-[180px]">
                                        {displayItem.tagline}
                                      </span>
                                    )}
                                    {typeof displayItem.rating === "number" && displayItem.rating > 0 && (
                                      <span className="font-bold text-slate-800 flex items-center gap-0.5">
                                        <FiStar className="fill-amber-400 text-amber-400 text-xs" />
                                        {displayItem.rating}
                                      </span>
                                    )}
                                    {typeof displayItem.reviewCount === "number" && displayItem.reviewCount > 0 && (
                                      <span>({displayItem.reviewCount})</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {displayItem.deliveryTime > 0 && (
                                      <span>{displayItem.deliveryTime} Days Delivery · </span>
                                    )}
                                    {displayItem.completedProjects !== null && (
                                      <span>{displayItem.completedProjects} Projects Completed</span>
                                    )}
                                    {displayItem.createdAt && (
                                      <span>
                                        {displayItem.completedProjects !== null ? " · " : ""}Submitted {moment(displayItem.createdAt).fromNow()}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* AI Summary Rationale */}
                            {summaryRationale && (
                              <div className="mb-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                                <span className="font-semibold text-slate-900 block mb-0.5">
                                  AI Match Analysis:
                                </span>
                                {summaryRationale}
                              </div>
                            )}

                            {/* PROS AND CONS SECTION (Current Theme) */}
                            {(pros.length > 0 || cons.length > 0) && (
                              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* PROS */}
                                <div className="bg-[#0D6D5F]/5 border border-[#0D6D5F]/20 rounded-xl p-3 sm:p-3.5 flex flex-col">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-[#0D6D5F]/15 flex items-center justify-center text-[#0D6D5F] shrink-0">
                                      <FiCheck className="text-xs stroke-[2.5]" />
                                    </div>
                                    <span className="font-bold text-xs text-[#0D6D5F] tracking-wide uppercase">
                                      Key Pros
                                    </span>
                                  </div>
                                  {pros.length > 0 ? (
                                    <ul className="space-y-1.5 text-xs text-slate-700">
                                      {pros.map((pro: string, pIdx: number) => (
                                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                                          <span className="text-[#0D6D5F] font-bold text-xs mt-0.5 shrink-0">✓</span>
                                          <span>{pro}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">No specific pros listed.</p>
                                  )}
                                </div>

                                {/* CONS */}
                                <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-3 sm:p-3.5 flex flex-col">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                                      <FiAlertTriangle className="text-xs stroke-[2.5]" />
                                    </div>
                                    <span className="font-bold text-xs text-rose-700 tracking-wide uppercase">
                                      Considerations / Cons
                                    </span>
                                  </div>
                                  {cons.length > 0 ? (
                                    <ul className="space-y-1.5 text-xs text-slate-700">
                                      {cons.map((con: string, cIdx: number) => (
                                        <li key={cIdx} className="flex items-start gap-2 leading-relaxed">
                                          <span className="text-rose-500 font-bold text-xs mt-0.5 shrink-0">✕</span>
                                          <span>{con}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">No significant risks identified.</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Cover Letter Pitch */}
                            {displayItem.coverLetter && (
                              <div className="mt-3 pt-2.5 border-t border-slate-100">
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                                  <span className="font-semibold text-slate-800">Cover Letter: </span>
                                  {displayItem.coverLetter}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2.5 pt-3 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviousModalView("ai");
                                  setSelectedProposal(displayItem);
                                  setModalView("detail");
                                }}
                                className="flex-1 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                              >
                                View Proposal
                              </button>
                              <button
                                type="button"
                                disabled={messagingSellerId === displayItem.sellerId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMessageSeller(displayItem.sellerId, displayItem.name);
                                }}
                                className="flex-1 py-2.5 rounded-[10px] bg-black hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                              >
                                <span>
                                  {messagingSellerId === displayItem.sellerId ? "Connecting..." : "Message"}
                                </span>
                                <FiArrowRight className="text-xs" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 rounded-full bg-[#0D6D5F]/10 text-[#0D6D5F] flex items-center justify-center text-xl mx-auto mb-3">
                          <HiSparkles />
                        </div>
                        <h3 className="font-bold text-base text-slate-800">No recommendations available</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          We could not generate specific recommendations for this project yet.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* MODAL CONTENT: VIEW 2 (Proposal Details with Real Backend Data) */}
            {modalView === "detail" && detailedProposal && (
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {/* Top Sender Profile Card with Member Since */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {detailedProposal.avatar ? (
                      <img
                        src={detailedProposal.avatar}
                        alt={detailedProposal.name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-800 font-bold text-base flex items-center justify-center border border-teal-200 shrink-0 uppercase">
                        {detailedProposal.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 truncate">
                          {detailedProposal.name}
                        </span>
                        {detailedProposal.badge && (
                          <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                            {detailedProposal.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {detailedProposal.tagline && (
                          <span className="font-medium text-slate-600 truncate max-w-[200px]">
                            {detailedProposal.tagline}
                          </span>
                        )}
                        {typeof detailedProposal.rating === "number" && detailedProposal.rating > 0 && (
                          <span className="font-bold text-slate-800 flex items-center gap-0.5">
                            <FiStar className="fill-amber-400 text-amber-400 text-xs" />
                            {detailedProposal.rating}
                          </span>
                        )}
                        {typeof detailedProposal.reviewCount === "number" && detailedProposal.reviewCount > 0 && (
                          <span>({detailedProposal.reviewCount})</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {detailedProposal.completedProjects !== null && (
                          <span>{detailedProposal.completedProjects} Projects Completed</span>
                        )}
                        {detailedProposal.successRate && (
                          <span>
                            {detailedProposal.completedProjects !== null ? " | " : ""}
                            {detailedProposal.successRate} Success Rate
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Member Since Badge */}
                  {detailedProposal.memberSince && (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md shrink-0 whitespace-nowrap">
                      Member since {detailedProposal.memberSince}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5">Description</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                    {detailedProposal.coverLetter || "No description provided."}
                  </p>
                </div>

                {/* Budget & Delivery Time */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Budget</span>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                      ${detailedProposal.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  {detailedProposal.deliveryTime > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">Delivery Time</span>
                      <p className="text-sm font-bold text-slate-800">
                        {detailedProposal.deliveryTime} {detailedProposal.deliveryTime === 1 ? "Day" : "Days"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">Skills</h3>
                  {detailedProposal.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detailedProposal.skills.slice(0, 6).map((sk: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3 py-1 rounded-md border border-slate-200/60"
                        >
                          {sk}
                        </span>
                      ))}
                      {detailedProposal.skills.length > 6 && (
                        <span className="bg-[#F1F3F5] text-slate-700 text-xs font-bold px-2 py-1 rounded-md border border-slate-200/60">
                          +{detailedProposal.skills.length - 6}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No skills specified by candidate.</p>
                  )}
                </div>

                {/* Contact Box */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">Contact</h3>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{detailedProposal.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 shrink-0" />
                        <span>Active on Workvence</span>
                        {detailedProposal.country && (
                          <span className="ml-1">• {detailedProposal.country}</span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={messagingSellerId === detailedProposal.sellerId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageSeller(detailedProposal.sellerId, detailedProposal.name);
                      }}
                      className="w-full py-3 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <span>
                        {messagingSellerId === detailedProposal.sellerId
                          ? "Connecting..."
                          : "Message"}
                      </span>
                      <FiArrowRight className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Work Sample */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">Work Sample</h3>
                  {detailedProposal.attachments && detailedProposal.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detailedProposal.attachments.map((att: string, aIdx: number) => {
                        const filename = att.split("/").pop() || `Sample #${aIdx + 1}`;
                        return (
                          <a
                            key={aIdx}
                            href={att}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <FiFileText className="text-teal-600 text-base shrink-0" />
                            <span className="truncate">{filename}</span>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No attachments provided with this proposal.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seller Proposal Details Modal */}
      {showMyProposalModal && activeProposal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowMyProposalModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Your Proposal</h2>
              <button
                type="button"
                onClick={() => setShowMyProposalModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="flex justify-between border-b border-slate-100 pb-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Price
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600">
                    ${activeProposal.price}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Delivery Time
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {activeProposal.deliveryTime} Days
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cover Letter
                </div>
                <div className="text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {activeProposal.coverLetter}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Submit Proposal Modal */}
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
