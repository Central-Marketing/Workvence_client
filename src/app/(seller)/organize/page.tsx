"use client";

import React, { useEffect, useReducer, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { X, Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import { packageReducer, initialState } from "@/reducers/packageReducer";
import { axiosFetch, generateImageURL } from "@/utils";
import adminAxios from "@/utils/adminAxios";
import useAdminCategories from "@/hooks/useAdminCategories";
import supportService from "@/utils/supportService";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

// Dynamically import ReactQuill to ensure SSG/SSR compatibility
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-44 flex flex-col items-center justify-center space-y-2 border border-gray-200 bg-gray-50 rounded-xl">
      <span className="text-xs font-semibold text-gray-400">Loading Rich Text Editor...</span>
    </div>
  ),
});

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "indent",
  "align",
  "link",
];

type SectionTab = "about" | "packages" | "seller" | "faq";
type TierKey = "basic" | "standard" | "premium";

const OrganizePage = () => {
  const user = useUserStore((state: any) => state.user);
  const [state, dispatch] = useReducer(packageReducer, initialState);
  const [activeTab, setActiveTab] = useState<SectionTab>("about");
  const [activeTier, setActiveTier] = useState<TierKey>("basic");

  // Design tools tags state
  const [toolsList, setToolsList] = useState<string[]>([]);
  const [newToolInput, setNewToolInput] = useState("");
  const [showAddTool, setShowAddTool] = useState(false);

  // Search keywords / tags state
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [showAddKeyword, setShowAddKeyword] = useState(false);

  // New feature input for active tier
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [showAddFeature, setShowAddFeature] = useState(false);

  // FAQs
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // Media upload refs & states
  const coverInputRef = useRef<HTMLInputElement>(null);
  const subImagesInputRef = useRef<HTMLInputElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  const scrollGallery = (direction: "left" | "right") => {
    if (galleryScrollRef.current) {
      const scrollAmount = 260;
      galleryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const router = useRouter();
  const queryClient = useQueryClient();

  const { categoryList, parentCategories, getSubcategories, getNiches } = useAdminCategories();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (tab: SectionTab) => {
    setActiveTab(tab);
    if (tab === "about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(`section-${tab}`);
    if (element) {
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Scrollspy: update active tab based on scroll position
  useEffect(() => {
    const sections: SectionTab[] = ["about", "packages", "seller", "faq"];
    let isThrottled = false;

    const handleScroll = () => {
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, 60);

      const scrollPosition = window.scrollY + 150;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const el = document.getElementById(`section-${section}`);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mutation = useMutation({
    mutationFn: async (pkg: any) => {
      // userID is commented out from payload (backend resolves seller from auth session)
      const { userID: _unused, ...payload } = pkg;
      const { data } = await axiosFetch.post('/gigs', payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Package published successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
      setTimeout(() => {
        router.push("/my-packages");
      }, 1200);
    },
    onError: (error: any) => {
      console.error("Create package failed:", error);
      toast.error(error?.response?.data?.message || "Failed to create package");
    },
  });

  // Handle main form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name, value },
    });
  };

  // Dedicated handler for main category selection (resets subcategory & niche)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    const selectedParent = parentCategories.find(
      (p: any) => (p.slug || p._id || p.id) === selectedVal || p.name === selectedVal
    );
    const parentId = selectedParent?._id || selectedParent?.id || "";

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "category", value: selectedVal },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "categoryId", value: parentId },
    });
    // Reset subcategory & niche when parent changes
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "subcategory", value: "" },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "subcategoryId", value: "" },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "niche", value: "" },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "nicheId", value: "" },
    });
  };

  // Dedicated handler for subcategory selection (resets niche)
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subVal = e.target.value;
    const currentSubs = getSubcategories(state.category);
    const selectedSub = currentSubs.find(
      (s: any) => (s.slug || s._id || s.id) === subVal || s.name === subVal
    );
    const subId = selectedSub?._id || selectedSub?.id || "";

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "subcategory", value: subVal },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "subcategoryId", value: subId },
    });
    // Reset niche when subcategory changes
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "niche", value: "" },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "nicheId", value: "" },
    });

    // If subcategory selected, categoryId points to the subcategory ID; otherwise falls back to parent category ID
    const selectedParent = parentCategories.find(
      (p: any) => (p.slug || p._id || p.id) === state.category || p.name === state.category
    );
    const finalCategoryId = subId || selectedParent?._id || selectedParent?.id || "";
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "categoryId", value: finalCategoryId },
    });
  };

  // Dedicated handler for niche selection (2nd-level child)
  const handleNicheChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nicheVal = e.target.value;
    const currentNiches = getNiches(state.subcategory);
    const selectedNiche = currentNiches.find(
      (n: any) => (n.slug || n._id || n.id) === nicheVal || n.name === nicheVal
    );
    const nicheId = selectedNiche?._id || selectedNiche?.id || "";

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "niche", value: nicheVal },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "nicheId", value: nicheId },
    });

    // Deepest selected category ID takes priority for categoryId
    const currentSubs = getSubcategories(state.category);
    const selectedSub = currentSubs.find(
      (s: any) => (s.slug || s._id || s.id) === state.subcategory || s.name === state.subcategory
    );
    const selectedParent = parentCategories.find(
      (p: any) => (p.slug || p._id || p.id) === state.category || p.name === state.category
    );
    const finalCategoryId = nicheId || selectedSub?._id || selectedSub?.id || selectedParent?._id || selectedParent?.id || "";
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "categoryId", value: finalCategoryId },
    });
  };

  // Handle tier package changes
  const handleTierInputChange = (name: string, value: any) => {
    if (name === "price") {
      if (value !== "" && Number(value) < 0) {
        toast.error("Price must be a positive number", { id: "price-error" });
        return;
      }
    }
    dispatch({
      type: "CHANGE_PACKAGE_INPUT",
      payload: { tier: activeTier, name, value },
    });

    // If basic tier, also sync root fields
    if (activeTier === "basic") {
      dispatch({
        type: "CHANGE_INPUT",
        payload: { name, value },
      });
      if (name === "title" || name === "shortTitle") {
        dispatch({
          type: "CHANGE_PACKAGE_INPUT",
          payload: { tier: "basic", name: "title", value },
        });
        dispatch({
          type: "CHANGE_PACKAGE_INPUT",
          payload: { tier: "basic", name: "shortTitle", value },
        });
      }
    }
  };

  // Add/Remove Features
  const handleAddFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFeatureInput.trim()) return;
    dispatch({
      type: "ADD_PACKAGE_FEATURE",
      payload: { tier: activeTier, feature: newFeatureInput.trim() },
    });
    if (activeTier === "basic") {
      dispatch({
        type: "ADD_FEATURE",
        payload: newFeatureInput.trim(),
      });
    }
    setNewFeatureInput("");
    setShowAddFeature(false);
  };

  const handleRemoveFeature = (feature: string) => {
    dispatch({
      type: "REMOVE_PACKAGE_FEATURE",
      payload: { tier: activeTier, feature },
    });
    if (activeTier === "basic") {
      dispatch({
        type: "REMOVE_FEATURE",
        payload: feature,
      });
    }
  };

  // Keywords toggle & add
  const handleAddKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newKeywordInput.trim().replace(/^#+/, "");
    if (!clean) return;
    if (keywordsList.length >= 5) {
      toast.error("Maximum 5 search keywords allowed");
      return;
    }
    if (!keywordsList.includes(clean)) {
      setKeywordsList([...keywordsList, clean]);
    }
    setNewKeywordInput("");
    setShowAddKeyword(false);
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywordsList(keywordsList.filter((k) => k !== keyword));
  };

  // Tools toggle & add
  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolInput.trim()) return;
    if (!toolsList.includes(newToolInput.trim())) {
      setToolsList([...toolsList, newToolInput.trim()]);
    }
    setNewToolInput("");
    setShowAddTool(false);
  };

  const handleRemoveTool = (tool: string) => {
    setToolsList(toolsList.filter((t) => t !== tool));
  };

  // FAQs
  const handleAddFaq = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error("Please enter both Question and Answer");
      return;
    }
    dispatch({
      type: "ADD_FAQ",
      payload: { question: faqQuestion.trim(), answer: faqAnswer.trim() },
    });
    setFaqQuestion("");
    setFaqAnswer("");
    toast.success("FAQ added successfully!");
  };

  const handleRemoveFaq = (index: number) => {
    dispatch({
      type: "REMOVE_FAQ",
      payload: index,
    });
    toast.success("FAQ removed");
  };

  // File Upload Handlers (Cloudinary with ImgBB fallback)
  const uploadToCDN = async (file: File) => {
    try {
      const uploaded = await supportService.uploadFileToCloudinary(file, "gig_attachments");
      if (uploaded?.secure_url || uploaded?.url) {
        return uploaded.secure_url || uploaded.url;
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, using fallback:", err);
    }
    const fallback = await generateImageURL(file);
    return fallback?.url || "";
  };

  const handleCoverSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      toast.loading("Uploading banner image...", { id: "upload-cover" });
      const url = await uploadToCDN(file);
      dispatch({
        type: "ADD_IMAGES",
        payload: {
          cover: url,
          images: state.images || [],
        },
      });
      toast.success("Banner uploaded successfully!", { id: "upload-cover" });
    } catch {
      toast.error("Failed to upload banner", { id: "upload-cover" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubImagesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    try {
      setUploading(true);
      toast.loading(`Uploading ${files.length} images...`, { id: "upload-subs" });
      const uploadedUrls = await Promise.all(files.map((f) => uploadToCDN(f)));
      const validUrls = uploadedUrls.filter(Boolean);
      dispatch({
        type: "ADD_IMAGES",
        payload: {
          cover: state.cover,
          images: [...(state.images || []), ...validUrls],
        },
      });
      toast.success("Sub images added successfully!", { id: "upload-subs" });
    } catch {
      toast.error("Failed uploading images", { id: "upload-subs" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    if (urlToRemove === state.cover) {
      dispatch({
        type: "ADD_IMAGES",
        payload: {
          cover: "",
          images: state.images || [],
        },
      });
    } else {
      dispatch({
        type: "ADD_IMAGES",
        payload: {
          cover: state.cover,
          images: (state.images || []).filter((img: string) => img !== urlToRemove),
        },
      });
    }
    toast.success("Image removed");
  };

  // Submit Handler
  const handleSubmit = (isDraft = false) => {
    const {
      userID: _unused,
      subcategoryId: _unusedSubId,
      niche: _unusedNiche,
      nicheId: _unusedNicheId,
      ...stateWithoutUserId
    } = (state as any);

    // Resolve hierarchical category, subcategory, and niche information
    const selectedParent = parentCategories.find(
      (p: any) => (p.slug || p._id || p.id) === state.category || p.name === state.category
    );
    const currentSubs = getSubcategories(state.category);
    const selectedSub = currentSubs.find(
      (s: any) => (s.slug || s._id || s.id) === state.subcategory || s.name === state.subcategory
    );
    const currentNiches = getNiches(state.subcategory);
    const selectedNiche = currentNiches.find(
      (n: any) => (n.slug || n._id || n.id) === state.niche || n.name === state.niche
    );

    // Deepest category level (Niche > Subcategory > Parent) sends its UUID as categoryId
    const resolvedCategoryId =
      selectedNiche?._id ||
      selectedNiche?.id ||
      selectedSub?._id ||
      selectedSub?.id ||
      selectedParent?._id ||
      selectedParent?.id ||
      state.categoryId ||
      undefined;

    const resolvedCategoryName = selectedParent?.name || state.category;
    const resolvedSubcategoryName = selectedSub?.name || state.subcategory || undefined;

    const form = {
      ...stateWithoutUserId,
      categoryId: resolvedCategoryId,
      category: resolvedCategoryName,
      subcategory: resolvedSubcategoryName,
      // userID: user?._id || user?.id,
      faqs: state.faqs || [],
      isDraft,
      tools_use: toolsList,
      tags: keywordsList,
      // tags: keywordsList,
    };

    // Ensure basic tier sync
    if (form.packages?.basic) {
      form.packages.basic.title =
        form.packages.basic.title || form.packages.basic.shortTitle || form.shortTitle || form.title || "";
      form.packages.basic.shortDesc =
        form.packages.basic.shortDesc || form.shortDesc || form.description || "";
      form.packages.basic.price = Number(form.packages.basic.price || form.price || 0);
      form.packages.basic.deliveryTime =
        form.packages.basic.deliveryTime || form.deliveryTime || "7";
    }

    if (!isDraft) {
      if (!form.title) {
        toast.error("Please enter a package title");
        return;
      }
      if (!form.category) {
        toast.error("Please select a category");
        return;
      }
      if (!form.description || form.description === "<p><br></p>") {
        toast.error("Please provide a package description");
        return;
      }
      const basicPrice = Number(form.packages?.basic?.price);
      if (isNaN(basicPrice) || basicPrice <= 0) {
        toast.error("Please enter a valid price for the Basic package");
        return;
      }
    }

    mutation.mutate(form);
  };

  // Current active tier object (or default empty tier)
  const currentTierData =
    (state.packages as any)?.[activeTier] || {
      title: "",
      shortDesc: "",
      price: "",
      deliveryTime: "",
      features: [],
    };

  const currentSubcategories = getSubcategories(state.category);
  const currentNiches = getNiches(state.subcategory);

  const selectedCategoryObj = parentCategories.find(
    (c: any) => (c.slug || c.name || c._id || c.id) === state.category
  );
  const selectedSubcategoryObj = currentSubcategories.find(
    (s: any) => (s.slug || s.name || s._id || s.id) === state.subcategory
  );
  const selectedNicheObj = currentNiches.find(
    (n: any) => (n.slug || n.name || n._id || n.id) === state.niche
  );

  const categoryBadgeLabel = selectedCategoryObj
    ? [selectedCategoryObj.name, selectedSubcategoryObj?.name, selectedNicheObj?.name]
        .filter(Boolean)
        .join(" › ")
    : "Blog, Business House";

  // Real uploaded gallery items (cover banner + sub-images)
  const galleryItems = [
    ...(state.cover ? [state.cover] : []),
    ...(state.images || []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-7">

        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-gray-950">
              Create New Package
            </h1>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Set up your package with clear details, pricing, and deliverables so clients know exactly what to expect before they hire you.
            </p>
          </div>

          {/* Action Buttons: Draft and Save & Save and Publish */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={mutation.isPending}
              className="bg-[#F1F3F5] hover:bg-gray-200 text-gray-800 font-semibold text-xs sm:text-[13px] px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Draft and Save
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={mutation.isPending}
              className="bg-black hover:bg-gray-900 text-white font-semibold text-xs sm:text-[13px] px-5 py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Publishing...
                </>
              ) : (
                "Save and Publish"
              )}
            </button>
          </div>
        </div>

        {/* 2. Top Navigation Tabs (Sticky & Scroll-Based) */}
        <div className="sticky top-[69px] z-30 py-3 bg-[#F8F9FA]/95 backdrop-blur-md -my-1">
          <div className="bg-white border border-gray-200/90 rounded-xl p-1 inline-flex items-center gap-1 shadow-sm">
            {(["about", "packages", "seller", "faq"] as SectionTab[]).map((tab) => {
              const labelMap: Record<SectionTab, string> = {
                about: "About",
                packages: "Packages",
                seller: "Seller Info",
                faq: "FAQ",
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => scrollToSection(tab)}
                  className={`px-4 sm:px-5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isActive
                    ? "bg-[#0B3A33] text-white shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Section: About & Pricing Tier */}
        <div id="section-about" className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: About this packages */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-950">
                About this packages
              </h2>
              {/* <span className="bg-[#F8F9FA] border border-gray-200/80 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-md">
                  {categoryBadgeLabel}
                </span> */}
            </div>

            {/* Package Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Package title
              </label>
              <input
                type="text"
                name="title"
                value={state.title || ""}
                onChange={handleInputChange}
                placeholder="e.g I will do something i am really good at"
                className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all"
              />
            </div>

            {/* Package Description (Rich Text Editor) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Package description
              </label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <ReactQuill
                  theme="snow"
                  value={state.description || ""}
                  onChange={(html) =>
                    dispatch({
                      type: "CHANGE_INPUT",
                      payload: { name: "description", value: html },
                    })
                  }
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write rich descriptions to introduce your package to clients..."
                  className="[&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[180px] [&_.ql-editor]:text-xs sm:[&_.ql-editor]:text-[13px] [&_.ql-editor]:text-gray-800"
                />
              </div>
            </div>

            {/* Category, Subcategory & Niche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Main Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={state.category || ""}
                    onChange={handleCategoryChange}
                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-[13px] text-gray-800 outline-none cursor-pointer appearance-none pr-10 transition-colors"
                  >
                    <option value="" disabled>Select Category</option>
                    {parentCategories.map((c: any) => (
                      <option key={c._id || c.id || c.slug} value={c.slug || c.name || c._id}>
                        {c.name || c.slug}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Subcategory
                  </label>
                  <span className="text-[11px] text-gray-400 font-normal">Optional</span>
                </div>
                <div className="relative">
                  <select
                    name="subcategory"
                    value={state.subcategory || ""}
                    onChange={handleSubcategoryChange}
                    disabled={!state.category || currentSubcategories.length === 0}
                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-xs sm:text-[13px] text-gray-800 outline-none cursor-pointer appearance-none pr-10 transition-colors"
                  >
                    <option value="">
                      {!state.category
                        ? "Select category first"
                        : currentSubcategories.length === 0
                        ? "No subcategories available"
                        : "Select Subcategory (Optional)"}
                    </option>
                    {currentSubcategories.map((sub: any) => (
                      <option key={sub._id || sub.id || sub.slug} value={sub.slug || sub.name || sub._id}>
                        {sub.name || sub.slug}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {/* Niche (2nd-level Child) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Niche
                  </label>
                  <span className="text-[11px] text-gray-400 font-normal">Optional</span>
                </div>
                <div className="relative">
                  <select
                    name="niche"
                    value={state.niche || ""}
                    onChange={handleNicheChange}
                    disabled={!state.subcategory || currentNiches.length === 0}
                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-xs sm:text-[13px] text-gray-800 outline-none cursor-pointer appearance-none pr-10 transition-colors"
                  >
                    <option value="">
                      {!state.subcategory
                        ? "Select subcategory first"
                        : currentNiches.length === 0
                        ? "No niches available"
                        : "Select Niche (Optional)"}
                    </option>
                    {currentNiches.map((n: any) => (
                      <option key={n._id || n.id || n.slug} value={n.slug || n.name || n._id}>
                        {n.name || n.slug}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Add Design Tool Section */}
            <div className="space-y-3 pt-2">
              <label className="text-xs sm:text-[13px] font-bold text-gray-900 block">
                Add Design Tool
              </label>

              {toolsList.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {toolsList.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 bg-[#F4F5F7] border border-gray-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700"
                    >
                      {tool}
                      <X
                        className="w-3 h-3 text-gray-400 hover:text-red-500 cursor-pointer"
                        onClick={() => handleRemoveTool(tool)}
                      />
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No design tools added yet.</p>
              )}

              {showAddTool ? (
                <form onSubmit={handleAddTool} className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="e.g. Figma, Illustrator"
                    value={newToolInput}
                    onChange={(e) => setNewToolInput(e.target.value)}
                    className="bg-[#F4F5F7] border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none w-48 sm:w-56"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#0B3A33] text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTool(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs px-2"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTool(true)}
                  className="text-[#0D6D5F] hover:text-[#0A5348] text-xs font-semibold flex items-center gap-1 cursor-pointer pt-1 transition-colors"
                >
                  Add Tool <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Keywords / Tags Section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-[13px] font-bold text-gray-900 block">
                  Search Keywords / Tags
                </label>
                <span className="text-[11px] text-gray-400 font-medium">
                  {keywordsList.length}/5 tags
                </span>
              </div>

              {keywordsList.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {keywordsList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 bg-[#F4F5F7] border border-gray-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700"
                    >
                      #{tag}
                      <X
                        className="w-3 h-3 text-gray-400 hover:text-red-500 cursor-pointer"
                        onClick={() => handleRemoveKeyword(tag)}
                      />
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No keywords added yet. Add up to 5 keywords to help buyers find your package.</p>
              )}

              {showAddKeyword ? (
                <form onSubmit={handleAddKeyword} className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="e.g. Logo Design, Minimalist"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    className="bg-[#F4F5F7] border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none w-48 sm:w-56"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#0B3A33] text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddKeyword(false);
                      setNewKeywordInput("");
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xs px-2"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                keywordsList.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAddKeyword(true)}
                    className="text-[#0D6D5F] hover:text-[#0A5348] text-xs font-semibold flex items-center gap-1 cursor-pointer pt-1 transition-colors"
                  >
                    Add Keyword <Plus className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>

          </div>

          {/* Right Column: Pricing Tier Card (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-[140px] self-start bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-5 space-y-4">

            {/* Tier Pills Tabs: Basic, Silver (standard), Platinum (premium) */}
            <div className="bg-[#F4F5F7] rounded-xl p-1 flex items-center gap-1">
              {(["basic", "standard", "premium"] as TierKey[]).map((tierKey) => {
                const displayLabels: Record<TierKey, string> = {
                  basic: "Basic",
                  standard: "Silver",
                  platinum: "Platinum",
                } as any;
                const label = displayLabels[tierKey] || (tierKey === "standard" ? "Silver" : tierKey === "premium" ? "Platinum" : "Basic");
                const isCurrent = activeTier === tierKey;

                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => {
                      setActiveTier(tierKey);
                      if (!(state.packages as any)?.[tierKey]) {
                        dispatch({
                          type: "TOGGLE_PACKAGE_TIER",
                          payload: { tier: tierKey },
                        });
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${isCurrent
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tier Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">
                Package title
              </label>
              <input
                type="text"
                value={currentTierData.title || ""}
                onChange={(e) => handleTierInputChange("title", e.target.value)}
                placeholder="e.g I will do something i am really good at"
                className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition-all"
              />
            </div>

            {/* Tier Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">
                Package description
              </label>
              <textarea
                value={currentTierData.shortDesc || ""}
                onChange={(e) => handleTierInputChange("shortDesc", e.target.value)}
                placeholder="write description"
                rows={3}
                className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition-all resize-y min-h-[80px]"
              />
            </div>

            {/* Add Delivery Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">
                Add delivery time
              </label>
              <div className="relative">
                <select
                  value={currentTierData.deliveryTime || ""}
                  onChange={(e) => handleTierInputChange("deliveryTime", e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="" disabled>e.g 12 days</option>
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="12">12 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5" />
              </div>
            </div>

            {/* Add Features */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {currentTierData.features?.map((f: string) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 bg-[#F4F5F7] border border-gray-200/60 px-2 py-0.5 rounded text-[11px] text-gray-700"
                  >
                    {f}
                    <X
                      className="w-3 h-3 text-gray-400 hover:text-red-500 cursor-pointer"
                      onClick={() => handleRemoveFeature(f)}
                    />
                  </span>
                ))}
              </div>

              {showAddFeature ? (
                <form onSubmit={handleAddFeature} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Responsive design"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    className="bg-[#F4F5F7] border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 outline-none flex-1"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#0B3A33] text-white text-xs px-2.5 py-1 rounded font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFeature(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddFeature(true)}
                  className="text-[#0D6D5F] hover:text-[#0A5348] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Add Features <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Set Price */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-gray-700 block">
                Set price
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={currentTierData.price || ""}
                  onChange={(e) => handleTierInputChange("price", e.target.value)}
                  placeholder="e.g $200"
                  className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 4. Section: Packages Media & Upload */}
        <div id="section-packages" className="scroll-mt-36 bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">

          {/* Header: Packages title & arrow controls */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Packages Media &amp; Gallery
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollGallery("left")}
                title="Previous"
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollGallery("right")}
                title="Next"
                className="w-8 h-8 rounded-full bg-[#EAECEF] hover:bg-gray-300 flex items-center justify-center text-gray-700 hover:text-gray-950 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleCoverSelected}
          />
          <input
            type="file"
            ref={subImagesInputRef}
            accept="image/*,.pdf,.zip"
            multiple
            className="hidden"
            onChange={handleSubImagesSelected}
          />

          {/* Upload Box Container */}
          <div className="border border-gray-200/90 rounded-2xl p-6 sm:p-8 space-y-4 bg-white">
            {/* Add Banner Dropzone */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className="border border-dashed border-gray-300 hover:border-[#0D6D5F] rounded-xl py-6 text-center cursor-pointer transition-all bg-white hover:bg-gray-50/70 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D6D5F]"
            >
              <span>Add Banner</span>
              <Plus className="w-4 h-4" />
            </div>

            {/* Add Sub Images Dropzone */}
            <div
              onClick={() => subImagesInputRef.current?.click()}
              className="border border-dashed border-gray-300 hover:border-[#0D6D5F] rounded-xl py-6 text-center cursor-pointer transition-all bg-white hover:bg-gray-50/70 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D6D5F]"
            >
              <span>Add Sub Images</span>
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Real Uploaded Images Gallery Row */}
          {galleryItems.length > 0 && (
            <div
              ref={galleryScrollRef}
              className="flex items-center gap-3.5 pt-1 overflow-x-auto scrollbar-none scroll-smooth"
            >
              {galleryItems.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative shrink-0 w-44 sm:w-52 aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs group"
                >
                  <img
                    src={imgUrl}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imgUrl)}
                    className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-xs cursor-pointer z-10"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {imgUrl === state.cover ? (
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[9px] font-bold text-center py-0.5 tracking-wider uppercase">
                      BANNER
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: "ADD_IMAGES",
                          payload: {
                            cover: imgUrl,
                            images: (state.images || []).filter((i: string) => i !== imgUrl),
                          },
                        });
                        toast.success("Set as banner!");
                      }}
                      className="absolute bottom-0 inset-x-0 bg-black/60 hover:bg-black/80 text-white text-[9px] font-semibold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Set as Banner
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* 5. Section: Seller Info */}
        <div id="section-seller" className="scroll-mt-36 bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-950 border-b border-gray-100 pb-3">
            Seller Information
          </h2>
          <div className="flex items-center gap-4">
            <img
              src={user?.image || "/media/noavatar.png"}
              alt={user?.name || "Seller"}
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h3 className="text-base font-bold text-gray-900">{user?.name || user?.username || "Freelancer"}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{user?.shortTitle || "Professional Creator & Freelancer"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.country || user?.location || "Worldwide"}</p>
            </div>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
            {user?.description || user?.bio || "No bio entered yet. You can complete your detailed profile under Account Settings."}
          </div>
        </div>

        {/* 6. Section: Frequently asked questions */}
        <div id="section-faq" className="scroll-mt-36 bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Frequently asked questions
            </h2>
            <span className="bg-[#F8F9FA] border border-gray-200/90 text-gray-600 text-xs font-semibold px-3 py-1 rounded-md">
              {categoryBadgeLabel}
            </span>
          </div>

          {/* Existing FAQs List */}
          {state.faqs && state.faqs.length > 0 ? (
            <div className="space-y-4">
              {state.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      {faq.question}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors shrink-0"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-[13px] text-gray-600 mt-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No questions added yet. Use the form below to add frequently asked questions.</p>
          )}

          {/* New FAQ Input Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-900 block">
                Question
              </label>
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Write here"
                className="w-full bg-[#ECEEF1]/70 hover:bg-[#ECEEF1] focus:bg-white border border-transparent focus:border-gray-300 rounded-xl px-4 py-3 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-900 block">
                Answer
              </label>
              <textarea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="Write here"
                rows={3}
                className="w-full bg-[#ECEEF1]/70 hover:bg-[#ECEEF1] focus:bg-white border border-transparent focus:border-gray-300 rounded-xl px-4 py-3 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all resize-y min-h-[70px]"
              />
            </div>
          </div>

          {/* Add Another + Button */}
          <div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="text-[#0D6D5F] hover:text-[#0A5348] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer pt-1 transition-colors"
            >
              Add Another <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizePage;