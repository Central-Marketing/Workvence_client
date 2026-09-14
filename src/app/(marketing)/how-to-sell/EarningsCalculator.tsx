"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EarningsCalculator() {
  const [ratePerProject, setRatePerProject] = useState(150);
  const [projectsPerMonth, setProjectsPerMonth] = useState(6);

  const estimatedMonthlyEarnings = ratePerProject * projectsPerMonth * 0.9;
  const estimatedAnnualEarnings = estimatedMonthlyEarnings * 12;

  return (
    <section id="calculator" className="py-20 bg-[#0f172a] text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#6ad724] uppercase tracking-wider">
              Earnings Estimator
            </span>
            <h2 className="text-3xl font-bold text-white">Estimate Your Earning Potential</h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Adjust the sliders below to see what you could earn on Workvence based on your rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2">
                  <span>Average Project / Gig Price</span>
                  <span className="text-[#6ad724] font-bold text-sm">${ratePerProject}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={1000}
                  step={10}
                  value={ratePerProject}
                  onChange={(e) => setRatePerProject(Number(e.target.value))}
                  className="w-full accent-[#10b981] h-2 bg-white/20 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>$20</span>
                  <span>$500</span>
                  <span>$1,000+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2">
                  <span>Completed Orders / Month</span>
                  <span className="text-[#6ad724] font-bold text-sm">{projectsPerMonth} orders</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={projectsPerMonth}
                  onChange={(e) => setProjectsPerMonth(Number(e.target.value))}
                  className="w-full accent-[#10b981] h-2 bg-white/20 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1</span>
                  <span>15</span>
                  <span>30 orders</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-6 text-center space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                  Estimated Monthly Take-Home
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#6ad724]">
                  ${Math.round(estimatedMonthlyEarnings).toLocaleString()}
                </div>
                <span className="text-xs text-gray-400 block">
                  ~ ${Math.round(estimatedAnnualEarnings).toLocaleString()} / year
                </span>
              </div>

              <Link
                href="/become-a-seller"
                className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs shadow-md transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Your Free Seller Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
