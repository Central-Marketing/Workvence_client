"use client";

import React from "react";
import { Button } from "@/components";
import { RiVideoChatLine } from "react-icons/ri";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle: string;
  setMeetingTitle: (val: string) => void;
  isCreatingMeeting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  meetingTitle,
  setMeetingTitle,
  isCreatingMeeting,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={() => !isCreatingMeeting && onClose()}
    >
      <div
        className="w-[92%] max-w-md p-6 bg-white rounded-[6px] shadow-2xl border border-slate-100 max-h-[calc(100vh-40px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[6px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
              <RiVideoChatLine className="w-5 h-5 text-brand-green" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Create Video Meeting</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            disabled={isCreatingMeeting}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold"
            aria-label="Close modal"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Meeting Topic / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Freelancer Job Discussion"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-slate-200 text-sm focus:outline-none focus:border-brand-green bg-slate-50/50"
              required
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              A dedicated video room will be created and instantly sent to the buyer in this chat.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="submit"
              variant="dark"
              size="md"
              radius="fiverr"
              disabled={isCreatingMeeting}
              isLoading={isCreatingMeeting}
              leftIcon={<RiVideoChatLine className="w-4 h-4" />}
              className="flex-1 font-semibold shadow-sm"
            >
              Create & Send Link
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              radius="fiverr"
              disabled={isCreatingMeeting}
              onClick={onClose}
              className="font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
