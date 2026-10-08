"use client";

import React from "react";
import { RiAddLine } from "react-icons/ri";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, File02Icon } from "@hugeicons/core-free-icons";
import { Loader, Button } from "@/components";
import { AIPolishButton } from "@/components/ui";
import { isPdfFile } from "../../utils/chatMediaHelpers";

interface MessageComposerProps {
  attachment: any;
  isUploadingAttachment: boolean;
  onFileAttachmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: () => void;
  messageText: string;
  setMessageText: (text: string) => void;
  isPolishing: boolean;
  setIsPolishing: (polishing: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (e: any) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: (e?: any) => void;
  msgsError: any;
  isPending: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  attachment,
  isUploadingAttachment,
  onFileAttachmentChange,
  onRemoveAttachment,
  messageText,
  setMessageText,
  isPolishing,
  setIsPolishing,
  textareaRef,
  fileInputRef,
  onInputChange,
  onKeyDown,
  onSend,
  msgsError,
  isPending,
}) => {
  return (
    <div className="p-4 sm:px-5 sm:py-4 bg-[#f0f0f0] relative max-md:p-3 shrink-0">
      {attachment && (
        <div className="flex items-center gap-3 mb-3 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-[6px] border border-slate-200 shadow-sm max-w-sm">
          {attachment.type?.includes("image") ||
            /\.(png|jpe?g|gif|webp|svg)/i.test(attachment.name) ||
            attachment.url?.includes("/image/upload/") ? (
            <div className="relative group flex-shrink-0">
              <img
                src={attachment.previewUrl || attachment.url}
                alt="Preview"
                className="w-16 h-16 rounded-[6px] object-cover border border-slate-300 shadow-xs"
              />
            </div>
          ) : attachment.type?.includes("video") ||
            /\.(mp4|webm|ogg|mov|mkv|avi)/i.test(attachment.name) ||
            attachment.url?.includes("/video/upload/") ? (
            <div className="w-16 h-16 bg-black rounded-[6px] overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-slate-300 shadow-xs">
              <video
                src={attachment.previewUrl || attachment.url}
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">
                ▶
              </span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center flex-shrink-0 shadow-2xs">
              {isPdfFile({ name: attachment.name, url: attachment.url || attachment.previewUrl }) ? (
                <HugeiconsIcon icon={Pdf01Icon} size={24} className="text-rose-500" />
              ) : (
                <HugeiconsIcon icon={File02Icon} size={24} className="text-[#0D6D5F]" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {attachment.name}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : "Attachment"} •
              Ready to send
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            onClick={onRemoveAttachment}
            className="w-6 h-6 min-h-0 !p-0 text-slate-400 hover:text-red-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Remove attachment from server"
            aria-label="Remove attachment"
          >
            ✕
          </Button>
        </div>
      )}

      {!msgsError && (
        <form
          onSubmit={onSend}
          className="relative flex items-end gap-2 p-2 bg-white border border-gray-200 rounded-[6px] shadow-sm max-md:px-2 max-md:py-1.5 max-md:gap-1.5"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileAttachmentChange}
            className="hidden"
          />

          {/* Plus / Attach Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="xl"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAttachment}
            title="Attach file or image"
            aria-label="Attach file or image"
            icon={isUploadingAttachment ? <Loader size={18} /> : <RiAddLine className="w-5 h-5" />}
          />



          {/* Message Textarea */}
          <textarea
            ref={textareaRef}
            placeholder="Message"
            value={messageText}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            disabled={isPolishing}
            rows={1}
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-sm py-1.5 px-1 min-h-[36px] max-h-32 overflow-y-auto scrollbar-hide scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          />

          {/* AI Polish Button */}
          <AIPolishButton
            text={messageText}
            onSuccess={(polishedText) => setMessageText(polishedText)}
            onStateChange={setIsPolishing}
            className="mb-0.5"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={
              (!messageText.trim() && !attachment?.url) ||
              isUploadingAttachment ||
              isPending
            }
            aria-label="Send message"
            title="Send message"
            className="w-[28px] h-[28px] rounded-[60px] bg-[var(--Foundation-Grey-grey-900,#1F1F1F)] hover:bg-[#111111] active:scale-95 disabled:opacity-30 disabled:hover:bg-[var(--Foundation-Grey-grey-900,#1F1F1F)] disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-sm mb-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 5.5V19"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 11C18 11 13.5811 5.00001 12 5C10.4188 4.99999 6 11 6 11"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
};
