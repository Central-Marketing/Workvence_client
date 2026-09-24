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
  Layers,
  icons,
  LucideIcon,
} from 'lucide-react';

// Common aliases mapping backend icon identifiers to Lucide icon component names
const ICON_ALIASES: Record<string, string> = {
  bullhorn: 'Megaphone',
  marketing: 'Megaphone',
  advertising: 'Megaphone',
  seo: 'Megaphone',
  'file-text': 'FileText',
  filetext: 'FileText',
  writing: 'FileText',
  pencil: 'Pencil',
  music: 'Music',
  audio: 'Music',
  sound: 'Music',
  palette: 'Palette',
  design: 'Palette',
  art: 'Palette',
  database: 'Database',
  data: 'Database',
  analytics: 'BarChart2',
  chart: 'BarChart2',
  barchart: 'BarChart2',
  barchart2: 'BarChart2',
  'bar-chart': 'BarChart2',
  'bar-chart-2': 'BarChart2',
  video: 'Film',
  film: 'Film',
  animation: 'Film',
  box: 'Box',
  '3d': 'Box',
  ai: 'Sparkles',
  artificial: 'Sparkles',
  sparkles: 'Sparkles',
  brain: 'Brain',
  code: 'Code',
  programming: 'Code',
  development: 'Code',
  tech: 'Code',
  web: 'Code',
  software: 'Code',
  business: 'Briefcase',
  consulting: 'Briefcase',
  briefcase: 'Briefcase',
  ecommerce: 'ShoppingCart',
  'e-commerce': 'ShoppingCart',
  commerce: 'ShoppingCart',
  shoppingcart: 'ShoppingCart',
  'shopping-cart': 'ShoppingCart',
  camera: 'Camera',
  photo: 'Camera',
  photography: 'Camera',
  layers: 'Layers',
  cpu: 'Cpu',
};

// Converts 'file-text' or 'bar-chart-2' into PascalCase ('FileText', 'BarChart2')
const toPascalCase = (str: string): string =>
  str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[a-z]/, (c) => c.toUpperCase());

