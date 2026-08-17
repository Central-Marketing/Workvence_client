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
    if (search || category) {
      router.push(`/packages?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
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

    if (iconKey === 'palette' || nameKey.includes('design') || nameKey.includes('graphic')) return <Palette size={20} strokeWidth={1.5} />;
    if (iconKey === 'code' || nameKey.includes('program') || nameKey.includes('tech') || nameKey.includes('code')) return <Code size={20} strokeWidth={1.5} />;
    if (iconKey === 'bullhorn' || nameKey.includes('market') || nameKey.includes('digital')) return <Megaphone size={20} strokeWidth={1.5} />;
    if (iconKey === 'video' || nameKey.includes('video') || nameKey.includes('animation')) return <Film size={20} strokeWidth={1.5} />;
    if (iconKey === 'cpu' || nameKey.includes('ai')) return <Cpu size={20} strokeWidth={1.5} />;
    if (iconKey === 'filetext' || nameKey.includes('write') || nameKey.includes('translation')) return <FileText size={20} strokeWidth={1.5} />;
    if (iconKey === 'briefcase' || nameKey.includes('business') || nameKey.includes('consulting')) return <Briefcase size={20} strokeWidth={1.5} />;
    if (iconKey === 'music' || nameKey.includes('music') || nameKey.includes('audio')) return <Music size={20} strokeWidth={1.5} />;
    if (iconKey === 'barchart' || iconKey === 'chart' || nameKey.includes('data') || nameKey.includes('analytics')) return <BarChart2 size={20} strokeWidth={1.5} />;
    if (iconKey === 'shoppingcart' || nameKey.includes('e-commerce') || nameKey.includes('commerce')) return <ShoppingCart size={20} strokeWidth={1.5} />;
    if (iconKey === 'star' || nameKey.includes('other') || nameKey.includes('general')) return <Star size={20} strokeWidth={1.5} />;

    return <Layers size={20} strokeWidth={1.5} />;
  };

  const filteredCategories = categoryList.filter((cat: any) => {
    const name = cat.name || cat.title || String(cat);
    return name.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[calc(100vh-80px)] bg-[#FAFAFC] overflow-hidden flex items-center justify-center py-12 lg:py-16 border-b border-slate-100">

      {/* DESKTOP LEFT SIDE FLOATING CLUSTER (lg:block) */}
      <div className="hidden lg:block absolute left-0 xl:left-2 2xl:left-8 top-1/2 -translate-y-1/2 w-[320px] xl:w-[360px] h-[520px] pointer-events-none z-0 opacity-40 xl:opacity-60 hover:opacity-100 transition-all duration-500 scale-[0.60] xl:scale-80 2xl:scale-100 origin-left">
        {/* L1: Far Top Left Small */}
        <div className="absolute top-4 left-0 w-[115px] h-[105px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 mix-blend-multiply">
          <img src="/media/hero_images/img1.jpeg" alt="Work" className="w-full h-full object-cover" />
        </div>
        {/* L2: Top Right Medium */}
        <div className="absolute top-0 left-[130px] w-[105px] h-[105px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 mix-blend-multiply">
          <img src="/media/hero_images/img2.jpeg" alt="Audio" className="w-full h-full object-cover" />
        </div>
        {/* L3: Middle Main Large Feature Card */}
        <div className="absolute top-[120px] left-[120px] w-[175px] h-[175px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 mix-blend-multiply">
          <img src="/media/hero_images/img3.jpeg" alt="3D Art" className="w-full h-full object-cover" />
        </div>
        {/* L4: Middle Left Small */}
        <div className="absolute top-[160px] left-[10px] w-[95px] h-[95px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 mix-blend-multiply">
          <img src="/media/hero_images/img4.jpeg" alt="Design" className="w-full h-full object-cover" />
        </div>
        {/* L5: Bottom Left Main Tile */}
        <div className="absolute top-[310px] left-0 w-[145px] h-[165px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 mix-blend-multiply">
          <img src="/media/hero_images/img5.jpeg" alt="Development" className="w-full h-full object-cover" />
        </div>
        {/* L6: Bottom Right Tile */}
        <div className="absolute top-[320px] left-[160px] w-[135px] h-[120px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 mix-blend-multiply">
          <img src="/media/hero_images/img6.jpeg" alt="Creative" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* DESKTOP RIGHT SIDE FLOATING CLUSTER (lg:block) */}
      <div className="hidden lg:block absolute right-0 xl:right-2 2xl:right-8 top-1/2 -translate-y-1/2 w-[320px] xl:w-[360px] h-[520px] pointer-events-none z-0 opacity-40 xl:opacity-60 hover:opacity-100 transition-all duration-500 scale-[0.60] xl:scale-80 2xl:scale-100 origin-right">
        {/* R1: Far Top Right Large Feature Card */}
        <div className="absolute top-0 right-0 w-[175px] h-[175px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 mix-blend-multiply">
          <img src="/media/hero_images/img7.jpeg" alt="Analytics" className="w-full h-full object-cover" />
        </div>
        {/* R2: Top Left Small */}
        <div className="absolute top-[85px] right-[190px] w-[95px] h-[95px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 mix-blend-multiply">
          <img src="/media/hero_images/img8.jpeg" alt="Workspace" className="w-full h-full object-cover" />
        </div>
        {/* R3: Middle Left Main Large Feature Card */}
        <div className="absolute top-[195px] right-[145px] w-[160px] h-[160px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 mix-blend-multiply">
          <img src="/media/hero_images/img9.jpeg" alt="Platform" className="w-full h-full object-cover" />
        </div>
        {/* R4: Middle Right Medium */}
        <div className="absolute top-[190px] right-0 w-[130px] h-[130px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 mix-blend-multiply">
          <img src="/media/hero_images/img10.jpeg" alt="Showcase" className="w-full h-full object-cover" />
        </div>
        {/* R5: Bottom Right Tile */}
        <div className="absolute top-[335px] right-0 w-[155px] h-[155px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 mix-blend-multiply">
          <img src="/media/hero_images/img11.jpeg" alt="Projects" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* CENTER HERO CONTENT */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 flex flex-col items-center text-center max-w-4xl my-auto">

        {/* MAIN HEADLINE SPLIT INTO EXACT 3 LINES */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[84px] font-bold text-black mb-6 flex flex-col items-center leading-[1.05]">
          <span>The World’s</span>
          <span className="text-brand-green">Best Creators</span>
          <span>Are on Workvence.</span>
        </h1>

        {/* SUBHEADING PARAGRAPH */}
        <p className="text-slate-600 text-lg sm:text-xl md:text-2xl font-normal max-w-3xl leading-relaxed mb-10">
          Workvence helps you discover skilled freelancers across design, development, marketing, writing, video, and more. Compare services, review portfolios, and hire with confidence.
        </p>

        {/* SEARCH BAR CONTAINER */}
        <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:shadow-[0_12px_40px_rgba(64,170,21,0.15)] focus-within:border-brand-green/40">
          <div className="flex items-center gap-3 flex-1 w-full px-4 py-2 sm:py-0">
            <Search size={22} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search services, skills, or keywords..."
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm sm:text-base font-medium"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-brand-green hover:bg-[#389115] text-white px-8 py-3.5 rounded-xl sm:rounded-full font-bold text-base transition-colors shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Search</span>
          </button>
        </div>

        {/* MOBILE BOTTOM AMBIENT STRIP (< 1024px) - 2 ROWS (ROW 1: 3, ROW 2: 2) */}
        <div className="lg:hidden flex flex-col items-center gap-2 mt-8 w-full opacity-50 mix-blend-multiply overflow-hidden px-2 pointer-events-none">
          {/* Row 1 (3 images) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shadow-2xs border border-slate-200/40 shrink-0">
              <img src="/media/hero_images/img1.jpeg" alt="Artwork" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden shadow-xs border border-slate-200/50 shrink-0">
              <img src="/media/hero_images/img3.jpeg" alt="Artwork" className="w-full h-full object-cover" />
            </div>
            <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shadow-2xs border border-slate-200/40 shrink-0">
              <img src="/media/hero_images/img7.jpeg" alt="Artwork" className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Row 2 (2 images) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shadow-2xs border border-slate-200/40 shrink-0">
              <img src="/media/hero_images/img2.jpeg" alt="Artwork" className="w-full h-full object-cover" />
            </div>
            <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shadow-2xs border border-slate-200/40 shrink-0">
              <img src="/media/hero_images/img4.jpeg" alt="Artwork" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* REAL BACKEND CATEGORY MATCHES IN GRAYSCALE */}
        <div className={`flex justify-center items-start flex-wrap w-full max-w-3xl mt-6 gap-2 sm:gap-4 overflow-hidden transition-all duration-300 ${search.trim().length > 0 ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
          {search.trim().length > 0 && filteredCategories.slice(0, 8).map((cat: any, index: number) => {
            const name = cat.name || cat.title || String(cat);
            const slug = cat.slug || name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const iconStr = cat.icon || '';

            return (
              <div
                key={slug || index}
                className="flex flex-col items-center gap-2 cursor-pointer transition group p-2 rounded-xl hover:bg-white hover:shadow-sm"
                onClick={() => router.push(`/packages?category=${encodeURIComponent(slug)}`)}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:bg-brand-green group-hover:text-white group-hover:border-brand-green transition-all">
                  {getCategoryIcon(iconStr, name)}
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors text-center max-w-[100px] truncate">
                  {name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Featured;