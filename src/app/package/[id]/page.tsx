// @ts-nocheck
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Swal from 'sweetalert2';
import { useQuery } from '@tanstack/react-query';
import { axiosFetch, getCountryFlag } from '@/utils';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader, Reviews, FavoriteButton } from '@/components';
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showComparisonTable, setShowComparisonTable] = useState(false);

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
          Swal.fire('Error', msg, 'error');
          throw new Error(msg);
        });
    }
  });

  const country = getCountryFlag(data?.userID?.country);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size={45} />
      </div>
    );
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

  const galleryImages = Array.from(new Set([...(data.images || []), data.cover].filter(Boolean))).slice(0, 6);
  const activeHeroImg = galleryImages[selectedHeroIndex] || "/media/noavatar.png";

  const selectedPackage = data?.packages && data.packages[packageTier] 
    ? data.packages[packageTier] 
    : data?.packages?.basic || {};

  const displayPrice = selectedPackage.price || data.price || 0;
  const featuresList = selectedPackage.features && selectedPackage.features.length > 0 
    ? selectedPackage.features 
    : data.features || [];

  const basicPkg = data?.packages?.basic;
  const standardPkg = data?.packages?.standard;
  const premiumPkg = data?.packages?.premium;

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24">
      {/* Category Navigation Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
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
                <span>{data?.starNumber && data.starNumber > 0 ? (data.totalStars / data.starNumber).toFixed(1) : "0.0"}</span>
                <span className="text-gray-400 font-normal ml-1">({data?.starNumber || 0})</span>
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
            <div className="lg:col-span-8 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[430px] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
              <img 
                src={activeHeroImg} 
                alt={data?.title} 
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
              />
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3.5 lg:h-[430px]">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedHeroIndex(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer w-full aspect-[16/10] lg:aspect-auto h-full ${
                    selectedHeroIndex === idx 
                      ? 'border-brand-green ring-2 ring-brand-green/20 shadow-sm scale-[0.98]' 
                      : 'border-transparent opacity-80 hover:opacity-100 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
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
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === name 
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
              <div className="text-gray-600 text-[15px] sm:text-base leading-relaxed whitespace-pre-line space-y-6 font-normal">
                <p>{data?.description}</p>
              </div>
            </div>

            {/* 2. Compare Packages Banner */}
            <div id="section-compare" className="scroll-mt-32">
              <div className="bg-[#f8f9fa] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#1e293b] tracking-tight">
                    Compare packages
                  </h2>
                  <button 
                    type="button"
                    onClick={() => setShowComparisonTable(!showComparisonTable)}
                    className="border border-gray-200 hover:bg-white text-gray-500 font-medium text-[14.5px] px-5 py-2.5 rounded-[12px] transition-colors cursor-pointer bg-transparent shadow-xs"
                  >
                    {showComparisonTable ? "Hide Comparison" : "See Comparison"}
                  </button>
                </div>

                {/* Expandable Comparison Cards */}
                {showComparisonTable && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white rounded-[20px] overflow-hidden border border-gray-200 animate-fadeIn relative">
                    
                    {/* Basic Card */}
                    {basicPkg ? (
                      <div className="flex flex-col p-6 sm:p-8 bg-[#fafafa]">
                        <div className="inline-block bg-[#f1f5f9] text-gray-500 text-[11px] font-extrabold px-4 py-1.5 rounded-full w-max mb-6 uppercase tracking-wider">BASIC</div>
                        <div className="text-[34px] font-bold text-gray-900 mb-2">$ {basicPkg.price}</div>
                        <div className="flex items-center gap-1.5 text-gray-900 text-sm font-semibold mb-8">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {basicPkg.deliveryTime} days
                        </div>
                        <div className="mb-6">
                          <h4 className="text-[12.5px] font-extrabold text-gray-900 uppercase tracking-wider mb-2">{basicPkg.title}</h4>
                          <p className="text-[14.5px] text-gray-500 leading-snug">{basicPkg.shortDesc}</p>
                        </div>
                        
                        <div className="space-y-4 text-[13.5px] text-gray-600 font-medium flex-grow border-t border-gray-100 pt-6">
                          {basicPkg.features?.map((f: string, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                              <span>{f}</span>
                              <svg className="text-brand-green" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#fafafa] text-center min-h-[300px]">
                        <span className="text-gray-400 font-medium">Basic package not offered</span>
                      </div>
                    )}

                    {/* Standard Card */}
                    {standardPkg ? (
                      <div className="flex flex-col p-6 sm:p-8 bg-white border-[2.5px] border-brand-green rounded-[18px] relative shadow-lg z-10 md:-mx-1 md:scale-[1.02] -my-0.5">
                        <div className="absolute -top-[14px] left-8 bg-[#0095ff] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-[6px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                          About
                        </div>
                        <div className="inline-block bg-brand-green text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full w-max mb-6 uppercase tracking-wider">STANDARD</div>
                        <div className="text-[34px] font-bold text-gray-900 mb-2">$ {standardPkg.price}</div>
                        <div className="flex items-center gap-1.5 text-gray-900 text-sm font-semibold mb-8">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {standardPkg.deliveryTime} days
                        </div>
                        <div className="mb-6">
                          <h4 className="text-[12.5px] font-extrabold text-gray-900 uppercase tracking-wider mb-2">{standardPkg.title}</h4>
                          <p className="text-[14.5px] text-gray-500 leading-snug">{standardPkg.shortDesc}</p>
                        </div>
                        
                        <div className="space-y-4 text-[13.5px] text-gray-600 font-medium flex-grow border-t border-gray-100 pt-6">
                          {standardPkg.features?.map((f: string, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                              <span>{f}</span>
                              <svg className="text-brand-green" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#fafafa] border-l md:border-l-0 border-gray-100 text-center min-h-[300px]">
                        <span className="text-gray-400 font-medium">Standard package not offered</span>
                      </div>
                    )}

                    {/* Premium Card */}
                    {premiumPkg ? (
                      <div className="flex flex-col p-6 sm:p-8 bg-white border-l md:border-l-0 border-gray-100">
                        <div className="inline-block bg-[#fff1ec] text-[#ff6b4a] text-[11px] font-extrabold px-4 py-1.5 rounded-full w-max mb-6 uppercase tracking-wider">PREMIUM</div>
                        <div className="text-[34px] font-bold text-gray-900 mb-2">$ {premiumPkg.price}</div>
                        <div className="flex items-center gap-1.5 text-gray-900 text-sm font-semibold mb-8">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {premiumPkg.deliveryTime} days
                        </div>
                        <div className="mb-6">
                          <h4 className="text-[12.5px] font-extrabold text-gray-900 uppercase tracking-wider mb-2">{premiumPkg.title}</h4>
                          <p className="text-[14.5px] text-gray-500 leading-snug">{premiumPkg.shortDesc}</p>
                        </div>
                        
                        <div className="space-y-4 text-[13.5px] text-gray-600 font-medium flex-grow border-t border-gray-100 pt-6">
                          {premiumPkg.features?.map((f: string, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                              <span>{f}</span>
                              <svg className="text-brand-green" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#fafafa] border-l md:border-l-0 border-gray-100 text-center min-h-[300px]">
                        <span className="text-gray-400 font-medium">Premium package not offered</span>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* 3. Frequently Asked Question (Tailwind Accordion Cards matching photo) */}
            {data?.faqs && data.faqs.length > 0 && (
              <div id="section-faq" className="pt-6 scroll-mt-32">
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 mb-6 tracking-tight">
                  Frequently Asked Question
                </h2>

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
              </div>
            )}

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
                        <span className="text-gray-800 ml-1">{data?.starNumber && data.starNumber > 0 ? (data.totalStars / data.starNumber).toFixed(1) : "0.0"} ({data?.starNumber || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!user) {
                        router.push('/login');
                      } else {
                        router.push(`/messages`);
                      }
                    }}
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
                {data?.packages && (
                  <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1.5 rounded-xl text-center mb-6 border border-gray-200/60">
                    {["basic", "standard", "premium"].map((tier) => {
                      const isDisabled = !data.packages[tier];
                      return (
                        <button
                          key={tier}
                          onClick={() => !isDisabled && setPackageTier(tier)}
                          disabled={isDisabled}
                          className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            packageTier === tier 
                              ? "bg-white text-gray-900 shadow-xs cursor-default" 
                              : isDisabled 
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:text-gray-900 cursor-pointer"
                          }`}
                        >
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
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
                        <label key={index} className="flex items-center gap-3 text-xs sm:text-sm text-gray-800 select-none font-medium">
                          <svg className="text-brand-green" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          <span>{feature}</span>
                        </label>
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
                    } else {
                      router.push(`/pay/${_id}?tier=${packageTier}`);
                    }
                  }} 
                  className="w-full mt-6 py-3.5 bg-brand-green hover:bg-brand-green text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Continue (${displayPrice})
                </button>
              </div>

              {/* Separate Contact Me Button matching photo placement */}
              <button 
                type="button"
                onClick={() => {
                  if (!user) {
                    router.push('/login');
                  } else {
                    router.push(`/messages`);
                  }
                }}
                className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-2xl border border-gray-200 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Contact me</span>
                <span className="text-gray-400 font-normal">➔</span>
              </button>

            </div>
          </div>

        </div>
      </div>
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