"use client";

import React, { useEffect } from "react";
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from "lucide-react";

const NotFound = () => {
  useEffect(() => {
    document.body.classList.add("hide-navbar");

    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  return (
    <div id="not-found-page" className="w-full flex justify-center items-center p-4 md:p-8 lg:p-10 bg-slate-50 dark:bg-slate-950">
      {/* 404 Container */}
      <div className="w-full max-w-[1760px] h-[clamp(650px,85vh,1000px)] min-h-[620px] rounded-[10px] bg-[var(--warning-900,#650000)] relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        {/* SVG Repeating Pattern Background */}
        <div
          className="absolute inset-0 w-full h-full bg-[url('/media/not-found-pattern.svg')] bg-repeat [background-size:150px_102px] opacity-55 pointer-events-none z-1"
          aria-hidden="true"
        />

        {/* Radial Vignette Overlay for Depth */}
        <div
          className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(101,0,0,0.2)_0%,rgba(60,0,0,0.75)_100%)] pointer-events-none z-2"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 text-center px-5 max-w-[900px] flex flex-col items-center justify-center">
          <h1 className="font-outfit text-[clamp(120px,20vw,290px)] font-black italic leading-[0.95] tracking-tighter text-[#fff0f3] drop-shadow-2xl select-none mb-2">
            404
          </h1>

          <h2 className="text-[clamp(28px,4.5vw,56px)] font-normal italic tracking-tight text-white leading-tight drop-shadow-md">
            Oops! Page Not Found
          </h2>

          <p className="text-[clamp(13px,1.4vw,17px)] text-white/70 font-light mt-4 mb-9 max-w-[580px] leading-relaxed tracking-wide">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-row flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/45 rounded-full text-[15px] font-semibold transition-all duration-200 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/"
              className="primary-btn-anim group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-white hover:bg-[#fff5f6] text-[#650000] rounded-full text-[15px] font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Back to Home</span>
              <span className="arrow-anim-icon inline-flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;