"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { RiSearchLine } from "react-icons/ri";
import { FiMenu, FiX, FiMessageSquare, FiBell, FiChevronDown, FiGrid, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import adminAxios from "@/utils/adminAxios";

import toast from 'react-hot-toast';
import { axiosFetch, socket } from '@/utils';
import { useUserStore } from "@/store/userStore";
import { Loader, NotificationBell, HeaderInboxIcon, AiGradientButton } from '@/components';
import CategoryBar from "../CategoryBar/CategoryBar";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryBar, setShowCategoryBar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isBuyer = Boolean(user && !user.isSeller);

  // Fetch real categories from backend
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-navbar'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data).catch(() => [])
  });

  const rawCats = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const categoryList = rawCats.map((cat: any) => {
    if (typeof cat === 'string') {
      const slug = cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return { name: cat, slug };
    }
    return {
      name: cat.name || cat.title || String(cat),
      slug: cat.slug || (cat.name || cat.title || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/packages?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  useEffect(() => {
    // 1. Instantly hydrate from localStorage to prevent UI flicker
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Silently verify session in the background
    (async () => {
      try {
        const { data } = await axiosFetch.get('/auth/me');
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
      catch (error: any) {
        // Only log out if it's explicitly an auth error (Token expired, invalid cookie, etc.)
        if (error.response?.status === 401 || error.response?.status === 403) {
          socket.disconnect();
          localStorage.removeItem('user');
          setUser(null);
        }
        console.log(error.response?.data?.message || 'Session verification failed');
      }
      finally {
        setIsLoading(false);
      }
    })();
  }, [setUser]);

  const isActive = () => {
    const scrollPos = window.scrollY;
    setShowMenu(scrollPos > 0);
    // Show category bar when scrolled past featured section (~500px) on home page, or always on subpages
    setShowCategoryBar(scrollPos > 520 || pathname !== "/");
  };

  useEffect(() => {
    isActive();
    window.addEventListener("scroll", isActive);

    // Close dropdowns if clicked outside
    const handleClickOutside = (e: any) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
      if (!e.target.closest('.category-dropdown-container')) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", isActive);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await axiosFetch.post("/auth/logout");
    } catch (error: any) {
      console.log(error?.response?.data);
    } finally {
      socket.disconnect();
      localStorage.removeItem('user');
      sessionStorage.removeItem("kyc_prompt_dismissed_session");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      setUser(null);
      router.push("/");
    }
  };

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${showMenu || pathname !== "/" || isBuyer ? "bg-white border-b border-gray-100 shadow-sm text-gray-600" : "bg-transparent text-gray-600"}`}>
      <div className="w-full container mx-auto flex justify-between items-center px-4 md:px-6 py-3.5">

        <div className="flex items-center gap-6 lg:gap-8 flex-1">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/Workvence-logo-Horizontal3.png" width={160} height={40} alt="Workvence" className="h-8 md:h-9 w-auto object-contain" style={{ width: "auto", height: "auto" }} priority />
          </Link>

          <div className={`hidden lg:flex items-center overflow-hidden transition-all duration-300 ${showMenu || pathname !== '/' || isBuyer ? 'opacity-100 max-w-[540px] xl:max-w-[720px] 2xl:max-w-[800px] flex-1' : 'opacity-0 max-w-0 pointer-events-none'}`}>
            <div className="flex items-center rounded-xl px-4 py-2.5 w-full max-w-[520px] xl:max-w-[680px] 2xl:max-w-[760px] bg-[#F4F4F6] border border-transparent focus-within:border-gray-200 focus-within:bg-white focus-within:shadow-sm transition-all group">
              <RiSearchLine className="text-gray-400 text-lg mr-2.5 group-focus-within:text-brand-green transition-colors shrink-0" />
              <input
                type="text"
                placeholder="What you are looking for"
                className="bg-transparent border-none outline-none w-full text-[14px] font-medium text-gray-800 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-7 font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] text-[#1E293B]">
          {isLoading ? (
            <Loader size={35} />
          ) : !user ? (
            <>
              {/* Explore Category Dropdown without extra icons */}
              <div className="relative category-dropdown-container">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`flex items-center gap-1.5 cursor-pointer py-1 font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] transition-colors ${isCategoryDropdownOpen ? "text-[#327C73]" : "text-[#1E293B] hover:text-[#327C73]"
                    }`}
                >
                  <span>Explore Category</span>
                  <FiChevronDown className={`text-base text-[#327C73] transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 flex flex-col z-[60] text-[14px] text-gray-700 font-medium overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <span>Categories</span>
                      <Link
                        href="/packages"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                        className="text-[#327C73] font-medium hover:underline lowercase tracking-normal"
                      >
                        view all
                      </Link>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto py-1">
                      {categoryList.length > 0 ? (
                        categoryList.map((cat: any, index: number) => (
                          <Link
                            key={cat.slug || index}
                            href={`/packages?category=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setIsCategoryDropdownOpen(false)}
                            className="px-4 py-2.5 hover:bg-emerald-50/70 hover:text-[#327C73] transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-gray-300 group-hover:text-[#327C73] transition-colors text-xs">→</span>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/register?seller=true" className="font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] text-[#1E293B] hover:text-[#327C73] transition-colors">
                Become a Seller
              </Link>

              <Link href="/briefs" className="font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] text-[#1E293B] hover:text-[#327C73] transition-colors">
                Projects
              </Link>

              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#1E293B] font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] transition-colors"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-black text-white font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Join Now</span>
                <FiArrowRight className="text-sm" />
              </Link>
            </>
          ) : isBuyer ? (
            /* Logged-in Buyer Navbar - Pixel-perfect to design */
            <div className="flex items-center gap-5 xl:gap-6 font-sf-pro font-medium text-[16px] text-[#1E293B]">
              <Link
                href="/orders"
                className="font-semibold text-[15px] text-[#18181B] hover:text-[#327C73] transition-colors"
              >
                Order
              </Link>

              <HeaderInboxIcon
                currentUser={user}
                className="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors relative cursor-pointer"
                iconClassName="text-[19px]"
              />

              <NotificationBell
                currentUser={user}
                triggerClassName="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors relative cursor-pointer"
                iconClassName="text-[19px]"
              />

              <AiGradientButton
                href="/briefs/create"
                text="Post a Project with AI"
                px="px-4"
                py="py-2"
                className="h-10 rounded-xl text-[14px] font-medium text-[#112131] shadow-none shrink-0"
              />

              <div className="relative profile-dropdown-container">
                <div
                  className="flex items-center cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <Image
                    src={user.image || "/media/noavatar.png"}
                    width={40}
                    height={40}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    unoptimized
                  />
                </div>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 flex flex-col z-[60] text-[15px] text-gray-700 font-medium overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-5 py-3 border-b border-gray-100 mb-1">
                      <p className="font-bold text-gray-900 truncate">@{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      My Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      Dashboard
                    </Link>
                    <Link href="/orders" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      Orders
                    </Link>
                    <Link href="/briefs/my-briefs" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      My Projects
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <span onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} className="px-5 py-2.5 hover:bg-red-50 text-red-500 cursor-pointer transition-colors flex items-center gap-3">
                      Logout
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Logged-in Seller Navbar */
            <>
              {/* Explore Category Dropdown */}
              <div className="relative category-dropdown-container">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`flex items-center gap-1.5 cursor-pointer py-1 font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] transition-colors ${isCategoryDropdownOpen ? "text-[#327C73]" : "text-[#1E293B] hover:text-[#327C73]"
                    }`}
                >
                  <span>Explore Category</span>
                  <FiChevronDown className={`text-base text-[#327C73] transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 flex flex-col z-[60] text-[14px] text-gray-700 font-medium overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <span>Categories</span>
                      <Link
                        href="/packages"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                        className="text-[#327C73] font-medium hover:underline lowercase tracking-normal"
                      >
                        view all
                      </Link>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto py-1">
                      {categoryList.length > 0 ? (
                        categoryList.map((cat: any, index: number) => (
                          <Link
                            key={cat.slug || index}
                            href={`/packages?category=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setIsCategoryDropdownOpen(false)}
                            className="px-4 py-2.5 hover:bg-emerald-50/70 hover:text-[#327C73] transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-gray-300 group-hover:text-[#327C73] transition-colors text-xs">→</span>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/briefs" className="font-sf-pro font-medium text-[16px] leading-[100%] tracking-[0px] text-[#1E293B] hover:text-[#327C73] transition-colors">
                Projects
              </Link>

              <div className="flex items-center gap-5 mr-1 border-l border-gray-200 pl-5">
                <HeaderInboxIcon currentUser={user} />
                <NotificationBell currentUser={user} />
              </div>

              <div className="relative profile-dropdown-container">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                  <Image src={user.image || "/media/noavatar.png"} width={36} height={36} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-200" unoptimized />
                </div>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 flex flex-col z-[60] text-[15px] text-gray-700 font-medium overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 mb-1">
                      <p className="font-bold text-gray-900 truncate">@{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      My Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      Dashboard
                    </Link>
                    <Link href="/orders" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      Orders
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <Link href="/my-packages" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      My Packages
                    </Link>
                    <Link href="/organize" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                      Add New Package
                    </Link>
                    <Link href="/earnings" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center justify-between">
                      <span>Earnings</span>
                    </Link>
                    <Link href="/kyc" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center justify-between">
                      <span>ID Verification</span>
                      {!user?.isKycVerified ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Verify</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">🛡️ Verified</span>
                      )}
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <span onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} className="px-5 py-2.5 hover:bg-red-50 text-red-500 cursor-pointer transition-colors flex items-center gap-3">
                      Logout
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button & Pre-reserved Icons Container */}
        <div className="flex lg:hidden items-center gap-2.5 shrink-0 min-h-[36px]">
          {user && !isLoading && (
            <div className="flex items-center gap-2 mr-1 shrink-0">
              <HeaderInboxIcon
                currentUser={user}
                className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-gray-700 relative"
                iconClassName="text-[17px]"
              />
              <NotificationBell
                currentUser={user}
                triggerClassName="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-gray-700 relative"
                iconClassName="text-[17px]"
              />
            </div>
          )}
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-2xl text-gray-700 focus:outline-none hover:text-brand-green transition-colors ml-1 p-1 rounded-lg shrink-0" aria-label="Open menu">
            <FiMenu width={24} height={24} />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Category Bar (Appears when scrolled past Featured section) */}
      <CategoryBar visible={showCategoryBar} />

      {/* Mobile Menu Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Image src="/Workvence-logo-Horizontal 1.png" width={140} height={32} alt="Workvence" className="h-8 w-auto object-contain" style={{ width: "auto", height: "auto" }} />
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-gray-600 focus:outline-none hover:text-red-500 transition-colors">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-5 text-[16px] font-semibold text-gray-700">
          {/* Mobile Explore Category Accordion */}
          <div className="flex flex-col border-b border-gray-100 pb-3">
            <button
              onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
              className="flex items-center justify-between py-2 text-gray-800 hover:text-brand-green transition-colors"
            >
              <span>Explore Category</span>
              <FiChevronDown className={`transition-transform duration-200 ${isMobileCategoryOpen ? "rotate-180 text-brand-green" : "text-gray-400"}`} />
            </button>

            {isMobileCategoryOpen && (
              <div className="pl-4 pt-1 flex flex-col gap-2 max-h-48 overflow-y-auto">
                {categoryList.length > 0 ? (
                  categoryList.map((cat: any, index: number) => (
                    <Link
                      key={cat.slug || index}
                      href={`/packages?category=${encodeURIComponent(cat.slug)}`}
                      onClick={() => { setIsMobileCategoryOpen(false); setIsMobileMenuOpen(false); }}
                      className="text-sm font-normal text-gray-600 hover:text-brand-green py-1"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 py-1">No categories</span>
                )}
              </div>
            )}
          </div>

          {!user ? (
            <>
              <Link href="/register?seller=true" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Become a Seller</Link>
              <Link href="/briefs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Projects</Link>
              <hr className="my-2 border-gray-100" />
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Sign in</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-brand-green hover:opacity-80 transition-opacity flex items-center gap-1.5">
                <span>Join Now</span>
                <FiArrowRight className="text-sm" />
              </Link>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-4 pb-6 mb-2 border-b border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => { setIsMobileMenuOpen(false); router.push('/profile'); }}
              >
                <img src={user.image || "/media/noavatar.png"} alt="" className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-200" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-gray-900 font-bold truncate">@{user.username || "User"}</span>
                  <span className="text-sm text-brand-green font-medium">View Profile</span>
                </div>
              </div>

              <Link href="/packages" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Browse Packages</Link>
              <Link href="/briefs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Projects</Link>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Dashboard</Link>
              {user.isSeller ? (
                <>
                  <Link href="/my-packages" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">My Packages</Link>
                  <Link href="/organize" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Add New Package</Link>
                  <Link href="/earnings" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Earnings</Link>
                  <Link href="/kyc" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors flex items-center justify-between">
                    <span>ID Verification (KYC)</span>
                    {!user?.isKycVerified ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Unverified</span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">🛡️ Verified</span>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <div className="my-1">
                    <AiGradientButton
                      href="/briefs/create"
                      text="Post a Project with AI"
                      className="w-full h-11 rounded-xl text-[14px] font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  </div>
                  <Link href="/register?seller=true" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Become a Seller</Link>
                </>
              )}
              <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Orders</Link>
              {!user.isSeller && (
                <Link href="/briefs/my-briefs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">My Projects</Link>
              )}
              <Link href="/messages" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Messages</Link>
              <hr className="my-2 border-gray-100" />
              <span className="text-red-500 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</span>
            </>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
