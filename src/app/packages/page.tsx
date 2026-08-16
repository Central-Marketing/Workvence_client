// @ts-nocheck
"use client";
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { PackageCard, Loader, TopRatedSellers, GigsGridSkeleton } from '@/components';
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import adminAxios from "@/utils/adminAxios";

const DEFAULT_CATEGORIES = [
  "All services",
  "Technology & Programming",
  "Writing & Translation",
  "Design",
  "Digital Marketing",
  "Video, Photo & Image",
  "Business",
  "Music & Audio",
  "Social Media",
];

const mockRecommendedPackages = [
  {
    _id: "rec-1",
    title: "I will create a professional and user-friendly website design for your ...",
    price: 75,
    starNumber: 482,
    totalStars: 2361.8,
    cover: "/PackageImages.png",
    userID: { username: "Leslie", image: "/media/noavatar.png" }
  },
  {
    _id: "rec-2",
    title: "I will create a professional and user-friendly website design for your ...",
    price: 75,
    starNumber: 482,
    totalStars: 2361.8,
    cover: "/packageImg.jpg",
    userID: { username: "Leslie", image: "/media/noavatar.png" }
  },
  {
    _id: "rec-3",
    title: "I will create a professional and user-friendly website design for your ...",
    price: 75,
    starNumber: 482,
    totalStars: 2361.8,
    cover: "/PackageImages.png",
    userID: { username: "Leslie", image: "/media/noavatar.png" }
  },
  {
    _id: "rec-4",
    title: "I will create a professional and user-friendly website design for your ...",
    price: 75,
    starNumber: 482,
    totalStars: 2361.8,
    cover: "/packageImg.jpg",
    userID: { username: "Leslie", image: "/media/noavatar.png" }
  }
];

