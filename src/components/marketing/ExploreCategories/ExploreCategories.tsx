"use client";

import React from 'react';
import Link from 'next/link';
import { icons, LucideIcon } from 'lucide-react';
import useAdminCategories from '@/hooks/useAdminCategories';

// Common aliases mapping backend terms to Lucide icon names
const ICON_ALIASES: Record<string, string> = {
  bullhorn: 'Megaphone',
  'file-text': 'FileText',
  filetext: 'FileText',
};

// Converts 'file-text' or 'palette' into PascalCase ('FileText', 'Palette')
const toPascalCase = (str: string): string =>
  str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase());

const getCategoryIconComponent = (icon?: string): LucideIcon | null => {
  if (!icon) return null;
  const raw = icon.trim();

  // 1. Check known aliases (e.g. 'bullhorn' -> 'Megaphone')
  const aliasName = ICON_ALIASES[raw.toLowerCase()];
  if (aliasName && icons[aliasName as keyof typeof icons]) {
    return icons[aliasName as keyof typeof icons];
  }

  // 2. Direct check with PascalCase (e.g. 'Brain', 'ShoppingCart', 'Video', 'FileText')
  const pascalName = toPascalCase(raw);
  if (icons[pascalName as keyof typeof icons]) {
    return icons[pascalName as keyof typeof icons];
  }

  // 3. Fallback normalized search across all available Lucide icons
  const normalized = raw.replace(/[-_\s]/g, '').toLowerCase();
  const matchedKey = Object.keys(icons).find(
    (k) => k.toLowerCase() === normalized
  );
  if (matchedKey && icons[matchedKey as keyof typeof icons]) {
    return icons[matchedKey as keyof typeof icons];
  }

  return null;
};

const renderCategoryIcon = (icon?: string, className: string = "w-6 h-6 sm:w-7 sm:h-7") => {
  if (!icon) return null;

  // Supports remote or local image URLs
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.startsWith('data:')) {
    return <img src={icon} alt="Category Icon" className={`${className} object-contain`} />;
  }

  const IconComp = getCategoryIconComponent(icon);
  if (IconComp) {
    return <IconComp className={className} strokeWidth={1.75} />;
  }

  return null;
};

const ExploreCategories = () => {
  const { categoryList: rawList } = useAdminCategories();

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
        <div className="w-full  mx-auto grid grid-cols-2 md:grid-cols-4">
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
                className={`group flex flex-col items-center justify-center text-center p-8 sm:p-10 lg:p-14 hover:bg-white transition-all duration-200 cursor-pointer ${isRightBorderMobile ? "border-r border-gray-100" : ""
                  } ${isRightBorderDesktop ? "md:border-r md:border-gray-100" : "md:border-r-0"
                  } ${isBottomBorderMobile ? "border-b border-gray-100" : ""
                  } ${isBottomBorderDesktop ? "md:border-b md:border-gray-100" : "md:border-b-0"
                  }`}
              >
                {/* Circular Icon Bubble */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffffff] flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:bg-emerald-50/80 transition-all duration-300 shrink-0">
                  {renderCategoryIcon(category.icon, "w-6 h-6 sm:w-7 sm:h-7 text-[#222427] group-hover:text-brand-green transition-colors duration-300")}
                </div>

                {/* Category Title */}
                <h3 className="font-sf-pro font-bold text-[16px] sm:text-[17px] md:text-[24px] text-[#434343] leading-normal group-hover:text-brand-green  transition-colors duration-300">
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
