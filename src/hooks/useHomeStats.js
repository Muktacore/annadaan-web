import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Live counts for the Home stat tiles. Single-field queries only, so no index is needed.
// Both values are null until the first snapshot arrives.
export function useHomeStats(uid) {
  const [shared, setShared] = useState(null)
  const [mine, setMine] = useState(null)

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "donations"), where("status", "==", "claimed")),
      (snap) => setShared(snap.size),
      (err) => console.error("Shared stat listener failed:", err)
    )
  }, [])

  useEffect(() => {
    if (!uid) return
    return onSnapshot(
      query(collection(db, "donations"), where("donorId", "==", uid)),
      (snap) => setMine(snap.size),
      (err) => console.error("My donations stat listener failed:", err)
    )
  }, [uid])

  return { shared, mine }
}
