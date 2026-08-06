import Link from "next/link";

const socialLinks = [
  { href: "#", icon: "/all-icons/tiktok.svg", label: "TikTok" },
  { href: "#", icon: "/all-icons/instagram.svg", label: "Instagram" },
  { href: "#", icon: "/all-icons/linkedin-01.svg", label: "LinkedIn" },
  { href: "#", icon: "/all-icons/facebook-01.svg", label: "Facebook" },
  { href: "#", icon: "/all-icons/pinterest.svg", label: "Pinterest" },
  { href: "#", icon: "/all-icons/new-twitter-rectangle.svg", label: "X (Twitter)" },
];

const footerColumns = [
  {
    title: "Categories",
    links: [
      "Graphics & Design",
      "Digital Marketing",
      "Writing & Translation",
      "Video & Animation",
      "Music & Audio",
      "Programming & Tech",
      "AI Services",
      "Consulting",
      "Data",
      "Business",
      "Photography",
      "Finance",
    ],
  },
  {
    title: "For Clients",
    links: [
      "How workvence works",
      "Customer Success Stories",
      "Workvence Guides",
      "Post a Project",
      "Browse Services",
    ],
  },
  {
    title: "For Freelancers",
    links: [
      "Become a Freelancer",
      "Community Hub",
      "Seller Resources",
      "Blogs",
      "Success Stories",
    ],
  },
  {
    title: "Company",
    links: [
      "About Workvence",
      "Help Center",
      "Trust & Safety",
      "Terms of Service",
      "Privacy Policy",
      "Press & News",
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 text-gray-900">
      {/* Top: Brand + newsletter */}
      <div className="container mx-auto px-4 md:px-8 pt-16 pb-12 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <Link href="/">
              <img
                src="/Workvence-logo-Horizontal 1.png"
                alt="Workvence"
                className="h-7 object-contain cursor-pointer mb-5"
              />
            </Link>
            <p className="text-[13.5px] text-gray-500 leading-relaxed">
              The trusted marketplace connecting skilled professionals with clients around the world. Hire smarter. Deliver better.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <img src={s.icon} alt={s.label} className="w-4 h-4 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-2">Stay in the loop</h4>
            <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
              Get the latest platform updates, freelancer tips, and curated picks straight to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-gray-50 text-gray-900 text-[13px] placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 transition-colors"
              />
              <button className="bg-[#1dbf73] hover:bg-[#19a463] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Nav columns */}
      <div className="container mx-auto px-4 md:px-8 py-12 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">{col.title}</h3>
              {col.links.map((link) => (
                <Link
                  key={link}
                  href={link === "Privacy Policy" ? "/privacy" : link === "Terms of Service" ? "/terms" : "#"}
                  className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-gray-500">
            ©Workvence International Ltd. {new Date().getFullYear()} — All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[12px] text-gray-500">
            <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <img src="/all-icons/global.svg" alt="Language" className="w-3.5 h-3.5 opacity-60" />
              <span>English</span>
            </button>
            <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              <span className="font-medium">$</span>
              <span>USD</span>
            </button>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;