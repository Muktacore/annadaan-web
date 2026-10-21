import {
  collection, doc, setDoc, updateDoc, deleteDoc, writeBatch,
  onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export const CLAIM_LABELS = {
  Pending: "Pending",
  RequestAccepted: "Accepted",
  Claimed: "Claimed",
}

// Firestore claim doc -> plain object (Dates instead of Timestamps).
export function normalizeClaim(snap) {
  const d = snap.data()
  const requestedAt = d.requestedAt?.toDate?.() ?? new Date()
  return {
    ...d,
    id: snap.id,
    requestedAt,
    updatedAt: d.updatedAt?.toDate?.() ?? requestedAt,
  }
}

// One claim per recipient per donation (deterministic id prevents duplicates).
export async function createClaim({ user, donation }) {
  if (donation.donorId === user.uid) throw new Error("You cannot request your own donation")
  const id = `${donation.id}_${user.uid}`
  await setDoc(doc(db, "claims", id), {
    claimId: id,
    donationId: donation.id,
    donorId: donation.donorId,
    donorName: donation.donorName,
    recipientId: user.uid,
    recipientName: user.displayName || user.email?.split("@")[0] || "Anonymous",
    foodCategory: donation.foodCategory,
    quantity: donation.quantity,
    unit: donation.unit,
    foodPhotoUrl: donation.foodPhotoUrl ?? null,
    status: "Pending",
    urgencyScore: null,
    requestedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export const cancelClaim = (claimId) => deleteDoc(doc(db, "claims", claimId))

export const acceptClaim = (claimId) =>
  updateDoc(doc(db, "claims", claimId), {
    status: "RequestAccepted",
    updatedAt: serverTimestamp(),
  })

// Donor confirms pickup: claim -> Claimed, donation -> claimed (leaves Home/Map).
export async function completeClaim(claim) {
  const batch = writeBatch(db)
  batch.update(doc(db, "claims", claim.id), {
    status: "Claimed",
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, "donations", claim.donationId), { status: "claimed" })
  await batch.commit()
}

const sortNewest = (a, b) => b.requestedAt - a.requestedAt

export function subscribeToMyClaims(uid, onData, onError) {
  const q = query(collection(db, "claims"), where("recipientId", "==", uid))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(normalizeClaim).sort(sortNewest)),
    onError
  )
}

export function subscribeToDonationClaims(donorId, donationId, onData, onError) {
  const q = query(
    collection(db, "claims"),
    where("donorId", "==", donorId),
    where("donationId", "==", donationId)
  )
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(normalizeClaim).sort(sortNewest)),
    onError
  )
}

// Reading a claim that does not exist is denied by the rules, so errors resolve to null.
export function subscribeToClaim(id, onData) {
  return onSnapshot(
    doc(db, "claims", id),
    (snap) => onData(snap.exists() ? normalizeClaim(snap) : null),
    () => onData(null)
  )
}
