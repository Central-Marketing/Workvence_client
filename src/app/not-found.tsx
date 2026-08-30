"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-5 py-20">
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Large 404 Background Text */}
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[180px] font-black text-gray-50 leading-none select-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="w-16 h-1 bg-brand-green rounded-full mb-6"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Page Not Found
            </h2>
          </div>
        </div>

        <p className="text-gray-500 text-[15px] md:text-[17px] mb-10 max-w-md leading-relaxed">
          Oops! The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-semibold text-[15px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white bg-brand-green hover:bg-[#399d14] transition-all shadow-md hover:shadow-lg font-semibold text-[15px]"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;