"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, DollarSign, Calendar, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import useAdminCategories, { isCategoryRoot } from "@/hooks/useAdminCategories";
import { Button } from "@/components/ui";

const DEFAULT_CATEGORIES = [
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

interface EditBriefModalProps {
  isOpen: boolean;
  brief: any;
  onClose: () => void;
  onSuccess?: (updatedBrief: any) => void;
}

export const EditBriefModal: React.FC<EditBriefModalProps> = ({
  isOpen,
  brief,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { categoryList: rawCats, parentCategories } = useAdminCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState<string | number>("");
  const [deliveryTime, setDeliveryTime] = useState<string | number>("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const rootCategoriesList = (
    parentCategories && parentCategories.length > 0 ? parentCategories : rawCats
  ).filter((cat: any) => isCategoryRoot(cat, rawCats));

  const availableCategories =
    rootCategoriesList.length > 0
      ? rootCategoriesList.map((cat: any) => {
          const name = cat?.name || cat?.title || (typeof cat === "string" ? cat : "");
          const slug =
            cat?.slug ||
            name
              .toLowerCase()
              .trim()
              .replace(/&/g, "and")
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
          return { name, slug };
        })
      : DEFAULT_CATEGORIES.map((name) => ({
          name,
          slug: name
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        }));

  useEffect(() => {
    if (brief && isOpen) {
      setTitle(brief.title || "");
      setDescription(brief.description || "");
      setCategory(brief.category || "");
      setBudget(brief.budget ?? "");
      setDeliveryTime(brief.deliveryTime ?? "");

      const rawSkills = Array.isArray(brief.requiredSkills) && brief.requiredSkills.length > 0
        ? brief.requiredSkills
        : Array.isArray(brief.skills) && brief.skills.length > 0
          ? brief.skills
          : [];
      setRequiredSkills([...rawSkills]);
      setErrorMsg("");
      setNewSkillInput("");
    }
  }, [brief, isOpen]);

  if (!isOpen || !brief) return null;

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillInput("");
      return;
    }
    if (requiredSkills.length >= 10) {
      setErrorMsg("Maximum 10 skills allowed");
      return;
    }
    setRequiredSkills([...requiredSkills, trimmed]);
    setNewSkillInput("");
    setErrorMsg("");
  };

  const handleRemoveSkill = (idxToRemove: number) => {
    setRequiredSkills(requiredSkills.filter((_, idx) => idx !== idxToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const briefId = brief._id || brief.id;
    if (!briefId) {
      setErrorMsg("Invalid brief ID.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Project title is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Project description is required.");
      return;
    }
    if (!budget || Number(budget) <= 0) {
      setErrorMsg("Please enter a valid budget greater than 0.");
      return;
    }
    if (!deliveryTime || Number(deliveryTime) <= 0) {
      setErrorMsg("Please enter a valid delivery time (in days).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        category: category || "Other",
        budget: Number(budget),
        deliveryTime: Number(deliveryTime),
        requiredSkills,
      };

      const res = await axiosFetch.patch(`/briefs/${briefId}`, payload);

      if (res.data?.success || !res.data?.error) {
        toast.success(res.data?.message || "Project updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["my-briefs"] });
        queryClient.invalidateQueries({ queryKey: ["brief", briefId] });
        if (onSuccess) {
          onSuccess(res.data?.brief || res.data);
        }
        onClose();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update project. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 select-none animate-fadeIn"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-white rounded-[6px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Edit Project
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update project details, scope, budget, and required skills
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[6px] flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need Full-Stack Next.js Developer"
              className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] px-3.5 py-2.5 text-xs sm:text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] px-3 py-2.5 text-xs sm:text-[13px] text-slate-900 outline-none transition-all"
            >
              <option value="">Select a category</option>
              {availableCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget & Delivery Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Budget (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] pl-8 pr-3.5 py-2.5 text-xs sm:text-[13px] text-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery Time (Days) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  min="1"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="7"
                  className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] pl-8 pr-3.5 py-2.5 text-xs sm:text-[13px] text-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project deliverables, requirements, and expectations..."
              className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] p-3 text-xs sm:text-[13px] text-slate-900 outline-none transition-all resize-y placeholder:text-slate-400 leading-relaxed"
              required
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Required Skills
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                  placeholder="Type a skill and press Enter"
                  className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] pl-8 pr-3.5 py-2 text-xs sm:text-[13px] text-slate-900 outline-none transition-all"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSkill}
                leftIcon={<Plus size={14} />}
                className="shrink-0 text-xs px-3 border-gray-200"
              >
                Add
              </Button>
            </div>

            {/* Skill Badges */}
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-[6px] border border-slate-200/80"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove skill"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs px-4 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Saving..."
            className="text-xs px-5 font-semibold bg-[#0D6D5F] hover:bg-[#0b5c50] text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBriefModal;
