import {
  collection, doc, setDoc, onSnapshot, query, where,
  serverTimestamp, Timestamp, GeoPoint,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Uploads one image to Cloudinary (unsigned preset) and returns its https URL.
export async function uploadDonationPhoto(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary env vars missing (VITE_CLOUDINARY_*)")
  }
  const body = new FormData()
  body.append("file", file)
  body.append("upload_preset", UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || "Photo upload failed")
  return data.secure_url
}

// Creates a donation doc following the locked schema. Returns the new donationId.
export async function createDonation({ user, form, photoFile, location }) {
  const ref = doc(collection(db, "donations"))

  let foodPhotoUrl = null
  if (photoFile) foodPhotoUrl = await uploadDonationPhoto(photoFile)

  await setDoc(ref, {
    donationId: ref.id,
    donorId: user.uid,
    donorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
    foodCategory: form.foodCategory,
    foodPhotoUrl,
    cookedAt: Timestamp.fromDate(new Date(form.cookedAt)),
    quantity: Number(form.quantity),
    unit: form.unit,
    storageCondition: form.storageCondition,
    isCovered: form.isCovered,
    location: new GeoPoint(location.lat, location.lng),
    createdAt: serverTimestamp(),
    status: "available",
  })
  return ref.id
}

// Haversine distance in km between two {lat, lng} points.
export function distanceKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10
}

// Firestore doc -> plain object shaped like the mock donations.
export function normalizeDonation(snap) {
  const d = snap.data()
  return {
    ...d,
    id: snap.id,
    donationId: d.donationId || snap.id,
    cookedAt: d.cookedAt?.toDate?.() ?? null,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    location: d.location
      ? { lat: d.location.latitude, lng: d.location.longitude }
      : null,
  }
}

// Live list of available donations, newest first (sorted client-side, no index needed).
export function subscribeToAvailableDonations(onData, onError) {
  const q = query(collection(db, "donations"), where("status", "==", "available"))
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map(normalizeDonation)
      list.sort((a, b) => b.createdAt - a.createdAt)
      onData(list)
    },
    onError
  )
}

// Live single donation. Calls onData(null) if it does not exist.
export function subscribeToDonation(id, onData, onError) {
  return onSnapshot(
    doc(db, "donations", id),
    (snap) => onData(snap.exists() ? normalizeDonation(snap) : null),
    onError
  )
}
