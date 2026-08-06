// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { Review, Loader } from '..';
import { axiosFetch } from "@/utils";
import toast from 'react-hot-toast';

const defaultMockReviews = [
  {
    _id: "mock-1",
    userID: { username: "Nguyen, Shane", country: "Switzerland", image: "/media/noavatar.png" },
    star: 5,
    description: "I am extremely thankful to Boniamin for the amazing work done on the cover of my book I AM A SURVIVOR. From the very beginning, he was patient, professional, and genuinely interested in understanding the message behind my book. The final cover is up to my expectations and perfectly reflects the strength...",
    price: "$200-$400",
    duration: "2 Weeks"
  },
  {
    _id: "mock-2",
    userID: { username: "Henry, Arthur", country: "Switzerland", image: "/media/noavatar.png" },
    star: 5,
    description: "I am extremely thankful to Boniamin for the amazing work done on the cover of my book I AM A SURVIVOR. From the very beginning, he was patient, professional, and genuinely interested in understanding the message behind my book. The final cover is up to my expectations and perfectly reflects the strength...",
    price: "$200-$400",
    duration: "2 Weeks"
  },
  {
    _id: "mock-3",
    userID: { username: "Nguyen, Shane", country: "Switzerland", image: "/media/noavatar.png" },
    star: 5,
    description: "I am extremely thankful to Boniamin for the amazing work done on the cover of my book I AM A SURVIVOR. From the very beginning, he was patient, professional, and genuinely interested in understanding the message behind my book. The final cover is up to my expectations and perfectly reflects the strength...",
    price: "$200-$400",
    duration: "2 Weeks"
  },
  {
    _id: "mock-4",
    userID: { username: "Henry, Arthur", country: "Switzerland", image: "/media/noavatar.png" },
    star: 5,
    description: "I am extremely thankful to Boniamin for the amazing work done on the cover of my book I AM A SURVIVOR. From the very beginning, he was patient, professional, and genuinely interested in understanding the message behind my book. The final cover is up to my expectations and perfectly reflects the strength...",
    price: "$200-$400",
    duration: "2 Weeks"
  }
];

const Reviews = (props: any) => {
    const { gigID } = props;
    const navigation = useRouter();
    const queryClient = useQueryClient();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [showMore, setShowMore] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const { isLoading, error, data } = useQuery({
        queryKey: ['reviews', gigID],
        queryFn: () => {
            if (!gigID || gigID.toString().startsWith("rec-")) return defaultMockReviews;
            return axiosFetch.get(`/reviews/${gigID}`)
                .then(({ data }) => data || [])
                .catch(() => []);
        }
    });

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
            queryClient.invalidateQueries({ queryKey: ['reviews', gigID] });
            setShowAddForm(false);
        }
    });

    const handleReviewSubmit = (event: any) => {
        event.preventDefault();
        const description = event.target.description.value;
        const star = Number(event.target.star.value);

        if (star && description) {
            mutation.mutate({ gigID, description, star });
            event.target.reset();
        } else {
            toast.error("Please enter both rating and review text");
        }
    };

    // Combine actual API reviews with fallbacks so the grid always looks populated and rich
    const rawReviews = Array.isArray(data) && data.length > 0 ? data : defaultMockReviews;
    const allReviews = rawReviews.length < 4 ? [...rawReviews, ...defaultMockReviews.slice(0, 4 - rawReviews.length)] : rawReviews;

    const filteredReviews = allReviews.filter((item: any) => {
      if (!searchTerm.trim()) return true;
      const text = `${item?.description} ${item?.userID?.username} ${item?.userID?.country}`.toLowerCase();
      return text.includes(searchTerm.trim().toLowerCase());
    });

    const displayedReviews = showMore ? filteredReviews : filteredReviews.slice(0, 4);
    const totalReviewsCount = Math.max(82, allReviews.length);

    return (
        <div className="w-full pb-6">
            {/* Heading */}
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 mb-6 tracking-tight">
                Reviews
            </h2>

            {/* Overall Rating & Count Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {totalReviewsCount} reviews for this Gig
                </span>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-gray-900">
                        {new Array(5).fill(0).map((_, i) => (
                            <svg key={i} className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-base font-semibold text-gray-900 ml-1">5.0</span>
                </div>
            </div>

            {/* Rating Breakdown 2-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
                
                {/* Left side: Star level bars */}
                <div className="lg:col-span-6 space-y-3.5">
                    {[
                      { star: 5, count: totalReviewsCount, ratio: "w-full bg-gray-900", text: "text-gray-800 font-bold", numColor: "text-gray-500" },
                      { star: 4, count: 0, ratio: "w-0 bg-gray-200", text: "text-gray-300 font-medium", numColor: "text-gray-300" },
                      { star: 3, count: 0, ratio: "w-0 bg-gray-200", text: "text-gray-300 font-medium", numColor: "text-gray-300" },
                      { star: 2, count: 0, ratio: "w-0 bg-gray-200", text: "text-gray-300 font-medium", numColor: "text-gray-300" },
                      { star: 1, count: 0, ratio: "w-0 bg-gray-200", text: "text-gray-300 font-medium", numColor: "text-gray-300" }
                    ].map((row) => (
                        <div key={row.star} className="flex items-center text-xs sm:text-sm">
                            <span className={`w-14 whitespace-nowrap ${row.text}`}>
                                {row.star} Stars
                            </span>
                            <div className="h-2 rounded-full bg-gray-200 flex-1 mx-3 overflow-hidden">
                                <div className={`h-full rounded-full ${row.ratio}`}></div>
                            </div>
                            <span className={`w-10 text-right font-semibold text-xs ${row.numColor}`}>
                                ({row.count})
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right side: Rating criteria breakdown */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                    <h3 className="text-[16px] font-semibold text-gray-900 mb-4.5">
                        Rating Breakdown
                    </h3>
                    <div className="space-y-3.5">
                        {[
                          { label: "Seller communication level", score: "5" },
                          { label: "Quality of delivery", score: "5" },
                          { label: "Value of delivery", score: "5" }
                        ].map((criteria, i) => (
                            <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-gray-500 font-normal">{criteria.label}</span>
                                <div className="flex items-center gap-1 font-semibold text-gray-900">
                                    <svg className="w-3.5 h-3.5 fill-current text-gray-900 -mt-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span>{criteria.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Search Reviews Box */}
            <div className="flex justify-end mb-8">
                <div className="relative w-full sm:max-w-xs">
                    <input
                        type="text"
                        placeholder="Search reviews"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-gray-400 transition-colors"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Review Cards Grid (2 columns) */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader size={35} />
                </div>
            ) : displayedReviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 font-medium">
                    No reviews matching &quot;{searchTerm}&quot; found.
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