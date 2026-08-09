"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Paperclip,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Wrench,
  Sparkles,
  ShoppingBag,
  X,
  Upload,
  FileText,
} from "lucide-react";
import { supportService } from "@/utils/supportService";

const CATEGORIES = [
  { id: "Account & Billing", label: "Account & Billing", icon: UserCheck, desc: "Login issues, profile settings, verification, or invoice questions." },
  { id: "Content & Listing Violation", label: "Content Violations", icon: ShieldAlert, desc: "Report inappropriate content, package policy violations, or misconduct." },
  { id: "Payment & Escrow", label: "Payment & Escrow", icon: CreditCard, desc: "Escrow funds, pending withdrawals, refunds, or payment gateway issues." },
  { id: "Technical Support", label: "Technical Support", icon: Wrench, desc: "Bugs, broken features, socket disconnects, or website errors." },
  { id: "Platform Feedback", label: "Platform Feedback", icon: Sparkles, desc: "Feature requests, recommendations, or general platform feedback." },
];

export default function CreateSupportTicketPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [category, setCategory] = useState<string>("Technical Support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOrderID, setSelectedOrderID] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; url: string; public_id?: string }[]>([]);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const list = await supportService.getUserOrders();
        setOrders(list);
      } catch (err) {
        console.error("Failed to load user orders for linker:", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingFile(true);
    setError(null);

    try {
      const uploaded = await supportService.uploadFileToCloudinary(file, "support_chat_attachments");
      setAttachments((prev) => [
        ...prev,
        {
          name: uploaded.name,
          url: uploaded.secure_url || uploaded.url,
          public_id: uploaded.public_id,
        },
      ]);
    } catch (err: any) {
      console.error("File upload failed:", err);
      setError("File upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrlAttachment = () => {
    if (!attachmentUrl.trim()) return;
    const name = attachmentUrl.split("/").pop() || `Attachment-${attachments.length + 1}`;
    setAttachments((prev) => [...prev, { name, url: attachmentUrl.trim() }]);
    setAttachmentUrl("");
  };

  const handleRemoveAttachment = async (index: number) => {
    const target = attachments[index];
    if (target?.public_id) {
      supportService.deleteCloudinaryFile(target.public_id).catch(() => null);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Please enter a subject and detailed description for your ticket.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await supportService.createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category,
        orderID: selectedOrderID || undefined,
        attachments,
      });

      const ticketId = res?.id || res?._id || res?.ticket?.id;
      if (ticketId) {
        router.push(`/support/${ticketId}`);
      } else {
        router.push("/support");
      }
    } catch (err: any) {
      console.error("Failed to create support ticket:", err);
      setError(err?.response?.data?.message || err.message || "Failed to create support ticket.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#1dbf73] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Dashboard</span>
        </Link>

        {/* Header Title */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
            Create Support Ticket
          </h1>
          <p className="text-sm text-[#64748b]">
            Submit a support ticket and our customer assistance team will review your inquiry and respond shortly.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Category Selection Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
              1. Select Ticket Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-xl text-left transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-white border-2 border-[#1dbf73] shadow-xs ring-2 ring-[#1dbf73]/10"
                        : "bg-white border border-[#e2e8f0] text-[#1e293b] hover:border-[#1dbf73]/50 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[#1dbf73] text-white" : "bg-[#1dbf73]/10 text-[#1dbf73]"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#0f172a]">{cat.label}</span>
                    </div>
                    <p className="text-[12px] text-[#64748b] leading-relaxed line-clamp-2">
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Optional Order Linker */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#475569] uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-[#1dbf73]" />
              <span>2. Link to an Order (Optional)</span>
            </label>
            <p className="text-xs text-[#64748b]">
              If this inquiry is related to a specific buyer or seller order, selecting it helps support agents inspect the order context immediately.
            </p>
            
            <select
              value={selectedOrderID}
              onChange={(e) => setSelectedOrderID(e.target.value)}
              disabled={loadingOrders}
              className="w-full px-4 py-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 outline-none cursor-pointer transition"
            >
              <option value="">-- No Order Linked --</option>
              {orders.map((ord: any) => (
                <option key={ord.id || ord._id} value={ord.id || ord._id}>
                  {ord.title || `Order #${String(ord.id || ord._id).substring(0, 6)}`} ({ord.price ? `$${ord.price}` : "Active Order"})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Subject and Message */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                3. Ticket Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Briefly state your issue (e.g. Need assistance with order payout)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="Please describe your question or problem in detail. Include any relevant steps or error messages..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 outline-none transition resize-y"
              />
            </div>

            {/* Attachments Section with Direct File Upload & URL option */}
            <div className="space-y-3 pt-4 border-t border-[#e2e8f0]">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#475569] uppercase tracking-wider">
                <Paperclip className="w-4 h-4 text-[#1dbf73]" />
                <span>Ticket Attachments (Optional)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  type="button"
                  disabled={uploadingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1dbf73]/10 text-[#1dbf73] border border-[#1dbf73]/30 hover:bg-[#1dbf73]/20 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload File / Image</span>
                    </>
                  )}
                </button>
              </div>

              {/* Uploaded File Badges */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {attachments.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1dbf73]/10 border border-[#1dbf73]/20 text-[#1dbf73] text-xs font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="hover:text-rose-600 transition ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/support"
              className="px-6 py-3 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] font-semibold text-xs hover:bg-[#f8fafc] transition cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || uploadingFile}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
