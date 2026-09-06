/**
 * Utility to conditionally join class names.
 * Lightweight alternative to the `clsx` package.
 */
export function cn(...args) {
  return args
    .flat()
    .filter((x) => typeof x === 'string' && x.length > 0)
    .join(' ');
}

/**
 * Format a timestamp to a relative "time ago" string (Vietnamese).
 */
export function timeAgo(date) {
  if (!date) return '';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 5)  return 'Vừa xong';
  if (diff < 60) return `${diff} giây trước`;
  const m = Math.floor(diff / 60);
  if (m < 60)   return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `${d} ngày trước`;
  if (d < 30)   return `${Math.floor(d / 7)} tuần trước`;
  if (d < 365)  return `${Math.floor(d / 30)} tháng trước`;
  return `${Math.floor(d / 365)} năm trước`;
}

/**
 * Truncate a string at maxLength, appending ellipsis.
 */
export function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Format a number to compact form (1000 → 1k, 1200 → 1.2k).
 */
export function compactNumber(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
