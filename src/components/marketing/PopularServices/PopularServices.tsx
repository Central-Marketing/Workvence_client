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
import Image from 'next/image';

const PopularServices = () => {
  const swiperRef = useRef<any>(null);

  const { isLoading, data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-popular'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data)
  });

  if (isLoading) {
    return <CategoryCarouselSkeleton />;
  }

  const rawList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const regularCats = rawList.filter((c: any) =>
    c.slug !== 'other-and-general' &&
    c.slug !== 'other' &&
    !(c.name || c.title || '').toLowerCase().includes('other')
  );
  const otherCats = rawList.filter((c: any) =>
    c.slug === 'other-and-general' ||
    c.slug === 'other' ||
    (c.name || c.title || '').toLowerCase().includes('other')
  );

  const categoryList = [...regularCats, ...otherCats];

  return (
    <section className="relative w-full py-16 md:py-20 bg-white overflow-hidden">
      {/* Centered Background Circle Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[1400px] aspect-square rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, #EFE6FD 0%, #EFE6FD 35%, rgba(239, 230, 253, 0.6) 60%, rgba(239, 230, 253, 0.15) 75%, transparent 85%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div className='flex flex-col gap-3'>
            <h2 className="font-sf-pro font-[510] text-[32px] sm:text-[38px] md:text-[48px] text-[#292929] leading-normal tracking-normal">
              Popular Services on The Platform
            </h2>
            <p className='font-inter font-normal text-base sm:text-[15px] text-[#6E6E6E]'>Hand-picked gigs from our top-rated, verified sellers.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous service slide"
              title="Previous slide"
              className="w-10 h-10 flex items-center justify-center rounded-xl border-[1px] border-[#0000001A] text-[#868686] transition-colors bg-white shadow-sm"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next service slide"
              title="Next slide"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#868686] border-[1px] border-[#0000001A]  transition-colors shadow-sm"
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
            1280: { slidesPerView: 5, spaceBetween: 24 },
          }}
          className="w-full"
        >
          {categoryList.map((card: any) => {
            const cardSlug = card.slug || (card.name || card.title || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
            return (
              <SwiperSlide key={card._id || card.id || card.slug || card.name}>
                <Link href={`/packages?category=${cardSlug}`}>
                  <div className="flex flex-col bg-[#EBFEC5] rounded-[10px] overflow-hidden group cursor-pointer border border-transparent hover:border-[#DAEFAF] transition-all duration-300">
                    <div className="h-[160px] sm:h-[200px] md:h-[260px] overflow-hidden m-1.5 md:m-2 rounded-[5px] md:rounded-5px] bg-blue-100/50 flex items-center justify-center">
                      <Image
                        src={card.banner || card.icon || card.image || card.img || "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600"}
                        alt=""
                        aria-hidden="true"
                        width={315}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 md:p-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 text-md sm:text-[14px] md:text-[16px] capitalize truncate pr-2">{card.name || card.title}</h3>
                      <ArrowRight size={16} className="text-gray-500 group-hover:text-brand-green transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default PopularServices;
