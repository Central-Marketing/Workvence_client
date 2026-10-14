"use client";

import React from "react";
import { AccountStandingBanner } from "./AccountStandingBanner";

interface AccountStandingCardProps {
  className?: string;
}

export const AccountStandingCard: React.FC<AccountStandingCardProps> = ({ className = "" }) => {
  return <AccountStandingBanner className={className} />;
};
