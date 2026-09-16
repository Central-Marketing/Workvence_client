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
  LeftFilterSidebar,
} from '@/components';
import { getCategoryTaxonomy, SubcategoryItem } from '@/data/categoryTaxonomy';
import { STATIC_SUBCATEGORY_GIGS, getStaticSubcategoryGigs } from '@/data/staticSubcategoryGigs';
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import useAdminCategories from "@/hooks/useAdminCategories";
import { FiAlertCircle, FiRefreshCw, FiGrid, FiArrowRight, FiArrowLeft, FiHome } from "react-icons/fi";

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
  const initialLegacyTag = initialParams.get('tag') || initialParams.get('service');
  const initialLegacySubcat = initialParams.get('subcat') || initialParams.get('subcategory');
  const initialCat = initialLegacyTag || initialLegacySubcat || initialParams.get('category') || initialParams.get('cat') || 'All services';
  const initialMin = initialParams.get('min') || '';
  const initialMax = initialParams.get('max') || '';
  const initialDeliveryDays = initialParams.get('deliveryDays') || '';

  const initialSort = initialParams.get('sort') || 'newest';
  const initialPage = parseInt(initialParams.get('page') || '1', 10);

  const [sortBy, setSortBy] = useState(initialSort);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [showFilter, setShowFilter] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [viewTab, setViewTab] = useState<'hub' | 'gigs'>(
    (initialSearch || initialMin || initialMax || initialDeliveryDays || initialLegacySubcat || initialLegacyTag) ? 'gigs' : 'hub'
  );

  // Additional sidebar & tag filter states
  const [filterCategory, setFilterCategory] = useState(initialCat !== 'All services' && initialCat !== 'Results' ? initialCat : '');
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [deliveryDays, setDeliveryDays] = useState(initialDeliveryDays);
  const [sellerLevels, setSellerLevels] = useState<{ [key: string]: boolean }>({
    top_rated: false,
    level_two: false,
    level_one: false,
    new_seller: false,
  });

  const toggleSellerLevel = (key: string) => {
    setSellerLevels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Centralized backend category hook
  const { categoryList, parentCategories } = useAdminCategories();

  const categories = useMemo(() => {
    if (parentCategories.length === 0) {
      return DEFAULT_CATEGORIES.map((c: string) => ({
        name: c,
        slug: c === "All services" ? "All services" : c.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
    const formatted = parentCategories.map((cat: any) => {
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
  }, [parentCategories]);

  const findCategoryInList = (catInput: string) => {
    if (!catInput || catInput === 'All services' || catInput === 'Results' || !categoryList) return null;
    const normalized = catInput.toLowerCase().trim();
    return categoryList.find(
      (c: any) =>
        (c.name && c.name.toLowerCase() === normalized) ||
        (c.slug && c.slug.toLowerCase() === normalized) ||
        (c.id && c.id.toLowerCase() === normalized) ||
        (c._id && c._id.toLowerCase() === normalized)
    );
  };

  // Helper to trace ancestor chain for any category (Root -> Subcategory -> Niche)
  const getCategoryAncestry = (catIdentifier: string): Array<{ name: string; slug: string; id?: string; isRoot: boolean }> => {
    if (!catIdentifier || catIdentifier === 'All services' || catIdentifier === 'Results' || !categoryList || categoryList.length === 0) return [];
    const normalized = catIdentifier.toLowerCase().trim();

    const current = categoryList.find((c: any) =>
      (c.slug && c.slug.toLowerCase() === normalized) ||
      (c.name && c.name.toLowerCase() === normalized) ||
      (c._id && c._id.toLowerCase() === normalized) ||
      (c.id && c.id.toLowerCase() === normalized)
    );
    if (!current) {
      return [{ name: catIdentifier, slug: catIdentifier, isRoot: false }];
    }

    const trail: Array<{ name: string; slug: string; id?: string; isRoot: boolean }> = [];
    let node: any = current;
    const visited = new Set<string>();

    while (node && !visited.has(node.id || node._id || node.slug)) {
      visited.add(node.id || node._id || node.slug);
      trail.unshift({
        name: node.name || node.title || String(node),
        slug: node.slug || (node.name || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-'),
        id: node.id || node._id,
        isRoot: !node.parentId,
      });
      if (node.parentId) {
        node = categoryList.find((c: any) => c._id === node.parentId || c.id === node.parentId);
      } else {
        node = null;
      }
    }

    return trail;
  };

  const categoryAncestry = useMemo(() => {
    const current = filterCategory || (activeCategory !== 'All services' && activeCategory !== 'Results' ? activeCategory : '');
    return getCategoryAncestry(current);
  }, [filterCategory, activeCategory, categoryList]);

  const currentTaxonomy = useMemo(() => {
    const selected = filterCategory || (activeCategory !== 'All services' && activeCategory !== 'Results' ? activeCategory : '');
    if (!selected) return null;
    return getCategoryTaxonomy(selected, categoryList);
  }, [filterCategory, activeCategory, categoryList]);

  const rootTaxonomy = useMemo(() => {
    if (categoryAncestry.length > 0) {
      const rootItem = categoryAncestry[0];
      return getCategoryTaxonomy(rootItem.slug || rootItem.name, categoryList);
    }
    return currentTaxonomy;
  }, [categoryAncestry, categoryList, currentTaxonomy]);

  // Sync state when URL params externally change, and sanitize legacy subcat/tag params immediately
  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(search);
    const legacyTag = params.get('tag') || params.get('service');
    const legacySubcat = params.get('subcat') || params.get('subcategory');

    // If legacy subcat or tag params exist in URL, sanitize immediately to clean ?category=<tag || subcat>
    if (legacyTag || legacySubcat) {
      const directCat = (legacyTag || legacySubcat) as string;
      const cleanParams = new URLSearchParams();
      cleanParams.set('category', directCat);
      if (params.get('search')) cleanParams.set('search', params.get('search')!);
      if (params.get('min')) cleanParams.set('min', params.get('min')!);
      if (params.get('max')) cleanParams.set('max', params.get('max')!);
      if (params.get('deliveryDays')) cleanParams.set('deliveryDays', params.get('deliveryDays')!);
      if (params.get('sort') && params.get('sort') !== 'newest') cleanParams.set('sort', params.get('sort')!);
      if (params.get('page') && params.get('page') !== '1') cleanParams.set('page', params.get('page')!);
      navigate.replace(`/packages?${cleanParams.toString()}`, { scroll: false });
      return;
    }

    const cat = params.get('category') || params.get('cat');
    if (cat && cat !== 'All services' && cat !== 'Results') {
      setActiveCategory(cat);
      setFilterCategory(cat);

      const ancestry = getCategoryAncestry(cat);
      const isRoot = ancestry.length <= 1;

      if (params.get('search') || params.get('min') || params.get('max') || params.get('deliveryDays') || params.get('view') === 'gigs' || !isRoot) {
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
    setDeliveryDays(params.get('deliveryDays') || '');
    setSortBy(params.get('sort') || 'newest');
    setPage(parseInt(params.get('page') || '1', 10));
  }, [search, categories, categoryList]);

  // Reactive React Query key ensuring automatic re-fetching whenever any filter state changes
  const { isLoading, isError, error, data, refetch } = useQuery({
    queryKey: [
      'packages',
      searchVal,
      activeCategory,
      filterCategory,
      minPrice,
      maxPrice,
      deliveryDays,
      sortBy,
      page,
      JSON.stringify(sellerLevels),
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (searchVal && searchVal.trim()) {
        queryParams.set('search', searchVal.trim());
      }

      const selectedCat = filterCategory || (activeCategory !== 'All services' ? activeCategory : '');
      if (selectedCat && selectedCat !== 'All services' && selectedCat !== 'Results') {
        const matched = findCategoryInList(selectedCat);
        if (matched?.id || matched?._id) {
          queryParams.set('categoryId', matched.id || matched._id);
        }
        // Direct category name sent to backend (e.g. "Automation" or "N8N")
        queryParams.set('category', matched?.name || selectedCat);
      }

      if (minPrice) queryParams.set('min', minPrice);
      if (maxPrice) queryParams.set('max', maxPrice);
      if (deliveryDays) queryParams.set('deliveryDays', deliveryDays);
      queryParams.set('sort', sortBy || 'newest');
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
    if (searchVal) {
      const foundByItem = currentTaxonomy.subcategories.find(
        (s) =>
          s.items?.some((it) => it.toLowerCase() === searchVal.toLowerCase()) ||
          s.title.toLowerCase().includes(searchVal.toLowerCase())
      );
      if (foundByItem) return foundByItem;
    }
    return currentTaxonomy.subcategories[0];
  }, [currentTaxonomy, searchVal]);

  const displayPackages = useMemo(() => {
    if (!packagesList || packagesList.length === 0) return [];

    const activeLevels = Object.entries(sellerLevels).filter(([_, v]) => v).map(([k]) => {
      if (k === 'top_rated') return 'top';
      if (k === 'level_two') return '2';
      if (k === 'level_one') return '1';
      return 'new';
    });

    if (activeLevels.length > 0) {
      const filtered = packagesList.filter((pkg: any) => {
        const userLevel = (pkg.user?.sellerLevel || pkg.sellerLevel || pkg.user?.level || pkg.level || '').toLowerCase();
        return activeLevels.some((al) => userLevel.includes(al));
      });
      return filtered;
    }

    return packagesList;
  }, [packagesList, sellerLevels]);

  // Determine subcategory node and active tag from category ancestry:
  // Root: categoryAncestry[0]
  // Subcategory (depth 2): categoryAncestry[1]
  // Leaf / Niche (depth >= 3): categoryAncestry[categoryAncestry.length - 1]
  const { headerSubcatNode, currentActiveTag } = useMemo(() => {
    if (categoryAncestry.length >= 3) {
      return {
        headerSubcatNode: categoryAncestry[1],
        currentActiveTag: categoryAncestry[categoryAncestry.length - 1].name,
      };
    } else if (categoryAncestry.length === 2) {
      return {
        headerSubcatNode: categoryAncestry[1],
        currentActiveTag: '',
      };
    }
    return {
      headerSubcatNode: null,
      currentActiveTag: '',
    };
  }, [categoryAncestry]);

  // Active subcategory / leaf node representation for header
  const resolvedSubcategoryHeaderItem = useMemo(() => {
    if (headerSubcatNode) {
      const matchedInTaxonomy = rootTaxonomy?.subcategories?.find(
        (s) =>
          s.title.toLowerCase() === headerSubcatNode.name.toLowerCase() ||
          s.id.toLowerCase() === headerSubcatNode.slug.toLowerCase()
      );
      if (matchedInTaxonomy) {
        return matchedInTaxonomy;
      }
      return {
        id: headerSubcatNode.slug || headerSubcatNode.name,
        title: headerSubcatNode.name,
        subtitle: `${categoryAncestry[0]?.name || 'Service'} category`,
        banner: '',
        items: [],
      };
    }
    if (activeSubcategory) return activeSubcategory;
    return null;
  }, [headerSubcatNode, rootTaxonomy, categoryAncestry, activeSubcategory]);

  const isSubcategoryMode = Boolean(
    (currentTaxonomy || categoryAncestry.length > 1) &&
    activeCategory !== 'All services' &&
    viewTab === 'gigs' &&
    resolvedSubcategoryHeaderItem
  );

  // Utility to update URL query params cleanly without full page reloads
  const syncUrlWithFilters = (overrides: any = {}) => {
    const params = new URLSearchParams();
    const currentSearch = overrides.searchVal !== undefined ? overrides.searchVal : searchVal;
    const rawCat = overrides.category !== undefined ? overrides.category : (filterCategory || (activeCategory !== 'All services' ? activeCategory : ''));
    const currentMin = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const currentMax = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const currentDelivery = overrides.deliveryDays !== undefined ? overrides.deliveryDays : deliveryDays;
    const currentSort = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;
    const currentPage = overrides.page !== undefined ? overrides.page : (overrides.resetPage ? 1 : page);

    if (currentSearch && currentSearch.trim()) params.set('search', currentSearch.trim());
    if (rawCat && rawCat !== 'All services' && rawCat !== 'Results') {
      params.set('category', rawCat);
    }
    if (currentMin) params.set('min', currentMin);
    if (currentMax) params.set('max', currentMax);
    if (currentDelivery) params.set('deliveryDays', currentDelivery);
    if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    navigate.push(`/packages?${params.toString()}`, { scroll: false });
  };

  const handleApplyFilter = () => {
    syncUrlWithFilters();
    refetch();
    setShowFilterDrawer(false);
  };

  const handleCategoryClick = (cat: any) => {
    const slug = typeof cat === 'string' ? cat : cat.slug;
    const name = typeof cat === 'string' ? cat : cat.name;

    if (slug === 'All services' || name === 'All services') {
      setActiveCategory('All services');
      setFilterCategory('');
      setViewTab('gigs');
      syncUrlWithFilters({ category: '', searchVal: '' });
    } else {
      const target = name || slug;
      setActiveCategory(target);
      setFilterCategory(target);

      const ancestry = getCategoryAncestry(target);
      if (ancestry.length <= 1) {
        setViewTab('hub');
      } else {
        setViewTab('gigs');
      }
      syncUrlWithFilters({ category: target, searchVal: '', resetPage: true });
    }
  };

  const handleSelectSubcategory = (subcatId: string, subcatTitle: string) => {
    const target = subcatTitle || subcatId;
    setActiveCategory(target);
    setFilterCategory(target);
    setSearchVal('');
    setViewTab('gigs');
    syncUrlWithFilters({ category: target, searchVal: '', resetPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubService = (serviceName: string, _subcatId?: string, _subcatTitle?: string) => {
    const target = serviceName;
    setActiveCategory(target);
    setFilterCategory(target);
    setSearchVal('');
    setViewTab('gigs');
    syncUrlWithFilters({ category: target, searchVal: '', resetPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchVal('');
    setFilterCategory('');
    setActiveCategory('All services');
    setDeliveryDays('');
    setSortBy('newest');
    setSellerLevels({ top_rated: false, level_two: false, level_one: false, new_seller: false });
    setShowFilterDrawer(false);
    navigate.push('/packages', { scroll: false });
  };

  const hasActiveFilters = Boolean(
    searchVal ||
    (activeCategory !== 'All services' && activeCategory !== 'Results') ||
    filterCategory ||
    minPrice ||
    maxPrice ||
    deliveryDays ||
    sellerLevels.top_rated ||
    sellerLevels.level_two ||
    sellerLevels.level_one ||
    sellerLevels.new_seller
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* Sidebar Filter Modal / Drawer (Only for non-subcategory views) */}
      {showFilterDrawer && !isSubcategoryMode && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-fadeIn"
            onClick={() => setShowFilterDrawer(false)}
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
                onClick={() => setShowFilterDrawer(false)}
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

              {/* 3. Seller Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Seller Level</label>
                <div className="space-y-3">
                  {[
                    { key: 'top_rated', label: 'Top Rated' },
                    { key: 'level_two', label: 'Level 2' },
                    { key: 'level_one', label: 'Level 1' },
                    { key: 'new_seller', label: 'New Seller' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={Boolean(sellerLevels[key])}
                        onChange={() => toggleSellerLevel(key)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Delivery Time Radio Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Time</label>
                <div className="space-y-2.5">
                  {[
                    { value: '', label: 'Any Time' },
                    { value: '1', label: '24 Hours (Express)' },
                    { value: '3', label: 'Up to 3 Days' },
                    { value: '7', label: 'Up to 7 Days' },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
                      <input
                        type="radio"
                        name="drawerDeliveryTime"
                        value={value}
                        checked={deliveryDays === value}
                        onChange={() => setDeliveryDays(value)}
                        className="w-4 h-4 text-black focus:ring-black cursor-pointer accent-black"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Filter by Fixed-Price */}
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
        />
      )}

      {/* Main Content Area: Subcategory Hub, Subcategory Services, or General Gigs Listing */}
      {currentTaxonomy && activeCategory !== 'All services' && viewTab === 'hub' ? (
        <div className="container mx-auto pb-16 animate-fadeIn">
          {/* Subcategory Grid - only rendered if category has subcategories */}
          {currentTaxonomy.subcategories && currentTaxonomy.subcategories.length > 0 && (
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
          )}

          {/* Popular Services in Category Preview - Fiverr Style */}
          {packagesList && packagesList.length > 0 && (
            <div className={`${currentTaxonomy.subcategories && currentTaxonomy.subcategories.length > 0 ? "mt-14 pt-10 border-t border-gray-200/80" : "pt-2"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Popular Services in {currentTaxonomy.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-inter">
                    Explore top-rated services delivered by verified professionals
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewTab('gigs');
                    syncUrlWithFilters({ resetPage: true });
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline cursor-pointer group self-start sm:self-auto"
                >
                  <span>View all {packagesList.length} services</span>
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {packagesList.slice(0, 8).map((pkg: any, idx: number) => (
                  <PackageCard key={pkg._id || pkg.id || idx} data={pkg} priority={idx < 4} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : ((currentTaxonomy || categoryAncestry.length > 1) && activeCategory !== 'All services' && viewTab === 'gigs' && resolvedSubcategoryHeaderItem) ? (
        /* Subcategory / Niche Services View */
        <div className="container mx-auto py-6 sm:py-8 animate-fadeIn">
          {/* 1. Subcategory Header: Breadcrumbs, Title with Chevron Dropdown, Subtitle */}
          <SubcategoryHeader
            categoryName={categoryAncestry.length > 0 ? categoryAncestry[0].name : (currentTaxonomy?.name || '')}
            categorySlug={categoryAncestry.length > 0 ? categoryAncestry[0].slug : (currentTaxonomy?.slug || '')}
            subcategories={rootTaxonomy?.subcategories || []}
            activeSubcategory={resolvedSubcategoryHeaderItem}
            breadcrumbTrail={categoryAncestry}
            onSelectCategory={() => handleReset()}
            onNavigateBreadcrumb={(crumb) => handleCategoryClick(crumb.name || crumb.slug)}
            onSelectSubcategory={(subcat) => {
              handleSelectSubcategory(subcat.id, subcat.title);
            }}
          />

          {/* 2. Subcategory Filter Bar: Filter Toggle, Divider, Pills, View All */}
          {resolvedSubcategoryHeaderItem.items && resolvedSubcategoryHeaderItem.items.length > 0 && (
            <div className="my-[30px]">
              <SubcategoryFilterBar
                items={resolvedSubcategoryHeaderItem.items}
                activeTag={currentActiveTag}
                isFilterOpen={showFilter}
                onSelectTag={(tag) => {
                  handleSelectSubService(tag);
                }}
                onClearTag={() => {
                  if (headerSubcatNode) {
                    handleCategoryClick(headerSubcatNode.name || headerSubcatNode.slug);
                  } else if (categoryAncestry.length > 1) {
                    const parentNode = categoryAncestry[categoryAncestry.length - 2];
                    handleCategoryClick(parentNode.name || parentNode.slug);
                  }
                }}
                onViewAll={() => {
                  if (categoryAncestry.length > 0) {
                    handleCategoryClick(categoryAncestry[0].name || categoryAncestry[0].slug);
                  }
                }}
                onOpenFilter={() => setShowFilter(!showFilter)}
              />
            </div>
          )}

          {/* 3. Results Count & Sort Dropdown */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[20px] font-normal font-inter text-[var(--Foundation-Grey-grey-500,#4A4A4A)] leading-[22px] not-italic">
              {displayPackages.length > 0
                ? `${displayPackages.length} Results`
                : (resolvedSubcategoryHeaderItem.resultCount || "1,40,000+ Results")}
            </p>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  syncUrlWithFilters({ sortBy: e.target.value, resetPage: true });
                }}
                className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-gray-900 cursor-pointer shadow-2xs"
              >
                <option value="newest">Newest</option>
                <option value="rating">Best Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* 4. Filter Sidebar (Left) + Package Cards Grid (Right) */}
          <div className="flex flex-col lg:flex-row items-start gap-7">
            {showFilter && (
              <div className="w-full lg:w-[270px] xl:w-[280px] shrink-0 sticky top-24">
                <LeftFilterSidebar
                  searchVal={searchVal}
                  onSearchChange={(val) => {
                    setSearchVal(val);
                    syncUrlWithFilters({ searchVal: val });
                  }}
                  onSearchSubmit={() => {
                    syncUrlWithFilters();
                    refetch();
                  }}
                  categories={categories.filter((c: any) => c.slug !== 'All services')}
                  selectedCategory={categoryAncestry.length > 0 ? categoryAncestry[0].slug : (filterCategory || (activeCategory !== 'All services' ? activeCategory : ''))}
                  onCategoryChange={(cat) => {
                    handleCategoryClick(cat);
                  }}
                  sellerLevels={sellerLevels}
                  onSellerLevelToggle={toggleSellerLevel}
                  deliveryDays={deliveryDays}
                  onDeliveryDaysChange={(val) => {
                    setDeliveryDays(val);
                    syncUrlWithFilters({ deliveryDays: val, resetPage: true });
                  }}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={(val) => {
                    setMinPrice(val);
                    syncUrlWithFilters({ minPrice: val });
                  }}
                  onMaxPriceChange={(val) => {
                    setMaxPrice(val);
                    syncUrlWithFilters({ maxPrice: val });
                  }}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* Right side: Cards Grid (3 columns when showFilter is true, 4 columns when false) */}
            <div className="flex-1 min-w-0 w-full">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showFilter ? 'xl:grid-cols-3' : 'lg:grid-cols-4'} gap-4 md:gap-5`}>
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
          </div>
        </div>
      ) : (
        /* Main Content - Gigs Listing View */
        <div className="container mx-auto py-8">
          {/* Breadcrumb + Filter Button Row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-gray-500 flex items-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-teal-600 hover:text-teal-700 transition-colors flex items-center cursor-pointer"
                  title="All services"
                >
                  <FiHome className="w-4 h-4 mr-1" />
                  <span>Home</span>
                </button>
                {categoryAncestry && categoryAncestry.length > 0 ? (
                  categoryAncestry.map((crumb, idx) => {
                    const isLast = idx === categoryAncestry.length - 1;
                    return (
                      <span key={idx} className="flex items-center gap-2">
                        <span className="text-gray-300">/</span>
                        {isLast ? (
                          <span className="text-gray-800 font-medium">{crumb.name}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCategoryClick(crumb.name || crumb.slug)}
                            className="text-gray-600 hover:text-gray-900 hover:underline transition-colors cursor-pointer"
                          >
                            {crumb.name}
                          </button>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-800 font-medium">All services</span>
                  </>
                )}
                {categoryAncestry.length > 0 && categoryAncestry[0].isRoot && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewTab('hub');
                      syncUrlWithFilters({ category: categoryAncestry[0].name || categoryAncestry[0].slug });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline font-semibold ml-2 cursor-pointer"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    <span>Explore {categoryAncestry[0].name} Hub</span>
                  </button>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="flex items-center gap-2 bg-brand-green hover:bg-brand-green text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M7 12H17M11 18H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filter
            </button>
          </div>

          {/* Active Filter Tags & Results Count Bar & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[15px] font-bold text-gray-900 mr-2">
                {displayPackages.length > 0 ? `${displayPackages.length} Results` : "0 Results"}
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

                  {/* Delivery Days Tag */}
                  {deliveryDays && (
                    <button
                      onClick={() => { setDeliveryDays(''); syncUrlWithFilters({ deliveryDays: '' }); }}
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                    >
                      <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span>
                      <span>Delivery: {deliveryDays === '1' ? '24 Hours' : `Up to ${deliveryDays} Days`}</span>
                    </button>
                  )}

                  {/* Seller Level Tags */}
                  {sellerLevels.top_rated && (
                    <button
                      onClick={() => toggleSellerLevel('top_rated')}
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                    >
                      <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span>
                      <span>Top Rated</span>
                    </button>
                  )}
                  {sellerLevels.level_two && (
                    <button
                      onClick={() => toggleSellerLevel('level_two')}
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                    >
                      <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span>
                      <span>Level 2</span>
                    </button>
                  )}
                  {sellerLevels.level_one && (
                    <button
                      onClick={() => toggleSellerLevel('level_one')}
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                    >
                      <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span>
                      <span>Level 1</span>
                    </button>
                  )}
                  {sellerLevels.new_seller && (
                    <button
                      onClick={() => toggleSellerLevel('new_seller')}
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-colors shadow-2xs group"
                    >
                      <span className="text-gray-400 group-hover:text-red-500 transition-colors font-bold">✕</span>
                      <span>New Seller</span>
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

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  syncUrlWithFilters({ sortBy: e.target.value, resetPage: true });
                }}
                className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-gray-900 cursor-pointer shadow-2xs"
              >
                <option value="newest">Newest</option>
                <option value="rating">Best Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
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
            <div className="py-6 w-full animate-fadeIn">
              {/* Coral-900 Empty State Banner */}
              <div className="w-full rounded-[10px] bg-[var(--coral-900,#683733)] py-16 sm:py-24 md:py-32 px-6 text-center flex flex-col items-center justify-center shadow-md mb-12">
                {/* Breadcrumb */}
                <div className="flex items-center justify-center gap-2 text-white/60 text-xs sm:text-[13px] font-light mb-3 select-none">
                  <FiHome className="w-3.5 h-3.5 text-white/70" />
                  <span>/</span>
                  <span>Search result</span>
                </div>

                {/* Main Heading */}
                <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-[54px] font-normal italic text-white tracking-tight leading-tight my-3 select-none">
                  Oops! This Gig Doesn&apos;t Exist.
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-[15px] text-white/70 font-light max-w-lg mx-auto leading-relaxed text-center">
                  The package you&apos;re looking for may have been removed, changed, or is temporarily unavailable.
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-full text-xs sm:text-sm font-medium transition-all backdrop-blur-sm cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Real Recommended Section (only shown if real items exist) */}
              {recommendedList && recommendedList.length > 0 && (
                <div className="w-full pt-8 border-t border-gray-100">
                  <h3 className="text-5xl sm:text-[42px] font-normal font-sf-pro text-[#292929] text-left mb-2.5">
                    You May Also Like
                  </h3>
                  <p className="text-base font-normal font-inter text-[#6E6E6E] text-left mb-12">Explore the recommended packages by our AI system Worka</p>
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