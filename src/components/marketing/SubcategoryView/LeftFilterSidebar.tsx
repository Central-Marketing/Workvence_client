"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiRotateCcw, FiChevronDown, FiCheck } from "react-icons/fi";
import useDebounce from "@/hooks/useDebounce";
import { Button } from "@/components/ui";

export interface LeftFilterSidebarProps {
  searchVal: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit?: () => void;

  categories: { name: string; slug: string }[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;

  sellerLevels?: { [key: string]: boolean };
  onSellerLevelToggle?: (levelKey: string) => void;

  deliveryDays: string;
  onDeliveryDaysChange: (days: string) => void;

  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;

  onReset: () => void;
  className?: string;
  hideHeader?: boolean;
}

export const LeftFilterSidebar: React.FC<LeftFilterSidebarProps> = ({
  searchVal,
  onSearchChange,
  onSearchSubmit,
  categories = [],
  selectedCategory,
  onCategoryChange,
  sellerLevels,
  onSellerLevelToggle,
  deliveryDays,
  onDeliveryDaysChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  className = "",
  hideHeader = false,
}) => {
  // Local state for smooth real-time slider and input responsiveness
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // Category custom dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync with incoming props (e.g. on reset or URL query change)
  useEffect(() => {
    setLocalMin(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMax(maxPrice);
  }, [maxPrice]);

  // Debounce price changes to prevent excessive re-renders, URL pushes, and API request floods
  const debouncedMin = useDebounce(localMin, 400);
  const debouncedMax = useDebounce(localMax, 400);

  useEffect(() => {
    if (debouncedMin !== minPrice) {
      onMinPriceChange(debouncedMin);
    }
  }, [debouncedMin, minPrice, onMinPriceChange]);

  useEffect(() => {
    if (debouncedMax !== maxPrice) {
      onMaxPriceChange(debouncedMax);
    }
  }, [debouncedMax, maxPrice, onMaxPriceChange]);

  const currentMin = parseInt(localMin || "100", 10);
  const currentMax = parseInt(localMax || "1000", 10);

  // Range Slider boundaries
  const sliderMin = 0;
  const sliderMax = 2000;
  const minPercent = Math.min(100, Math.max(0, ((currentMin - sliderMin) / (sliderMax - sliderMin)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((currentMax - sliderMin) / (sliderMax - sliderMin)) * 100));
  const clampMinPercent = Math.max(8, Math.min(92, minPercent));
  const clampMaxPercent = Math.max(8, Math.min(92, maxPercent));

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val <= currentMax) {
      setLocalMin(String(val));
    }
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= currentMin) {
      setLocalMax(String(val));
    }
  };

  return (
    <aside className={`w-full bg-white lg:bg-transparent rounded-[6px] lg:rounded-none p-5 lg:p-0 space-y-6 ${className}`}>
      {/* 1. Header: Filter Title + Reset Button */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Filter</h3>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onReset}
            leftIcon={<FiRotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" />}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors p-0 h-auto hover:bg-transparent"
          >
            <span>Reset</span>
          </Button>
        </div>
      )}

