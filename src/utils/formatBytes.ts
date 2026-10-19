/**
 * Formats bytes into a human-readable string (e.g. 1024 -> "1 KB", 48291040 -> "46.1 MB")
 */
export function formatBytes(bytes?: number | string, decimals: number = 1): string {
  if (bytes === undefined || bytes === null) return '-';
  const numeric = typeof bytes === 'number' ? bytes : parseFloat(bytes);
  if (isNaN(numeric) || numeric <= 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(numeric) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);

  return `${parseFloat((numeric / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}

export default formatBytes;
