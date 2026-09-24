"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { RiSearchLine } from 'react-icons/ri';
import { FiFolder, FiArrowRight } from 'react-icons/fi';
import { SuggestionItem } from '@/hooks/useSearchSuggestions';

interface SearchSuggestionsDropdownProps {
  items: SuggestionItem[];
  query: string;
  isOpen: boolean;
  isLoading?: boolean;
  selectedIndex: number;
  onSelect: (item: SuggestionItem | { text: string; type: 'query' }) => void;
  onSeeMore?: (query: string) => void;
  className?: string;
  isNavbar?: boolean;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  items,
  query,
  isOpen,
  isLoading = false,
  selectedIndex,
  onSelect,
  onSeeMore,
  className = '',
  isNavbar = false,
}) => {
  const router = useRouter();

  if (!isOpen || !query.trim()) {
    return null;
  }

  // Show at most 5 suggestions as per requirement
  const displayItems = items.slice(0, 5);

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + q.length);
    const after = text.substring(index + q.length);

    return (
      <>
        {before}
        <span className="font-bold text-[#0D6D5F]">{match}</span>
        {after}
      </>
    );
  };

  const handleSeeMore = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSeeMore) {
      onSeeMore(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const isSeeMoreSelected = selectedIndex === displayItems.length;

  const positionClasses = isNavbar
    ? "fixed inset-x-3.5 top-[calc(var(--navbar-height,60px)+6px)] sm:absolute sm:inset-x-0 sm:top-full sm:mt-2 sm:left-0 sm:right-0 sm:w-full"
    : "absolute top-full left-0 right-0 mt-2";

  return (
    <div
      className={`${positionClasses} bg-white border border-gray-100 rounded-[6px] shadow-xl py-2 z-[70] overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150 ${className}`}
    >
      {/* Suggestions List (maximum 5 items) */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50/60">
        {displayItems.map((item, index) => {
          const isSelected = selectedIndex === index;
          const isCategory = item.type === 'category';

          return (
            <div
              key={`${item.text}-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors group ${
                isSelected ? 'bg-teal-50/70 text-teal-800 font-medium' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isCategory ? (
                  <FiFolder className={`text-base shrink-0 ${isSelected ? 'text-teal-700' : 'text-[#327C73]'}`} />
                ) : (
                  <RiSearchLine className={`text-base shrink-0 ${isSelected ? 'text-teal-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                )}

                <span className="text-[13px] sm:text-[14px] truncate">
                  {highlightMatch(item.text, query)}
                </span>
              </div>

              {isCategory && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-teal-50 text-teal-800 border border-teal-100/80 shrink-0">
                  Category
                </span>
              )}
            </div>
          );
        })}

        {/* Dedicated "See more" action button */}
        {query.trim() && (
          <div className="p-2 border-t border-gray-100 bg-gray-50/60">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSeeMore();
              }}
              className={`w-full py-2.5 px-3 rounded-[6px] text-xs sm:text-[13px] font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                isSeeMoreSelected
                  ? 'bg-[#0D6D5F] text-white shadow-sm'
                  : 'text-[#0D6D5F] hover:bg-emerald-50/80 bg-white border border-gray-200/80 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <RiSearchLine className={`text-sm shrink-0 ${isSeeMoreSelected ? 'text-white' : 'text-[#0D6D5F]'}`} />
                <span className="truncate">
                  See more results for &ldquo;{query.trim()}&rdquo;
                </span>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-semibold shrink-0 ml-1.5 ${isSeeMoreSelected ? 'text-emerald-100' : 'text-[#0D6D5F]'}`}>
                <span>See more</span>
                <FiArrowRight className="text-xs" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestionsDropdown;

