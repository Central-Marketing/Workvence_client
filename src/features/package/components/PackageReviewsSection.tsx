"use client";

import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "@/components/ui";
import { ClientReviewItem } from "../utils/packageDetailsNormalizer";

interface PackageReviewsSectionProps {
  averageRating?: number;
  totalReviews?: number;
  starDistribution?: { [star: number]: number };
  categoryScores?: {
    communication: number;
    quality: number;
    value: number;
  };
  reviews?: ClientReviewItem[];
}

export const PackageReviewsSection: React.FC<PackageReviewsSectionProps> = ({
  averageRating = 0,
  totalReviews = 0,
  starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  categoryScores = { communication: 0, quality: 0, value: 0 },
  reviews = [],
}) => {
  const [expandedResponses, setExpandedResponses] = useState<{ [id: string]: boolean }>({});
  const [visibleCount, setVisibleCount] = useState(3);

  const toggleResponse = (id: string) => {
    setExpandedResponses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  if (reviews.length === 0) {
    return (
      <div id="section-reviews" className="scroll-mt-36 bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 mb-10 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Reviews from Clients
          </h2>
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
            0 Reviews
          </span>
        </div>
        <div className="p-10 text-center bg-gray-50/60 rounded-[6px] border border-dashed border-gray-200">
          <FaStar className="w-8 h-8 text-amber-300 fill-amber-300 mx-auto mb-2 opacity-60" />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No reviews yet for this package</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Be the first client to order this service package and share your experience with the community.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="section-reviews" className="scroll-mt-36 bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-[20px] font-bold font-sf-pro text-gray-900">
          Reviews from Clients
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
                <span className="w-8 text-right text-[11px] text-gray-400">{pct}%</span>
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
          const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            review.buyerName || "Buyer"
          )}&background=0D9488&color=fff&bold=true`;

          return (
            <div
              key={review.id}
              className="p-5 sm:p-6 rounded-[6px] bg-gray-50/70 border border-gray-100 transition-all hover:bg-gray-50"
            >
              {/* Review Card Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.buyerAvatar || defaultAvatar}
                    alt={review.buyerName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{review.buyerName}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {review.country && <span>{review.country}</span>}
                      {review.country && review.dateText && <span>·</span>}
                      {review.dateText && <span>{review.dateText}</span>}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-[6px] border border-gray-100 shadow-2xs">
                  <FaStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-gray-900">{review.rating}</span>
                </div>
              </div>

              {/* Review Comment Text */}
              <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                {review.reviewText}
              </p>

              {/* Optional Seller Response */}
              {review.sellerResponse && (
                <div className="mt-3 pt-3 border-t border-gray-200/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => toggleResponse(review.id)}
                    className="flex items-center gap-1 text-xs font-semibold !text-brand-green hover:underline cursor-pointer !p-0 !min-h-0 !h-auto"
                    rightIcon={
                      <FiChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isResponseOpen ? "rotate-180" : ""}`}
                      />
                    }
                  >
                    <span>Seller response</span>
                  </Button>
                  {isResponseOpen && (
                    <p className="mt-2 text-xs text-gray-600 bg-white p-3 rounded-[6px] border border-gray-100 leading-relaxed">
                      {review.sellerResponse}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Reviews Button */}
      {reviews.length > visibleCount && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          radius="xl"
          fullWidth
          onClick={handleShowMore}
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold"
        >
          Show More Reviews ({reviews.length - visibleCount} remaining)
        </Button>
      )}
    </div>
  );
};
