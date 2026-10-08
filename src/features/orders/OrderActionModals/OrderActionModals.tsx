"use client";

import React, { useState } from 'react';
import { Button, Modal } from '@/components/ui';

interface RevisionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please describe the changes or revision details.');
      return;
    }
    setError('');
    onSubmit(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Revision"
      isLoading={isLoading}
      footer={
        <>
          <Button
            type="button"
            variant="soft"
            size="md"
            radius="fiverr"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="dark"
            size="md"
            radius="fiverr"
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            isLoading={isLoading}
            loadingText="Submitting..."
            className="cursor-pointer"
          >
            Submit Request
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs sm:text-sm text-slate-500 font-sf-pro">
          Provide clear instructions for the seller
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5 block font-sf-pro">
              Revision Details
            </label>
            <textarea
              rows={4}
              placeholder="Describe what needs to be changed or modified..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white outline-none text-gray-900 text-sm placeholder:text-[#868686] placeholder:font-normal resize-y transition-colors font-sf-pro"
            />
            {error && <p className="text-xs text-red-500 font-medium mt-1 font-sf-pro">{error}</p>}
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface ExtensionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onSubmit: (days: number, reason: string) => void;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  isOpen,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const [days, setDays] = useState('1');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDays = parseInt(days, 10);
    if (isNaN(parsedDays) || parsedDays <= 0) {
      setError('Please enter a valid number of extension days (minimum 1).');
      return;
    }
    if (!reason.trim()) {
      setError('Please explain why extra delivery time is needed.');
      return;
    }
    setError('');
    onSubmit(parsedDays, reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Delivery Extension"
      isLoading={isLoading}
      footer={
        <>
          <Button
            type="button"
            variant="soft"
            size="md"
            radius="fiverr"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="dark"
            size="md"
            radius="fiverr"
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            isLoading={isLoading}
            loadingText="Submitting..."
            className="cursor-pointer"
          >
            Submit Extension
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs sm:text-sm text-slate-500 font-sf-pro">
          Request extra time from the buyer
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5 block font-sf-pro">
              Additional Delivery Days
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 2"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full h-10 px-3.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white outline-none text-gray-900 text-sm placeholder:text-[#868686] placeholder:font-normal transition-colors font-sf-pro"
            />
          </div>

          <div>
            <label className="text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5 block font-sf-pro">
              Reason for Extension
            </label>
            <textarea
              rows={3}
              placeholder="Explain why extra time is needed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white outline-none text-gray-900 text-sm placeholder:text-[#868686] placeholder:font-normal resize-y transition-colors font-sf-pro"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium font-sf-pro">{error}</p>}
        </form>
      </div>
    </Modal>
  );
};

