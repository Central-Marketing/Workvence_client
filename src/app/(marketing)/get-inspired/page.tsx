"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Eye,
  Heart,
  ArrowRight,
  User,
  Star,
  ExternalLink,
  Layers,
  CheckCircle2,
  X,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

interface ProjectInspiration {
  id: string;
  title: string;
  creator: string;
  creatorRole: string;
  creatorAvatar: string;
  category: string;
  imageUrl: string;
  likes: number;
  views: number;
  tools: string[];
  description: string;
  turnaround: string;
  packageUrl: string;
}

const projects: ProjectInspiration[] = [
  {
    id: "p-1",
    title: "Fintech Dashboard & Mobile Banking Experience",
    creator: "Sophie Dubois",
    creatorRole: "Pro UI/UX Designer",
    creatorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    category: "Web & Mobile Design",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    likes: 342,
    views: 2450,
    tools: ["Figma", "Design Systems", "Prototyping"],
    description: "A comprehensive multi-platform neo-banking interface featuring dark/light modes, live crypto transaction tracking, biometric verification flows, and accessible design tokens.",
    turnaround: "7 Days Delivery",
    packageUrl: "/packages?category=graphics-and-design"
  },
  {
    id: "p-2",
    title: "Abstract Fluid 3D Brand Artwork & Commercial Identity",
    creator: "Elena Rostova",
    creatorRole: "3D Motion Lead",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    category: "3D & Animation",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    likes: 512,
    views: 3890,
    tools: ["Blender 4.2", "Cinema 4D", "Octane Render"],
    description: "High-resolution organic 3D glassmorphic sculptures and key visual assets crafted for a luxury tech brand rebrand.",
    turnaround: "5 Days Delivery",
    packageUrl: "/packages?category=video-and-animation"
  },
  {
    id: "p-3",
    title: "Minimalist Luxury Skincare & Cosmetic Packaging",
    creator: "David Kim",
    creatorRole: "Brand & Packaging Specialist",
    creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    category: "Branding & Packaging",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    likes: 288,
    views: 1920,
    tools: ["Adobe Illustrator", "Photoshop", "3D Mockups"],
    description: "Full brand identity suite including sustainable custom bottle shapes, typography hierarchy, gold foil stamping guidelines, and e-commerce packaging.",
    turnaround: "6 Days Delivery",
    packageUrl: "/packages?category=graphics-and-design"
  },
  {
    id: "p-4",
    title: "Next.js 16 AI Analytics Engine & Real-time WebSockets",
    creator: "Kenji Sato",
    creatorRole: "Senior Full Stack Pro",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    category: "Code & Tech",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    likes: 420,
    views: 3100,
    tools: ["Next.js 16", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    description: "Production-ready web application with sub-second vector search querying, automated Stripe escrow webhooks, and responsive admin dashboard analytics.",
    turnaround: "10 Days Delivery",
    packageUrl: "/packages?category=programming-and-tech"
  },
  {
    id: "p-5",
    title: "Cinematic Commercial Video Editing & Motion VFX",
    creator: "Alex Vance",
    creatorRole: "Senior Video Director",
    creatorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    category: "Video & Motion",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    likes: 375,
    views: 2800,
    tools: ["DaVinci Resolve", "Premiere Pro", "After Effects"],
    description: "High-energy commercial trailer for a consumer hardware product launch, including cinematic sound design, pacing, and 4K color grading.",
    turnaround: "4 Days Delivery",
    packageUrl: "/packages?category=video-and-animation"
  },
  {
    id: "p-6",
    title: "Modern Architectural 3D Rendering & Lighting",
    creator: "Maya Lin",
    creatorRole: "ArchViz 3D Artist",
    creatorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    category: "3D & Animation",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    likes: 460,
    views: 3400,
    tools: ["3ds Max", "V-Ray", "Corona Renderer"],
    description: "Photorealistic interior and exterior architectural visualization with realistic global illumination and custom material shaders.",
    turnaround: "8 Days Delivery",
    packageUrl: "/packages?category=graphics-and-design"
  }
];

const categories = ["All", "Web & Mobile Design", "3D & Animation", "Branding & Packaging", "Code & Tech", "Video & Motion"];

export default function GetInspiredPage() {
  const [selectedCat, setSelectedCat] = useState("All");
  const [likedProjects, setLikedProjects] = useState<Record<string, boolean>>({});
  const [selectedProject, setSelectedProject] = useState<ProjectInspiration | null>(null);

  const filteredProjects = projects.filter(
    (p) => selectedCat === "All" || p.category === selectedCat
  );

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedProjects((prev) => {
      const next = !prev[id];
      if (next) {
        toast.success("Saved project to your inspiration board!");
      } else {
        toast("Removed from saved inspirations", { icon: "ℹ️" });
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Curated Marketplace Showcase</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Get Inspired by World-Class Work
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Explore exceptional designs, 3D animations, websites, code, and brand identities crafted by top Workvence freelancers.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((item) => {
            const isLiked = likedProjects[item.id];
            const currentLikes = item.likes + (isLiked ? 1 : 0);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedProject(item)}
                className="bg-white border border-gray-200/90 rounded-3xl overflow-hidden hover:border-[#327C73] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
              >
                {/* Visual Project Thumbnail */}
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/50 text-white backdrop-blur-md border border-white/10">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => toggleLike(e, item.id)}
                      className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition cursor-pointer ${
                        isLiked
                          ? "bg-rose-500 text-white shadow-md scale-110"
                          : "bg-black/50 hover:bg-black/70 text-white border border-white/10"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-white" : ""}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Creator & Actions Body */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.creatorAvatar}
                      alt={item.creator}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#0f172a]">{item.creator}</div>
                      <div className="text-[11px] text-gray-500">{item.creatorRole}</div>
                    </div>
                  </div>

                  <Link
                    href={item.packageUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Hire Creator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* High-Res Hero Image Preview */}
            <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100">
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                  {selectedProject.category}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-[#0f172a]">{selectedProject.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>By {selectedProject.creator} ({selectedProject.creatorRole})</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">{selectedProject.turnaround}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast.success("Project link copied!");
                    }}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">About the Project:</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                  {selectedProject.description}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Tools & Skills Used:</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProject.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#f1f5f9] text-gray-700 border border-gray-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProject.creatorAvatar}
                    alt={selectedProject.creator}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">{selectedProject.creator}</div>
                    <div className="text-[11px] text-gray-400">Available for new client orders</div>
                  </div>
                </div>

                <Link
                  href={selectedProject.packageUrl}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Order a Package from {selectedProject.creator.split(" ")[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
