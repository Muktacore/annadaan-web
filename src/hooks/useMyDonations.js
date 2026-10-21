import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { normalizeDonation } from "@/lib/donations"

// Live list of the signed-in user's own donations (any status), newest first.
export function useMyDonations(uid) {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, "donations"), where("donorId", "==", uid))
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(normalizeDonation)
        list.sort((a, b) => b.createdAt - a.createdAt)
        setDonations(list)
        setLoading(false)
      },
      (err) => {
        console.error("My donations listener failed:", err)
        setLoading(false)
      }
    )
  }, [uid])

  return { donations, loading }
}
