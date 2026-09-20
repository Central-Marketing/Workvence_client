"use client";

import React from 'react';
import Link from 'next/link';
import {
  Palette,
  Megaphone,
  Pencil,
  Music,
  Box,
  Film,
  Video,
  Database,
  Code,
  Briefcase,
  Layers,
  Cpu,
  icons,
  LucideIcon,
} from 'lucide-react';
import useAdminCategories from '@/hooks/useAdminCategories';

// Fallback categories matching design screenshot
const FALLBACK_CATEGORIES = [
  { name: 'Graphic & Design', slug: 'graphics-and-design', icon: 'palette' },
  { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'megaphone' },
  { name: 'Writing & Translation', slug: 'writing-and-translation', icon: 'pencil' },
  { name: 'Music Production', slug: 'music-and-audio', icon: 'music' },
  { name: 'Animation & 3D', slug: 'animation-and-3d', icon: 'box' },
  { name: 'Videos & Editing', slug: 'videos-and-editing', icon: 'film' },
  { name: 'Videos & Animation', slug: 'video-and-animation', icon: 'video' },
  { name: 'Data & Intelligence', slug: 'data', icon: 'database' },
];

// Common aliases mapping backend terms to Lucide icon names
const ICON_ALIASES: Record<string, string> = {
  bullhorn: 'Megaphone',
  'file-text': 'FileText',
  filetext: 'FileText',
  music: 'Music',
  palette: 'Palette',
  pencil: 'Pencil',
  database: 'Database',
  video: 'Video',
  film: 'Film',
  box: 'Box',
};

// Converts 'file-text' or 'palette' into PascalCase ('FileText', 'Palette')
const toPascalCase = (str: string): string =>
  str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase());

const getCategoryIconComponent = (icon?: string, name?: string): LucideIcon => {
  const iconStr = (icon || '').trim();
  const nameStr = (name || '').toLowerCase();

  // 1. Direct Lucide icon check
  if (iconStr) {
    const aliasName = ICON_ALIASES[iconStr.toLowerCase()];
    if (aliasName && icons[aliasName as keyof typeof icons]) {
      return icons[aliasName as keyof typeof icons];
    }

    const pascalName = toPascalCase(iconStr);
    if (icons[pascalName as keyof typeof icons]) {
      return icons[pascalName as keyof typeof icons];
    }

    const normalized = iconStr.replace(/[-_\s]/g, '').toLowerCase();
    const matchedKey = Object.keys(icons).find(
      (k) => k.toLowerCase() === normalized
    );
    if (matchedKey && icons[matchedKey as keyof typeof icons]) {
      return icons[matchedKey as keyof typeof icons];
    }
  }

  // 2. Intelligent keyword fallback based on category name
  if (nameStr.includes('graphic') || nameStr.includes('design')) return Palette;
  if (nameStr.includes('market') || nameStr.includes('digital') || nameStr.includes('seo')) return Megaphone;
  if (nameStr.includes('writ') || nameStr.includes('translat')) return Pencil;
  if (nameStr.includes('music') || nameStr.includes('audio') || nameStr.includes('sound')) return Music;
  if (nameStr.includes('3d') || nameStr.includes('model')) return Box;
  if (nameStr.includes('edit')) return Film;
  if (nameStr.includes('video') || nameStr.includes('animat')) return Video;
  if (nameStr.includes('data') || nameStr.includes('intelligence') || nameStr.includes('analytic')) return Database;
  if (nameStr.includes('code') || nameStr.includes('program') || nameStr.includes('tech') || nameStr.includes('dev')) return Code;
  if (nameStr.includes('business') || nameStr.includes('consult')) return Briefcase;
  if (nameStr.includes('ai')) return Cpu;

  return Layers;
};

const renderCategoryIcon = (icon?: string, name?: string, className: string = "w-5 h-5") => {
  // Supports remote or local image URLs
  if (icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.startsWith('data:'))) {
    return <img src={icon} alt={name || "Category Icon"} className={`${className} object-contain`} />;
  }

  const IconComp = getCategoryIconComponent(icon, name);
  return <IconComp className={className} strokeWidth={1.75} />;
};

const ExploreCategories = () => {
  const { categoryList: rawList } = useAdminCategories();

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

  const dynamicCategories = [...regularCats, ...otherCats];
  const displayCategories = dynamicCategories.length > 0 ? dynamicCategories.slice(0, 8) : FALLBACK_CATEGORIES;

  return (
    <section className="relative w-full pb-12 sm:pb-16 md:pb-24 pt-8 sm:pt-12 md:pt-14 lg:pt-16 bg-[#fafafa] overflow-hidden">
      {/* Centered Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[808px] h-[808px] rounded-[608px] pointer-events-none"
        style={{
          background: "#E8F5F5",
          filter: "blur(250px)",
          mixBlendMode: "multiply",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full container mx-auto px-4 md:px-6">
        {/* Centered Heading and Subtitle */}
        <div className="text-center mb-10 sm:mb-12 md:mb-14">
          <h2 className="font-sf-pro font-[510] text-[32px] sm:text-[38px] md:text-[48px] text-[#292929] leading-normal tracking-normal">
            Explore Top Categories
          </h2>
          <p className="font-inter font-normal text-base sm:text-[15px] text-[#6E6E6E] mt-2">
            Explore a wide range of services organized by category
          </p>
        </div>

        {/* Categories Single Row Layout */}
        <div className="w-full flex items-stretch gap-3 sm:gap-3.5 lg:gap-4 overflow-x-auto scrollbar-none pb-3 pt-1 lg:overflow-x-visible">
          {displayCategories.map((category: any, index: number) => {
            const title =
              category.name ||
              category.title ||
              category.slug ||
              "Category";

            const path =
              category.slug ||
              title.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

            return (
              <Link
                href={`/packages?category=${encodeURIComponent(path)}`}
                key={category._id || category.id || index}
                className="group flex-1 min-w-[130px] sm:min-w-[145px] lg:min-w-0 bg-white hover:bg-[#004316] border border-gray-100 hover:border-brand-green rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[140px] sm:min-h-[150px]"
              >
                {/* Icon Container: Inverts from #F5F5F7 to white on card hover */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 shrink-0">
                  {renderCategoryIcon(
                    category.icon,
                    title,
                    "w-5 h-5 text-[#222427] group-hover:text-brand-green transition-colors duration-300"
                  )}
                </div>

                {/* Category Title: Turns white on card hover */}
                <h3 className="font-sf-pro font-bold text-[13px] sm:text-[14px] lg:text-[15px] text-[#292929] group-hover:text-white leading-[1.25] transition-colors duration-300 text-left line-clamp-2">
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
