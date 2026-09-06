"use client";

import React from "react";
import { FiSearch, FiRotateCcw, FiChevronDown } from "react-icons/fi";

export interface LeftFilterSidebarProps {
  searchVal: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit?: () => void;

  categories: { name: string; slug: string }[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;

  experience: { entry: boolean; mid: boolean; senior: boolean };
  onExperienceToggle: (level: "entry" | "mid" | "senior") => void;

  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;

  englishLevel: string;
  onEnglishLevelChange: (val: string) => void;

  clientLocation: string;
  onClientLocationChange: (val: string) => void;

  onReset: () => void;
  className?: string;
}

export const LeftFilterSidebar: React.FC<LeftFilterSidebarProps> = ({
  searchVal,
  onSearchChange,
  onSearchSubmit,
  categories = [],
  selectedCategory,
  onCategoryChange,
  experience,
  onExperienceToggle,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  englishLevel,
  onEnglishLevelChange,
  clientLocation,
  onClientLocationChange,
  onReset,
  className = "",
}) => {
  const currentMin = parseInt(minPrice || "100", 10);
  const currentMax = parseInt(maxPrice || "1000", 10);

  // Range Slider boundaries
  const sliderMin = 0;
  const sliderMax = 2500;
  const minPercent = Math.min(100, Math.max(0, ((currentMin - sliderMin) / (sliderMax - sliderMin)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((currentMax - sliderMin) / (sliderMax - sliderMin)) * 100));

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val <= currentMax) {
      onMinPriceChange(String(val));
    }
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= currentMin) {
      onMaxPriceChange(String(val));
    }
  };

  return (
    <aside className={`w-full bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-5 lg:p-0 space-y-6 ${className}`}>
      {/* 1. Header: Filter Title + Reset Button */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Filter</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FiRotateCcw className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
          <span>Reset</span>
        </button>
      </div>

      {/* 2. Search Input */}
      <div>
        <div className="relative flex items-center bg-[#F6F7F9] border border-transparent focus-within:border-gray-200 focus-within:bg-white rounded-xl px-3.5 py-2.5 transition-all group">
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
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-9 text-[13px] text-gray-700 font-medium focus:outline-none focus:border-gray-900 cursor-pointer transition-colors"
          >
            <option value="">Seller Category</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Experience Level Checkboxes */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2.5">Experience Level</label>
        <div className="space-y-2.5">
          {[
            { key: "entry", label: "Entry Level" },
            { key: "mid", label: "Mid Level" },
            { key: "senior", label: "Senior Level" },
          ].map(({ key, label }) => {
            const isChecked = experience[key as keyof typeof experience];
            return (
              <label
                key={key}
                className="flex items-center gap-2.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onExperienceToggle(key as "entry" | "mid" | "senior")}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Filter by Fixed Price (Dual Slider & Inputs) */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-3">Filter by Fixed Price</label>

        {/* Floating Range Badges & Dual Track */}
        <div className="relative px-2 pt-6 pb-2 mb-4">
          {/* Min Badge Tooltip */}
          <div
            className="absolute top-0 -translate-x-1/2 bg-gray-100 border border-gray-200 text-[10.5px] font-bold text-gray-800 px-2 py-0.5 rounded shadow-2xs select-none"
            style={{ left: `${minPercent}%` }}
          >
            ${currentMin}
          </div>

          {/* Max Badge Tooltip */}
          <div
            className="absolute top-0 -translate-x-1/2 bg-gray-100 border border-gray-200 text-[10.5px] font-bold text-gray-800 px-2 py-0.5 rounded shadow-2xs select-none"
            style={{ left: `${maxPercent}%` }}
          >
            ${currentMax}
          </div>

          {/* Visual Track */}
          <div className="h-1.5 bg-gray-200 rounded-full relative">
            <div
              className="absolute h-full bg-gray-900 rounded-full"
              style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}
            />
            {/* Visual Thumbs */}
            <div
              className="w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-900 shadow absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
              style={{ left: `${minPercent}%` }}
            />
            <div
              className="w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-900 shadow absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
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
            className="absolute inset-x-2 top-6 w-full opacity-0 cursor-pointer h-4 pointer-events-auto"
          />
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={currentMax}
            onChange={handleMaxSliderChange}
            className="absolute inset-x-2 top-6 w-full opacity-0 cursor-pointer h-4 pointer-events-auto"
          />
        </div>

        {/* Min / Max Inputs Box */}
        <div className="flex items-center gap-2">
          {/* Min Input */}
          <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-gray-900 transition-colors">
            <span className="text-gray-400 text-xs font-semibold mr-1">$</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="100"
              className="w-full text-xs font-bold text-gray-900 outline-none bg-transparent"
            />
            <span className="text-[11px] font-medium text-gray-400 ml-1">Min</span>
          </div>

          <span className="text-gray-300 font-bold">-</span>

          {/* Max Input */}
          <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-gray-900 transition-colors">
            <span className="text-gray-400 text-xs font-semibold mr-1">$</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="1000"
              className="w-full text-xs font-bold text-gray-900 outline-none bg-transparent"
            />
            <span className="text-[11px] font-medium text-gray-400 ml-1">Max</span>
          </div>
        </div>
      </div>

      {/* 6. English Level Dropdown */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-1.5">English Level</label>
        <div className="relative">
          <select
            value={englishLevel}
            onChange={(e) => onEnglishLevelChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-9 text-[13px] text-gray-700 font-medium focus:outline-none focus:border-gray-900 cursor-pointer transition-colors"
          >
            <option value="">Select english level</option>
            <option value="basic">Basic Level</option>
            <option value="conversational">Conversational Level</option>
            <option value="fluent">Fluent Level</option>
            <option value="native">Native / Bilingual</option>
          </select>
          <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 7. Client Location Dropdown */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-1.5">Client Location</label>
        <div className="relative">
          <select
            value={clientLocation}
            onChange={(e) => onClientLocationChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-9 text-[13px] text-gray-700 font-medium focus:outline-none focus:border-gray-900 cursor-pointer transition-colors"
          >
            <option value="">Select client location</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Worldwide">Worldwide</option>
          </select>
          <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </aside>
  );
};

export default LeftFilterSidebar;
