"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, Briefcase } from "lucide-react";
import { axiosFetch } from "@/utils";
import toast from "react-hot-toast";

const RecommendedSellers = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const { data } = await axiosFetch.get("/users/random-sellers?limit=20");
        if (!data.error) {
          setSellers(data.sellers || []);
        } else {
          toast.error(data.message || "Failed to fetch recommended sellers");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred while fetching sellers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  return (
    <div className="w-full min-h-[80vh] bg-gray-50 py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 mb-4">
            Recommended Sellers
          </h1>
          <p className="text-gray-500 text-[16px] max-w-2xl">
            Discover top-tier talent tailored just for you. Connect with exceptional freelancers who can help bring your projects to life.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-green rounded-full animate-spin"></div>
          </div>
        ) : sellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellers.map((seller) => (
              <Link
                href={`/seller/${seller._id}`}
                key={seller._id}
                className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group"
              >
                <div className="h-28 bg-gradient-to-r from-brand-green/20 to-[#389115]/20 w-full relative"></div>
                <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-4">
                    <img
                      src={seller.image || "/media/noavatar.png"}
                      alt={seller.username}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm -mt-10 relative z-10 bg-white"
                    />
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-[14px]">
                        <Star className="text-[#ffb33e] fill-[#ffb33e]" size={16} />
                        <strong className="text-gray-800">{seller.starRating || 0}</strong>
                        <span className="text-gray-500">({seller.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 hover:text-brand-green transition-colors line-clamp-1">
                      {seller.username}
                    </h3>
                    {seller.shortTitle && (
                      <p className="text-brand-green font-medium text-[13.5px] mt-1 line-clamp-1">
                        {seller.shortTitle}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 mb-6">
                    {seller.country && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="opacity-70" />
                        <span>{seller.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={14} className="opacity-70" />
                      <span>{seller.completedOrdersCount || 0} Orders</span>
                    </div>
                  </div>

                  {seller.skills && seller.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
                      {seller.skills.slice(0, 3).map((skill: string, index: number) => (
                        <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-[11.5px] font-medium border border-gray-100">
                          {skill}
                        </span>
                      ))}
                      {seller.skills.length > 3 && (
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-md text-[11.5px] font-medium border border-gray-100">
                          +{seller.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <img src="/media/no-data.svg" alt="No Sellers" className="w-40 opacity-50 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-500 text-center max-w-md">
              We couldn't find any recommended sellers at the moment. Please try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedSellers;
