// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { axiosFetch, getCountryFlag } from '@/utils';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader, Reviews, FavoriteButton, PackageDetailSkeleton } from '@/components';
import { useUserStore } from "@/store/userStore";
import "./Package.scss";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

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

const PackageContent = () => {
  const params = useParams();
  const router = useRouter();
  const _id = params?._id || params?.id;

  const [activeTab, setActiveTab] = useState("Description");
  const [packageTier, setPackageTier] = useState("basic");
  const { user } = useUserStore((state: any) => state);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showComparisonTable, setShowComparisonTable] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ['package', _id],
    queryFn: () => {
      if (!_id) return null;
      return axiosFetch.get(`/gigs/single/${_id}`)
        .then(({ data }) => {
          if (data) {
            const rawImgs = Array.isArray(data.images) ? data.images : [];
            data.images = Array.from(new Set([data.cover, ...rawImgs].filter(Boolean)));
          }
          return data || null;
        })
        .catch((err) => {
          const msg = err?.response?.data?.message || "Package not found";
          toast.error(msg);
          throw new Error(msg);
        });
    }
  });

  const galleryImages = Array.from(new Set([...(data?.images || []), data?.cover].filter(Boolean))).slice(0, 6);

  const handleContact = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const sellerObj = typeof data?.userID === 'object' ? data.userID : null;
    const sellerID = sellerObj?._id || sellerObj?.id || (typeof data?.userID === 'string' ? data.userID : null);
    const sellerUsername = sellerObj?.username;

    const buyerID = user?._id || user?.id;
    const buyerUsername = user?.username;


    console.log(sellerObj, sellerID, sellerUsername, buyerID, buyerUsername)

    if (!sellerID || !buyerID) {
      toast.error('User information missing to start conversation.');
      return;
    }

    if (sellerID === buyerID || (sellerUsername && buyerUsername && sellerUsername.toLowerCase() === buyerUsername.toLowerCase())) {
      toast.error('You cannot contact yourself.');
      return;
    }

    try {
      const { data: convData } = await axiosFetch.post('/conversations', {
        sellerID,
        buyerID,
        to: sellerID,
        from: buyerID,
        seller_username: sellerUsername,
        buyer_username: buyerUsername
      });

      const targetId = convData?.uuid || convData?.conversationID || convData?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
      }
    } catch (err: any) {
      try {
        const res = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
        const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id;
        if (targetId) {
          router.push(`/message/${targetId}`);
        }
      } catch (fallbackErr: any) {
        toast.error(err?.response?.data?.message || 'Could not start conversation');
      }
    }
  };

  const country = getCountryFlag(data?.userID?.country);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setSelectedHeroIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedHeroIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const packagesObj = useMemo(() => {
    let parsed: any = {};
    if (!data) return parsed;

    if (typeof data.packages === 'string') {
      try {
        parsed = JSON.parse(data.packages);
      } catch {
        parsed = {};
      }
    } else if (data.packages && typeof data.packages === 'object') {
      parsed = data.packages;
    }

    if (Array.isArray(parsed)) {
      const map: any = {};
      parsed.forEach((p: any) => {
        const key = (p.tier || p.name || p.type || '').toLowerCase();
        if (key) map[key] = p;
      });
      parsed = map;
    }

    // Fallback for basic package from top-level fields
    if (!parsed.basic && (data.price || data.features)) {
      parsed.basic = {
        price: data.price,
        title: data.shortTitle || data.title,
        shortDesc: data.shortDesc,
        deliveryTime: data.deliveryTime,
        revisionNumber: data.revisionNumber,
        features: data.features || []
      };
    }

    return parsed;
  }, [data]);

  if (isLoading) {
    return <PackageDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Something went wrong!</h2>
        <p className="text-gray-500 mb-6">We could not load the requested package details.</p>
        <Link href="/packages">
          <button className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-xl shadow-sm hover:bg-brand-green transition-all">
            Back to Packages
          </button>
        </Link>
      </div>
    );
  }

  const activeHeroImg = galleryImages[selectedHeroIndex] || "/media/noavatar.png";

  const basicPkg = packagesObj?.basic;
  const standardPkg = packagesObj?.standard;
  const premiumPkg = packagesObj?.premium;

  const selectedPackage = packagesObj[packageTier] || basicPkg || standardPkg || premiumPkg || {};

  const displayPrice = selectedPackage.price || data?.price || 0;
  const featuresList = Array.isArray(selectedPackage?.features) && selectedPackage.features.length > 0
    ? selectedPackage.features.filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24">
      {/* Category Navigation Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 select-none">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 relative flex items-center group">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="flex items-center justify-center absolute left-1 z-20 w-7 h-7 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white transition-all cursor-pointer opacity-80 hover:opacity-100 xl:hidden"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0 w-full scroll-smooth touch-pan-x overscroll-x-contain px-2 xl:px-0"
          >
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/packages?category=${cat === 'All services' ? '' : cat}`}
                className="flex-shrink-0 px-4 py-4 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-gray-900"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="flex items-center justify-center absolute right-1 z-20 w-7 h-7 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white transition-all cursor-pointer opacity-80 hover:opacity-100 xl:hidden"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb & Saved Favorites Pill */}
        <div className="flex items-center justify-between py-6">
          <p className="text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:underline">Home</Link> /
            <Link href="/packages" className="hover:underline">Search result</Link> /
            <span className="text-gray-900 font-semibold">Package Details</span>
          </p>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center border border-gray-200 bg-white px-3.5 py-1.5 rounded-lg shadow-2xs select-none">
              <FavoriteButton
                gigId={_id as string}
                initialIsFavorited={data?.isFavorited}
                initialFavoriteCount={data?.favoriteCount}
                currentUser={user}
                className="h-5"
                iconClassName="w-[20px] h-[20px]"
                showCount={true}
              />
            </div>
          </div>
        </div>

        {/* Package Title & Seller Metadata Row */}
        <div className="mb-7">
          <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-semibold text-gray-900 leading-tight tracking-tight mb-5 max-w-4xl">
            {data?.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
            <div
              onClick={() => router.push(`/seller/${data?.userID?._id}`)}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <img
                src={data?.userID?.image || "/media/noavatar.png"}
                alt="Seller Avatar"
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs"
              />
              <div>
                <h4 className="text-base font-semibold text-gray-900 group-hover:text-brand-green transition-colors">
                  {data?.userID?.username}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {data?.userID?.description ? data.userID.description.slice(0, 42) + (data.userID.description.length > 42 ? '...' : '') : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <div className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                <svg className="w-5 h-5 text-amber-400 fill-amber-400 -mt-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{data?.starNumber > 0 ? (data.starNumber).toFixed(1) : "0.0"}</span>
                <span className="text-gray-400 font-normal ml-1">({data?.sales || 0})</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {data?.createdAt ? `Member since ${new Date(data?.createdAt).getFullYear()}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Asymmetrical Hero Image Showcase */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
            {/* Main Active Hero Display */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="lg:col-span-8 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[430px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-gray-200 shadow-sm relative group cursor-pointer"
            >
              {/* Ambient Blurred Fill Backdrop */}
              <img
                src={activeHeroImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none select-none"
              />
              {/* Full Aspect Contain Image */}
              <img
                src={activeHeroImg}
                alt={data?.title || "Package Image"}
                className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Prev / Next Hero Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHeroIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHeroIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Fullscreen Preview Pill Badge */}
              <div className="absolute bottom-3 right-3 z-20 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition-all shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Click for Fullscreen</span>
              </div>
            </div>

            {/* Side Image Thumbnails */}
            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3.5 lg:h-[430px]">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedHeroIndex(idx)}
                  onDoubleClick={() => {
                    setSelectedHeroIndex(idx);
                    setIsLightboxOpen(true);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer w-full aspect-[16/10] lg:aspect-auto h-full bg-slate-900 ${selectedHeroIndex === idx
                    ? 'border-brand-green ring-2 ring-brand-green/20 shadow-sm scale-[0.98]'
                    : 'border-transparent opacity-75 hover:opacity-100 hover:border-gray-300'
                    }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  {selectedHeroIndex === idx && (
                    <div className="absolute top-2 left-2 bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      Active
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-14">

            {/* Tab Switching Pill Bar */}
            <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-hide border border-gray-200/60 sticky top-20 z-10 shadow-2xs">
              {[
                { name: "Description", id: "section-description" },
                { name: "Compare Packages", id: "section-compare" },
                { name: "FAQ", id: "section-faq" },
                { name: "Review", id: "section-reviews" }
              ].map(({ name, id }) => (
                <button
                  key={name}
                  onClick={() => scrollToSection(id, name)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === name
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* 1. Description Section */}
            <div id="section-description" className="scroll-mt-32">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                Description
              </h2>
              <div className="text-gray-600 text-[15px] sm:text-base leading-relaxed quill-content-display">
                {data?.description?.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: data.description }} />
                ) : (
                  <p className="whitespace-pre-line">{data?.description}</p>
                )}
              </div>
            </div>

            {/* 2. Compare Packages Banner */}
            <div id="section-compare" className="scroll-mt-32">
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7 border-b border-gray-200">
                  <div>
                    <h2 className="text-[22px] sm:text-[25px] font-semibold text-gray-900 tracking-tight">
                      Compare packages
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Compare what's included in each package
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowComparisonTable(!showComparisonTable)}
                    className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer bg-white"
                  >
                    {showComparisonTable ? "Hide Comparison" : "See Comparison"}
                  </button>
                </div>

                {/* Comparison */}
                {showComparisonTable && (
                  <div className="animate-fadeIn overflow-x-auto">
                    <div className="min-w-[900px]">
                      {/* Package Headers */}
                      <div className="grid grid-cols-3 border-b border-gray-200">

                        {/* Basic */}
                        {basicPkg ? (
                          <div className="px-6 py-6 sm:px-7 bg-white border-r border-gray-200">
                            <div className="mb-4">
                              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                Basic
                              </span>
                            </div>

                            <div className="text-[30px] font-bold text-gray-900 leading-none">
                              $ {basicPkg.price}
                            </div>

                            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600">
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {basicPkg.deliveryTime} days delivery
                            </div>

                            <div className="mt-5">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {basicPkg.title}
                              </h4>

                              <p className="mt-1.5 text-sm leading-5 text-gray-500">
                                {basicPkg.shortDesc}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 py-8 bg-gray-50 border-r border-gray-200 text-center">
                            <span className="text-sm text-gray-400">
                              Basic package not offered
                            </span>
                          </div>
                        )}

                        {/* Standard */}
                        {standardPkg ? (
                          <div className="relative px-6 py-6 sm:px-7 bg-[#f7fffc] border-r border-gray-200">
                            {/* Recommended */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-green" />

                            <div className="flex items-center justify-between gap-3 mb-4">
                              <span className="text-[11px] font-bold uppercase tracking-wide text-brand-green">
                                Standard
                              </span>

                              <span className="rounded-full bg-brand-green px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                Recommended
                              </span>
                            </div>

                            <div className="text-[30px] font-bold text-gray-900 leading-none">
                              $ {standardPkg.price}
                            </div>

                            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600">
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {standardPkg.deliveryTime} days delivery
                            </div>

                            <div className="mt-5">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {standardPkg.title}
                              </h4>

                              <p className="mt-1.5 text-sm leading-5 text-gray-500">
                                {standardPkg.shortDesc}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 py-8 bg-gray-50 border-r border-gray-200 text-center">
                            <span className="text-sm text-gray-400">
                              Standard package not offered
                            </span>
                          </div>
                        )}

                        {/* Premium */}
                        {premiumPkg ? (
                          <div className="px-6 py-6 sm:px-7 bg-white">
                            <div className="mb-4">
                              <span className="text-[11px] font-bold uppercase tracking-wide text-[#ff6b4a]">
                                Premium
                              </span>
                            </div>

                            <div className="text-[30px] font-bold text-gray-900 leading-none">
                              $ {premiumPkg.price}
                            </div>

                            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600">
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {premiumPkg.deliveryTime} days delivery
                            </div>

                            <div className="mt-5">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {premiumPkg.title}
                              </h4>

                              <p className="mt-1.5 text-sm leading-5 text-gray-500">
                                {premiumPkg.shortDesc}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 py-8 bg-gray-50 text-center">
                            <span className="text-sm text-gray-400">
                              Premium package not offered
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-3">

                        {/* Basic Features */}
                        {basicPkg ? (
                          <div className="px-6 py-6 sm:px-7 border-r border-gray-200 bg-white">
                            <div className="space-y-0">
                              {basicPkg.features?.map((f: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0"
                                >
                                  <span className="text-[13px] text-gray-600 leading-5">
                                    {f}
                                  </span>

                                  <svg
                                    className="shrink-0 text-brand-green"
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="border-r border-gray-200 bg-gray-50" />
                        )}

                        {/* Standard Features */}
                        {standardPkg ? (
                          <div className="px-6 py-6 sm:px-7 border-r border-gray-200 bg-[#f7fffc]">
                            <div className="space-y-0">
                              {standardPkg.features?.map((f: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0"
                                >
                                  <span className="text-[13px] font-medium text-gray-700 leading-5">
                                    {f}
                                  </span>

                                  <svg
                                    className="shrink-0 text-brand-green"
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="border-r border-gray-200 bg-gray-50" />
                        )}

                        {/* Premium Features */}
                        {premiumPkg ? (
                          <div className="px-6 py-6 sm:px-7 bg-white">
                            <div className="space-y-0">
                              {premiumPkg.features?.map((f: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0"
                                >
                                  <span className="text-[13px] text-gray-600 leading-5">
                                    {f}
                                  </span>

                                  <svg
                                    className="shrink-0 text-brand-green"
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50" />
                        )}
                      </div>

                      {/* Select Package Action Row */}
                      <div className="grid grid-cols-3 border-t border-gray-200 p-4 sm:p-5 bg-gray-50/50">
                        <div className="px-2">
                          {basicPkg && (
                            <button
                              onClick={() => {
                                setPackageTier('basic');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full py-2.5 px-3 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Select Basic (${basicPkg.price})
                            </button>
                          )}
                        </div>
                        <div className="px-2">
                          {standardPkg && (
                            <button
                              onClick={() => {
                                setPackageTier('standard');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full py-2.5 px-3 bg-brand-green text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shadow-xs text-center"
                            >
                              Select Standard (${standardPkg.price})
                            </button>
                          )}
                        </div>
                        <div className="px-2">
                          {premiumPkg && (
                            <button
                              onClick={() => {
                                setPackageTier('premium');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Select Premium (${premiumPkg.price})
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Frequently Asked Questions */}
            <div id="section-faq" className="pt-6 scroll-mt-32">
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 mb-6 tracking-tight">
                Frequently Asked Questions
              </h2>

              {data?.faqs && data.faqs.length > 0 ? (
                <div className="space-y-4">
                  {data.faqs.map((item: any, index: number) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all hover:border-gray-300"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between text-left cursor-pointer gap-4"
                        >
                          <span className="text-[15px] sm:text-base font-semibold text-gray-900 leading-snug">
                            {item.question}
                          </span>
                          <div className="text-gray-500 flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                              {!isOpen && <line x1="12" y1="8" x2="12" y2="16"></line>}
                            </svg>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-gray-100/80 text-[14.5px] text-gray-500 leading-relaxed font-normal">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">No FAQs available</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    The seller hasn't added any frequently asked questions for this package yet. Have a question? You can contact the seller directly.
                  </p>
                </div>
              )}
            </div>

            {/* 4. About The Seller Section */}
            <div className="pt-8 border-t border-gray-100">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
                About The Seller
              </h2>
              <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <img
                      src={data?.userID?.image || '/media/noavatar.png'}
                      alt={data?.userID?.username}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-xs"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{data?.userID?.username}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">{data?.userID?.description ? data.userID.description.slice(0, 50) + "..." : ""}</p>
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        <span>★</span>
                        <span className="text-gray-800 ml-1">{data?.starNumber > 0 ? (data.starNumber).toFixed(1) : "0.0"} ({data?.sales || 0} )</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleContact}
                    className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl border border-gray-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    Contact Me
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-xl border border-gray-200/60 text-xs sm:text-sm mb-6 shadow-2xs">
                  <div>
                    <span className="block text-gray-400 mb-1">From</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                      {data?.userID?.country}
                      {country?.normal && <img src={country.normal} alt="" className="w-4 h-3 rounded-2xs inline-block" />}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Member since</span>
                    <span className="font-semibold text-gray-800">
                      {data?.userID?.createdAt ? `${MONTHS[new Date(data?.userID?.createdAt).getMonth()]} ${new Date(data?.userID?.createdAt).getFullYear()}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Avg. response</span>
                    <span className="font-semibold text-gray-800">4 hours</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Last delivery</span>
                    <span className="font-semibold text-gray-800">1 day ago</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed">
                  {data?.userID?.description}
                </p>
              </div>
            </div>

            {/* 5. Reviews Section */}
            <div id="section-reviews" className="pt-8 border-t border-gray-100 scroll-mt-32">
              <Reviews packageID={_id} reviews={data?.reviews || []} />
            </div>

          </div>

          {/* RIGHT PRICING & TIER SWITCHER SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">

              {/* White Package Tier Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs transition-all">

                {/* Package Tier Selector */}
                {(basicPkg || standardPkg || premiumPkg) && (
                  <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1.5 rounded-xl text-center mb-6 border border-gray-200/60">
                    {[
                      { key: "basic", label: "Basic", pkg: basicPkg },
                      { key: "standard", label: "Standard", pkg: standardPkg },
                      { key: "premium", label: "Premium", pkg: premiumPkg },
                    ].map(({ key, label, pkg }) => {
                      const isDisabled = !pkg;
                      return (
                        <button
                          key={key}
                          onClick={() => !isDisabled && setPackageTier(key)}
                          disabled={isDisabled}
                          className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${packageTier === key
                            ? "bg-white text-gray-900 shadow-xs cursor-default"
                            : isDisabled
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:text-gray-900 cursor-pointer"
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Price Display */}
                <div className="mb-3">
                  <span className="text-2xl sm:text-[28px] font-semibold text-gray-900">
                    $ {displayPrice}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2">
                  {selectedPackage.title || data?.shortTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                  {selectedPackage.shortDesc || data?.shortDesc}
                </p>

                {/* What's Include Checklist */}
                {featuresList && featuresList.length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <div className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between select-none">
                      <span>What&apos;s Included</span>
                      <span className="text-gray-400 font-normal">↘</span>
                    </div>

                    <div className="space-y-3 mb-7">
                      {featuresList.map((feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-xs sm:text-sm text-gray-800 select-none font-medium"
                        >
                          <svg
                            className="w-4 h-4 shrink-0 text-brand-green"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>

                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Time & Revision Footer Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-800 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                      <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
                    </svg>
                    <span>
                      {selectedPackage.deliveryTime || data?.deliveryTime} Days delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>{selectedPackage.revisionNumber || data?.revisionNumber} Revisions</span>
                  </div>
                </div>

                {/* Primary Continue / Buy Plan Button */}
                <button
                  onClick={() => {
                    if (!user) {
                      router.push('/login');
                      return;
                    }

                    const sellerObj = typeof data?.userID === 'object' ? data.userID : null;
                    const sellerID = sellerObj?._id || sellerObj?.id || (typeof data?.userID === 'string' ? data.userID : null);
                    const buyerID = user?._id || user?.id;

                    if (sellerID && buyerID && String(sellerID) === String(buyerID)) {
                      toast.error("You cannot purchase your own package.");
                      return;
                    }

                    router.push(`/pay/${_id}?tier=${packageTier}`);
                  }}
                  className="w-full mt-6 py-3.5 bg-brand-green hover:bg-brand-green text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Continue (${displayPrice})
                </button>
              </div>

              {/* Separate Contact Me Button matching photo placement */}
              <button
                type="button"
                onClick={handleContact}
                className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-2xl border border-gray-200 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Contact me</span>
                <span className="text-gray-400 font-normal">➔</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-6 select-none animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Header */}
          <div className="w-full flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-200 bg-white/10 px-3 py-1 rounded-full">
                {selectedHeroIndex + 1} / {galleryImages.length}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">Use ← → arrow keys to navigate</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-semibold transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Lightbox Main Active Image with Left/Right Arrows */}
          <div className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-4" onClick={(e) => e.stopPropagation()}>
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedHeroIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/10 shadow-lg"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <img
              src={galleryImages[selectedHeroIndex]}
              alt={`Full view ${selectedHeroIndex + 1}`}
              className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl transition-all duration-300"
            />

            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedHeroIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/10 shadow-lg"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 max-w-full overflow-x-auto p-2 scrollbar-hide z-10" onClick={(e) => e.stopPropagation()}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedHeroIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${selectedHeroIndex === idx
                    ? 'border-brand-green scale-105 shadow-md ring-2 ring-brand-green/30'
                    : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function PackagePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader size={45} /></div>}>
      <PackageContent />
    </Suspense>
  );
}