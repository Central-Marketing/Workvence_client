"use client";

import React from "react";
import AuthModal from "@/features/auth/AuthModal/AuthModal";
import { useAuthModalStore } from "@/store/authModalStore";

const GlobalAuthModal: React.FC = () => {
  const {
    isOpen,
    mode,
    email,
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

  if (!isOpen) return null;

  return (
    <React.Suspense fallback={null}>
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        initialMode={mode}
        initialEmail={email}
        defaultIsSeller={defaultIsSeller}
        redirectUrl={redirectUrl}
        onSuccess={handleSuccess}
      />
    </React.Suspense>
  );
};

export default GlobalAuthModal;

