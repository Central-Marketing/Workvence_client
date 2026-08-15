"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import adminAxios from "@/utils/adminAxios";

const socialLinks = [
  { href: "https://www.tiktok.com/@workvence", icon: "/all-icons/tiktok.svg", label: "TikTok" },
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

const staticFooterColumns: FooterColumn[] = [
  {
    title: "Categories",
    links: [],
  },
  {
    title: "For Clients",
    links: [
      { name: "How workvence works", href: "/help-center" },
      { name: "Customer Success Stories", href: "/recommended-sellers" },
      { name: "Workvence Guides", href: "/help-center" },
      { name: "Post a Project", href: "/briefs" },
      { name: "Browse Services", href: "/packages" },
      { name: "Recommended Sellers", href: "/recommended-sellers" },
    ],
  },
  {
    title: "For Freelancers",
    links: [
      { name: "Become a Freelancer", href: "/register?seller=true" },
      { name: "Community Hub", href: "/help-center" },
      { name: "Seller Resources", href: "/help-center" },
      // { name: "Blogs", href: "/help-center" },
      { name: "Success Stories", href: "/recommended-sellers" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Workvence", href: "/trust-safety" },
      { name: "Help Center", href: "/help-center" },
      { name: "Trust & Safety", href: "/trust-safety" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      // { name: "Press & News", href: "/help-center" },
    ],
  },
];

const Footer = () => {
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories-footer'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data)
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  const footerColumns: FooterColumn[] = staticFooterColumns.map(col => {
    if (col.title === "Categories") {
      return {
        ...col,
        links: categoryList.slice(0, 12).map((item: any): FooterLink => {
          const name = item.name || (item.slug ? item.slug[0].toUpperCase() + item.slug.slice(1) : String(item));
          const slug = item.slug || name.toLowerCase().replace(/\s+/g, '-');
          return {
            name,
            href: `/packages?category=${encodeURIComponent(slug)}`
          };
        })
      };
    }
    return col;
  });

  return (
    <footer className="w-full bg-slate-900 text-slate-100">
      {/* Top: Brand + newsletter */}
      <div className="container mx-auto px-4 md:px-8 pt-16 pb-12 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <Link href="/">
              <img
                src="/whiteLogo.png"
                alt="Workvence Logo"
                className="h-7 object-contain cursor-pointer mb-5"
              />
            </Link>
            <p className="text-[13.5px] text-slate-400 leading-relaxed">
              The trusted marketplace connecting skilled professionals with clients around the world. Hire smarter. Deliver better.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  <img src={s.icon} alt={s.label} className="w-4 h-4 opacity-70 invert" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <h4 className="text-[15px] font-semibold text-slate-100 mb-2">Stay in the loop</h4>
            <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
              Get the latest platform updates, freelancer tips, and curated picks straight to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-slate-800 text-slate-100 text-[13px] placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-500 transition-colors"
              />
              <button className="bg-brand-green hover:bg-brand-green text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Nav columns */}
      <div className="container mx-auto px-4 md:px-8 py-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-[14px] font-semibold text-slate-100 mb-2">{col.title}</h3>
              {col.links.map((link: FooterLink) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[13px] text-slate-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-slate-400">
            ©Workvence International Ltd. {new Date().getFullYear()} — All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[12px] text-slate-400">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <img src="/all-icons/global.svg" alt="Language" className="w-3.5 h-3.5 opacity-60 invert" />
              <span>English</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white transition-colors">
              <span className="font-medium">$</span>
              <span>USD</span>
            </button>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;