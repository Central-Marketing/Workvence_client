// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiSearchLine } from "react-icons/ri";

import { axiosFetch } from '@/utils';
import { useUserStore } from "@/store/userStore";
import Loader from "../Loader/Loader";



const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosFetch.get('/auth/me');
        setUser(data.user);
      }
      catch ({ response }) {
        localStorage.removeItem('user');
        console.log(response?.data?.message || 'Error');
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
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axiosFetch.post("/auth/logout");
      localStorage.removeItem('user');
      setUser(null);
      router.push("/");
    } catch ({ response }) {
      console.log(response?.data);
    }
  };

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${showMenu || pathname !== "/" ? "bg-white border-b border-gray-100 shadow-sm text-gray-600" : "bg-transparent text-gray-600"}`}>
      <div className="w-full container mx-auto flex justify-between items-center px-4 md:px-6 py-4">

        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="h-8 md:h-10 object-contain" />
          </Link>

          <div className="hidden lg:flex items-center overflow-hidden max-w-[500px]">
            <div className="flex items-center border rounded-lg px-4 py-2.5 w-[350px] xl:w-[450px] bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-brand-green focus-within:shadow-sm group">
              <RiSearchLine className="text-gray-400 text-xl mr-3 group-focus-within:text-brand-green transition-colors" />
              <input type="text" placeholder="What are you looking for?" className="bg-transparent border-none outline-none w-full text-[15px] font-medium text-gray-800 placeholder-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[15px] font-semibold">
          {isLoading ? (
            <Loader size={35} />
          ) : (
            <>
              {!user && (
                <>
                  <Link href="/projects" className={`hidden md:block hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Browse Projects
                  </Link>
                  <Link href="/register?seller=true" className={`hidden md:block hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Become a seller
                  </Link>
                  <Link href="/contact" className={`hidden md:block hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Contact us
                  </Link>
                  <Link href="/login" className={`hover:text-brand-green transition-colors ${showMenu || pathname !== "/" ? "" : "hover:text-gray-800"}`}>
                    Sign in
                  </Link>
                  <Link href="/register" className={`px-5 py-2 rounded-lg transition-colors shadow-sm ${showMenu || pathname !== "/" ? "bg-brand-green text-white hover:bg-[#389115]" : "border border-gray-300 hover:bg-gray-50 hover:text-brand-green"}`}>
                    Join
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link href="/dashboard" className="hover:text-brand-green transition-colors">
                    Dashboard
                  </Link>
                  {user?.isSeller ? (
                    <>
                      <Link href="/my-gigs" className="hover:text-brand-green transition-colors">My Gigs</Link>
                      <Link href="/organize" className="hover:text-brand-green transition-colors">Add New Gig</Link>
                      <Link href="/earnings" className="hover:text-brand-green transition-colors">Earnings</Link>
                    </>
                  ) : (
                    <Link href="/register?seller=true" className="hover:text-brand-green transition-colors">
                      Become a Seller
                    </Link>
                  )}
                  <Link href="/orders" className="hover:text-brand-green transition-colors">Orders</Link>
                  <Link href="/messages" className="hover:text-brand-green transition-colors">Messages</Link>
                  <span className="cursor-pointer hover:text-red-500 transition-colors" onClick={handleLogout}>
                    Logout
                  </span>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/profile')}>
                    <img src={user.image || "/media/noavatar.png"} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="hidden md:block">{user?.username}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
