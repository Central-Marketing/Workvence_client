"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { SubcategoryItem } from "@/data/categoryTaxonomy";
import { Breadcrumb, Button } from "@/components/ui";

export interface BreadcrumbCrumb {
  name: string;
  slug?: string;
  isRoot?: boolean;
}

interface SubcategoryHeaderProps {
  categoryName: string;
  categorySlug: string;
  subcategories?: SubcategoryItem[];
  activeSubcategory: SubcategoryItem;
  breadcrumbTrail?: BreadcrumbCrumb[];
  onSelectCategory: () => void;
  onSelectSubcategory: (subcat: SubcategoryItem) => void;
  onNavigateBreadcrumb?: (crumb: BreadcrumbCrumb) => void;
}

const SubcategoryHeader: React.FC<SubcategoryHeaderProps> = ({
  categoryName,
  categorySlug: _categorySlug,
  subcategories = [],
  activeSubcategory,
  breadcrumbTrail,
  onSelectCategory,
  onSelectSubcategory,
  onNavigateBreadcrumb,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalize trail items into a uniform list
  const breadcrumbItems =
    breadcrumbTrail && breadcrumbTrail.length > 0
      ? breadcrumbTrail.map((crumb, idx) => ({
        name: crumb.name,
        onClick: () =>
          onNavigateBreadcrumb ? onNavigateBreadcrumb(crumb) : onSelectCategory(),
        isLast: idx === breadcrumbTrail.length - 1,
      }))
      : [
        ...(categoryName
          ? [
            {
              name: categoryName,
              onClick: onSelectCategory,
              isLast: !activeSubcategory,
            },
          ]
          : []),
        ...(activeSubcategory
          ? [
            {
              name: activeSubcategory.title,
              isLast: true,
            },
          ]
          : []),
      ];

  return (
    <div className="w-full mb-6">
      {/* Semantic Breadcrumb Navigation */}
      <Breadcrumb
        onHomeClick={onSelectCategory}
        homeTitle="All services"
        items={breadcrumbItems}
      />

      {/* Main Subcategory Title + Chevron Dropdown */}
      <div className="relative inline-block" ref={dropdownRef}>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeSubcategory.title}
          </h1>

          {/* Circular Down Chevron Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Switch Subcategory"
            aria-expanded={dropdownOpen}
            className="w-7 h-7 aspect-square border border-[rgba(0,0,0,0.10)] bg-[var(--Foundation-White-white-50,#FFF)] hover:bg-gray-50 shadow-xs active:scale-95 shrink-0 p-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                }`}
            >
              <path
                d="M12 6.00003C12 6.00003 9.05407 10 8 10C6.94587 10 4 6 4 6"
                stroke="#126D6B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>

        {/* Subcategories Dropdown Menu */}
        {dropdownOpen && subcategories.length > 0 && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-[6px] shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {categoryName} Subcategories
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {subcategories.map((subcat) => {
                const isSelected = subcat.id === activeSubcategory.id;
                return (
                  <Button
                    key={subcat.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    radius="none"
                    fullWidth
                    onClick={() => {
                      onSelectSubcategory(subcat);
                      setDropdownOpen(false);
                    }}
                    rightIcon={
                      isSelected ? (
                        <FiCheck className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
                      ) : undefined
                    }
                    className={`w-full text-left justify-between px-3.5 py-2.5 text-sm transition-colors border-none shadow-none h-auto min-h-0 ${isSelected
                        ? "bg-teal-50/70 text-teal-800 font-semibold hover:bg-teal-50"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span className="truncate">{subcat.title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Subcategory Description */}
      {activeSubcategory.subtitle && (
        <p className="mt-2 text-[14px] sm:text-[15px] text-[#6B7280] font-normal leading-relaxed max-w-2xl">
          {activeSubcategory.subtitle}
        </p>
      )}
    </div>
  );
};

export default SubcategoryHeader;