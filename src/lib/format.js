export function formatElapsed(timestamp) {
  const then = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = diffMins / 60;
  if (diffHours < 24) {
    const rounded = Math.round(diffHours * 10) / 10;
    return `${rounded} hr${rounded === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function formatQuantity(quantity, unit) {
  if (quantity == null) return "";
  return unit ? `${quantity} ${unit}` : `${quantity}`;
}