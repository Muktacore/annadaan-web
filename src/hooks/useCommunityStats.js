import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

const EMPTY = { mealsShared: 0, listingsLive: 0, activeDonors: 0 }

// Live community totals computed from real `donations` documents
// (rules let every signed-in user read them):
//   mealsShared  = total quantity across donations already picked up (status "claimed")
//   listingsLive = donations currently "available"
//   activeDonors = distinct donors with at least one available donation
export function useCommunityStats() {
  const [stats, setStats] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onSnapshot(
      collection(db, "donations"),
      (snap) => {
        let mealsShared = 0
        let listingsLive = 0
        const donors = new Set()

        snap.forEach((docSnap) => {
          const d = docSnap.data()
          if (d.status === "claimed") {
            mealsShared += Number(d.quantity) || 0
          } else if (d.status === "available") {
            listingsLive += 1
            if (d.donorId) donors.add(d.donorId)
          }
        })

        setStats({ mealsShared, listingsLive, activeDonors: donors.size })
        setLoading(false)
      },
      (err) => {
        console.error("Community stats listener failed:", err)
        setLoading(false)
      }
    )
  }, [])

  return { stats, loading }
}
