"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiHome,
  FiCamera,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiCheck,
  FiX,
  FiExternalLink,
  FiEye,
} from "react-icons/fi";
import {
  Briefcase,
  GraduationCap,
  FolderDot,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import supportService from "@/utils/supportService";
import { Loader, KycVerificationForm } from "@/components";

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Active section tab for navigation
  const [activeSection, setActiveSection] = useState<
    "personal" | "professional" | "experience" | "portfolio" | "verification"
  >("personal");

  // Form states - Personal & Professional
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "Bangladesh");
  const [shortTitle, setShortTitle] = useState(user?.shortTitle || "");
  const [description, setDescription] = useState(user?.description || "");
  
  // Skills as an array
  const [skillsList, setSkillsList] = useState<string[]>(() => {
    if (Array.isArray(user?.skills)) return user.skills;
    if (typeof user?.skills === "string") {
      return (user.skills as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "Problem solver",
      "UI Designer",
      "User Experience Designer",
      "Analytical Thinker",
      "Product management",
    ];
  });
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Languages state
  const [languages, setLanguages] = useState<any[]>(user?.languages || []);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [newLangName, setNewLangName] = useState("");
  const [newLangLevel, setNewLangLevel] = useState("Fluent");

  // Experience & Education states
  const [experience, setExperience] = useState<any[]>(user?.experience || []);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExp, setNewExp] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [education, setEducation] = useState<any[]>(user?.education || []);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEd, setNewEd] = useState({
    degree: "",
    university: "",
    year: "",
    country: "",
  });

  // Portfolio (for sellers)
  const [portfolio, setPortfolio] = useState<any[]>(user?.portfolio || []);
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [uploadingPortfolioIdx, setUploadingPortfolioIdx] = useState<number | null>(null);

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.image || "/media/noavatar.png");
  const [coverImageUrl, setCoverImageUrl] = useState(
    user?.coverImage ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync user state on load
  useEffect(() => {
    if (user) {
      if (user.phone !== undefined) setPhone(user.phone || "");
      if (user.country !== undefined) setCountry(user.country || "Bangladesh");
      if (user.shortTitle !== undefined) setShortTitle(user.shortTitle || "");
      if (user.description !== undefined) setDescription(user.description || "");
      if (user.image) setPreviewUrl(user.image);
      if (user.coverImage) setCoverImageUrl(user.coverImage);
      if (Array.isArray(user.languages)) setLanguages(user.languages);
      if (Array.isArray(user.experience)) setExperience(user.experience);
      if (Array.isArray(user.education)) setEducation(user.education);
      if (Array.isArray(user.portfolio)) setPortfolio(user.portfolio);
      if (Array.isArray(user.skills) && user.skills.length > 0) setSkillsList(user.skills);
    }
  }, [user]);

  // Handle avatar upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.success("Profile image selected. Click 'Save Changes' to update.");
    }
  };

  // Handle cover image upload
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading("Uploading cover image...", { id: "cover-upload" });
        const uploaded = await supportService.uploadFileToCloudinary(file, "profile_covers");
        const cdnUrl = uploaded.secure_url || uploaded.url;
        if (cdnUrl) {
          setCoverImageUrl(cdnUrl);
          toast.success("Cover image updated!", { id: "cover-upload" });
        }
      } catch {
        setCoverImageUrl(URL.createObjectURL(file));
        toast.success("Cover image preview updated!", { id: "cover-upload" });
      }
    }
  };

  // Skill handlers
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!skillsList.includes(newSkillInput.trim())) {
      setSkillsList([...skillsList, newSkillInput.trim()]);
    }
    setNewSkillInput("");
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Language handlers
  const handleAddLanguageItem = () => {
    if (!newLangName.trim()) return;
    setLanguages([...languages, { language: newLangName.trim(), level: newLangLevel }]);
    setNewLangName("");
    setIsAddingLanguage(false);
  };

  const handleRemoveLanguage = (idx: number) => {
    setLanguages(languages.filter((_, i) => i !== idx));
  };

  // Experience handlers
  const handleAddExperienceItem = () => {
    if (!newExp.title.trim() || !newExp.company.trim()) {
      toast.error("Please enter position title and company name");
      return;
    }
    setExperience([...experience, { ...newExp }]);
    setNewExp({ title: "", company: "", startDate: "", endDate: "", description: "" });
    setIsAddingExperience(false);
    toast.success("Experience added!");
  };

  const handleRemoveExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  // Education handlers
  const handleAddEducationItem = () => {
    if (!newEd.degree.trim() || !newEd.university.trim()) {
      toast.error("Please enter degree and university/college");
      return;
    }
    setEducation([...education, { ...newEd }]);
    setNewEd({ degree: "", university: "", year: "", country: "" });
    setIsAddingEducation(false);
    toast.success("Education added!");
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    let score = 30; // base account
    if (previewUrl && !previewUrl.includes("noavatar")) score += 15;
    if (phone?.trim()) score += 10;
    if (country?.trim()) score += 10;
    if (shortTitle?.trim()) score += 10;
    if (description?.trim()) score += 10;
    if (skillsList.length > 0) score += 10;
    if (experience.length > 0 || education.length > 0) score += 5;
    return Math.min(100, Math.max(score, 90));
  }, [previewUrl, phone, country, shortTitle, description, skillsList, experience, education]);

  // Submit profile updates to real backend API
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);

    try {
      let imageUrl = user?.image;

      if (imageFile) {
        try {
          const uploaded = await supportService.uploadFileToCloudinary(imageFile, "avatars");
          if (uploaded.secure_url || uploaded.url) {
            imageUrl = uploaded.secure_url || uploaded.url;
          }
        } catch {
          // Fallback to imgbb if cloudinary has issue
          const formData = new FormData();
          formData.append("image", imageFile);
          const uploadRes = await fetch(
            "https://api.imgbb.com/1/upload?key=6857715a54c637cd1d21c558202e7c9c",
            {
              method: "POST",
              body: formData,
            }
          );
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            imageUrl = uploadData.data.url;
          }
        }
      }

      const validPortfolio = portfolio.filter(
        (p: any) => p && p.title && p.title.trim() !== "" && p.image && p.image.trim() !== ""
      );

      const payload: any = {
        image: imageUrl,
        coverImage: coverImageUrl,
        phone,
        country,
        shortTitle,
        description,
        skills: skillsList,
        languages,
        education,
        experience,
        portfolio: validPortfolio,
      };

      const { data } = await axiosFetch.patch("/users", payload);

      if (!data.error) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isSeller = Boolean(user?.isSeller);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
          >
            <FiHome className="text-sm" />
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium">Profile</span>
        </div>

        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Edit Profile Settings
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Update your personal information, professional details, and portfolio.
            </p>
          </div>

          {/* Section Pill Tabs */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex items-center gap-1 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                setActiveSection("personal");
                scrollToSection("section-personal");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "personal"
                  ? "bg-[#0D3B34] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Personal Info
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection("professional");
                scrollToSection("section-professional");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "professional"
                  ? "bg-[#0D3B34] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Professional Details
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection("experience");
                scrollToSection("section-experience");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "experience"
                  ? "bg-[#0D3B34] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Experience &amp; Education
            </button>
            {isSeller && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection("portfolio");
                  scrollToSection("section-portfolio");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === "portfolio"
                    ? "bg-[#0D3B34] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Portfolio
              </button>
            )}
            {isSeller && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection("verification");
                  scrollToSection("section-verification");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === "verification"
                    ? "bg-[#0D3B34] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Verification
              </button>
            )}
          </div>
        </div>

        {/* HERO BANNER CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5 mb-7">
          {/* Cover image banner */}
          <div
            className="h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden relative bg-slate-900 bg-cover bg-center"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
          >
            {/* Top Right Banner Controls */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetUser = user?.username || user?._id || user?.id;
                  if (targetUser) {
                    router.push(`/seller/${encodeURIComponent(targetUser)}?preview=true`);
                  } else {
                    toast.error("User profile unavailable");
                  }
                }}
                className="bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>See Public View</span>
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer"
                title="Change Cover Image"
              >
                <FiEdit2 className="text-xs" />
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Meta Row: Avatar + Name + Completion */}
          <div className="px-2 sm:px-4 pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-3.5 -mt-12 sm:-mt-14">
              {/* Avatar with Camera upload trigger */}
              <div className="relative group shrink-0">
                <img
                  src={previewUrl}
                  alt={user?.username || "Avatar"}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="Upload profile picture"
                >
                  <FiCamera className="text-lg" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Name + Badge + Title */}
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                    {user?.username || "Nilson Norman"}
                  </h2>
                  <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                    {user?.badge || (isSeller ? "Pro" : "Client")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {shortTitle || user?.shortTitle || (isSeller ? "Web Designer" : "Project Manager")}
                </p>
              </div>
            </div>

            {/* Profile Completion Progress Bar */}
            <div className="sm:text-right pb-1">
              <div className="flex items-center sm:justify-end gap-2 text-xs mb-1.5">
                <span className="font-semibold text-slate-800 underline">
                  Complete your profile
                </span>
                <span className="font-bold text-slate-900">{profileCompletion}%</span>
              </div>
              <div className="w-full sm:w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: PERSONAL INFO */}
        <div
          id="section-personal"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-6"
        >
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Personal Info</h2>
            <button
              type="button"
              onClick={() => scrollToSection("section-personal")}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <FiEdit2 className="text-sm" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Account Username */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Account username
              </label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Country
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Bangladesh, United States"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all pr-9"
                />
                <FiChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL DETAILS */}
        <div
          id="section-professional"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-6"
        >
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Professional Details
            </h2>
            <button
              type="button"
              onClick={() => scrollToSection("section-professional")}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <FiEdit2 className="text-sm" />
            </button>
          </div>

          {/* Professional Title */}
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Professional Title
            </label>
            <input
              type="text"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              placeholder="e.g Expert Digital Marketer & Specialist"
              className="w-full px-4 py-2.5 bg-[#F1F3F5] border border-transparent rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Bio
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write here"
              className="w-full p-4 bg-[#F1F3F5] border border-transparent rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
            />
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Skills
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200/60 inline-flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
              {skillsList.length >= 5 && (
                <span className="bg-[#F1F3F5] text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                  +{skillsList.length - 4}
                </span>
              )}
            </div>

            {/* Add Skill Inline Form */}
            {isAddingSkill ? (
              <div className="flex items-center gap-2 max-w-sm mt-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Enter skill name"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500 flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSkill(true)}
                className="text-xs font-bold text-[#0D9488] hover:underline inline-flex items-center gap-1 cursor-pointer mt-1"
              >
                <span>Add Skills</span>
                <FiPlus className="text-sm" />
              </button>
            )}
          </div>

          {/* Languages Section */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Languages
            </label>
            {languages.length === 0 && !isAddingLanguage ? (
              <p className="text-xs text-slate-400 mb-2">There is no language added</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200/60 inline-flex items-center gap-2"
                  >
                    <span>
                      {lang.language || lang.name}{" "}
                      <span className="text-slate-400 text-[11px]">({lang.level || "Fluent"})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(idx)}
                      className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Language Inline Form */}
            {isAddingLanguage ? (
              <div className="flex flex-wrap items-center gap-2 max-w-md mt-2">
                <input
                  type="text"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="Language (e.g. English)"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500 flex-1 min-w-[120px]"
                />
                <select
                  value={newLangLevel}
                  onChange={(e) => setNewLangLevel(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                >
                  <option value="Basic">Basic</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddLanguageItem}
                  className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingLanguage(false)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingLanguage(true)}
                className="text-xs font-bold text-[#0D9488] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Add Languages</span>
                <FiPlus className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: EXPERIENCE & EDUCATION */}
        <div
          id="section-experience"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-7"
        >
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Experience &amp; Education
            </h2>
            <button
              type="button"
              onClick={() => scrollToSection("section-experience")}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <FiEdit2 className="text-sm" />
            </button>
          </div>

          {/* Work Experiences */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 block mb-1">
              Work Experiences
            </h3>
            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 mb-3">There is no experience added yet</p>
            ) : (
              <div className="space-y-3 mb-3">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{exp.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {exp.company} • {exp.startDate || "2022"} - {exp.endDate || "Present"}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Experience Dashed Box / Inline Form */}
            {isAddingExperience ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newExp.title}
                    onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                    placeholder="Job Title (e.g. Lead Designer)"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    placeholder="Company Name"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newExp.startDate}
                    onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                    placeholder="Start Year (e.g. 2021)"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newExp.endDate}
                    onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                    placeholder="End Year or Present"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  placeholder="Key responsibilities or summary..."
                  className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500 resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddExperienceItem}
                    className="px-4 py-1.5 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Experience
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingExperience(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsAddingExperience(true)}
                className="border border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50/70 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-[#0D9488] inline-flex items-center gap-1.5">
                  <span>Add Experiences</span>
                  <FiPlus className="text-sm" />
                </span>
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 block mb-1">
              Education
            </h3>
            {education.length === 0 ? (
              <p className="text-xs text-slate-400 mb-3">There is no education added yet</p>
            ) : (
              <div className="space-y-3 mb-3">
                {education.map((ed, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {ed.degree || ed.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ed.university} • {ed.year || "Graduated"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Education Dashed Box / Inline Form */}
            {isAddingEducation ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newEd.degree}
                    onChange={(e) => setNewEd({ ...newEd, degree: e.target.value })}
                    placeholder="Degree / Certificate (e.g. B.Sc in Computer Science)"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newEd.university}
                    onChange={(e) => setNewEd({ ...newEd, university: e.target.value })}
                    placeholder="University / College"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newEd.year}
                    onChange={(e) => setNewEd({ ...newEd, year: e.target.value })}
                    placeholder="Graduation Year (e.g. 2020)"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newEd.country}
                    onChange={(e) => setNewEd({ ...newEd, country: e.target.value })}
                    placeholder="Country"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddEducationItem}
                    className="px-4 py-1.5 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Education
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingEducation(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsAddingEducation(true)}
                className="border border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50/70 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-[#0D9488] inline-flex items-center gap-1.5">
                  <span>Add Education</span>
                  <FiPlus className="text-sm" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* OPTIONAL SELLER-ONLY SECTIONS (Preserving complete seller capabilities) */}
        {isSeller && (
          <>
            {/* SECTION: PORTFOLIO */}
            <div
              id="section-portfolio"
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-7"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Portfolio Projects</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Showcase your completed works to clients.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newPort = [...portfolio, { title: "", description: "", image: "", link: "" }];
                    setPortfolio(newPort);
                    setEditingProjectIdx(newPort.length - 1);
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
                >
                  <FiPlus />
                  <span>Add Project</span>
                </button>
              </div>

              {portfolio.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 mb-2">No portfolio items added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolio.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs group relative"
                    >
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80"}
                        alt={item.title || "Project"}
                        className="w-full h-32 object-cover bg-slate-100"
                      />
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {item.title || "Untitled Project"}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.description || "No description provided"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 hover:text-rose-600 text-slate-600 shadow-sm flex items-center justify-center transition-colors"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION: ID VERIFICATION */}
            <div
              id="section-verification"
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-7"
            >
              <div className="pb-5 border-b border-slate-100 mb-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">ID Verification</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verify your government identity to earn a verified trust badge.</p>
              </div>
              <KycVerificationForm />
            </div>
          </>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleSubmit()}
            className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
