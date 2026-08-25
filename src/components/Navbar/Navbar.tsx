// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { RiSearchLine } from "react-icons/ri";
import { FiMenu, FiX, FiMessageSquare, FiBell } from "react-icons/fi";

import toast from 'react-hot-toast';
import { axiosFetch, socket } from '@/utils';
import { useUserStore } from "@/store/userStore";
import { Loader, NotificationBell, HeaderInboxIcon } from '@/components';



const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    window.scrollY > 0 ? setShowMenu(true) : setShowMenu(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);

    // Close profile dropdown if clicked outside
    const handleClickOutside = (e: any) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", isActive);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axiosFetch.post("/auth/logout");
    } catch ({ response }) {
      console.log(response?.data);
    } finally {
      socket.disconnect();
      localStorage.removeItem('user');
      sessionStorage.removeItem("kyc_prompt_dismissed_session");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
      setUser(null);
      router.push("/");
    }
  };

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${showMenu || pathname !== "/" ? "bg-white border-b border-gray-100 shadow-sm text-gray-600" : "bg-transparent text-gray-600"}`}>
      <div className="w-full container mx-auto flex justify-between items-center px-4 md:px-6 py-4">

        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <Image src="/Workvence-logo-Horizontal 1.png" width={160} height={40} alt="Workvence" className="h-8 md:h-10 w-auto object-contain" style={{ width: "auto", height: "auto" }} priority />
          </Link>

          <div className={`hidden lg:flex items-center overflow-hidden transition-all duration-300 ${showMenu || pathname !== '/' ? 'opacity-100 max-w-[500px]' : 'opacity-0 max-w-0 pointer-events-none'}`}>
            <div className="flex items-center border rounded-lg px-4 py-2.5 w-[250px] xl:w-[320px] bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-brand-green focus-within:shadow-sm group">
              <RiSearchLine className="text-gray-400 text-xl mr-3 group-focus-within:text-brand-green transition-colors" />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="bg-transparent border-none outline-none w-full text-[15px] font-medium text-gray-800 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-[15px] font-semibold">
          {isLoading ? (
            <Loader size={35} />
          ) : (
            <>
              {!user && (
                <>
                  <Link href="/packages" className={`hidden md:block hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Browse Packages
                  </Link>
                  <Link href="/briefs" className={`hidden md:block hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Projects
                  </Link>
                  <Link href="/register?seller=true" className={`hidden md:block hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Become a seller
                  </Link>
                  <Link href="/login" className={`hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Log in
                  </Link>
                  <Link href="/register" className={`px-5 py-2 rounded-lg transition-colors shadow-sm ${showMenu || pathname !== "/" ? "bg-brand-green text-white hover:bg-[#389115]" : "border border-brand-green hover:bg-gray-50 hover:text-brand-green"}`}>
                    Sign Up
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link href="/packages" className="hover:text-brand-green transition-colors">Browse Packages</Link>
                  <Link href="/briefs" className="hover:text-brand-green transition-colors">Projects</Link>
                  {!user?.isSeller && (
                    <Link href="/register?seller=true" className="hover:text-brand-green transition-colors">
                      Become a Seller
                    </Link>
                  )}

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
                        {!user?.isSeller && (
                          <Link href="/briefs/my-briefs" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 hover:bg-gray-50 hover:text-brand-green transition-colors flex items-center gap-3">
                            My Projects
                          </Link>
                        )}
                        {user?.isSeller && (
                          <>
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
                          </>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <span onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} className="px-5 py-2.5 hover:bg-red-50 text-red-500 cursor-pointer transition-colors flex items-center gap-3">
                          Logout
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Hamburger Button & Pre-reserved Icons Container */}
        <div className="flex lg:hidden items-center gap-3 md:gap-4 shrink-0 min-h-[32px]">
          {user && !isLoading && (
            <div className="flex items-center gap-4 mr-1 shrink-0 min-w-[64px] min-h-[24px]">
              <HeaderInboxIcon currentUser={user} />
              <NotificationBell currentUser={user} />
            </div>
          )}
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-2xl text-gray-700 focus:outline-none hover:text-brand-green transition-colors ml-1 p-1 rounded-lg shrink-0" aria-label="Open menu">
            <FiMenu width={24} height={24} />
          </button>
        </div>
      </div>

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

        <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-6 text-[16px] font-semibold text-gray-700">
          {!user ? (
            <>
              <Link href="/packages" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Browse Packages</Link>
              <Link href="/register?seller=true" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Become a seller</Link>
              <hr className="my-2 border-gray-100" />
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Log in</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-brand-green hover:opacity-80 transition-opacity">Sign Up</Link>
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
                <Link href="/register?seller=true" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green transition-colors">Become a Seller</Link>
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
