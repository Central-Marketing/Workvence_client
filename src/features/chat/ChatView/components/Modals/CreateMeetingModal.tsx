"use client";

import React from "react";
import { Button } from "@/components";
import Modal from "@/components/ui/Modal/Modal";
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Video Meeting"
      maxWidth="max-w-[450px]"
      isLoading={isCreatingMeeting}
    >
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
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

        <div className="pt-4 flex gap-2">
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
    </Modal>
  );
};
