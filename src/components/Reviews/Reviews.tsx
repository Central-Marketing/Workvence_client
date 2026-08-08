// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { Review, Loader } from '..';
import { axiosFetch } from "@/utils";
import toast from 'react-hot-toast';

const Reviews = (props: any) => {
    const { packageID, reviews } = props;
    const navigation = useRouter();
    const queryClient = useQueryClient();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [showMore, setShowMore] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const mutation = useMutation({
        mutationFn: (review: any) =>
            axiosFetch.post('/reviews', review)
            .then(({data}) => data)
            .catch(({ response: { data } }) => {
                if (data?.message === 'jwt expired') {
                    navigation.push('/login');
                }
                toast.error(data?.message || "Error submitting review");
                throw new Error(data?.message || "Error submitting review");
            }),
        onSuccess: () => {
            toast.success("Review submitted successfully!");
            // Invalidate the parent gig query so it fetches the new review!
            queryClient.invalidateQueries({ queryKey: ['gig', packageID] });
            setShowAddForm(false);
        }
    });

    const handleReviewSubmit = (event: any) => {
        event.preventDefault();
        const description = event.target.description.value;
        const star = Number(event.target.star.value);

        if (star && description) {
            mutation.mutate({ packageID, description, star });
            event.target.reset();
        } else {
            toast.error("Please enter both rating and review text");
        }
    };

    const allReviews = Array.isArray(reviews) ? reviews : [];

    const filteredReviews = allReviews.filter((item: any) => {
      if (!searchTerm.trim()) return true;
      const text = `${item?.description || ""} ${item?.userID?.username || ""} ${item?.userID?.country || ""}`.toLowerCase();
      return text.includes(searchTerm.trim().toLowerCase());
    });

    const displayedReviews = showMore ? filteredReviews : filteredReviews.slice(0, 4);
    
    // Calculate accurate aggregate stats
    const totalReviewsCount = allReviews.length;
    let averageRating = 0;
    
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    if (totalReviewsCount > 0) {
        let totalScore = 0;
        allReviews.forEach((r: any) => {
            const score = typeof r.star === 'number' && r.star > 0 && r.star <= 5 ? r.star : 0;
            if (score > 0) {
                starCounts[score as keyof typeof starCounts]++;
                totalScore += score;
            }
        });
        averageRating = totalScore / totalReviewsCount;
    }

    return (
        <div className="w-full pb-6">
            {/* Heading */}
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 mb-6 tracking-tight">
                Reviews
            </h2>

            {/* Overall Rating & Count Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'} for this Package
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
                            const count = starCounts[starLvl as keyof typeof starCounts];
                            const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                            const hasVotes = count > 0;
                            return (
                                <div key={starLvl} className="flex items-center text-xs sm:text-sm">
                                    <span className={`w-14 whitespace-nowrap ${hasVotes ? 'text-gray-800 font-bold' : 'text-gray-400 font-medium'}`}>
                                        {starLvl} Stars
                                    </span>
                                    <div className="h-2 rounded-full bg-gray-200 flex-1 mx-3 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${hasVotes ? 'bg-[#1dbf73]' : 'bg-transparent'}`}
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

                    {/* Right side: Rating criteria breakdown (Currently hardcoded for UI purposes, could be mapped if API supports it later) */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                        <h3 className="text-[16px] font-semibold text-gray-900 mb-4.5">
                            Rating Breakdown
                        </h3>
                        <div className="space-y-3.5">
                            {[
                            { label: "Seller communication level", score: averageRating > 0 ? averageRating.toFixed(1) : "0.0" },
                            { label: "Quality of delivery", score: averageRating > 0 ? averageRating.toFixed(1) : "0.0" },
                            { label: "Value of delivery", score: averageRating > 0 ? averageRating.toFixed(1) : "0.0" }
                            ].map((criteria, i) => (
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
                            className="w-full bg-white border border-gray-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-[#1dbf73] transition-colors"
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
                    {displayedReviews.map((review: any, idx: number) => (
                        <Review key={review._id || idx} review={review} />
                    ))}
                </div>
            )}

            {/* Action Buttons: Show More Reviews & Add Review Toggle */}
            <div className="flex flex-wrap items-center justify-end gap-4 mt-6 pt-2">
                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200/80 text-gray-800 font-semibold rounded-xl transition-colors text-sm cursor-pointer"
                >
                    {showAddForm ? "Cancel Writing" : "+ Write a Review"}
                </button>

                {filteredReviews.length > 4 && (
                    <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        className="px-7 py-3 bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold rounded-xl shadow-sm transition-all text-sm cursor-pointer"
                    >
                        {showMore ? "Show fewer reviews" : "Show more review"}
                    </button>
                )}
            </div>

            {/* Collapsible Write Review Form */}
            {showAddForm && (
                <div className="mt-8 bg-gray-50 border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-xs animate-fadeIn">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Leave Your Feedback</h3>
                    <form className="space-y-4" onSubmit={handleReviewSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Rating Score</label>
                            <select 
                                name="star" 
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#1dbf73] shadow-2xs cursor-pointer w-48"
                                defaultValue={5}
                            >
                                <option value={5}>★★★★★ (5 - Excellent)</option>
                                <option value={4}>★★★★☆ (4 - Good)</option>
                                <option value={3}>★★★☆☆ (3 - Average)</option>
                                <option value={2}>★★☆☆☆ (2 - Fair)</option>
                                <option value={1}>★☆☆☆☆ (1 - Poor)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Your Review</label>
                            <textarea 
                                name="description" 
                                rows={4} 
                                placeholder="Describe your working experience with this seller..." 
                                required
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1dbf73] transition-colors shadow-2xs"
                            ></textarea>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                disabled={mutation.isPending}
                                className="px-7 py-3 bg-[#1dbf73] hover:bg-[#19a463] text-white font-extrabold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {mutation.isPending ? "Submitting..." : "Send Review"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Reviews;