"use client";

import React, { useState } from "react";
import { FiClock } from "react-icons/fi";
import { PackageTierDetails } from "../utils/packageDetailsNormalizer";

interface PackageComparisonTableProps {
  packages: {
    basic: PackageTierDetails;
    standard: PackageTierDetails;
    premium: PackageTierDetails;
  };
  onSelectTier: (tierKey: 'basic' | 'standard' | 'premium') => void;
}

export const PackageComparisonTable: React.FC<PackageComparisonTableProps> = ({
  packages,
  onSelectTier,
}) => {
  const [showComparisonTable, setShowComparisonTable] = useState(true);

  const basicPkg =
    packages.basic && packages.basic.hasTier !== false && packages.basic.price > 0
      ? packages.basic
      : null;
  const standardPkg =
    packages.standard && packages.standard.hasTier !== false && packages.standard.price > 0
      ? packages.standard
      : null;
  const premiumPkg =
    packages.premium && packages.premium.hasTier !== false && packages.premium.price > 0
      ? packages.premium
      : null;

  const getFeatures = (pkg: PackageTierDetails | null): string[] => {
    if (!pkg) return [];
    if (Array.isArray(pkg.featureList) && pkg.featureList.length > 0) {
      return pkg.featureList;
    }
    if (Array.isArray((pkg as any).features)) {
      return (pkg as any).features;
    }
    return [];
  };

  const basicFeatures = getFeatures(basicPkg);
  const standardFeatures = getFeatures(standardPkg);
  const premiumFeatures = getFeatures(premiumPkg);

  return (
    <div id="section-packages" className="scroll-mt-32 mb-10">
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7 border-b border-gray-200">
          <div>
            <h2 className="text-[22px] sm:text-[25px] font-semibold text-gray-900 tracking-tight">
              Compare packages
            </h2>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showComparisonTable}
            aria-label="Toggle compare packages table"
            onClick={() => setShowComparisonTable(!showComparisonTable)}
            className={`w-[60px] h-[34px] p-[4px] rounded-[40px] flex items-center transition-colors duration-200 cursor-pointer shrink-0 ${showComparisonTable
                ? "bg-[var(--success-500,#008000)] justify-end"
                : "bg-[#D1D5DB] justify-start"
              }`}
          >
            <span className="w-[26px] h-[26px] bg-white rounded-full shadow-sm pointer-events-none block transition-transform duration-200" />
          </button>
        </div>

        {/* Comparison */}
        {showComparisonTable && (
          <div className="animate-fadeIn w-full overflow-hidden">
            <div className="w-full">
              {/* Package Headers */}
              <div className="grid grid-cols-3 border-b border-gray-200">
                {/* Basic */}
                {basicPkg ? (
                  <div className="px-2.5 sm:px-4 py-4 sm:py-5 xl:px-6 xl:py-6 bg-white border-r border-gray-200">
                    <div className="mb-2.5 sm:mb-4">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Basic
                      </span>
                    </div>

                    <div className="text-xl sm:text-2xl xl:text-[30px] font-bold text-gray-900 leading-none">
                      $ {basicPkg.price}
                    </div>

                    {basicPkg.deliveryTime > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs sm:text-sm text-gray-600">
                        <FiClock size={15} className="shrink-0" />
                        <span className="truncate">
                          {basicPkg.deliveryTime} day{basicPkg.deliveryTime > 1 ? "s" : ""} delivery
                        </span>
                      </div>
                    )}

                    <div className="mt-4 sm:mt-5">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
                        {basicPkg.title}
                      </h4>

                      {basicPkg.shortDesc && (
                        <p className="mt-1.5 text-xs sm:text-sm leading-5 text-gray-500 line-clamp-3">
                          {basicPkg.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-2.5 sm:px-4 py-6 sm:px-6 sm:py-8 bg-gray-50 border-r border-gray-200 text-center flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-400">
                      Basic package not offered
                    </span>
                  </div>
                )}

                {/* Standard */}
                {standardPkg ? (
                  <div className="relative px-2.5 sm:px-4 py-4 sm:py-5 xl:px-6 xl:py-6 bg-[#f7fffc] border-r border-gray-200">
                    {/* Recommended Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-brand-green" />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-1 sm:gap-2 mb-2.5 sm:mb-4">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-brand-green">
                        Standard
                      </span>

                      <span className="rounded-full bg-brand-green px-1.5 sm:px-2 py-0.5 text-[8px] min-[400px]:text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wide text-white shrink-0">
                        Recommended
                      </span>
                    </div>

                    <div className="text-xl sm:text-2xl xl:text-[30px] font-bold text-gray-900 leading-none">
                      $ {standardPkg.price}
                    </div>

                    {standardPkg.deliveryTime > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs sm:text-sm text-gray-600">
                        <FiClock size={15} className="shrink-0" />
                        <span className="truncate">
                          {standardPkg.deliveryTime} day{standardPkg.deliveryTime > 1 ? "s" : ""} delivery
                        </span>
                      </div>
                    )}

                    <div className="mt-4 sm:mt-5">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
                        {standardPkg.title}
                      </h4>

                      {standardPkg.shortDesc && (
                        <p className="mt-1.5 text-xs sm:text-sm leading-5 text-gray-500 line-clamp-3">
                          {standardPkg.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-2.5 sm:px-4 py-6 sm:px-6 sm:py-8 bg-gray-50 border-r border-gray-200 text-center flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-400">
                      Standard package not offered
                    </span>
                  </div>
                )}

                {/* Premium */}
                {premiumPkg ? (
                  <div className="px-2.5 sm:px-4 py-4 sm:py-5 xl:px-6 xl:py-6 bg-white">
                    <div className="mb-2.5 sm:mb-4">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-[#ff6b4a]">
                        Premium
                      </span>
                    </div>

                    <div className="text-xl sm:text-2xl xl:text-[30px] font-bold text-gray-900 leading-none">
                      $ {premiumPkg.price}
                    </div>

                    {premiumPkg.deliveryTime > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs sm:text-sm text-gray-600">
                        <FiClock size={15} className="shrink-0" />
                        <span className="truncate">
                          {premiumPkg.deliveryTime} day{premiumPkg.deliveryTime > 1 ? "s" : ""} delivery
                        </span>
                      </div>
                    )}

                    <div className="mt-4 sm:mt-5">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
                        {premiumPkg.title}
                      </h4>

                      {premiumPkg.shortDesc && (
                        <p className="mt-1.5 text-xs sm:text-sm leading-5 text-gray-500 line-clamp-3">
                          {premiumPkg.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-6 sm:px-6 sm:py-8 bg-gray-50 text-center flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-400">
                      Premium package not offered
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3">
                {/* Basic Features */}
                {basicPkg ? (
                  <div className="px-3.5 py-4 sm:px-5 sm:py-5 xl:px-6 xl:py-6 border-r border-gray-200 bg-white">
                    <div className="space-y-0">
                      {basicFeatures.map((f: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-xs sm:text-[13px] text-gray-600 leading-5 break-words">
                            {f}
                          </span>

                          <svg
                            className="shrink-0 text-brand-green"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                      ))}
                      {basicFeatures.length === 0 && (
                        <div className="py-4 text-center text-xs text-gray-400">
                          Standard deliverable
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-r border-gray-200 bg-gray-50" />
                )}

                {/* Standard Features */}
                {standardPkg ? (
                  <div className="px-3.5 py-4 sm:px-5 sm:py-5 xl:px-6 xl:py-6 border-r border-gray-200 bg-[#f7fffc]">
                    <div className="space-y-0">
                      {standardFeatures.map((f: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-xs sm:text-[13px] font-medium text-gray-700 leading-5 break-words">
                            {f}
                          </span>

                          <svg
                            className="shrink-0 text-brand-green"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                      ))}
                      {standardFeatures.length === 0 && (
                        <div className="py-4 text-center text-xs text-gray-400">
                          Standard deliverable
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-r border-gray-200 bg-gray-50" />
                )}

                {/* Premium Features */}
                {premiumPkg ? (
                  <div className="px-3.5 py-4 sm:px-5 sm:py-5 xl:px-6 xl:py-6 bg-white">
                    <div className="space-y-0">
                      {premiumFeatures.map((f: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-xs sm:text-[13px] text-gray-600 leading-5 break-words">
                            {f}
                          </span>

                          <svg
                            className="shrink-0 text-brand-green"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                      ))}
                      {premiumFeatures.length === 0 && (
                        <div className="py-4 text-center text-xs text-gray-400">
                          Turnkey deliverable
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50" />
                )}
              </div>

              {/* Select Package Action Row */}
              <div className="grid grid-cols-3 border-t border-gray-200 p-3 sm:p-4 xl:p-5 bg-gray-50/50">
                <div className="px-1.5 sm:px-2">
                  {basicPkg && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('basic');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 px-2 sm:px-3 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Select Basic
                    </button>
                  )}
                </div>
                <div className="px-1.5 sm:px-2">
                  {standardPkg && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('standard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 px-2 sm:px-3 bg-brand-green text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shadow-xs text-center"
                    >
                      Select Standard
                    </button>
                  )}
                </div>
                <div className="px-1.5 sm:px-2">
                  {premiumPkg && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('premium');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 px-2 sm:px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Select Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