const Packages = () => {
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || "";
  const navigate = useRouter();

  // Parse initial state from URL params
  const initialParams = new URLSearchParams(search);
  const initialSearch = initialParams.get('search') || '';
  const initialCat = initialParams.get('category') || initialParams.get('cat') || 'All services';
  const initialMin = initialParams.get('min') || '';
  const initialMax = initialParams.get('max') || '';

  const initialSort = initialParams.get('sort') || 'createdAt';
  const initialPage = parseInt(initialParams.get('page') || '1', 10);

  const [sortBy, setSortBy] = useState(initialSort);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(initialPage);

  // Additional sidebar & tag filter states
  const [filterCategory, setFilterCategory] = useState(initialCat !== 'All services' && initialCat !== 'Results' ? initialCat : '');
  const [experience, setExperience] = useState({ entry: false, intermediate: false, expert: false });
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [englishLevel, setEnglishLevel] = useState('');
  const [clientLocation, setClientLocation] = useState('');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fetch categories from backend
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-packages-page'],
    queryFn: () => adminAxios.get('/categories').then(({ data }: any) => data).catch(() => [])
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const categories = useMemo(() => {
    if (categoryList.length === 0) {
      return DEFAULT_CATEGORIES.map((c: string) => ({
        name: c,
        slug: c === "All services" ? "All services" : c.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
    const formatted = categoryList.map((cat: any) => {
      if (typeof cat === 'string') {
        const slug = cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return { name: cat, slug };
      }
      const name = cat.name || cat.title || String(cat);
      const slug = cat.slug || name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return { name, slug };
    }).filter((c: any) => Boolean(c.name));

    return [{ name: "All services", slug: "All services" }, ...formatted];
  }, [categoryList]);

  const getSlugFromCat = (catInput: string) => {
    if (!catInput || catInput === 'All services' || catInput === 'Results') return '';
    const match = categories.find((c: any) =>
      c.slug?.toLowerCase() === catInput.toLowerCase() ||
      c.name?.toLowerCase() === catInput.toLowerCase()
    );
    if (match && match.slug && match.slug !== 'All services') return match.slug;
    return catInput.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Sync state when URL params externally change
  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(search);
    const cat = params.get('category') || params.get('cat');
    if (cat && cat !== 'All services' && cat !== 'Results') {
      const slug = getSlugFromCat(cat);
      setActiveCategory(slug);
      setFilterCategory(slug);
    } else {
      setActiveCategory('All services');
      setFilterCategory('');
    }
    setSearchVal(params.get('search') || '');
    setMinPrice(params.get('min') || '');
    setMaxPrice(params.get('max') || '');
    setSortBy(params.get('sort') || 'createdAt');
    setPage(parseInt(params.get('page') || '1', 10));
  }, [search, categories]);

  // Reactive React Query key ensuring automatic re-fetching whenever any filter state changes
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: [
      'packages',
      searchVal,
      activeCategory,
      filterCategory,
      minPrice,
      maxPrice,
      sortBy,
      page,
      JSON.stringify(experience),
      englishLevel,
      clientLocation
    ],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      
      if (searchVal && searchVal.trim()) {
        queryParams.set('search', searchVal.trim());
      }
      
      const selectedCat = filterCategory || (activeCategory !== 'All services' ? activeCategory : '');
      const catSlug = getSlugFromCat(selectedCat);
      if (catSlug) {
        queryParams.set('category', catSlug);
      }

      if (minPrice) queryParams.set('min', minPrice);
      if (maxPrice) queryParams.set('max', maxPrice);
      if (sortBy) queryParams.set('sort', sortBy);
      queryParams.set('limit', '20');
      queryParams.set('page', page.toString());

      return axiosFetch.get(`/gigs?${queryParams.toString()}`)
        .then(({ data }) => data || [])
        .catch(() => []);
    }
  });

  const { data: recommendedPackages } = useQuery({
    queryKey: ['recommendedPackages'],
    queryFn: () => axiosFetch.get('/gigs?limit=4').then(({ data }) => data || []).catch(() => []),
  });

  // Utility to update URL query params cleanly without full page reloads
  const syncUrlWithFilters = (overrides: any = {}) => {
    const params = new URLSearchParams();
    const currentSearch = overrides.searchVal !== undefined ? overrides.searchVal : searchVal;
    const rawCat = overrides.category !== undefined ? overrides.category : (filterCategory || (activeCategory !== 'All services' ? activeCategory : ''));
    const currentCatSlug = getSlugFromCat(rawCat);
    const currentMin = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const currentMax = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const currentSort = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;
    const currentPage = overrides.page !== undefined ? overrides.page : (overrides.resetPage ? 1 : page);

    if (currentSearch && currentSearch.trim()) params.set('search', currentSearch.trim());
    if (currentCatSlug) params.set('category', currentCatSlug);
    if (currentMin) params.set('min', currentMin);
    if (currentMax) params.set('max', currentMax);
    if (currentSort && currentSort !== 'createdAt') params.set('sort', currentSort);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    navigate.push(`/packages?${params.toString()}`, { scroll: false });
  };

  const handleApplyFilter = () => {
    syncUrlWithFilters();
    refetch();
    setShowFilter(false);
  };

  const handleCategoryClick = (cat: any) => {
    const slug = typeof cat === 'string' ? cat : cat.slug;
    const name = typeof cat === 'string' ? cat : cat.name;

    if (slug === 'All services' || name === 'All services') {
      setActiveCategory('All services');
      setFilterCategory('');
      syncUrlWithFilters({ category: '' });
    } else {
      setActiveCategory(slug);
      setFilterCategory(slug);
      syncUrlWithFilters({ category: slug });
    }
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchVal('');
    setFilterCategory('');
    setActiveCategory('All services');
    setExperience({ entry: false, intermediate: false, expert: false });
    setEnglishLevel('');
    setClientLocation('');
    navigate.push('/packages', { scroll: false });
  };

  const toggleExperience = (key: string) => {
    setExperience((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasActiveFilters = Boolean(
    searchVal ||
    (activeCategory !== 'All services' && activeCategory !== 'Results') ||
    filterCategory ||
    minPrice ||
    maxPrice ||
    experience.entry ||
    experience.intermediate ||
    experience.expert ||
    englishLevel ||
    clientLocation
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Category Tabs Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-10 select-none">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 relative flex items-center group">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="flex items-center justify-center absolute left-1 z-20 w-7 h-7 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white transition-all cursor-pointer opacity-80 hover:opacity-100 xl:hidden"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0 w-full scroll-smooth touch-pan-x overscroll-x-contain px-2 xl:px-0"
          >
            {categories.map((cat: any) => {
              const name = typeof cat === 'string' ? cat : cat.name;
              const slug = typeof cat === 'string' ? cat : cat.slug;
              const isActive = activeCategory === slug || activeCategory === name || filterCategory === slug || filterCategory === name;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex-shrink-0 px-4 py-4 text-[13.5px] font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="flex items-center justify-center absolute right-1 z-20 w-7 h-7 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white transition-all cursor-pointer opacity-80 hover:opacity-100 xl:hidden"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb + Filter Button Row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-gray-500">
              Home / <span className="text-gray-800 font-medium">Search Result</span>
            </p>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M7 12H17M11 18H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Filter
          </button>
        </div>

        {/* Active Filter Tags & Results Count Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8 pt-1">
          <span className="text-[15px] font-bold text-gray-900 mr-2">
            {data && Array.isArray(data) ? `${data.length} Results` : "0 Results"}
          </span>
          
          {hasActiveFilters && (
            <>
              <div className="h-5 w-[1px] bg-gray-300 hidden sm:block mr-1"></div>
              
              {/* Keyword Tag */}
              {searchVal && (
                <button 
                  onClick={() => { setSearchVal(''); syncUrlWithFilters({ searchVal: '' }); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>{searchVal}</span>
                </button>
              )}

              {/* Active Category Tag */}
              {(filterCategory || (activeCategory !== 'All services' && activeCategory !== 'Results')) && (
                <button 
                  onClick={() => { setFilterCategory(''); setActiveCategory('All services'); syncUrlWithFilters({ category: '' }); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>{filterCategory || activeCategory}</span>
                </button>
              )}

              {/* Price Range Tag */}
              {(minPrice || maxPrice) && (
                <button 
                  onClick={() => { setMinPrice(''); setMaxPrice(''); syncUrlWithFilters({ minPrice: '', maxPrice: '' }); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 font-bold group-hover:text-red-500 transition-colors">—</span> 
                  <span>${minPrice || '0'} - ${maxPrice || 'Any'}</span>
                </button>
              )}

              {/* Experience Tags */}
              {experience.entry && (
                <button 
                  onClick={() => { toggleExperience('entry'); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>Entry Level</span>
                </button>
              )}
              {experience.intermediate && (
                <button 
                  onClick={() => { toggleExperience('intermediate'); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>Intermediate</span>
                </button>
              )}
              {experience.expert && (
                <button 
                  onClick={() => { toggleExperience('expert'); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>Expert</span>
                </button>
              )}

              {/* English Level Tag */}
              {englishLevel && (
                <button 
                  onClick={() => { setEnglishLevel(''); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>{englishLevel === 'basic' ? 'Basic English' : englishLevel === 'fluent' ? 'Fluent English' : 'Native English'}</span>
                </button>
              )}

              {/* Location Tag */}
              {clientLocation && (
                <button 
                  onClick={() => { setClientLocation(''); }} 
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                >
                  <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span> 
                  <span>{clientLocation}</span>
                </button>
              )}

              {/* Clear All Pill Button */}
              <button 
                onClick={handleReset} 
                className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 font-semibold transition-colors shadow-sm ml-1"
              >
                <span>✕</span> Clear All
              </button>
            </>
          )}
        </div>

        {/* Sidebar Filter Modal / Drawer */}
        {showFilter && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark Overlay */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-fadeIn" 
              onClick={() => setShowFilter(false)} 
            />

            {/* Slide-out Panel */}
            <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft overflow-hidden">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                </div>
                <button 
                  onClick={() => setShowFilter(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 text-left">

                {/* 1. Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
                  <div className="relative flex items-center">
                    <svg className="absolute left-3.5 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Project title, key words..."
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-green bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select
                    value={filterCategory || activeCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilterCategory(val);
                      if (val && val !== 'All services') setActiveCategory(val);
                      else setActiveCategory('All services');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-green bg-white transition-colors cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Packaging Design">Packaging Design</option>
                  </select>
                </div>

                {/* 3. Experience Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Experience level</label>
                  <div className="space-y-3">
                    {[
                      { key: 'entry', label: 'Entry Level' },
                      { key: 'intermediate', label: 'Intermediate' },
                      { key: 'expert', label: 'Expert' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={experience[key as keyof typeof experience]}
                          onChange={() => toggleExperience(key)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4. Filter by Fixed-Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">Filter by Fixed-Price</label>
                  
                  {/* Visual Range Indicator with Badges */}
                  <div className="relative px-2 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                      <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shadow-2xs">${minPrice || '0'}</span>
                      <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shadow-2xs">${maxPrice || '2500'}</span>
                    </div>
                    {/* Bar graphic */}
                    <div className="h-1.5 bg-gray-200 rounded-full relative flex items-center">
                      <div className="absolute left-[15%] right-[25%] h-full bg-gray-900 rounded-full"></div>
                      <div className="absolute left-[15%] w-4 h-4 rounded-full bg-white border-2 border-gray-900 shadow -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"></div>
                      <div className="absolute right-[25%] w-4 h-4 rounded-full bg-white border-2 border-gray-900 shadow translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"></div>
                    </div>
                  </div>

                  {/* Min / Max Inputs */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2 bg-white focus-within:border-brand-green transition-colors">
                      <span className="text-gray-700 font-medium text-sm mr-1.5">$</span>
                      <input 
                        type="number" 
                        placeholder="100" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none pr-6" 
                      />
                      <span className="absolute right-3 text-xs text-gray-400 select-none">min</span>
                    </div>
                    <span className="text-gray-400 font-medium">-</span>
                    <div className="flex-1 relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2 bg-white focus-within:border-brand-green transition-colors">
                      <span className="text-gray-700 font-medium text-sm mr-1.5">$</span>
                      <input 
                        type="number" 
                        placeholder="1000" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none pr-6" 
                      />
                      <span className="absolute right-3 text-xs text-gray-400 select-none">max</span>
                    </div>
                  </div>
                </div>

                {/* 5. English Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">English Level</label>
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-green bg-white transition-colors cursor-pointer"
                  >
                    <option value="">Select english level</option>
                    <option value="basic">Basic / Conversational</option>
                    <option value="fluent">Fluent</option>
                    <option value="native">Native / Bilingual</option>
                  </select>
                </div>

                {/* 6. Client Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Client Location</label>
                  <select
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-green bg-white transition-colors cursor-pointer"
                  >
                    <option value="">Select client location</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="EU">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Global">Worldwide</option>
                  </select>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-end gap-4">
                <button 
                  onClick={handleReset}
                  className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-2 py-2"
                >
                  Clear filter
                </button>
                <button 
                  onClick={handleApplyFilter}
                  className="bg-brand-green hover:bg-brand-green text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Apply filter
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Results Grid / Empty State */}
        {isLoading ? (
          <div className="py-6">
            <GigsGridSkeleton count={8} />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-gray-500">Something went wrong. Please try again.</div>
        ) : (!data || data.length === 0) ? (
          <div className="py-6 w-full animate-fadeIn">
            {/* Empty State Illustration & Text */}
            <div className="text-center flex flex-col items-center justify-center max-w-xl mx-auto mb-24">
              <img 
                src="/404.png" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/404Img.png"; }}
                alt="Package Not Found" 
                className="w-full max-w-[420px] h-auto object-contain mb-8" 
              />
              <h2 className="text-[28px] sm:text-[34px] font-bold text-gray-900 mb-3 tracking-tight">
                Oops! This <span className="text-brand-green">Package</span> Doesn&apos;t Exist.
              </h2>
              <p className="text-[15px] sm:text-base text-gray-500 max-w-[450px] leading-relaxed">
                The package you&apos;re looking for may have been removed, changed, or is temporarily unavailable.
              </p>
            </div>

            {/* You may also like Section */}
            <div className="w-full pt-4">
              <h3 className="text-2xl sm:text-[28px] font-bold text-gray-900 mb-6 text-left">
                You may also like:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {recommendedPackages && recommendedPackages.length > 0 ? recommendedPackages.slice(0, 4).map((pkg: any) => (
                  <PackageCard key={pkg._id || pkg.id} data={pkg} />
                )) : mockRecommendedPackages.map((pkg: any) => (
                  <PackageCard key={pkg._id || pkg.id} data={pkg} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {data?.map((pkg: any) => <PackageCard key={pkg._id} data={pkg} />)}
          </div>
        )}

        {/* Pagination Controls */}
        {data && data.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-4">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                syncUrlWithFilters({ page: page - 1 });
              }}
              disabled={page === 1}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Previous
            </button>
            <span className="font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">Page {page}</span>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                syncUrlWithFilters({ page: page + 1 });
              }}
              disabled={data.length < 20}
              className="px-6 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-[#3ea917] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <TopRatedSellers />
    </div>
  );
};

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader size={45} /></div>}>
      <Packages />
    </Suspense>
  );
}