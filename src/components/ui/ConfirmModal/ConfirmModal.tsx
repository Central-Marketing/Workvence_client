"use client";

import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { Button } from '../Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 text-red-500 border-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
          Icon: AlertTriangle,
        };
      case 'info':
        return {
          iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
          confirmBtn: 'bg-brand-green hover:bg-[#059669] text-white shadow-emerald-500/20',
          Icon: HelpCircle,
        };
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
          Icon: AlertTriangle,
        };
    }
  };

  const { iconBg, confirmBtn, Icon } = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="full"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close"
          icon={<X size={20} />}
        />

        {/* Icon Header */}
        <div className={`w-14 h-14 rounded-[6px] flex items-center justify-center mb-4 border ${iconBg}`}>
          <Icon size={26} strokeWidth={2} />
        </div>

        {/* Title & Message */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="xl"
            className="flex-1 border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : variant === 'info' ? 'brand' : 'primary'}
            size="md"
            radius="xl"
            className={`flex-1 font-semibold text-sm shadow-md ${confirmBtn}`}
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
