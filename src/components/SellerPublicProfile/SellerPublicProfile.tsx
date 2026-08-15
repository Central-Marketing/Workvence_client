"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Reviews, FavoriteSellerButton, PackageCard, Skeleton, CardSkeleton } from '@/components';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import moment from 'moment';
import {
  Globe,
  Clock,
  Award,
  Star,
  CheckCircle,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Package,
  MessageSquare,
  AlertCircle,
  UserX,
  ExternalLink
} from 'lucide-react';

const categories = [
  "All services",
  "Technology & Programming",
  "Writing & Translation",
  "Design",
  "Digital Marketing",
  "Video, Photo & Image",
  "Business",
  "Music & Audio",
  "Social Media",
];

const SellerPublicProfile = ({ username }: { username?: string }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sellerData, setSellerData] = useState<any>(null);
  const [sellerGigs, setSellerGigs] = useState<any[]>([]);
  const [sellerPortfolio, setSellerPortfolio] = useState<any[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isGigsLoading, setIsGigsLoading] = useState(true);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const router = useRouter();
  const { user } = useUserStore((state: any) => state);

  const handleContact = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const sellerID = sellerData?._id || sellerData?.id;
    const buyerID = user._id || user.id;

    if (!sellerID || !buyerID) return;

    if (String(sellerID) === String(buyerID)) {
      toast.error('You cannot contact yourself.');
      return;
    }

    try {
      const res = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
      const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
      }
    } catch (err) {
      try {
        const res = await axiosFetch.post("/conversations", {
          to: sellerID,
          from: buyerID,
          sellerID,
          buyerID
        });
        const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id;
        if (targetId) {
          router.push(`/message/${targetId}`);
        }
      } catch (postErr: any) {
        toast.error(postErr?.response?.data?.message || 'Failed to start conversation.');
      }
    }
  };

  useEffect(() => {
    if (!username || username === "undefined" || username === "null") {
      setIsProfileLoading(false);
      setIsGigsLoading(false);
      setIsPortfolioLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Fetch Seller Profile
    axiosFetch
      .get(`/users/seller/${username}`)
      .then(({ data }) => {
        if (isMounted && data) {
          const userObj = data.user || data;
          setSellerData(userObj);

          // Fetch seller gigs using resolved ID or username
          const sellerId = userObj._id || userObj.id;
          if (sellerId) {
            axiosFetch
              .get(`/gigs?userID=${sellerId}`)
              .catch(() => axiosFetch.get(`/packages?userID=${sellerId}`))
              .then(({ data: gigsData }) => {
                if (isMounted) {
                  const gigList = Array.isArray(gigsData)
                    ? gigsData
                    : (gigsData?.packages || gigsData?.gigs || gigsData?.data || []);
                  setSellerGigs(gigList);
                }
              })
              .catch(() => {
                if (isMounted) setSellerGigs(userObj.gigs || []);
              })
              .finally(() => {
                if (isMounted) setIsGigsLoading(false);
              });
          } else {
            if (isMounted) setIsGigsLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching seller profile:", err);
        if (isMounted) setSellerData(null);
      })
      .finally(() => {
        if (isMounted) setIsProfileLoading(false);
      });

    // 2. Fetch Seller Portfolio
    axiosFetch
      .get(`/users/seller/${username}/portfolio`)
      .then(({ data }) => {
        if (isMounted && data && !data.error) {
          setSellerPortfolio(data.portfolio || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsPortfolioLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  // Normalized Profile Data
  const displayUsername = sellerData?.username || (username && username !== "undefined" && username !== "null"
    ? decodeURIComponent(username)
    : "Seller");

  const avatarUrl = sellerData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUsername)}&background=0D9488&color=fff&bold=true&length=2`;
  const handleName = `@${sellerData?.username || displayUsername}`;
  const shortTitle = sellerData?.shortTitle?.trim() || "Freelancer";
  const sellerLevel = sellerData?.sellerLevel || "Level 1 Seller";
  const responseTime = sellerData?.responseTimeHours
    ? `${sellerData.responseTimeHours}h Response`
    : "1h Response";

  const country = sellerData?.country?.trim() || "Not specified";
  const memberSince = sellerData?.createdAt ? new Date(sellerData.createdAt).getFullYear() : "N/A";

  const languagesList = Array.isArray(sellerData?.languages) && sellerData.languages.length > 0
    ? sellerData.languages.map((l: any) => (typeof l === 'string' ? l : l.language || l.name || String(l))).filter(Boolean)
    : [];

  const lastDeliveryText = sellerData?.lastDeliveryDate
    ? moment(sellerData.lastDeliveryDate).fromNow()
    : "No deliveries yet";

  const hourlyRateText = sellerData?.hourlyRate
    ? `$${sellerData.hourlyRate}/hr`
    : "N/A";

  const skillsList = Array.isArray(sellerData?.skills) && sellerData.skills.length > 0
    ? sellerData.skills
    : [];

  const jobSuccess = typeof sellerData?.jobSuccessRate === 'number' && sellerData.jobSuccessRate > 0
    ? sellerData.jobSuccessRate
    : null;

  const onTimeDelivery = typeof sellerData?.onTimeDeliveryRate === 'number' && sellerData.onTimeDeliveryRate > 0
    ? sellerData.onTimeDeliveryRate
    : null;

  const starRatingDisplay = typeof sellerData?.starRating === 'number' && sellerData.starRating > 0
    ? sellerData.starRating.toFixed(1)
    : "0.0";

  const totalReviewsCount = sellerData?.totalReviews || (sellerData?.reviews ? sellerData.reviews.length : 0);
  const completedOrdersCount = sellerData?.completedOrdersCount || 0;

  const portfolioList = sellerPortfolio.length > 0 ? sellerPortfolio : (sellerData?.portfolio || []);

  // Error / Not Found State
  if (!isProfileLoading && !sellerData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-center shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
            <UserX size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Seller Not Found</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            The seller profile <span className="font-semibold text-slate-700">@{displayUsername}</span> could not be found or is currently unavailable.
          </p>
          <Link
            href="/packages"
            className="w-full py-3.5 px-6 rounded-xl bg-brand-green text-white font-semibold text-sm hover:bg-[#059669] transition-all shadow-md shadow-emerald-500/20 text-center"
          >
            Explore Marketplace Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-28">
      {/* Sticky Category Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/packages?category=${cat === 'All services' ? '' : encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-4 py-4 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-gray-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT COLUMN: Seller Card */}
          <div className="lg:col-span-4 bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.035)] lg:sticky lg:top-24 transition-all">
            {isProfileLoading ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3 border-b border-gray-100 pb-6">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="w-36 h-6" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-11 rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                {/* Avatar & Name */}
                <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 relative mb-3.5 p-1 border border-gray-200 shadow-2xs flex-shrink-0">
                    <img
                      src={avatarUrl}
                      alt={displayUsername}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="w-4 h-4 rounded-full bg-brand-green border-2 border-white absolute bottom-1 right-1 shadow-xs" title="Online now"></span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center tracking-tight">
                    {displayUsername}
                  </h1>
                  <p className="text-sm sm:text-[15px] text-gray-500 text-center mt-1 font-normal">
                    {shortTitle}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center justify-center gap-2.5 mt-3.5 flex-wrap">
                    <span className="bg-gray-100 text-gray-700 font-semibold px-3.5 py-1 rounded-full text-[12px] flex items-center gap-1.5 shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-gray-600" />
                      <span>{sellerLevel}</span>
                    </span>

                    <span className="bg-gray-100 text-gray-700 font-semibold px-3.5 py-1 rounded-full text-[12px] flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                      <span>{responseTime}</span>
                    </span>
                  </div>
                </div>

                {/* Seller Metadata */}
                <div className="space-y-3 text-[14px] pb-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-gray-500">
                      <span className="text-base font-semibold">@</span>
                      <span>Username</span>
                    </span>
                    <span className="font-semibold text-gray-900">{handleName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-gray-500">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span>From</span>
                    </span>
                    <span className="font-semibold text-gray-900">{country}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Member since</span>
                    </span>
                    <span className="font-semibold text-gray-900">{memberSince}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span>Languages</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {languagesList.length > 0 ? languagesList.join(", ") : "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Last delivery</span>
                    </span>
                    <span className="font-semibold text-gray-900">{lastDeliveryText}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Price</span>
                    </span>
                    <span className="font-semibold text-gray-900">{hourlyRateText}</span>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="py-5 border-b border-gray-100">
                  <h2 className="text-[13px] font-bold tracking-wider text-gray-900 uppercase mb-3 flex items-center justify-between">
                    <span>Skills</span>
                    {skillsList.length > 0 && (
                      <span className="text-xs font-semibold text-gray-400">{skillsList.length}</span>
                    )}
                  </h2>
                  {skillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skillsList.map((skill: string, idx: number) => (
                        <span key={idx} className="bg-[#eaf8f0] text-[#169c5e] hover:bg-[#d5f1e1] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No skills listed</p>
                  )}
                </div>

                {/* SELLER PERFORMANCE */}
                <div className="py-5 border-b border-gray-100">
                  <h2 className="text-[13px] font-bold tracking-wider text-gray-900 uppercase mb-4">
                    Seller Performance
                  </h2>

                  {jobSuccess || onTimeDelivery ? (
                    <div className="space-y-4">
                      {jobSuccess && (
                        <div>
                          <div className="flex justify-between items-center text-[13px] mb-1.5 font-semibold">
                            <span className="text-gray-900">Job Success Rate</span>
                            <span className="text-brand-green">{jobSuccess}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full transition-all duration-500" style={{ width: `${jobSuccess}%` }}></div>
                          </div>
                        </div>
                      )}

                      {onTimeDelivery && (
                        <div>
                          <div className="flex justify-between items-center text-[13px] mb-1.5 font-semibold">
                            <span className="text-gray-900">On-Time Delivery</span>
                            <span className="text-brand-green">{onTimeDelivery}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full transition-all duration-500" style={{ width: `${onTimeDelivery}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 font-semibold">New Seller</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Performance statistics will appear after order completion.</p>
                    </div>
                  )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4 py-6 border-b border-gray-100 text-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">{starRatingDisplay}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'}</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">{completedOrdersCount}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Orders Completed</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={handleContact}
                    className="flex-1 bg-brand-green hover:bg-brand-green text-white font-semibold py-3 px-4 rounded-xl text-sm text-center transition-all shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Seller</span>
                  </button>

                  {(sellerData?._id || sellerData?.id) && (
                    <FavoriteSellerButton
                      sellerId={sellerData._id || sellerData.id}
                      className="w-11 h-11 !rounded-xl !p-0 border border-gray-200"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: Main Content Sections */}
          <div className="lg:col-span-8 space-y-10">

            {/* SECTION 1: About Me */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              <h2 className="text-xl sm:text-[24px] font-semibold text-gray-900 mb-4 tracking-tight">
                About Me
              </h2>
              {sellerData?.description ? (
                <p className="text-gray-600 text-[14.5px] sm:text-[15px] leading-relaxed font-normal whitespace-pre-line">
                  {sellerData.description}
                </p>
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-200/80 rounded-2xl text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No Description Added</p>
                  <p className="text-xs text-gray-500 mt-1">This seller has not provided a profile description yet.</p>
                </div>
              )}

              {/* Work Experience Sub-section */}
              {Array.isArray(sellerData?.experience) && sellerData.experience.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-green" />
                    <span>Work Experience</span>
                  </h3>
                  <div className="space-y-3">
                    {sellerData.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200/70">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 text-sm">{exp.title || exp.role}</h4>
                          {exp.company && <span className="text-xs font-semibold text-brand-green bg-emerald-50 px-2.5 py-0.5 rounded-full">{exp.company}</span>}
                        </div>
                        {exp.description && (
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Education (Fiverr/Upwork style) */}
            {Array.isArray(sellerData?.education) && sellerData.education.length > 0 && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
                <h2 className="text-xl sm:text-[24px] font-semibold text-gray-900 mb-4 tracking-tight flex items-center gap-2.5">
                  <GraduationCap className="w-6 h-6 text-brand-green" />
                  <span>Education</span>
                </h2>
                <div className="space-y-4">
                  {sellerData.education.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-brand-green pl-4 py-1">
                      <h4 className="text-base font-bold text-gray-900">{edu.title || edu.degree}</h4>
                      <p className="text-sm font-medium text-gray-600">{edu.institution || edu.school}</p>
                      {edu.year && <p className="text-xs text-gray-400 mt-0.5">{edu.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Seller Portfolio */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-[24px] font-semibold text-gray-900 tracking-tight flex items-center gap-2.5">
                  <span>Seller Portfolio</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {portfolioList.length} {portfolioList.length === 1 ? 'Project' : 'Projects'}
                  </span>
                </h2>
              </div>

              {isPortfolioLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
              ) : portfolioList.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 font-medium text-sm flex flex-col items-center">
                  <FolderGit2 className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="font-semibold text-gray-600">No Portfolio Projects</p>
                  <p className="text-xs text-gray-400 mt-1">This seller has not uploaded any portfolio projects yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {portfolioList.map((proj: any, idx: number) => (
                    <div
                      key={idx}
                      className="group bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="relative h-48 sm:h-52 w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                        <img
                          src={proj.image || "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg"}
                          alt={proj.title || "Portfolio Project"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {proj.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal line-clamp-3">
                            {proj.description || 'No project description provided.'}
                          </p>
                        </div>

                        {proj.link && (
                          <div className="pt-3 border-t border-gray-100">
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-xs transition-colors"
                            >
                              <span>View Live Project</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: Seller Gigs / Services */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-[24px] font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                  <span>Gigs & Active Services</span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    {sellerGigs.length}
                  </span>
                </h2>
              </div>

              {isGigsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : sellerGigs.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 font-medium text-sm flex flex-col items-center">
                  <Package className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="font-semibold text-gray-600">No Active Gigs</p>
                  <p className="text-xs text-gray-400 mt-1">This seller currently has no active gigs or published services.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {sellerGigs.map((gig: any) => (
                    <PackageCard key={gig._id || gig.id} data={gig} />
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: Reviews */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              <Reviews reviews={sellerData?.reviews || []} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerPublicProfile;
