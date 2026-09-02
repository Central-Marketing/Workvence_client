"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Play,
  Star,
  Clock,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  User,
  X
} from "lucide-react";
import toast from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  instructorTitle: string;
  duration: string;
  lessonsCount: number;
  rating: number;
  reviewsCount: number;
  price: string;
  summary: string;
  syllabus: string[];
}

const courses: Course[] = [
  {
    id: "c-1",
    title: "Mastering Next.js 16 & Server Actions for Production Web Apps",
    category: "Programming & Tech",
    instructor: "Kenji Sato",
    instructorTitle: "Principal Full Stack Architect",
    duration: "4.5 Hours",
    lessonsCount: 28,
    rating: 4.9,
    reviewsCount: 380,
    price: "$49",
    summary: "Learn modern server components, streaming SSR, PostgreSQL vector search, and Stripe webhook escrow integrations from scratch.",
    syllabus: [
      "1. Next.js 16 App Router Architecture & Server Actions",
      "2. Database Modeling with Prisma & PostgreSQL",
      "3. Real-Time WebSockets & In-App Messaging",
      "4. Escrow Payment Webhooks with Stripe API",
      "5. Production Deployment on Vercel & Docker"
    ]
  },
  {
    id: "c-2",
    title: "The 3D Brand Design & Motion Masterclass in Blender & Figma",
    category: "Design",
    instructor: "Elena Rostova",
    instructorTitle: "Top Rated 3D Creative Lead",
    duration: "6.0 Hours",
    lessonsCount: 36,
    rating: 5.0,
    reviewsCount: 520,
    price: "$59",
    summary: "Step-by-step 3D lighting, isometric scene composition, fluid simulations, and exporting optimized assets for modern web designs.",
    syllabus: [
      "1. Blender 4.2 Workspace & Lighting Fundamentals",
      "2. Creating High-End Glassmorphic 3D Icons",
      "3. Micro-Animations & Keyframing for Web",
      "4. Figma Integration & Interactive Prototyping"
    ]
  },
  {
    id: "c-3",
    title: "High-Ticket Freelance Sales & Proposal Psychology",
    category: "Business & Sales",
    instructor: "Marcus Vance",
    instructorTitle: "Agency Scaling Mentor",
    duration: "3.2 Hours",
    lessonsCount: 18,
    rating: 4.8,
    reviewsCount: 290,
    price: "$39",
    summary: "How to craft irresistible gig descriptions, win high-budget enterprise briefs, and negotiate value-based retainers without price wars.",
    syllabus: [
      "1. Deconstructing the Psychology of High-Budget Buyers",
      "2. The 3-Tier Pricing Model Matrix",
      "3. Handling Revisions & Defending Your Scope",
      "4. Converting One-Off Orders into $2,500/mo Retainers"
    ]
  }
];

const categories = ["All", "Programming & Tech", "Design", "Business & Sales"];

export default function LearnPage() {
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter(
    (c) => selectedCat === "All" || c.category === selectedCat
  );

  const handleEnroll = (title: string) => {
    toast.success(`Enrolled in "${title}"! Access details sent to your account.`);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Learn • Expert Masterclasses</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Level Up Your Freelance Craft
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              On-demand online courses taught by top-rated industry practitioners. Earn verified badges for your seller profile.
            </p>

            {/* Filter Pills */}
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

      {/* Courses List Grid */}
      <div className="container mx-auto px-4 md:px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200/90 rounded-3xl p-7 hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-[#10b981]/10 text-[#327C73]">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-gray-400 font-normal">({course.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#0f172a] leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {course.summary}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-800">{course.instructor}</span>
                    <span>({course.instructorTitle})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessonsCount} Lessons
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#0f172a]">{course.price}</span>
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="px-5 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
                >
                  View Syllabus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-10 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#10b981]/10 text-[#327C73]">
                {selectedCourse.category}
              </span>
              <h2 className="text-2xl font-bold text-[#0f172a] leading-tight">
                {selectedCourse.title}
              </h2>
              <p className="text-xs text-gray-500">
                Taught by {selectedCourse.instructor} • {selectedCourse.duration} • {selectedCourse.lessonsCount} Lessons
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Curriculum Syllabus:</h4>
              <div className="space-y-2">
                {selectedCourse.syllabus.map((s, i) => (
                  <div key={i} className="p-3 bg-[#f8fafc] rounded-xl text-xs font-medium text-gray-800 border border-gray-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleEnroll(selectedCourse.title)}
              className="w-full py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enroll Now for {selectedCourse.price} (Instant Access)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
