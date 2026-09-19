"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiHome,
  FiArrowRight,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { axiosFetch } from "@/utils";
import useAdminCategories from "@/hooks/useAdminCategories";
import { useUserStore } from "@/store/userStore";

const CATEGORIES = [
  "AI",
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Video & Animation",
  "Data",
  "Other",
];

const CreateBrief = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deliveryTime: "",
  });

  const [isPublished, setIsPublished] = useState(false);

  const { categoryList } = useAdminCategories();

  const rawFormatted =
    categoryList.length > 0
      ? categoryList.map((cat: any) =>
          typeof cat === "string"
            ? {
                name: cat,
                slug: cat
                  .toLowerCase()
                  .trim()
                  .replace(/&/g, "and")
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, ""),
              }
            : {
                name: cat.name || cat.title || String(cat),
                slug:
                  cat.slug ||
                  (cat.name || cat.title || "")
                    .toLowerCase()
                    .trim()
                    .replace(/&/g, "and")
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
              }
        )
      : CATEGORIES.map((c) => ({
          name: c,
          slug: c
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        }));

  const categories = [
    ...rawFormatted.filter(
      (c: any) =>
        c.slug !== "other-and-general" &&
        c.slug !== "other" &&
        !c.name.toLowerCase().includes("other")
    ),
    ...rawFormatted.filter(
      (c: any) =>
        c.slug === "other-and-general" ||
        c.slug === "other" ||
        c.name.toLowerCase().includes("other")
    ),
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // AI Generation Mutation connected directly to Backend /briefs/ai-generate
  const aiGenerate = useMutation({
    mutationFn: async (promptText: string) => {
      const response = await axiosFetch.post("/briefs/ai-generate", { prompt: promptText });
      return response.data;
    },
    onSuccess: (data: any) => {
      const draft = data?.draft || data;
      const matchedCat = categories.find(
        (c: any) =>
          c.slug === draft?.categorySlug ||
          c.slug === draft?.category ||
          c.name?.toLowerCase() === (draft?.categoryName || draft?.category || "").toLowerCase()
      );
      const resolvedCategory = matchedCat ? matchedCat.slug : draft?.categorySlug || draft?.category || "";

      setForm({
        title: draft?.title || form.title,
        description: draft?.description || form.description,
        category: resolvedCategory || form.category,
        budget: draft?.budget !== undefined && draft?.budget !== null ? String(draft.budget) : form.budget,
        deliveryTime: draft?.deliveryTime !== undefined && draft?.deliveryTime !== null ? String(draft.deliveryTime) : form.deliveryTime,
      });

      toast.success("Project fields auto-filled!");
    },
    onError: (err: any) => {
      console.error("AI generation failed:", err);
      toast.error(err?.response?.data?.message || "Failed to generate project with AI. Try again.");
    },
  });

  const handleAutoFillWithAI = () => {
    if (!user) {
      toast.error("Please sign in to use Workvence AI auto-fill");
      router.push(`/login?redirect=${encodeURIComponent("/briefs/create")}`);
      return;
    }

    const promptText =
      form.title.trim() ||
      form.description.trim() ||
      "Modern full-stack web application development with responsive design and secure API integration";

    aiGenerate.mutate(promptText);
  };

  // Post brief mutation
  const postBrief = useMutation({
    mutationFn: (briefData: any) =>
      axiosFetch.post("/briefs", briefData).then(({ data }) => data),
    onSuccess: () => {
      setIsPublished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Project published successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to post project");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to post a project");
      router.push(`/login?redirect=${encodeURIComponent("/briefs/create")}`);
      return;
    }

    if (!form.title.trim()) {
      toast.error("Please provide a project title");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please provide a project description");
      return;
    }

    const payload: Record<string, any> = {
      title: form.title.trim(),
      description: form.description.trim(),
    };

    if (form.category) payload.category = form.category;
    if (form.budget && !isNaN(Number(form.budget))) {
      payload.budget = Number(form.budget);
    }
    if (form.deliveryTime && !isNaN(Number(form.deliveryTime))) {
      payload.deliveryTime = Number(form.deliveryTime);
    }

    postBrief.mutate(payload);
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Success State
  if (isPublished) {
    return (
      <div className="min-h-[85vh] bg-[#FAFAFA] flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-8 sm:p-12 max-w-lg w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8F5ED] text-[#0D6B5D] border border-[#BCE8DE] flex items-center justify-center text-3xl mb-5 shadow-2xs">
            <FiCheckCircle />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 mb-2.5 font-sf-pro">
            Project Published Successfully!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-8 max-w-sm">
            Your project brief is now live. Freelancers can review your requirements
            and submit proposals immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href="/briefs/my-briefs"
              className="py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-black hover:bg-slate-800 text-white transition-all shadow-xs text-center"
            >
              View My Projects
            </Link>
            <Link
              href="/briefs"
              className="py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center"
            >
              Browse All Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pb-20 pt-6 sm:pt-8 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6 select-none">
          <Link
            href="/"
            className="text-[#327C73] hover:text-[#256059] transition-colors flex items-center gap-1"
          >
            <FiHome className="text-sm text-[#327C73]" />
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/briefs" className="hover:text-slate-800 transition-colors">
            Briefs
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-normal">Post a Job</span>
        </div>

        {/* Page Header with 'Create with AI' Auto-Fill Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-900 tracking-tight font-sf-pro leading-tight mb-2">
              Post a Job Project
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal max-w-xl">
              Describe your project specifications to receive competitive proposals from
              vetted freelance professionals.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoFillWithAI}
            disabled={aiGenerate.isPending}
            className="bg-[#042823] hover:bg-[#073932] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0 border border-emerald-600/30 disabled:opacity-60"
            title="Auto-fill project fields with AI"
          >
            {aiGenerate.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Auto-filling...</span>
              </>
            ) : (
              <>
                <HiSparkles className="text-emerald-400 text-base" />
                <span>Create with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Main Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 sm:space-y-8"
        >
          {/* Section 1: Project Title */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              Project Title <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Build a responsive SaaS web application for client invoicing"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-[15px] outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10"
            />
          </div>

          {/* Section 2: Category Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              Category <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-[15px] outline-none transition-all focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10 cursor-pointer"
            >
              <option value="">Select a category</option>
              {categories.map((c: any) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: Description */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              Project Description <span className="text-emerald-600">*</span>
            </label>
            <textarea
              placeholder="Describe your project goals, required deliverables, preferences, and any technical specifications..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              rows={6}
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm leading-relaxed outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10 resize-y"
            />
          </div>

          {/* Section 4: Budget & Delivery Time (2-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
                Budget (USD) <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">
                  <FiDollarSign />
                </span>
                <input
                  type="number"
                  min="5"
                  placeholder="e.g. 1500"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                  className="w-full pl-9 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-[15px] outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
                Estimated Timeline (Days) <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">
                  <FiCalendar />
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 14"
                  value={form.deliveryTime}
                  onChange={(e) => updateField("deliveryTime", e.target.value)}
                  className="w-full pl-9 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-[15px] outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10"
                />
              </div>
            </div>
          </div>


          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <Link
              href="/briefs"
              className="py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={postBrief.isPending}
              className="py-3.5 px-8 rounded-xl font-semibold text-xs sm:text-sm bg-black hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{postBrief.isPending ? "Publishing Project..." : "Publish Project"}</span>
              {!postBrief.isPending && <FiArrowRight className="text-xs" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CreateBriefPage() {
  return <CreateBrief />;
}
