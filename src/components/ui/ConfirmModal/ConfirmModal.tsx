"use client";

import React from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';

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
  variant,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
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
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'dark'}
            size="md"
            radius="fiverr"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Processing..."
            className="cursor-pointer"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sf-pro">
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmModal;

