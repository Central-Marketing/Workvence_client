"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiHome, FiChevronDown, FiCheck } from "react-icons/fi";
import { SubcategoryItem } from "@/data/categoryTaxonomy";

interface SubcategoryHeaderProps {
  categoryName: string;
  categorySlug: string;
  subcategories?: SubcategoryItem[];
  activeSubcategory: SubcategoryItem;
  onSelectCategory: () => void;
  onSelectSubcategory: (subcat: SubcategoryItem) => void;
}

const SubcategoryHeader: React.FC<SubcategoryHeaderProps> = ({
  categoryName,
  categorySlug,
  subcategories = [],
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
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

  return (
    <div className="w-full mb-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-gray-500 mb-3">
        <button
          type="button"
          onClick={onSelectCategory}
          className="text-teal-600 hover:text-teal-700 transition-colors flex items-center cursor-pointer"
          title="Home"
        >
          <FiHome className="w-4 h-4" />
        </button>

        <span className="text-gray-300">/</span>

        <button
          type="button"
          onClick={onSelectCategory}
          className="text-gray-600 hover:text-gray-900 transition-colors font-normal cursor-pointer"
        >
          {categoryName.replace(" & Design", "") || categoryName}
        </button>

        <span className="text-gray-300">/</span>

        <span className="text-gray-500 font-normal truncate">
          {activeSubcategory.title}
        </span>
      </nav>

      {/* Main Subcategory Title + Chevron Dropdown */}
      <div className="relative inline-block" ref={dropdownRef}>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-[34px] font-bold text-gray-900 tracking-tight leading-tight">
            {activeSubcategory.title}
          </h1>

          {/* Circular Down Chevron Button */}
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Switch Subcategory"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-teal-50/80 border border-teal-200/70 text-teal-600 hover:bg-teal-100 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <FiChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Subcategories Dropdown Menu */}
        {dropdownOpen && subcategories.length > 0 && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {categoryName} Subcategories
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {subcategories.map((subcat) => {
                const isSelected = subcat.id === activeSubcategory.id;
                return (
                  <button
                    key={subcat.id}
                    type="button"
                    onClick={() => {
                      onSelectSubcategory(subcat);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-teal-50/70 text-teal-800 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{subcat.title}</span>
                    {isSelected && <FiCheck className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                  </button>
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
