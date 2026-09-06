"use client";

import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiTag, FiCalendar, FiArrowRight } from "react-icons/fi";
import { SellerReviewItem, SELLER_FALLBACK_IMAGES } from "../utils/sellerProfileNormalizer";

interface SellerReviewsSectionProps {
  averageRating: number;
  totalReviews: number;
  starDistribution: { [star: number]: number };
  categoryScores: {
    communication: string;
    quality: string;
    value: string;
  };
  reviews: SellerReviewItem[];
}

export const SellerReviewsSection: React.FC<SellerReviewsSectionProps> = ({
  averageRating,
  totalReviews,
  starDistribution,
  categoryScores,
  reviews,
}) => {
  const [expandedResponses, setExpandedResponses] = useState<{ [id: string]: boolean }>({});
  const [visibleCount, setVisibleCount] = useState(2);

  const toggleResponse = (id: string) => {
    setExpandedResponses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayedReviews = reviews.slice(0, visibleCount);

  return (
    <div id="section-reviews" className="scroll-mt-36 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* 1. Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
          Review from the client
        </h2>
        <div className="flex items-center gap-1.5 text-sm font-sf-pro">
          <span className="font-bold text-gray-900 text-base">{averageRating.toFixed(1)}</span>
          <FaStar className="w-4 h-4 text-[#F5B400] fill-[#F5B400]" />
          <span className="text-gray-400 font-normal">({totalReviews} reviews for this package)</span>
        </div>
      </div>

      {/* 2. Rating Breakdown Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-8 pb-8 border-b border-gray-100">
        {/* Left: Star Distribution Progress Bars */}
        <div className="md:col-span-7 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const percentage = starDistribution[star] || 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs text-gray-500 font-sf-pro">
                <span className="w-3 text-right font-semibold text-gray-700">{star}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F5B400] transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Sub-scores Breakdown */}
        <div className="md:col-span-5 md:border-l md:border-gray-100 md:pl-8 space-y-3 font-sf-pro">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Rating Breakdown
          </h3>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Seller communication level</span>
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <span>{categoryScores.communication}</span>
              <FaStar className="w-3 h-3 text-[#F5B400] fill-[#F5B400]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Quality of delivery</span>
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <span>{categoryScores.quality}</span>
              <FaStar className="w-3 h-3 text-[#F5B400] fill-[#F5B400]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Value of delivery</span>
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <span>{categoryScores.value}</span>
              <FaStar className="w-3 h-3 text-[#F5B400] fill-[#F5B400]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Client Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((rev) => {
          const isRespOpen = expandedResponses[rev.id] ?? false;

          return (
            <div
              key={rev.id}
              className="bg-[#FBFBFB] border border-gray-100 rounded-xl p-5 sm:p-6 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Reviewer Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  <img
                    src={rev.buyerAvatar || SELLER_FALLBACK_IMAGES.reviewerAvatar}
                    alt={rev.buyerName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SELLER_FALLBACK_IMAGES.reviewerAvatar;
                    }}
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900 font-sf-pro">
                        {rev.buyerName}
                      </span>
                      {rev.projectStatus && (
                        <span className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                          {rev.projectStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sf-pro">
                      <span>{rev.countryFlag}</span>
                      <span>{rev.country}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sf-pro">
                      <span className="font-bold text-gray-900">{rev.rating.toFixed(1)}</span>
                      <FaStar className="w-3 h-3 text-[#F5B400] fill-[#F5B400]" />
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400">{rev.dateText}</span>
                    </div>
                  </div>
                </div>

                {/* Right Project Thumbnail (LUNAR) */}
                {rev.projectImage && (
                  <div className="w-24 sm:w-28 aspect-[16/10] rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-950 shadow-2xs">
                    <img
                      src={rev.projectImage}
                      alt="Reviewed project"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SELLER_FALLBACK_IMAGES.reviewLunar;
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed font-normal my-4 font-sf-pro">
                {rev.reviewText}
              </p>

              {/* Price & Duration Chips */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white border border-gray-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs shadow-2xs">
                  <FiTag className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-gray-400">Price</span>
                  <span className="font-bold text-gray-900">{rev.projectPrice}</span>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs shadow-2xs">
                  <FiCalendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-gray-400">Duration</span>
                  <span className="font-bold text-gray-900">{rev.projectDuration}</span>
                </div>
              </div>

              {/* Collapsible Seller Response */}
              {rev.sellerResponse && (
                <div className="border-t border-gray-200/60 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleResponse(rev.id)}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Seller Response</span>
                    {isRespOpen ? (
                      <FiChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <FiChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isRespOpen && (
                    <div className="mt-3 pl-4 border-l-2 border-teal-600 bg-white/70 p-3 rounded-r-lg">
                      <p className="text-xs text-gray-600 leading-relaxed font-normal">
                        {rev.sellerResponse}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Show More Reviews Button */}
      {reviews.length > visibleCount && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 2)}
            className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-5 py-3 rounded-[10px] flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>Show More Reviews</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerReviewsSection;
