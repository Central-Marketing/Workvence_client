"use client";

import React from "react";
import { Eye, Download } from "lucide-react";
import { Button } from "@/components";
import { isImageFile } from "../../utils/chatMediaHelpers";
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
        conversationMediaFiles.map((file, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[16px] px-4 py-3.5 flex items-center justify-between border border-slate-100/90 shadow-2xs hover:border-slate-200 transition-all group"
          >
            <div
              className="min-w-0 flex-1 pr-3 cursor-pointer"
              onClick={() => {
                if (isImageFile(file)) {
                  onPreviewMedia(file);
                } else {
                  onDownloadMedia(file);
                }
              }}
              title={isImageFile(file) ? `Preview ${file.name}` : `Download ${file.name}`}
            >
              <h4
                className="font-bold text-gray-950 text-[13.5px] leading-tight truncate font-sf-pro group-hover:text-[#0E3834] transition-colors"
                title={file.name}
              >
                {file.name}
              </h4>
              {file.sizeText ? (
                <span className="text-xs text-gray-400 font-normal mt-1 block">
                  {file.sizeText}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isImageFile(file) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  radius="xl"
                  onClick={() => onPreviewMedia(file)}
                  className="w-10 h-10 rounded-[12px] border border-[#E5E7EB] hover:border-[#0E3834] hover:bg-slate-50 text-[#5F71B0] hover:text-[#0E3834] transition-all shrink-0 shadow-2xs active:scale-95"
                  title={`Preview ${file.name}`}
                  aria-label={`Preview ${file.name}`}
                  icon={<Eye className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                radius="xl"
                onClick={() => onDownloadMedia(file)}
                className="w-10 h-10 rounded-[12px] border border-[#E5E7EB] hover:border-[#0E3834] hover:bg-slate-50 text-[#5F71B0] hover:text-[#0E3834] transition-all shrink-0 shadow-2xs active:scale-95"
                title={`Download ${file.name}`}
                aria-label={`Download ${file.name}`}
                icon={<Download className="w-[18px] h-[18px]" strokeWidth={1.8} />}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-[16px] p-6 text-center border border-slate-100/90 shadow-2xs">
          <p className="text-xs text-slate-400 font-normal m-0">No media shared yet</p>
        </div>
      )}
    </div>
  );
};
