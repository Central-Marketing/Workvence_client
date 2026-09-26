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
    <div className="w-full min-h-[80vh] bg-gray-50 pt-16 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center md:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Curated Talent</span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
            Recommended Sellers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Discover top-tier talent tailored just for you. Connect with exceptional freelancers who can help bring your projects to life.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0D6D5F] rounded-full animate-spin"></div>
          </div>
        ) : sellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellers.map((seller) => (
              <Link
                href={`/seller/${seller._id}`}
                key={seller._id}
                className="flex flex-col bg-white rounded-[6px] overflow-hidden border border-[rgba(0,0,0,0.10)] shadow-xs hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200 group"
              >
                <div className="h-24 bg-gradient-to-r from-[#0D6D5F]/20 to-[#10b981]/20 w-full relative"></div>
                <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-3">
                    <img
                      src={seller.image || "/media/noavatar.png"}
                      alt={seller.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs -mt-8 relative z-10 bg-white"
                    />
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Star className="text-[#ffb33e] fill-[#ffb33e]" size={14} />
                        <strong className="text-gray-800">{seller.starRating || 0}</strong>
                        <span className="text-gray-500">({seller.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-base font-bold text-[#0f172a] group-hover:text-[#0D6D5F] transition-colors line-clamp-1">
                      {seller.username}
                    </h3>
                    {seller.shortTitle && (
                      <p className="text-[#0D6D5F] font-medium text-xs mt-0.5 line-clamp-1">
                        {seller.shortTitle}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                    {seller.country && (
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="opacity-70" />
                        <span>{seller.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase size={13} className="opacity-70" />
                      <span>{seller.completedOrdersCount || 0} Orders</span>
                    </div>
                  </div>

                  {seller.skills && seller.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-[rgba(0,0,0,0.06)]">
                      {seller.skills.slice(0, 3).map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-[6px] text-[11px] font-medium border border-[rgba(0,0,0,0.10)]">
                          {skill}
                        </span>
                      ))}
                      {seller.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-[6px] text-[11px] font-medium border border-[rgba(0,0,0,0.10)]">
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
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[6px] border border-gray-100 shadow-sm">
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
