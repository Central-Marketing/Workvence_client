"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';

// 1. Graphic & Design (Artist Palette)
const PaletteIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C12.83 22 13.5 21.33 13.5 20.5C13.5 20.12 13.36 19.77 13.12 19.49C12.89 19.22 12.75 18.88 12.75 18.5C12.75 17.67 13.42 17 14.25 17H16C19.31 17 22 14.31 22 11C22 6.04 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7.5" cy="11.5" r="1.25" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="1.25" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="1.25" fill="currentColor" />
    <circle cx="17.5" cy="11.5" r="1.25" fill="currentColor" />
  </svg>
);

// 2. Digital Marketing (Megaphone)
const MegaphoneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18.5 7.5L8.5 10.5V13.5L18.5 16.5V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 10.5H5.5C4.4 10.5 3.5 11.4 3.5 12.5C3.5 13.6 4.4 14.5 5.5 14.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 14.5V18.5C8.5 19.6 7.6 20.5 6.5 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="18.5" cy="12" rx="2" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// 3. Writing & Translation (Pencil)
const PencilIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16.5 3.5L20.5 7.5L8.5 19.5H4.5V15.5L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 5.5L18.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 4. Music Production (Music Note)
const MusicNoteIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="7.5" cy="16.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 16.5V5.5C11 4.4 11.9 3.5 13 3.5H16C17.1 3.5 18 4.4 18 5.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 5. Animation & 3D (Focus Frame with Image)
const Animation3DIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M7 3H4C3.45 3 3 3.45 3 4V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 3H20C20.55 3 21 3.45 21 4V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 21H4C3.45 21 3 20.55 3 20V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21H20C20.55 21 21 20.55 21 20V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="1" fill="currentColor" />
    <path d="M8.5 15L11.5 12L13.5 14L15.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 6. Videos & Editing (Picture Image Frame)
const PictureFrameIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M4 17L9.5 11.5L14 16L16.5 13.5L20 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Videos & Animation (Video Camera)
const VideoCameraIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="6" width="13" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 10L21 7V17L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// 8. Data & Intelligence (Database with Lightning Bolt)
const DataIntelligenceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 5V12C4 13.66 7.58 15 12 15C12.8 15 13.56 14.96 14.28 14.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 12V19C4 20.66 7.58 22 12 22C12.8 22 13.56 21.96 14.28 21.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18.5 13L16 17.5H19.5L17.5 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Fallback icon selector based on category name or index
const getMatchedIcon = (category: any, index: number, iconClass: string) => {
  const name = (category?.name || category?.title || category?.slug || '').toLowerCase();

  if (name.includes('graphic') || name.includes('design') || name.includes('logo') || name.includes('art')) {
    return <PaletteIcon className={iconClass} />;
  }
  if (name.includes('market') || name.includes('digital') || name.includes('seo') || name.includes('ad')) {
    return <MegaphoneIcon className={iconClass} />;
  }
  if (name.includes('writ') || name.includes('translat') || name.includes('content') || name.includes('copy')) {
    return <PencilIcon className={iconClass} />;
  }
  if (name.includes('music') || name.includes('audio') || name.includes('sound') || name.includes('voice')) {
    return <MusicNoteIcon className={iconClass} />;
  }
  if (name.includes('3d') || (name.includes('animat') && !name.includes('video'))) {
    return <Animation3DIcon className={iconClass} />;
  }
  if (name.includes('edit') || (name.includes('video') && name.includes('edit'))) {
    return <PictureFrameIcon className={iconClass} />;
  }
  if (name.includes('video') || name.includes('film') || name.includes('motion')) {
    return <VideoCameraIcon className={iconClass} />;
  }
  if (name.includes('data') || name.includes('intel') || name.includes('ai') || name.includes('tech') || name.includes('code')) {
    return <DataIntelligenceIcon className={iconClass} />;
  }

  // Cyclical fallback to guarantee 1:1 match with the 8 preview slots
  const fallbackIcons = [
    <PaletteIcon className={iconClass} />,
    <MegaphoneIcon className={iconClass} />,
    <PencilIcon className={iconClass} />,
    <MusicNoteIcon className={iconClass} />,
    <Animation3DIcon className={iconClass} />,
    <PictureFrameIcon className={iconClass} />,
    <VideoCameraIcon className={iconClass} />,
    <DataIntelligenceIcon className={iconClass} />
  ];
  return fallbackIcons[index % fallbackIcons.length];
};

const ExploreCategories = () => {
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-explore'],
    queryFn: () => adminAxios.get('/categories').then(({ data }: any) => data)
  });

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
    <section className="w-full pb-12 sm:pb-16 md:pb-24 bg-[#fafafa]">
      <div className="w-full container mx-auto px-4 md:px-6">
        {/* Centered Heading and Subtitle */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="font-sf-pro font-[510] text-[32px] sm:text-[38px] md:text-[48px] text-[#292929] leading-normal tracking-normal">
            Explore Top Categories
          </h2>
          <p className="font-inter font-normal text-base sm:text-[15px] text-[#6E6E6E] mt-2.5">
            Explore a wide range of services organized by category
          </p>
        </div>

        {/* Categories Grid with Clean Internal Dividers */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {categoryList.map((category: any, index: number) => {
            const title =
              category.name ||
              category.title ||
              category.slug ||
              "Category";

            const path =
              category.slug ||
              title.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

            // Responsive border dividers
            const isRightBorderMobile = index % 2 === 0;
            const isRightBorderDesktop = (index + 1) % 4 !== 0;
            const isBottomBorderMobile = index < categoryList.length - (categoryList.length % 2 === 0 ? 2 : 1);
            const isBottomBorderDesktop = index < categoryList.length - (categoryList.length % 4 === 0 ? 4 : categoryList.length % 4);

            return (
              <Link
                href={`/packages?category=${encodeURIComponent(path)}`}
                key={category._id || category.id || index}
                className={`group flex flex-col items-center justify-center text-center p-8 sm:p-10 lg:p-14 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer ${isRightBorderMobile ? "border-r border-gray-100" : ""
                  } ${isRightBorderDesktop ? "md:border-r md:border-gray-100" : "md:border-r-0"
                  } ${isBottomBorderMobile ? "border-b border-gray-100" : ""
                  } ${isBottomBorderDesktop ? "md:border-b md:border-gray-100" : "md:border-b-0"
                  }`}
              >
                {/* Circular Icon Bubble */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffffff] flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:bg-emerald-50/80 transition-all duration-300 shrink-0">
                  {getMatchedIcon(category, index, "w-6 h-6 sm:w-7 sm:h-7 text-[#222427] group-hover:text-brand-green transition-colors duration-300")}
                </div>

                {/* Category Title */}
                <h3 className="font-sf-pro font-semibold text-[16px] sm:text-[17px] md:text-[18px] text-[#222427] leading-snug group-hover:text-brand-green transition-colors duration-300 max-w-[180px]">
                  {title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreCategories;
