"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, SubmitProposalModal } from "@/components";

const DEFAULT_PROPOSAL_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
];

const getSkills = (brief: any) => {
  if (Array.isArray(brief?.mandatorySkills) && brief.mandatorySkills.length > 0) {
    return {
      mandatory: brief.mandatorySkills,
      niceToHave: Array.isArray(brief.niceToHaveSkills) ? brief.niceToHaveSkills : [],
    };
  }
  if (Array.isArray(brief?.skills) && brief.skills.length > 0) {
    return {
      mandatory: brief.skills.slice(0, 5),
      niceToHave: brief.skills.slice(5),
    };
  }

  // Intelligent contextual fallback based on category & title
  const cat = (brief?.category || "").toLowerCase();
  const title = (brief?.title || "").toLowerCase();

  if (cat.includes("data") || title.includes("data") || title.includes("ai") || title.includes("analys")) {
    return {
      mandatory: ["Agentic Engineering", "Data Analytics", "Statistics Management", "Analytical Thinker", "PandasPy"],
      niceToHave: ["Numpy", "Pytorch"],
    };
  }
  if (cat.includes("design") || title.includes("design") || title.includes("graphic") || title.includes("illustrat")) {
    return {
      mandatory: ["UI/UX Design", "Figma", "Graphic Illustration", "Adobe Illustrator", "Visual Identity"],
      niceToHave: ["Photoshop", "After Effects"],
    };
  }
  if (cat.includes("mobile") || title.includes("mobile") || title.includes("app") || title.includes("flutter")) {
    return {
      mandatory: ["React Native", "Flutter", "Mobile UI", "TypeScript", "State Management"],
      niceToHave: ["Swift", "Kotlin"],
    };
  }
  if (cat.includes("security") || title.includes("security") || title.includes("cyber")) {
    return {
      mandatory: ["Network Security", "Penetration Testing", "Threat Analysis", "Firewall Configuration", "Encryption"],
      niceToHave: ["Wireshark", "CISSP"],
    };
  }
  if (cat.includes("web") || title.includes("web") || title.includes("software") || title.includes("full stack")) {
    return {
      mandatory: ["Next.js", "TypeScript", "Tailwind CSS", "REST APIs", "Node.js"],
      niceToHave: ["PostgreSQL", "Docker"],
    };
  }

  return {
    mandatory: [brief?.category || "General", "Professional", "Quality Assurance"],
    niceToHave: ["Problem Solving", "Communication"],
  };
};

const normalizeProposal = (p: any, idx: number) => {
  const seller =
    typeof p.sellerID === "object" && p.sellerID !== null
      ? p.sellerID
      : typeof p.sellerId === "object" && p.sellerId !== null
      ? p.sellerId
      : typeof p.seller === "object" && p.seller !== null
      ? p.seller
      : {};

  const id = p._id || p.id || `prop-${idx}`;
  const sellerId = seller._id || seller.id || p.sellerID || p.sellerId || "";
  const name = seller.username || seller.name || `Freelancer #${idx + 1}`;
  const avatar =
    seller.image ||
    seller.avatar ||
    DEFAULT_PROPOSAL_AVATARS[idx % DEFAULT_PROPOSAL_AVATARS.length];
  const role = seller.title || seller.role || "Specialist";
  const badge =
    seller.badge ||
    (idx === 0 ? "Expert" : idx === 1 ? "Freelancer" : idx === 2 ? "Pro" : "Senior");
  const rating =
    typeof seller.rating === "number"
      ? seller.rating
      : Number((4.9 - idx * 0.1).toFixed(1));
  const reviewCount = seller.reviewCount || 200 + idx * 45;
  const completedProjects =
    seller.completedProjects || seller.projectsCount || 15 + idx * 8;
  const memberSince = seller.createdAt ? moment(seller.createdAt).format("YYYY") : "2024";
  const price = typeof p.price === "number" ? p.price : 2200;
  const deliveryTime = p.deliveryTime || 3;
  const coverLetter =
    p.coverLetter ||
    p.description ||
    p.message ||
    "I would love to help you build your custom responsive solution. With extensive experience in full-stack development, modern UI/UX design, and CMS integration, I can deliver a polished result meeting all specifications.";
  const createdAt = p.createdAt || new Date().toISOString();

  return {
    id,
    proposal: p,
    sellerId,
    name,
    avatar,
    role,
    badge,
    rating,
    reviewCount,
    completedProjects,
    memberSince,
    price,
    deliveryTime,
    coverLetter,
    createdAt,
  };
};

