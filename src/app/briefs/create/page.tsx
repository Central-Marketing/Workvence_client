"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
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
import useAdminCategories, { isCategoryRoot } from "@/hooks/useAdminCategories";
import { useUserStore } from "@/store/userStore";
import { useAuthModalStore } from "@/store/authModalStore";
import { Button, Breadcrumb, AiGradientButton } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";

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
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.user);
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);

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

  const { categoryList: rawCats, parentCategories } = useAdminCategories();

  // Strictly root categories only
  const rootCategoriesList = (parentCategories && parentCategories.length > 0 ? parentCategories : rawCats)
    .filter((cat: any) => isCategoryRoot(cat, rawCats));

  const rawFormatted =
    rootCategoriesList.length > 0
      ? rootCategoriesList.map((cat: any) =>
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
      let resolvedCategory = matchedCat ? matchedCat.slug : "";
      let resolvedCategoryName = matchedCat ? matchedCat.name : "";

      // If draft category is a subcategory or niche, resolve to its parent root category
      if (!resolvedCategory && (draft?.categorySlug || draft?.category || draft?.categoryName)) {
        const rawTarget = String(draft?.categorySlug || draft?.category || draft?.categoryName || "").toLowerCase();
        const parentOfChild = (parentCategories || []).find((parent: any) => {
          const children = Array.isArray(parent.children) ? parent.children : [];
          return children.some((child: any) => {
            const childSlug = String(child.slug || child.name || "").toLowerCase();
            const childId = String(child.id || child._id || "").toLowerCase();
            if (childSlug === rawTarget || childId === rawTarget) return true;
            const niches = Array.isArray(child.children) ? child.children : [];
            return niches.some((n: any) => {
              const nSlug = String(n.slug || n.name || "").toLowerCase();
              const nId = String(n.id || n._id || "").toLowerCase();
              return nSlug === rawTarget || nId === rawTarget;
            });
          });
        });

        if (parentOfChild) {
          const foundRoot = categories.find((c: any) => c.slug === parentOfChild.slug || c.name === parentOfChild.name);
          if (foundRoot) {
            resolvedCategory = foundRoot.slug;
            resolvedCategoryName = foundRoot.name;
          }
        }
      }

      setForm({
        title: draft?.title || form.title,
        description: draft?.description || form.description,
        category: resolvedCategory || form.category,
        categoryName: resolvedCategoryName || draft?.categoryName || matchedCat?.name || form.categoryName,
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
      openAuthModal({
        mode: "login",
        onSuccess: () => {
          setIsAiModalOpen(true);
        },
      });
      return;
    }
    setIsAiModalOpen(true);
  };

  // Open AI modal automatically if redirected with ?ai=true
  useEffect(() => {
    const isAiRequested = searchParams?.get("ai") === "true" || searchParams?.get("ai") === "1";
    if (isAiRequested) {
      const timer = setTimeout(() => {
        if (!user) {
          openAuthModal({
            mode: "login",
            onSuccess: () => {
              setIsAiModalOpen(true);
            },
          });
          return;
        }
        setIsAiModalOpen(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, openAuthModal]);

  // Auto-focus prompt input when modal opens
  useEffect(() => {
    if (isAiModalOpen) {
      const timer = setTimeout(() => {
        modalPromptRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAiModalOpen]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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

    if (!user) {
      openAuthModal({
        mode: "login",
        onSuccess: () => {
          postBrief.mutate(payload);
        },
      });
      return;
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
        <div className="bg-white border border-slate-200/80 rounded-[6px] shadow-sm p-8 sm:p-12 max-w-lg w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-[6px] bg-[#D8F5ED] text-[#0D6B5D] border border-[#BCE8DE] flex items-center justify-center text-3xl mb-5 shadow-2xs">
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
            <Button
              href="/briefs/my-briefs"
              variant="dark"
              size="md"
              radius="fiverr"
              className="shadow-xs"
            >
              View My Projects
            </Button>
            <Button
              href="/briefs"
              variant="soft"
              size="md"
              radius="fiverr"
            >
              Browse All Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-6 sm:pt-8 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Top Breadcrumb */}
        <Breadcrumb
          className="mb-6 select-none"
          items={[
            {
              name: "Briefs",
              href: "/briefs",
            },
            {
              name: "Post a Job",
              isLast: true,
            },
          ]}
        />

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

          <AiGradientButton
            onClick={handleOpenAiModal}
            text="Create with AI"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M0.75 7.60886C3.56875 4.84296 10.19 -0.808996 12.025 1.15511C14.3438 3.63702 2.15937 9.91366 4.03854 12.6791C6.0234 15.6001 12.9646 5.30336 15.3135 7.14726C17.6625 8.99126 9.676 13.1401 11.5552 15.4451C12.3069 16.367 14.3739 14.9841 15.3135 14.0621" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            px="px-4"
            py="py-2"
            height="h-[40px]"
            className="self-start sm:self-auto shrink-0 text-sm font-semibold rounded-[6px]"
          />
        </div>



        {/* Main Form Card (Review, Edit & Publish) */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-[6px] sm:rounded-[6px] p-6 sm:p-10 shadow-2xs space-y-6 sm:space-y-8"
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

          </div>

          {/* Section 1: Project Title */}
          <div>
            <label className="block text-xs sm:text-[13px] font-medium text-gray-700 mb-1.5">
              Project Title <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Build a responsive SaaS web application for client invoicing"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors"
            />
          </div>

          {/* Section 2: Category Selection */}
          <div>
            <label className="block text-xs sm:text-[13px] font-medium text-gray-700 mb-1.5">
              Category <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>
            <CustomSelect
              size="md"
              options={[
                { value: "", label: "Select a category" },
                ...categories.map((c: any) => ({
                  value: c.slug,
                  label: c.name,
                })),
              ]}
              value={form.category}
              onChange={(val) => {
                const selectedSlug = String(val);
                const found = categories.find((c: any) => c.slug === selectedSlug);
                setForm((prev) => ({
                  ...prev,
                  category: selectedSlug,
                  categoryName: found?.name || selectedSlug,
                }));
              }}
              placeholder="Select a category"
              ariaLabel="Select a category"
            />
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
              className="w-full p-4 rounded-[6px] border border-slate-200 bg-white text-slate-900 text-sm leading-relaxed outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:ring-4 focus:ring-[#327C73]/10 resize-y"
            />
          </div>

          {/* Section 4: Required Skills & Technologies */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              Required Skills & Technologies <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>

            {/* Skill tags list */}
            <div className="flex flex-wrap items-center gap-2 mb-3 min-h-[40px]">
              {form.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex h-10 items-center gap-1.5 px-3 rounded-[6px] bg-gray-200 text-emerald-800 border text-xs font-medium transition-all"
                >
                  <FiTag className="text-[11px] text-emerald-600" />
                  <span>{skill}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    radius="full"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-emerald-950 p-0.5 w-4 h-auto min-h-0 transition-colors border-none shadow-none"
                    title={`Remove ${skill}`}
                  >
                    <FiX className="text-xs" />
                  </Button>
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
                className="flex-1 h-10 px-3.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors"
              />
              <Button
                type="button"
                variant="dark"
                size="sm"
                radius="fiverr"
                onClick={handleAddSkill}
                disabled={!newSkillInput.trim()}
                leftIcon={<FiPlus className="text-sm" />}
                className="shrink-0 h-10"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Section 5: Budget & Delivery Time (2-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-[13px] font-medium text-gray-700 mb-1.5">
                Budget (USD) <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 flex items-center text-gray-400 text-sm pointer-events-none">
                  <FiDollarSign />
                </span>
                <input
                  type="number"
                  min="5"
                  placeholder="e.g. 150"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-medium text-gray-700 mb-1.5">
                Estimated Timeline (Days) <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 flex items-center text-gray-400 text-sm pointer-events-none">
                  <FiCalendar />
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={form.deliveryTime}
                  onChange={(e) => updateField("deliveryTime", e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <Button
              href="/briefs"
              variant="soft"
              size="md"
              radius="fiverr"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="dark"
              size="md"
              radius="fiverr"
              disabled={postBrief.isPending}
              isLoading={postBrief.isPending}
              rightIcon={<FiArrowRight className="text-xs" />}
              className="px-8 shadow-xs"
            >
              Publish Project
            </Button>
          </div>
        </form>
      </div>

      {/* AI Draft Modal */}
      {isAiModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none transition-all duration-300 ease-out animate-fadeIn"
          onClick={() => !aiGenerate.isPending && setIsAiModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-[6px] sm:rounded-[6px] max-w-xl w-full max-h-[calc(100dvh-2rem)] flex flex-col p-6 sm:p-8 shadow-2xl relative overflow-y-auto select-text transition-all duration-300 ease-out transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="xl"
              onClick={() => !aiGenerate.isPending && setIsAiModalOpen(false)}
              disabled={aiGenerate.isPending}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-none shadow-none"
              title="Close modal"
            >
              <FiX className="text-lg" />
            </Button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center text-xl shadow-xs">
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
                  className="w-full p-3.5 sm:p-4 rounded-[6px] border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm leading-relaxed outline-none transition-all placeholder:text-slate-400 focus:border-[#327C73] focus:bg-white focus:ring-4 focus:ring-[#327C73]/10 resize-none"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="soft"
                      size="xs"
                      radius="lg"
                      onClick={() => {
                        setAiPrompt(suggestion);
                        handleGenerateFromModal(suggestion);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-[11px] font-medium transition-all border border-slate-200/60 shadow-2xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
                <Button
                  type="button"
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={aiGenerate.isPending}
                  className="w-full sm:w-auto text-center"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="brand"
                  size="md"
                  radius="fiverr"
                  onClick={() => handleGenerateFromModal()}
                  disabled={aiGenerate.isPending || !aiPrompt.trim()}
                  isLoading={aiGenerate.isPending}
                  leftIcon={<HiSparkles className="text-emerald-400 text-base" />}
                  className="w-full sm:w-auto px-6 shadow-sm"
                >
                  Generate Project Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreateBriefPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
        </div>
      }
    >
      <CreateBrief />
    </React.Suspense>
  );
}
