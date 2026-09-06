"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import adminAxios from "@/utils/adminAxios";
import toast from "react-hot-toast";
import { ArrowRight, Globe } from "lucide-react";

const socialLinks = [
  { href: "https://www.instagram.com/workvence", icon: "/all-icons/instagram.svg", label: "Instagram" },
  { href: "https://www.linkedin.com/company/workvence", icon: "/all-icons/linkedin-01.svg", label: "LinkedIn" },
  { href: "https://www.facebook.com/workvence", icon: "/all-icons/facebook-01.svg", label: "Facebook" },
  { href: "https://www.pinterest.com/workvence", icon: "/all-icons/pinterest.svg", label: "Pinterest" },
  { href: "https://www.x.com/workvence", icon: "/all-icons/new-twitter-rectangle.svg", label: "X (Twitter)" },
];

interface FooterLink {
  name: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const defaultCategoryLinks: FooterLink[] = [
  { name: "Graphics & Design", href: "/packages?category=graphics-and-design" },
  { name: "User Experience Design", href: "/packages?category=user-experience-design" },
  { name: "Animation & Motion Graphics", href: "/packages?category=animation-and-motion-graphics" },
  { name: "Illustration", href: "/packages?category=illustration" },
  { name: "Brand Identity & Logo", href: "/packages?category=brand-identity-and-logo" },
  { name: "3D Modeling & Rendering", href: "/packages?category=3d-modeling-and-rendering" },
  { name: "Print Design", href: "/packages?category=print-design" },
  { name: "Photography", href: "/packages?category=photography" },
  { name: "Packaging Design", href: "/packages?category=packaging-design" },
  { name: "Typography", href: "/packages?category=typography" },
];

const staticFooterColumns: FooterColumn[] = [
  {
    title: "Categories",
    links: defaultCategoryLinks,
  },
  {
    title: "For Freelancers",
    links: [
      { name: "Become a workvence Freelancer", href: "/register?seller=true" },
      { name: "Community Hub", href: "/help-center" },
      { name: "Blogs", href: "/help-center" },
    ],
  },
  {
    title: "For Clients",
    links: [
      { name: "How Workvence Works", href: "/help-center" },
      { name: "Customer Success Stories", href: "/recommended-sellers" },
      { name: "Workvence Guide", href: "/help-center" },
      { name: "Refund Policy", href: "/terms" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Workvence", href: "/trust-safety" },
      { name: "Support Agent", href: "/support" },
      { name: "Help Center", href: "/help-center" },
      { name: "Trust and Safety", href: "/trust-safety" },
      { name: "Terms of Services", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Press Release", href: "/help-center" },
    ],
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribedMsg(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Email address is required.");
      setSubscribedMsg({ type: 'error', text: "Email address is required." });
      return;
    }

    try {
      setIsSubscribing(true);
      const res = await axiosFetch.post('/newsletter/subscribe', { email: trimmedEmail });
      const resData = res.data || {};

      if (resData.alreadySubscribed) {
        const msg = resData.message || "This email is already subscribed to our newsletter.";
        toast.error(msg);
        setSubscribedMsg({ type: 'info', text: msg });
      } else {
        const msg = resData.message || "Thank you for subscribing to our newsletter!";
        toast.success(msg);
        setSubscribedMsg({ type: 'success', text: msg });
        setEmail("");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Please provide a valid email address.";
      toast.error(errMsg);
      setSubscribedMsg({ type: 'error', text: errMsg });
    } finally {
      setIsSubscribing(false);
    }
  };

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-footer'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data).catch(() => [])
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const footerColumns: FooterColumn[] = staticFooterColumns.map(col => {
    if (col.title === "Categories") {
      if (categoryList.length > 0) {
        return {
          ...col,
          links: categoryList.slice(0, 10).map((item: any): FooterLink => {
            const name = item.name || item.title || (item.slug ? item.slug[0].toUpperCase() + item.slug.slice(1) : String(item));
            const slug = item.slug || name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return {
              name,
              href: `/packages?category=${encodeURIComponent(slug)}`
            };
          })
        };
      }
      return col;
    }
    return col;
  });

  return (
    <footer className="w-full bg-white text-[#222427] pt-16 sm:pt-20 pb-10 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">

        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-16 sm:mb-20">

          {/* Left Column: Brand & Newsletter */}
          <div className="lg:col-span-4 flex flex-col items-start max-w-sm">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/Workvence-logo-Horizontal3.png"
                alt="Workvence"
                width={150}
                height={36}
                className="h-7 w-auto object-contain cursor-pointer"
                priority
              />
            </Link>

            <h3 className="font-sf-pro font-semibold text-[17px] sm:text-[18px] text-[#222427] mb-2">
              Start Your Journey
            </h3>

            <p className="font-sf-pro font-normal text-[13px] sm:text-[14px] text-[#6E6E6E] leading-[1.55] max-w-[280px] mb-5">
              Explore projects, connect with talented freelancers, and discover everything WorkVenc has to offer.
            </p>

            {/* Newsletter Input Box */}
            <form onSubmit={handleSubscribe} className="w-full max-w-[290px]">
              <div className="flex items-center w-full bg-[#F4F4F6] border border-gray-200/70 rounded-[10px] p-1.5 focus-within:border-gray-400 focus-within:bg-white transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubscribing}
                  className="w-full bg-transparent font-sf-pro text-[13px] text-[#222427] placeholder-[#8E8E93] outline-none px-2.5 py-1"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  aria-label="Subscribe"
                  className="w-8 h-8 rounded-[7px] bg-black hover:bg-black/90 active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
                >
                  <ArrowRight size={15} strokeWidth={2} />
                </button>
              </div>

              {subscribedMsg && (
                <p className={`text-xs mt-2 font-medium ${subscribedMsg.type === 'success' ? 'text-emerald-600' :
                  subscribedMsg.type === 'info' ? 'text-blue-600' : 'text-rose-600'
                  }`}>
                  {subscribedMsg.text}
                </p>
              )}
            </form>
          </div>

          {/* Right Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-10">
            {footerColumns.map((col) => (
              <div key={col.title} className="flex flex-col">
                <h4 className="font-sf-pro font-semibold text-[15px] sm:text-[16px] text-[#222427] mb-3.5 sm:mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link: FooterLink) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="font-sf-pro font-normal text-[13px] sm:text-[13.5px] text-[#6E6E6E] hover:text-[#222427] transition-colors leading-relaxed block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar Divider */}
        <div className="border-t border-gray-100 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-[13px] text-[#8E8E93]">

          {/* Copyright */}
          <p className="font-sf-pro">
            ©Workvence International Ltd. {new Date().getFullYear()}
          </p>

          {/* Right Preferences & Social Links */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">

            {/* Language & Currency */}
            <div className="flex items-center gap-3 text-[#6E6E6E]">
              <button className="flex items-center gap-1.5 hover:text-[#222427] transition-colors">
                <Globe size={15} strokeWidth={1.75} />
                <span className="font-sf-pro font-medium text-[13px]">English</span>
              </button>
              <span className="text-gray-300">|</span>
              <button className="flex items-center gap-1 hover:text-[#222427] transition-colors font-sf-pro font-medium text-[13px]">
                <span>$</span>
                <span>USD</span>
              </button>
            </div>

            {/* Social Media Pill Buttons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-[#F4F4F6] hover:bg-[#EAEAEF] flex items-center justify-center transition-colors group"
                >
                  <img
                    src={s.icon}
                    alt={s.label}
                    className="w-3.5 h-3.5 opacity-65 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}
            </div>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;