"use client";

import { useState, useEffect, useRef } from "react";
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
  FiPlus,
  FiX,
  FiTag,
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

const PROMPT_SUGGESTIONS = [
  "Landing page for mobile app with waitlist",
  "Full-stack SaaS dashboard with billing",
  "Brand identity with logo and style guide",
  "E-commerce store setup with Stripe checkout",
];

const CreateBrief = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    categoryName: "",
    budget: "",
    deliveryTime: "",
    requiredSkills: [] as string[],
  });

  // Modal & Input States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const modalPromptRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Autofocus modal prompt input when modal opens
  useEffect(() => {
    if (isAiModalOpen) {
      const timer = setTimeout(() => {
        modalPromptRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAiModalOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAiModalOpen && !aiGenerate.isPending) {
        setIsAiModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAiModalOpen]);

  // Step 1: Ask AI to Draft the Project (POST /api/briefs/ai-generate)
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
        categoryName: draft?.categoryName || matchedCat?.name || form.categoryName,
        budget:
          draft?.budget !== undefined && draft?.budget !== null
            ? String(draft.budget)
            : form.budget,
        deliveryTime:
          draft?.deliveryTime !== undefined && draft?.deliveryTime !== null
            ? String(draft.deliveryTime)
            : form.deliveryTime,
        requiredSkills: Array.isArray(draft?.requiredSkills)
          ? draft.requiredSkills
          : form.requiredSkills,
      });

      setAiGeneratedSuccess(true);
      setIsAiModalOpen(false);
      toast.success(data?.message || "AI brief draft generated successfully!");

      // Scroll smoothly down to the form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    },
    onError: (err: any) => {
      console.error("AI generation failed:", err);
      toast.error(err?.response?.data?.message || "Failed to generate project with AI. Try again.");
    },
  });

  const handleOpenAiModal = () => {
    if (!user) {
      toast.error("Please sign in to use Workvence AI");
      router.push(`/login?redirect=${encodeURIComponent("/briefs/create")}`);
      return;
    }
    setIsAiModalOpen(true);
  };

  const handleGenerateFromModal = (overridePrompt?: string) => {
    const promptText = (typeof overridePrompt === "string" ? overridePrompt : aiPrompt).trim();
    if (!promptText) {
      toast.error("Please describe your project or select a suggestion");
      modalPromptRef.current?.focus();
      return;
    }
    aiGenerate.mutate(promptText);
  };

  // Skill Tags Management
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (form.requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Skill already added");
      return;
    }
    setForm((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, trimmed],
    }));
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  // Step 2: Publish the Project (POST /api/briefs)
  const postBrief = useMutation({
    mutationFn: (briefData: any) =>
      axiosFetch.post("/briefs", briefData).then(({ data }) => data),
    onSuccess: (data: any) => {
      setIsPublished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(data?.message || "Brief created successfully!");
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
    if (form.requiredSkills && form.requiredSkills.length > 0) {
      payload.requiredSkills = form.requiredSkills;
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

        {/* Page Header */}
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
            onClick={handleOpenAiModal}
            className="bg-[#042823] hover:bg-[#073932] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0 border border-emerald-600/30 active:scale-[0.98]"
            title="Draft project with Workvence AI"
          >
            <HiSparkles className="text-emerald-400 text-base" />
            <span>Create with AI</span>
          </button>
        </div>

        {/* AI Draft Banner (Displayed after AI generates or when draft is ready) */}
        {aiGeneratedSuccess && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm animate-fadeIn">
            <div className="flex items-center gap-2.5 text-emerald-900 font-medium">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiSparkles className="text-base" />
              </span>
              <span>
                Project draft generated with AI! Review and customize the details below before publishing.
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenAiModal}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto shrink-0 cursor-pointer"
            >
              Draft again with AI
            </button>
          </div>
        )}

        {/* Main Form Card (Review, Edit & Publish) */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 sm:space-y-8"
        >
          {/* Header row inside form */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sf-pro">
                Project Details & Requirements
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Fill in the details below or use AI to generate a complete draft.
              </p>
            </div>
            {!aiGeneratedSuccess && (
              <button
                type="button"
                onClick={handleOpenAiModal}
                className="text-xs font-semibold text-[#0D6B5D] hover:text-[#0a5247] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <HiSparkles className="text-sm" />
                <span>Draft with AI</span>
              </button>
            )}
          </div>

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
              {form.category && !categories.some((c: any) => c.slug === form.category) && (
                <option value={form.category}>
                  {form.categoryName || form.category}
                </option>
              )}
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

          {/* Section 4: Required Skills & Technologies */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              Required Skills & Technologies <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>

            {/* Skill tags list */}
            <div className="flex flex-wrap items-center gap-2 mb-3 min-h-[36px]">
              {form.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium transition-all"
                >
                  <FiTag className="text-[11px] text-emerald-600" />
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-emerald-950 p-0.5 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
                    title={`Remove ${skill}`}
                  >
                    <FiX className="text-xs" />
                  </button>
                </span>
              ))}
              {form.requiredSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic py-1">
                  No skills specified yet. Enter skills below or generate with AI.
                </span>
              )}
            </div>

            {/* Input to add more skills */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="Add a required skill (e.g. React, Tailwind CSS)"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!newSkillInput.trim()}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <FiPlus className="text-sm" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 5: Budget & Delivery Time (2-Column Grid) */}
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
                  placeholder="e.g. 150"
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
                  placeholder="e.g. 5"
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

      {/* AI Draft Modal */}
      {isAiModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
          onClick={() => !aiGenerate.isPending && setIsAiModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl w-full relative overflow-hidden select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => !aiGenerate.isPending && setIsAiModalOpen(false)}
              disabled={aiGenerate.isPending}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Close modal"
            >
              <FiX className="text-lg" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center text-xl shadow-xs">
                <HiSparkles />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-sf-pro">
                  Draft Project with Workvence AI
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Describe what you need in plain English.
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-4 mt-3">
              Our AI will automatically generate your project title, detailed requirements, budget, timeline, and required tech skills.
            </p>

            {/* Prompt Input */}
            <div className="space-y-3">
              <div>
                <textarea
                  ref={modalPromptRef}
                  rows={4}
                  placeholder="e.g. I need a landing page for my mobile app with responsive design and email waitlist form."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleGenerateFromModal();
                    }
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm leading-relaxed outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:bg-white focus:ring-4 focus:ring-[#327C73]/10 resize-none"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setAiPrompt(suggestion);
                        handleGenerateFromModal(suggestion);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-[11px] font-medium transition-all cursor-pointer border border-slate-200/60"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={aiGenerate.isPending}
                  className="py-2.5 px-5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateFromModal()}
                  disabled={aiGenerate.isPending || !aiPrompt.trim()}
                  className="py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-[#042823] hover:bg-[#073932] text-white transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiGenerate.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Draft...</span>
                    </>
                  ) : (
                    <>
                      <HiSparkles className="text-emerald-400 text-base" />
                      <span>Generate Project Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreateBriefPage() {
  return <CreateBrief />;
}
