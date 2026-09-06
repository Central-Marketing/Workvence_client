"use client";
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import {
  PackageCard,
  Loader,
  TopRatedSellers,
  GigsGridSkeleton,
  CategoryHeroBanner,
  SubcategoryCard,
  SubcategoryHeader,
  SubcategoryFilterBar,
} from '@/components';
import { getCategoryTaxonomy, SubcategoryItem } from '@/data/categoryTaxonomy';
import { STATIC_SUBCATEGORY_GIGS, getStaticSubcategoryGigs } from '@/data/staticSubcategoryGigs';
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import adminAxios from "@/utils/adminAxios";
import { FiAlertCircle, FiRefreshCw, FiGrid, FiArrowRight, FiArrowLeft } from "react-icons/fi";

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

const Packages = () => {
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || "";
  const navigate = useRouter();

  // Parse initial state from URL params
  const initialParams = new URLSearchParams(search);
  const initialSearch = initialParams.get('search') || '';
  const initialCat = initialParams.get('category') || initialParams.get('cat') || 'All services';
  const initialSubcat = initialParams.get('subcat') || initialParams.get('subcategory') || '';
  const initialTag = initialParams.get('tag') || initialParams.get('service') || '';
  const initialMin = initialParams.get('min') || '';
  const initialMax = initialParams.get('max') || '';

  const initialSort = initialParams.get('sort') || 'createdAt';
  const initialPage = parseInt(initialParams.get('page') || '1', 10);

  const [sortBy, setSortBy] = useState(initialSort);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [activeSubcatId, setActiveSubcatId] = useState(initialSubcat);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [viewTab, setViewTab] = useState<'hub' | 'gigs'>(
    (initialSearch || initialMin || initialMax || initialSubcat || initialTag) ? 'gigs' : 'hub'
  );

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

    // Separate "Other & General" to ensure it is always placed last
    const regularCats = formatted.filter((c: any) =>
      c.slug !== 'other-and-general' &&
      c.slug !== 'other' &&
      !c.name.toLowerCase().includes('other')
    );
    const otherCats = formatted.filter((c: any) =>
      c.slug === 'other-and-general' ||
      c.slug === 'other' ||
      c.name.toLowerCase().includes('other')
    );

    return [{ name: "All services", slug: "All services" }, ...regularCats, ...otherCats];
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

  const currentTaxonomy = useMemo(() => {
    const selected = filterCategory || (activeCategory !== 'All services' && activeCategory !== 'Results' ? activeCategory : '');
    if (!selected) return null;
    return getCategoryTaxonomy(selected, categoryList);
  }, [filterCategory, activeCategory, categoryList]);

  // Sync state when URL params externally change
  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(search);
    const cat = params.get('category') || params.get('cat');
    const subcat = params.get('subcat') || params.get('subcategory') || '';
    const tag = params.get('tag') || params.get('service') || '';
    setActiveSubcatId(subcat);
    setActiveTag(tag);

    if (cat && cat !== 'All services' && cat !== 'Results') {
      const slug = getSlugFromCat(cat);
      setActiveCategory(slug);
      setFilterCategory(slug);
      if (params.get('search') || params.get('min') || params.get('max') || subcat || tag) {
        setViewTab('gigs');
      } else {
        setViewTab('hub');
      }
    } else {
      setActiveCategory('All services');
      setFilterCategory('');
      setViewTab('gigs');
    }
    setSearchVal(params.get('search') || '');
    setMinPrice(params.get('min') || '');
    setMaxPrice(params.get('max') || '');
    setSortBy(params.get('sort') || 'createdAt');
    setPage(parseInt(params.get('page') || '1', 10));
  }, [search, categories]);

  // Reactive React Query key ensuring automatic re-fetching whenever any filter state changes
  const { isLoading, isError, error, data, refetch } = useQuery({
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
    queryFn: async () => {
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

      const res = await axiosFetch.get(`/gigs?${queryParams.toString()}`);
      return res.data || [];
    },
    retry: 1
  });

  const { data: recommendedPackages } = useQuery({
    queryKey: ['recommendedPackages'],
    queryFn: async () => {
      try {
        const res = await axiosFetch.get('/gigs?limit=4');
        return res.data || [];
      } catch {
        return [];
      }
    },
    retry: false
  });

  const packagesList = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.gigs)) return data.gigs;
    if (Array.isArray(data?.packages)) return data.packages;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const recommendedList = useMemo(() => {
    if (Array.isArray(recommendedPackages)) return recommendedPackages;
    if (Array.isArray(recommendedPackages?.gigs)) return recommendedPackages.gigs;
    if (Array.isArray(recommendedPackages?.packages)) return recommendedPackages.packages;
    if (Array.isArray(recommendedPackages?.data)) return recommendedPackages.data;
    return [];
  }, [recommendedPackages]);

  const activeSubcategory = useMemo(() => {
    if (!currentTaxonomy || !currentTaxonomy.subcategories || currentTaxonomy.subcategories.length === 0) {
      return null;
    }
    if (activeSubcatId) {
      const found = currentTaxonomy.subcategories.find(
        (s) =>
          s.id.toLowerCase() === activeSubcatId.toLowerCase() ||
          s.title.toLowerCase() === activeSubcatId.toLowerCase()
      );
      if (found) return found;
    }
    if (activeTag) {
      const foundByTag = currentTaxonomy.subcategories.find(
        (s) => s.items?.some((it) => it.toLowerCase() === activeTag.toLowerCase())
      );
      if (foundByTag) return foundByTag;
    }
    if (searchVal) {
      const foundByItem = currentTaxonomy.subcategories.find(
        (s) =>
          s.items?.some((it) => it.toLowerCase() === searchVal.toLowerCase()) ||
          s.title.toLowerCase().includes(searchVal.toLowerCase())
      );
      if (foundByItem) return foundByItem;
    }
    return currentTaxonomy.subcategories[0];
  }, [currentTaxonomy, activeSubcatId, activeTag, searchVal]);

  const displayPackages = useMemo(() => {
    if (packagesList && packagesList.length > 0) {
      return packagesList;
    }
    return getStaticSubcategoryGigs(activeTag);
  }, [packagesList, activeTag]);

  const isSubcategoryMode = Boolean(
    currentTaxonomy &&
    activeCategory !== 'All services' &&
    viewTab === 'gigs' &&
    activeSubcategory
  );

  // Utility to update URL query params cleanly without full page reloads
  const syncUrlWithFilters = (overrides: any = {}) => {
    const params = new URLSearchParams();
    const currentSearch = overrides.searchVal !== undefined ? overrides.searchVal : searchVal;
    const rawCat = overrides.category !== undefined ? overrides.category : (filterCategory || (activeCategory !== 'All services' ? activeCategory : ''));
    const currentCatSlug = getSlugFromCat(rawCat);
    const currentSubcat = overrides.subcat !== undefined ? overrides.subcat : activeSubcatId;
    const currentTag = overrides.tag !== undefined ? overrides.tag : activeTag;
    const currentMin = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const currentMax = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const currentSort = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;
    const currentPage = overrides.page !== undefined ? overrides.page : (overrides.resetPage ? 1 : page);

    if (currentSearch && currentSearch.trim()) params.set('search', currentSearch.trim());
    if (currentCatSlug) params.set('category', currentCatSlug);
    if (currentSubcat) params.set('subcat', currentSubcat);
    if (currentTag) params.set('tag', currentTag);
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
      setActiveSubcatId('');
      setActiveTag('');
      setViewTab('gigs');
      syncUrlWithFilters({ category: '', searchVal: '', subcat: '', tag: '' });
    } else {
      setActiveCategory(slug);
      setFilterCategory(slug);
      setActiveSubcatId('');
      setActiveTag('');
      setViewTab('hub');
      syncUrlWithFilters({ category: slug, searchVal: '', subcat: '', tag: '' });
    }
  };

  const handleSelectSubcategory = (subcatId: string, subcatTitle: string) => {
    setActiveSubcatId(subcatId);
    setActiveTag('');
    setSearchVal('');
    setViewTab('gigs');
    syncUrlWithFilters({ subcat: subcatId, tag: '', searchVal: '', resetPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubService = (serviceName: string, subcatId?: string, subcatTitle?: string) => {
    if (subcatId) {
      setActiveSubcatId(subcatId);
    }
    setActiveTag(serviceName);
    setSearchVal('');
    setViewTab('gigs');
    syncUrlWithFilters({ subcat: subcatId || activeSubcatId, tag: serviceName, searchVal: '', resetPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchVal('');
    setActiveSubcatId('');
    setActiveTag('');
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
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* Sidebar Filter Modal / Drawer (Accessible across all views) */}
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
                  {categories.map((c: any) => {
                    const name = typeof c === 'string' ? c : c.name;
                    const slug = typeof c === 'string' ? c : c.slug;
                    return (
                      <option key={slug} value={slug}>{name}</option>
                    );
                  })}
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
                <div className="relative px-2 mb-6">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shadow-2xs">${minPrice || '0'}</span>
                    <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shadow-2xs">${maxPrice || '2500'}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full relative flex items-center">
                    <div className="absolute left-[15%] right-[25%] h-full bg-gray-900 rounded-full"></div>
                    <div className="absolute left-[15%] w-4 h-4 rounded-full bg-white border-2 border-gray-900 shadow -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="absolute right-[25%] w-4 h-4 rounded-full bg-white border-2 border-gray-900 shadow translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"></div>
                  </div>
                </div>

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

      {/* Category Hero Banner - rendered ONLY on the Category Hub overview */}
      {currentTaxonomy && activeCategory !== 'All services' && viewTab === 'hub' && (
        <CategoryHeroBanner
          title={currentTaxonomy.heroTitle}
          categoryName={currentTaxonomy.name}
          subtitle={currentTaxonomy.heroSubtitle}
          bannerImage={currentTaxonomy.defaultBanner}
        />
      )}

      {/* Main Content Area: Subcategory Hub, Subcategory Services, or General Gigs Listing */}
      {currentTaxonomy && activeCategory !== 'All services' && viewTab === 'hub' ? (
        <div className="container mx-auto px-4 md:px-6 pb-16 animate-fadeIn">
          {/* 8-Card Subcategory Grid - Pixel Perfect Match */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {currentTaxonomy.subcategories.map((subcat) => (
              <SubcategoryCard
                key={subcat.id}
                id={subcat.id}
                title={subcat.title}
                banner={subcat.banner}
                items={subcat.items}
                onSelectService={handleSelectSubService}
                onSelectSubcategory={handleSelectSubcategory}
              />
            ))}
          </div>
        </div>
      ) : (currentTaxonomy && activeCategory !== 'All services' && viewTab === 'gigs' && activeSubcategory) ? (
        /* Subcategory Services View - Pixel Perfect Match for Image 2 */
        <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8 animate-fadeIn">
          {/* 1. Subcategory Header: Breadcrumbs, Title with Chevron Dropdown, Subtitle */}
          <SubcategoryHeader
            categoryName={currentTaxonomy.name}
            categorySlug={currentTaxonomy.slug}
            subcategories={currentTaxonomy.subcategories}
            activeSubcategory={activeSubcategory}
            onSelectCategory={() => {
              setViewTab('hub');
              setActiveSubcatId('');
              setActiveTag('');
              setSearchVal('');
              syncUrlWithFilters({ subcat: '', tag: '', searchVal: '' });
            }}
            onSelectSubcategory={(subcat) => {
              handleSelectSubcategory(subcat.id, subcat.title);
            }}
          />

          {/* 2. Subcategory Filter Bar: Filter Toggle, Divider, Pills, View All */}
          <SubcategoryFilterBar
            items={activeSubcategory.items || []}
            activeTag={activeTag}
            onSelectTag={(tag) => {
              setActiveTag(tag);
              syncUrlWithFilters({ tag, resetPage: true });
            }}
            onClearTag={() => {
              setActiveTag('');
              syncUrlWithFilters({ tag: '', resetPage: true });
            }}
            onOpenFilter={() => setShowFilter(true)}
          />

          {/* 3. Results Count */}
          <div className="mb-6">
            <p className="text-[14.5px] sm:text-[15px] font-semibold text-gray-700">
              {activeSubcategory.resultCount || "1,40,000+ Results"}
            </p>
          </div>

          {/* 4. 4-Column Responsive Grid of Package Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {displayPackages.map((pkg: any, idx: number) => (
              <PackageCard key={pkg._id || pkg.id || idx} data={pkg} priority={idx < 4} />
            ))}
          </div>

          {/* Pagination Controls */}
          {displayPackages.length > 0 && (
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
                disabled={displayPackages.length < 8}
                className="px-6 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-[#3ea917] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Main Content - Gigs Listing View */
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Breadcrumb + Filter Button Row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-gray-500 flex items-center flex-wrap gap-2">
                <span>Home / <span className="text-gray-800 font-medium">{currentTaxonomy?.name || 'Search Result'}</span></span>
                {currentTaxonomy && activeCategory !== 'All services' && (
                  <button
                    type="button"
                    onClick={() => { setSearchVal(''); setViewTab('hub'); syncUrlWithFilters({ searchVal: '' }); }}
                    className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline font-semibold ml-2 cursor-pointer"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    <span>Explore {currentTaxonomy.name} Subcategories</span>
                  </button>
                )}
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

          {/* Results Grid / Loading / Error / Empty State */}
          {isLoading ? (
            <div className="py-6">
              <GigsGridSkeleton count={8} />
            </div>
          ) : isError || error ? (
            <div className="py-16 w-full animate-fadeIn flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5 border border-red-100 shadow-sm">
                <FiAlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                Unable to load services
              </h2>
              <p className="text-gray-500 max-w-md text-sm sm:text-base mb-6 leading-relaxed">
                We encountered an issue connecting to our servers. Please check your connection or try again.
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-[#3ea917] transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <FiRefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : (!packagesList || packagesList.length === 0) ? (
            <div className="py-8 w-full animate-fadeIn">
              {/* Empty State Illustration & Text */}
              <div className="text-center flex flex-col items-center justify-center max-w-xl mx-auto mb-16">
                <img
                  src="/404.png"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/404Img.png"; }}
                  alt="No Services Found"
                  className="w-full max-w-[320px] sm:max-w-[380px] h-auto object-contain mb-6"
                />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2.5 tracking-tight">
                  No services found matching your criteria
                </h2>
                <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed mb-6">
                  Try adjusting your search keywords, clearing applied filters, or exploring other categories.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-[#3ea917] transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Real Recommended Section (only shown if real items exist) */}
              {recommendedList && recommendedList.length > 0 && (
                <div className="w-full pt-8 border-t border-gray-100">
                  <h3 className="text-2xl sm:text-[28px] font-bold text-gray-900 mb-6 text-left">
                    Recommended for you:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {recommendedList.slice(0, 4).map((pkg: any) => (
                      <PackageCard key={pkg._id || pkg.id} data={pkg} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {packagesList.map((pkg: any, idx: number) => <PackageCard key={pkg._id || pkg.id} data={pkg} priority={idx < 2} />)}
            </div>
          )}

          {/* Pagination Controls */}
          {packagesList && packagesList.length > 0 && (
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
                disabled={packagesList.length < 20}
                className="px-6 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-[#3ea917] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* <TopRatedSellers /> */}
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