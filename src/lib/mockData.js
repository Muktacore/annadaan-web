export const CATEGORY_LABELS = {
  rice: "Rice dishes",
  dal_gravy: "Dal & gravy",
  roti_bread: "Roti & bread",
}
export const STORAGE_LABELS = {
  room_temp: "Room temperature",
  refrigerated: "Refrigerated",
  kept_warm: "Kept warm",
  changed: "Storage changed",
  unknown: "Unknown",
}
export const COVERED_LABELS = {
  covered: "Covered",
  uncovered: "Uncovered",
  partial: "Partially covered",
  unknown: "Unknown",
}
export const SOURCE_LABELS = {
  cnn: "Photo analysis (CNN)",
  rule_based: "FSSAI safety rules",
  hybrid: "Photo analysis + safety rules",
}
export const UNITS = [
  { value: "plates", label: "plates" },
  { value: "portions", label: "portions" },
  { value: "pieces", label: "pieces" },
  { value: "kg", label: "kg" },
]

export const toOptions = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const hoursSince = (ts) => (Date.now() - ts) / 3600000

export function formatElapsed(ts) {
  const mins = Math.max(0, Math.round(hoursSince(ts) * 60))
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m ago` : `${h}h ago`
}
