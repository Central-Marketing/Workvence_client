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
import { Button, CustomSelect, CustomSelectOption } from "@/components/ui";

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
    <div className="min-h-screen bg-[#f8fafc] pt-10 pb-[80px] min-[1400px]:pb-[100px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Link */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#327C73] transition font-sf-pro"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Dashboard</span>
        </Link>

        {/* Header Title */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight font-sf-pro">
            Create Support Ticket
          </h1>
          <p className="text-sm text-[#64748b] font-inter">
            Submit a support ticket and our customer assistance team will review your inquiry and respond shortly.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. Category Selection Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider font-sf-pro">
              1. Select Ticket Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <Button
                    key={cat.id}
                    type="button"
                    variant="outline"
                    radius="xl"
                    fullWidth
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 text-left justify-start flex-col items-start space-y-2.5 transition-all h-auto min-h-0 ${isSelected
                      ? "bg-white border-2 border-[#327C73] shadow-xs ring-2 ring-[#327C73]/10"
                      : "bg-white border border-[#e2e8f0] text-[#1e293b] hover:border-[#327C73]/50 hover:shadow-xs"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[#327C73] text-white" : "bg-[#327C73]/10 text-[#327C73]"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#0f172a] font-sf-pro">{cat.label}</span>
                    </div>
                    <p className="text-[12px] text-[#64748b] leading-relaxed line-clamp-2 font-inter font-normal">
                      {cat.desc}
                    </p>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 2. Optional Order Linker */}
          <div className="bg-white p-6 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#475569] uppercase tracking-wider font-sf-pro">
              <ShoppingBag className="w-4 h-4 text-[#327C73]" />
              <span>2. Link to an Order (Optional)</span>
            </label>
            <p className="text-xs text-[#64748b] font-inter">
              If this inquiry is related to a specific buyer or seller order, selecting it helps support agents inspect the order context immediately.
            </p>

            <CustomSelect
              size="md"
              variant="filled"
              disabled={loadingOrders}
              options={[
                { value: "", label: "-- No Order Linked --" },
                ...orders.map((ord: any) => ({
                  value: ord.id || ord._id,
                  label: `${ord.title || `Order #${String(ord.id || ord._id).substring(0, 6)}`} (${ord.price ? `$${ord.price}` : "Active Order"})`,
                })),
              ]}
              value={selectedOrderID}
              onChange={(val) => setSelectedOrderID(String(val))}
              placeholder="-- No Order Linked --"
              ariaLabel="Link to an Order"
            />
          </div>

          {/* 3. Subject and Message */}
          <div className="bg-white p-6 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-medium text-gray-700 font-sf-pro">
                3. Ticket Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Briefly state your issue (e.g. Need assistance with order payout)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors font-inter"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-medium text-gray-700 font-sf-pro">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="Please describe your question or problem in detail. Include any relevant steps or error messages..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors resize-y font-inter"
              />
            </div>

            {/* Attachments Section with Direct File Upload & URL option */}
            <div className="space-y-3 pt-4 border-t border-[#e2e8f0]">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#475569] uppercase tracking-wider font-sf-pro">
                <Paperclip className="w-4 h-4 text-[#327C73]" />
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

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  radius="fiverr"
                  disabled={uploadingFile}
                  isLoading={uploadingFile}
                  loadingText="Uploading to Cloudinary..."
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="w-4 h-4" />}
                  className="bg-[#327C73]/10 text-[#327C73] border-[#327C73]/30 hover:bg-[#327C73]/20 text-xs font-bold font-sf-pro shadow-none"
                >
                  Upload File / Image
                </Button>
              </div>

              {/* Uploaded File Badges */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {attachments.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#327C73]/10 border border-[#327C73]/20 text-[#327C73] text-xs font-medium font-inter"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{att.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        radius="full"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="hover:text-rose-600 transition ml-1 p-0 w-4 h-4 h-auto min-h-0 border-none shadow-none hover:bg-transparent"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
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
              className="px-6 py-3 rounded-[6px] border border-[#e2e8f0] bg-white text-[#475569] font-semibold text-xs hover:bg-[#f8fafc] transition cursor-pointer font-sf-pro"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              variant="brand"
              size="md"
              radius="fiverr"
              disabled={submitting || uploadingFile}
              isLoading={submitting}
              loadingText="Submitting Ticket..."
              leftIcon={<Send className="w-4 h-4" />}
              className="px-7 py-3 text-xs font-semibold shadow-sm font-sf-pro"
            >
              Submit Ticket
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}
