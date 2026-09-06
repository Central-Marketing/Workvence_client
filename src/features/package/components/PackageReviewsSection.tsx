"use client";

import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiChevronDown, FiCalendar, FiDollarSign, FiArrowRight } from "react-icons/fi";
import { ClientReviewItem, FALLBACK_IMAGES } from "../utils/packageDetailsNormalizer";

interface PackageReviewsSectionProps {
  averageRating: number;
  totalReviews: number;
  starDistribution: { [star: number]: number };
  categoryScores: {
    communication: number;
    quality: number;
    value: number;
  };
  reviews: ClientReviewItem[];
}

export const PackageReviewsSection: React.FC<PackageReviewsSectionProps> = ({
  averageRating = 4.8,
  totalReviews = 226,
  starDistribution = { 5: 88, 4: 68, 3: 52, 2: 24, 1: 8 },
  categoryScores = { communication: 5, quality: 4, value: 3 },
  reviews = [],
}) => {
  const [expandedResponses, setExpandedResponses] = useState<{ [id: string]: boolean }>({});
  const [visibleCount, setVisibleCount] = useState(2);

  const toggleResponse = (id: string) => {
    setExpandedResponses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 2);
  };

  return (
    <div id="section-reviews" className="scroll-mt-36 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Review from the client
        </h2>
        <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-sm">
          <span className="text-base font-bold">{averageRating.toFixed(1)}</span>
          <FaStar className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-gray-400 font-normal">({totalReviews} reviews for this package)</span>
        </div>
      </div>

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 pb-8 border-b border-gray-100">
        {/* Left: 5 to 1 Star Bars */}
        <div className="md:col-span-6 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = starDistribution[star] || 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                <span className="w-2">{star}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Specific Category Ratings */}
        <div className="md:col-span-6 space-y-3 sm:pl-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
            Rating Breakdown
          </h4>
          <div className="space-y-2.5 text-xs sm:text-[13px] text-gray-700 font-medium">
            <div className="flex items-center justify-between">
              <span>Seller communication level</span>
              <div className="flex items-center gap-1 font-bold text-gray-900">
                <span>{categoryScores.communication}/5</span>
                <FaStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Quality of delivery</span>
              <div className="flex items-center gap-1 font-bold text-gray-900">
                <span>{categoryScores.quality}/5</span>
                <FaStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Value of delivery</span>
              <div className="flex items-center gap-1 font-bold text-gray-900">
                <span>{categoryScores.value}/5</span>
                <FaStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4 mb-6">
        {reviews.slice(0, visibleCount).map((review) => {
          const isResponseOpen = Boolean(expandedResponses[review.id]);
          return (
            <div
              key={review.id}
              className="p-5 sm:p-6 rounded-2xl bg-gray-50/70 border border-gray-100 transition-all hover:bg-gray-50"
            >
              {/* Review Card Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.buyerAvatar || FALLBACK_IMAGES.reviewerAvatar}
                    alt={review.buyerName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGES.reviewerAvatar;
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{review.buyerName}</span>
                      <span className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                        {review.projectStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{review.countryFlag} {review.country}</span>
                      <span className="text-gray-300">·</span>
                      <div className="flex items-center gap-1 font-semibold text-gray-900">
                        <span>{review.rating.toFixed(1)}</span>
                        <FaStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </div>
                      <span className="text-gray-300">·</span>
                      <span>{review.dateText}</span>
                    </div>
                  </div>
                </div>

                {/* Delivered Project Thumbnail */}
                {review.projectImage && (
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0 shadow-2xs bg-black">
                    <img
                      src={review.projectImage}
                      alt="Delivered Project"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGES.reviewLunar;
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Review Text */}
              <p className="text-[14px] text-gray-700 leading-relaxed mb-4">
                {review.reviewText}
              </p>

              {/* Project Meta Box */}
              <div className="inline-flex items-center gap-3 p-2.5 bg-white border border-gray-200/80 rounded-xl shadow-2xs mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <FiDollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Price</span>
                    <span className="font-bold text-gray-900">{review.projectPrice}</span>
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-gray-200 mx-1" />
                <div className="flex items-center gap-1.5 text-gray-700">
                  <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Duration</span>
                    <span className="font-bold text-gray-900">{review.projectDuration}</span>
                  </div>
                </div>
              </div>

              {/* Seller Response Accordion */}
              {review.sellerResponse && (
                <div className="border-t border-gray-200/60 pt-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => toggleResponse(review.id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer py-1"
                  >
                    <span>Seller Response</span>
                    <FiChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isResponseOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isResponseOpen && (
                    <div className="mt-2 text-xs text-gray-600 bg-white/90 border border-gray-200/60 p-3.5 rounded-xl leading-relaxed animate-fadeIn">
                      {review.sellerResponse}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Reviews CTA */}
      {visibleCount < reviews.length && (
        <button
          type="button"
          onClick={handleShowMore}
          className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <span>Show More Reviews</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
