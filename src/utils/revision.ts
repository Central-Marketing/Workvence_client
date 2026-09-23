/**
 * Utility function to sanitize and parse revision counts into non-negative integers.
 */
export const parseRevisionNumber = (val: any, fallback = 0): number => {
  if (val === undefined || val === null || val === "") return fallback;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) || parsed < 0 ? fallback : parsed;
};
