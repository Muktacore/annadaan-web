import { Capacitor } from "@capacitor/core"

export const APP_NAME = "AnnaDaan"
export const SUPPORT_EMAIL = "annadaanwebapp@gmail.com"
export const PRIVACY_EMAIL = SUPPORT_EMAIL
export const LAST_UPDATED = "21 October 2026"
export const APP_VERSION = "1.0.0"

export const mailto = (subject = "", body = "") => {
  const q = []
  if (subject) q.push(`subject=${encodeURIComponent(subject)}`)
  if (body) q.push(`body=${encodeURIComponent(body)}`)
  return `mailto:${SUPPORT_EMAIL}${q.length ? `?${q.join("&")}` : ""}`
}

// Plain mailto: links do nothing on many laptops (no mail app set up).
// On the Android app we hand off to the phone's mail app; on the web we open
// a Gmail compose window, which works in any browser.
export function composeEmail({ subject = "", body = "" } = {}) {
  if (Capacitor.isNativePlatform()) {
    window.location.href = mailto(subject, body)
    return
  }
  const url =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(SUPPORT_EMAIL)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  window.open(url, "_blank", "noopener,noreferrer")
}

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL)
    return true
  } catch {
    return false
  }
}
