'use client';

import React, { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  scrollToTop?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  scrollToTop = true,
  className = '',
  ariaLabel = 'Pagination Navigation',
}: PaginationProps) {
  // Navigation bounds
  const hasTotal = typeof totalPages === 'number' && totalPages > 0;
  const canGoPrev = hasPrevPage !== undefined ? hasPrevPage : currentPage > 1;
  const canGoNext =
    hasNextPage !== undefined
      ? hasNextPage
      : hasTotal
      ? currentPage < totalPages
      : true;

  const handlePageClick = (page: number) => {
    if (page === currentPage) return;
    if (hasTotal && (page < 1 || page > totalPages)) return;
    if (page < 1) return;

    if (scrollToTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onPageChange(page);
  };

  // Generate responsive smart pagination range with ellipsis
  const paginationRange = useMemo(() => {
    if (!hasTotal || !totalPages || totalPages <= 1) return [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - 1, 1);
    const rightSibling = Math.min(currentPage + 1, totalPages);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  }, [hasTotal, totalPages, currentPage]);

  // Don't render anything if totalPages is 1
  if (hasTotal && totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`w-full flex justify-center items-center py-6 max-w-full overflow-hidden ${className}`}
    >
      <nav
        aria-label={ariaLabel}
        className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full select-none"
      >
        {/* Previous Page Button (Left Arrow Only) */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrev}
          aria-label="Previous page"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-[6px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
        >
          <FiChevronLeft className="w-4 h-4 shrink-0" />
        </button>

        {/* Numbered Page Mode */}
        {hasTotal && paginationRange.length > 0 ? (
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {paginationRange.map((item, idx) => {
              if (typeof item === 'string') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="h-8 w-6 sm:h-9 sm:w-8 inline-flex items-center justify-center text-xs sm:text-sm text-gray-400 font-bold select-none shrink-0"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              const isSibling =
                item === currentPage - 1 || item === currentPage + 1;
              const isEdge = item === 1 || item === totalPages;

              // On very small mobile screens (< sm), show only edges and current page; siblings hidden on mobile
              const responsiveClass =
                isSibling && !isEdge ? 'hidden sm:inline-flex' : 'inline-flex';

              return isCurrent ? (
                <button
                  key={`page-${item}`}
                  type="button"
                  aria-current="page"
                  aria-label={`Page ${item}`}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-[6px] bg-[#0D6D5F] text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center shrink-0 shadow-2xs pointer-events-none"
                >
                  {item}
                </button>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => handlePageClick(item)}
                  aria-label={`Page ${item}`}
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-[6px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium text-xs sm:text-sm items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs ${responsiveClass}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : (
          /* Stream / Simple Mode (When totalPages is unknown) */
          <span className="font-semibold text-xs sm:text-sm text-gray-700 bg-gray-100 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-[6px] shrink-0">
            Page {currentPage}
          </span>
        )}

        {/* Next Page Button (Right Arrow Only) */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-[6px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
        >
          <FiChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
