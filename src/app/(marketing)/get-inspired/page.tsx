"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Eye,
  Heart,
  ArrowRight,
  User,
  Star,
  ExternalLink,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";

interface ProjectInspiration {
  id: string;
  title: string;
  creator: string;
  creatorRole: string;
  category: string;
  likes: number;
  views: number;
  bgGradient: string;
  packageUrl: string;
}

const projects: ProjectInspiration[] = [
  {
    id: "p-1",
    title: "Neomorphic Fintech Mobile App & Design System",
    creator: "Sophie Dubois",
    creatorRole: "Pro UI/UX Designer",
    category: "Web & Mobile Design",
    likes: 342,
    views: 2450,
    bgGradient: "from-blue-600 via-indigo-600 to-slate-900",
    packageUrl: "/packages?category=graphics-and-design"
  },
  {
    id: "p-2",
    title: "3D Isometric Cyberpunk Game Environment",
    creator: "Elena Rostova",
    creatorRole: "3D Motion Lead",
    category: "3D & Animation",
    likes: 512,
    views: 3890,
    bgGradient: "from-emerald-500 via-teal-700 to-slate-950",
    packageUrl: "/packages?category=video-and-animation"
  },
  {
    id: "p-3",
    title: "Modern Luxury Coffee Brand Identity & Packaging",
    creator: "David Kim",
    creatorRole: "Brand Specialist",
    category: "Branding & Packaging",
    likes: 288,
    views: 1920,
    bgGradient: "from-amber-600 via-orange-700 to-stone-900",
    packageUrl: "/packages?category=graphics-and-design"
  },
  {
    id: "p-4",
    title: "Next.js 16 AI Semantic Search Engine & Dashboard",
    creator: "Kenji Sato",
    creatorRole: "Senior Full Stack Pro",
    category: "Code & Tech",
    likes: 420,
    views: 3100,
    bgGradient: "from-violet-600 via-purple-800 to-slate-950",
    packageUrl: "/packages?category=programming-and-tech"
  }
];

const categories = ["All", "Web & Mobile Design", "3D & Animation", "Branding & Packaging", "Code & Tech"];

export default function GetInspiredPage() {
  const [selectedCat, setSelectedCat] = useState("All");

  const filteredProjects = projects.filter(
    (p) => selectedCat === "All" || p.category === selectedCat
  );

  const handleLike = (id: string) => {
    toast.success("Added project to your moodboard inspirations!");
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Curated Marketplace Creations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Get Inspired by World-Class Work
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Discover stunning designs, 3D animations, websites, and brand identities crafted by top Workvence freelancers.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedCat === cat
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase Grid */}
      <div className="container mx-auto px-4 md:px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200/90 rounded-3xl overflow-hidden hover:border-[#327C73] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Visual Project Canvas Mock */}
              <div className={`h-64 bg-gradient-to-br ${item.bgGradient} p-8 flex flex-col justify-between text-white relative overflow-hidden`}>
                <div className="flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-md">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleLike(item.id)}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="z-10 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold leading-snug drop-shadow-md">{item.title}</h3>
                </div>

                <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
              </div>

              {/* Creator & Actions Footer */}
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-[#0f172a]">{item.creator}</div>
                  <div className="text-xs text-gray-500">{item.creatorRole}</div>
                </div>

                <Link
                  href={item.packageUrl}
                  className="px-5 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Hire Creator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