      {/* 2. Search Input */}
      <div>
        <div className="relative flex items-center bg-[#F6F7F9] border border-[#0000001A] focus-within:border-gray-200 focus-within:bg-white rounded-[6px] px-3.5 py-2.5 transition-all group">
          <FiSearch className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-gray-700 shrink-0" />
          <input
            type="text"
            placeholder="What you are looking for"
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.()}
            className="w-full bg-transparent text-[13px] font-medium text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      {/* 3. Category Dropdown */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-1.5">Category</label>
        <div className="relative w-full" ref={categoryDropdownRef}>
          {(() => {
            const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);
            return (
              <>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-200 rounded-[6px] text-[13px] font-medium transition-colors hover:border-gray-300 focus:outline-none focus:border-brand-green cursor-pointer"
                >
                  <span className={`truncate ${selectedCategoryObj ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                    {selectedCategoryObj ? selectedCategoryObj.name : "Select Category"}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${categoryDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 w-full bg-white rounded-[6px] shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Categories
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {/* All Categories / Clear selection */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        radius="none"
                        fullWidth
                        onClick={() => {
                          onCategoryChange("");
                          setCategoryDropdownOpen(false);
                        }}
                        rightIcon={!selectedCategory ? <FiCheck className="w-4 h-4 text-teal-600 shrink-0 ml-2" /> : undefined}
                        className={`w-full text-left justify-between px-3.5 py-2.5 text-sm transition-colors border-none shadow-none h-auto min-h-0 cursor-pointer ${!selectedCategory
                          ? "bg-teal-50/70 text-teal-800 font-semibold hover:bg-teal-50"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span className="truncate">All Categories</span>
                      </Button>

                      {categories.map((cat) => {
                        const isSelected = cat.slug === selectedCategory;
                        return (
                          <Button
                            key={cat.slug}
                            type="button"
                            variant="ghost"
                            size="sm"
                            radius="none"
                            fullWidth
                            onClick={() => {
                              onCategoryChange(cat.slug);
                              setCategoryDropdownOpen(false);
                            }}
                            rightIcon={isSelected ? <FiCheck className="w-4 h-4 text-teal-600 shrink-0 ml-2" /> : undefined}
                            className={`w-full text-left justify-between px-3.5 py-2.5 text-sm transition-colors border-none shadow-none h-auto min-h-0 cursor-pointer ${isSelected
                              ? "bg-teal-50/70 text-teal-800 font-semibold hover:bg-teal-50"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <span className="truncate">{cat.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* 4. Seller Level Checkboxes */}
      {sellerLevels && onSellerLevelToggle && (
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2.5">Seller Level</label>
          <div className="space-y-2.5">
            {[
              { key: "top_rated", label: "Top Rated" },
              { key: "level_two", label: "Level 2" },
              { key: "level_one", label: "Level 1" },
              { key: "new_seller", label: "New Seller" },
            ].map(({ key, label }) => {
              const isChecked = Boolean(sellerLevels[key]);
              return (
                <label
                  key={key}
                  className="flex items-center gap-2.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onSellerLevelToggle(key)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Delivery Time Radio Buttons */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2.5">Delivery Time</label>
        <div className="space-y-2">
          {[
            { value: "", label: "Any Time" },
            { value: "1", label: "24 Hours (Express)" },
            { value: "3", label: "Up to 3 Days" },
            { value: "7", label: "Up to 7 Days" },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="deliveryTime"
                value={value}
                checked={deliveryDays === value}
                onChange={() => onDeliveryDaysChange(value)}
                className="w-4 h-4 text-black focus:ring-black accent-black cursor-pointer"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 6. Filter by Fixed Price (Dual Slider & Inputs) */}
      <div className="w-full">
        <label className="block text-sm font-bold text-[#2D3139] mb-1">Filter by Fixed Price</label>

        {/* Floating Range Badges & Dual Track */}
        <div className="relative w-full pt-8 pb-3 mb-4 select-none">
          {/* Min Badge Tooltip */}
          <div
            className="absolute top-0 -translate-x-1/2 bg-white border border-[#E5E7EB] text-[13px] font-semibold text-[#18181B] px-2.5 py-1 rounded-[6px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] select-none pointer-events-none z-20 flex items-center justify-center transition-[left] duration-75"
            style={{ left: `${clampMinPercent}%` }}
          >
            <span>${currentMin}</span>
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-[#E5E7EB]" />
          </div>

          {/* Max Badge Tooltip */}
          <div
            className="absolute top-0 -translate-x-1/2 bg-white border border-[#E5E7EB] text-[13px] font-semibold text-[#18181B] px-2.5 py-1 rounded-[6px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] select-none pointer-events-none z-20 flex items-center justify-center transition-[left] duration-75"
            style={{ left: `${clampMaxPercent}%` }}
          >
            <span>${currentMax}</span>
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-[#E5E7EB]" />
          </div>

          {/* Visual Track */}
          <div className="h-[3.5px] bg-[#E5E7EB] rounded-full relative w-full my-2">
            <div
              className="absolute h-full bg-[#18181B] rounded-full"
              style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}
            />
            <div
              className="w-5 h-5 rounded-full bg-white border-[2.5px] border-[#18181B] shadow-[0_1px_3px_rgba(0,0,0,0.15)] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10"
              style={{ left: `${minPercent}%` }}
            />
            <div
              className="w-5 h-5 rounded-full bg-white border-[2.5px] border-[#18181B] shadow-[0_1px_3px_rgba(0,0,0,0.15)] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10"
              style={{ left: `${maxPercent}%` }}
            />
          </div>

          {/* Hidden Interactive Dual Sliders */}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={currentMin}
            onChange={handleMinSliderChange}
            className={`absolute inset-x-0 bottom-1 w-full h-7 opacity-0 cursor-pointer pointer-events-none ${currentMin > sliderMax - 100 ? "z-30" : "z-20"} [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6`}
          />
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={currentMax}
            onChange={handleMaxSliderChange}
            className="absolute inset-x-0 bottom-1 w-full h-7 opacity-0 cursor-pointer pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6"
          />
        </div>

        {/* Min / Max Inputs Box */}
        <div className="flex items-center gap-2">
          {/* Min Input */}
          <div className="flex-1 flex items-center border border-gray-200 rounded-[6px] px-3 py-2 bg-white focus-within:border-gray-900 transition-colors">
            <span className="text-gray-400 text-xs font-semibold mr-1">$</span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              placeholder="100"
              className="w-full text-xs font-bold text-gray-900 outline-none bg-transparent"
            />
            <span className="text-[11px] font-medium text-gray-400 ml-1">Min</span>
          </div>

          <span className="text-gray-300 font-bold">-</span>

          {/* Max Input */}
          <div className="flex-1 flex items-center border border-gray-200 rounded-[6px] px-3 py-2 bg-white focus-within:border-gray-900 transition-colors">
            <span className="text-gray-400 text-xs font-semibold mr-1">$</span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              placeholder="1000"
              className="w-full text-xs font-bold text-gray-900 outline-none bg-transparent"
            />
            <span className="text-[11px] font-medium text-gray-400 ml-1">Max</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftFilterSidebar;
