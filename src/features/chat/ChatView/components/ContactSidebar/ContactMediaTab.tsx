"use client";

import React from "react";
import { Eye, Download } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, File02Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components";
import { isImageFile, isPdfFile } from "../../utils/chatMediaHelpers";
import { MediaFileItem } from "../../types";

interface ContactMediaTabProps {
  conversationMediaFiles: MediaFileItem[];
  onPreviewMedia: (file: MediaFileItem) => void;
  onDownloadMedia: (file: MediaFileItem) => void;
}

export const ContactMediaTab: React.FC<ContactMediaTabProps> = ({
  conversationMediaFiles,
  onPreviewMedia,
  onDownloadMedia,
}) => {
  return (
    <div className="flex flex-col gap-2.5 pt-0.5">
      {conversationMediaFiles.length > 0 ? (
        conversationMediaFiles.map((file, idx) => {
          const isPdf = isPdfFile(file);
          const isImage = !isPdf && isImageFile(file);

          return (
            <div
              key={idx}
              className="bg-white rounded-[16px] px-3.5 py-3 flex items-center justify-between border border-slate-100/90 shadow-2xs hover:border-slate-200 transition-all group"
            >
              <div
                className="min-w-0 flex-1 pr-3 cursor-pointer flex items-center gap-3"
                onClick={() => {
                  if (isImage) {
                    onPreviewMedia(file);
                  } else {
                    onDownloadMedia(file);
                  }
                }}
                title={isImage ? `Preview ${file.name}` : `Download ${file.name}`}
              >
                {/* Left side File Type Icon */}
                <div className="w-10 h-10 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
                  {isPdf ? (
                    <HugeiconsIcon icon={Pdf01Icon} size={22} className="text-rose-500" />
                  ) : isImage ? (
                    <HugeiconsIcon icon={Image01Icon} size={22} className="text-blue-500" />
                  ) : (
                    <HugeiconsIcon icon={File02Icon} size={22} className="text-[#0D6D5F]" />
                  )}
                </div>

                {/* Beside icon: File Name and below File Size */}
                <div className="min-w-0 flex-1">
                  <h4
                    className="font-bold text-gray-950 text-[13.5px] leading-tight truncate font-sf-pro group-hover:text-[#0E3834] transition-colors"
                    title={file.name}
                  >
                    {file.name}
                  </h4>
                  {file.sizeText ? (
                    <span className="text-[11.5px] text-gray-400 font-normal mt-0.5 block font-sf-pro">
                      {file.sizeText}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    radius="xl"
                    onClick={() => onPreviewMedia(file)}
                    className="w-9 h-9 rounded-[10px] border border-[#E5E7EB] hover:border-[#0E3834] hover:bg-slate-50 text-[#5F71B0] hover:text-[#0E3834] transition-all shrink-0 shadow-2xs active:scale-95 cursor-pointer"
                    title={`Preview ${file.name}`}
                    aria-label={`Preview ${file.name}`}
                    icon={<Eye className="w-4 h-4" strokeWidth={1.8} />}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  radius="xl"
                  onClick={() => onDownloadMedia(file)}
                  className="w-9 h-9 rounded-[10px] border border-[#E5E7EB] hover:border-[#0E3834] hover:bg-slate-50 text-[#5F71B0] hover:text-[#0E3834] transition-all shrink-0 shadow-2xs active:scale-95 cursor-pointer"
                  title={`Download ${file.name}`}
                  aria-label={`Download ${file.name}`}
                  icon={<Download className="w-4 h-4" strokeWidth={1.8} />}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-[16px] p-6 text-center border border-slate-100/90 shadow-2xs">
          <p className="text-xs text-slate-400 font-normal m-0">No media shared yet</p>
        </div>
      )}
    </div>
  );
};
