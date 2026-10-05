import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { User } from "@/types";

export type AccountStandingStatus = "good" | "warning" | "suspended";

export interface AccountStandingInfo {
  standing: AccountStandingStatus;
  isSuspended: boolean;
  suspensionCount: number;
  suspensionReason: string;
  suspendedAt?: string;
  accessUntil?: string;
  accessDays?: number;
  metricsResetAt?: string;
  isGraceActive: boolean;
  isGraceExpired: boolean;
  graceDaysLeft: number;
  formattedAccessDeadline: string;
  isWarningActive: boolean;
  warningCount: number;
  warningExpiresAt?: string;
  warningDaysLeft: number;
  warningReason: string;
  user: User | null;
}

export function useAccountStanding(): AccountStandingInfo {
  const storeUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Background refresh of user data to catch real-time admin status changes
  const { data: remoteUser } = useQuery({
    queryKey: ["auth-me-standing"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/auth/me");
        const freshUser = data?.user || data;
        if (freshUser && freshUser.id) {
          // Sync with local store
          setUser({ ...storeUser, ...freshUser });
          return freshUser;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: Boolean(storeUser?.id || storeUser?._id),
    staleTime: 1000 * 60, // 1 minute
  });

  const currentUser = remoteUser || storeUser;

  return useMemo(() => {
    if (!currentUser) {
      return {
        standing: "good",
        isSuspended: false,
        suspensionCount: 0,
        suspensionReason: "",
        isGraceActive: false,
        isGraceExpired: false,
        graceDaysLeft: 0,
        formattedAccessDeadline: "",
        isWarningActive: false,
        warningCount: 0,
        warningDaysLeft: 0,
        warningReason: "",
        user: null,
      };
    }

    const isSuspended = Boolean(currentUser.isSuspended);
    const suspensionCount = Number(currentUser.suspensionCount) || (isSuspended ? 1 : 0);
    const suspensionReason =
      currentUser.suspensionReason ||
      "Policy violation or terms of service infringement.";
    const suspendedAt = currentUser.suspendedAt;

    const accessUntil = currentUser.accessUntil;
    const accessDays = typeof currentUser.accessDays === "number" ? currentUser.accessDays : undefined;
    const metricsResetAt = currentUser.metricsResetAt;

    let isGraceActive = false;
    let isGraceExpired = false;
    let graceDaysLeft = 0;
    let formattedAccessDeadline = "";

    if (isSuspended && accessUntil) {
      try {
        const deadline = new Date(accessUntil);
        const deadlineMs = deadline.getTime();
        if (!isNaN(deadlineMs)) {
          const diffMs = deadlineMs - Date.now();
          formattedAccessDeadline = deadline.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          if (diffMs > 0) {
            isGraceActive = true;
            graceDaysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          } else {
            isGraceExpired = true;
          }
        }
      } catch {
        // defensive fallback
      }
    }

    // Warning status calculation
    let isWarningActive = Boolean(currentUser.isWarningActive);
    let warningDaysLeft = 0;
    const warningExpiresAt = currentUser.warningExpiresAt;

    if (warningExpiresAt) {
      try {
        const expDate = new Date(warningExpiresAt);
        const now = new Date();
        const diffMs = expDate.getTime() - now.getTime();
        if (diffMs > 0) {
          isWarningActive = true;
          warningDaysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        } else {
          isWarningActive = false;
        }
      } catch {
        // invalid date format
      }
    }

    const warningCount = Number(currentUser.warningCount) || (isWarningActive ? 1 : 0);
    const warningReason =
      currentUser.warningReason ||
      "Notice regarding marketplace community standards.";

    let standing: AccountStandingStatus = "good";
    if (isSuspended) {
      standing = "suspended";
    } else if (isWarningActive) {
      standing = "warning";
    }

    return {
      standing,
      isSuspended,
      suspensionCount,
      suspensionReason,
      suspendedAt,
      accessUntil,
      accessDays,
      metricsResetAt,
      isGraceActive,
      isGraceExpired,
      graceDaysLeft,
      formattedAccessDeadline,
      isWarningActive,
      warningCount,
      warningExpiresAt,
      warningDaysLeft,
      warningReason,
      user: currentUser,
    };
  }, [currentUser]);
}
