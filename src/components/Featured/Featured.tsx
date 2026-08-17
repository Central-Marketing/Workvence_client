"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, PenTool, Megaphone, PenLine, Film, Camera, Box, Code, Database } from 'lucide-react';

const Featured = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (search || category) {
      router.push(`/packages?search=${search}&category=${category}`);
    }
  }

  const categoryIcons = [
    { name: "Graphic & Design", icon: <PenTool size={28} strokeWidth={1.5} />, path: "design" },
    { name: "Digital Marketing", icon: <Megaphone size={28} strokeWidth={1.5} />, path: "social" },
    { name: "Writing & Content", icon: <PenLine size={28} strokeWidth={1.5} />, path: "books" },
    { name: "Videos & Editing", icon: <Film size={28} strokeWidth={1.5} />, path: "video" },
    { name: "Photography", icon: <Camera size={28} strokeWidth={1.5} />, path: "photography" },
    { name: "Animation & 3D", icon: <Box size={28} strokeWidth={1.5} />, path: "animation" },
    { name: "Programming", icon: <Code size={28} strokeWidth={1.5} />, path: "wordpress" },
    { name: "Data Server", icon: <Database size={28} strokeWidth={1.5} />, path: "data" },
  ];

  const filteredCategories = categoryIcons.filter(cat =>
    cat.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="relative w-full h-[50vh] md:min-h-[70vh] flex justify-center items-end md:items-center bg-brand-black text-white pb-4 md:py-20 px-5 overflow-hidden">
      {/* LCP Pre-loaded Background Image */}
      <Image
        src="/heroImg.jpg"
        alt="Workvence Freelance Marketplace Hero"
        fill
        priority
        quality={85}
        className="object-cover object-center pointer-events-none"
      />
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10 pointer-events-none" />

      <div className="relative z-20 w-full container mx-auto flex flex-col items-center px-4 md:px-6 md:mt-56">

        <div className="w-full flex flex-col items-center text-center gap-10">
          <div className="w-full max-w-4xl flex flex-col items-center text-center gap-10">
            <h1 className="text-2xl md:text-5xl leading-tight font-bold -mb-4 md:mb-0 text-white">
              Connect with Top <span className="text-brand-light">Freelancers</span><br />Build Outstanding Projects.
            </h1>

            <div className="flex flex-col md:flex-row items-center bg-transparent md:bg-white rounded-xl w-[90%] md:w-full max-w-[850px] md:h-[70px] p-0 md:p-2 shadow-none md:shadow-2xl gap-3 md:gap-0">

              <div className="flex-1 flex items-center h-full px-5 gap-3 w-full md:w-auto bg-white rounded-lg md:rounded-none">
                <Search className="text-gray-400 min-w-[24px] cursor-pointer hover:text-brand-green transition-colors" size={24} strokeWidth={1.5} onClick={handleSearch} />
                <input
                  className="w-full h-14 md:h-full border-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
                  type="text"
                  placeholder="Job title, key words or company"
                  onChange={(event: any) => setSearch(event.target.value)}
                  onKeyDown={(event: any) => event.key === 'Enter' && handleSearch()}
                />
              </div>

              <button
                className="hidden md:flex items-center justify-center h-[55px] md:h-full px-10 w-full md:w-auto bg-brand-green text-white border-none rounded-lg text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-[#389115] flex-shrink-0 md:ml-2 shadow-md hover:shadow-lg"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          <div className={`flex justify-center items-start w-full max-w-5xl mt-5 gap-1 sm:gap-4 md:gap-6 overflow-hidden mx-auto ${search.trim().length > 0 ? 'h-[100px]' : 'h-0'}`}>
            {search.trim().length > 0 && filteredCategories.map((cat, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition group flex-1 min-w-0 md:flex-none md:w-[110px]"
                onClick={() => router.push(`/packages?category=${cat.path}`)}
              >
                <div className="w-[28px] h-[28px] sm:w-[50px] sm:h-[50px] md:w-[72px] md:h-[72px] rounded-full border border-white/30 bg-white/10 flex justify-center items-center text-white transition-all duration-300 group-hover:bg-white/20 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20 backdrop-blur-sm shrink-0">
                  <div className="scale-[0.35] sm:scale-75 md:scale-100 flex items-center justify-center">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-[7px] sm:text-[10px] md:text-[14px] font-semibold text-white/90 text-center tracking-tight leading-tight w-full break-words md:whitespace-nowrap truncate sm:overflow-visible sm:whitespace-normal">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Featured;