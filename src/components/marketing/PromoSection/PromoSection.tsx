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
    <section className="w-full py-16 sm:py-20 md:py-24 bg-[#fafafa]">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 sm:mb-14">
          <h2 className="font-sf-pro font-[510] text-[26px] min-[400px]:text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] macbook:text-[46px] 2xl:text-[48px] text-[#292929] leading-tight sm:leading-[1.18] tracking-tight sm:tracking-normal">
            Build Amazing Projects
            <br />
            With Trusted Professionals
          </h2>
          <p className="font-sf-pro font-normal text-[13px] sm:text-[14px] text-[#6E6E6E] max-w-[340px] leading-[1.55]">
            We bring ideas to life by connecting businesses with creative minds who build experiences that make an impact
          </p>
        </div>

        {/* Main Background Frame */}
        <div
          className="relative w-full mx-auto rounded-[6px]  p-3 sm:p-5 md:p-8 lg:p-10 xl:p-[50px] overflow-hidden"
          style={{
            background: 'var(--teal-100, #CCF6F1)',
          }}
        >
          {/* Circular Glow Layer */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[72%] max-w-[1267px] aspect-square rounded-full pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle at center, #EBFEC5 0%, #EBFEC5 40%, rgba(235, 254, 197, 0.6) 65%, transparent 88%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Inner Video Container with exact 163/76 aspect ratio */}
          <div
            onClick={togglePlay}
            className="relative z-10 w-full aspect-[163/76] rounded-[6px] overflow-hidden bg-black cursor-pointer shadow-md group"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              preload="auto"
              controls={false}
              muted
              loop
              playsInline
              src="https://res.cloudinary.com/cqtrqtyu/video/upload/v1786602492/WhatsApp_Video_2026-08-13_at_12.22.47_PM_odf8xi.mp4"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default PromoSection;
