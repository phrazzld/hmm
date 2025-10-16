/**
 * Format a timestamp as a relative date string.
 * Examples: "just now", "2 minutes ago", "3 days ago"
 */
export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