// Dynamically resolves category icons supporting images, URLs, and any Lucide icon name
const getCategoryIcon = (iconVal?: any, nameStr?: string) => {
  let iconRaw = '';
  if (typeof iconVal === 'string') {
    iconRaw = iconVal.trim();
  } else if (iconVal && typeof iconVal === 'object') {
    iconRaw = (iconVal.url || iconVal.name || iconVal.secure_url || iconVal.src || '').trim();
  }
  const nameLower = (nameStr || '').toLowerCase();

  // 1. If icon is an image URL (Cloudinary, CDN, HTTP, SVG, local path, etc.)
  if (
    iconRaw &&
    (iconRaw.startsWith('http://') ||
      iconRaw.startsWith('https://') ||
      iconRaw.startsWith('/') ||
      iconRaw.startsWith('data:') ||
      /\.(svg|png|jpg|jpeg|webp|gif)$/i.test(iconRaw))
  ) {
    return (
      <img
        src={iconRaw}
        alt={nameStr || 'Category Icon'}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0"
      />
    );
  }

  // 2. Direct Lucide icon lookup by name / alias / case
  if (iconRaw) {
    // Check aliases
    const alias = ICON_ALIASES[iconRaw.toLowerCase()];
    if (alias && (icons as Record<string, LucideIcon>)[alias]) {
      const IconComp = (icons as Record<string, LucideIcon>)[alias];
      return <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }

    // Direct PascalCase check
    if ((icons as Record<string, LucideIcon>)[iconRaw]) {
      const IconComp = (icons as Record<string, LucideIcon>)[iconRaw];
      return <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }

    // Converted PascalCase check
    const pascal = toPascalCase(iconRaw);
    if ((icons as Record<string, LucideIcon>)[pascal]) {
      const IconComp = (icons as Record<string, LucideIcon>)[pascal];
      return <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }

    // Case-insensitive / normalized lookup across all Lucide icons
    const normalized = iconRaw.replace(/[-_\s]/g, '').toLowerCase();
    const matchedKey = Object.keys(icons).find((k) => k.toLowerCase() === normalized);
    if (matchedKey && (icons as Record<string, LucideIcon>)[matchedKey]) {
      const IconComp = (icons as Record<string, LucideIcon>)[matchedKey];
      return <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
    }
  }

  // 3. Intelligent keyword fallback based on category name
  if (nameLower.includes('ai') || nameLower.includes('artificial') || nameLower.includes('machine learning')) {
    return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('code') ||
    nameLower.includes('program') ||
    nameLower.includes('tech') ||
    nameLower.includes('web') ||
    nameLower.includes('develop') ||
    nameLower.includes('software')
  ) {
    return <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('design') ||
    nameLower.includes('graphic') ||
    nameLower.includes('art') ||
    nameLower.includes('creative') ||
    nameLower.includes('logo') ||
    nameLower.includes('ui') ||
    nameLower.includes('ux')
  ) {
    return <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('market') ||
    nameLower.includes('digital') ||
    nameLower.includes('seo') ||
    nameLower.includes('social') ||
    nameLower.includes('advertis')
  ) {
    return <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('video') ||
    nameLower.includes('film') ||
    nameLower.includes('animat') ||
    nameLower.includes('editing')
  ) {
    return <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('music') ||
    nameLower.includes('audio') ||
    nameLower.includes('sound') ||
    nameLower.includes('voice') ||
    nameLower.includes('podcast')
  ) {
    return <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('writ') ||
    nameLower.includes('translat') ||
    nameLower.includes('content') ||
    nameLower.includes('copywrit')
  ) {
    return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('business') ||
    nameLower.includes('consult') ||
    nameLower.includes('finance') ||
    nameLower.includes('legal')
  ) {
    return <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    nameLower.includes('data') ||
    nameLower.includes('analyt') ||
    nameLower.includes('intelligence') ||
    nameLower.includes('database')
  ) {
    return <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (nameLower.includes('commerce') || nameLower.includes('store') || nameLower.includes('shop')) {
    return <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }

  // 4. Default fallback icon
  return <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
};

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const typewriterTlRef = useRef<gsap.core.Timeline | null>(null);

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

      // GSAP Typewriter animation for placeholder text
      const targetText = "What services are you looking for...";
      const proxy = { length: 0 };

      const typewriterTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.6,
        delay: 0.9,
      });

      // Clear placeholder at the start of typing cycle
      typewriterTl.set({}, {
        onComplete: () => {
          if (searchInputRef.current) {
            searchInputRef.current.placeholder = "";
          }
        },
      });

      // Forward typing
      typewriterTl.to(proxy, {
        length: targetText.length,
        duration: 2.2,
        ease: "none",
        onUpdate: () => {
          if (searchInputRef.current) {
            searchInputRef.current.placeholder = targetText.slice(
              0,
              Math.ceil(proxy.length)
            );
          }
        },
      });

      // Pause so user can comfortably read
      typewriterTl.to({}, { duration: 2.5 });

      // Backspace / erasing
      typewriterTl.to(proxy, {
        length: 0,
        duration: 1.0,
        ease: "power1.inOut",
        onUpdate: () => {
          if (searchInputRef.current) {
            searchInputRef.current.placeholder = targetText.slice(
              0,
              Math.ceil(proxy.length)
            );
          }
        },
      });

      typewriterTlRef.current = typewriterTl;
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

  // Dynamically calculate visible screen height (full 100vh viewport starting after navbar)
  useEffect(() => {
    const calculateVisibleHeight = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const calculated = Math.max(500, windowHeight);
      setHeroHeight(calculated);
    };

    calculateVisibleHeight();
    window.addEventListener('resize', calculateVisibleHeight);
    window.addEventListener('orientationchange', calculateVisibleHeight);

    const t1 = setTimeout(calculateVisibleHeight, 50);
    const t2 = setTimeout(calculateVisibleHeight, 300);

    return () => {
      window.removeEventListener('resize', calculateVisibleHeight);
      window.removeEventListener('orientationchange', calculateVisibleHeight);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const { items, isOpen, setIsOpen, isLoading: isSuggestionsLoading, close: closeSuggestions } = useSearchSuggestions(search, { limit: 5 });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSelectSuggestion = (item: SuggestionItem | { text: string; type: 'query' }) => {
    const text = item.text.trim();
    closeSuggestions();
    setSearch(text);
    setSelectedIndex(-1);
    searchInputRef.current?.blur();
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
      const displayCount = Math.min(items.length, 5);
      const maxIndex = search.trim() ? displayCount : Math.max(0, displayCount - 1);
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const displayCount = Math.min(items.length, 5);
      const maxIndex = search.trim() ? displayCount : Math.max(0, displayCount - 1);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      return;
    }

    if (e.key === "Escape") {
      closeSuggestions();
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
      return;
    }

    if (e.key === "Enter") {
      const displayCount = Math.min(items.length, 5);
      if (selectedIndex >= 0 && selectedIndex < displayCount) {
        handleSelectSuggestion(items[selectedIndex]);
        return;
      }
      if (selectedIndex === displayCount && search.trim()) {
        closeSuggestions();
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        router.push(`/search?q=${encodeURIComponent(search.trim())}`);
        return;
      }
      if (search.trim()) {
        closeSuggestions();
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSuggestions();
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSuggestions]);

  const handleSearch = () => {
    closeSuggestions();
    setSelectedIndex(-1);
    searchInputRef.current?.blur();
    if (search.trim() || category) {
      router.push(`/packages?search=${encodeURIComponent(search.trim())}&category=${encodeURIComponent(category)}`);
    }
  };

  // Fetch real categories from backend database
  const { categoryList: rawCategories, parentCategories } = useAdminCategories();

  const categoryList = useMemo(() => {
    const source = parentCategories && parentCategories.length > 0 ? parentCategories : rawCategories;
    return source.map((cat: any) => {
      if (typeof cat === 'string') {
        const slug = cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return { name: cat, slug, icon: '' };
      }
      return {
        ...cat,
        name: cat.name || cat.title || String(cat),
        slug: cat.slug || (cat.name || cat.title || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        icon: cat.icon || cat.iconUrl || cat.iconName || cat.image || '',
      };
    });
  }, [rawCategories, parentCategories]);

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

  const remainingCategoriesCount = useMemo(() => {
    return Math.max(0, (categoryList?.length || 0) - displayedCategories.length);
  }, [categoryList, displayedCategories]);

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
        height: heroHeight ? `${heroHeight}px` : '100vh',
        minHeight: heroHeight ? `${heroHeight}px` : '100vh',
      }}
      className="relative w-full bg-black overflow-x-clip flex flex-col justify-center items-center py-6 sm:py-8 select-none"
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
            {/* White Search Input Container with Pink, Violet, Green Gradient Border on Hover */}
            <div className="relative group/search flex-1 w-full md:w-[800px] max-w-[800px] h-[52px] sm:h-[60px] rounded-[6px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all">
              {/* Gradient Border Layer (Pink: #FF5E8E, Violet: #8B5CF6, Green: #10B981) */}
              <div className="absolute -inset-[1.5px] rounded-[7.5px] bg-gradient-to-r from-[#FF5E8E] via-[#8B5CF6] to-[#10B981] opacity-0 group-hover/search:opacity-100 group-focus-within/search:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Inner White Box */}
              <div className="relative z-10 w-full h-full bg-white rounded-[6px] border border-black/10 group-hover/search:border-transparent group-focus-within/search:border-transparent px-4 sm:px-[20px] py-[10px] flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" strokeWidth={2} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedIndex(-1);
                      if (e.target.value) {
                        typewriterTlRef.current?.pause();
                      }
                    }}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      typewriterTlRef.current?.pause();
                      if (searchInputRef.current) {
                        searchInputRef.current.placeholder = "What services are you looking for...";
                      }
                      if (items.length > 0) setIsOpen(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsSearchFocused(false), 200);
                      if (!search) {
                        typewriterTlRef.current?.resume();
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="What services are you looking for..."
                    className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-[15px] placeholder:font-sf-pro text-sm sm:text-base font-normal font-sf-pro"
                  />
                </div>

                <SearchSuggestionsDropdown
                  items={items}
                  query={search}
                  isOpen={isOpen && isSearchFocused}
                  isLoading={isSuggestionsLoading}
                  selectedIndex={selectedIndex}
                  onSelect={(item) => {
                    setIsSearchFocused(false);
                    handleSelectSuggestion(item);
                  }}
                  onSeeMore={(q) => {
                    setIsSearchFocused(false);
                    closeSuggestions();
                    router.push(`/search?q=${encodeURIComponent(q)}`);
                  }}
                />
              </div>
            </div>

            {/* Search Now Button */}
            {/* <button
              type="button"
              onClick={handleSearch}
              className="bg-black hover:bg-[#0B403F] hover:shadow-[inset_0_0_8px_0_rgba(255,255,255,0.65)] text-white rounded-[6px] px-4 sm:px-6 py-[14px] sm:py-[18px] h-[52px] sm:h-[60px] flex items-center justify-center gap-[10px] shrink-0 font-medium text-xs sm:text-sm md:text-[15px] font-sf-pro transition-all duration-200 cursor-pointer shadow-md active:scale-95"
            >
              <span className="whitespace-nowrap">Search Now</span>
              <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white shrink-0" strokeWidth={2} />
            </button> */}
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
                {getCategoryIcon(cat.icon || cat.iconUrl || cat.iconName, cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}

            <Link
              href="/packages"
              className="inline-flex items-center text-white text-xs sm:text-[13px] font-medium underline underline-offset-4 hover:text-white/80 transition-colors ml-1.5 shrink-0 cursor-pointer"
            >
              {remainingCategoriesCount > 0 ? `+${remainingCategoriesCount} More` : 'Explore All'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Featured;
