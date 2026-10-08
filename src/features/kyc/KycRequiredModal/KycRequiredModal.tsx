"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "@/components/ui";

interface KycRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const KycRequiredModal: React.FC<KycRequiredModalProps> = ({
  isOpen,
  onClose,
  title = "Identity Verification Required",
  description = "To withdraw your earnings, you must complete a one-time identity verification.",
}) => {
  const router = useRouter();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            type="button"
            variant="soft"
            size="md"
            radius="fiverr"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="dark"
            size="md"
            radius="fiverr"
            onClick={() => {
              onClose();
              router.push("/kyc");
            }}
            className="cursor-pointer"
          >
            Verify Identity Now
          </Button>
        </>
      }
    >
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sf-pro">
        {description}
      </p>
    </Modal>
  );
};

export default KycRequiredModal;

