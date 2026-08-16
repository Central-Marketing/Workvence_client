// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import "./CreateBrief.scss";

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

  const [step, setStep] = useState(1);
  const [rawInput, setRawInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deliveryTime: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // AI Generate mutation
  const aiGenerate = useMutation({
    mutationFn: (prompt) =>
      axiosFetch
        .post("/briefs/ai-generate", { prompt })
        .then(({ data }) => data),
    onSuccess: (data) => {
      const draft = data?.draft || data;
      setForm({
        title: draft.title || "",
        description: draft.description || "",
        category: draft.category || "",
        budget: draft.budget || "",
        deliveryTime: draft.deliveryTime || "",
      });
      setStep(2);
      toast.success("AI draft generated!");
    },
    onError: () => {
      toast.error("Failed to generate draft. Try again.");
    },
  });

  // Post brief mutation
  const postBrief = useMutation({
    mutationFn: (briefData) =>
      axiosFetch.post("/briefs", briefData).then(({ data }) => data),
    onSuccess: () => {
      setStep(3);
      toast.success("Project posted successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to post project");
    },
  });

  const handleAIGenerate = () => {
    if (!rawInput.trim()) {
      toast.error("Please describe your project requirements");
      return;
    }
    aiGenerate.mutate(rawInput);
  };

  const handleSkipAI = () => {
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    postBrief.mutate({
      title: form.title,
      description: form.description,
      category: form.category || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      deliveryTime: form.deliveryTime ? Number(form.deliveryTime) : undefined,
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const stepClass = (n) => {
    if (n < step) return "step done";
    if (n === step) return "step active";
    return "step";
  };

  return (
    <div className="create-brief">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Post a Job Project</h1>
          <p>Describe what you need — AI can help structure it for you</p>
        </div>

        {/* Progress */}
        <div className="steps-indicator">
          <div className={stepClass(1)}>
            <span className="step-number">1</span>
            <span className="step-label">Describe</span>
          </div>
          <div className={`step-divider ${step > 1 ? "filled" : ""}`} />
          <div className={stepClass(2)}>
            <span className="step-number">2</span>
            <span className="step-label">Review & Edit</span>
          </div>
          <div className={`step-divider ${step > 2 ? "filled" : ""}`} />
          <div className={stepClass(3)}>
            <span className="step-number">3</span>
            <span className="step-label">Published</span>
          </div>
        </div>

        {/* Step 1: Describe */}
        {step === 1 && !aiGenerate.isPending && (
          <div className="form-card describe-step">
            <div>
              <h2>What do you need done?</h2>
              <p className="subtitle">
                Describe your project in plain language. Be as specific as
                possible — include goals, features, timeline, and budget if you
                have them in mind.
              </p>
            </div>
            <textarea
              placeholder="e.g. I need a mobile app for my restaurant that lets customers browse the menu, place orders, and pay online. Budget is around $2,000 and I need it within 3 weeks..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />
            <div className="step-actions">
              <button className="btn-secondary" onClick={handleSkipAI}>
                Skip AI — Write manually
              </button>
              <button
                className="btn-ai"
                onClick={handleAIGenerate}
                disabled={!rawInput.trim()}
              >
                ✨ Generate with AI
              </button>
            </div>
          </div>
        )}

        {/* AI Loading */}
        {step === 1 && aiGenerate.isPending && (
          <div className="form-card ai-loading">
            <div className="sparkle">✨</div>
            <h3>Workvence AI is crafting your project...</h3>
            <p>This usually takes a few seconds</p>
            <div className="ai-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {/* Step 2: Review & Edit */}
        {step === 2 && (
          <div className="form-card review-step">
            <div>
              <h2>Review & Edit Your Project</h2>
              <p className="subtitle">
                Fine-tune the details below before publishing
              </p>
            </div>

            <div className="field-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Give your project a clear title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Description</label>
              <textarea
                placeholder="Detailed description of the project..."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c.toLowerCase()}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>Budget (USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Delivery Time (Days)</label>
                <input
                  type="number"
                  placeholder="e.g. 7"
                  value={form.deliveryTime}
                  onChange={(e) => updateField("deliveryTime", e.target.value)}
                />
              </div>
              <div />
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={postBrief.isPending}
              >
                {postBrief.isPending ? "Publishing..." : "Publish Project"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="form-card confirm-step">
            <div className="success-icon">🎉</div>
            <h2>Project Published Successfully!</h2>
            <p>
              Your project is now live. Sellers can start submitting proposals
              right away.
            </p>
            <div className="nav-links">
              <Link href="/briefs/my-briefs" className="btn-primary">
                View My Projects
              </Link>
              <Link href="/briefs" className="btn-secondary">
                Browse All Projects
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateBriefPage() {
  return (
    <PrivateRoute>
      <CreateBrief />
    </PrivateRoute>
  );
}
