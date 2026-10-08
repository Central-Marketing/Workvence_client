"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, File02Icon } from "@hugeicons/core-free-icons";
import supportService from "@/utils/supportService";
import { formatFileNameWithExtension } from "../../utils/chatMediaHelpers";

interface MessageAttachmentProps {
  msg: any;
  onImagePreview?: (url: string) => void;
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({
  msg,
  onImagePreview,
}) => {
  const rawUrl = msg.file || (Array.isArray(msg.attachments) && msg.attachments[0]) || null;
  const [resolvedUrl, setResolvedUrl] = useState<string>(rawUrl || "");
  const [imgError, setImgError] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const isAuthenticated = Boolean(
    rawUrl &&
    typeof rawUrl === "string" &&
    rawUrl.includes("cloudinary.com") &&
    rawUrl.includes("/authenticated/")
  );

  // Background auto-resolve for private/authenticated Cloudinary attachments
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && rawUrl) {
      setIsResolving(true);
      const publicId = supportService.extractPublicId(rawUrl);
      const withoutExt = publicId.replace(/\.[^/.]+$/, "");

      (async () => {
        try {
          let signed = await supportService.getSignedAssetUrl(publicId);
          if (!signed && withoutExt !== publicId) {
            signed = await supportService.getSignedAssetUrl(withoutExt);
          }
          if (isMounted && signed) {
            setResolvedUrl(signed);
          }
        } catch (err) {
          console.warn("Failed to auto-resolve signed asset URL:", err);
        } finally {
          if (isMounted) setIsResolving(false);
        }
      })();
    } else {
      setResolvedUrl(rawUrl || "");
    }
    return () => {
      isMounted = false;
    };
  }, [rawUrl, isAuthenticated]);

  if (!rawUrl || typeof rawUrl !== "string") return null;

  const currentUrl = resolvedUrl || rawUrl;
  const hasMsgText = Boolean(msg.description || msg.desc || msg.text || msg.message);

  // Determine file type
  const isPdf =
    /\.pdf($|[?#])/i.test(rawUrl) ||
    rawUrl.toLowerCase().includes(".pdf") ||
    rawUrl.toLowerCase().includes("format=pdf") ||
    msg.fileType?.includes("pdf") ||
    msg.attachment?.type?.includes("pdf");

  const isVideo =
    /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)($|[?#])/i.test(rawUrl) ||
    rawUrl.includes("/video/upload/") ||
    (rawUrl.includes("cloudinary.com") && rawUrl.includes("/video/")) ||
    msg.fileType?.includes("video");

  const isDoc =
    isPdf ||
    /\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)($|[?#])/i.test(rawUrl) ||
    msg.fileType?.includes("document") ||
    /[?&]format=(docx?|xlsx?|pptx?|zip|rar|tar|gz|txt|csv)/i.test(rawUrl);

  const isImage =
    !isDoc &&
    !isVideo &&
    !imgError &&
    (/\.(png|jpe?g|gif|webp|svg|bmp|avif)($|[?#])/i.test(rawUrl) ||
      /[?&]format=(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(rawUrl) ||
      (rawUrl.includes("cloudinary.com") && rawUrl.includes("/image/") && !isPdf && !isDoc) ||
      msg.fileType?.includes("image"));

  const rawFileName = rawUrl.split("/").pop()?.split("?")[0] || "Attachment";
  const fileName = formatFileNameWithExtension(rawFileName, currentUrl, null, msg);

  // Always open in a new tab when clicked (for documents and files)
  const handleOpenInNewTab = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If authenticated Cloudinary asset and signed URL hasn't arrived or doesn't have signature query params
    if (isAuthenticated && (!resolvedUrl || resolvedUrl === rawUrl || !resolvedUrl.includes("?"))) {
      const toastId = toast.loading("Opening secure attachment in new tab...");
      const publicId = supportService.extractPublicId(rawUrl);
      const withoutExt = publicId.replace(/\.[^/.]+$/, "");
      try {
        let signed = await supportService.getSignedAssetUrl(publicId);
        if (!signed && withoutExt !== publicId) {
          signed = await supportService.getSignedAssetUrl(withoutExt);
        }
        if (signed) {
          toast.dismiss(toastId);
          window.open(signed, "_blank", "noopener,noreferrer");
          return;
        }
      } catch (err) {
        console.warn("Could not retrieve signed URL:", err);
      }
      toast.dismiss(toastId);
    }

    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  // Image attachment view - Opens directly in lightbox preview modal without opening new tab
  if (isImage && !imgError) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onImagePreview) {
            onImagePreview(currentUrl);
          } else {
            handleOpenInNewTab(e);
          }
        }}
        className={`mt-1 overflow-hidden rounded-[6px] border border-slate-200/90 shadow-sm max-w-[280px] bg-slate-50 cursor-pointer group hover:border-[#327C73]/50 transition-all ${
          !hasMsgText ? "mb-5" : "mb-1.5"
        }`}
        title="Click to preview image"
      >
        <img
          src={currentUrl}
          alt={fileName}
          onError={() => setImgError(true)}
          className="w-full max-h-[220px] object-cover group-hover:scale-[1.02] transition-transform duration-200"
        />
      </div>
    );
  }

  // Video attachment view
  if (isVideo) {
    return (
      <div
        className={`mt-1 overflow-hidden rounded-[6px] border border-slate-200 shadow-sm max-w-[340px] bg-black ${
          !hasMsgText ? "mb-5" : "mb-1.5"
        }`}
      >
        <video
          src={currentUrl}
          controls
          preload="metadata"
          className="w-full max-h-[280px] rounded-[6px] object-contain"
        />
      </div>
    );
  }

  // Document, PDF, or Fallback view (Clickable -> Opens in new tab)
  return (
    <div
      onClick={handleOpenInNewTab}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 mt-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-[6px] transition-all border border-slate-200/90 text-xs font-semibold cursor-pointer select-none max-w-[280px] group shadow-2xs ${
        !hasMsgText ? "mb-5" : "mb-1.5"
      }`}
      title="Click to open file in a new tab"
    >
      <div className="w-8 h-8 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
        {isPdf ? (
          <HugeiconsIcon icon={Pdf01Icon} size={18} className="text-rose-500" />
        ) : (
          <HugeiconsIcon icon={File02Icon} size={18} className="text-[#0D6D5F]" />
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="truncate text-slate-900 text-[12.5px] font-medium leading-tight group-hover:text-[#327C73] transition-colors">
          {fileName}
        </span>
        <span className="text-[10.5px] text-slate-400 font-normal mt-0.5 flex items-center gap-1">
          <span>Click to open in new tab</span>
        </span>
      </div>
      <span className="text-slate-400 group-hover:text-slate-700 text-sm shrink-0">
        {isResolving ? "⏳" : "↗"}
      </span>
    </div>
  );
};
