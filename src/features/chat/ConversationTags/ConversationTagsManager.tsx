"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiTag, FiPlus, FiX, FiLock, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PRESET_TAGS, sanitizeTags, updateConversationTagsApi } from "@/utils/chatHelpers";
import { ConversationTagBadge } from "./ConversationTagBadge";
import { Button } from "@/components/ui";

interface ConversationTagsManagerProps {
  conversationId: string;
  tags?: string[];
  mode?: "popover" | "card";
  isOpen?: boolean;
  onClose?: () => void;
  onTagsUpdated?: (tags: string[]) => void;
}

export const ConversationTagsManager: React.FC<ConversationTagsManagerProps> = ({
  conversationId,
  tags = [],
  mode = "card",
  isOpen = false,
  onClose,
  onTagsUpdated,
}) => {
  const queryClient = useQueryClient();
  const [currentTags, setCurrentTags] = useState<string[]>(tags || []);
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external tags prop
  useEffect(() => {
    setCurrentTags(tags || []);
  }, [tags]);

  // Click outside to close if mode is popover
  useEffect(() => {
    if (mode !== "popover" || !isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [mode, isOpen, onClose]);

  // Focus input when opened as popover
  useEffect(() => {
    if (mode === "popover" && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode, isOpen]);

  const saveTags = async (nextTags: string[]) => {
    const sanitized = sanitizeTags(nextTags);
    const prevTags = currentTags;
    setCurrentTags(sanitized);

    // Optimistically update conversation cache in React Query
    queryClient.setQueryData(["conversations"], (oldData: any) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map((c: any) => {
        const cId = String(c.uuid || c.conversationID || c._id || c.id || "");
        if (cId === String(conversationId) || c._id === String(conversationId)) {
          return { ...c, tags: sanitized };
        }
        return c;
      });
    });

    queryClient.setQueryData(["conversation-detail", conversationId], (oldData: any) => {
      if (!oldData || typeof oldData !== "object") return oldData;
      return { ...oldData, tags: sanitized };
    });

    onTagsUpdated?.(sanitized);

    setIsSaving(true);
    try {
      await updateConversationTagsApi(conversationId, sanitized);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err: any) {
      setCurrentTags(prevTags);
      onTagsUpdated?.(prevTags);
      toast.error(err?.response?.data?.message || "Failed to update tags");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;

    if (trimmed.length > 50) {
      toast.error("Tag must not exceed 50 characters");
      return;
    }

    const lowerKey = trimmed.toLowerCase();
    if (currentTags.some((t) => t.toLowerCase() === lowerKey)) {
      toast.error("This tag has already been added");
      setInputValue("");
      return;
    }

    if (currentTags.length >= 20) {
      toast.error("Maximum 20 tags per conversation");
      return;
    }

    const nextTags = [...currentTags, trimmed];
    setInputValue("");
    saveTags(nextTags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = currentTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    saveTags(nextTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Escape" && mode === "popover") {
      onClose?.();
    }
  };

  const content = (
    <div className="flex flex-col gap-3">
      {/* Header & Lock notice */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <FiTag className="w-3.5 h-3.5 text-teal-700" />
          <span>Private Tags</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({currentTags.length}/20)
          </span>
        </div>
        <div
          className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
          title="Only you can see these tags. The other party cannot see or edit them."
        >
          <FiLock className="w-2.5 h-2.5 text-slate-400" />
          <span className="font-normal text-[10px]">Private to you</span>
        </div>
      </div>

      {/* Existing tags list */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
        {currentTags.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No tags assigned yet</span>
        ) : (
          currentTags.map((t) => (
            <ConversationTagBadge
              key={t}
              tag={t}
              size={mode === "popover" ? "xs" : "sm"}
              onRemove={isSaving ? undefined : handleRemoveTag}
            />
          ))
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          maxLength={50}
          placeholder="New tag label..."
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving || currentTags.length >= 20}
          className="flex-1 h-[32px] min-h-[32px] max-h-[32px] box-border bg-white border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 rounded-[6px] px-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
        />
        <Button
          type="button"
          variant="dark"
          size="xs"
          radius="md"
          onClick={() => handleAddTag(inputValue)}
          disabled={!inputValue.trim() || isSaving || currentTags.length >= 20}
          isLoading={isSaving}
          className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border px-3 !text-xs font-semibold shrink-0 !py-0 flex items-center justify-center leading-none"
        >
          Add
        </Button>
      </div>

      {/* Quick Preset Tags */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 font-medium">Quick suggestions:</span>
        <div className="flex flex-wrap gap-1">
          {PRESET_TAGS.map((preset) => {
            const isAssigned = currentTags.some((t) => t.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (isAssigned) {
                    handleRemoveTag(preset);
                  } else {
                    handleAddTag(preset);
                  }
                }}
                disabled={isSaving}
                className={`text-[11px] px-2 py-0.5 rounded-full border border-[rgba(0,0,0,0.10)] bg-white transition-all flex items-center gap-1 ${
                  isAssigned
                    ? "!border-[rgba(0,0,0,0.25)] text-teal-800 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {isAssigned && <FiCheck className="w-2.5 h-2.5 text-teal-700" />}
                <span>{preset}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (mode === "popover") {
    if (!isOpen) return null;
    return (
      <div
        ref={containerRef}
        className="absolute top-full right-0 mt-2 w-[280px] sm:w-[320px] bg-white border border-slate-200 rounded-[8px] p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Organize Conversation</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            aria-label="Close"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
        {content}
      </div>
    );
  }

  // Card mode (for right sidebar)
  return (
    <div
      ref={containerRef}
      className="bg-white rounded-[6px] p-4 border border-slate-200/80 shadow-xs flex flex-col gap-2"
    >
      {content}
    </div>
  );
};

export default ConversationTagsManager;
