import React from 'react';
import Link from 'next/link';

const TwoWays = () => {
  return (
    <section className="w-full bg-[#f5f5f5] py-16 sm:py-20 px-4 sm:px-6 flex justify-center">
      <div className="max-w-[1100px] w-full flex flex-col items-center">
        <div className="text-center max-w-[700px] mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight mb-3 sm:mb-4">
            Two ways to work on <span className="text-[#327C73]">workvence</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed">
            Choose the hiring experience that fits your needs—purchase ready-made services instantly or
            post a custom project and receive competitive proposals from verified professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Option 1: Buy Fixed-Price Service */}
          <div className="bg-white border border-gray-100 rounded-2xl p-7 sm:p-9 flex flex-col items-start transition-shadow duration-300 hover:shadow-md">
            <div className="w-11 h-11 rounded-[10px] bg-[#f5f5f5] border border-gray-200 flex items-center justify-center mb-5">
              <img src="/all-icons/discount-tag-02.svg" alt="Fixed-Price" className="w-[22px] h-[22px] object-contain" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] mb-2.5">Buy a Fixed-Price Service</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-7 flex-grow">
              Browse curated package packages with clear scopes and set timelines. Perfect for defined tasks like logos, articles, or bug fixes.
            </p>
            <Link
              href="/packages?category=ai-services"
              className="inline-flex items-center justify-center h-[46px] px-8 rounded-lg text-sm font-semibold bg-black hover:bg-black/90 text-white transition-colors"
            >
              Browse packages
            </Link>
          </div>

          {/* Option 2: Post a Project */}
          <div className="bg-white border border-gray-100 rounded-2xl p-7 sm:p-9 flex flex-col items-start transition-shadow duration-300 hover:shadow-md">
            <div className="w-11 h-11 rounded-[10px] bg-[#f5f5f5] border border-gray-200 flex items-center justify-center mb-5">
              <img src="/all-icons/ai-security-03.svg" alt="Post Project" className="w-[22px] h-[22px] object-contain" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] mb-2.5">Post a Project, Get Bids</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-7 flex-grow">
              Submit your custom requirements and let our vetted experts pitch their best solutions. Best for long-term or complex initiatives.
            </p>
            <Link
              href="/briefs/create"
              className="inline-flex items-center justify-center h-[46px] px-8 rounded-[6px] text-sm font-semibold bg-white text-[#1a1a1a] border border-gray-300 hover:border-[#1a1a1a] hover:bg-gray-50 transition-colors"
            >
              Post project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoWays;
