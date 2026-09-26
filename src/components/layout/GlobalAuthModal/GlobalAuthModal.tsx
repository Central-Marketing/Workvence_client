"use client";

import React from "react";
import AuthModal from "@/features/auth/AuthModal/AuthModal";
import { useAuthModalStore } from "@/store/authModalStore";

const GlobalAuthModal: React.FC = () => {
  const {
    isOpen,
    mode,
    defaultIsSeller,
    redirectUrl,
    onSuccessCallback,
    closeAuthModal,
  } = useAuthModalStore();

  const handleSuccess = (user: any) => {
    if (onSuccessCallback) {
      onSuccessCallback(user);
    }
    closeAuthModal();
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={closeAuthModal}
      initialMode={mode}
      defaultIsSeller={defaultIsSeller}
      redirectUrl={redirectUrl}
      onSuccess={handleSuccess}
    />
  );
};

export default GlobalAuthModal;
