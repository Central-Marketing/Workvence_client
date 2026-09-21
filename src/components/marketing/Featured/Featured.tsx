"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAdminCategories from '@/hooks/useAdminCategories';
import useSearchSuggestions, { SuggestionItem } from '@/hooks/useSearchSuggestions';
import { SearchSuggestionsDropdown } from '@/components/ui';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Search,
  ArrowRight,
  Sparkles,
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

interface FeaturedProps {
  videoSrc?: string;
  posterSrc?: string;
}

const Featured = ({
  videoSrc = "https://res.cloudinary.com/dlqhnyh8r/video/upload/q_auto,f_auto/6888552d6e57e969b9310e5a-oxjvcigoro_1080__D.mp4_h7un4d.mp4",
  posterSrc = "https://res.cloudinary.com/dlqhnyh8r/video/upload/so_0,q_auto,f_auto/6888552d6e57e969b9310e5a-oxjvcigoro_1080__D.mp4_h7un4d.jpg",
}: FeaturedProps = {}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [heroHeight, setHeroHeight] = useState<number | null>(null);

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Headline entrance (smooth upward drift)
      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            force3D: true,
            clearProps: 'transform',
          }
        );
      }

      // 2. Subtitle & Search Bar entrance
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            force3D: true,
            clearProps: 'transform',
          },
          '-=0.6'
        );
      }

      if (searchRef.current) {
        tl.fromTo(
          searchRef.current,
          { y: 20, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            force3D: true,
            clearProps: 'transform',
          },
          '-=0.55'
        );
      }
    },
    { scope: containerRef }
  );

  // Programmatic autoplay recovery for mobile/desktop browser policies
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy prevented playback (e.g. low-power mode)
      });
    }
  }, []);

  // Performance assurance: pause video when scrolled off-screen, resume when visible
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Dynamically calculate visible screen height without navbar
  useEffect(() => {
    const calculateVisibleHeight = () => {
      const navEl = document.querySelector('nav');
      const featuredEl = containerRef.current;

      let navHeight = 80;
      if (featuredEl) {
        // Measure exact offset from top of document to top of hero section
        const rect = featuredEl.getBoundingClientRect();
        const heroTop = rect.top + window.scrollY;
        if (heroTop > 0) {
          navHeight = heroTop;
        } else if (navEl) {
          navHeight = navEl.getBoundingClientRect().height || 80;
        }
      } else if (navEl) {
        navHeight = navEl.getBoundingClientRect().height || 80;
      }

      // Use window.innerHeight or documentElement.clientHeight for exact visible viewport
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const calculated = Math.max(450, windowHeight - navHeight);
      setHeroHeight(calculated);
    };

    calculateVisibleHeight();
    window.addEventListener('resize', calculateVisibleHeight);
    window.addEventListener('orientationchange', calculateVisibleHeight);

    // Re-verify after initial render, image loads, and layout settles
    const t1 = setTimeout(calculateVisibleHeight, 50);
    const t2 = setTimeout(calculateVisibleHeight, 300);

    return () => {
      window.removeEventListener('resize', calculateVisibleHeight);
      window.removeEventListener('orientationchange', calculateVisibleHeight);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const { items, isOpen, setIsOpen, isLoading: isSuggestionsLoading } = useSearchSuggestions(search, { limit: 8 });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleSelectSuggestion = (item: SuggestionItem | { text: string; type: 'query' }) => {
    const text = item.text.trim();
    setSearch(text);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (item.type === 'category') {
      router.push(`/packages?category=${encodeURIComponent((item as SuggestionItem).slug || text)}`);
    } else {
      router.push(`/packages?search=${encodeURIComponent(text)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && items.length > 0) {
        setIsOpen(true);
      }
      const maxIndex = search.trim() ? items.length : items.length - 1;
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const maxIndex = search.trim() ? items.length : items.length - 1;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        handleSelectSuggestion(items[selectedIndex]);
        return;
      }
      if (selectedIndex === items.length && search.trim()) {
        handleSelectSuggestion({ text: search.trim(), type: 'query' });
        return;
      }
      if (search.trim()) {
        setIsOpen(false);
        handleSearch();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const handleSearch = () => {
    if (search.trim() || category) {
      router.push(`/packages?search=${encodeURIComponent(search.trim())}&category=${encodeURIComponent(category)}`);
    }
  };

  // Fetch real categories from backend database
  const { categoryList: rawCategories } = useAdminCategories();

  const categoryList = useMemo(() => {
    return rawCategories.map((cat: any) => {
      if (typeof cat === 'string') {
        const slug = cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return { name: cat, slug, icon: '' };
      }
      return {
        name: cat.name || cat.title || String(cat),
        slug: cat.slug || (cat.name || cat.title || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        icon: cat.icon || '',
      };
    });
  }, [rawCategories]);

  const getCategoryIcon = (iconStr?: string, nameStr?: string) => {
    const iconKey = (iconStr || '').toLowerCase().replace(/[-_]/g, '');
    const nameKey = (nameStr || '').toLowerCase();

    if (iconKey === 'sparkles' || iconKey === 'ai' || nameKey.includes('ai') || nameKey.includes('artificial')) {
      return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'code' || nameKey.includes('program') || nameKey.includes('tech') || nameKey.includes('code') || nameKey.includes('web') || nameKey.includes('develop')) {
      return <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'palette' || nameKey.includes('design') || nameKey.includes('graphic') || nameKey.includes('art')) {
      return <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'music' || nameKey.includes('music') || nameKey.includes('audio') || nameKey.includes('sound')) {
      return <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'bullhorn' || nameKey.includes('market') || nameKey.includes('digital')) {
      return <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'video' || nameKey.includes('video') || nameKey.includes('animation')) {
      return <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'briefcase' || nameKey.includes('business') || nameKey.includes('consulting')) {
      return <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'barchart' || iconKey === 'chart' || nameKey.includes('data') || nameKey.includes('analytics')) {
      return <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
    if (iconKey === 'shoppingcart' || nameKey.includes('e-commerce') || nameKey.includes('commerce')) {
      return <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }

    return <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  };

  const displayedCategories = useMemo(() => {
    if (categoryList && categoryList.length >= 4) {
      return categoryList.slice(0, 4);
    }
    return [
      { name: 'Ai Engineering', slug: 'ai-engineering', icon: 'sparkles' },
      { name: 'Website Development', slug: 'website-development', icon: 'code' },
      { name: 'Graphics Design', slug: 'graphics-design', icon: 'palette' },
      { name: 'Music Production', slug: 'music-production', icon: 'music' },
    ];
  }, [categoryList]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return categoryList.filter((cat: any) => {
      const name = (cat.name || '').toLowerCase();
      const slug = (cat.slug || '').toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [search, categoryList]);

  return (
    <section
      ref={containerRef}
      id="featured-section"
      style={{
        height: heroHeight ? `${heroHeight}px` : 'calc(100vh - var(--navbar-height, 80px))',
        minHeight: heroHeight ? `${heroHeight}px` : 'calc(100vh - var(--navbar-height, 80px))',
      }}
      className="relative w-full bg-black overflow-x-clip flex flex-col justify-center items-center py-4 sm:py-6 md:py-8 select-none"
    >
      {/* Background Video Layer with High Quality Assurance */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          className="w-full h-full object-cover object-center"
        >
          <source src={videoSrc} type="video/mp4" />
          <source
            src="https://res.cloudinary.com/dlqhnyh8r/video/upload/6888552d6e57e969b9310e5a-oxjvcigoro_1080__D.mp4_h7un4d.mp4"
            type="video/mp4"
          />
        </video>

        {/* Video Overlay from Figma */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, #000 100%)',
          }}
        />
      </div>

      {/* TOP HEADER & SEARCH CONTENT */}
      <div className="relative z-20 container mx-auto px-4 text-center max-w-[1100px] flex flex-col items-center">
        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-sf-pro font-[510] text-[28px] sm:text-[40px] md:text-[50px] lg:text-[56px] xl:text-[64px] macbook:text-[68px] 2xl:text-[84px] text-white tracking-[0px] leading-[1.08] text-center mb-4 sm:mb-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
        >
          <span className="block text-white">
            Find the right <span className="text-[#7CE7DA]">freelancer</span>
          </span>
          <span className="block text-white">
            and get to work in minutes.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-[#C7C7C7] text-xs sm:text-sm md:text-lg font-normal font-inter max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
        >
          Search thousands of vetted sellers, order in under a minute, and start today.
        </p>

        {/* Search Bar & Dynamic Category Pills Container */}
        <div
          ref={searchRef}
          className="relative w-full max-w-[640px] sm:max-w-[760px] md:max-w-[980px] flex flex-col items-center"
        >
          {/* Row 1: Search Input Box + Search Now Button */}
          <div className="w-full flex items-center justify-center gap-2.5 sm:gap-3 my-[40px]">
            {/* White Search Input Container */}
            <div className="relative flex-1 w-full md:w-[800px] max-w-[800px] h-[52px] sm:h-[60px] px-4 sm:px-[20px] py-[10px] bg-white rounded-[4px] border border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 transition-all focus-within:border-black/30">
              <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" strokeWidth={2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    if (items.length > 0) setIsOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="What services are you looking for..."
                  className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-[15px] placeholder:font-sf-pro text-sm sm:text-base font-normal font-sf-pro"
                />
              </div>

              <SearchSuggestionsDropdown
                items={items}
                query={search}
                isOpen={isOpen}
                isLoading={isSuggestionsLoading}
                selectedIndex={selectedIndex}
                onSelect={handleSelectSuggestion}
              />
            </div>

            {/* Black Search Now Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="bg-black hover:bg-neutral-900 text-white rounded-[4px] px-4 sm:px-6 py-[14px] sm:py-[18px] h-[52px] sm:h-[60px] flex items-center justify-center gap-[10px] shrink-0 font-medium text-xs sm:text-sm md:text-[15px] font-sf-pro transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span className="whitespace-nowrap">Search Now</span>
              <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white shrink-0" strokeWidth={2} />
            </button>
          </div>

          {/* Row 2: Dynamic Category Pills + More 200+ */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full">
            {displayedCategories.map((cat: any) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => router.push(`/packages?category=${encodeURIComponent(cat.slug)}`)}
                className="flex items-center gap-[10px] pl-[10px] pr-[12px] py-[6px] rounded-[4px] bg-white/10 hover:bg-white/20 backdrop-blur-[50px] text-white text-xs sm:text-[13px] font-medium transition-all cursor-pointer active:scale-95"
              >
                {getCategoryIcon(cat.icon, cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}

            <Link
              href="/packages"
              className="inline-flex items-center text-white text-xs sm:text-[13px] font-medium underline underline-offset-4 hover:text-white/80 transition-colors ml-1.5 shrink-0 cursor-pointer"
            >
              More 200+
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Featured;
