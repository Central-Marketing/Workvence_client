"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '@/utils';
import adminAxios from '@/utils/adminAxios';

import 'swiper/css';
import 'swiper/css/navigation';

import { CategoryCarouselSkeleton } from '@/components';

const PopularServices = () => {
  const swiperRef = useRef<any>(null);

  const { isLoading, data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-popular'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data)
  });

  if (isLoading) {
    return <CategoryCarouselSkeleton />;
  }

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  return (
    <section className="w-full py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-600">Best Popular Services</h2>

          <div className="flex gap-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors bg-white shadow-sm"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-green text-white hover:bg-[#389115] transition-colors shadow-sm"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={12}
          slidesPerView={2}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full"
        >
          {categoryList.map((card: any) => (
            <SwiperSlide key={card._id || card.id || card.slug || card.name}>
              <Link href={`/packages?category=${card.slug || card.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex flex-col bg-blue-50 rounded-xl overflow-hidden group cursor-pointer border border-transparent hover:border-blue-100 transition-all duration-300">
                  <div className="h-[160px] sm:h-[200px] md:h-[260px] overflow-hidden m-1.5 md:m-2 rounded-2xl md:rounded-[1rem] bg-blue-100/50 flex items-center justify-center">
                    <img
                      src={card.banner || card.icon || card.image || card.img || "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600"}
                      alt={card.name || card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 md:p-4 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 text-md sm:text-[14px] md:text-[16px] capitalize truncate pr-2">{card.name || card.title}</h3>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-brand-green transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PopularServices;
