"use client";

import React from "react";
import { CategoryTaxonomy } from "@/data/categoryTaxonomy";
import SubcategoryCard from "./SubcategoryCard";
import CategoryHeroBanner from "./CategoryHeroBanner";
import { FiGrid, FiArrowRight } from "react-icons/fi";

interface CategoryHubViewProps {
  taxonomy: CategoryTaxonomy;
  totalGigsCount?: number;
  onSelectService: (serviceName: string) => void;
  onViewAllGigs: () => void;
}

const CategoryHubView: React.FC<CategoryHubViewProps> = ({
  taxonomy,
  totalGigsCount = 0,
  onSelectService,
  onViewAllGigs,
}) => {
  return (
    <div className="w-full bg-[#fdfdfd] pb-16 animate-fadeIn">
      {/* 1. Hero Category Banner */}
      <CategoryHeroBanner
        title={taxonomy.heroTitle}
        categoryName={taxonomy.name}
        subtitle={taxonomy.heroSubtitle}
        bannerImage={taxonomy.defaultBanner}
      />

      {/* 2. Subcategories Container */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Section Header with Quick Action to View All Freelancers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Explore {taxonomy.name} Services
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a specialized service category below or browse all available packages
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAllGigs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-800 hover:text-brand-green font-semibold text-sm transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <FiGrid className="w-4 h-4 text-brand-green" />
            <span>Browse All Packages ({totalGigsCount})</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8-Card Grid matching design screenshot */}
        {taxonomy.subcategories && taxonomy.subcategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {taxonomy.subcategories.map((subcat) => (
              <SubcategoryCard
                key={subcat.id}
                title={subcat.title}
                banner={subcat.banner}
                items={subcat.items}
                onSelectService={onSelectService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
            <p className="text-gray-500 mb-4">
              Explore packages for {taxonomy.name}
            </p>
            <button
              onClick={onViewAllGigs}
              className="px-6 py-2.5 bg-brand-green text-white font-semibold rounded-xl text-sm shadow-sm"
            >
              View Available Packages
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHubView;
