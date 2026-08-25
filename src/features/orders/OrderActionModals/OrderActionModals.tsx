"use client";

import React, { useState } from 'react';
import { Calendar, FileText, X } from 'lucide-react';

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

  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <FileText size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Request Revision</h3>
            <p className="text-xs text-slate-500">Provide clear instructions for the seller</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
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
              className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-800 text-sm resize-y transition-all"
            />
            {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-green font-semibold text-sm text-white shadow-md shadow-emerald-500/20 hover:bg-[#059669] transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
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

  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Calendar size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Request Delivery Extension</h3>
            <p className="text-xs text-slate-500">Request extra time from the buyer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Additional Delivery Days
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 2"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-800 text-sm transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Reason for Extension
            </label>
            <textarea
              rows={3}
              placeholder="Explain why extra time is needed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-800 text-sm resize-y transition-all"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-green font-semibold text-sm text-white shadow-md shadow-emerald-500/20 hover:bg-[#059669] transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {isLoading ? 'Submitting...' : 'Submit Extension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
