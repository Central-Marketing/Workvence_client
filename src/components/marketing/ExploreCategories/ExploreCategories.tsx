"use client";

import Link from 'next/link';
import {
  MonitorCheck,
  Megaphone,
  PenTool,
  Clapperboard,
  Box,
  Scissors,
  Code2,
  Database,
  Briefcase
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';
import { CategoryIcon } from '@/components';

// Helper to assign a fallback icon based on index or category name
const getIcon = (index: number, className: string = "text-gray-700 w-10 h-10 md:w-12 md:h-12") => {
  const icons = [
    <MonitorCheck className={className} strokeWidth={1.5} />,
    <Megaphone className={className} strokeWidth={1.5} />,
    <PenTool className={className} strokeWidth={1.5} />,
    <Clapperboard className={className} strokeWidth={1.5} />,
    <Box className={className} strokeWidth={1.5} />,
    <Scissors className={className} strokeWidth={1.5} />,
    <Code2 className={className} strokeWidth={1.5} />,
    <Database className={className} strokeWidth={1.5} />,
    <Briefcase className={className} strokeWidth={1.5} />
  ];
  return icons[index % icons.length];
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
    <section className="w-full py-10 md:py-20 bg-white">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-bold md:font-semibold text-gray-800 md:text-gray-600 mb-1">Explore Top Categories</h2>
          <p className="text-gray-500 text-sm md:text-md">Explore a wide range of services organized by category</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-6 md:gap-6">
          {categoryList.map((category: any, index: number) => {
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
                href={`/packages?category=${path}`}
                key={category._id || category.id || index}
                className="flex w-full max-w-[140px] flex-col items-center group"
              >
                <div className="w-[110px] h-[110px] sm:w-[110px] sm:h-[110px] md:w-[140px] md:h-[140px] flex items-center justify-center bg-white bg-gradient-to-t from-gray-50 to-transparent border border-gray-100 md:border-gray-200 rounded-[1.25rem] md:rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] md:shadow-sm mb-3 group-hover:border-gray-300 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 p-4">
                  <CategoryIcon
                    iconName={category.icon}
                    iconType={category.iconType}
                    iconUrl={category.icon}
                    className="text-gray-700 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14"
                    alt=""
                    fallbackIcon={getIcon(
                      index,
                      "text-gray-700 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14"
                    )}
                  />
                </div>

                <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-gray-800 text-center leading-[1.2] group-hover:text-brand-green transition-colors duration-300 max-w-[100px] sm:max-w-[110px] md:max-w-full">
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
