"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CategoryBarProps {
  visible: boolean;
}

const CategoryBarContent: React.FC<CategoryBarProps> = ({ visible }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get('category') || '';

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch categories from backend API
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-categorybar'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data).catch(() => [])
  });

  const rawCats = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const categoryList = rawCats.map((cat: any) => {
    if (typeof cat === 'string') {
      const slug = cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return { name: cat, slug };
    }
    return {
      name: cat.name || cat.title || String(cat),
      slug: cat.slug || (cat.name || cat.title || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };
  });

  const checkScrollButtons = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [categoryList]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 350);
    }
  };

  return (
    <div
      className={`w-full border-t border-gray-100 bg-white/98 backdrop-blur-md transition-all duration-300 overflow-hidden ${
        visible ? 'max-h-16 opacity-100 visible' : 'max-h-0 opacity-0 invisible pointer-events-none'
      }`}
    >
      <div className="w-full container mx-auto px-4 md:px-6 flex items-center justify-between gap-2.5 py-2.5 relative">
        
        {/* Left Scroll Arrow Button */}
        <div className={`transition-opacity duration-200 shrink-0 ${canScrollLeft ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none w-0'}`}>
          <button
            onClick={() => scrollCategories('left')}
            aria-label="Scroll categories left"
            className="w-7 h-7 rounded-full bg-[#F4F4F6] hover:bg-[#EAEAEF] text-[#327C73] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <FiChevronLeft size={16} />
          </button>
        </div>

        {/* Scrollable Category Pills Track */}
        <div
          ref={categoryScrollRef}
          onScroll={checkScrollButtons}
          className="flex items-center gap-2.5 overflow-x-auto scrollbar-none scroll-smooth flex-1 py-0.5"
        >
          {/* All Services Pill */}
          <Link
            href="/packages"
            className={`px-4 py-1.5 rounded-full font-sf-pro font-medium text-[13px] sm:text-[14px] whitespace-nowrap transition-colors shrink-0 ${
              pathname === '/packages' && !currentCategory
                ? 'border border-[#327C73] bg-[#E8F8F5] text-[#1E293B]'
                : 'bg-[#F4F4F6] text-[#4A4A4A] hover:bg-[#EAEAEF] hover:text-[#111111]'
            }`}
          >
            All Services
          </Link>

          {/* Dynamic Category Pills */}
          {categoryList.map((cat: any) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/packages?category=${encodeURIComponent(cat.slug)}`}
                className={`px-4 py-1.5 rounded-full font-sf-pro font-medium text-[13px] sm:text-[14px] whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'border border-[#327C73] bg-[#E8F8F5] text-[#1E293B]'
                    : 'bg-[#F4F4F6] text-[#4A4A4A] hover:bg-[#EAEAEF] hover:text-[#111111]'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Arrow Button */}
        <div className={`transition-opacity duration-200 shrink-0 ${canScrollRight ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none w-0'}`}>
          <button
            onClick={() => scrollCategories('right')}
            aria-label="Scroll categories right"
            className="w-7 h-7 rounded-full bg-[#F4F4F6] hover:bg-[#EAEAEF] text-[#327C73] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <FiChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

const CategoryBar: React.FC<CategoryBarProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <CategoryBarContent {...props} />
    </Suspense>
  );
};

export default CategoryBar;
