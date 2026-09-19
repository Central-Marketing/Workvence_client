/**
 * Formats bytes or raw size strings into clean, human-readable file sizes (e.g. "file size 200mb", "file size 50kb").
 * Returns null if no valid size data is available so false or guessed data is never shown.
 */
export const formatFileSize = (bytesOrStr: any): string | null => {
  if (!bytesOrStr) return null;
  if (typeof bytesOrStr === 'string') {
    if (/(kb|mb|gb|bytes)/i.test(bytesOrStr)) {
      return `file size ${bytesOrStr.trim().toLowerCase()}`;
    }
    const num = parseFloat(bytesOrStr);
    if (!isNaN(num) && num > 0) {
      bytesOrStr = num;
    } else {
      return null;
    }
  }
  if (typeof bytesOrStr === 'number' && bytesOrStr > 0) {
    if (bytesOrStr >= 1024 * 1024) {
      return `file size ${(bytesOrStr / (1024 * 1024)).toFixed(bytesOrStr >= 10 * 1024 * 1024 ? 0 : 1)}mb`;
    }
    if (bytesOrStr >= 1024) {
      return `file size ${(bytesOrStr / 1024).toFixed(0)}kb`;
    }
    return `file size ${bytesOrStr}b`;
  }
  return null;
};
