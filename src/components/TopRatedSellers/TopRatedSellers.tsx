"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { Star, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '@/utils';
import { Loader } from '@/components';

const TopRatedSellers = () => {
  const swiperRef = useRef<any>(null);

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
    <section className="w-full py-10 md:py-20 bg-white">
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
          <div className="hidden md:flex w-full md:w-auto justify-end gap-4 items-center mt-4 md:mt-0">
            <Link
              href="/packages"
              className="px-6 py-2.5 md:px-8 md:py-3 bg-brand-green text-white rounded-[8px] font-semibold hover:bg-[#389115] transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="relative group/slider">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={16}
            slidesPerView={1.15}
            breakpoints={{
              480: { slidesPerView: 1.5, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="w-full"
          >
            {sellers.slice(0, 3).map((seller: any) => (
              <SwiperSlide key={seller._id} className="pb-4">
                <Link href={`/package/${seller._id}`} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-full">
                  <div className="w-full h-52 md:h-56 overflow-hidden flex-shrink-0">
                    <img
                      src={seller.cover || seller.images?.[0] || "/PackageImages.png"}
                      alt={seller.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
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

                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-gray-100 border-dashed">
                      <div className="flex items-center gap-3">
                        <img src={seller.userID?.image || seller.userID?.img || seller.avatar || "/media/noavatar.png"} alt={seller.userID?.username || "User"} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                        <span className="text-gray-700 font-medium text-[15px] truncate max-w-[100px]">{seller.userID?.username || seller.name || "Freelancer"}</span>
                      </div>
                      <div className="text-gray-500 text-[14px]">
                        From <strong className="text-gray-900 text-[18px] ml-1">${seller.price}</strong>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            onClick={(e) => { e.preventDefault(); swiperRef.current?.slidePrev(); }}
            className="absolute left-0 md:-left-5 top-[45%] -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:bg-gray-50 transition-all focus:outline-none"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          
          <button
            onClick={(e) => { e.preventDefault(); swiperRef.current?.slideNext(); }}
            className="absolute right-0 md:-right-5 top-[45%] -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:bg-gray-50 transition-all focus:outline-none"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopRatedSellers;
