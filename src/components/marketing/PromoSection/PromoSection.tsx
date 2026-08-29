"use client";

import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

const PromoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 sm:mb-14">
          <div>
            <h2 className="font-sf-pro font-[510] text-3xl sm:text-4xl lg:text-[44px] text-[#222427] leading-[1.18] tracking-tight">
              Build Amazing Projects
              <br />
              With Trusted Professionals
            </h2>
          </div>
          <p className="font-sf-pro font-normal text-[13px] sm:text-[14px] text-[#6E6E6E] max-w-[340px] leading-[1.55]">
            We bring ideas to life by connecting businesses with creative minds who build experiences that make an impact
          </p>
        </div>

        {/* Main Background Frame (1760x800 with 20px Radius) */}
        <div
          className="relative w-full max-w-[1760px] mx-auto rounded-[20px] p-3 sm:p-6 md:p-[50px] overflow-hidden"
          style={{
            background: 'var(--teal-100, #CCF6F1)',
          }}
        >
          {/* Circular Glow Layer (1267x1267 starting from top, 40% hidden at bottom) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[72%] max-w-[1267px] aspect-square rounded-full pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle at center, #EBFEC5 0%, #EBFEC5 40%, rgba(235, 254, 197, 0.6) 65%, transparent 88%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Inner Video Container */}
          <div
            onClick={togglePlay}
            className="relative z-10 w-full aspect-[16/9] md:aspect-[1660/640] min-h-[320px] sm:min-h-[440px] md:min-h-[520px] lg:h-[620px] rounded-[10px] overflow-hidden bg-black cursor-pointer shadow-md group"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src="https://res.cloudinary.com/cqtrqtyu/video/upload/v1786602492/WhatsApp_Video_2026-08-13_at_12.22.47_PM_odf8xi.mp4"
            />

            {/* Ambient Play / Pause Button Overlay on Hover/Pause */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
                isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl transition-transform duration-200 group-hover:scale-105">
                {isPlaying ? (
                  <Pause size={24} className="text-white fill-white" />
                ) : (
                  <Play size={24} className="text-white fill-white ml-1" />
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PromoSection;
