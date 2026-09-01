"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '@/utils';
import Review, { ReviewItem } from '../Review/Review';

export interface RatingBreakdownData {
    communication?: number;
    qualityOfDelivery?: number;
    valueOfDelivery?: number;
    communicationRating?: number;
    qualityRating?: number;
    valueRating?: number;
    [key: string]: any;
}

export interface StarCountsData {
    "1"?: number;
    "2"?: number;
    "3"?: number;
    "4"?: number;
    "5"?: number;
    [key: string]: number | undefined;
}

export interface ReviewsProps {
    reviews?: ReviewItem[];
    sellerId?: string;
    packageID?: string;
    ratingBreakdown?: RatingBreakdownData;
    starCounts?: StarCountsData;
    totalReviews?: number;
    starRating?: number;
}

const Reviews: React.FC<ReviewsProps> = ({
    reviews: initialReviews,
    sellerId,
    ratingBreakdown: propRatingBreakdown,
    starCounts: propStarCounts,
    totalReviews: propTotalReviews,
    starRating: propStarRating,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showMore, setShowMore] = useState(false);

    // Fetch seller reviews from backend API if sellerId is provided
    const { data: fetchedSellerReviews } = useQuery({
        queryKey: ['seller-reviews', sellerId],
        queryFn: () => axiosFetch.get(`/reviews/seller/${sellerId}`).then(({ data }) => data).catch(() => []),
        enabled: Boolean(sellerId),
    });

    const fetchedList = Array.isArray(fetchedSellerReviews)
        ? (fetchedSellerReviews as ReviewItem[])
        : Array.isArray((fetchedSellerReviews as any)?.data)
            ? ((fetchedSellerReviews as any).data as ReviewItem[])
            : Array.isArray((fetchedSellerReviews as any)?.reviews)
                ? ((fetchedSellerReviews as any).reviews as ReviewItem[])
                : [];

    const allReviews: ReviewItem[] = fetchedList.length > 0
        ? fetchedList
        : (Array.isArray(initialReviews) ? initialReviews : []);

    const filteredReviews = allReviews.filter((item) => {
        if (!searchTerm.trim()) return true;
        const text = `${item?.description || ""} ${item?.userID?.username || item?.user?.username || ""} ${item?.userID?.country || item?.user?.country || ""}`.toLowerCase();
        return text.includes(searchTerm.trim().toLowerCase());
    });

    const displayedReviews = showMore ? filteredReviews : filteredReviews.slice(0, 4);

    // Calculate or resolve star counts and totals
    const computedStarCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let computedTotalScore = 0;
    let computedValidReviewCount = 0;

    let commTotal = 0;
    let commCount = 0;
    let qualTotal = 0;
    let qualCount = 0;
    let valTotal = 0;
    let valCount = 0;

    allReviews.forEach((r) => {
        const score = typeof r.star === 'number' && r.star > 0 && r.star <= 5 ? r.star : 0;
        if (score > 0) {
            const rounded = Math.min(5, Math.max(1, Math.round(score)));
            computedStarCounts[rounded] = (computedStarCounts[rounded] || 0) + 1;
            computedTotalScore += score;
            computedValidReviewCount++;
        }

        if (typeof r.communicationRating === 'number' && r.communicationRating > 0) {
            commTotal += r.communicationRating;
            commCount++;
        }
        if (typeof r.qualityRating === 'number' && r.qualityRating > 0) {
            qualTotal += r.qualityRating;
            qualCount++;
        }
        if (typeof r.valueRating === 'number' && r.valueRating > 0) {
            valTotal += r.valueRating;
            valCount++;
        }
    });

    const hasPropStarCounts = Boolean(
        propStarCounts && (
            (propStarCounts["5"] ?? propStarCounts[5] ?? 0) > 0 ||
            (propStarCounts["4"] ?? propStarCounts[4] ?? 0) > 0 ||
            (propStarCounts["3"] ?? propStarCounts[3] ?? 0) > 0 ||
            (propStarCounts["2"] ?? propStarCounts[2] ?? 0) > 0 ||
            (propStarCounts["1"] ?? propStarCounts[1] ?? 0) > 0
        )
    );

    const starCounts: Record<number, number> = hasPropStarCounts
        ? {
            5: Number(propStarCounts?.["5"] ?? propStarCounts?.[5] ?? 0),
            4: Number(propStarCounts?.["4"] ?? propStarCounts?.[4] ?? 0),
            3: Number(propStarCounts?.["3"] ?? propStarCounts?.[3] ?? 0),
            2: Number(propStarCounts?.["2"] ?? propStarCounts?.[2] ?? 0),
            1: Number(propStarCounts?.["1"] ?? propStarCounts?.[1] ?? 0),
        }
        : computedStarCounts;

    const totalReviewsCount = typeof propTotalReviews === 'number' && propTotalReviews > 0
        ? propTotalReviews
        : (allReviews.length > 0 ? allReviews.length : (hasPropStarCounts ? Object.values(starCounts).reduce((a, b) => a + b, 0) : 0));

    const averageRating = typeof propStarRating === 'number' && propStarRating > 0
        ? propStarRating
        : (computedValidReviewCount > 0
            ? computedTotalScore / computedValidReviewCount
            : (totalReviewsCount > 0 && hasPropStarCounts
                ? (starCounts[5] * 5 + starCounts[4] * 4 + starCounts[3] * 3 + starCounts[2] * 2 + starCounts[1] * 1) / totalReviewsCount
                : 0));

    // Resolve multi-criteria ratings with backward-compatible fallbacks
    const resolvedComm = propRatingBreakdown?.communication ?? propRatingBreakdown?.communicationRating ?? (commCount > 0 ? (commTotal / commCount) : averageRating);
    const resolvedQual = propRatingBreakdown?.qualityOfDelivery ?? propRatingBreakdown?.qualityRating ?? (qualCount > 0 ? (qualTotal / qualCount) : averageRating);
    const resolvedVal = propRatingBreakdown?.valueOfDelivery ?? propRatingBreakdown?.valueRating ?? (valCount > 0 ? (valTotal / valCount) : averageRating);

    const criteriaBreakdown = [
        { label: "Seller communication level", score: resolvedComm > 0 ? Number(resolvedComm).toFixed(1) : (averageRating > 0 ? averageRating.toFixed(1) : "0.0") },
        { label: "Quality of delivery", score: resolvedQual > 0 ? Number(resolvedQual).toFixed(1) : (averageRating > 0 ? averageRating.toFixed(1) : "0.0") },
        { label: "Value of delivery", score: resolvedVal > 0 ? Number(resolvedVal).toFixed(1) : (averageRating > 0 ? averageRating.toFixed(1) : "0.0") }
    ];

    return (
        <div className="w-full pb-6">
            {/* Heading */}
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 mb-6 tracking-tight">
                Reviews
            </h2>

            {/* Overall Rating & Count Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'}
                </span>

                {totalReviewsCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-900">
                            <svg className="w-4 h-4 fill-current text-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <span className="text-base font-semibold text-gray-900 ml-1">{averageRating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Rating Breakdown 2-Column Section */}
            {totalReviewsCount > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
                    {/* Left side: Star level bars */}
                    <div className="lg:col-span-6 space-y-3.5">
                        {[5, 4, 3, 2, 1].map((starLvl) => {
                            const count = starCounts[starLvl] || 0;
                            const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                            const hasVotes = count > 0;
                            return (
                                <div key={starLvl} className="flex items-center text-xs sm:text-sm">
                                    <span className={`w-14 whitespace-nowrap ${hasVotes ? 'text-gray-800 font-bold' : 'text-gray-400 font-medium'}`}>
                                        {starLvl} Stars
                                    </span>
                                    <div className="h-2 rounded-full bg-gray-200 flex-1 mx-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${hasVotes ? 'bg-brand-green' : 'bg-transparent'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className={`w-10 text-right font-semibold text-xs ${hasVotes ? 'text-gray-500' : 'text-gray-300'}`}>
                                        ({count})
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right side: Rating criteria breakdown */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                        <h3 className="text-[16px] font-semibold text-gray-900 mb-4.5">
                            Rating Breakdown
                        </h3>
                        <div className="space-y-3.5">
                            {criteriaBreakdown.map((criteria, i) => (
                                <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500 font-normal">{criteria.label}</span>
                                    <div className="flex items-center gap-1 font-semibold text-gray-900">
                                        <svg className="w-3.5 h-3.5 fill-current text-amber-400 -mt-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span>{criteria.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Search Reviews Box */}
            {totalReviewsCount > 0 && (
                <div className="flex justify-end mb-8">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Search reviews"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-brand-green transition-colors"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Review Cards Grid (2 columns) */}
            {displayedReviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 font-medium">
                    {totalReviewsCount === 0
                        ? "There are no reviews yet for this package."
                        : `No reviews matching "${searchTerm}" found.`}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {displayedReviews.map((review, idx) => (
                        <Review key={review._id || idx} review={review} />
                    ))}
                </div>
            )}

            {/* Action Buttons: Show More Reviews */}
            {filteredReviews.length > 4 && (
                <div className="flex flex-wrap items-center justify-end gap-4 mt-6 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        className="px-7 py-3 bg-brand-green hover:bg-brand-green text-white font-semibold rounded-xl shadow-sm transition-all text-sm cursor-pointer"
                    >
                        {showMore ? "Show fewer reviews" : "Show more review"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reviews;