"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';

const PromoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="w-full py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-500 leading-tight md:max-w-xl">
            Build Amazing Projects <br className="hidden md:block" />
            With Trusted Professionals
          </h2>
          <p className="text-gray-500 text-[16px] max-w-[400px] leading-relaxed mt-2 md:mt-0">
            We bring ideas to life by connecting businesses with creative minds who build experiences that make an impact
          </p>
        </div>

        <div className="relative w-full aspect-video md:h-[650px] md:aspect-auto rounded-3xl overflow-hidden group shadow-2xl">
          {isPlaying ? (
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              src="./media/video.mp4"
            />
          ) : (
            <>
              <img
                src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Team working together"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:scale-110 transition-all duration-300"
                >
                  <Play className="text-[#0e5c46] ml-2" size={32} fill="currentColor" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
