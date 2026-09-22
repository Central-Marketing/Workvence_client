"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import useAdminCategories from '@/hooks/useAdminCategories';
import { axiosFetch } from '@/utils';
import { Button } from '@/components/ui';

import 'swiper/css';
import 'swiper/css/navigation';

import { CategoryCarouselSkeleton } from '@/components';
import Image from 'next/image';

const DEFAULT_SERVICE_IMAGE =
  "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600";

const isValidImageUrl = (url: unknown): boolean => {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
};

const getCategoryBanner = (card: any): string => {
  if (isValidImageUrl(card?.banner)) return card.banner.trim();
  if (isValidImageUrl(card?.image)) return card.image.trim();
  if (isValidImageUrl(card?.img)) return card.img.trim();
  return DEFAULT_SERVICE_IMAGE;
};

const PopularServices = () => {
  const swiperRef = useRef<any>(null);

  const { isLoading, categoryList: rawList } = useAdminCategories();

  if (isLoading) {
    return <CategoryCarouselSkeleton />;
  }

  const regularCats = rawList.filter((c: any) =>
    !c.parentId &&
    c.slug !== 'other-and-general' &&
    c.slug !== 'other' &&
    !(c.name || c.title || '').toLowerCase().includes('other')
  );
  const otherCats = rawList.filter((c: any) =>
    !c.parentId &&
    (c.slug === 'other-and-general' ||
      c.slug === 'other' ||
      (c.name || c.title || '').toLowerCase().includes('other'))
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
            <Button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous service slide"
              title="Previous slide"
              variant="outline"
              size="icon"
              radius="full"
              className="w-10 h-10 min-w-[40px] min-h-[40px] p-0 border-[#0000001A] text-[#868686] bg-white shadow-sm"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5.49997 12L19 12" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 6C11 6 5 10.4189 5 12C5 13.5812 11 18 11 18" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <Button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next service slide"
              title="Next slide"
              variant="outline"
              size="icon"
              radius="full"
              className="w-10 h-10 min-w-[40px] min-h-[40px] p-0 bg-white text-[#126D6B] border-[#0000001A] shadow-sm"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18.5 12H5" stroke="#126D6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6" stroke="#126D6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
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
            const imageUrl = getCategoryBanner(card);

            return (
              <SwiperSlide key={card._id || card.id || card.slug || card.name}>
                <Link href={`/packages?category=${cardSlug}`}>
                  <div className="flex flex-col bg-[#EBFEC5] rounded-[6px] overflow-hidden group cursor-pointer border border-transparent hover:border-[#DAEFAF] transition-all duration-300">
                    <div className="w-auto aspect-[315/300] overflow-hidden m-1.5 md:m-2 rounded-[6px] bg-blue-100/50 flex items-center justify-center relative">
                      <Image
                        src={imageUrl}
                        alt={card.name || card.title || "Service"}
                        width={315}
                        height={300}
                        quality={100}
                        unoptimized
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 260px"
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
