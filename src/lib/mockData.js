const hoursAgo = (h) => Date.now() - h * 3600 * 1000

export const currentUser = { id: "u1", name: "Demo User", email: "demo@annadaan.app" }

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

// Mirrors the locked `donations` schema + ML result fields (flattened for mock use)
export const donations = [
  {
    id: "d1", donorName: "Sharma Catering", foodCategory: "rice", quantity: 12, unit: "plates",
    cookedAt: hoursAgo(1.5), storageCondition: "kept_warm", isCovered: "covered",
    location: { lat: 19.3965, lng: 72.8321 }, status: "available", distanceKm: 1.2,
    freshnessLabel: "safe", freshnessSource: "hybrid", confidenceScore: 0.91,
    explanation: [
      "Cooked 1h 30m ago, well within the 2-hour window",
      "Kept warm above 60°C, outside the danger zone",
      "Rice looks moist and evenly coloured",
    ],
  },
  {
    id: "d2", donorName: "Priya's Kitchen", foodCategory: "dal_gravy", quantity: 8, unit: "portions",
    cookedAt: hoursAgo(3.5), storageCondition: "room_temp", isCovered: "partial",
    location: { lat: 19.3872, lng: 72.8465 }, status: "available", distanceKm: 2.4,
    freshnessLabel: "consume_soon", freshnessSource: "hybrid", confidenceScore: 0.74,
    explanation: [
      "Cooked 3h 30m ago at room temperature",
      "More than 2 hours in the 5–60°C danger zone: use immediately",
      "Slight sheen on the gravy surface",
    ],
  },
  {
    id: "d3", donorName: "Annapurna Mess", foodCategory: "roti_bread", quantity: 30, unit: "pieces",
    cookedAt: hoursAgo(0.5), storageCondition: "kept_warm", isCovered: "covered",
    location: { lat: 19.3941, lng: 72.8402 }, status: "available", distanceKm: 0.8,
    freshnessLabel: "safe", freshnessSource: "hybrid", confidenceScore: 0.95,
    explanation: ["Cooked 30 minutes ago", "Kept warm and covered", "No visible moisture or colour drift"],
  },
  {
    id: "d4", donorName: "Hotel Seaview", foodCategory: "rice", quantity: 5, unit: "kg",
    cookedAt: hoursAgo(6), storageCondition: "room_temp", isCovered: "uncovered",
    location: { lat: 19.4021, lng: 72.8512 }, status: "expired", distanceKm: 4.1,
    freshnessLabel: "unsafe", freshnessSource: "rule_based", confidenceScore: 0.88,
    explanation: [
      "Cooked 6 hours ago, past the 4-hour discard limit",
      "Stored uncovered at room temperature",
      "Not safe to donate",
    ],
  },
  {
    id: "d5", donorName: "Rahul's Tiffin", foodCategory: "dal_gravy", quantity: 15, unit: "portions",
    cookedAt: hoursAgo(2.2), storageCondition: "refrigerated", isCovered: "covered",
    location: { lat: 19.3838, lng: 72.8349 }, status: "available", distanceKm: 3.0,
    freshnessLabel: "safe", freshnessSource: "hybrid", confidenceScore: 0.83,
    explanation: ["Cooled and refrigerated within the safe window", "Container is covered", "Colour and texture look normal"],
  },
  {
    id: "d6", donorName: "Meera Joshi", foodCategory: "roti_bread", quantity: 20, unit: "pieces",
    cookedAt: hoursAgo(1.1), storageCondition: "room_temp", isCovered: "covered",
    location: { lat: 19.3993, lng: 72.8438 }, status: "available", distanceKm: 1.9,
    freshnessLabel: "safe", freshnessSource: "hybrid", confidenceScore: 0.55,
    explanation: ["Cooked about 1 hour ago", "Covered at room temperature", "Photo is slightly blurry, so confidence is lower"],
  },
]

export const getDonation = (id) => donations.find((d) => d.id === id)

// claims: status flow Pending -> RequestAccepted -> Claimed
export const requests = [
  { id: "r1", donationId: "d1", status: "Pending", requestedAt: hoursAgo(0.3) },
  { id: "r2", donationId: "d3", status: "RequestAccepted", requestedAt: hoursAgo(0.4) },
  { id: "r3", donationId: "d6", status: "Claimed", requestedAt: hoursAgo(26) },
  { id: "r4", donationId: "d2", status: "Claimed", requestedAt: hoursAgo(50) },
]
export const getRequest = (id) => requests.find((r) => r.id === id)

export const donatedHistory = [
  { id: "h1", foodCategory: "rice", quantity: 10, unit: "plates", date: "28 Sep 2026", status: "claimed" },
  { id: "h2", foodCategory: "dal_gravy", quantity: 6, unit: "portions", date: "25 Sep 2026", status: "claimed" },
  { id: "h3", foodCategory: "roti_bread", quantity: 24, unit: "pieces", date: "20 Sep 2026", status: "expired" },
]
export const receivedHistory = [
  { id: "rh1", foodCategory: "roti_bread", quantity: 15, unit: "pieces", date: "27 Sep 2026", from: "Annapurna Mess" },
  { id: "rh2", foodCategory: "rice", quantity: 8, unit: "plates", date: "22 Sep 2026", from: "Sharma Catering" },
]