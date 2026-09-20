"use client";

import React from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { FiFolder, FiCornerDownLeft } from 'react-icons/fi';
import { SuggestionItem } from '@/hooks/useSearchSuggestions';

interface SearchSuggestionsDropdownProps {
  items: SuggestionItem[];
  query: string;
  isOpen: boolean;
  isLoading?: boolean;
  selectedIndex: number;
  onSelect: (item: SuggestionItem | { text: string; type: 'query' }) => void;
  className?: string;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  items,
  query,
  isOpen,
  isLoading = false,
  selectedIndex,
  onSelect,
  className = '',
}) => {
  if (!isOpen || !query.trim()) {
    return null;
  }

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

  return (
    <div
      className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100/90 rounded-2xl shadow-2xl py-2 z-[70] overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150 ${className}`}
    >
      {/* Suggestions List */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50/60">
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          const isCategory = item.type === 'category';

          return (
            <div
              key={`${item.text}-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors group ${
                isSelected ? 'bg-emerald-50/70 text-[#0D6D5F]' : 'hover:bg-gray-50/80 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isCategory ? (
                  <FiFolder className={`text-base shrink-0 ${isSelected ? 'text-[#0D6D5F]' : 'text-[#327C73]'}`} />
                ) : (
                  <RiSearchLine className={`text-base shrink-0 ${isSelected ? 'text-[#0D6D5F]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                )}

                <span className="text-[13px] sm:text-[14px] font-medium truncate">
                  {highlightMatch(item.text, query)}
                </span>
              </div>

              {isCategory && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#0D6D5F] border border-emerald-100/80 shrink-0">
                  Category
                </span>
              )}
            </div>
          );
        })}

        {/* Search for exact query option */}
        {query.trim() && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect({ text: query.trim(), type: 'query' });
            }}
            className={`px-4 py-2.5 flex items-center justify-between cursor-pointer border-t border-gray-100 transition-colors ${
              selectedIndex === items.length ? 'bg-emerald-50/70 text-[#0D6D5F]' : 'hover:bg-emerald-50/50 text-[#327C73]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <RiSearchLine className="text-sm shrink-0" />
              <span className="text-[13px] sm:text-[14px] font-semibold truncate">
                Search for &ldquo;{query.trim()}&rdquo;
              </span>
            </div>
            <FiCornerDownLeft className="text-xs opacity-60 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestionsDropdown;
