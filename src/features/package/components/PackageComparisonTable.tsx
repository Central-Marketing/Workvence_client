"use client";

import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
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
  const [isEnabled, setIsEnabled] = useState(true);

  const tiers = [packages.basic, packages.standard, packages.premium];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header + Toggle Switch */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Compare Packages
        </h2>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            isEnabled ? "bg-emerald-600 justify-end" : "bg-gray-200 justify-start"
          }`}
          aria-label="Toggle package comparison"
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
        </button>
      </div>

      {/* Comparison Table */}
      {isEnabled && (
        <div className="overflow-x-auto no-scrollbar animate-fadeIn border border-gray-100 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[620px]">
            {/* Table Header: Tier names, pricing & CTA */}
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 sm:p-5 w-[25%] align-top bg-gray-50/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Bundles
                </th>
                {tiers.map((tier) => (
                  <th key={tier.key} className="p-4 sm:p-5 w-[25%] align-top border-l border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">
                      {tier.name}
                    </span>
                    <span className="text-2xl font-bold text-gray-900 block mb-3">
                      ${tier.price}
                    </span>
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wide block mb-1.5 leading-snug">
                      {tier.headline}
                    </span>
                    <p className="text-xs text-gray-500 font-normal leading-relaxed mb-4 min-h-[48px]">
                      {tier.shortDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectTier(tier.key)}
                      className="w-full py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                    >
                      Select
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Feature Rows */}
            <tbody className="divide-y divide-gray-100 text-xs sm:text-[13px] text-gray-700">
              {/* Prototype */}
              <tr>
                <td className="p-4 sm:p-5 font-medium text-gray-600 bg-gray-50/40">
                  Prototype
                </td>
                {tiers.map((t) => (
                  <td key={t.key} className="p-4 sm:p-5 border-l border-gray-100">
                    {t.features.prototype ? (
                      <FiCheck className="w-4 h-4 text-gray-900 stroke-[2.5]" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Source File */}
              <tr>
                <td className="p-4 sm:p-5 font-medium text-gray-600 bg-gray-50/40">
                  Source File
                </td>
                {tiers.map((t) => (
                  <td key={t.key} className="p-4 sm:p-5 border-l border-gray-100">
                    {t.features.sourceFile ? (
                      <FiCheck className="w-4 h-4 text-gray-900 stroke-[2.5]" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Number of Pages or Screens */}
              <tr>
                <td className="p-4 sm:p-5 font-medium text-gray-600 bg-gray-50/40">
                  Number of Pages or Screens
                </td>
                {tiers.map((t) => (
                  <td key={t.key} className="p-4 sm:p-5 border-l border-gray-100 font-semibold text-gray-900">
                    {t.features.numPages}
                  </td>
                ))}
              </tr>

              {/* Revisions */}
              <tr>
                <td className="p-4 sm:p-5 font-medium text-gray-600 bg-gray-50/40">
                  Revisions
                </td>
                {tiers.map((t) => (
                  <td key={t.key} className="p-4 sm:p-5 border-l border-gray-100 font-semibold text-gray-900">
                    {t.key === 'basic' ? '3' : t.key === 'standard' ? '3' : '5'}
                  </td>
                ))}
              </tr>

              {/* Delivery Time */}
              <tr>
                <td className="p-4 sm:p-5 font-medium text-gray-600 bg-gray-50/40">
                  Delivery Time
                </td>
                {tiers.map((t) => (
                  <td key={t.key} className="p-4 sm:p-5 border-l border-gray-100 font-semibold text-gray-900">
                    {t.key === 'basic' ? '5 days' : t.key === 'standard' ? '7 days' : '10 days'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