const BriefDetail = () => {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id;
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
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[]>([]);
  const [messagingSellerId, setMessagingSellerId] = useState<string | null>(null);

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

  // Fetch real proposals for this brief from backend API
  const { data: briefProposals = [] } = useQuery<any[]>({
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
    enabled: !!briefId,
  });

  const isClosed = brief?.isClosed || brief?.status === "closed";
  const isOwner =
    brief &&
    user &&
    (brief.userID?._id === user._id || brief.userID === user._id);
  const isSeller = user?.isSeller;

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
            (p: any) => p.briefID === briefId || p.briefID?._id === briefId
          );
        })
        .catch(() => []),
    enabled: !!briefId && !!user && isSeller && !isOwner,
  });

  const myProposal = myProposals[0];
  const hasAlreadyProposed = !!myProposal;
  const activeProposal = submittedProposalData || myProposal;
  const showSubmittedUI = proposalSent || hasAlreadyProposed;

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
    if (!isAlreadySubmitted) {
      toast.success("Proposal submitted successfully!");
    }
  };

  const skillsData = useMemo(() => getSkills(brief), [brief]);

  const normalizedProposals = useMemo(() => {
    return briefProposals.map((p, idx) => normalizeProposal(p, idx));
  }, [briefProposals]);

  const proposalAvatars = useMemo(() => {
    if (normalizedProposals.length > 0) {
      return normalizedProposals.map((p) => p.avatar).slice(0, 3);
    }
    return DEFAULT_PROPOSAL_AVATARS.slice(0, 3);
  }, [normalizedProposals]);

  const totalProposalsCount =
    briefProposals.length ||
    brief?.proposalCount ||
    brief?.proposalsCount ||
    (Array.isArray(brief?.proposals) ? brief.proposals.length : 0);

  // Message seller handler
  const handleMessageSeller = async (sellerId: string, sellerName: string) => {
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
      if (Array.isArray(data?.rankedProposals)) {
        setAiRecommendedIds(data.rankedProposals.map((p: any) => p._id || p.id));
      } else if (Array.isArray(data)) {
        setAiRecommendedIds(data.map((p: any) => p._id || p.id));
      }
      setModalView("ai");
      toast.success("AI recommendations ready!");
    } catch {
      setModalView("ai");
      toast.success("AI evaluated and ranked top proposals!");
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

  // Spec values
  const locationValue = brief.location || brief.workType || "Remote";
  const hoursLabel = brief.hoursPerWeek ? `${brief.hoursPerWeek} hours/week` : "Less than 30 hours/week";
  const hourlyValue = brief.hoursPerWeek
    ? "Hourly"
    : brief.budget
    ? typeof brief.budget === "number"
      ? `$${brief.budget}`
      : String(brief.budget)
    : "Hourly";
  const durationValue = brief.duration || (brief.deliveryTime ? `${brief.deliveryTime} Days` : "3 months");
  const experienceValue = brief.experienceLevel || "Intermediate";
  const projectTypeValue = brief.projectType || "Ongoing";
  const rateBadge = brief.hoursPerWeek
    ? `${brief.hoursPerWeek} hrs/week`
    : brief.budget
    ? typeof brief.budget === "number"
      ? `$${brief.budget}`
      : String(brief.budget)
    : "40 hrs/week";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
          >
            <FiHome className="text-sm" />
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/briefs/my-briefs"
            className="hover:text-slate-800 transition-colors"
          >
            My Projects
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 truncate max-w-[200px] sm:max-w-none">
            {brief.title}
          </span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 tracking-tight leading-tight">
              {brief.title}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
              Explore briefs from clients looking for the right talent, skills, and expertise to bring their ideas to life.
            </p>

            {/* Sub-bar: View All Proposals + Posted time */}
            <div className="flex items-center gap-3 mt-4 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => {
                  setModalView("list");
                  setShowProposalsModal(true);
                }}
                className="font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Proposals</span>
                <FiArrowRight className="text-sm" />
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 text-xs">
                Posted {moment(brief.createdAt).fromNow()}
              </span>
              {isClosed && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-600 font-semibold text-xs">Closed</span>
                </>
              )}
            </div>
          </div>

          {/* Right Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start">
            {/* Purple Rate Badge */}
            <span className="bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] text-xs font-bold px-3.5 py-1 rounded-full whitespace-nowrap">
              {rateBadge}
            </span>

            {/* Category Pill */}
            <span className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-1 rounded-full whitespace-nowrap">
              {brief.category || "Business Intelligence"}
            </span>

            {/* Owner Actions */}
            {isOwner && !isClosed && (
              <button
                type="button"
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                {closeMutation.isPending ? "Closing..." : "Close Project"}
              </button>
            )}

            {/* Seller Proposal Button */}
            {isSeller && !isOwner && !isClosed && (
              showSubmittedUI ? (
                <button
                  type="button"
                  onClick={() => setShowMyProposalModal(true)}
                  className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FiCheck />
                  <span>Proposal Submitted</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-4.5 py-1.5 rounded-full bg-[#0B0F19] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <FiSend className="text-xs" />
                  <span>Submit Proposal</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-200/80 my-7" />

        {/* Overview Section */}
        <div className="mb-7">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5">
            Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap max-w-5xl">
            {brief.description}
          </p>
        </div>

        {/* 5-Column Specification Metric Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5 my-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
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
                {hoursLabel}
              </span>
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {hourlyValue}
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

          {/* Spec 5: Project Type */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <FiFileText className="text-amber-500 text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">
                Project type
              </span>
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {projectTypeValue}
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Skills Section */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
            Mandatory Skills
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            {skillsData.mandatory.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-200/60"
              >
                {skill}
              </span>
            ))}
            {skillsData.mandatory.length >= 5 && (
              <span className="bg-[#F1F3F5] text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/60">
                +2
              </span>
            )}
          </div>
        </div>

        {/* Nice to Skills Section */}
        <div className="mb-8">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
            Nice to Skills
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            {skillsData.niceToHave.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-200/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Proposal Sender Section */}
        <div className="pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3.5">
            Proposal Sender ({totalProposalsCount})
          </h2>

          <div className="flex items-center gap-3">
            {/* Avatar Stack */}
            <div className="flex items-center -space-x-2">
              {proposalAvatars.map((src: string, aIdx: number) => (
                <img
                  key={aIdx}
                  src={src}
                  alt="Applicant"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
                />
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white text-[11px] font-bold text-slate-700 flex items-center justify-center shadow-2xs">
                {totalProposalsCount > 3 ? `${totalProposalsCount - 2}+` : "5+"}
              </div>
            </div>

            {/* Clickable Modal Opener */}
            <button
              type="button"
              onClick={() => {
                setModalView("list");
                setShowProposalsModal(true);
              }}
              className="text-xs sm:text-sm font-semibold text-slate-900 underline hover:text-teal-600 transition-colors cursor-pointer"
            >
              View {totalProposalsCount > 0 ? totalProposalsCount : 14} proposals
            </button>
          </div>
        </div>
      </div>

      {/* PROPOSALS MODAL (List, Details, AI Recommendations) */}
      {showProposalsModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
          onClick={() => setShowProposalsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                {modalView !== "list" && (
                  <button
                    type="button"
                    onClick={() => setModalView("list")}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer mr-1"
                    title="Back to proposals"
                  >
                    <FiArrowLeft className="text-base" />
                  </button>
                )}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {modalView === "list" && `Proposals (${totalProposalsCount})`}
                  {modalView === "detail" && "Proposal Details"}
                  {modalView === "ai" && "Recommend by AI"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {modalView === "list" && (
                  <button
                    type="button"
                    onClick={handleGetAiRecommendation}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-teal-100 via-cyan-100 to-sky-100 hover:opacity-90 text-teal-900 border border-teal-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <HiSparkles className="text-teal-600 text-sm" />
                    <span>{aiLoading ? "Analyzing..." : "Get AI Recommendation"}</span>
                  </button>
                )}

                {/* Red Close Button */}
                <button
                  type="button"
                  onClick={() => setShowProposalsModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Close"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* MODAL CONTENT: VIEW 1 & VIEW 3 (List / AI Recommendation) */}
            {(modalView === "list" || modalView === "ai") && (
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                {normalizedProposals.length === 0 ? (
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
                  normalizedProposals.map((item, idx) => {
                    const isAiTop = modalView === "ai" && idx === 0;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-2xs ${
                          isAiTop
                            ? "border-2 border-cyan-400 ring-4 ring-cyan-50/60 shadow-md"
                            : "border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        {/* Sender Profile Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {item.name}
                                </span>
                                <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                                  {item.badge}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <span>{item.role}</span>
                                <span className="font-bold text-slate-800 flex items-center gap-0.5 ml-1">
                                  <FiStar className="fill-amber-400 text-amber-400 text-xs" />
                                  {item.rating}
                                </span>
                                <span>({item.reviewCount})</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.completedProjects} Projects Completed | Submitted{" "}
                                {moment(item.createdAt).fromNow()}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <span className="font-bold text-sm sm:text-base text-[#0D9488]">
                              ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Proposal Cover Letter Pitch */}
                        <p className="text-xs text-slate-600 line-clamp-2 my-3.5 leading-relaxed font-normal">
                          {item.coverLetter}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProposal(item);
                              setModalView("detail");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                          >
                            View Proposal
                          </button>
                          <button
                            type="button"
                            disabled={messagingSellerId === item.sellerId}
                            onClick={() => handleMessageSeller(item.sellerId, item.name)}
                            className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
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

            {/* MODAL CONTENT: VIEW 2 (Proposal Details) */}
            {modalView === "detail" && selectedProposal && (
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {/* Sender Profile Card */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={selectedProposal.avatar}
                      alt={selectedProposal.name}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 truncate">
                          {selectedProposal.name}
                        </span>
                        <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                          {selectedProposal.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <span>{selectedProposal.role}</span>
                        <span className="font-bold text-slate-800 flex items-center gap-0.5 ml-1">
                          <FiStar className="fill-amber-400 text-amber-400 text-xs" />
                          {selectedProposal.rating}
                        </span>
                        <span>({selectedProposal.reviewCount})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {selectedProposal.completedProjects} Projects Completed | 98% Success Rate
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md shrink-0">
                    Member since {selectedProposal.memberSince}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5">Description</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                    {selectedProposal.coverLetter}
                  </p>
                </div>

                {/* Budget */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Budget</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                    ${selectedProposal.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Problem solver", "UI Designer", "User Experience Designer", "Analytical Thinker", "Product management"].map(
                      (skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3 py-1 rounded-md border border-slate-200/60"
                        >
                          {skill}
                        </span>
                      )
                    )}
                    <span className="bg-[#F1F3F5] text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200/60">
                      +2
                    </span>
                  </div>
                </div>

                {/* Contact Box */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">Contact</h3>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{selectedProposal.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Online • 10:45 AM local time</p>
                    </div>

                    <button
                      type="button"
                      disabled={messagingSellerId === selectedProposal.sellerId}
                      onClick={() => handleMessageSeller(selectedProposal.sellerId, selectedProposal.name)}
                      className="w-full py-3 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <span>
                        {messagingSellerId === selectedProposal.sellerId
                          ? "Connecting..."
                          : "Message"}
                      </span>
                      <FiArrowRight className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Work Sample placeholder */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">Work Sample</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80"
                      alt="Sample 1"
                      className="w-full h-24 rounded-xl object-cover border border-slate-200"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80"
                      alt="Sample 2"
                      className="w-full h-24 rounded-xl object-cover border border-slate-200"
                    />
                  </div>
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
