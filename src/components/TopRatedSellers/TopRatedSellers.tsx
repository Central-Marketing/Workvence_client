"use client";

import Link from 'next/link';
import { Star, Award } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '@/utils';
import { Loader } from '@/components';

const TopRatedSellers = () => {
  const { isLoading, data: sellers = [] } = useQuery({
    queryKey: ['top-rated-packages'],
    queryFn: () => axiosFetch.get('/gigs?sort=sales&limit=3').then(({ data }) => data || [])
  });

  if (isLoading) {
    return (
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 flex justify-center items-center h-64">
          <Loader size={45} />
        </div>
      </section>
    );
  }

  if (!sellers || sellers.length === 0) return null;

  return (
    <section className="w-full py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex flex-col gap-3 max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-600">
              Top rated sellers
            </h2>
            <p className="text-gray-500 text-[16px] leading-relaxed">
              Connect with trusted experts who have earned exceptional ratings <br className="hidden md:block" />
              through quality work, timely delivery, and professional service.
            </p>
          </div>
          <Link
            href="/packages"
            className="px-8 py-3 bg-brand-green text-white rounded-[8px] font-semibold hover:bg-[#389115] transition-colors whitespace-nowrap mb-2 shadow-sm hover:shadow-md"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.slice(0, 3).map((seller: any) => (
            <Link href={`/package/${seller._id}`} key={seller._id} className="flex flex-col bg-[#fafafa] rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer">
              <div className="w-full h-56 overflow-hidden rounded-t-2xl m-1.5 mb-0 w-[calc(100%-12px)]">
                <img
                  src={seller.cover || seller.images?.[0] || "/PackageImages.png"}
                  alt={seller.title}
                  className="w-full h-full object-cover rounded-t-[10px] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[14px]">
                    <span>({seller.starNumber || seller.reviews || 0})</span>
                    <strong className="text-gray-800 ml-1">{seller.starNumber ? (seller.totalStars / seller.starNumber).toFixed(1) : "5.0"}</strong>
                    <Star className="text-[#ffb33e] fill-[#ffb33e]" size={16} />
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#ff7a00] text-white px-2.5 py-1 rounded-md text-[12px] font-bold">
                    <span className="mr-1">Top Rated</span>
                    <Award size={13} strokeWidth={2.5} />
                    <Award size={13} className="-ml-1.5" strokeWidth={2.5} />
                    <Award size={13} className="-ml-1.5" strokeWidth={2.5} />
                  </div>
                </div>

                <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-2 min-h-[45px]">
                  {seller.title || seller.desc}
                </p>

                <div className="flex items-center justify-between pt-5 mt-1 border-t border-gray-100 border-dashed">
                  <div className="flex items-center gap-3">
                    <img src={seller.userID?.image || seller.userID?.img || seller.avatar || "/media/noavatar.png"} alt={seller.userID?.username || "User"} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                    <span className="text-gray-700 font-medium text-[15px]">{seller.userID?.username || seller.name || "Freelancer"}</span>
                  </div>
                  <div className="text-gray-500 text-[14px]">
                    From <strong className="text-gray-900 text-[18px] ml-1">${seller.price}</strong>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRatedSellers;
