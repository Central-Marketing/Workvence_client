"use client";

import React, { useEffect, useReducer, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { X, Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, ArrowLeft } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import { packageReducer, initialState } from "@/reducers/packageReducer";
import { axiosFetch, generateImageURL, parseRevisionNumber } from "@/utils";
import useAdminCategories from "@/hooks/useAdminCategories";
import supportService from "@/utils/supportService";
import { useUserStore } from "@/store/userStore";
import { Loader, Button } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";

// Dynamically import ReactQuill to ensure SSG/SSR compatibility
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-44 flex flex-col items-center justify-center space-y-2 border border-gray-200 bg-gray-50 rounded-[6px]">
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

const DELIVERY_TIME_OPTIONS: CustomSelectOption[] = [
  { value: "1", label: "1 day" },
  { value: "2", label: "2 days" },
  { value: "3", label: "3 days" },
  { value: "5", label: "5 days" },
  { value: "7", label: "7 days" },
  { value: "10", label: "10 days" },
  { value: "12", label: "12 days" },
  { value: "14", label: "14 days" },
  { value: "21", label: "21 days" },
  { value: "30", label: "30 days" },
  { value: "45", label: "45 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

const REVISION_OPTIONS: CustomSelectOption[] = [
  { value: "0", label: "0 Revisions" },
  { value: "1", label: "1 Revision" },
  { value: "2", label: "2 Revisions" },
  { value: "3", label: "3 Revisions" },
  { value: "5", label: "5 Revisions" },
  { value: "10", label: "10 Revisions" },
];

const EditPackagePage = () => {
  const { id } = useParams();
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

  // Fetch the existing package details
  const { isLoading, error, data: packageData } = useQuery({
    queryKey: ["package", id],
    queryFn: () =>
      axiosFetch.get(`/gigs/${id}`)
        .then(({ data }) => {
          return data?.data || data?.gig || data;
        })
        .catch(({ response }) => {
          toast.error(response?.data?.message || "Failed to fetch package details");
          router.push("/my-packages");
        }),
    enabled: !!id,
  });

  // Sync state whenever packageData loads or updates from cache/network
  useEffect(() => {
    if (!packageData) return;
    const raw = packageData?.data || packageData?.gig || packageData;
    const gigTitle = raw.title || raw.shortTitle || raw.name || "";
    const existingPackages = raw.packages || {};
    const basicPkg = existingPackages.basic || {
      title: gigTitle,
      shortDesc: raw.shortDesc || "",
      price: raw.price || 0,
      deliveryTime: raw.deliveryTime || "7",
      revisionNumber: raw.revisionNumber || "1",
      features: raw.features || [],
    };
    if (!basicPkg.title) {
      basicPkg.title = gigTitle || raw.shortTitle || "";
    }

    const rawCover = raw.cover || raw.coverImage || raw.cover_image || "";
    let rawImages: string[] = [];
    if (Array.isArray(raw.images)) {
      rawImages = raw.images;
    } else if (typeof raw.images === "string" && raw.images.trim()) {
      try {
        const parsed = JSON.parse(raw.images);
        rawImages = Array.isArray(parsed) ? parsed : [raw.images];
      } catch {
        rawImages = [raw.images];
      }
    } else if (Array.isArray(raw.packageImages)) {
      rawImages = raw.packageImages;
    }

    if (Array.isArray(raw.tools_use)) {
      setToolsList(raw.tools_use);
    } else if (Array.isArray(raw.tools)) {
      setToolsList(raw.tools);
    }

    if (Array.isArray(raw.tags)) {
      setKeywordsList(raw.tags);
    } else if (Array.isArray(raw.keywords)) {
      setKeywordsList(raw.keywords);
    }

    // Ensure sub-images exclude rawCover and deduplicate
    const subImagesOnly = Array.from(
      new Set(rawImages.filter((img: string) => Boolean(img) && img !== rawCover))
    );

    dispatch({
      type: "INITIALIZE_STATE",
      payload: {
        ...initialState,
        // Explicitly populate ONLY editable fields to avoid leaking read-only/computed properties (id, totalStars, sales, etc.)
        title: gigTitle,
        shortTitle: raw.shortTitle || gigTitle,
        description: raw.description || raw.desc || "",
        shortDesc: raw.shortDesc || "",
        deliveryTime: raw.deliveryTime || basicPkg.deliveryTime || "7",
        revisionNumber: raw.revisionNumber || basicPkg.revisionNumber || "1",
        price: Number(raw.price || basicPkg.price || 0),
        category: raw.category || "",
        categoryId: raw.categoryId || "",
        subcategory: raw.subcategory || "",
        subcategoryId: raw.subcategoryId || "",
        niche: raw.niche || "",
        nicheId: raw.nicheId || "",
        cover: rawCover,
        images: subImagesOnly,
        faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
        packages: {
          basic: {
            title: basicPkg.title || gigTitle,
            shortDesc: basicPkg.shortDesc || raw.shortDesc || "",
            price: Number(basicPkg.price || raw.price || 0),
            deliveryTime: basicPkg.deliveryTime || raw.deliveryTime || "7",
            revisionNumber: basicPkg.revisionNumber || raw.revisionNumber || "1",
            features: Array.isArray(basicPkg.features) ? basicPkg.features : [],
          },
          standard: existingPackages.standard
            ? {
              title: existingPackages.standard.title || "",
              shortDesc: existingPackages.standard.shortDesc || "",
              price: Number(existingPackages.standard.price || 0),
              deliveryTime: existingPackages.standard.deliveryTime || "7",
              revisionNumber: existingPackages.standard.revisionNumber || "1",
              features: Array.isArray(existingPackages.standard.features)
                ? existingPackages.standard.features
                : [],
            }
            : null,
          premium: existingPackages.premium
            ? {
              title: existingPackages.premium.title || "",
              shortDesc: existingPackages.premium.shortDesc || "",
              price: Number(existingPackages.premium.price || 0),
              deliveryTime: existingPackages.premium.deliveryTime || "7",
              revisionNumber: existingPackages.premium.revisionNumber || "1",
              features: Array.isArray(existingPackages.premium.features)
                ? existingPackages.premium.features
                : [],
            }
            : null,
        },
        features: Array.isArray(raw.features) ? raw.features : [],
      },
    });
  }, [packageData]);

  // Backward-compatibility: if existing package had a child category stored as category, resolve its parent & subcategory
  useEffect(() => {
    if (!categoryList || categoryList.length === 0 || !state.category) return;
    const matchedChild = categoryList.find(
      (c: any) =>
        c.parentId &&
        (c.slug === state.category || c.name === state.category || c._id === state.category || c.id === state.category)
    );
    if (matchedChild && !state.subcategory) {
      const parent = parentCategories.find(
        (p: any) => p._id === matchedChild.parentId || p.id === matchedChild.parentId
      );
      if (parent) {
        dispatch({
          type: "CHANGE_INPUT",
          payload: { name: "category", value: parent.name || parent.slug },
        });
        dispatch({
          type: "CHANGE_INPUT",
          payload: { name: "subcategory", value: matchedChild.name || matchedChild.slug },
        });
        dispatch({
          type: "CHANGE_INPUT",
          payload: { name: "subcategoryId", value: matchedChild._id || matchedChild.id },
        });
        dispatch({
          type: "CHANGE_INPUT",
          payload: { name: "categoryId", value: matchedChild._id || matchedChild.id },
        });
      }
    }
  }, [categoryList, parentCategories, state.category, state.subcategory]);

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
      // Strip any non-whitelisted/read-only backend fields before sending PATCH
      const sanitized = { ...pkg };
      const FORBIDDEN = [
        "id", "_id", "totalStars", "starNumber", "sales", "favoriteCount", "slug",
        "reviewedAt", "createdAt", "updatedAt", "publishedAt", "user", "userID", "userId",
        "reviews", "gigRating", "starRating", "ratingBreakdown", "starCounts",
        "subcategoryId", "niche", "nicheId", "totalReviews", "__v", "orders", "seller",
        "status", "views", "clicks", "impressions"
      ];
      FORBIDDEN.forEach((key) => delete sanitized[key]);
      const { data } = await axiosFetch.patch(`/gigs/${id}`, sanitized);
      return data;
    },
    onSuccess: () => {
      toast.success("Package updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
      queryClient.invalidateQueries({ queryKey: ["package", id] });
      setTimeout(() => {
        router.push("/my-packages");
      }, 1200);
    },
    onError: (error: any) => {
      console.error("Update package failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update package");
    },
  });

  // Handle main form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name, value },
    });
    if (name === "title") {
      dispatch({
        type: "CHANGE_PACKAGE_INPUT",
        payload: { tier: "basic", name: "title", value },
      });
      dispatch({
        type: "CHANGE_PACKAGE_INPUT",
        payload: { tier: "basic", name: "shortTitle", value },
      });
    }
  };

  const currentSubcategories = getSubcategories(state.category);
  const currentNiches = getNiches(state.subcategory);

  // Dedicated handler for main category selection (resets subcategory & niche)
  const handleCategoryChange = (valOrEvent: any) => {
    const selectedVal = typeof valOrEvent === "object" && valOrEvent?.target ? valOrEvent.target.value : String(valOrEvent || "");
    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === selectedVal ||
        p.name === selectedVal ||
        p.name?.toLowerCase() === selectedVal.toLowerCase() ||
        p.slug?.toLowerCase() === selectedVal.toLowerCase()
    );
    const parentId = selectedParent?._id || selectedParent?.id || "";
    const parentName = selectedParent?.name || selectedVal;

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "category", value: parentName },
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
  const handleSubcategoryChange = (valOrEvent: any) => {
    const subVal = typeof valOrEvent === "object" && valOrEvent?.target ? valOrEvent.target.value : String(valOrEvent || "");
    const currentSubs = getSubcategories(state.category);
    const selectedSub = currentSubs.find(
      (s: any) =>
        (s.slug || s._id || s.id) === subVal ||
        s.name === subVal ||
        s.name?.toLowerCase() === subVal.toLowerCase() ||
        s.slug?.toLowerCase() === subVal.toLowerCase()
    );
    const subId = selectedSub?._id || selectedSub?.id || "";
    const subName = selectedSub?.name || subVal;

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "subcategory", value: subName },
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

    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === state.category ||
        p.name === state.category ||
        p.name?.toLowerCase() === String(state.category).toLowerCase()
    );
    const finalCategoryId = subId || selectedParent?._id || selectedParent?.id || "";
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "categoryId", value: finalCategoryId },
    });
  };

  // Dedicated handler for niche selection (2nd-level child)
  const handleNicheChange = (valOrEvent: any) => {
    const nicheVal = typeof valOrEvent === "object" && valOrEvent?.target ? valOrEvent.target.value : String(valOrEvent || "");
    const currentNichesList = getNiches(state.subcategory);
    const selectedNiche = currentNichesList.find(
      (n: any) =>
        (n.slug || n._id || n.id) === nicheVal ||
        n.name === nicheVal ||
        n.name?.toLowerCase() === nicheVal.toLowerCase() ||
        n.slug?.toLowerCase() === nicheVal.toLowerCase()
    );
    const nicheId = selectedNiche?._id || selectedNiche?.id || "";
    const nicheName = selectedNiche?.name || nicheVal;

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "niche", value: nicheName },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "nicheId", value: nicheId },
    });

    // Deepest selected category ID takes priority for categoryId
    const currentSubs = getSubcategories(state.category);
    const selectedSub = currentSubs.find(
      (s: any) =>
        (s.slug || s._id || s.id) === state.subcategory ||
        s.name === state.subcategory ||
        s.name?.toLowerCase() === String(state.subcategory).toLowerCase()
    );
    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === state.category ||
        p.name === state.category ||
        p.name?.toLowerCase() === String(state.category).toLowerCase()
    );
    const finalCategoryId =
      nicheId || selectedSub?._id || selectedSub?.id || selectedParent?._id || selectedParent?.id || "";
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
          type: "CHANGE_INPUT",
          payload: { name: "title", value },
        });
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
          images: (state.images || []).filter((img: string) => img !== url),
        },
      });
      toast.success("Banner uploaded successfully!", { id: "upload-cover" });
    } catch {
      toast.error("Failed to upload banner", { id: "upload-cover" });
    } finally {
      setUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
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

      let newCover = state.cover;
      const combinedSubImages = [...(state.images || [])];

      if (!newCover && validUrls.length > 0) {
        newCover = validUrls[0];
        combinedSubImages.push(...validUrls.slice(1));
      } else {
        combinedSubImages.push(...validUrls);
      }

      dispatch({
        type: "ADD_IMAGES",
        payload: {
          cover: newCover,
          images: Array.from(new Set(combinedSubImages.filter((img: string) => img !== newCover))),
        },
      });
      toast.success("Sub images added successfully!", { id: "upload-subs" });
    } catch {
      toast.error("Failed uploading images", { id: "upload-subs" });
    } finally {
      setUploading(false);
      if (subImagesInputRef.current) subImagesInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    // 1. Remove from sub-images
    const updatedImages = (state.images || []).filter((img: string) => img !== urlToRemove);

    let updatedCover = state.cover;
    // 2. If removing the current cover:
    if (state.cover === urlToRemove) {
      if (updatedImages.length > 0) {
        // Promote the next available sub-image to be the cover banner
        updatedCover = updatedImages[0];
        updatedImages.shift();
      } else {
        updatedCover = "";
      }
    }

    dispatch({
      type: "ADD_IMAGES",
      payload: {
        cover: updatedCover,
        images: updatedImages,
      },
    });
    toast.success("Image removed");
  };

  // Submit Handler
  const handleSubmit = (isDraft = false) => {
    // Resolve hierarchical category, subcategory, and niche information
    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === state.category ||
        p.name === state.category ||
        p.name?.toLowerCase() === String(state.category).toLowerCase() ||
        p.slug?.toLowerCase() === String(state.category).toLowerCase()
    );
    const currentSubs = getSubcategories(state.category);
    const selectedSub = currentSubs.find(
      (s: any) =>
        (s.slug || s._id || s.id) === state.subcategory ||
        s.name === state.subcategory ||
        s.name?.toLowerCase() === String(state.subcategory).toLowerCase() ||
        s.slug?.toLowerCase() === String(state.subcategory).toLowerCase()
    );
    const currentNichesList = getNiches(state.subcategory);
    const selectedNiche = currentNichesList.find(
      (n: any) =>
        (n.slug || n._id || n.id) === state.niche ||
        n.name === state.niche ||
        n.name?.toLowerCase() === String(state.niche).toLowerCase() ||
        n.slug?.toLowerCase() === String(state.niche).toLowerCase()
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

    const finalCover = state.cover || "";
    const finalImages = Array.isArray(state.images)
      ? state.images.filter((img: string) => Boolean(img) && img !== finalCover)
      : [];

    // Clean package tier details
    const cleanTier = (tier: any) => {
      if (!tier) return null;
      const { _id, id, ...rest } = tier;
      return {
        title: rest.title || "",
        shortDesc: rest.shortDesc || "",
        price: Number(rest.price || 0),
        deliveryTime: rest.deliveryTime || "7",
        revisionNumber: parseRevisionNumber(rest.revisionNumber ?? 1, 1),
        features: Array.isArray(rest.features) ? rest.features : [],
      };
    };

    const basicTier = cleanTier(state.packages?.basic) || {
      title: state.title || "",
      shortDesc: state.shortDesc || "",
      price: Number(state.price || 0),
      deliveryTime: state.deliveryTime || "7",
      revisionNumber: parseRevisionNumber(state.revisionNumber ?? 1, 1),
      features: state.features || [],
    };
    basicTier.title = basicTier.title || state.title || "";
    basicTier.shortDesc = basicTier.shortDesc || state.shortDesc || state.description || "";
    basicTier.price = Number(basicTier.price || state.price || 0);
    basicTier.deliveryTime = basicTier.deliveryTime || state.deliveryTime || "7";
    basicTier.revisionNumber = parseRevisionNumber(basicTier.revisionNumber ?? state.revisionNumber ?? 1, 1);

    const standardTier = cleanTier(state.packages?.standard);
    const premiumTier = cleanTier(state.packages?.premium);

    const sanitizedPackages: Record<string, any> = {
      basic: basicTier,
    };
    if (standardTier) sanitizedPackages.standard = standardTier;
    if (premiumTier) sanitizedPackages.premium = premiumTier;

    const payload: Record<string, any> = {
      title: state.title,
      shortTitle: state.shortTitle || state.title,
      description: state.description,
      shortDesc: state.shortDesc || "",
      category: resolvedCategoryName,
      cover: finalCover,
      images: finalImages,
      price: basicTier.price,
      deliveryTime: basicTier.deliveryTime,
      revisionNumber: basicTier.revisionNumber,
      features: state.features || [],
      faqs: state.faqs || [],
      packages: sanitizedPackages,
      tools_use: toolsList,
      tags: keywordsList,
      isDraft,
    };

    if (resolvedCategoryId) {
      payload.categoryId = resolvedCategoryId;
    }
    if (resolvedSubcategoryName) {
      payload.subcategory = resolvedSubcategoryName;
    }

    // Explicitly delete any read-only/database/non-whitelisted properties
    const FORBIDDEN_PROPERTIES = [
      "id",
      "_id",
      "totalStars",
      "starNumber",
      "sales",
      "favoriteCount",
      "slug",
      "reviewedAt",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "user",
      "userID",
      "userId",
      "reviews",
      "gigRating",
      "starRating",
      "ratingBreakdown",
      "starCounts",
      "subcategoryId",
      "niche",
      "nicheId",
      "totalReviews",
      "__v",
      "orders",
      "seller",
      "status",
      "views",
      "clicks",
      "impressions",
    ];
    FORBIDDEN_PROPERTIES.forEach((prop) => {
      delete payload[prop];
    });

    if (payload.title && payload.title.trim().length > 80) {
      toast.error("Package title must not exceed 80 characters");
      return;
    }

    if (!isDraft) {
      if (!payload.title) {
        toast.error("Please enter a package title");
        return;
      }
      if (!payload.category) {
        toast.error("Please select a category");
        return;
      }
      if (!payload.description || payload.description === "<p><br></p>") {
        toast.error("Please provide a package description");
        return;
      }
      const basicPrice = Number(basicTier.price);
      if (isNaN(basicPrice) || basicPrice <= 0) {
        toast.error("Please enter a valid price for the Basic package");
        return;
      }
    }

    mutation.mutate(payload);
  };

  // Current active tier object (or default empty tier)
  const currentTierData =
    (state.packages as any)?.[activeTier] || {
      title: "",
      shortDesc: "",
      price: "",
      deliveryTime: "",
      revisionNumber: "",
      features: [],
    };

  const deliveryOptions = useMemo<CustomSelectOption[]>(() => {
    const customVal = currentTierData.deliveryTime ? String(currentTierData.deliveryTime) : "";
    const exists = DELIVERY_TIME_OPTIONS.some((o) => String(o.value) === customVal);
    if (customVal && !exists) {
      return [
        ...DELIVERY_TIME_OPTIONS,
        { value: customVal, label: `${customVal} ${Number(customVal) === 1 ? "day" : "days"}` },
      ];
    }
    return DELIVERY_TIME_OPTIONS;
  }, [currentTierData.deliveryTime]);

  const revisionOptions = useMemo<CustomSelectOption[]>(() => {
    const customVal = currentTierData.revisionNumber !== undefined && currentTierData.revisionNumber !== "" ? String(currentTierData.revisionNumber) : "";
    const exists = REVISION_OPTIONS.some((o) => String(o.value) === customVal);
    if (customVal && !exists) {
      return [
        ...REVISION_OPTIONS,
        { value: customVal, label: `${customVal} Revisions` },
      ];
    }
    return REVISION_OPTIONS;
  }, [currentTierData.revisionNumber]);

  // Resilient category value resolution so that options accurately reflect selection
  const matchedCategoryVal = parentCategories.find(
    (c: any) =>
      c.name === state.category ||
      c.slug === state.category ||
      c._id === state.category ||
      c.id === state.category ||
      c.name?.toLowerCase() === String(state.category).toLowerCase() ||
      c.slug?.toLowerCase() === String(state.category).toLowerCase()
  )?.name || state.category || "";

  const matchedSubcategoryVal = currentSubcategories.find(
    (s: any) =>
      s.name === state.subcategory ||
      s.slug === state.subcategory ||
      s._id === state.subcategory ||
      s.id === state.subcategory ||
      s.name?.toLowerCase() === String(state.subcategory).toLowerCase() ||
      s.slug?.toLowerCase() === String(state.subcategory).toLowerCase()
  )?.name || state.subcategory || "";

  const matchedNicheVal = currentNiches.find(
    (n: any) =>
      n.name === state.niche ||
      n.slug === state.niche ||
      n._id === state.niche ||
      n.id === state.niche ||
      n.name?.toLowerCase() === String(state.niche).toLowerCase() ||
      n.slug?.toLowerCase() === String(state.niche).toLowerCase()
  )?.name || state.niche || "";

  const selectedCategoryObj = parentCategories.find(
    (c: any) => (c.slug || c.name || c._id || c.id) === (matchedCategoryVal || state.category)
  );
  const selectedSubcategoryObj = currentSubcategories.find(
    (s: any) => (s.slug || s.name || s._id || s.id) === (matchedSubcategoryVal || state.subcategory)
  );
  const selectedNicheObj = currentNiches.find(
    (n: any) => (n.slug || n.name || n._id || n.id) === (matchedNicheVal || state.niche)
  );

  const categoryBadgeLabel = selectedCategoryObj
    ? [selectedCategoryObj.name, selectedSubcategoryObj?.name, selectedNicheObj?.name]
      .filter(Boolean)
      .join(" › ")
    : (matchedCategoryVal || "Category");

  // Real uploaded gallery items (cover banner + sub-images)
  const galleryItems = Array.from(
    new Set([
      ...(state.cover ? [state.cover] : []),
      ...(state.images || []),
    ])
  ).filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#F8F9FA]">
        <Loader size={45} />
      </div>
    );
  }

  if (error || !packageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-7">

        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="fiverr"
                onClick={() => router.push("/my-packages")}
                className="text-gray-400 hover:text-gray-700 -ml-1 w-8 h-8 hover:bg-gray-100"
                title="Back to my packages"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950 truncate max-w-xl">
                Edit Package: {state.title || ""}
              </h1>
            </div>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Update your package details, pricing tiers, deliverables, and attachments so clients know exactly what you provide.
            </p>
          </div>

          {/* Action Buttons: Draft and Save & Update Package */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Button
              type="button"
              variant="soft"
              size="sm"
              radius="fiverr"
              onClick={() => handleSubmit(true)}
              disabled={mutation.isPending}
              className="bg-[#F1F3F5] hover:bg-gray-200 text-[#353535] hover:text-gray-900 font-semibold px-5 py-2.5"
            >
              Draft and Save
            </Button>

            <Button
              type="button"
              variant="dark"
              size="sm"
              radius="fiverr"
              onClick={() => handleSubmit(false)}
              isLoading={mutation.isPending}
              loadingText="Updating..."
              className="font-semibold px-5 py-2.5 shadow-2xs"
            >
              Update Package
            </Button>
          </div>
        </div>

        {/* 2. Top Navigation Tabs (Sticky & Scroll-Based) */}
        <div className="sticky top-[69px] z-30 py-3 bg-[#F8F9FA]/95 backdrop-blur-md -my-1">
          <div className="bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 inline-flex items-center h-[46px] shadow-sm">
            {(["about", "packages", "seller", "faq"] as SectionTab[]).map((tab) => {
              const labelMap: Record<SectionTab, string> = {
                about: "About",
                packages: "Packages",
                seller: "Seller Info",
                faq: "FAQ",
              };
              const isActive = activeTab === tab;
              return (
                <Button
                  key={tab}
                  type="button"
                  variant={isActive ? "brand" : "ghost"}
                  size="sm"
                  radius="fiverr"
                  onClick={() => scrollToSection(tab)}
                  className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-4 sm:px-5 transition-all ${isActive
                    ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                    : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                    }`}
                >
                  {labelMap[tab]}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 3. Section: About & Pricing Tier */}
        <div id="section-about" className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: About this packages */}
          <div className="lg:col-span-8 bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-950">
                About this packages
              </h2>
              <span className="bg-[#F8F9FA] border border-gray-200/80 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-[6px]">
                {categoryBadgeLabel}
              </span>
            </div>

            {/* Package Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                  Package title
                </label>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    (state.title?.length || 0) > 80
                      ? "text-red-500 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {state.title?.length || 0}/80
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={state.title || ""}
                onChange={handleInputChange}
                placeholder="e.g I will do something i am really good at"
                className={`w-full h-10 px-3.5 bg-[#F0F0F0] border rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors ${
                  (state.title?.length || 0) > 80
                    ? "border-red-400 focus:border-red-500 bg-red-50/10"
                    : "border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white"
                }`}
              />
              {(state.title?.length || 0) > 80 && (
                <p className="text-[11px] text-red-500 font-medium">
                  Package title cannot exceed 80 characters
                </p>
              )}
            </div>

            {/* Package Description (Rich Text Editor) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Package description
              </label>
              <div className="bg-white rounded-[6px] overflow-hidden border border-gray-200">
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
                <CustomSelect
                  size="md"
                  variant="filled"
                  options={parentCategories.map((c: any) => ({
                    value: c.name || c.slug,
                    label: c.name || c.slug,
                  }))}
                  value={matchedCategoryVal}
                  onChange={handleCategoryChange}
                  placeholder="Select Category"
                  ariaLabel="Select Category"
                />
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Subcategory
                  </label>
                  <span className="text-[11px] text-gray-400 font-normal">Optional</span>
                </div>
                <CustomSelect
                  size="md"
                  variant="filled"
                  options={currentSubcategories.map((sub: any) => ({
                    value: sub.name || sub.slug,
                    label: sub.name || sub.slug,
                  }))}
                  value={matchedSubcategoryVal}
                  onChange={handleSubcategoryChange}
                  disabled={!matchedCategoryVal || currentSubcategories.length === 0}
                  placeholder={
                    !matchedCategoryVal
                      ? "Select category first"
                      : currentSubcategories.length === 0
                      ? "No subcategories available"
                      : "Select Subcategory (Optional)"
                  }
                  ariaLabel="Select Subcategory"
                />
              </div>

              {/* Niche (2nd-level Child) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Niche
                  </label>
                  <span className="text-[11px] text-gray-400 font-normal">Optional</span>
                </div>
                <CustomSelect
                  size="md"
                  variant="filled"
                  options={currentNiches.map((n: any) => ({
                    value: n.name || n.slug,
                    label: n.name || n.slug,
                  }))}
                  value={matchedNicheVal}
                  onChange={handleNicheChange}
                  disabled={!matchedSubcategoryVal || currentNiches.length === 0}
                  placeholder={
                    !matchedSubcategoryVal
                      ? "Select subcategory first"
                      : currentNiches.length === 0
                      ? "No niches available"
                      : "Select Niche (Optional)"
                  }
                  ariaLabel="Select Niche"
                />
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
                      className="inline-flex items-center gap-1.5 bg-[#F4F5F7] border border-gray-200/80 px-2.5 py-1 rounded-[6px] text-xs font-medium text-gray-700"
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
                    className="h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none w-52 sm:w-60 transition-colors"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    radius="fiverr"
                    className="bg-[#0B3A33] hover:bg-[#0B3A33]/90 text-white font-semibold h-10 px-4 text-xs sm:text-[13px]"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    radius="fiverr"
                    onClick={() => setShowAddTool(false)}
                    className="h-10 px-3.5 text-xs sm:text-[13px] text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  radius="fiverr"
                  onClick={() => setShowAddTool(true)}
                  rightIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-[#0D6D5F] hover:text-[#0A5348] font-semibold pt-1 p-0 hover:bg-transparent"
                >
                  Add Tool
                </Button>
              )}
            </div>

            {/* Search Keywords / Tags Section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
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
                      className="inline-flex items-center gap-1.5 bg-[#F4F5F7] border border-gray-200/80 px-2.5 py-1 rounded-[6px] text-xs font-medium text-gray-700"
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
                    className="h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none w-52 sm:w-60 transition-colors"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    radius="fiverr"
                    className="bg-[#0B3A33] hover:bg-[#0B3A33]/90 text-white font-semibold h-[40px] px-4 text-xs sm:text-[13px]"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    radius="fiverr"
                    onClick={() => {
                      setShowAddKeyword(false);
                      setNewKeywordInput("");
                    }}
                    className="h-[40px] px-3.5 text-xs sm:text-[13px] text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                keywordsList.length < 5 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    radius="fiverr"
                    onClick={() => setShowAddKeyword(true)}
                    rightIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-[#0D6D5F] hover:text-[#0A5348] font-semibold pt-1 p-0 hover:bg-transparent"
                  >
                    Add Keyword
                  </Button>
                )
              )}
            </div>

          </div>

          {/* Right Column: Pricing Tier Card (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-[140px] self-start bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-5 space-y-4">

            {/* Tier Pills Tabs: Basic, Silver (standard), Platinum (premium) */}
            <div className="bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 flex items-center h-[46px]">
              {(["basic", "standard", "premium"] as TierKey[]).map((tierKey) => {
                const displayLabels: Record<TierKey, string> = {
                  basic: "Basic",
                  standard: "Silver",
                  premium: "Platinum",
                };
                const label = displayLabels[tierKey] || (tierKey === "standard" ? "Silver" : tierKey === "premium" ? "Platinum" : "Basic");
                const isCurrent = activeTier === tierKey;
                const isEnabled = Boolean((state.packages as any)?.[tierKey]);

                return (
                  <Button
                    key={tierKey}
                    type="button"
                    variant={isCurrent ? "brand" : "ghost"}
                    size="sm"
                    radius="fiverr"
                    onClick={() => {
                      setActiveTier(tierKey);
                      if (!(state.packages as any)?.[tierKey]) {
                        dispatch({
                          type: "TOGGLE_PACKAGE_TIER",
                          payload: { tier: tierKey },
                        });
                      }
                    }}
                    className={`flex-1 h-full font-sf-pro font-medium text-[14px] sm:text-[15px] text-center transition-all flex items-center justify-center gap-1 ${isCurrent
                      ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                      : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                      }`}
                  >
                    <span>{label}</span>
                    {tierKey !== "basic" && !isEnabled && (
                      <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isCurrent ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
                        Off
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Tier Title */}
            <div className="space-y-1">
              {(() => {
                const currentTierTitle =
                  activeTier === "basic"
                    ? currentTierData.title || state.title || currentTierData.shortTitle || ""
                    : currentTierData.title || "";
                const isExceeded = currentTierTitle.length > 80;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                        Package title
                      </label>
                      <span
                        className={`text-[11px] font-medium transition-colors ${
                          isExceeded
                            ? "text-red-500 font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {currentTierTitle.length}/80
                      </span>
                    </div>
                    <input
                      type="text"
                      value={currentTierTitle}
                      onChange={(e) => handleTierInputChange("title", e.target.value)}
                      placeholder="e.g I will do something i am really good at"
                      className={`w-full h-10 px-3.5 bg-[#F0F0F0] border rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors ${
                        isExceeded
                          ? "border-red-400 focus:border-red-500 bg-red-50/10"
                          : "border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white"
                      }`}
                    />
                    {isExceeded && (
                      <p className="text-[11px] text-red-500 font-medium">
                        Package title cannot exceed 80 characters
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Tier Description */}
            <div className="space-y-1">
              <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                Package description
              </label>
              <textarea
                value={currentTierData.shortDesc || ""}
                onChange={(e) => handleTierInputChange("shortDesc", e.target.value)}
                placeholder="write description"
                rows={3}
                className="w-full bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors resize-y min-h-[80px]"
              />
            </div>

            {/* Add Delivery Time & Revisions in responsive 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Delivery Time */}
              <div className="space-y-1">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                  Add delivery time
                </label>
                <CustomSelect
                  size="md"
                  variant="filled"
                  options={deliveryOptions}
                  value={currentTierData.deliveryTime || ""}
                  onChange={(val) => handleTierInputChange("deliveryTime", String(val))}
                  placeholder="e.g 12 days"
                  ariaLabel="Add delivery time"
                />
              </div>

              {/* Revisions */}
              <div className="space-y-1">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                  Revisions
                </label>
                <CustomSelect
                  size="md"
                  variant="filled"
                  options={revisionOptions}
                  value={currentTierData.revisionNumber !== undefined ? String(currentTierData.revisionNumber) : ""}
                  onChange={(val) => handleTierInputChange("revisionNumber", String(val))}
                  placeholder="Select Revisions"
                  ariaLabel="Select Revisions"
                />
              </div>
            </div>

            {/* Add Features */}
            <div className="space-y-2 pt-1">
              <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                Add Features
              </label>
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
                    className="bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none flex-1 min-w-0 h-10 transition-colors"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    radius="fiverr"
                    className="bg-[#0B3A33] hover:bg-[#0B3A33]/90 text-white font-semibold h-10 px-3.5 text-xs sm:text-[13px] shrink-0"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    radius="fiverr"
                    onClick={() => {
                      setShowAddFeature(false);
                      setNewFeatureInput("");
                    }}
                    className="h-10 px-3 text-xs sm:text-[13px] text-gray-700 hover:text-gray-900 shrink-0"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  radius="fiverr"
                  onClick={() => setShowAddFeature(true)}
                  rightIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-[#0D6D5F] hover:text-[#0A5348] font-semibold p-0 hover:bg-transparent"
                >
                  Add Features
                </Button>
              )}
            </div>

            {/* Set Price */}
            <div className="space-y-1 pt-1">
              <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                Set price ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={currentTierData.price || ""}
                  onChange={(e) => handleTierInputChange("price", e.target.value)}
                  placeholder="e.g $200"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                  className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quick Update Button inside Sticky Card */}
            <div className="pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="dark"
                size="md"
                radius="fiverr"
                fullWidth
                onClick={() => handleSubmit(false)}
                isLoading={mutation.isPending}
                loadingText="Updating Package..."
                className="font-semibold shadow-2xs py-3"
              >
                Update Package
              </Button>
            </div>

          </div>

        </div>

        {/* 4. Section: Packages Media & Gallery */}
        <div id="section-packages" className="scroll-mt-36 bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">

          {/* Header: Packages title & arrow controls */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Packages Media &amp; Gallery
            </h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                radius="full"
                onClick={() => scrollGallery("left")}
                title="Previous"
                className="w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="soft"
                size="icon"
                radius="full"
                onClick={() => scrollGallery("right")}
                title="Next"
                className="w-8 h-8 bg-[#EAECEF] hover:bg-gray-300 text-gray-700 hover:text-gray-950"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
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
          <div className="border border-gray-200/90 rounded-[6px] p-6 sm:p-8 space-y-4 bg-white">
            {/* Add Banner Dropzone */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className="border border-dashed border-gray-300 hover:border-[#0D6D5F] rounded-[6px] py-6 text-center cursor-pointer transition-all bg-white hover:bg-gray-50/70 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D6D5F]"
            >
              <span>{state.cover ? "Change Banner Image" : "Add Banner"}</span>
              <Plus className="w-4 h-4" />
            </div>

            {/* Add Sub Images Dropzone */}
            <div
              onClick={() => subImagesInputRef.current?.click()}
              className="border border-dashed border-gray-300 hover:border-[#0D6D5F] rounded-[6px] py-6 text-center cursor-pointer transition-all bg-white hover:bg-gray-50/70 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D6D5F]"
            >
              <span>Add Sub Images / Attachments</span>
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Real Uploaded Images Gallery Row */}
          {galleryItems.length > 0 && (
            <div
              ref={galleryScrollRef}
              className="flex items-center gap-3.5 pt-1 overflow-x-auto scrollbar-none scroll-smooth"
            >
              {galleryItems.map((imgUrl, idx) => {
                const isBanner = imgUrl === state.cover;
                return (
                  <div
                    key={idx}
                    className="relative shrink-0 w-44 sm:w-52 aspect-[16/10] rounded-[6px] overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs group"
                  >
                    <img
                      src={imgUrl}
                      alt={`Attachment ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="icon"
                      radius="full"
                      onClick={() => handleRemoveImage(imgUrl)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 p-1 opacity-90 hover:opacity-100 shadow-xs z-10"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    {isBanner ? (
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[9px] font-bold text-center py-0.5 tracking-wider uppercase">
                        BANNER
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="dark"
                        size="xs"
                        radius="none"
                        onClick={() => {
                          const remainingImages = galleryItems.filter((i: string) => i !== imgUrl);
                          dispatch({
                            type: "ADD_IMAGES",
                            payload: {
                              cover: imgUrl,
                              images: remainingImages,
                            },
                          });
                          toast.success("Set as banner!");
                        }}
                        className="absolute bottom-0 inset-x-0 bg-black/60 hover:bg-black/80 text-white text-[9px] font-semibold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
                      >
                        Set as Banner
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* 5. Section: Seller Info */}
        <div id="section-seller" className="scroll-mt-36 bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
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
          <div className="bg-[#F8F9FA] rounded-[6px] p-4 text-xs text-gray-600 leading-relaxed">
            {user?.description || user?.bio || "No bio entered yet. You can complete your detailed profile under Account Settings."}
          </div>
        </div>

        {/* 6. Section: Frequently asked questions */}
        <div id="section-faq" className="scroll-mt-36 bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Frequently asked questions
            </h2>
            <span className="bg-[#F8F9FA] border border-gray-200/90 text-gray-600 text-xs font-semibold px-3 py-1 rounded-[6px]">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="fiverr"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 shrink-0 w-8 h-8"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
          <div className="bg-white rounded-[6px] border border-gray-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                Question
              </label>
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Write here"
                className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-[13px] font-medium text-gray-700 block">
                Answer
              </label>
              <textarea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="Write here"
                rows={3}
                className="w-full bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors resize-y min-h-[70px]"
              />
            </div>
          </div>

          {/* Add Another + Button */}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              radius="fiverr"
              onClick={handleAddFaq}
              rightIcon={<Plus className="w-4 h-4" />}
              className="text-[#0D6D5F] hover:text-[#0A5348] font-bold p-0 hover:bg-transparent"
            >
              Add Another
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditPackagePage;
