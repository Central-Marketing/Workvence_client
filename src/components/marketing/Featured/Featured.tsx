"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';
import {
  Search,
  Palette,
  Code,
  Megaphone,
  Film,
  Cpu,
  FileText,
  Briefcase,
  Music,
  BarChart2,
  ShoppingCart,
  Star,
  Layers
} from 'lucide-react';

const Featured = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (search.trim() || category) {
      router.push(`/packages?search=${encodeURIComponent(search.trim())}&category=${encodeURIComponent(category)}`);
    }
  };

  // Fetch real categories from backend database
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-featured'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data).catch(() => [])
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const getCategoryIcon = (iconStr?: string, nameStr?: string) => {
    const iconKey = (iconStr || '').toLowerCase().replace(/[-_]/g, '');
    const nameKey = (nameStr || '').toLowerCase();

    if (iconKey === 'palette' || nameKey.includes('design') || nameKey.includes('graphic')) return <Palette size={18} strokeWidth={1.5} />;
    if (iconKey === 'code' || nameKey.includes('program') || nameKey.includes('tech') || nameKey.includes('code')) return <Code size={18} strokeWidth={1.5} />;
    if (iconKey === 'bullhorn' || nameKey.includes('market') || nameKey.includes('digital')) return <Megaphone size={18} strokeWidth={1.5} />;
    if (iconKey === 'video' || nameKey.includes('video') || nameKey.includes('animation')) return <Film size={18} strokeWidth={1.5} />;
    if (iconKey === 'cpu' || nameKey.includes('ai')) return <Cpu size={18} strokeWidth={1.5} />;
    if (iconKey === 'filetext' || nameKey.includes('write') || nameKey.includes('translation')) return <FileText size={18} strokeWidth={1.5} />;
    if (iconKey === 'briefcase' || nameKey.includes('business') || nameKey.includes('consulting')) return <Briefcase size={18} strokeWidth={1.5} />;
    if (iconKey === 'music' || nameKey.includes('music') || nameKey.includes('audio')) return <Music size={18} strokeWidth={1.5} />;
    if (iconKey === 'barchart' || iconKey === 'chart' || nameKey.includes('data') || nameKey.includes('analytics')) return <BarChart2 size={18} strokeWidth={1.5} />;
    if (iconKey === 'shoppingcart' || nameKey.includes('e-commerce') || nameKey.includes('commerce')) return <ShoppingCart size={18} strokeWidth={1.5} />;
    if (iconKey === 'star' || nameKey.includes('other') || nameKey.includes('general')) return <Star size={18} strokeWidth={1.5} />;

    return <Layers size={18} strokeWidth={1.5} />;
  };

  const filteredCategories = categoryList.filter((cat: any) => {
    const name = cat.name || cat.title || String(cat);
    return name.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <section className="relative w-full h-[580px] sm:h-[640px] md:h-[700px] lg:h-[740px] xl:h-[780px] bg-[#E8F5F5] overflow-hidden flex flex-col justify-between pt-8 sm:pt-12 md:pt-14 pb-0 select-none">
      {/* Background ambient radial glow at top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_15%,rgba(242,252,248,0.7),transparent)] pointer-events-none" />

      {/* Bottom glowing Ellipse - top 35% rises up into the bottom of the section */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[65%] w-[120%] max-w-[1600px] h-[550px] sm:h-[700px] md:h-[800px] rounded-[50%] bg-[#EBFEC5] pointer-events-none z-0"
        style={{
          filter: 'blur(120px)',
          backdropFilter: 'blur(500px)',
        }}
      />

      {/* TOP HEADER & SEARCH CONTENT */}
      <div className="relative z-20 container mx-auto px-4 text-center max-w-4xl flex flex-col items-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] xl:text-[85px] font-medium text-[#1E293B] tracking-tight leading-[1.12] mb-3">
          Find the right <span className="text-[#327C73]">freelancer</span>
          <br />
          and get to work in minutes.
        </h1>

        {/* Subtitle */}
        <p className="text-slate-500 text-xs sm:text-sm md:text-base font-normal max-w-xl mx-auto mb-5 sm:mb-6 leading-relaxed">
          Search thousands of vetted sellers, order in under a minute, and start today.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-[460px] sm:max-w-[520px] md:max-w-[560px] bg-white rounded-lg sm:rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2.5 sm:gap-3 transition-all focus-within:border-[#2C6E63]/70 focus-within:shadow-[0_4px_16px_rgba(44,110,99,0.12)]">
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="What services are you looking for..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm md:text-base font-normal"
          />
        </div>

        {/* Dynamic Category Suggestions on search */}
        {search.trim().length > 0 && (
          <div className="flex justify-center items-start flex-wrap w-full max-w-2xl mt-4 gap-2 bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-slate-200/80 shadow-lg z-30">
            {filteredCategories.slice(0, 6).map((cat: any, index: number) => {
              const name = cat.name || cat.title || String(cat);
              const slug = cat.slug || name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              const iconStr = cat.icon || '';

              return (
                <div
                  key={slug || index}
                  className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => router.push(`/packages?category=${encodeURIComponent(slug)}`)}
                >
                  <div className="text-slate-500">
                    {getCategoryIcon(iconStr, name)}
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM IMAGE GALLERY - 5 COLUMNS CONSTRAINED TO CONTAINER */}
      <div className="relative z-10 w-full container mx-auto px-4 md:px-6 flex items-end justify-between gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-5 xl:gap-6 mt-auto pointer-events-none">

        {/* COLUMN 1: LEFTMOST - 2 VERTICAL IMAGES */}
        <div className="w-[18%] min-w-[90px] max-w-[245px] flex flex-col gap-2 sm:gap-3 md:gap-4 shrink-0">
          {/* Top image: Blue head silhouette */}
          <div className="w-full aspect-[3/3.75] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-[#0a182c]">
            <img
              src="/media/hero_images/img4.png"
              alt="Creative Art"
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Bottom image: Laptop code editor (cut off at bottom by parent overflow-hidden) */}
          <div className="w-full h-[70px] sm:h-[100px] md:h-[130px] lg:h-[80px] xl:h-[100px] rounded-t-xl sm:rounded-t-2xl rounded-b-none overflow-hidden shadow-sm bg-slate-900">
            <img
              src="/media/hero_images/img7.png"
              alt="Code Development"
              className="w-full h-auto object-cover object-top"
            />
          </div>
        </div>

        {/* COLUMN 2: SECOND - TALL ADOBE BOUQUET CARD */}
        <div className="w-[18%] min-w-[90px] max-w-[245px] shrink-0">
          <div className="w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[240px] xl:h-[255px] rounded-t-xl sm:rounded-t-2xl rounded-b-none overflow-hidden shadow-sm bg-white">
            <img
              src="/media/hero_images/img1.png"
              alt="Design Forever"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* COLUMN 3: CENTER - VIBE CODING PHONE (LOWER POSITION) */}
        <div className="w-[18%] min-w-[90px] max-w-[245px] shrink-0">
          <div className="w-full h-[110px] sm:h-[155px] md:h-[200px] lg:h-[160px] xl:h-[180px] rounded-t-xl sm:rounded-t-2xl rounded-b-none overflow-hidden shadow-sm bg-[#a81e55]">
            <img
              src="/media/hero_images/img3.png"
              alt="Vibe Coding"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* COLUMN 4: FOURTH - TALL VIOLIN POSTER */}
        <div className="w-[18%] min-w-[90px] max-w-[245px] shrink-0">
          <div className="w-full h-[160px] sm:h-[220px] md:h-[290px] lg:h-[340px] xl:h-[305px] rounded-t-xl sm:rounded-t-2xl rounded-b-none overflow-hidden shadow-sm bg-[#fafafa]">
            <img
              src="/media/hero_images/img5.png"
              alt="Violin Night"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* COLUMN 5: RIGHTMOST - 2 VERTICAL IMAGES */}
        <div className="w-[18%] min-w-[90px] max-w-[245px] flex flex-col gap-2 sm:gap-3 md:gap-4 shrink-0">
          {/* Top image: The Link (robots / clarity meets creativity) */}
          <div className="w-full aspect-[3/3.75] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-[#0a182c]">
            <img
              src="/media/hero_images/img6.png"
              alt="Clarity Meets Creativity"
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Bottom image: 3D Chrome Icon (cut off at bottom) */}
          <div className="w-full h-[70px] sm:h-[100px] md:h-[130px] lg:h-[80px] xl:h-[100px] rounded-t-xl sm:rounded-t-2xl rounded-b-none overflow-hidden shadow-sm bg-[#112236]">
            <img
              src="/media/hero_images/img2.png"
              alt="3D Icon"
              className="w-full h-auto object-cover object-top"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Featured;
