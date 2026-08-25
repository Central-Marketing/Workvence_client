"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { User, Briefcase, GraduationCap, FolderDot, Camera, Trash2, Plus, Pencil, ExternalLink, Image as ImageIcon, UploadCloud, Folder, ArrowLeft, Eye, ShieldCheck } from "lucide-react";
import supportService from "@/utils/supportService";
import { Loader, KycVerificationForm } from "@/components";

const Profile = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Tabs
  const [activeTab, setActiveTab] = useState("personal");

  // Form states - Personal & Professional
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [shortTitle, setShortTitle] = useState(user?.shortTitle || "");
  const [description, setDescription] = useState(user?.description || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [languages, setLanguages] = useState<any[]>(user?.languages || []);

  // Array states
  const [education, setEducation] = useState<any[]>(user?.education || []);
  const [experience, setExperience] = useState<any[]>(user?.experience || []);
  const [portfolio, setPortfolio] = useState<any[]>(user?.portfolio || []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.image || "/media/noavatar.png");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- Dynamic Array Handlers ---
  const handleAddLanguage = () => {
    setLanguages([...languages, { language: "", level: "" }]);
  };
  const handleUpdateLanguage = (index: number, field: string, value: string) => {
    const newLang = [...languages];
    newLang[index][field] = value;
    setLanguages(newLang);
  };
  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducation([...education, { country: "", university: "", title: "", degree: "", year: "" }]);
  };
  const handleUpdateEducation = (index: number, field: string, value: string) => {
    const newEd = [...education];
    newEd[index][field] = value;
    setEducation(newEd);
  };
  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    setExperience([...experience, { title: "", company: "", startDate: "", endDate: "", currentlyWorking: false, description: "" }]);
  };
  const handleUpdateExperience = (index: number, field: string, value: string) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };
  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleAddPortfolio = () => {
    const newPort = [...portfolio, { title: "", description: "", image: "", link: "" }];
    setPortfolio(newPort);
    setEditingProjectIdx(newPort.length - 1);
  };
  const handleUpdatePortfolio = (index: number, field: string, value: string) => {
    const newPort = [...portfolio];
    newPort[index][field] = value;
    setPortfolio(newPort);
  };
  const handleRemovePortfolio = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
    if (editingProjectIdx === index) {
      setEditingProjectIdx(null);
    }
  };

  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [uploadingPortfolioIdx, setUploadingPortfolioIdx] = useState<number | null>(null);

  const handleSaveProject = (index: number) => {
    const item = portfolio[index];
    if (!item || !item.title || !item.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    if (!item.image || !item.image.trim()) {
      toast.error("Please upload a project cover image");
      return;
    }
    setEditingProjectIdx(null);
    toast.success("Project saved!");
  };

  const handleCancelEditProject = (index: number) => {
    const item = portfolio[index];
    if (!item?.title?.trim() && !item?.image?.trim() && !item?.description?.trim()) {
      setPortfolio(portfolio.filter((_, i) => i !== index));
    }
    setEditingProjectIdx(null);
  };

  const handlePortfolioImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPortfolioIdx(index);
    try {
      toast.loading("Uploading portfolio image...", { id: `port-up-${index}` });
      const uploaded = await supportService.uploadFileToCloudinary(file, "portfolio_images");
      const cdnUrl = uploaded.secure_url || uploaded.url;
      if (cdnUrl) {
        handleUpdatePortfolio(index, "image", cdnUrl);
        toast.success("Portfolio image uploaded!", { id: `port-up-${index}` });
      } else {
        throw new Error("Upload succeeded but no URL returned");
      }
    } catch (err: any) {
      toast.error(err?.message || "Portfolio image upload failed", { id: `port-up-${index}` });
    } finally {
      setUploadingPortfolioIdx(null);
      e.target.value = "";
    }
  };
  // --------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let imageUrl = user?.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await fetch("https://api.imgbb.com/1/upload?key=6857715a54c637cd1d21c558202e7c9c", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.data.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const validPortfolio = portfolio.filter(
        (p: any) => p && p.title && p.title.trim() !== "" && p.image && p.image.trim() !== ""
      );

      const { data } = await axiosFetch.patch("/users", {
        image: imageUrl,
        phone,
        country,
        shortTitle,
        description,
        skills: skills ? skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        languages,
        education,
        experience,
        portfolio: validPortfolio
      });

      if (!data.error) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === id
        ? "border-brand-green text-brand-green"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 py-10 md:py-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-6 py-8 md:px-10 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Profile Settings</h1>
              <p className="text-gray-500 text-sm">Update your personal information, professional details, and portfolio.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                const publicId = user?.username || user?._id || user?.id;
                if (publicId) {
                  router.push(`/seller/${encodeURIComponent(publicId)}?preview=true`);
                } else {
                  toast.error("Profile username or ID unavailable");
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#eaf8f0] text-[#169c5e] hover:bg-[#d5f1e1] border border-[#bbf0d2] text-sm font-semibold rounded-xl transition-all shadow-2xs hover:shadow-sm cursor-pointer shrink-0"
            >
              <Eye size={17} strokeWidth={2.2} />
              <span>Preview Public Mode</span>
            </button>
          </div>

          <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 scrollbar-hide px-6 md:px-10">
            <TabButton id="personal" label="Personal Info" icon={User} />
            <TabButton id="professional" label="Professional Details" icon={Briefcase} />
            <TabButton id="experience" label="Experience & Education" icon={GraduationCap} />
            {user?.isSeller && <TabButton id="portfolio" label="Portfolio" icon={FolderDot} />}
            {user?.isSeller && <TabButton id="verification" label="ID Verification" icon={ShieldCheck} />}
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8 md:px-10 md:py-10">

            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
                  <div className="relative group">
                    <img src={previewUrl} className="w-24 h-24 rounded-full object-cover border-2 border-brand-green/20" alt="avatar preview" />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className="relative overflow-hidden inline-block">
                      <button type="button" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer">
                        Upload new image
                      </button>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <p className="text-xs text-gray-400">JPEG, PNG formats accepted</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Account Username</label>
                    <input type="text" value={user?.username || ""} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed" />
                    <span className="text-[11px] text-gray-400">Username cannot be changed</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed" />
                    <span className="text-[11px] text-gray-400">Contact support to request email updates</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                    <input type="text" placeholder="e.g. +1 555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 text-gray-800 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Country</label>
                    <input type="text" placeholder="e.g. United States" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 text-gray-800 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Professional Title</label>
                  <input type="text" placeholder="e.g. Expert Digital Marketer & SEO Specialist" value={shortTitle} onChange={(e) => setShortTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 text-gray-800 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Skills</label>
                  <input type="text" placeholder="e.g. React, Node.js, Design" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 text-gray-800 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                  <span className="text-[11px] text-gray-400">Separate skills with commas</span>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">Languages</label>
                    <button type="button" onClick={handleAddLanguage} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white rounded-lg text-xs font-bold transition-colors">
                      <Plus size={14} /> Add Language
                    </button>
                  </div>
                  <div className="space-y-3">
                    {languages.map((lang, index) => (
                      <div key={index} className="flex items-center gap-3 relative bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                        <input type="text" placeholder="e.g. English" value={lang.language} onChange={(e) => handleUpdateLanguage(index, "language", e.target.value)} className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                        <select value={lang.level} onChange={(e) => handleUpdateLanguage(index, "level", e.target.value)} className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors">
                          <option value="">Select Level...</option>
                          <option value="Basic">Basic</option>
                          <option value="Conversational">Conversational</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Native">Native</option>
                        </select>
                        <button type="button" onClick={() => handleRemoveLanguage(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {languages.length === 0 && <p className="text-gray-400 text-[11px] italic">No languages added yet.</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Bio / Professional Description</label>
                  <textarea placeholder="Tell clients about your background, skills, or expertise..." value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full px-4 py-3 border border-gray-200 text-gray-800 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all resize-none" />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                {/* Work Experience */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Work Experience</h3>
                    <button type="button" onClick={handleAddExperience} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white rounded-lg text-xs font-bold transition-colors">
                      <Plus size={14} /> Add Experience
                    </button>
                  </div>

                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="relative p-5 bg-gray-50 border border-gray-100 rounded-xl group">
                        <button type="button" onClick={() => handleRemoveExperience(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">Job Title</label>
                            <input type="text" placeholder="e.g. Senior Frontend Developer" value={exp.title} onChange={(e) => handleUpdateExperience(index, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">Company</label>
                            <input type="text" placeholder="e.g. Google" value={exp.company} onChange={(e) => handleUpdateExperience(index, "company", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">Start Date</label>
                            <input type="date" value={exp.startDate} onChange={(e) => handleUpdateExperience(index, "startDate", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">End Date</label>
                            <input type="date" disabled={exp.currentlyWorking} value={exp.endDate || ""} onChange={(e) => handleUpdateExperience(index, "endDate", e.target.value)} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors ${exp.currentlyWorking ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} />
                            <div className="flex items-center gap-2 mt-1">
                              <input type="checkbox" id={`current-${index}`} checked={exp.currentlyWorking || false} onChange={(e) => handleUpdateExperience(index, "currentlyWorking", e.target.checked as any)} className="w-3.5 h-3.5 rounded text-brand-green focus:ring-brand-green" />
                              <label htmlFor={`current-${index}`} className="text-[11px] text-gray-500 cursor-pointer">I currently work here</label>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-600">Description</label>
                            <textarea placeholder="Describe your responsibilities and achievements..." rows={3} value={exp.description} onChange={(e) => handleUpdateExperience(index, "description", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors resize-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {experience.length === 0 && <p className="text-gray-400 text-sm italic py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">No experience added yet.</p>}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Education</h3>
                    <button type="button" onClick={handleAddEducation} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white rounded-lg text-xs font-bold transition-colors">
                      <Plus size={14} /> Add Education
                    </button>
                  </div>

                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="relative p-5 bg-gray-50 border border-gray-100 rounded-xl group">
                        <button type="button" onClick={() => handleRemoveEducation(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-600">Degree / Program</label>
                            <input type="text" placeholder="e.g. Software Engineering" value={edu.degree} onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">Title</label>
                            <input type="text" placeholder="e.g. B.S., M.A." value={edu.title} onChange={(e) => handleUpdateEducation(index, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">University / Institution</label>
                            <input type="text" placeholder="e.g. Stanford University" value={edu.university} onChange={(e) => handleUpdateEducation(index, "university", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">Country</label>
                            <input type="text" placeholder="e.g. United States" value={edu.country} onChange={(e) => handleUpdateEducation(index, "country", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">Year of Graduation</label>
                            <input type="number" placeholder="e.g. 2023" value={edu.year} onChange={(e) => handleUpdateEducation(index, "year", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-green transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {education.length === 0 && <p className="text-gray-400 text-sm italic py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">No education added yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {user?.isSeller && activeTab === 'portfolio' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Portfolio Projects ({portfolio.length})</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Manage your showcase projects displayed on your seller profile.</p>
                  </div>
                  {editingProjectIdx === null && (
                    <button type="button" onClick={handleAddPortfolio} className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-green text-white hover:bg-[#389115] rounded-xl text-xs font-bold transition-colors shadow-xs">
                      <Plus size={14} /> Add Project
                    </button>
                  )}
                </div>

                {editingProjectIdx !== null ? (
                  /* Project Form Editor */
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-xs animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900">
                        {portfolio[editingProjectIdx]?.title ? `Edit Project: ${portfolio[editingProjectIdx].title}` : 'New Portfolio Project'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCancelEditProject(editingProjectIdx)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={14} /> Back to Grid
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Project Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. E-Commerce Mobile App Redesign"
                          value={portfolio[editingProjectIdx]?.title || ''}
                          onChange={(e) => handleUpdatePortfolio(editingProjectIdx, "title", e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-green transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Description</label>
                        <textarea
                          placeholder="Describe your role, technologies used, and key features..."
                          rows={3}
                          value={portfolio[editingProjectIdx]?.description || ''}
                          onChange={(e) => handleUpdatePortfolio(editingProjectIdx, "description", e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-green transition-colors resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Project Cover Image *</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          {portfolio[editingProjectIdx]?.image ? (
                            <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 group flex-shrink-0 bg-gray-100 shadow-xs">
                              <img src={portfolio[editingProjectIdx].image} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleUpdatePortfolio(editingProjectIdx, "image", "")}
                                className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs transition-opacity cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ) : null}

                          <div className="flex-1 w-full">
                            <label className="flex-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePortfolioImageUpload(editingProjectIdx, e)}
                                disabled={uploadingPortfolioIdx === editingProjectIdx}
                              />
                              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors shadow-xs">
                                {uploadingPortfolioIdx === editingProjectIdx ? (
                                  <>
                                    <Loader size={16} />
                                    <span>Uploading ...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud size={16} />
                                    <span>Upload Image File</span>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Project Link (Optional)</label>
                        <input
                          type="url"
                          placeholder="e.g. https://myportfolio-demo.com"
                          value={portfolio[editingProjectIdx]?.link || ''}
                          onChange={(e) => handleUpdatePortfolio(editingProjectIdx, "link", e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-green transition-colors"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        {(() => {
                          const currentProject = editingProjectIdx !== null ? portfolio[editingProjectIdx] : null;
                          const isProjectFormValid = !!(currentProject?.title?.trim() && currentProject?.image?.trim());
                          return (
                            <button
                              type="button"
                              disabled={!isProjectFormValid}
                              onClick={() => handleSaveProject(editingProjectIdx)}
                              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${isProjectFormValid
                                ? "bg-brand-green text-white hover:bg-[#389115] cursor-pointer"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                                }`}
                            >
                              Save Project
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Portfolio Projects Cards Grid */
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {portfolio.map((port, index) => (
                        <div
                          key={index}
                          className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col"
                        >
                          {/* Card Top Cover Image */}
                          <div className="relative h-44 w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                            {port.image ? (
                              <img
                                src={port.image}
                                alt={port.title || 'Project'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/50 text-emerald-600 font-bold text-xs gap-1">
                                <ImageIcon className="w-7 h-7 text-emerald-600 mb-0.5" />
                                <span>No Image Uploaded</span>
                              </div>
                            )}

                            {/* Quick Action Badges */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingProjectIdx(index)}
                                className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-600 rounded-lg shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
                                title="Edit Project"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePortfolio(index)}
                                className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 rounded-lg shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                                {port.title || 'Untitled Project'}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                {port.description || 'No description provided.'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                              {port.link ? (
                                <a
                                  href={port.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold text-xs"
                                >
                                  <ExternalLink size={13} />
                                  <span>View Live Link</span>
                                </a>
                              ) : (
                                <span className="text-gray-400 text-[11px]">No link attached</span>
                              )}

                              <button
                                type="button"
                                onClick={() => setEditingProjectIdx(index)}
                                className="text-xs font-bold text-gray-600 hover:text-brand-green transition-colors cursor-pointer"
                              >
                                Edit Project
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {portfolio.length === 0 && (
                      <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-3">
                        <Folder className="w-10 h-10 text-emerald-600/70 mx-auto" />
                        <h4 className="text-sm font-bold text-gray-800">No Portfolio Projects Added Yet</h4>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                          Showcase your best work, case studies, and live project links to attract more buyers.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddPortfolio}
                          className="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-xl hover:bg-[#389115] transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add First Project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {user?.isSeller && activeTab === 'verification' && (
              <div className="animate-in fade-in duration-300">
                <KycVerificationForm />
              </div>
            )}

            {activeTab !== 'verification' && (
              <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-8 py-3 bg-brand-green hover:bg-[#389115] text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdating ? "Saving Settings..." : "Save All Changes"}
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  return <Profile />;
}
