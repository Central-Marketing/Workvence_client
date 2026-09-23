export interface UserStatusResult {
  isOnline: boolean;
  statusText: string;
  lastSeenText: string;
  displayText: string;
}

/**
 * Calculates real-time online/offline status based on lastActiveAt timestamp and explicit online flags.
 *
 * @param lastActiveAt - ISO timestamp or Date when user was last active
 * @param isExplicitOnline - Optional explicit boolean (e.g. from real-time socket connection)
 * @param thresholdMinutes - Max minutes from now to still consider user online (default: 10 minutes)
 */
export const getOnlineStatus = (
  lastActiveAt?: string | Date | null,
  isExplicitOnline?: boolean,
  thresholdMinutes: number = 10
): UserStatusResult => {
  if (isExplicitOnline) {
    return {
      isOnline: true,
      statusText: "Online",
      lastSeenText: "Just now",
      displayText: "Online",
    };
  }

  if (!lastActiveAt) {
    return {
      isOnline: false,
      statusText: "Offline",
      lastSeenText: "",
      displayText: "Offline",
    };
  }

  const date = new Date(lastActiveAt);
  const time = date.getTime();
  if (isNaN(time)) {
    return {
      isOnline: false,
      statusText: "Offline",
      lastSeenText: "",
      displayText: "Offline",
    };
  }

  const now = Date.now();
  const diffMs = now - time;
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes <= thresholdMinutes) {
    return {
      isOnline: true,
      statusText: "Online",
      lastSeenText: "Just now",
      displayText: "Online",
    };
  }

  // Format relative last seen text (e.g., "12 minutes ago")
  let lastSeenText = "";
  if (diffMinutes < 60) {
    lastSeenText = `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    lastSeenText = `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (diffMinutes < 2880) {
    lastSeenText = "yesterday";
  } else {
    const days = Math.floor(diffMinutes / 1440);
    if (days < 30) {
      lastSeenText = `${days} day${days === 1 ? "" : "s"} ago`;
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      lastSeenText = `${date.getDate()} ${monthNames[date.getMonth()]}`;
    }
  }

  return {
    isOnline: false,
    statusText: "Offline",
    lastSeenText,
    displayText: `Offline · Last seen ${lastSeenText}`,
  };
};

export default getOnlineStatus;
