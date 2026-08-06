"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, PenTool, Megaphone, PenLine, Film, Camera, Box, Code, Database } from 'lucide-react';

const Featured = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (search || category) {
      router.push(`/gigs?search=${search}&category=${category}`);
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

  return (
    <div className="w-full min-h-[60vh] flex justify-center items-center bg-brand-navy bg-[image:linear-gradient(to_top,rgba(0,0,0,0.9),rgba(0,0,0,0.1)),url('/heroImg.jpg')] bg-cover bg-center text-white py-20 px-5">
      <div className="w-full container mx-auto flex flex-col items-center px-4 md:px-6">

        <div className="w-full flex flex-col items-center text-center gap-10">
          <div className="w-full max-w-4xl flex flex-col items-center text-center gap-10">
            <h1 className="text-4xl md:text-5xl leading-tight font-bold m-0 text-white">
              Connect with Top <span className="text-brand-light">Freelancers</span><br />Build Outstanding Projects.
            </h1>

            <div className="flex flex-col md:flex-row items-center bg-transparent md:bg-white rounded-xl w-full max-w-[850px] md:h-[70px] p-0 md:p-2 shadow-none md:shadow-2xl gap-3 md:gap-0">

              <div className="flex-1 flex items-center h-[55px] md:h-full px-5 gap-3 w-full md:w-auto bg-white rounded-lg md:rounded-none">
                <Search className="text-gray-400 min-w-[24px]" size={24} strokeWidth={1.5} />
                <input
                  className="w-full h-full border-none outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
                  type="text"
                  placeholder="Job title, key words or company"
                  onChange={(event: any) => setSearch(event.target.value)}
                  onKeyDown={(event: any) => event.key === 'Enter' && handleSearch()}
                />
              </div>

              <button
                className="h-[55px] md:h-full px-10 w-full md:w-auto bg-brand-green text-white border-none rounded-lg text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-[#389115] flex-shrink-0 md:ml-2 shadow-md hover:shadow-lg"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex justify-start lg:justify-center flex-nowrap overflow-x-auto w-full max-w-7xl gap-6 md:gap-8 mt-5 pb-4 custom-scrollbar">
            {categoryIcons.map((cat, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2.5 cursor-pointer transition group min-w-[100px] flex-shrink-0"
                onClick={() => router.push(`/gigs?category=${cat.path}`)}
              >
                <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full border border-white/30 bg-white/10 flex justify-center items-center text-white transition-all duration-300 group-hover:bg-white/20 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20 backdrop-blur-sm">
                  {cat.icon}
                </div>
                <span className="text-[12px] md:text-[14px] font-semibold text-white/90 text-center tracking-wide whitespace-nowrap">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Featured;