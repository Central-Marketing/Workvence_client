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
import { axiosFetch } from '@/utils';
import adminAxios from '@/utils/adminAxios';

// Helper to assign a fallback icon based on index or category name
const getIcon = (index: number) => {
  const icons = [
    <MonitorCheck className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Megaphone className="text-gray-700" size={32} strokeWidth={1.5} />,
    <PenTool className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Clapperboard className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Box className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Scissors className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Code2 className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Database className="text-gray-700" size={32} strokeWidth={1.5} />,
    <Briefcase className="text-gray-700" size={32} strokeWidth={1.5} />
  ];
  return icons[index % icons.length];
};

const ExploreCategories = () => {
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-explore'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data)
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
    ? fetchedCategories.data
    : fetchedCategories?.categories || [];

  return (
    <section className="w-full py-16 md:py-20 bg-white">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-600 mb-2">Explore Top Categories</h2>
          <p className="text-gray-500 text-lg">Explore a wide range of services organized by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categoryList.map((category: any, index: number) => {
            const title = category.name || category.title || category.slug || "Category";
            const path = category.slug || title.toLowerCase().replace(/\s+/g, '-');
            const iconUrl = category.icon || category.image || category.img;
            
            return (
              <Link
                href={`/packages?category=${path}`}
                key={category._id || category.id || index}
                className="flex flex-col p-4 md:p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 group"
              >
                <div className="mb-4 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-brand-green/10 transition-colors duration-300 overflow-hidden">
                    {iconUrl ? (
                      <img src={iconUrl} alt={title} className="w-7 h-7 object-contain" />
                    ) : (
                      getIcon(index)
                    )}
                  </div>
                </div>
                <h3 className="text-[15px] sm:text-lg md:text-xl font-semibold text-gray-800 leading-tight group-hover:text-brand-green transition-colors duration-300 capitalize">
                  {title.split(' & ').map((part: string, i: number, arr: any[]) => (
                    <span key={i}>
                      {part}
                      {i !== arr.length - 1 && <>&nbsp;&&nbsp;<br className="hidden md:block" /></>}
                    </span>
                  ))}
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
